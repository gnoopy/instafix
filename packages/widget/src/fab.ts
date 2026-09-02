import type { InstaFixConfig } from "@instafix/core";
import { sampleBackgroundIsLight } from "./dom/background-contrast.js";
import { parseSvg, setText } from "./dom-utils.js";
import type { EventBus, WidgetEvents } from "./events.js";
import { type TFunction, type Translations, tWithParams } from "./i18n/index.js";
import { ICON_CLOSE, ICON_EDIT, ICON_EYE, ICON_EYE_OFF, ICON_INSTAFIX, ICON_LIST, ICON_TARGET } from "./icons.js";

/** Re-sample the background behind the FAB/toolbar at most this often while scrolling/resizing. */
const CONTRAST_DEBOUNCE_MS = 200;

/** Pause between discovery-shine sweeps — picked fresh (not a fixed cadence) so it never reads as mechanical. */
const SHINE_INTERVAL_CHOICES_MS = [3000, 4000, 5000];

/** Closed set of toolbar item ids — keeps the label lookup exhaustive. */
type ToolbarItemId = "chat" | "annotate" | "target-picker" | "toggle-annotations";

interface ToolbarItem {
  id: ToolbarItemId;
  icon: string;
  iconAlt?: string;
}

// Stable mapping between toolbar item ids and their translation keys. The
// label is fully derived from this map via `t()`, so the constructor and
// `applyLabels()` share one source of truth for which node gets which string.
const ITEM_LABEL_KEYS: Record<ToolbarItemId, keyof Translations> = {
  chat: "fab.messages",
  annotate: "fab.annotate",
  "target-picker": "fab.targeting",
  "toggle-annotations": "fab.annotations",
};

const TOOLBAR_HIDDEN_KEY = "instafix_toolbar_hidden";

/** Whether the user has explicitly hidden the toolbar on a previous visit — visible by default otherwise. */
function loadToolbarHidden(): boolean {
  try {
    return localStorage.getItem(TOOLBAR_HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

function saveToolbarHidden(hidden: boolean): void {
  try {
    if (hidden) localStorage.setItem(TOOLBAR_HIDDEN_KEY, "1");
    else localStorage.removeItem(TOOLBAR_HIDDEN_KEY);
  } catch {
    // localStorage disabled/full — the toolbar still works, it just won't remember the preference
  }
}

/**
 * Floating Action Button with an always-visible action toolbar and a
 * notification badge.
 *
 * The toolbar (list/chat, annotate, toggle-markers) is a persistent
 * horizontal row next to the FAB, visible by default so the most common
 * actions are one click away — not a menu the FAB reveals on click. The FAB
 * itself is only a show/hide toggle for it; the user's choice persists
 * across page loads via localStorage.
 *
 * Glassmorphism: gradient background, glow shadow, glass toolbar items.
 */
export class Fab {
  private root: HTMLElement;
  private fab: HTMLButtonElement;
  private toolbar: HTMLElement;
  private badgeEl: HTMLElement | null = null;
  private toolbarVisible: boolean;
  private annotationsVisible = true;
  /** Mirrors the annotator's hover-and-click targeting mode — driven by `targeting:start`/`targeting:end`, never mutated directly on click. */
  private targetingActive = false;
  private readonly unsubTargetingStart: () => void;
  private readonly unsubTargetingEnd: () => void;
  /** Whether the feedback panel (right sidebar) is open — it covers the toolbar, so the discovery shine is pointless (and distracting at the panel's edge) while it is. */
  private panelOpen = false;
  private readonly unsubPanelOpen: () => void;
  private readonly unsubPanelClose: () => void;
  private items: ToolbarItem[];
  /** The shadow host — hidden momentarily during a contrast sample so `elementFromPoint` sees the real page underneath. */
  private readonly host: HTMLElement;
  private contrastDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly onWindowChange: () => void;
  private shineTimer: ReturnType<typeof setTimeout> | null = null;
  private activeShine: HTMLElement | null = null;

  constructor(
    shadowRoot: ShadowRoot,
    config: InstaFixConfig,
    private readonly bus: EventBus<WidgetEvents>,
    private readonly t: TFunction,
  ) {
    const position = config.position ?? "bottom-right";
    this.host = shadowRoot.host as HTMLElement;

    // Horizontal toolbar next to the FAB. Icons:
    // - list    → opens the feedback sidebar (panel of feedbacks).
    // - edit    → creates a new annotation (the action).
    // - target  → toggles the hover-and-click "auto-target" picker mode.
    // - eye     → toggles marker visibility on the page (state).
    // The marker-visibility toggle is opt-out via `config.showAnnotationsToggle`:
    // default `true` preserves historical behavior, `false` removes the item from
    // the toolbar entirely (no DOM, no keyboard slot, no click handler).
    this.items = [
      { id: "chat", icon: ICON_LIST },
      { id: "annotate", icon: ICON_EDIT },
      { id: "target-picker", icon: ICON_TARGET },
    ];
    if (config.showAnnotationsToggle !== false) {
      this.items.push({ id: "toggle-annotations", icon: ICON_EYE, iconAlt: ICON_EYE_OFF });
    }

    // The button's active state is driven entirely by the bus (not mutated
    // directly on click) so it stays correct regardless of whether the
    // session ended via Escape, a successful lock, or the button itself.
    this.unsubTargetingStart = this.bus.on("targeting:start", () => this.setTargetingActive(true));
    this.unsubTargetingEnd = this.bus.on("targeting:end", () => this.setTargetingActive(false));

    // The panel covers the toolbar while open — pause the discovery shine
    // for that window and pick it back up once the toolbar is visible again.
    this.unsubPanelOpen = this.bus.on("open", () => {
      this.panelOpen = true;
      this.stopShineSchedule();
    });
    this.unsubPanelClose = this.bus.on("close", () => {
      this.panelOpen = false;
      this.scheduleShine();
    });

    this.toolbarVisible = !loadToolbarHidden();

    // FAB button — needs position:relative for badge positioning
    this.fab = document.createElement("button");
    this.fab.className = `sp-fab sp-fab--${position} sp-anim-fab-in`;
    this.fab.style.position = "fixed"; // ensure fixed even with relative children
    this.fab.appendChild(parseSvg(this.toolbarVisible ? ICON_CLOSE : ICON_INSTAFIX));
    this.fab.setAttribute("aria-expanded", String(this.toolbarVisible));
    this.fab.addEventListener("click", () => this.toggle());

    // Toolbar container
    this.toolbar = document.createElement("div");
    this.toolbar.className = `sp-toolbar sp-toolbar--${position}${this.toolbarVisible ? " sp-toolbar--visible" : ""}`;
    this.toolbar.setAttribute("role", "toolbar");

    for (const item of this.items) {
      const btn = document.createElement("button");
      btn.className = "sp-toolbar-item";
      btn.appendChild(parseSvg(item.icon));
      btn.setAttribute("aria-label", "");
      btn.dataset.itemId = item.id;
      // Hidden items drop out of Tab order — they sit right next to the FAB
      // and would otherwise be reachable (if invisibly) while collapsed.
      btn.tabIndex = this.toolbarVisible ? 0 : -1;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleItemClick(item.id);
      });

      const label = document.createElement("span");
      label.className = "sp-toolbar-label";
      btn.appendChild(label);

      this.toolbar.appendChild(btn);
    }

    this.root = document.createElement("div");
    this.root.appendChild(this.toolbar);
    this.root.appendChild(this.fab);
    shadowRoot.appendChild(this.root);

    // Bind every `t()`-derived string into the freshly-built DOM. Kept as a
    // single pass so the constructor and `refreshLabels()` never drift.
    this.applyLabels();
    // Explicit initial aria-pressed — the button starts inactive.
    this.setTargetingActive(false);

    // Escape hides the toolbar — the keyboard equivalent of clicking the FAB
    // to collapse it. Unlike the old transient radial menu, a stray click
    // elsewhere on the page must NOT hide it: the whole point of a
    // persistent toolbar is staying out of the way of that kind of
    // incidental interaction while remaining one click away.
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.toolbarVisible) {
        e.stopPropagation();
        this.hide();
      }
    };
    this.fab.addEventListener("keydown", handleEscape);
    this.toolbar.addEventListener("keydown", handleEscape);

    // Arrow key navigation within the toolbar (horizontal layout)
    this.toolbar.addEventListener("keydown", (e) => {
      const items = Array.from(this.toolbar.querySelectorAll<HTMLButtonElement>(".sp-toolbar-item"));
      if (items.length === 0 || !this.toolbarVisible) return;
      const activeEl = (shadowRoot.activeElement ?? document.activeElement) as HTMLElement;
      const currentIndex = items.indexOf(activeEl as HTMLButtonElement);

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          const nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[nextIndex]?.focus();
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
          items[nextIndex]?.focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          items[0]?.focus();
          break;
        }
        case "End": {
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
        }
      }
    });

    // Auto-contrast against whatever the host page's background actually is
    // where the FAB/toolbar sit (G8) — a translucent glass toolbar can be
    // hard to notice against a page whose own background is close to it
    // (e.g. the default light theme's white-ish glass over a white page).
    // The first sample waits a frame: the shadow root's stylesheet may not
    // be attached yet at the exact moment this constructor runs (the FAB
    // still reports a 0×0 rect until it is), so sampling synchronously here
    // would silently no-op for most page loads. Re-sampled (debounced) on
    // scroll/resize after that, since a `position: fixed` widget ends up
    // over different content as the page scrolls underneath it.
    requestAnimationFrame(() => this.updateContrast());
    this.onWindowChange = () => {
      if (this.contrastDebounce) clearTimeout(this.contrastDebounce);
      this.contrastDebounce = setTimeout(() => this.updateContrast(), CONTRAST_DEBOUNCE_MS);
    };
    window.addEventListener("scroll", this.onWindowChange, { passive: true });
    window.addEventListener("resize", this.onWindowChange);

    // Discovery shine (G8) — an easy-to-miss persistent toolbar needs some
    // way to say "look here" every so often, not just on the first load.
    // Only runs while the toolbar is actually visible — see show()/hide().
    this.scheduleShine();
  }

  /**
   * Sample the page's actual background color behind the FAB and toggle
   * `sp-fab--on-light` / `sp-fab--on-dark` (cascading to the toolbar items
   * via `.sp-toolbar--on-light`/`--on-dark`) so their styling always
   * contrasts with it, rather than assuming the widget's own light/dark
   * theme matches the host page.
   */
  private updateContrast(): void {
    const rect = this.fab.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return; // not laid out yet (hidden, or a non-browser test env)
    const isLight = sampleBackgroundIsLight(rect.left + rect.width / 2, rect.top + rect.height / 2, this.host);
    if (isLight === null) return; // nothing to sample — leave the theme-based default styling as-is

    this.root.classList.toggle("sp-fab-root--on-light", isLight);
    this.root.classList.toggle("sp-fab-root--on-dark", !isLight);
  }

  /**
   * Schedule the next discovery-shine sweep after a random pause (one of
   * `SHINE_INTERVAL_CHOICES_MS`, re-picked every cycle) — a no-op while the
   * toolbar is hidden, since there's nothing to draw attention to then.
   */
  private scheduleShine(): void {
    if (this.shineTimer) clearTimeout(this.shineTimer);
    if (!this.toolbarVisible || this.panelOpen) return;
    const choices = SHINE_INTERVAL_CHOICES_MS;
    const delay = choices[Math.floor(Math.random() * choices.length)] as number;
    this.shineTimer = setTimeout(() => {
      this.playShine();
      this.scheduleShine();
    }, delay);
  }

  /** Cancels any pending shine cycle and removes an in-flight sweep element, if one is currently animating. */
  private stopShineSchedule(): void {
    if (this.shineTimer) {
      clearTimeout(this.shineTimer);
      this.shineTimer = null;
    }
    this.activeShine?.remove();
    this.activeShine = null;
  }

  /**
   * One sweep of the discovery shine — a diagonal light band that passes
   * right-to-left across the FAB and every toolbar item at once (they're
   * separately-positioned siblings, so the sweep's own box is computed from
   * their actual rendered bounds — position config and item count both
   * change that span). Deferred a frame for the same reason updateContrast()
   * is: nothing has real layout yet at the exact instant a timer fires.
   */
  private playShine(): void {
    requestAnimationFrame(() => {
      if (!this.toolbarVisible || this.panelOpen) return; // hidden/covered again before this frame ran
      const toolbarRect = this.toolbar.getBoundingClientRect();
      const fabRect = this.fab.getBoundingClientRect();
      if (toolbarRect.width === 0 || fabRect.width === 0) return; // not laid out (hidden, or a non-browser test env)

      const left = Math.min(toolbarRect.left, fabRect.left);
      const right = Math.max(toolbarRect.right, fabRect.right);
      const top = Math.min(toolbarRect.top, fabRect.top);
      const bottom = Math.max(toolbarRect.bottom, fabRect.bottom);

      this.activeShine?.remove();
      const shine = document.createElement("div");
      shine.className = "sp-toolbar-shine";
      shine.style.cssText = `left:${left}px; top:${top}px; width:${right - left}px; height:${bottom - top}px;`;
      shine.setAttribute("aria-hidden", "true");
      shine.addEventListener(
        "animationend",
        () => {
          shine.remove();
          if (this.activeShine === shine) this.activeShine = null;
        },
        { once: true },
      );
      this.root.appendChild(shine);
      this.activeShine = shine;
    });
  }

  /** The FAB button element — anchor point for the onboarding coachmark (G8). */
  get buttonElement(): HTMLButtonElement {
    return this.fab;
  }

  /**
   * Re-read every `t(...)`-derived label and aria-label from the active
   * translation function. Idempotent — call after the locale dictionary has
   * finished loading so the FAB labels swap from the English fallback to the
   * configured language.
   */
  refreshLabels(): void {
    this.applyLabels();
  }

  /**
   * Walk the already-built DOM and bind every translation-derived string —
   * the FAB `aria-label` (reflecting show/hide state), each toolbar item's
   * `aria-label`, and each `.sp-toolbar-label` `textContent`. The single
   * source of truth for which node gets which `t()` string, shared by the
   * constructor and `refreshLabels()` so the two can never drift.
   */
  private applyLabels(): void {
    this.fab.setAttribute("aria-label", this.t(this.toolbarVisible ? "fab.hideTools" : "fab.showTools"));

    const buttons = this.toolbar.querySelectorAll<HTMLButtonElement>(".sp-toolbar-item");
    for (const btn of buttons) {
      const id = btn.dataset.itemId as ToolbarItemId | undefined;
      if (!id) continue;
      const key = ITEM_LABEL_KEYS[id];
      if (!key) continue;
      const label = this.t(key);
      btn.setAttribute("aria-label", label);
      const labelSpan = btn.querySelector<HTMLSpanElement>(".sp-toolbar-label");
      if (labelSpan) setText(labelSpan, label);
    }
  }

  /** Update the badge count. Pass 0 to hide. */
  updateBadge(count: number): void {
    if (count <= 0) {
      this.badgeEl?.remove();
      this.badgeEl = null;
      return;
    }

    if (!this.badgeEl) {
      this.badgeEl = document.createElement("span");
      this.badgeEl.className = "sp-fab-badge";
      this.badgeEl.setAttribute("role", "status");
      this.badgeEl.setAttribute("aria-live", "polite");
      this.fab.appendChild(this.badgeEl);
    }

    const displayText = count > 99 ? "99+" : String(count);
    setText(this.badgeEl, displayText);
    this.badgeEl.setAttribute("aria-label", tWithParams(this.t, "fab.badge", { count }));
  }

  private toggle(): void {
    this.toolbarVisible ? this.hide() : this.show();
  }

  private show(): void {
    this.toolbarVisible = true;
    saveToolbarHidden(false);
    this.setFabIcon(ICON_CLOSE);
    this.fab.setAttribute("aria-expanded", "true");
    this.fab.setAttribute("aria-label", this.t("fab.hideTools"));
    this.toolbar.classList.add("sp-toolbar--visible");

    const items = this.toolbar.querySelectorAll<HTMLButtonElement>(".sp-toolbar-item");
    for (const item of items) item.tabIndex = 0;

    this.scheduleShine();
  }

  private hide(): void {
    this.toolbarVisible = false;
    saveToolbarHidden(true);
    this.setFabIcon(ICON_INSTAFIX);
    this.fab.setAttribute("aria-expanded", "false");
    this.fab.setAttribute("aria-label", this.t("fab.showTools"));
    this.toolbar.classList.remove("sp-toolbar--visible");

    const items = this.toolbar.querySelectorAll<HTMLButtonElement>(".sp-toolbar-item");
    for (const item of items) item.tabIndex = -1;

    // Return focus to the FAB in case a toolbar item had it.
    this.fab.focus();

    this.stopShineSchedule();
  }

  private setFabIcon(svgStr: string): void {
    const badge = this.badgeEl;
    this.fab.replaceChildren(parseSvg(svgStr));
    // Re-append badge after icon swap
    if (badge) this.fab.appendChild(badge);
  }

  private handleItemClick(id: ToolbarItemId): void {
    // The toolbar stays visible after an action — that's the entire point of
    // making it persistent instead of a menu that closes on every use.
    switch (id) {
      case "chat":
        this.bus.emit("panel:toggle", true);
        break;
      case "annotate": {
        // Putting keyboard users back on the FAB when the session ends is on
        // us — the annotator moves focus into its own body-level overlay.
        const unsubscribe = this.bus.on("annotation:end", () => {
          unsubscribe();
          this.fab.focus();
        });
        this.bus.emit("annotation:start");
        break;
      }
      case "toggle-annotations": {
        this.annotationsVisible = !this.annotationsVisible;
        this.bus.emit("annotations:toggle", this.annotationsVisible);
        // Replace ONLY the icon SVG, not every child. The button also carries
        // the `<span class="sp-toolbar-label">` hover label — `replaceChildren`
        // wiped it on the first click, killing the tooltip until reload.
        const btn = this.toolbar.querySelector('[data-item-id="toggle-annotations"]');
        const oldSvg = btn?.querySelector("svg");
        if (oldSvg) {
          const newSvg = parseSvg(this.annotationsVisible ? ICON_EYE : ICON_EYE_OFF);
          oldSvg.replaceWith(newSvg);
        }
        break;
      }
      case "target-picker":
        // Never flips `targetingActive` directly — `setTargetingActive` (bus-driven)
        // is the single source of truth, so a session ended by Escape or a
        // successful lock (not this button) still leaves the button in sync.
        this.bus.emit(this.targetingActive ? "targeting:end" : "targeting:start");
        break;
    }
  }

  private setTargetingActive(active: boolean): void {
    this.targetingActive = active;
    const btn = this.toolbar.querySelector<HTMLButtonElement>('[data-item-id="target-picker"]');
    btn?.setAttribute("aria-pressed", String(active));
    btn?.classList.toggle("sp-toolbar-item--active", active);
  }

  destroy(): void {
    window.removeEventListener("scroll", this.onWindowChange);
    window.removeEventListener("resize", this.onWindowChange);
    if (this.contrastDebounce) clearTimeout(this.contrastDebounce);
    this.stopShineSchedule();
    this.unsubTargetingStart();
    this.unsubTargetingEnd();
    this.unsubPanelOpen();
    this.unsubPanelClose();
    this.root.remove();
  }
}
