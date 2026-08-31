import type { InstaFixConfig } from "@instafix/core";
import { parseSvg, setText } from "./dom-utils.js";
import type { EventBus, WidgetEvents } from "./events.js";
import { type TFunction, type Translations, tWithParams } from "./i18n/index.js";
import { ICON_CLOSE, ICON_EDIT, ICON_EYE, ICON_EYE_OFF, ICON_INSTAFIX, ICON_LIST } from "./icons.js";

/** Closed set of toolbar item ids — keeps the label lookup exhaustive. */
type ToolbarItemId = "chat" | "annotate" | "toggle-annotations";

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
  private items: ToolbarItem[];

  constructor(
    shadowRoot: ShadowRoot,
    config: InstaFixConfig,
    private readonly bus: EventBus<WidgetEvents>,
    private readonly t: TFunction,
  ) {
    const position = config.position ?? "bottom-right";

    // Horizontal toolbar next to the FAB. Icons:
    // - list  → opens the feedback sidebar (panel of feedbacks).
    // - edit  → creates a new annotation (the action).
    // - eye   → toggles marker visibility on the page (state).
    // The marker-visibility toggle is opt-out via `config.showAnnotationsToggle`:
    // default `true` preserves historical behavior, `false` removes the item from
    // the toolbar entirely (no DOM, no keyboard slot, no click handler).
    this.items = [
      { id: "chat", icon: ICON_LIST },
      { id: "annotate", icon: ICON_EDIT },
    ];
    if (config.showAnnotationsToggle !== false) {
      this.items.push({ id: "toggle-annotations", icon: ICON_EYE, iconAlt: ICON_EYE_OFF });
    }

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
    }
  }

  destroy(): void {
    this.root.remove();
  }
}
