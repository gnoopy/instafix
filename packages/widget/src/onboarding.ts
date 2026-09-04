import { Z_INDEX_MAX } from "./constants.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import type { TFunction, TranslationKey } from "./i18n/index.js";
import { tWithParams } from "./i18n/index.js";
import { ICON_CLOSE } from "./icons.js";

const STORAGE_KEY = "instafix_onboarding_seen";

/** Whether the first-use coachmark has already been shown (or storage says to skip it). */
export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Storage unavailable (private mode, disabled) — fail closed, don't nag every load.
    return true;
  }
}

function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Best-effort only; the tour still won't re-show within this session either way.
  }
}

interface Step {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const STEPS: readonly Step[] = [
  { titleKey: "onboarding.step1Title", bodyKey: "onboarding.step1Body" },
  { titleKey: "onboarding.step2Title", bodyKey: "onboarding.step2Body" },
  { titleKey: "onboarding.step3Title", bodyKey: "onboarding.step3Body" },
];

export const ONBOARDING_CSS = /* css */ `
  .sp-onboarding {
    position: fixed;
    z-index: ${Z_INDEX_MAX};
    width: 260px;
    padding: 16px 18px 14px;
    border-radius: 16px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    font-family: var(--sp-font);
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-onboarding--visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .sp-onboarding-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sp-onboarding-close:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-onboarding-close svg {
    width: 12px;
    height: 12px;
  }

  .sp-onboarding-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--sp-text);
    margin: 0 20px 6px 0;
  }

  .sp-onboarding-body {
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--sp-text-secondary);
    margin-bottom: 14px;
  }

  .sp-onboarding-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .sp-onboarding-progress {
    font-size: 11px;
    color: var(--sp-text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .sp-onboarding-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-onboarding-skip {
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
  }

  .sp-onboarding-skip:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-onboarding-next {
    border: none;
    background: var(--sp-accent);
    color: var(--sp-accent-fg, #fff);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 8px;
  }

  .sp-onboarding-next:hover {
    filter: brightness(1.05);
  }

  @media (prefers-reduced-motion: reduce) {
    .sp-onboarding {
      transition-duration: 0.01ms !important;
    }
  }

  @media (forced-colors: active) {
    .sp-onboarding {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: CanvasText !important;
    }
    .sp-onboarding-title,
    .sp-onboarding-body,
    .sp-onboarding-progress {
      color: CanvasText !important;
    }
    .sp-onboarding-next {
      border: 1px solid ButtonText !important;
      background: ButtonFace !important;
      color: ButtonText !important;
    }
    .sp-onboarding-skip,
    .sp-onboarding-close {
      border: 1px solid ButtonText !important;
    }
  }
`;

/**
 * First-use-only coachmark anchored near the FAB — at most 3 steps
 * (G8 "3단계 이내 onboarding"), shown once ever via `hasSeenOnboarding()`.
 *
 * Not a true modal: the page stays interactive underneath. Tab is trapped
 * between the two footer buttons + close button while the card is open, and
 * focus is restored to the FAB when the tour ends (finished, skipped, or
 * dismissed via Escape).
 */
export class Onboarding {
  readonly element: HTMLElement;

  private readonly titleEl: HTMLElement;
  private readonly bodyEl: HTMLElement;
  private readonly progressEl: HTMLElement;
  private readonly nextBtn: HTMLButtonElement;
  private readonly skipBtn: HTMLButtonElement;
  private readonly closeBtn: HTMLButtonElement;
  private readonly onKeydown: (e: KeyboardEvent) => void;
  private stepIndex = 0;
  private finished = false;

  constructor(
    shadowRoot: ShadowRoot,
    private readonly t: TFunction,
    private readonly anchor: HTMLElement,
    private readonly alignRight: boolean,
  ) {
    this.element = el("div", { class: "sp-onboarding" });
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-label", this.t("onboarding.step1Title"));

    this.closeBtn = document.createElement("button");
    this.closeBtn.type = "button";
    this.closeBtn.className = "sp-onboarding-close";
    this.closeBtn.setAttribute("aria-label", this.t("onboarding.skip"));
    this.closeBtn.appendChild(parseSvg(ICON_CLOSE));
    this.closeBtn.addEventListener("click", () => this.finish());
    this.element.appendChild(this.closeBtn);

    this.titleEl = el("div", { class: "sp-onboarding-title" });
    this.bodyEl = el("div", { class: "sp-onboarding-body" });
    this.element.appendChild(this.titleEl);
    this.element.appendChild(this.bodyEl);

    const footer = el("div", { class: "sp-onboarding-footer" });
    this.progressEl = el("span", { class: "sp-onboarding-progress" });
    footer.appendChild(this.progressEl);

    const actions = el("div", { class: "sp-onboarding-actions" });
    this.skipBtn = document.createElement("button");
    this.skipBtn.type = "button";
    this.skipBtn.className = "sp-onboarding-skip";
    setText(this.skipBtn, this.t("onboarding.skip"));
    this.skipBtn.addEventListener("click", () => this.finish());

    this.nextBtn = document.createElement("button");
    this.nextBtn.type = "button";
    this.nextBtn.className = "sp-onboarding-next";
    this.nextBtn.addEventListener("click", () => this.advance());

    actions.appendChild(this.skipBtn);
    actions.appendChild(this.nextBtn);
    footer.appendChild(actions);
    this.element.appendChild(footer);

    shadowRoot.appendChild(this.element);

    this.onKeydown = (e: KeyboardEvent) => this.handleKeydown(e);
    document.addEventListener("keydown", this.onKeydown, true);

    this.renderStep();
    this.position();

    requestAnimationFrame(() => {
      this.element.classList.add("sp-onboarding--visible");
      this.nextBtn.focus();
    });
  }

  private renderStep(): void {
    const step = STEPS[this.stepIndex];
    if (!step) return;
    setText(this.titleEl, this.t(step.titleKey));
    setText(this.bodyEl, this.t(step.bodyKey));
    setText(
      this.progressEl,
      tWithParams(this.t, "onboarding.progress", { current: this.stepIndex + 1, total: STEPS.length }),
    );
    const isLast = this.stepIndex === STEPS.length - 1;
    setText(this.nextBtn, this.t(isLast ? "onboarding.done" : "onboarding.next"));
  }

  private advance(): void {
    if (this.stepIndex >= STEPS.length - 1) {
      this.finish();
      return;
    }
    this.stepIndex += 1;
    this.renderStep();
    this.position();
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (this.finished) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      this.finish();
      return;
    }
    if (e.key !== "Tab") return;
    // Resolve activeElement through the card's own root — `document.activeElement`
    // only ever reports the shadow host, never an element inside the shadow tree.
    const root = this.element.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    // Only trap while focus is actually inside the card — clicking elsewhere
    // on the (non-modal) page should not be fought.
    if (!active || !this.element.contains(active)) return;

    const focusable = [this.closeBtn, this.skipBtn, this.nextBtn];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private position(): void {
    const anchorRect = this.anchor.getBoundingClientRect();
    const cardRect = this.element.getBoundingClientRect();
    const gap = 14;

    let top = anchorRect.top - cardRect.height - gap;
    if (top < 8) top = anchorRect.bottom + gap;

    let left: number;
    if (this.alignRight) {
      left = anchorRect.right - cardRect.width;
    } else {
      left = anchorRect.left;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - cardRect.width - 8));

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  /** End the tour (finished, skipped, or Escape) — marks it seen and restores focus to the FAB. */
  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    markOnboardingSeen();
    document.removeEventListener("keydown", this.onKeydown, true);
    this.element.remove();
    this.anchor.focus();
  }

  destroy(): void {
    if (this.finished) return;
    this.finished = true;
    document.removeEventListener("keydown", this.onKeydown, true);
    this.element.remove();
  }
}
