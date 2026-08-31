/**
 * Numbered on-page badges shown while composing a multi-select (marquee)
 * annotation — before submission (G8). Lets the user confirm which numbered
 * target maps to which region: hovering (or focusing) a badge outlines the
 * corresponding element; an "always show" toggle keeps every outline visible
 * without needing to hover, and persists across sessions.
 *
 * Lives outside Shadow DOM (like the popup and annotator overlay) so it can
 * be positioned in page-absolute coordinates over arbitrary host content.
 */

import { Z_INDEX_MAX } from "./constants.js";
import { el, setText } from "./dom-utils.js";
import type { TFunction } from "./i18n/index.js";
import { tWithParams } from "./i18n/index.js";
import type { ThemeColors } from "./styles/theme.js";

const ALWAYS_SHOW_KEY = "siteping_target_preview_always_show";

function loadAlwaysShow(): boolean {
  try {
    return localStorage.getItem(ALWAYS_SHOW_KEY) === "1";
  } catch {
    return false;
  }
}

function saveAlwaysShow(always: boolean): void {
  try {
    if (always) localStorage.setItem(ALWAYS_SHOW_KEY, "1");
    else localStorage.removeItem(ALWAYS_SHOW_KEY);
  } catch {
    // localStorage disabled/full — the toggle still works, it just won't remember the preference
  }
}

const BADGE_SIZE = 22;

export class MultiTargetPreview {
  private container: HTMLElement;
  private badges: HTMLButtonElement[] = [];
  private outlines: Array<HTMLElement | null>;
  private alwaysShow: boolean;

  constructor(
    private readonly colors: ThemeColors,
    private readonly elements: readonly Element[],
    private readonly t: TFunction,
    /** Anchors the "always show" toggle chip near the drawn selection. */
    anchorRect: DOMRect,
  ) {
    this.alwaysShow = loadAlwaysShow();
    this.outlines = this.elements.map(() => null);

    this.container = el("div", {
      style: `position:absolute; inset:0; pointer-events:none; z-index:${Z_INDEX_MAX};`,
    });
    document.body.appendChild(this.container);

    this.elements.forEach((element, index) => {
      const badge = this.buildBadge(element, index);
      this.badges.push(badge);
      this.container.appendChild(badge);
    });

    this.container.appendChild(this.buildToggle(anchorRect));

    if (this.alwaysShow) this.showAll();
  }

  private buildBadge(element: Element, index: number): HTMLButtonElement {
    const rect = element.getBoundingClientRect();
    const badge = document.createElement("button");
    badge.type = "button";
    badge.style.cssText = `
      position:absolute;
      top:${rect.top + window.scrollY - BADGE_SIZE / 2}px;
      left:${rect.left + window.scrollX - BADGE_SIZE / 2}px;
      width:${BADGE_SIZE}px;height:${BADGE_SIZE}px;
      border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${this.colors.accent};color:#fff;
      font-family:"Inter",system-ui,-apple-system,sans-serif;
      font-size:11px;font-weight:700;
      border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      pointer-events:auto;cursor:default;
    `;
    setText(badge, String(index + 1));
    badge.setAttribute("aria-label", tWithParams(this.t, "annotator.targetBadgeAria", { number: index + 1 }));
    badge.addEventListener("mouseenter", () => this.show(index));
    badge.addEventListener("mouseleave", () => {
      if (!this.alwaysShow) this.hide(index);
    });
    badge.addEventListener("focus", () => this.show(index));
    badge.addEventListener("blur", () => {
      if (!this.alwaysShow) this.hide(index);
    });
    return badge;
  }

  private buildToggle(anchorRect: DOMRect): HTMLElement {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.style.cssText = `
      position:absolute;
      top:${anchorRect.top + window.scrollY - 34}px;
      left:${anchorRect.left + window.scrollX}px;
      display:flex;align-items:center;gap:6px;
      padding:4px 10px;border-radius:9999px;
      font-family:"Inter",system-ui,-apple-system,sans-serif;
      font-size:11px;font-weight:600;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBgHeavy};color:${this.colors.textTertiary};
      pointer-events:auto;cursor:pointer;white-space:nowrap;
    `;
    setText(toggle, this.t("annotator.targetPreviewAlwaysShow"));
    toggle.setAttribute("aria-pressed", String(this.alwaysShow));
    this.applyToggleState(toggle);
    toggle.addEventListener("click", () => {
      this.setAlwaysShow(!this.alwaysShow);
      toggle.setAttribute("aria-pressed", String(this.alwaysShow));
      this.applyToggleState(toggle);
    });
    return toggle;
  }

  private applyToggleState(toggle: HTMLElement): void {
    toggle.style.color = this.alwaysShow ? this.colors.accent : this.colors.textTertiary;
    toggle.style.borderColor = this.alwaysShow ? this.colors.accent : this.colors.border;
    toggle.style.background = this.alwaysShow ? this.colors.accentLight : this.colors.glassBgHeavy;
  }

  private show(index: number): void {
    if (this.outlines[index]) return;
    const element = this.elements[index];
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const outline = el("div", {
      style: `
        position:absolute;
        top:${rect.top + window.scrollY}px; left:${rect.left + window.scrollX}px;
        width:${rect.width}px; height:${rect.height}px;
        border:2px solid ${this.colors.accent};
        background:${this.colors.accent}14;
        border-radius:8px;
        box-shadow:0 0 16px ${this.colors.accentGlow};
        pointer-events:none;
      `,
    });
    this.container.insertBefore(outline, this.container.firstChild);
    this.outlines[index] = outline;
  }

  private hide(index: number): void {
    this.outlines[index]?.remove();
    this.outlines[index] = null;
  }

  private showAll(): void {
    this.elements.forEach((_, index) => {
      this.show(index);
    });
  }

  private hideAllOutlines(): void {
    this.elements.forEach((_, index) => {
      this.hide(index);
    });
  }

  private setAlwaysShow(always: boolean): void {
    this.alwaysShow = always;
    saveAlwaysShow(always);
    if (always) this.showAll();
    else this.hideAllOutlines();
  }

  destroy(): void {
    this.container.remove();
  }
}
