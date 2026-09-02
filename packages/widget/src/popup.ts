import type { FeedbackType } from "@instafix/core";
import { FONT_STACK, Z_INDEX_MAX } from "./constants.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import { clearDraft, loadDraft, saveDraft } from "./draft-storage.js";
import type { TFunction, Translations } from "./i18n/index.js";
import { ICON_BUG, ICON_CHANGE, ICON_OTHER, ICON_QUESTION } from "./icons.js";
import { getTypeBgColor, getTypeColor, type ThemeColors } from "./styles/theme.js";
import { isVoiceInputSupported, type VoiceErrorReason, VoiceInputController, type VoiceState } from "./voice.js";

const ICON_MIC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
const ICON_MIC_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

const VOICE_ERROR_KEYS: Record<VoiceErrorReason, keyof Translations> = {
  "permission-denied": "voice.error.permissionDenied",
  "no-speech": "voice.error.noSpeech",
  "audio-capture": "voice.error.audioCapture",
  network: "voice.error.network",
  aborted: "voice.error.aborted",
  unknown: "voice.error.unknown",
};

// Map each feedback type to its translation key, so `refreshLabels()` can
// re-localize the existing type buttons without re-rendering the popup.
const TYPE_LABEL_KEYS: Record<FeedbackType, keyof Translations> = {
  question: "type.question",
  change: "type.change",
  bug: "type.bug",
  other: "type.other",
};

/**
 * Detect whether the host platform uses ⌘+Enter (macOS) vs Ctrl+Enter.
 * Resolved at call time so we can recompute the popup hint when the locale
 * dictionary lands.
 */
function isMacPlatform(): boolean {
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  return uaData
    ? uaData.platform === "macOS"
    : (navigator.platform?.includes("Mac") ?? /Macintosh|Mac OS X/i.test(navigator.userAgent));
}

interface PopupResult {
  type: FeedbackType;
  message: string;
}

interface TypeOption {
  type: FeedbackType;
  icon: string;
}

/**
 * Optional async hook called when the user clicks "Send". While the returned
 * promise is pending the popup stays visible in a submitting state (spinner
 * on the submit button, every other control disabled). On resolution the
 * popup closes and `show()` resolves with the submitted result; on rejection
 * the popup restores so the user can retry without re-entering the form.
 */
type PopupSubmitHandler = (result: PopupResult) => Promise<void>;

/** Which of the two right-click target candidates (G8) is currently active. */
export type TargetSizeChoice = "smallest" | "largest";

/**
 * Offered only for right-click instant annotations where the deepest element
 * under the cursor and its nearest reasonably-sized container genuinely
 * differ — lets the user pick "this element" vs. "this container" instead of
 * guessing which one a single hit-test would have anchored to.
 */
export interface TargetSizeOptions {
  initial: TargetSizeChoice;
  onChange: (choice: TargetSizeChoice) => void;
}

/**
 * Popup form shown after drawing an annotation rectangle.
 *
 * Glassmorphism design: frosted glass background, soft shadows,
 * pill-shaped type buttons, gradient submit button.
 * Lives outside Shadow DOM.
 */
export class Popup {
  private root: HTMLElement;
  private selectedType: FeedbackType | null = null;
  private textarea: HTMLTextAreaElement;
  private submitBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;
  private typeRow: HTMLElement;
  private submitLabel: HTMLSpanElement;
  private hint: HTMLElement;
  private resolve: ((result: PopupResult | null) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;
  /** Selection rect the open popup is anchored to — kept so `positionPopup()` can re-clamp after content changes its height (legend). */
  private lastAnchorRect: DOMRect | null = null;
  private onKeydownTrap: ((e: KeyboardEvent) => void) | null = null;
  private onSubmit: PopupSubmitHandler | null = null;
  private submittingState = false;
  /** WAAPI handle for the running spinner — cancelled when submitting ends. */
  private spinnerAnimation: Animation | null = null;

  // --- G5 voice input ---
  private voiceController: VoiceInputController | null = null;
  private micBtn: HTMLButtonElement | null = null;
  private voiceStatusEl: HTMLElement | null = null;
  private voiceUnsubs: Array<() => void> = [];
  /** Textarea value at the moment listening started — voice text is appended after this, never overwrites it. */
  private voiceBaseText = "";
  /** Finalized transcript accumulated so far in the current listening session. */
  private voiceFinalSoFar = "";
  /** True only while `applyVoiceTranscript` itself is writing `textarea.value` — lets the `input` listener tell a voice-driven update apart from the user typing. */
  private settingTextProgrammatically = false;

  // --- G7 draft recovery ---
  private draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private draftBanner: HTMLElement | null = null;
  private draftLabelEl: HTMLElement | null = null;
  private draftDiscardBtn: HTMLButtonElement | null = null;

  // --- G8 right-click target-size picker ---
  private targetSizeRow: HTMLElement;
  private targetLabelEl: HTMLElement;
  private targetSmallestBtn: HTMLButtonElement;
  private targetLargestBtn: HTMLButtonElement;
  private targetSizeChoice: TargetSizeChoice = "smallest";
  private targetSizeOnChange: ((choice: TargetSizeChoice) => void) | null = null;

  // --- Marquee multi-target legend — numbered targets set imperatively via
  // setLegend(), so a developer typing the comment can refer to "2번" etc.
  // without hunting for the tiny on-page badge.
  private legendRow: HTMLElement;
  private legendHeadingEl: HTMLElement;
  private legendListEl: HTMLElement;

  /**
   * True from `show()` until its promise settles — through typing, the
   * in-flight `onSubmit` await, AND the failed-submit retry window. The
   * annotator's drawing guards read this to serialize popup sessions
   * (#114/#196): if a refactor ever nulls `resolve` before `onSubmit`
   * settles, those guards die silently — popup.test.ts pins the lifecycle.
   */
  get isOpen(): boolean {
    return this.resolve !== null;
  }

  constructor(
    private readonly colors: ThemeColors,
    private readonly t: TFunction,
  ) {
    this.root = el("div", {
      style: `
        position:fixed;
        z-index:${Z_INDEX_MAX};
        width:300px;
        padding:16px;
        border-radius:16px;
        background:${this.colors.glassBg};
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:1px solid ${this.colors.glassBorder};
        box-shadow:0 8px 32px ${this.colors.shadow}, 0 2px 8px ${this.colors.shadow};
        font-family:${FONT_STACK};
        opacity:0;
        transform:translateY(8px) scale(0.98);
        transition:opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display:none;
        -webkit-font-smoothing:antialiased;
      `,
    });

    this.root.setAttribute("role", "dialog");
    this.root.setAttribute("aria-modal", "true");
    // Screenshot capture now runs while the popup is still visible (so the
    // spinner can show during the upload). Without this attribute the popup
    // would appear baked into the captured JPEG.
    this.root.setAttribute("data-instafix-ignore", "true");
    // The dialog `aria-label` is bound by `applyLabels()` at the end of the
    // constructor, alongside every other `t()`-derived string.

    // Right-click target-size picker (G8) — hidden by default, shown by
    // `show()` only when the smallest/largest candidates genuinely differ.
    this.targetSizeRow = el("div", {
      style: "display:none;align-items:center;gap:6px;margin-bottom:10px;",
    });
    this.targetLabelEl = el("span", {
      style: `font-size:11px;color:${this.colors.textTertiary};font-family:${FONT_STACK};flex-shrink:0;`,
    });
    const targetToggle = el("div", {
      style: `display:flex;border-radius:9999px;border:1px solid ${this.colors.border};padding:2px;gap:2px;`,
    });
    const makeTargetBtn = (): HTMLButtonElement => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = `
        border:none;border-radius:9999px;padding:3px 10px;cursor:pointer;
        font-family:${FONT_STACK};
        font-size:11px;font-weight:600;
        transition:background 0.15s ease,color 0.15s ease;
      `;
      return btn;
    };
    this.targetSmallestBtn = makeTargetBtn();
    this.targetSmallestBtn.addEventListener("click", () => this.selectTargetSize("smallest"));
    this.targetLargestBtn = makeTargetBtn();
    this.targetLargestBtn.addEventListener("click", () => this.selectTargetSize("largest"));
    targetToggle.appendChild(this.targetSmallestBtn);
    targetToggle.appendChild(this.targetLargestBtn);
    this.targetSizeRow.appendChild(this.targetLabelEl);
    this.targetSizeRow.appendChild(targetToggle);

    // Marquee multi-target legend — hidden by default, populated by
    // setLegend() right after the annotator opens the popup for a
    // multi-target marquee selection (summary or detail resolution).
    this.legendRow = el("div", {
      style: "display:none;flex-direction:column;gap:4px;margin-bottom:10px;",
    });
    this.legendHeadingEl = el("span", {
      style: `font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.02em;color:${this.colors.textTertiary};`,
    });
    this.legendListEl = el("div", { style: "display:flex;flex-wrap:wrap;gap:4px 10px;" });
    this.legendRow.appendChild(this.legendHeadingEl);
    this.legendRow.appendChild(this.legendListEl);

    // Type selector grid (2x2). Labels are bound later by `applyLabels()` —
    // the constructor only builds the structure (icon + empty label span).
    const typeOptions: TypeOption[] = [
      { type: "question", icon: ICON_QUESTION },
      { type: "change", icon: ICON_CHANGE },
      { type: "bug", icon: ICON_BUG },
      { type: "other", icon: ICON_OTHER },
    ];
    this.typeRow = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;" });
    for (const option of typeOptions) {
      const btn = document.createElement("button");
      btn.style.cssText = `
        height:44px;
        border-radius:9999px;border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:5px;
        font-family:${FONT_STACK};
        font-size:13px;font-weight:500;color:${this.colors.textTertiary};
        transition:all 0.2s ease;
        padding:0 12px;
      `;
      const icon = parseSvg(option.icon);
      icon.setAttribute("style", "width:13px;height:13px;flex-shrink:0;");
      btn.appendChild(icon);
      btn.appendChild(document.createElement("span"));
      btn.dataset.type = option.type;
      btn.setAttribute("aria-pressed", "false");

      btn.addEventListener("click", () => {
        if (this.submittingState) return;
        this.selectType(option.type, this.typeRow);
      });

      btn.addEventListener("mouseenter", () => {
        if (this.submittingState) return;
        if (btn.dataset.type !== this.selectedType) {
          const bgColor = getTypeBgColor(btn.dataset.type ?? "", this.colors);
          btn.style.background = bgColor;
          btn.style.borderColor = getTypeColor(btn.dataset.type ?? "", this.colors) + "40";
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (this.submittingState) return;
        if (btn.dataset.type !== this.selectedType) {
          btn.style.background = this.colors.glassBg;
          btn.style.borderColor = this.colors.border;
        }
      });

      this.typeRow.appendChild(btn);
    }

    // Draft-restored banner (G7) — hidden by default, shown by show() when a
    // recoverable draft exists for the current page.
    this.draftBanner = el("div", {
      style: `
        display:none;
        align-items:center;justify-content:space-between;gap:8px;
        margin-bottom:8px;padding:6px 10px;
        border-radius:8px;
        background:${this.colors.accentLight};
        color:${this.colors.accent};
        font-family:${FONT_STACK};
        font-size:11px;font-weight:500;
      `,
    });
    const draftLabel = el("span");
    const discardBtn = document.createElement("button");
    discardBtn.type = "button";
    discardBtn.style.cssText = `
      border:none;background:none;color:${this.colors.accent};
      font-family:${FONT_STACK};
      font-size:11px;font-weight:600;text-decoration:underline;
      cursor:pointer;padding:0;flex-shrink:0;
    `;
    discardBtn.addEventListener("click", () => {
      this.textarea.value = "";
      clearDraft();
      this.hideDraftBanner();
      this.updateSubmitState();
      this.textarea.focus();
    });
    this.draftBanner.appendChild(draftLabel);
    this.draftBanner.appendChild(discardBtn);
    this.draftLabelEl = draftLabel;
    this.draftDiscardBtn = discardBtn;

    // Textarea
    this.textarea = document.createElement("textarea");
    this.textarea.style.cssText = `
      width:100%;min-height:72px;max-height:152px;
      padding:10px 12px;border-radius:12px;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBgHeavy};
      color:${this.colors.text};font-family:${FONT_STACK};
      font-size:13px;line-height:1.5;resize:vertical;
      outline:none;transition:all 0.2s ease;
      box-sizing:border-box;
    `;
    this.textarea.maxLength = 5000;

    // Keyboard shortcut hint
    this.hint = el("div", {
      style: `
        font-size:11px;color:${this.colors.textTertiary};
        text-align:right;margin-top:4px;
        font-family:${FONT_STACK};
        letter-spacing:0.01em;
      `,
    });

    // Voice input row (G5) — mic toggle + live status caption. Only rendered
    // when the browser exposes the Web Speech API at all (cheap, synchronous
    // check — no permission prompt, no recognition object created yet).
    const hintRow = el("div", { style: "display:flex;align-items:center;justify-content:space-between;gap:8px;" });
    if (isVoiceInputSupported()) {
      const voiceRow = el("div", { style: "display:flex;align-items:center;gap:6px;min-width:0;" });

      const micBtn = document.createElement("button");
      micBtn.type = "button";
      micBtn.dataset.role = "sp-mic-btn";
      micBtn.style.cssText = `
        width:26px;height:26px;flex-shrink:0;border-radius:9999px;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};color:${this.colors.textTertiary};
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        padding:0;transition:all 0.2s ease;
      `;
      micBtn.appendChild(parseSvg(ICON_MIC));
      micBtn.addEventListener("click", () => this.toggleVoice());
      this.micBtn = micBtn;

      this.voiceStatusEl = el("span", {
        style: `
          font-size:11px;color:${this.colors.textTertiary};
          font-family:${FONT_STACK};
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        `,
      });
      this.voiceStatusEl.dataset.role = "sp-voice-status";
      this.voiceStatusEl.setAttribute("role", "status");
      this.voiceStatusEl.setAttribute("aria-live", "polite");

      voiceRow.appendChild(micBtn);
      voiceRow.appendChild(this.voiceStatusEl);
      hintRow.appendChild(voiceRow);
      this.applyVoiceState("idle");
    } else {
      // Keep the hint right-aligned via the flex row even when no mic renders.
      hintRow.appendChild(el("span"));
    }
    hintRow.appendChild(this.hint);

    this.textarea.addEventListener("focus", () => {
      if (this.submittingState) return;
      this.textarea.style.borderColor = this.colors.accent;
      this.textarea.style.boxShadow = `0 0 0 3px ${this.colors.accent}14`;
      this.textarea.style.background = this.colors.bg;
    });
    this.textarea.addEventListener("blur", () => {
      if (this.submittingState) return;
      this.textarea.style.borderColor = this.colors.border;
      this.textarea.style.boxShadow = "none";
      this.textarea.style.background = this.colors.glassBgHeavy;
    });
    this.textarea.addEventListener("input", () => {
      this.updateSubmitState();
      this.scheduleDraftSave();
      // The user typed/pasted directly (not our own voice-driven write) while
      // listening was active — re-baseline so the NEXT voice segment appends
      // after their edit instead of clobbering it on the next transcript event.
      if (!this.settingTextProgrammatically && this.voiceController?.currentState === "listening") {
        this.voiceBaseText = this.textarea.value;
        this.voiceFinalSoFar = "";
      }
    });
    this.textarea.addEventListener("keydown", (e) => {
      if (this.submittingState) return;
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.submit();
      }
      if (e.key === "Escape") {
        this.cancel();
      }
    });

    // Button row
    const btnRow = el("div", { style: "display:flex;justify-content:flex-end;gap:8px;margin-top:12px;" });

    this.cancelBtn = document.createElement("button");
    this.cancelBtn.style.cssText = `
      height:34px;padding:0 16px;border-radius:9999px;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBg};
      color:${this.colors.textTertiary};font-family:${FONT_STACK};
      font-size:13px;font-weight:500;cursor:pointer;
      transition:all 0.2s ease;
    `;
    this.cancelBtn.addEventListener("click", () => this.cancel());
    this.cancelBtn.addEventListener("mouseenter", () => {
      if (this.submittingState) return;
      this.cancelBtn.style.borderColor = this.colors.accent;
      this.cancelBtn.style.color = this.colors.accent;
    });
    this.cancelBtn.addEventListener("mouseleave", () => {
      if (this.submittingState) return;
      this.cancelBtn.style.borderColor = this.colors.border;
      this.cancelBtn.style.color = this.colors.textTertiary;
    });

    this.submitBtn = document.createElement("button");
    this.submitBtn.style.cssText = `
      height:34px;padding:0 18px;border-radius:9999px;
      border:none;background:${this.colors.accentGradient};
      color:#fff;font-family:${FONT_STACK};
      font-size:13px;font-weight:600;cursor:pointer;
      opacity:0.35;pointer-events:none;
      transition:all 0.2s ease;
      box-shadow:0 2px 8px ${this.colors.accentGlow};
      display:inline-flex;align-items:center;justify-content:center;min-width:64px;
    `;
    // The submit label lives in its own <span> so the submitting-state spinner
    // can be appended/removed without disturbing it. `applyLabels()` binds its
    // text — never `setText` the button itself or it would wipe the spinner.
    this.submitLabel = document.createElement("span");
    this.submitBtn.appendChild(this.submitLabel);
    this.submitBtn.addEventListener("click", () => this.submit());

    btnRow.appendChild(this.cancelBtn);
    btnRow.appendChild(this.submitBtn);

    this.root.appendChild(this.targetSizeRow);
    this.root.appendChild(this.typeRow);
    this.root.appendChild(this.legendRow);
    if (this.draftBanner) this.root.appendChild(this.draftBanner);
    this.root.appendChild(this.textarea);
    this.root.appendChild(hintRow);
    this.root.appendChild(btnRow);
    document.body.appendChild(this.root);

    // Bind every `t()`-derived string into the freshly-built DOM. Kept as a
    // single pass so the constructor and `refreshLabels()` never drift.
    this.applyLabels();
  }

  /**
   * Re-read every `t(...)`-derived label, placeholder, and aria-label from
   * the active translation function. Idempotent — call after the locale
   * dictionary has finished loading so the popup swaps from the English
   * fallback to the configured language.
   */
  refreshLabels(): void {
    this.applyLabels();
  }

  /**
   * Walk the already-built DOM and bind every translation-derived string —
   * the dialog `aria-label`, the four type-button labels, the textarea
   * `placeholder` + `aria-label`, the `⌘+Enter` / `Ctrl+Enter` hint, and the
   * cancel/submit `textContent`. The single source of truth for which node
   * gets which `t()` string, shared by the constructor and `refreshLabels()`
   * so the two can never drift.
   */
  private applyLabels(): void {
    this.root.setAttribute("aria-label", this.t("popup.ariaLabel"));

    const typeButtons = this.root.querySelectorAll<HTMLButtonElement>("button[data-type]");
    for (const btn of typeButtons) {
      const type = btn.dataset.type as FeedbackType | undefined;
      if (!type) continue;
      const key = TYPE_LABEL_KEYS[type];
      if (!key) continue;
      const labelSpan = btn.querySelector<HTMLSpanElement>("span");
      if (labelSpan) setText(labelSpan, this.t(key));
    }

    this.textarea.placeholder = this.t("popup.placeholder");
    this.textarea.setAttribute("aria-label", this.t("popup.textareaAria"));

    setText(this.hint, isMacPlatform() ? this.t("popup.submitHintMac") : this.t("popup.submitHintOther"));
    setText(this.cancelBtn, this.t("popup.cancel"));
    // Target the label <span>, not the button — the button also hosts the
    // submitting-state spinner, which `setText` on the button would erase.
    setText(this.submitLabel, this.t("popup.submit"));

    if (this.micBtn) this.applyVoiceState(this.voiceController?.currentState ?? "idle");
    if (this.draftLabelEl) setText(this.draftLabelEl, this.t("popup.draftRestored"));
    if (this.draftDiscardBtn) setText(this.draftDiscardBtn, this.t("popup.discardDraft"));

    setText(this.targetLabelEl, this.t("popup.targetLabel"));
    setText(this.targetSmallestBtn, this.t("popup.targetElement"));
    setText(this.targetLargestBtn, this.t("popup.targetContainer"));
    this.targetSmallestBtn.setAttribute(
      "aria-label",
      `${this.t("popup.targetLabel")}: ${this.t("popup.targetElement")}`,
    );
    this.targetLargestBtn.setAttribute(
      "aria-label",
      `${this.t("popup.targetLabel")}: ${this.t("popup.targetContainer")}`,
    );

    setText(this.legendHeadingEl, this.t("popup.legendLabel"));
  }

  /**
   * Set (or clear) the numbered-target legend — called by the annotator
   * right after `show()` for a multi-target marquee selection, and again
   * whenever the summary/detail resolution toggle changes. Entries come from
   * data already computed while building each resolution's annotation
   * payloads (anchor tag/text snippet), so this is pure DOM writes, no
   * re-hit-testing.
   */
  setLegend(entries: ReadonlyArray<{ number: number; label: string }>): void {
    this.legendListEl.replaceChildren();
    if (entries.length === 0) {
      this.legendRow.style.display = "none";
      return;
    }
    for (const entry of entries) {
      const item = el("span", {
        style: `font-size:11px;color:${this.colors.textTertiary};font-family:${FONT_STACK};white-space:nowrap;`,
      });
      setText(item, `${entry.number}. ${entry.label}`);
      this.legendListEl.appendChild(item);
    }
    this.legendRow.style.display = "flex";
    // The legend just grew the popup — re-clamp so the Send button can't
    // slip below the viewport. Called synchronously right after show() in
    // practice, so this never visibly jumps under the user.
    if (this.isOpen && this.root.style.display === "block") this.positionPopup();
  }

  /**
   * Place the popup near the anchored selection, fully inside the viewport.
   * Measures the REAL rendered size (display must already be "block") —
   * fixed size guesses drifted from the actual composer (target-size row,
   * legend, identity fields all change it), which let the Send button land
   * below the fold when the selection sat near the bottom edge.
   * Prefer below the selection; flip above when below doesn't fit; clamp as
   * the last resort (both, plus the horizontal edges).
   */
  private positionPopup(): void {
    const rectBounds = this.lastAnchorRect;
    if (!rectBounds) return;

    const popupH = this.root.offsetHeight || 220;
    const popupW = this.root.offsetWidth || 300;
    let top = rectBounds.bottom + 8;
    let left = rectBounds.left;

    // Vertical: prefer below; fall back to above; otherwise clamp inside viewport
    if (top + popupH > window.innerHeight - 8) {
      const aboveTop = rectBounds.top - popupH - 8;
      if (aboveTop >= 8) {
        top = aboveTop;
      } else {
        // Selection is taller than the viewport allows on either side —
        // clamp to keep the popup (and its Send button) fully visible.
        top = window.innerHeight - popupH - 8;
      }
    }
    // Collision: flip right if not enough space on left
    if (left + popupW > window.innerWidth - 8) {
      left = rectBounds.right - popupW;
    }
    left = Math.max(8, left);
    top = Math.max(8, top);

    this.root.style.top = `${top}px`;
    this.root.style.left = `${left}px`;
  }

  /** Switch the active target-size button and notify the annotator. */
  private selectTargetSize(choice: TargetSizeChoice): void {
    if (this.submittingState) return;
    this.targetSizeChoice = choice;
    this.renderTargetSizeButtons();
    this.targetSizeOnChange?.(choice);
  }

  private renderTargetSizeButtons(): void {
    const active = this.colors.accent;
    const activeBg = this.colors.accentLight;
    for (const [btn, choice] of [
      [this.targetSmallestBtn, "smallest"],
      [this.targetLargestBtn, "largest"],
    ] as const) {
      const isActive = this.targetSizeChoice === choice;
      btn.style.background = isActive ? activeBg : "transparent";
      btn.style.color = isActive ? active : this.colors.textTertiary;
      btn.setAttribute("aria-pressed", String(isActive));
    }
  }

  private showDraftBanner(): void {
    if (this.draftBanner) this.draftBanner.style.display = "flex";
  }

  private hideDraftBanner(): void {
    if (this.draftBanner) this.draftBanner.style.display = "none";
  }

  /**
   * Debounced draft save (G7) — persists the composer's current type +
   * message so a crash, SPA navigation, or reload before Send doesn't lose
   * it. An empty box clears any stored draft instead of persisting nothing.
   */
  private scheduleDraftSave(): void {
    if (this.draftSaveTimer) clearTimeout(this.draftSaveTimer);
    this.draftSaveTimer = setTimeout(() => {
      this.draftSaveTimer = null;
      const message = this.textarea.value;
      if (!message.trim()) {
        clearDraft();
        return;
      }
      saveDraft({
        type: this.selectedType,
        message,
        url: typeof window !== "undefined" ? window.location.pathname : "",
        savedAt: Date.now(),
      });
    }, 500);
  }

  // ---------------------------------------------------------------------------
  // Voice input (G5)
  // ---------------------------------------------------------------------------

  private micAriaLabel(state: VoiceState): string {
    return state === "listening" ? this.t("voice.micLabelListening") : this.t("voice.micLabel");
  }

  private voiceStatusText(state: VoiceState, errorReason?: VoiceErrorReason): string {
    switch (state) {
      case "requesting-permission":
        return this.t("voice.state.requestingPermission");
      case "listening":
        return this.t("voice.state.listening");
      case "processing":
        return this.t("voice.state.processing");
      case "error":
        return this.t(errorReason ? VOICE_ERROR_KEYS[errorReason] : "voice.error.unknown");
      case "unsupported":
        return this.t("voice.state.unsupported");
      default:
        // Idle — a short, always-visible privacy note rather than blank
        // space, so the disclosure is seen before first use (G5) without
        // needing an extra gating click.
        return this.t("voice.consent");
    }
  }

  /**
   * Re-render the mic button + status caption for a state (and, for
   * "error", which reason). Icon shape AND text change together with
   * color — state is never color-only (G8).
   */
  private applyVoiceState(state: VoiceState, errorReason?: VoiceErrorReason): void {
    if (!this.micBtn || !this.voiceStatusEl) return;

    if (state === "unsupported") {
      this.micBtn.style.display = "none";
      setText(this.voiceStatusEl, "");
      return;
    }

    this.micBtn.setAttribute("aria-label", this.micAriaLabel(state));
    this.micBtn.setAttribute("aria-pressed", String(state === "listening"));
    setText(this.voiceStatusEl, this.voiceStatusText(state, errorReason));

    const listening = state === "listening";
    const isError = state === "error";
    const busy = state === "requesting-permission" || state === "processing";
    this.micBtn.disabled = busy || this.submittingState;
    this.micBtn.style.cursor = this.micBtn.disabled ? "wait" : "pointer";
    this.micBtn.style.color = listening || isError ? "#ef4444" : this.colors.textTertiary;
    this.micBtn.style.borderColor = listening || isError ? "#ef4444" : this.colors.border;
    this.micBtn.style.background = listening ? "rgba(239,68,68,0.12)" : this.colors.glassBg;
    this.micBtn.replaceChildren(parseSvg(isError ? ICON_MIC_OFF : ICON_MIC));
  }

  private wireVoiceController(): void {
    const controller = this.voiceController;
    if (!controller) return;
    this.voiceUnsubs.push(
      controller.onStateChange((s) => this.applyVoiceState(s)),
      controller.onTranscript((e) => this.applyVoiceTranscript(e)),
      controller.onError((e) => this.applyVoiceState("error", e)),
    );
  }

  private toggleVoice(): void {
    if (this.submittingState) return;
    if (!this.voiceController) {
      this.voiceController = new VoiceInputController();
      this.wireVoiceController();
    }
    const state = this.voiceController.currentState;
    if (state === "listening") {
      this.voiceController.stop();
    } else if (state === "idle" || state === "error") {
      // Explicit user gesture — the only point a permission prompt may appear.
      this.voiceBaseText = this.textarea.value;
      this.voiceFinalSoFar = "";
      this.voiceController.start();
    }
  }

  /**
   * Merge a transcript update into the textarea: finalized text is appended
   * after `voiceBaseText` (whatever was in the box when listening started,
   * or was last re-baselined by a manual edit — see the `input` listener),
   * and the current interim text is appended after that, replaced wholesale
   * on every event rather than accumulated. The user's own typed text is
   * therefore never overwritten by a late-arriving transcript.
   */
  private applyVoiceTranscript(e: { interim: string; finalSegment: string }): void {
    if (e.finalSegment) {
      this.voiceFinalSoFar = this.voiceFinalSoFar ? `${this.voiceFinalSoFar} ${e.finalSegment}` : e.finalSegment;
    }
    const base = this.voiceBaseText;
    const afterFinal = this.voiceFinalSoFar
      ? `${base}${base.length > 0 && !/\s$/.test(base) ? " " : ""}${this.voiceFinalSoFar}`
      : base;
    const next = e.interim
      ? `${afterFinal}${afterFinal.length > 0 && !/\s$/.test(afterFinal) ? " " : ""}${e.interim}`
      : afterFinal;

    this.settingTextProgrammatically = true;
    this.textarea.value = next;
    this.settingTextProgrammatically = false;
    this.updateSubmitState();
    this.scheduleDraftSave();
  }

  /**
   * Show the popup near a drawn rectangle and return the user's input.
   * Returns null if cancelled.
   *
   * When `onSubmit` is provided the popup stays visible while the handler
   * runs — the submit button shows a spinner, every other control is
   * disabled. On success the popup closes; on rejection it restores so the
   * user can retry without re-entering the form.
   *
   * `targetSizeOptions` (G8) offers the "element vs. container" toggle for
   * right-click instant annotations — omitted (or absent) for the draw flow,
   * and omitted by the caller entirely when the two candidates are the same
   * element (nothing to choose between).
   */
  show(
    rectBounds: DOMRect,
    onSubmit?: PopupSubmitHandler,
    targetSizeOptions?: TargetSizeOptions,
  ): Promise<PopupResult | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.onSubmit = onSubmit ?? null;
      this.selectedType = null;
      this.textarea.value = "";
      this.submittingState = false;
      this.resetTypeButtons();
      this.hideDraftBanner();
      this.setLegend([]);

      this.targetSizeOnChange = targetSizeOptions?.onChange ?? null;
      this.targetSizeChoice = targetSizeOptions?.initial ?? "smallest";
      this.targetSizeRow.style.display = targetSizeOptions ? "flex" : "none";
      if (targetSizeOptions) this.renderTargetSizeButtons();

      // Recover an in-progress note (G7) — a crash, SPA navigation, or
      // reload before Send must not lose what was typed. Only offered back
      // for the SAME page it was written on, and only while fresh (see
      // draft-storage.ts); stale/foreign drafts are silently ignored.
      const draft = typeof window !== "undefined" ? loadDraft(window.location.pathname) : null;
      if (draft) {
        this.textarea.value = draft.message;
        if (draft.type) this.selectType(draft.type, this.typeRow);
        this.showDraftBanner();
      }
      this.updateSubmitState();

      // Fresh composer session — stop any lingering listening from a
      // previous draft and reset the voice merge baseline.
      this.voiceBaseText = "";
      this.voiceFinalSoFar = "";
      if (this.voiceController?.currentState === "listening") this.voiceController.stop();
      this.applyVoiceState(this.voiceController?.currentState ?? "idle");

      // Save focus to restore on close
      this.previouslyFocused = document.activeElement as HTMLElement | null;

      this.lastAnchorRect = rectBounds;
      this.root.style.display = "block";
      this.positionPopup();

      // Install focus trap
      this.onKeydownTrap = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          const focusableEls = Array.from(
            this.root.querySelectorAll<HTMLElement>(
              'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );
          if (focusableEls.length === 0) return;
          const first = focusableEls[0];
          const last = focusableEls[focusableEls.length - 1];
          if (!first || !last) return;
          if (e.shiftKey) {
            if (document.activeElement === first || !this.root.contains(document.activeElement)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last || !this.root.contains(document.activeElement)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      this.root.addEventListener("keydown", this.onKeydownTrap);

      // Check prefers-reduced-motion live (not cached at construction time)
      const reduceMotion =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.root.style.transition = reduceMotion ? "none" : "";

      // Trigger animation
      requestAnimationFrame(() => {
        this.root.style.opacity = "1";
        this.root.style.transform = "translateY(0) scale(1)";
        this.textarea.focus();
      });
    });
  }

  private selectType(type: FeedbackType, container: HTMLElement): void {
    this.selectedType = type;
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    for (const btn of buttons) {
      const isActive = btn.dataset.type === type;
      const color = getTypeColor(btn.dataset.type ?? "", this.colors);
      const bgColor = getTypeBgColor(btn.dataset.type ?? "", this.colors);
      btn.style.background = isActive ? bgColor : this.colors.glassBg;
      btn.style.borderColor = isActive ? color + "60" : this.colors.border;
      btn.style.color = isActive ? color : this.colors.textTertiary;
      btn.style.fontWeight = isActive ? "600" : "500";
      btn.setAttribute("aria-pressed", String(isActive));
    }
    this.updateSubmitState();
    this.scheduleDraftSave();
  }

  private resetTypeButtons(): void {
    const buttons = this.root.querySelectorAll<HTMLButtonElement>("button[data-type]");
    for (const btn of buttons) {
      btn.setAttribute("aria-pressed", "false");
      btn.disabled = false;
      btn.style.background = this.colors.glassBg;
      btn.style.borderColor = this.colors.border;
      btn.style.color = this.colors.textTertiary;
      btn.style.fontWeight = "500";
      btn.style.cursor = "pointer";
    }
  }

  private updateSubmitState(): void {
    if (this.submittingState) return;
    const enabled = this.selectedType !== null && this.textarea.value.trim().length > 0;
    this.submitBtn.disabled = !enabled;
    this.submitBtn.style.opacity = enabled ? "1" : "0.35";
    this.submitBtn.style.pointerEvents = enabled ? "auto" : "none";
  }

  private submit(): void {
    if (this.submittingState) return;
    if (!this.selectedType || !this.textarea.value.trim()) return;

    const result: PopupResult = { type: this.selectedType, message: this.textarea.value.trim() };

    if (!this.onSubmit) {
      // Legacy fire-and-forget path: resolve immediately and hide.
      clearDraft();
      this.resolve?.(result);
      this.resolve = null;
      this.hideElement();
      return;
    }

    this.enterSubmittingState();
    const submitter = this.onSubmit;
    submitter(result)
      .then(() => {
        // Genuinely persisted now (not just "sent") — the draft can go.
        clearDraft();
        this.resolve?.(result);
        this.resolve = null;
        this.hideElement();
      })
      .catch(() => {
        // Restore the form so the user can edit and retry. The caller is
        // responsible for surfacing the error (live region / toast) — we
        // intentionally do not show inline error text in the popup. The
        // draft stays persisted — a failed submit must not lose the note.
        this.exitSubmittingState();
      });
  }

  private cancel(): void {
    if (this.submittingState) return;
    // Explicit discard — unlike a crash/navigation, the user chose to leave.
    clearDraft();
    this.resolve?.(null);
    this.resolve = null;
    this.hideElement();
  }

  /**
   * Swap the submit button's text for a spinner and freeze every other
   * control. Mirrors the panel's resolve/delete buttons (`sp-spinner--sm`)
   * but renders inline because the popup lives outside the Shadow DOM
   * and therefore can't reach the panel's CSS classes.
   */
  private enterSubmittingState(): void {
    this.submittingState = true;

    // Submit: spinner instead of text, keep button width stable
    this.submitLabel.style.display = "none";
    this.submitBtn.disabled = true;
    this.submitBtn.style.cursor = "wait";
    this.submitBtn.style.opacity = "0.85";
    this.submitBtn.setAttribute("aria-busy", "true");
    this.submitBtn.appendChild(this.buildSpinner());

    // Cancel: dimmed and non-interactive — abandoning mid-upload would leak a
    // half-sent feedback on the server, so we hold the user until we know.
    this.cancelBtn.disabled = true;
    this.cancelBtn.style.opacity = "0.5";
    this.cancelBtn.style.cursor = "not-allowed";
    this.cancelBtn.style.pointerEvents = "none";

    // Textarea + type buttons: read-only
    this.textarea.disabled = true;
    this.textarea.style.opacity = "0.6";
    const typeButtons = this.typeRow.querySelectorAll<HTMLButtonElement>("button");
    for (const btn of typeButtons) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.style.opacity = "0.6";
    }

    // Voice: stop listening (an in-flight submit shouldn't keep transcribing)
    // and disable the mic control like every other input.
    if (this.voiceController?.currentState === "listening") this.voiceController.stop();
    if (this.micBtn) this.micBtn.disabled = true;
  }

  private exitSubmittingState(): void {
    this.submittingState = false;

    // Submit — tear down the spinner: cancel the WAAPI animation explicitly
    // (it has `iterations: Infinity`, so it never ends on its own) before
    // removing the element it drives.
    this.spinnerAnimation?.cancel();
    this.spinnerAnimation = null;
    const spinner = this.submitBtn.querySelector<HTMLDivElement>('[data-role="sp-popup-spinner"]');
    spinner?.remove();
    this.submitLabel.style.display = "";
    this.submitBtn.removeAttribute("aria-busy");
    this.submitBtn.style.cursor = "pointer";

    // Cancel
    this.cancelBtn.disabled = false;
    this.cancelBtn.style.opacity = "1";
    this.cancelBtn.style.cursor = "pointer";
    this.cancelBtn.style.pointerEvents = "auto";

    // Textarea + type buttons
    this.textarea.disabled = false;
    this.textarea.style.opacity = "1";
    const typeButtons = this.typeRow.querySelectorAll<HTMLButtonElement>("button");
    for (const btn of typeButtons) {
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
    }

    // Recompute submit enabled state from the (preserved) form fields
    this.updateSubmitState();
    this.applyVoiceState(this.voiceController?.currentState ?? "idle");
  }

  /**
   * Build a spinner element styled inline. Web Animations API drives the
   * rotation so we don't have to inject `@keyframes` into the host document.
   * Respects `prefers-reduced-motion`: omits the animation and falls back to
   * a static ring. The returned `Animation` handle is stored on the instance
   * so `exitSubmittingState()` can explicitly cancel it.
   */
  private buildSpinner(): HTMLDivElement {
    const spinner = document.createElement("div");
    spinner.dataset.role = "sp-popup-spinner";
    spinner.style.cssText = `
      width:14px;height:14px;
      border:2px solid rgba(255,255,255,0.35);
      border-top-color:#fff;
      border-radius:50%;
      box-sizing:border-box;
    `;
    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Web Animations API is available in every browser we target; the guard
    // is defensive for jsdom in tests, where `animate` may be undefined.
    if (!reduceMotion && typeof spinner.animate === "function") {
      this.spinnerAnimation = spinner.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
        duration: 600,
        iterations: Infinity,
        easing: "linear",
      });
    }
    return spinner;
  }

  private hideElement(): void {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }
    // Remove focus trap
    if (this.onKeydownTrap) {
      this.root.removeEventListener("keydown", this.onKeydownTrap);
      this.onKeydownTrap = null;
    }
    // Never leave the microphone listening after the composer closes.
    if (this.voiceController?.currentState === "listening") this.voiceController.stop();
    // Make sure the submitting decoration doesn't leak into the next show()
    if (this.submittingState) this.exitSubmittingState();
    this.onSubmit = null;
    this.root.style.opacity = "0";
    this.root.style.transform = "translateY(8px) scale(0.98)";
    // Restore focus to the previously focused element
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
    setTimeout(() => {
      this.root.style.display = "none";
    }, 250);
  }

  destroy(): void {
    // Settle a pending `show()` promise so it cannot outlive teardown — a
    // `destroy()` mid-submit would otherwise leak the awaiting closure (and
    // whatever it retains: the annotation, the base64 screenshot). Resolving
    // with `null` reads as "cancelled", matching `cancel()`.
    // Unlike `cancel()`, the draft is deliberately NOT cleared here — a
    // widget teardown (SPA unmount, page navigation) is exactly the crash
    // scenario draft recovery exists for, not a user-chosen discard.
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }
    if (this.submittingState) this.exitSubmittingState();
    this.resolve?.(null);
    this.resolve = null;
    this.onSubmit = null;
    if (this.onKeydownTrap) {
      this.root.removeEventListener("keydown", this.onKeydownTrap);
      this.onKeydownTrap = null;
    }
    for (const unsub of this.voiceUnsubs) unsub();
    this.voiceUnsubs = [];
    this.voiceController?.destroy();
    this.voiceController = null;
    this.root.remove();
  }
}
