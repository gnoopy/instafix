import type { AnnotationPayload, FeedbackType, ScreenshotRegion } from "@instafix/core";
import { CLICK_THRESHOLD_PX, FONT_STACK, Z_INDEX_MAX } from "./constants.js";
import { findAnchorElement, findLargestAncestor, generateAnchor, rectToPercentages } from "./dom/anchor.js";
import { computeAutoScrollDelta } from "./dom/auto-scroll.js";
import { inspectElement } from "./dom/inspect.js";
import { collectMarqueeElements, collectMarqueeElementsDetailed } from "./dom/marquee.js";
import { type MotionPauseHandle, pauseMotion } from "./dom/motion-pause.js";
import { getSourceHint } from "./dom/source-hint.js";
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
  /** `window.scrollX`/`scrollY` at the moment `startX`/`startY` were captured — see `effectiveDragStart()`. */
  private startScrollX = 0;
  private startScrollY = 0;
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

  // --- Targeting mode (Mode 2) — hover-and-click "auto-target" picker. Its
  // own session tracking (no page dim/lock, no scroll-lock, just a
  // live-tracking highlight until the user clicks — which hands off to
  // startInstantAnnotation, the SAME hit-testing and popup wiring
  // right-click used to drive — or presses Escape) is independent of
  // isActive/activate()/deactivate(), but the two ARE mutually exclusive:
  // activate() and activateTargeting() each cancel the other mode first if
  // it's live (see both methods). ---
  private targetingModeActive = false;
  private targetingHighlight: HTMLElement | null = null;
  /** The element the highlight currently outlines — re-used by `onTargetingScroll` to re-measure `getBoundingClientRect()` without a fresh `elementFromPoint` (the cursor hasn't moved, so re-hit-testing at the same client coordinates on a scrolled page would find a different element). */
  private targetingHoveredElement: Element | null = null;
  private targetingRafId: number | null = null;
  private pendingTargetingMoveEvent: MouseEvent | null = null;

  constructor(
    private readonly colors: ThemeColors,
    private readonly bus: EventBus<WidgetEvents>,
    private readonly t: TFunction,
    private readonly enableScreenshot: boolean = false,
    private readonly getFallbackTarget?: () => HTMLElement | null,
    agentInstructions?: string[],
  ) {
    this.popup = new Popup(colors, t, agentInstructions);

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
    // Mutually exclusive with targeting mode (Mode 2) — starting a draw
    // session while the auto-target picker is live must cancel picking, not
    // run both at once (their document-level mousemove/click/keydown
    // listeners would otherwise fight over the same input). Routed through
    // the bus (not a direct deactivateTargeting() call) so the FAB's
    // target-picker button resets too — see fab.ts's targeting:end listener.
    if (this.targetingModeActive) this.bus.emit("targeting:end");
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

    // Escape to cancel — capture phase so an active session always wins over
    // the FAB's own "Escape collapses the toolbar" shortcut (fab.ts's
    // handleEscape, attached on the FAB/toolbar elements in bubble phase):
    // deactivate() below can restore focus to the FAB, and without capture
    // that bubble-phase listener would stopPropagation() first and the
    // session would never see the Escape at all.
    document.addEventListener("keydown", this.onKeyDown, true);

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
    document.removeEventListener("keydown", this.onKeyDown, true);

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
   * Start the hover-and-click "auto-target" picker (Mode 2). Idempotent
   * while targeting is already on (the constructor's bus subscription can
   * fire redundantly). Mutually exclusive with a draw/instant session —
   * see `activate()`'s matching guard — so an active one is cancelled
   * first (via `deactivate()`, which emits `annotation:end` and resets the
   * FAB's annotate button) rather than silently rejecting the switch.
   */
  private activateTargeting(): void {
    if (this.targetingModeActive) return;
    if (this.isActive) this.deactivate();
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
    // Capture phase here too — same reasoning as onKeyDown above: targeting
    // mode can be entered by cancelling an active draw session, which
    // restores focus to the FAB, so the FAB's own bubble-phase "Escape
    // collapses the toolbar" handler must not get first refusal.
    document.addEventListener("keydown", this.onTargetingKeyDown, true);
    // A page scroll (mouse wheel, or a hovered element bigger than the
    // viewport that the user scrolls to see more of) never fires mousemove
    // by itself — without this, the highlight freezes at its pre-scroll
    // getBoundingClientRect() and visibly detaches from the element it's
    // supposed to be outlining. { passive: true }: never blocks the scroll.
    window.addEventListener("scroll", this.onTargetingScroll, { passive: true, capture: true });
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
    this.targetingHoveredElement = null;

    document.removeEventListener("mousemove", this.onTargetingMouseMove);
    document.removeEventListener("click", this.onTargetingClick, true);
    document.removeEventListener("keydown", this.onTargetingKeyDown, true);
    window.removeEventListener("scroll", this.onTargetingScroll, true);

    this.targetingHighlight?.remove();
    this.targetingHighlight = null;
  }

  /** Applies `targetingHoveredElement`'s current `getBoundingClientRect()` to the highlight — shared by the mousemove hit-test below and the scroll re-measure. */
  private renderTargetingHighlight(el: Element): void {
    if (!this.targetingHighlight) return;
    const rect = el.getBoundingClientRect();
    this.targetingHighlight.style.left = `${rect.left}px`;
    this.targetingHighlight.style.top = `${rect.top}px`;
    this.targetingHighlight.style.width = `${rect.width}px`;
    this.targetingHighlight.style.height = `${rect.height}px`;
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
        this.targetingHoveredElement = null;
        this.targetingHighlight.style.width = "0px";
        this.targetingHighlight.style.height = "0px";
        return;
      }

      this.targetingHoveredElement = hovered;
      this.renderTargetingHighlight(hovered);
    });
  };

  /**
   * Re-measure the currently-hovered element on scroll — NOT a fresh
   * `elementFromPoint` at the same client coordinates, which on a scrolled
   * page would silently swap to whatever now sits under the (unmoved)
   * cursor instead of tracking the element the user is actually looking at.
   */
  private onTargetingScroll = (): void => {
    if (this.targetingHoveredElement) this.renderTargetingHighlight(this.targetingHoveredElement);
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
    if (e.key !== "Escape") return;
    // An open composer first: without this, Escape tore down the overlay
    // around the popup and left it orphaned on screen with its show()
    // promise pending. First Escape closes the composer (resolving null
    // through the normal cancel path), the next one exits the mode.
    if (this.popup.isOpen) {
      this.popup.cancelOpen();
      return;
    }
    this.deactivate();
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

    let currentElement: Element = target;
    let { annotation, anchorBounds } = this.annotationForElement(currentElement, rectBounds, { fullBounds: true });
    let captureRect = rectBounds;
    // Same Element/Container toggle as the pointer flows — all three
    // popovers (auto-target, drag, keyboard) stay identical.
    const largestElement = findLargestAncestor(target);
    const hasSizeChoice = largestElement !== target;

    // Submission stays inside the popup so the user gets a visible spinner
    // until the server confirms — see finishDrawing for the rationale.
    const screenshotCache: { value?: AnnotatedScreenshot | null } = {};
    const keyboardShowPromise = this.popup.show(
      rectBounds,
      (formResult) => this.runSubmission([annotation], formResult, captureRect, screenshotCache),
      hasSizeChoice
        ? {
            initial: "smallest",
            onChange: (choice) => {
              currentElement = choice === "smallest" ? target : largestElement;
              const rebuilt = this.annotationForElement(currentElement, rectBounds, { fullBounds: true });
              annotation = rebuilt.annotation;
              anchorBounds = rebuilt.anchorBounds;
              captureRect = this.clampRectToViewport(anchorBounds);
              delete screenshotCache.value;
              if (this.drawingRect) {
                this.drawingRect.style.left = `${anchorBounds.left}px`;
                this.drawingRect.style.top = `${anchorBounds.top}px`;
                this.drawingRect.style.width = `${anchorBounds.width}px`;
                this.drawingRect.style.height = `${anchorBounds.height}px`;
              }
              this.popup.setSourceHint(getSourceHint(currentElement));
            },
          }
        : undefined,
    );
    this.popup.setPromptContext(() => [annotation]);
    this.popup.setSourceHint(getSourceHint(target));
    const result = await keyboardShowPromise;

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
    this.startScrollX = window.scrollX;
    this.startScrollY = window.scrollY;
    this.lastPointerClient = { x: clientX, y: clientY };
    this.startAutoScroll();

    this.drawingRect?.remove();
    this.drawingRect = this.createDrawingRect();
    this.overlay?.appendChild(this.drawingRect);
  }

  /**
   * `startX`/`startY` are captured once in client (viewport-relative)
   * coordinates at mousedown. If the page scrolls DURING the drag — auto-scroll
   * near an edge (below), or a manual wheel scroll — the viewport moves under
   * that fixed anchor, so reusing startX/startY as-is would leave the
   * rendered rect (and, worse, the annotation bounds actually submitted)
   * pinned to the wrong spot on the page. Re-deriving the start corner from
   * the scroll delta since drag start keeps it locked to the same DOCUMENT
   * position regardless of how much scrolling happened meanwhile.
   */
  private effectiveDragStart(): { x: number; y: number } {
    return {
      x: this.startX - (window.scrollX - this.startScrollX),
      y: this.startY - (window.scrollY - this.startScrollY),
    };
  }

  /** Shared by the mousemove/touchmove rAF and the auto-scroll tick below — the one place that turns a "current pointer" point into the rendered (scroll-corrected) rect. */
  private renderDrawingRect(currentX: number, currentY: number): void {
    if (!this.drawingRect) return;
    const start = this.effectiveDragStart();
    const x = Math.min(currentX, start.x);
    const y = Math.min(currentY, start.y);
    const w = Math.abs(currentX - start.x);
    const h = Math.abs(currentY - start.y);
    this.drawingRect.style.left = `${x}px`;
    this.drawingRect.style.top = `${y}px`;
    this.drawingRect.style.width = `${w}px`;
    this.drawingRect.style.height = `${h}px`;
  }

  /**
   * Viewport-edge auto-scroll during a drag (G3) — runs on a timer (not just
   * on mousemove) so holding the pointer still near an edge keeps scrolling.
   * Also re-renders the rect on every tick, scroll or not: auto-scroll moves
   * the page without ever firing a mousemove, so nothing else would trigger
   * `renderDrawingRect()` while it's happening — the rect would otherwise
   * sit frozen while the content grows out from under the fixed pointer
   * corner, instead of visibly expanding to track it.
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
      this.renderDrawingRect(this.lastPointerClient.x, this.lastPointerClient.y);
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
  /** Move the live outline to the given viewport rect — no-op when no outline is up. */
  private applyDrawingRectBounds(bounds: { left: number; top: number; width: number; height: number }): void {
    if (!this.drawingRect) return;
    this.drawingRect.style.left = `${bounds.left}px`;
    this.drawingRect.style.top = `${bounds.top}px`;
    this.drawingRect.style.width = `${bounds.width}px`;
    this.drawingRect.style.height = `${bounds.height}px`;
  }

  /** The live outline's current geometry (parsed back from its inline style), or null when none is up. */
  private currentDrawingRectBounds(): { left: number; top: number; width: number; height: number } | null {
    const rect = this.drawingRect;
    if (!rect) return null;
    return {
      left: Number.parseFloat(rect.style.left) || 0,
      top: Number.parseFloat(rect.style.top) || 0,
      width: Number.parseFloat(rect.style.width) || 0,
      height: Number.parseFloat(rect.style.height) || 0,
    };
  }

  private createDrawingRect(): HTMLElement {
    // The white inner+outer halo rings keep the colored border legible over
    // ANY local background — the detected selection color is
    // contrast-adjusted against the page's overall background
    // (dom/selection-color.ts), but the specific element under the outline
    // can still be a similar mid-tone; the halo is the guarantee (same
    // trick browser DevTools' element highlighter uses).
    // z-index: the targeting-mode highlight is appended to document.body
    // directly (not inside the max-z overlay), where z-index:auto loses to
    // any host element with its own positive z-index — a sticky editor
    // toolbar (z-40 and the like) painted OVER the outline made hover
    // "show nothing" on exactly the components users most want to pick.
    const rect = el("div", {
      style: `
        position:fixed;
        z-index:${Z_INDEX_MAX};
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
      this.renderDrawingRect(evt.clientX, evt.clientY);
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

    // Scroll-corrected, not raw startX/startY — see effectiveDragStart(): if
    // the page scrolled mid-drag, the raw mousedown point no longer lines up
    // with the same content, and this rect feeds the SUBMITTED annotation's
    // bounds, not just the visual preview.
    const start = this.effectiveDragStart();
    const x = Math.min(clientX, start.x);
    const y = Math.min(clientY, start.y);
    const w = Math.abs(clientX - start.x);
    const h = Math.abs(clientY - start.y);

    if (w < CLICK_THRESHOLD_PX && h < CLICK_THRESHOLD_PX) {
      const pointRect = new DOMRect(clientX, clientY, 1, 1);
      // A click (not a drag) picks the element itself — record its full
      // bounds, not a 1px sub-region of it. Same smallest/largest-ancestor
      // resolution as the auto-target flow (startInstantAnnotation) so both
      // popovers offer the same "의견 대상: 요소/컨테이너" choice — a plain
      // click has exactly one ancestor chain to disambiguate, same as an
      // auto-target click.
      if (this.overlay) this.overlay.style.pointerEvents = "none";
      const smallestElement = findAnchorElement(pointRect);
      const largestElement = findLargestAncestor(smallestElement);
      if (this.overlay) this.overlay.style.pointerEvents = "auto";
      const { annotation, anchorBounds } = this.annotationForElement(smallestElement, pointRect, { fullBounds: true });
      // The annotation is the element's full bounds — show that as the
      // outline too (a sub-threshold drawn rect is a near-invisible dot),
      // mirroring the auto-target flow's persistent element outline.
      this.applyDrawingRectBounds(anchorBounds);
      // Always passed (even when smallest === largest, where the toggle
      // collapses) — the source-hint line rides on this context too.
      await this.finalizeOrAccumulate([annotation], this.clampRectToViewport(anchorBounds), shiftKey, undefined, {
        smallest: smallestElement,
        largest: largestElement,
      });
      return;
    }

    const rectBounds = new DOMRect(x, y, w, h);

    let annotations: AnnotationPayload[];
    // Live elements (+ their pre-built annotations) behind this drag's
    // multi-target selection — only populated by the marquee path, and only
    // meaningful for the multi-target preview (G8) / summary-detail toggle
    // below.
    let marquee: MarqueeSelection | undefined;
    let sizeChoice: Parameters<Annotator["finalizeOrAccumulate"]>[4];
    if (altKey) {
      annotations = [this.buildAreaAnnotation(rectBounds)];
    } else {
      const text = this.tryBuildTextAnnotation(clientX, clientY);
      if (text) {
        annotations = [text.annotation];
        // A text selection has a single container too — same
        // Element/Container toggle + source hint as every other
        // single-anchor popover. 컨테이너 switches the target to the
        // containing component; 요소 restores this exact quoted range
        // (finalizeOrAccumulate keeps the original annotation for that).
        sizeChoice = {
          smallest: text.detected.container,
          largest: findLargestAncestor(text.detected.container),
        };
      } else {
        const result = this.buildMarqueeAnnotations(rectBounds);
        annotations = result.annotations;
        marquee = {
          elements: result.elements,
          detailElements: result.detailElements,
          detailAnnotations: result.detailAnnotations,
        };
        // A drag that landed on exactly ONE element gets the same
        // Element/Container toggle as the auto-target popover — 요소 keeps
        // the drawn sub-region, 컨테이너 targets the containing component.
        if (result.singleAnchor) {
          sizeChoice = {
            smallest: result.singleAnchor,
            largest: findLargestAncestor(result.singleAnchor),
          };
        }
      }
    }

    await this.finalizeOrAccumulate(annotations, rectBounds, shiftKey, marquee, sizeChoice);
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
    /**
     * The single-anchor context behind this drag — set by `finishDrawing`
     * whenever the selection resolved to exactly one anchor element (a
     * plain click, a drag landing on one element, or a TEXT selection whose
     * range lives in one container). Drives two things, independently:
     *
     * - the Element/Container ("요소/컨테이너") toggle — the same popover
     *   toggle `startInstantAnnotation` shows — offered only when
     *   `smallest !== largest` (a container capped at the viewport-area
     *   limit collapses the choice, see `findLargestAncestor`);
     * - the dev-only source hint line, shown for the anchor regardless of
     *   whether the toggle has two distinct options.
     *
     * Toggle semantics: "요소" IS the original selection exactly as made
     * (the drawn sub-region, the quoted text range, the clicked element) —
     * choosing it back RESTORES that annotation and its outline. "컨테이너"
     * switches the target to the containing component's full bounds, and
     * the on-page outline re-tracks it — what you see outlined is always
     * what will be reported. Mutually exclusive with `marquee`'s
     * multi-target preview.
     */
    elementSizeChoice?: { smallest: Element; largest: Element },
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
    // Snapshot of the ORIGINAL selection so the 요소 side of the toggle can
    // restore it after a 컨테이너 excursion — annotation, capture region,
    // and the outline's current geometry (read from the live element, since
    // click paths preset it to the anchor's bounds before reaching here).
    const originalAnnotations = allAnnotations;
    const originalCaptureRect = captureRect;
    const originalOutline = this.currentDrawingRectBounds() ?? captureRect;
    const resultPromise = this.popup.show(
      captureRect,
      (formResult) => this.runSubmission(allAnnotations, formResult, captureRect, screenshotCache),
      elementSizeChoice && elementSizeChoice.smallest !== elementSizeChoice.largest
        ? {
            initial: "smallest",
            onChange: (choice) => {
              if (choice === "largest") {
                // 컨테이너: the target becomes the containing component
                // itself, and the on-page outline re-tracks it — the
                // selected area on the host page must visibly CHANGE with
                // the toggle, exactly like the auto-target popover.
                const rebuilt = this.annotationForElement(elementSizeChoice.largest, captureRect, {
                  fullBounds: true,
                });
                allAnnotations = [rebuilt.annotation];
                captureRect = this.clampRectToViewport(rebuilt.anchorBounds);
                this.applyDrawingRectBounds(rebuilt.anchorBounds);
                this.popup.setSourceHint(getSourceHint(elementSizeChoice.largest));
              } else {
                // 요소: RESTORE the original selection exactly as made —
                // annotation (drawn sub-region / quoted text / clicked
                // element), capture region, and outline all come back.
                allAnnotations = originalAnnotations;
                captureRect = originalCaptureRect;
                this.applyDrawingRectBounds(originalOutline);
                this.popup.setSourceHint(getSourceHint(elementSizeChoice.smallest));
              }
              // Either direction changes what's being reported — a cached
              // screenshot from the other choice no longer matches.
              delete screenshotCache.value;
            },
          }
        : undefined,
    );
    // show()'s executor runs synchronously (it resets the legend to hidden
    // before returning the pending promise) — set the real legend on the
    // next line, after that reset, not before it.
    if (showPreview) this.popup.setLegend(this.legendEntriesFromAnnotations(allAnnotations));
    // Getter, not a snapshot — `allAnnotations` is reassigned when the user
    // flips the summary/detail resolution.
    this.popup.setPromptContext(() => allAnnotations);
    // Same dev-only source hint the auto-target popover shows — part of
    // keeping the two popovers identical.
    if (elementSizeChoice) this.popup.setSourceHint(getSourceHint(elementSizeChoice.smallest));
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
  private tryBuildTextAnnotation(
    endX: number,
    endY: number,
  ): { annotation: AnnotationPayload; detected: ReturnType<typeof detectTextSelection> & object } | null {
    const start = this.effectiveDragStart();
    const detected = detectTextSelection(start.x, start.y, endX, endY);
    if (!detected) return null;
    return { annotation: this.buildTextAnnotationFor(detected, detected.container), detected };
  }

  /** Build the text-kind payload for a given anchor element. */
  private buildTextAnnotationFor(
    detected: NonNullable<ReturnType<typeof detectTextSelection>>,
    anchorElement: Element,
  ): AnnotationPayload {
    const anchor = generateAnchor(anchorElement);
    const anchorBounds = anchorElement.getBoundingClientRect();
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
      inspect: inspectElement(anchorElement),
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
  private buildMarqueeAnnotations(
    rectBounds: DOMRect,
  ): MarqueeSelection & { annotations: AnnotationPayload[]; singleAnchor?: Element } {
    if (this.overlay) this.overlay.style.pointerEvents = "none";
    const elements = collectMarqueeElements(rectBounds);
    // Detail (uncollapsed nested-chain) resolution is only worth computing
    // when there's a genuine multi-target selection to offer a toggle for.
    const detailElements = elements.length > 1 ? collectMarqueeElementsDetailed(rectBounds) : [];
    if (this.overlay) this.overlay.style.pointerEvents = "auto";

    if (elements.length <= 1) {
      const { annotation, anchorElement } = this.buildAnnotation(rectBounds);
      // Surface the anchor so `finishDrawing` can offer the same
      // Element/Container toggle the auto-target popover has — with drawn-
      // region semantics (the rect stays the annotation; only the anchor
      // re-parents).
      return {
        annotations: [annotation],
        elements: [],
        detailElements: [],
        detailAnnotations: [],
        singleAnchor: anchorElement,
      };
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
        inspect: inspectElement(element),
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
    let currentElement = smallestElement;
    // Full bounds: the auto-target click selects the COMPONENT — the stored
    // rect must be the element, not the 20px spot under the cursor, or the
    // marker-hover outline later re-renders as a dot at the click point.
    let { annotation, anchorBounds } = this.annotationForElement(currentElement, pointRect, { fullBounds: true });
    let captureRect = this.clampRectToViewport(anchorBounds);

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
    const instantShowPromise = this.popup.show(
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
              captureRect = this.clampRectToViewport(anchorBounds);
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
              // The source hint follows the toggle too.
              this.popup.setSourceHint(getSourceHint(currentElement));
            },
          }
        : undefined,
    );
    // After show() (it resets the context to null synchronously); getter
    // because `annotation` is reassigned by the Element/Container toggle.
    this.popup.setPromptContext(() => [annotation]);
    // Dev-only component source hint for the picked element — null on
    // production host builds, and the line simply doesn't render then.
    this.popup.setSourceHint(getSourceHint(currentElement));
    await instantShowPromise;

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
    // A pasted image (⌘V into the note) beats the auto-capture — the user
    // chose that exact image as the visual reference for this feedback.
    // Its region covers the whole image (there's no drawn-rect inside it).
    const pasted = this.popup.pastedScreenshotDataUrl;
    if (pasted) {
      screenshotCache.value = { dataUrl: pasted, region: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 } };
    } else if (screenshotCache.value === undefined) {
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
  /** Clamp a bounding box to the viewport so a capture/highlight rect never spills into blank off-screen margin. */
  private clampRectToViewport(bounds: DOMRect): DOMRect {
    const left = Math.max(0, bounds.left);
    const top = Math.max(0, bounds.top);
    return new DOMRect(
      left,
      top,
      Math.max(0, Math.min(bounds.right, window.innerWidth) - left),
      Math.max(0, Math.min(bounds.bottom, window.innerHeight) - top),
    );
  }

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
      // Captured on the LIVE element, before any overlay/redraw — with the
      // freeze toggle on, this is how a hover-only state gets recorded.
      inspect: inspectElement(anchorElement),
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
  ): { annotation: AnnotationPayload; anchorBounds: DOMRect; anchorElement: Element } {
    // Temporarily hide overlay to find the real element underneath
    if (this.overlay) this.overlay.style.pointerEvents = "none";
    const anchorElement = findAnchorElement(rectBounds);
    if (this.overlay) this.overlay.style.pointerEvents = "auto";

    return { ...this.annotationForElement(anchorElement, rectBounds, options), anchorElement };
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
