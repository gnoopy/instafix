import type { AnnotationPayload, FeedbackType, ScreenshotRegion } from "@instafix/core";
import { CLICK_THRESHOLD_PX, FONT_STACK, Z_INDEX_MAX } from "./constants.js";
import { findAnchorElement, findLargestAncestor, generateAnchor, rectToPercentages } from "./dom/anchor.js";
import { computeAutoScrollDelta } from "./dom/auto-scroll.js";
import { collectMarqueeElements, collectMarqueeElementsDetailed } from "./dom/marquee.js";
import { type MotionPauseHandle, pauseMotion } from "./dom/motion-pause.js";
import { detectTextSelection } from "./dom/text-selection.js";
import { el, setText } from "./dom-utils.js";
import type { EventBus, WidgetEvents } from "./events.js";
import { isWidgetChrome } from "./focus-tracker.js";
import { type TFunction, tWithParams } from "./i18n/index.js";
import { MultiTargetPreview } from "./multi-target-preview.js";
import { Popup } from "./popup.js";
import { type AnnotatedScreenshot, captureAnnotatedScreenshot } from "./screenshot.js";
import type { ThemeColors } from "./styles/theme.js";

/**
 * A marquee drag's multi-target selection, both resolutions pre-computed:
 * `elements`/`detailElements` are the live DOM refs the multi-target preview
 * badges/outlines track; the matching `*Annotations` arrays are pre-built so
 * switching resolution doesn't need to re-hit-test or re-`generateAnchor`.
 */
interface MarqueeSelection {
  elements: Element[];
  detailElements: Element[];
  detailAnnotations: AnnotationPayload[];
}

export interface AnnotationComplete {
  /** One or more targets (G3 marquee/shift-accumulate multi-select) attached to a single feedback. */
  annotations: AnnotationPayload[];
  type: FeedbackType;
  message: string;
  /**
   * Base64 JPEG `data:` URL captured by html2canvas, or null when capture
   * is disabled / failed / the peer dep is missing.
   */
  screenshotDataUrl?: string | null | undefined;
  /**
   * Where the drawn rect sits within the captured screenshot, as fractions
   * of the image dimensions — see `ScreenshotRegion`. Null whenever
   * `screenshotDataUrl` is null.
   */
  screenshotRegion?: ScreenshotRegion | null | undefined;
}

/**
 * Annotation mode: full-page overlay with rectangle drawing.
 *
 * Glassmorphism design:
 * - Frosted glass toolbar at top
 * - Subtle tinted overlay
 * - Accent-colored drawing rectangle with glow
 */
export class Annotator {
  private overlay: HTMLElement | null = null;
  private toolbar: HTMLElement | null = null;
  private drawingRect: HTMLElement | null = null;
  private startX = 0;
  private startY = 0;
  private isDrawing = false;
  private isActive = false;
  /**
   * True when the current annotation session was triggered by right-click
   * (instant comment) rather than the FAB draw flow. Controls whether the
   * toolbar is shown and whether cancel deactivates unconditionally.
   */
  private instantMode = false;
  private popup: Popup;
  private savedOverflow = "";
  private preActiveFocusElement: Element | null = null;
  /**
   * Target of the keyboard (Enter) annotation path — the page element focused
   * at activation, or the focus tracker's fallback when activation came from
   * the widget's own chrome (FAB menu). Distinct from `preActiveFocusElement`,
   * which keeps its focus-restore role untouched. See issue #162.
   */
  private keyboardTarget: HTMLElement | null = null;
  private rafId: number | null = null;
  private pendingMoveEvent: MouseEvent | Touch | null = null;
  /**
   * Reject handle for the in-flight `runSubmission` promise, or null when no
   * submission is pending. `destroy()` calls it to settle the promise rather
   * than leaving the awaiting closure hung past teardown.
   */
  private rejectPendingSubmission: ((reason: Error) => void) | null = null;

  // --- G3 selection-session state ---
  /** Targets accumulated across Shift+drag chaining, pending finalization. */
  private accumulated: AnnotationPayload[] = [];
  private motionPauseHandle: MotionPauseHandle | null = null;
  private autoScrollTimer: ReturnType<typeof setInterval> | null = null;
  private lastPointerClient: { x: number; y: number } | null = null;
  /** Toolbar instruction span — updated live to show the accumulated count. */
  private instructionEl: HTMLElement | null = null;

  // --- Targeting mode (Mode 2) — hover-and-click "auto-target" picker,
  // deliberately independent of isActive/activate()/deactivate(): no page
  // dim/lock, no scroll-lock, just a live-tracking highlight until the user
  // clicks (which hands off to startInstantAnnotation, the SAME hit-testing
  // and popup wiring right-click used to drive) or presses Escape. ---
  private targetingModeActive = false;
  private targetingHighlight: HTMLElement | null = null;
  private targetingRafId: number | null = null;
  private pendingTargetingMoveEvent: MouseEvent | null = null;

  constructor(
    private readonly colors: ThemeColors,
    private readonly bus: EventBus<WidgetEvents>,
    private readonly t: TFunction,
    private readonly enableScreenshot: boolean = false,
    private readonly getFallbackTarget?: () => HTMLElement | null,
  ) {
    this.popup = new Popup(colors, t);

    this.bus.on("annotation:start", () => this.activate());
    this.bus.on("targeting:start", () => this.activateTargeting());
    // Also reached when the toolbar button itself is clicked to turn
    // targeting off (fab.ts emits targeting:end directly on that click) —
    // not just from this class's own click/Escape handlers below.
    this.bus.on("targeting:end", () => this.deactivateTargeting());
  }

  /**
   * True while the annotator is active (overlay/popup session in progress).
   * The launcher checks this before calling `preventDefault()` on the
   * `contextmenu` event so a right-click during an active session falls
   * through to the native menu instead of being silently swallowed.
   */
  get isBusy(): boolean {
    return this.isActive;
  }

  /**
   * Re-read every `t(...)`-derived label inside the popup. The annotator's
   * own toolbar text is created fresh on every `activate()` call, so only
   * the long-lived popup needs explicit re-localization here.
   */
  refreshLabels(): void {
    this.popup.refreshLabels();
  }

  /**
   * Capture a contextual screenshot of the drawn rect (padded with the
   * surrounding UI, plus the rect's region within the image) when
   * `enableScreenshot` is on. Returns null on disable / capture failure /
   * missing peer dep — the feedback is always submitted regardless.
   */
  private async maybeCapture(rect: DOMRect): Promise<AnnotatedScreenshot | null> {
    if (!this.enableScreenshot) return null;
    return captureAnnotatedScreenshot(rect);
  }

  private activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    const drawMode = !this.instantMode;

    // Pause CSS animations/transitions and playing video/audio for the
    // session (G3) so a moving target doesn't shift mid-selection.
    this.motionPauseHandle = pauseMotion();

    // Capture the focused element before activation for keyboard annotation
    this.preActiveFocusElement = document.activeElement;

    // Keyboard (Enter) target. FAB-launched sessions re-focus the FAB before
    // activation, so the active element here is only the widget's 0x0 shadow
    // host — fall back to the last page element the focus tracker recorded
    // instead of silently dead-ending the Enter path. See issue #162.
    const active = document.activeElement;
    this.keyboardTarget =
      active instanceof HTMLElement &&
      active !== document.body &&
      active !== document.documentElement &&
      !isWidgetChrome(active)
        ? active
        : (this.getFallbackTarget?.() ?? null);

    // Lock page scroll
    this.savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Overlay — subtle blue tint for depth.
    //
    // Overlay, toolbar and the drawn rectangle live on document.body, outside
    // the instafix-widget shadow host. Without the `data-instafix-ignore`
    // marker the screenshot predicate in screenshot.ts cannot reach them —
    // and the accent-colored selection border plus the page tint end up
    // baked into the captured JPEG. See issue #124.
    this.overlay = el("div", {
      style: `
        position:fixed;inset:0;
        z-index:${Z_INDEX_MAX - 1};
        background:rgba(15, 23, 42, 0.04);
        cursor:${drawMode ? "crosshair" : "default"};
      `,
    });
    // The overlay is an interactive surface (draw with the pointer, Enter to
    // annotate the previously focused element, Escape to cancel) and receives
    // programmatic focus below — so it must be exposed to assistive tech, NOT
    // aria-hidden: focusing an aria-hidden element parks screen-reader users
    // on a node that announces nothing (axe "aria-hidden-focus", serious).
    this.overlay.setAttribute("role", "application");
    this.overlay.setAttribute(
      "aria-label",
      drawMode ? this.t("annotator.instruction") : this.t("annotator.instantInstruction"),
    );
    this.overlay.setAttribute("data-instafix-ignore", "true");

    // Toolbar — glassmorphism bar (suppressed in instant mode: the
    // "Draw a rectangle" copy is wrong when the composer is already open)
    if (drawMode) {
      this.toolbar = el("div", {
        style: `
          position:fixed;top:0;left:0;right:0;
          z-index:${Z_INDEX_MAX};
          height:52px;
          background:${this.colors.glassBg};
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid ${this.colors.glassBorder};
          display:flex;align-items:center;justify-content:center;gap:16px;
          font-family:${FONT_STACK};
          font-size:14px;color:${this.colors.text};
          box-shadow:0 4px 16px ${this.colors.shadow};
          -webkit-font-smoothing:antialiased;
        `,
      });
      this.toolbar.setAttribute("data-instafix-ignore", "true");

      const dot = el("span", {
        style: `
          width:8px;height:8px;border-radius:50%;
          background:${this.colors.accent};
          box-shadow:0 0 8px ${this.colors.accentGlow};
          animation:pulse 1.5s ease-in-out infinite;
        `,
      });

      // Add pulse animation inline (respects prefers-reduced-motion)
      const style = document.createElement("style");
      style.textContent = [
        "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}",
        "@media(prefers-reduced-motion:reduce){@keyframes pulse{from,to{opacity:1}}}",
      ].join("");
      this.toolbar.appendChild(style);

      const instruction = el("span", { style: "font-weight:500;letter-spacing:-0.01em;" });
      setText(instruction, this.t("annotator.instruction"));
      this.instructionEl = instruction;

      const cancelBtn = document.createElement("button");
      cancelBtn.style.cssText = `
        height:34px;padding:0 18px;border-radius:9999px;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};
        color:${this.colors.textTertiary};font-family:${FONT_STACK};
        font-size:13px;font-weight:500;cursor:pointer;
        transition:all 0.2s ease;
      `;
      setText(cancelBtn, this.t("annotator.cancel"));
      cancelBtn.addEventListener("click", () => this.deactivate());
      cancelBtn.addEventListener("mouseenter", () => {
        cancelBtn.style.borderColor = this.colors.typeBug;
        cancelBtn.style.color = this.colors.typeBug;
        cancelBtn.style.background = this.colors.typeBugBg;
      });
      cancelBtn.addEventListener("mouseleave", () => {
        cancelBtn.style.borderColor = this.colors.border;
        cancelBtn.style.color = this.colors.textTertiary;
        cancelBtn.style.background = this.colors.glassBg;
      });

      this.toolbar.appendChild(dot);
      this.toolbar.appendChild(instruction);
      this.toolbar.appendChild(cancelBtn);
    }

    if (drawMode) {
      // Mouse events
      this.overlay.addEventListener("mousedown", this.onMouseDown);
      this.overlay.addEventListener("mousemove", this.onMouseMove);
      this.overlay.addEventListener("mouseup", this.onMouseUp);

      // Touch events (Surface Pro, iPad, etc.)
      this.overlay.addEventListener("touchstart", this.onTouchStart, { passive: false });
      this.overlay.addEventListener("touchmove", this.onTouchMove, { passive: false });
      this.overlay.addEventListener("touchend", this.onTouchEnd);

      // Keyboard annotation: Enter selects the captured keyboard target
      this.overlay.addEventListener("keydown", this.onOverlayKeyDown);
    }

    // Allow tab-through so keyboard users can reach underlying elements
    this.overlay.setAttribute("tabindex", "0");

    // Escape to cancel
    document.addEventListener("keydown", this.onKeyDown);

    document.body.appendChild(this.overlay);
    if (this.toolbar) document.body.appendChild(this.toolbar);

    // Move focus to the overlay so the keyboard-annotation path (Enter →
    // annotate the captured keyboard target) actually receives keydown —
    // onOverlayKeyDown only fires when the overlay itself is focused. The
    // overlay has tabindex=0, and the keyboard target was captured at the top
    // of activate(), before the overlay existed, so focusing here doesn't
    // clobber it. (WCAG 2.1.1 Level A)
    this.overlay.focus({ preventScroll: true });
  }

  private deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.isDrawing = false;
    this.instantMode = false;
    const previouslyFocused = this.preActiveFocusElement;
    this.preActiveFocusElement = null;
    this.keyboardTarget = null;

    // Cancel any pending rAF to prevent stale callbacks
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingMoveEvent = null;

    this.stopAutoScroll();
    this.motionPauseHandle?.restore();
    this.motionPauseHandle = null;
    this.accumulated = [];
    this.instructionEl = null;

    document.body.style.overflow = this.savedOverflow;
    document.removeEventListener("keydown", this.onKeyDown);

    this.overlay?.remove();
    this.toolbar?.remove();
    this.drawingRect?.remove();
    this.overlay = null;
    this.toolbar = null;
    this.drawingRect = null;

    // Removing the focused overlay drops focus to <body> — hand it back to the
    // element that had it before activation (WCAG 2.4.3 focus order). When
    // activation came from the FAB menu this element is the shadow host and
    // focus() is a no-op; the Fab restores itself on annotation:end instead.
    if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
      previouslyFocused.focus({ preventScroll: true });
    }

    this.bus.emit("annotation:end");
  }

  /**
   * Start the hover-and-click "auto-target" picker (Mode 2). No-ops while a
   * draw/instant session is already active, or targeting is already on
   * (idempotent — the constructor's bus subscription can fire redundantly).
   */
  private activateTargeting(): void {
    if (this.isActive || this.targetingModeActive) return;
    this.targetingModeActive = true;

    // Reuses the exact same accent-colored outline used for drag-drawing and
    // the keyboard highlight — one visual language, not a third style.
    // Hidden (zero-size, off-screen) until the first hover actually lands on
    // something, so it never flashes at (0,0) before the user moves the mouse.
    this.targetingHighlight = this.createDrawingRect();
    // Distinct marker (also useful for tests) — createDrawingRect()'s own
    // data-instafix-ignore attribute is shared with the draw-mode overlay
    // and drawing rect, not unique to this element.
    this.targetingHighlight.setAttribute("data-instafix-targeting-highlight", "true");
    this.targetingHighlight.style.left = "-9999px";
    this.targetingHighlight.style.top = "-9999px";
    this.targetingHighlight.style.width = "0px";
    this.targetingHighlight.style.height = "0px";
    document.body.appendChild(this.targetingHighlight);

    document.addEventListener("mousemove", this.onTargetingMouseMove);
    // Capture phase: must run (and be able to preventDefault/stopPropagation)
    // before the click reaches its real target — a live link/button under
    // the cursor must not navigate/submit before the popup opens, and a host
    // page's own stopPropagation() on that element must not shadow us.
    document.addEventListener("click", this.onTargetingClick, true);
    document.addEventListener("keydown", this.onTargetingKeyDown);
  }

  /** Idempotent — safe to call from the click/Escape handlers below AND redundantly via the `targeting:end` bus subscription. */
  private deactivateTargeting(): void {
    if (!this.targetingModeActive) return;
    this.targetingModeActive = false;

    if (this.targetingRafId !== null) {
      cancelAnimationFrame(this.targetingRafId);
      this.targetingRafId = null;
    }
    this.pendingTargetingMoveEvent = null;

    document.removeEventListener("mousemove", this.onTargetingMouseMove);
    document.removeEventListener("click", this.onTargetingClick, true);
    document.removeEventListener("keydown", this.onTargetingKeyDown);

    this.targetingHighlight?.remove();
    this.targetingHighlight = null;
  }

  private onTargetingMouseMove = (e: MouseEvent): void => {
    this.pendingTargetingMoveEvent = e;
    if (this.targetingRafId !== null) return;

    this.targetingRafId = requestAnimationFrame(() => {
      this.targetingRafId = null;
      const evt = this.pendingTargetingMoveEvent;
      if (!evt || !this.targetingHighlight) return;

      const hovered = document.elementFromPoint(evt.clientX, evt.clientY);
      if (!hovered || hovered === document.body || hovered === document.documentElement || isWidgetChrome(hovered)) {
        // Nothing selectable under the cursor right now — tuck the
        // highlight away rather than leaving it on the last real target.
        this.targetingHighlight.style.width = "0px";
        this.targetingHighlight.style.height = "0px";
        return;
      }

      const rect = hovered.getBoundingClientRect();
      this.targetingHighlight.style.left = `${rect.left}px`;
      this.targetingHighlight.style.top = `${rect.top}px`;
      this.targetingHighlight.style.width = `${rect.width}px`;
      this.targetingHighlight.style.height = `${rect.height}px`;
    });
  };

  private onTargetingClick = (e: MouseEvent): void => {
    // Clicking the widget's own chrome (most importantly the toolbar button
    // that turns targeting off) must behave exactly as it normally would —
    // never suppressed or reinterpreted as picking a page element.
    if (e.target instanceof Element && isWidgetChrome(e.target)) return;

    // Suppress the real page click — a live link/button under the cursor
    // must not navigate/submit before the popup opens. Same tradeoff
    // DevTools' and visual-feedback tools' own element pickers accept.
    e.preventDefault();
    e.stopPropagation();

    this.deactivateTargeting();
    this.bus.emit("targeting:end");
    // Fully unmodified reuse of the former right-click flow's hit-testing
    // (smallest/largest candidates) and popup wiring (Element/Container
    // refinement toggle) — targeting mode is functionally "continuous hover
    // preview, then do exactly what right-click used to do at the click point."
    void this.startInstantAnnotation(e.clientX, e.clientY).catch(() => {});
  };

  private onTargetingKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    this.deactivateTargeting();
    this.bus.emit("targeting:end");
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this.deactivate();
  };

  /**
   * Keyboard annotation: pressing Enter while the overlay is active selects
   * the keyboard target captured at activation (the focused page element, or
   * the focus tracker's fallback for FAB-launched sessions) and creates a
   * full-bounds annotation covering that element (WCAG 2.1.1 Level A).
   */
  private onOverlayKeyDown = async (e: KeyboardEvent): Promise<void> => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    // A submission is already running or the popup is open — ignore so we
    // can't orphan the first `popup.show()` / `runSubmission` pair.
    if (this.popup.isOpen) return;
    // Mid-pointer-drag: the user is drawing — hijacking `drawingRect` for the
    // keyboard highlight here would corrupt the drag's geometry updates.
    if (this.isDrawing) return;

    const target = this.keyboardTarget;
    if (!target || !(target instanceof HTMLElement)) return;

    const bounds = target.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const rectBounds = new DOMRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Highlight the target like a pointer-drawn rectangle so keyboard users
    // see what they're about to comment. Assigned to `drawingRect` so every
    // existing cleanup path (deactivate, screenshot exclusion, removal once
    // the popup closes) treats it exactly like the mouse path's rect.
    this.drawingRect?.remove();
    const highlight = this.createDrawingRect();
    highlight.style.left = `${bounds.x}px`;
    highlight.style.top = `${bounds.y}px`;
    highlight.style.width = `${bounds.width}px`;
    highlight.style.height = `${bounds.height}px`;
    this.drawingRect = highlight;
    this.overlay?.appendChild(highlight);

    const anchor = generateAnchor(target);
    const annotation: AnnotationPayload = {
      anchor,
      rect: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      target: { kind: "element" },
    };

    // Submission stays inside the popup so the user gets a visible spinner
    // until the server confirms — see finishDrawing for the rationale.
    const screenshotCache: { value?: AnnotatedScreenshot | null } = {};
    const result = await this.popup.show(rectBounds, (formResult) =>
      this.runSubmission([annotation], formResult, rectBounds, screenshotCache),
    );

    this.drawingRect?.remove();
    this.drawingRect = null;
    if (result) this.deactivate();
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.startDrawing(e.clientX, e.clientY);
  };

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) this.startDrawing(touch.clientX, touch.clientY);
  };

  private startDrawing(clientX: number, clientY: number): void {
    // Suppress pointer-driven drawing while the popup is open over the page.
    // Starting a second rectangle would orphan the first `popup.show()`
    // promise (and its `runSubmission`). This closes a latent bug where
    // drawing during the open popup overwrote `Popup.resolve`.
    if (this.popup.isOpen) return;

    this.isDrawing = true;
    this.startX = clientX;
    this.startY = clientY;
    this.lastPointerClient = { x: clientX, y: clientY };
    this.startAutoScroll();

    this.drawingRect?.remove();
    this.drawingRect = this.createDrawingRect();
    this.overlay?.appendChild(this.drawingRect);
  }

  /**
   * Viewport-edge auto-scroll during a drag (G3) — runs on a timer (not just
   * on mousemove) so holding the pointer still near an edge keeps scrolling.
   * The drawn rectangle is entirely in client (viewport-relative) coordinates
   * already, so it stays visually pinned to the pointer as the page scrolls
   * underneath — no extra rect recomputation needed here.
   */
  private startAutoScroll(): void {
    this.stopAutoScroll();
    this.autoScrollTimer = setInterval(() => {
      if (!this.isDrawing || !this.lastPointerClient) return;
      const { dx, dy } = computeAutoScrollDelta(
        this.lastPointerClient.x,
        this.lastPointerClient.y,
        window.innerWidth,
        window.innerHeight,
      );
      if (dx !== 0 || dy !== 0) window.scrollBy(dx, dy);
    }, 16);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollTimer !== null) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
  }

  /**
   * The accent-colored selection rectangle — shared by pointer drawing and
   * the keyboard (Enter) highlight so the two paths can't drift visually.
   * Excluded from screenshot capture (see overlay creation in activate()).
   */
  private createDrawingRect(): HTMLElement {
    // The white inner+outer halo rings keep the colored border legible over
    // ANY local background — the detected selection color is
    // contrast-adjusted against the page's overall background
    // (dom/selection-color.ts), but the specific element under the outline
    // can still be a similar mid-tone; the halo is the guarantee (same
    // trick browser DevTools' element highlighter uses).
    const rect = el("div", {
      style: `
        position:fixed;
        border:2px solid ${this.colors.selection};
        background:${this.colors.selection}12;
        pointer-events:none;
        border-radius:8px;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.85),
          inset 0 0 0 1px rgba(255,255,255,0.85),
          0 0 16px ${this.colors.selectionGlow};
        transition:box-shadow 0.15s ease;
      `,
    });
    rect.setAttribute("data-instafix-ignore", "true");
    return rect;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.scheduleRectUpdate(e);
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches[0]) this.scheduleRectUpdate(e.touches[0]);
  };

  private scheduleRectUpdate(source: MouseEvent | Touch): void {
    if (!this.isDrawing || !this.drawingRect) return;

    this.pendingMoveEvent = source;
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const evt = this.pendingMoveEvent;
      if (!evt || !this.drawingRect) return;
      this.lastPointerClient = { x: evt.clientX, y: evt.clientY };

      const x = Math.min(evt.clientX, this.startX);
      const y = Math.min(evt.clientY, this.startY);
      const w = Math.abs(evt.clientX - this.startX);
      const h = Math.abs(evt.clientY - this.startY);

      this.drawingRect.style.left = `${x}px`;
      this.drawingRect.style.top = `${y}px`;
      this.drawingRect.style.width = `${w}px`;
      this.drawingRect.style.height = `${h}px`;
    });
  }

  private onTouchEnd = async (e: TouchEvent): Promise<void> => {
    const touch = e.changedTouches[0];
    if (touch) await this.finishDrawing(touch.clientX, touch.clientY, e.altKey, e.shiftKey);
  };

  private onMouseUp = async (e: MouseEvent): Promise<void> => {
    await this.finishDrawing(e.clientX, e.clientY, e.altKey, e.shiftKey);
  };

  /**
   * End a drag and decide what was selected (G3):
   * - Below the click threshold → a single element at the point (a small
   *   hand tremor completes as a click instead of being silently discarded).
   * - Alt/Option held → an `area` target (no DOM element), even over content.
   * - Otherwise, a `text` target if the drag lands on prose (see
   *   `dom/text-selection.ts` for why this needs no separate "text mode").
   * - Otherwise, the marquee: elements the rect intersects. Exactly one
   *   match keeps the original single-element sub-rect behavior; more than
   *   one becomes a multi-target selection (each element, full bounds);
   *   none falls back to an `area` target (a genuinely empty region).
   *
   * Shift held on release adds the result to the running selection instead
   * of opening the composer immediately — see `finalizeOrAccumulate`.
   */
  private finishDrawing = async (
    clientX: number,
    clientY: number,
    altKey: boolean,
    shiftKey: boolean,
  ): Promise<void> => {
    if (!this.isDrawing || !this.drawingRect) return;
    this.isDrawing = false;
    this.stopAutoScroll();

    const x = Math.min(clientX, this.startX);
    const y = Math.min(clientY, this.startY);
    const w = Math.abs(clientX - this.startX);
    const h = Math.abs(clientY - this.startY);

    if (w < CLICK_THRESHOLD_PX && h < CLICK_THRESHOLD_PX) {
      const pointRect = new DOMRect(clientX, clientY, 1, 1);
      // A click (not a drag) picks the element itself — record its full
      // bounds, not a 1px sub-region of it.
      const { annotation } = this.buildAnnotation(pointRect, { fullBounds: true });
      await this.finalizeOrAccumulate([annotation], pointRect, shiftKey);
      return;
    }

    const rectBounds = new DOMRect(x, y, w, h);

    let annotations: AnnotationPayload[];
    // Live elements (+ their pre-built annotations) behind this drag's
    // multi-target selection — only populated by the marquee path, and only
    // meaningful for the multi-target preview (G8) / summary-detail toggle
    // below.
    let marquee: MarqueeSelection | undefined;
    if (altKey) {
      annotations = [this.buildAreaAnnotation(rectBounds)];
    } else {
      const text = this.tryBuildTextAnnotation(clientX, clientY);
      if (text) {
        annotations = [text];
      } else {
        const result = this.buildMarqueeAnnotations(rectBounds);
        annotations = result.annotations;
        marquee = {
          elements: result.elements,
          detailElements: result.detailElements,
          detailAnnotations: result.detailAnnotations,
        };
      }
    }

    await this.finalizeOrAccumulate(annotations, rectBounds, shiftKey, marquee);
  };

  /**
   * Shift held → add to the running selection and keep drawing (no popup
   * yet); the toolbar hint reflects the running count. Otherwise, combine
   * whatever was accumulated with this drag's result and open the composer.
   */
  private async finalizeOrAccumulate(
    newAnnotations: AnnotationPayload[],
    captureRect: DOMRect,
    shiftKey: boolean,
    marquee?: MarqueeSelection,
  ): Promise<void> {
    if (shiftKey) {
      this.accumulated.push(...newAnnotations);
      this.updateAccumulationHint();
      this.drawingRect?.remove();
      this.drawingRect = null;
      return;
    }

    // Only preview/offer the summary↔detail toggle when this drag alone
    // produced every target being submitted — once earlier Shift-drags
    // contributed targets too, numbered badges covering just the last drag
    // would undercount and mislead rather than clarify.
    const showPreview = this.accumulated.length === 0 && (marquee?.elements.length ?? 0) > 1;
    let allAnnotations = [...this.accumulated, ...newAnnotations];
    this.accumulated = [];

    // Reassigns `allAnnotations` via closure when the user switches the
    // summary/detail resolution — same idiom already used below in
    // `startInstantAnnotation`'s Element/Container `onChange` for a
    // later-running submit handler to pick up.
    const preview =
      showPreview && marquee
        ? new MultiTargetPreview(
            this.colors,
            {
              summary: marquee.elements,
              detail: marquee.detailElements.length > 0 ? marquee.detailElements : marquee.elements,
            },
            this.t,
            captureRect,
            (resolution) => {
              allAnnotations =
                resolution === "detail" && marquee.detailAnnotations.length > 0
                  ? marquee.detailAnnotations
                  : newAnnotations;
              this.popup.setLegend(this.legendEntriesFromAnnotations(allAnnotations));
            },
          )
        : null;

    // Keep the drawn rectangle visible while the popup is open so the user
    // can see what they're sending feedback about — including while the
    // submit-spinner is running. We only remove it after the popup closes.
    const screenshotCache: { value?: AnnotatedScreenshot | null } = {};
    const resultPromise = this.popup.show(captureRect, (formResult) =>
      this.runSubmission(allAnnotations, formResult, captureRect, screenshotCache),
    );
    // show()'s executor runs synchronously (it resets the legend to hidden
    // before returning the pending promise) — set the real legend on the
    // next line, after that reset, not before it.
    if (showPreview) this.popup.setLegend(this.legendEntriesFromAnnotations(allAnnotations));
    const result = await resultPromise;

    preview?.destroy();
    this.drawingRect?.remove();
    this.drawingRect = null;
    if (result) this.deactivate();
  }

  /** Cheap per-number legend labels for the marquee popup — derived from the anchor data already computed while building each annotation, no re-hit-testing. */
  private legendEntriesFromAnnotations(
    annotations: readonly AnnotationPayload[],
  ): Array<{ number: number; label: string }> {
    return annotations.map((a, index) => {
      const raw = a.anchor.textSnippet.trim() || a.anchor.elementTag.toLowerCase();
      const label = raw.length > 24 ? `${raw.slice(0, 24)}…` : raw;
      return { number: index + 1, label };
    });
  }

  /** Update the toolbar instruction to show the running Shift-accumulated count. */
  private updateAccumulationHint(): void {
    if (!this.instructionEl) return;
    const count = this.accumulated.length;
    setText(
      this.instructionEl,
      count > 0 ? tWithParams(this.t, "annotator.selectionCount", { count }) : this.t("annotator.instruction"),
    );
  }

  /**
   * Text-Range detection for the current drag — Alt/Option is reserved for
   * area mode, so text is only attempted otherwise. Returns null (falls
   * through to marquee/element handling) when the drag doesn't land on
   * selectable prose.
   */
  private tryBuildTextAnnotation(endX: number, endY: number): AnnotationPayload | null {
    const detected = detectTextSelection(this.startX, this.startY, endX, endY);
    if (!detected) return null;

    const anchor = generateAnchor(detected.container);
    const anchorBounds = detected.container.getBoundingClientRect();
    const rect = rectToPercentages(detected.rect, anchorBounds);
    return {
      anchor,
      rect,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      target: {
        kind: "text",
        quote: detected.quote,
        quotePrefix: detected.quotePrefix,
        quoteSuffix: detected.quoteSuffix,
      },
    };
  }

  /** An `area` target — no DOM element, rect relative to the current viewport. */
  private buildAreaAnnotation(rectBounds: DOMRect): AnnotationPayload {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    return {
      // Synthetic anchor so legacy `element`-only consumers still get a
      // stable, always-resolvable reference — see `resolveMarkerGeometry`
      // in markers.ts for how area targets are actually repositioned
      // on-page (not through this anchor).
      anchor: {
        cssSelector: "body",
        xpath: "/html/body",
        textSnippet: "",
        elementTag: "BODY",
        textPrefix: "",
        textSuffix: "",
        fingerprint: "",
        neighborText: "",
      },
      rect: {
        xPct: rectBounds.x / viewportW,
        yPct: rectBounds.y / viewportH,
        wPct: rectBounds.width / viewportW,
        hPct: rectBounds.height / viewportH,
      },
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportW,
      viewportH,
      devicePixelRatio: window.devicePixelRatio,
      target: { kind: "area" },
    };
  }

  /**
   * Marquee: elements the drawn rect intersects (G3). Zero or one match
   * keeps the original single-element behavior — `findAnchorElement`'s
   * ancestor-containment walk (already well-tested, and the only path
   * available in environments without `elementFromPoint`, like jsdom) —
   * unchanged; the drawn rect maps to a sub-region of that one element.
   * More than one becomes a genuine multi-target selection, each element
   * captured at its own full bounds — the drawn rect no longer maps cleanly
   * to "a portion of THIS element" once several are involved. Empty-region
   * (`area`) targets are deliberately NOT auto-detected here — GOAL.md
   * reserves that for the explicit Alt/Option modifier (`buildAreaAnnotation`
   * below), since "no element under the pointer" essentially never happens
   * in a real page (there's always at least a background element) and would
   * make marquee behavior depend on hit-testing quirks instead of intent.
   */
  private buildMarqueeAnnotations(rectBounds: DOMRect): MarqueeSelection & { annotations: AnnotationPayload[] } {
    if (this.overlay) this.overlay.style.pointerEvents = "none";
    const elements = collectMarqueeElements(rectBounds);
    // Detail (uncollapsed nested-chain) resolution is only worth computing
    // when there's a genuine multi-target selection to offer a toggle for.
    const detailElements = elements.length > 1 ? collectMarqueeElementsDetailed(rectBounds) : [];
    if (this.overlay) this.overlay.style.pointerEvents = "auto";

    if (elements.length <= 1) {
      const { annotation } = this.buildAnnotation(rectBounds);
      return { annotations: [annotation], elements: [], detailElements: [], detailAnnotations: [] };
    }
    const annotations = this.annotationsForElements(elements);
    const detailAnnotations = detailElements.length > 0 ? this.annotationsForElements(detailElements) : [];
    // Elements/detailElements are only surfaced back for the multi-target
    // preview (G8) — the live refs are the whole point (no re-resolution
    // needed for a session that was just drawn), so they're only worth
    // returning when there's more than one target to preview in the first
    // place.
    return { annotations, elements, detailElements, detailAnnotations };
  }

  /** Shared by both marquee resolutions — one full-bounds `AnnotationPayload` per element. */
  private annotationsForElements(elements: readonly Element[]): AnnotationPayload[] {
    return elements.map(
      (element): AnnotationPayload => ({
        anchor: generateAnchor(element),
        rect: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        target: { kind: "element" },
      }),
    );
  }

  /**
   * Instantly triggers the annotation popup at a specific location without
   * requiring the user to draw a rectangle. Used by the "auto-target"
   * hover-and-click picker (Mode 2) once the user clicks to lock in whatever
   * they were hovering.
   *
   * Entry is routed through the event bus (`annotation:start`) so the public
   * event contract (`onAnnotationStart` / `onAnnotationEnd`) is honoured —
   * hosts that pause analytics or chat widgets on annotation hooks see a
   * symmetric start/end pair regardless of entry path.
   */
  public async startInstantAnnotation(clientX: number, clientY: number): Promise<void> {
    // Guard: no-op while the annotator is already active (overlay/popup
    // session in progress). `isActive` covers the entire window: draw mode
    // in progress, popup open for typing, and submission in flight —
    // without this, a second click while a session is already open would
    // reset the form, orphan the pending popup.show(), and leak the old
    // drawing rect.
    if (this.isActive) return;

    // Set instant-mode flag BEFORE emitting annotation:start so activate()
    // (called by the bus handler) can read it and suppress the toolbar.
    this.instantMode = true;
    this.bus.emit("annotation:start");

    // Hit-test with a 1×1 rect at the cursor's exact hotspot (clientX/Y —
    // the arrow tip), matching both the draw-mode click path and, more
    // importantly, the targeting-mode HOVER highlight (which resolves via
    // elementFromPoint at these same coordinates). The old 20px box
    // centered on the cursor made `findAnchorElement`'s contains-the-rect
    // ancestor walk reject any element the box spilled out of — clicking
    // within 10px of a small element's edge silently selected its
    // CONTAINER instead of the element the hover outline was showing.
    const pointRect = new DOMRect(clientX, clientY, 1, 1);

    // Resolve the smallest (most specific) element under the cursor, and —
    // G8 — the nearest reasonably-sized container above it. When the two
    // differ, the popup offers a toggle so the user isn't stuck with
    // whichever one a single hit-test happened to land on.
    if (this.overlay) this.overlay.style.pointerEvents = "none";
    const smallestElement = findAnchorElement(pointRect);
    const largestElement = findLargestAncestor(smallestElement);
    if (this.overlay) this.overlay.style.pointerEvents = "auto";
    const hasSizeChoice = largestElement !== smallestElement;

    // We also derive the capture rect from the anchor element's bounding box
    // (clamped to the viewport) so enableScreenshot produces a useful image
    // instead of a postage stamp.
    const captureRectFor = (bounds: DOMRect): DOMRect => {
      const left = Math.max(0, bounds.left);
      const top = Math.max(0, bounds.top);
      return new DOMRect(
        left,
        top,
        Math.max(0, Math.min(bounds.right, window.innerWidth) - left),
        Math.max(0, Math.min(bounds.bottom, window.innerHeight) - top),
      );
    };

    let currentElement = smallestElement;
    // Full bounds: the auto-target click selects the COMPONENT — the stored
    // rect must be the element, not the 20px spot under the cursor, or the
    // marker-hover outline later re-renders as a dot at the click point.
    let { annotation, anchorBounds } = this.annotationForElement(currentElement, pointRect, { fullBounds: true });
    let captureRect = captureRectFor(anchorBounds);

    // Keep outlining the actual selected COMPONENT (its real bounding box,
    // matching what `targetingHighlight` showed while hovering) rather than
    // a tiny fixed-size box at the click point — the hover→click flow reads
    // as one continuous outline, never as "the outline disappeared and a
    // small square appeared instead." Stays up for as long as the popup is
    // open (through Element/Container re-selection below), same lifetime as
    // the draw-flow's own `drawingRect`.
    this.drawingRect?.remove();
    this.drawingRect = this.createDrawingRect();
    this.drawingRect.style.left = `${anchorBounds.left}px`;
    this.drawingRect.style.top = `${anchorBounds.top}px`;
    this.drawingRect.style.width = `${anchorBounds.width}px`;
    this.drawingRect.style.height = `${anchorBounds.height}px`;
    this.overlay?.appendChild(this.drawingRect);

    const screenshotCache: { value?: AnnotatedScreenshot | null } = {};
    await this.popup.show(
      pointRect,
      (formResult) => this.runSubmission([annotation], formResult, captureRect, screenshotCache),
      hasSizeChoice
        ? {
            initial: "smallest",
            onChange: (choice) => {
              currentElement = choice === "smallest" ? smallestElement : largestElement;
              const rebuilt = this.annotationForElement(currentElement, pointRect, { fullBounds: true });
              annotation = rebuilt.annotation;
              anchorBounds = rebuilt.anchorBounds;
              captureRect = captureRectFor(anchorBounds);
              // Bounds changed — a cached screenshot from the previous
              // choice would no longer match what's being reported.
              delete screenshotCache.value;
              // The outline must track the newly-chosen element/container,
              // not stay pinned to whichever one was selected first.
              if (this.drawingRect) {
                this.drawingRect.style.left = `${anchorBounds.left}px`;
                this.drawingRect.style.top = `${anchorBounds.top}px`;
                this.drawingRect.style.width = `${anchorBounds.width}px`;
                this.drawingRect.style.height = `${anchorBounds.height}px`;
              }
            },
          }
        : undefined,
    );

    // Instant flow: always deactivate on popup close — unlike the draw flow
    // where cancel keeps the session alive so the user can re-draw, there is
    // no draw phase to return to here. Leaving the overlay, scroll-lock and
    // toolbar up after cancel strands the user in a mode they never opted into.
    this.drawingRect?.remove();
    this.drawingRect = null;
    this.deactivate();
  }

  /**
   * Submit handler passed into `popup.show()`. Captures the screenshot once
   * (cached across retries) and emits `annotation:complete` on the bus, then
   * waits for one of three terminal signals:
   *
   * - `feedback:sent` — resolve (popup closes).
   * - `feedback:error` — reject with the genuine error (popup restores for
   *   retry; the launcher surfaces the error to the host).
   * - `submission:cancelled` — reject as a silent abort (popup restores; no
   *   error is surfaced — e.g. the user cancelled the identity prompt).
   *
   * Submissions are serialized by the popup guard (`this.popup.isOpen`),
   * so exactly one `runSubmission` is ever live — the global outcome events
   * cannot cross-wire between submissions and need no correlation id.
   */
  private async runSubmission(
    annotations: AnnotationPayload[],
    formResult: { type: FeedbackType; message: string },
    rectBounds: DOMRect,
    screenshotCache: { value?: AnnotatedScreenshot | null },
  ): Promise<void> {
    // Screenshot capture is the slow part. Capture once and reuse the
    // cached data URL + region on every retry — re-running html2canvas after
    // each failed submit would punish the user for a network blip.
    if (screenshotCache.value === undefined) {
      screenshotCache.value = await this.maybeCapture(rectBounds);
    }
    const capture = screenshotCache.value;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        unsubSent();
        unsubError();
        unsubCancelled();
        this.rejectPendingSubmission = null;
      };
      const unsubSent = this.bus.on("feedback:sent", () => {
        cleanup();
        resolve();
      });
      const unsubError = this.bus.on("feedback:error", (err) => {
        cleanup();
        reject(err);
      });
      const unsubCancelled = this.bus.on("submission:cancelled", () => {
        cleanup();
        // Silent abort — the popup restores but no error is surfaced.
        reject(new Error("Feedback submission cancelled"));
      });

      // Expose the reject handle so `destroy()` mid-submit can settle this
      // promise instead of leaving the awaiting closure hung past teardown.
      this.rejectPendingSubmission = (reason) => {
        cleanup();
        reject(reason);
      };

      this.bus.emit("annotation:complete", {
        annotations,
        type: formResult.type,
        message: formResult.message,
        screenshotDataUrl: capture?.dataUrl ?? null,
        screenshotRegion: capture?.region ?? null,
      });
    });
  }

  /**
   * Build an AnnotationPayload for an already-resolved element. Pure — no
   * hit-testing — so callers that already know which element they want
   * (the auto-target picker's size toggle, G8) can build a payload without
   * going through `findAnchorElement` again.
   *
   * `fullBounds` records the annotation as covering the WHOLE element
   * (`{0,0,1,1}`) instead of the caller's rect as a sub-region. Click-style
   * gestures (auto-target click, draw-mode click) mean "pick this
   * component", not "this 20px spot inside it" — and the stored rect is
   * what the marker-hover outline re-renders from later (markers.ts
   * showHighlight), so a point-sized rect made that outline a dot at the
   * click point instead of the selected component.
   */
  private annotationForElement(
    anchorElement: Element,
    rectBounds: DOMRect,
    options?: { fullBounds?: boolean },
  ): { annotation: AnnotationPayload; anchorBounds: DOMRect } {
    const anchor = generateAnchor(anchorElement);
    const anchorBounds = anchorElement.getBoundingClientRect();
    const rect = options?.fullBounds
      ? { xPct: 0, yPct: 0, wPct: 1, hPct: 1 }
      : rectToPercentages(rectBounds, anchorBounds);

    const annotation: AnnotationPayload = {
      anchor,
      rect,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      target: { kind: "element" },
    };
    return { annotation, anchorBounds };
  }

  /**
   * Build an AnnotationPayload from a drawn rectangle.
   * Temporarily hides the overlay to access the real DOM underneath.
   * `fullBounds` passes through to `annotationForElement` — see there.
   */
  private buildAnnotation(
    rectBounds: DOMRect,
    options?: { fullBounds?: boolean },
  ): { annotation: AnnotationPayload; anchorBounds: DOMRect } {
    // Temporarily hide overlay to find the real element underneath
    if (this.overlay) this.overlay.style.pointerEvents = "none";
    const anchorElement = findAnchorElement(rectBounds);
    if (this.overlay) this.overlay.style.pointerEvents = "auto";

    return this.annotationForElement(anchorElement, rectBounds, options);
  }
  destroy(): void {
    this.deactivate();
    this.deactivateTargeting();
    // Settle an in-flight submission BEFORE tearing down the popup, so the
    // `runSubmission` promise cannot outlive teardown. The launcher's
    // `destroy()` also calls `bus.removeAll()`, which would otherwise strip
    // the terminal-event listeners and leave the promise — and the base64
    // screenshot it retains — hung forever.
    this.rejectPendingSubmission?.(new Error("Annotator destroyed during submission"));
    this.popup.destroy();
  }
}
