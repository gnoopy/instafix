/**
 * Numbered on-page badges shown while composing a multi-select (marquee)
 * annotation — before submission (G8). Lets the user confirm which numbered
 * target maps to which region: hovering (or focusing) a badge outlines the
 * corresponding element; an "always show" toggle keeps every outline visible
 * without needing to hover, and persists across sessions.
 *
 * Also offers a live "요약/상세" (summary/detail) resolution toggle: summary
 * is the collapsed one-target-per-visually-distinct-group view
 * (`collectMarqueeElements`), detail is the full nested container → component
 * chain (`collectMarqueeElementsDetailed`) — both computed once up front by
 * the caller and handed in together, switched between without re-hit-testing.
 *
 * Lives outside Shadow DOM (like the popup and annotator overlay) so it can
 * be positioned in page-absolute coordinates over arbitrary host content.
 */

import { Z_INDEX_MAX } from "./constants.js";
import { el, setText } from "./dom-utils.js";
import type { TFunction } from "./i18n/index.js";
import { tWithParams } from "./i18n/index.js";
import type { ThemeColors } from "./styles/theme.js";

const ALWAYS_SHOW_KEY = "instafix_target_preview_always_show";

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

/** The two live views of the same drag — "요약" (collapsed) vs "상세" (full nested chain). */
export type PreviewResolution = "summary" | "detail";

export interface PreviewResolutionSets {
  summary: readonly Element[];
  detail: readonly Element[];
}

export class MultiTargetPreview {
  private container: HTMLElement;
  private badges: HTMLButtonElement[] = [];
  private outlines: Array<HTMLElement | null> = [];
  private alwaysShow: boolean;
  private resolution: PreviewResolution = "summary";
  private readonly resolutionSummaryBtn: HTMLButtonElement;
  private readonly resolutionDetailBtn: HTMLButtonElement;

  /** Elements currently shown, per the active resolution. */
  private get elements(): readonly Element[] {
    return this.resolutionSets[this.resolution];
  }

  constructor(
    private readonly colors: ThemeColors,
    private readonly resolutionSets: PreviewResolutionSets,
    private readonly t: TFunction,
    /** Anchors the toggle chips near the drawn selection. */
    anchorRect: DOMRect,
    /** Notified whenever the summary/detail resolution changes, with the newly-active element list. */
    private readonly onResolutionChange: (resolution: PreviewResolution, elements: readonly Element[]) => void,
  ) {
    this.alwaysShow = loadAlwaysShow();

    this.container = el("div", {
      style: `position:absolute; inset:0; pointer-events:none; z-index:${Z_INDEX_MAX};`,
    });
    document.body.appendChild(this.container);

    const alwaysShowToggle = this.buildAlwaysShowToggle(anchorRect);
    const [resolutionToggle, summaryBtn, detailBtn] = this.buildResolutionToggle(anchorRect);
    this.resolutionSummaryBtn = summaryBtn;
    this.resolutionDetailBtn = detailBtn;
    this.container.appendChild(alwaysShowToggle);
    // Only offer the resolution toggle when the two views actually differ —
    // a drag where every containment group only ever had one candidate has
    // nothing to toggle between.
    if (this.resolutionSets.detail.length > 1 || this.resolutionSets.summary.length > 1) {
      this.container.appendChild(resolutionToggle);
    }

    this.rebuildBadges();
  }

  /**
   * (Re)build badges/outlines from the currently-active resolution's element
   * list. Outline cleanup removes DOM nodes directly rather than going
   * through `hide(index)` — the old `this.outlines` array is indexed against
   * the PREVIOUS resolution's element count, which can differ from the new
   * one, so index-based lookups would be wrong mid-switch.
   */
  private rebuildBadges(): void {
    for (const badge of this.badges) badge.remove();
    this.badges = [];
    for (const outline of this.outlines) outline?.remove();
    this.outlines = this.elements.map(() => null);

    this.elements.forEach((element, index) => {
      const badge = this.buildBadge(element, index);
      this.badges.push(badge);
      this.container.appendChild(badge);
    });

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

  private buildAlwaysShowToggle(anchorRect: DOMRect): HTMLElement {
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
    this.applyAlwaysShowToggleState(toggle);
    toggle.addEventListener("click", () => {
      this.setAlwaysShow(!this.alwaysShow);
      toggle.setAttribute("aria-pressed", String(this.alwaysShow));
      this.applyAlwaysShowToggleState(toggle);
    });
    return toggle;
  }

  private applyAlwaysShowToggleState(toggle: HTMLElement): void {
    toggle.style.color = this.alwaysShow ? this.colors.accent : this.colors.textTertiary;
    toggle.style.borderColor = this.alwaysShow ? this.colors.accent : this.colors.border;
    toggle.style.background = this.alwaysShow ? this.colors.accentLight : this.colors.glassBgHeavy;
  }

  /**
   * "요약/상세" (summary/detail) resolution pill — a named 2-choice, modeled
   * on `popup.ts`'s smallest/largest target-size toggle rather than the
   * boolean `aria-pressed` pill above. Live: switching rebuilds the badge set
   * from the OTHER already-computed element list, no re-hit-testing.
   */
  private buildResolutionToggle(anchorRect: DOMRect): [HTMLElement, HTMLButtonElement, HTMLButtonElement] {
    const wrap = el("div", {
      style: `
        position:absolute;
        top:${anchorRect.top + window.scrollY - 64}px;
        left:${anchorRect.left + window.scrollX}px;
        display:flex;border-radius:9999px;padding:2px;gap:2px;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBgHeavy};
        pointer-events:auto;
      `,
    });
    const makeBtn = (): HTMLButtonElement => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = `
        border:none;border-radius:9999px;padding:3px 10px;cursor:pointer;
        font-family:"Inter",system-ui,-apple-system,sans-serif;
        font-size:11px;font-weight:600;
        transition:background 0.15s ease,color 0.15s ease;
      `;
      return btn;
    };
    const summaryBtn = makeBtn();
    const detailBtn = makeBtn();
    setText(summaryBtn, this.t("annotator.resolutionSummary"));
    setText(detailBtn, this.t("annotator.resolutionDetail"));
    summaryBtn.setAttribute(
      "aria-label",
      `${this.t("annotator.resolutionLabel")}: ${this.t("annotator.resolutionSummary")}`,
    );
    detailBtn.setAttribute(
      "aria-label",
      `${this.t("annotator.resolutionLabel")}: ${this.t("annotator.resolutionDetail")}`,
    );
    summaryBtn.addEventListener("click", () => this.selectResolution("summary"));
    detailBtn.addEventListener("click", () => this.selectResolution("detail"));
    wrap.appendChild(summaryBtn);
    wrap.appendChild(detailBtn);
    this.renderResolutionButtons(summaryBtn, detailBtn);
    return [wrap, summaryBtn, detailBtn];
  }

  private selectResolution(resolution: PreviewResolution): void {
    if (this.resolution === resolution) return;
    this.resolution = resolution;
    this.renderResolutionButtons(this.resolutionSummaryBtn, this.resolutionDetailBtn);
    this.rebuildBadges();
    this.onResolutionChange(resolution, this.elements);
  }

  private renderResolutionButtons(summaryBtn: HTMLButtonElement, detailBtn: HTMLButtonElement): void {
    for (const [btn, resolution] of [
      [summaryBtn, "summary"],
      [detailBtn, "detail"],
    ] as const) {
      const isActive = this.resolution === resolution;
      btn.style.background = isActive ? this.colors.accentLight : "transparent";
      btn.style.color = isActive ? this.colors.accent : this.colors.textTertiary;
      btn.setAttribute("aria-pressed", String(isActive));
    }
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
