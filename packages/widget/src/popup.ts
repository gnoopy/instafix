import {
  type AnnotationPayload,
  type FeedbackResponse,
  type FeedbackType,
  flattenAnnotation,
  formatFeedbacksForAgent,
} from "@instafix/core";
import { copyTextToClipboard, ICON_AGENT_COPY } from "./agent-copy.js";
import { FONT_STACK, Z_INDEX_MAX } from "./constants.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import { clearDraft, loadDraft, saveDraft } from "./draft-storage.js";
import type { TFunction, Translations } from "./i18n/index.js";
import { ICON_BUG, ICON_CHANGE, ICON_CLOSE, ICON_OTHER, ICON_QUESTION, ICON_REDO, ICON_UNDO } from "./icons.js";
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
 * Format the IN-COMPOSITION feedback (targets already selected, note as
 * typed so far) as the same agent-ready Markdown the panel's "Copy Prompt"
 * produces for stored feedbacks — so the full context can go straight into
 * a coding agent without submitting first. Synthesizes a draft
 * `FeedbackResponse` because `formatFeedbacksForAgent` (core) is the single
 * source of truth for the prompt format; screenshot/diagnostics are
 * deliberately absent — both are only captured at submit time.
 * Exported for direct unit testing.
 */
export interface ComposePromptOptions {
  /** Project-specific instruction bullets (InstaFixConfig.agentInstructions). */
  instructions?: string[] | undefined;
  /** Dev-only component source hint for the selected element (dom/source-hint.ts). */
  sourceHint?: string | undefined;
}

export function buildComposePrompt(
  annotations: readonly AnnotationPayload[],
  type: FeedbackType,
  message: string,
  options: ComposePromptOptions = {},
): string {
  const now = new Date().toISOString();
  const draft: FeedbackResponse = {
    id: "draft",
    projectName: "",
    type,
    message,
    status: "open",
    url: typeof location !== "undefined" ? location.href : "",
    viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    authorName: "",
    authorEmail: "",
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
    urlPattern: null,
    screenshotUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    annotations: annotations.map((ann, i) => ({
      ...flattenAnnotation(ann),
      elementId: ann.anchor.elementId ?? null,
      anchorKey: ann.anchor.anchorKey ?? null,
      target: ann.target ?? null,
      id: `draft-${i + 1}`,
      feedbackId: "draft",
      createdAt: now,
    })),
  };
  let markdown = formatFeedbacksForAgent([draft], {
    title: "UI change request",
    // A draft has no real ID — resolve instructions would point nowhere.
    includeResolveProtocol: false,
    ...(options.instructions ? { instructions: options.instructions } : {}),
  });
  if (options.sourceHint) {
    // Appended as its own line — the formatter itself stays draft-agnostic.
    markdown += `\nSource hint (dev): ${options.sourceHint}\n`;
  }
  return markdown;
}

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
  private textareaWrap: HTMLElement;
  private clearBtn: HTMLButtonElement;
  private undoClearBtn: HTMLButtonElement;
  private redoClearBtn: HTMLButtonElement;
  /** Single-slot undo history for the clear (X) button only — `textarea.value = ""` bypasses the browser's native undo stack, so this is the sole way to recover an accidental clear. Not a general text-editing undo stack. */
  private clearedMessage: string | null = null;
  private submitBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;
  private typeRow: HTMLElement;
  private submitLabel: HTMLSpanElement;
  private hint: HTMLElement;
  private resolve: ((result: PopupResult | null) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;
  /** Selection rect the open popup is anchored to — kept so `positionPopup()` can re-clamp after content changes its height (legend). Viewport-relative at the moment `show()` captured it — see `lastAnchorScrollX/Y` for why `positionPopup()` never uses it raw. */
  private lastAnchorRect: DOMRect | null = null;
  /** `window.scrollX`/`scrollY` when `lastAnchorRect` was captured — lets `positionPopup()` re-project it into CURRENT viewport coordinates after a scroll (`position:fixed` doesn't do this on its own). */
  private lastAnchorScrollX = 0;
  private lastAnchorScrollY = 0;
  /** Re-positions on scroll/resize while open — installed in `show()`, torn down in `hideElement()`. Without it the popup (and the drawn-selection rect kept visible alongside it) stay pinned to their pre-scroll screen position while the actual content scrolls away underneath, same bug class as the drag/targeting rects — see annotator.ts's `effectiveDragStart()`. */
  private onWindowChange: (() => void) | null = null;
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

  // --- In-composer "copy prompt" (full context + note, agent-ready) ---
  private readonly copyContextBtn: HTMLButtonElement;
  private readonly copyContextLabel: HTMLSpanElement;
  /** Live view of the current session's annotations — set via setPromptContext() by the annotator right after show(); null hides the button. */
  private getPromptAnnotations: (() => readonly AnnotationPayload[]) | null = null;
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;
  /** Dev-only component source hint line (⌖ file:line · <Name>) — shown above the type chips, included in the compose copy. */
  private readonly sourceHintEl: HTMLElement;
  private sourceHint: string | null = null;

  // --- Pasted image attachment (⌘V into the note) ---
  private readonly pastedImageRow: HTMLElement;
  private readonly pastedImageThumb: HTMLImageElement;
  private pastedImage: string | null = null;

  /** Data URL of an image the user pasted into the composer, if any — the annotator uses it in place of the auto-captured screenshot. */
  get pastedScreenshotDataUrl(): string | null {
    return this.pastedImage;
  }

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
    /** Project instruction bullets injected into compose-copy prompts (InstaFixConfig.agentInstructions). */
    private readonly agentInstructions?: string[],
  ) {
    // Layer surface (see ThemeColors.layerBg): hue-tinted background + a
    // layer-toned edge, so the popover reads as InstaFix's own floating
    // surface even over a host background of the same base color.
    this.root = el("div", {
      style: `
        position:fixed;
        z-index:${Z_INDEX_MAX};
        width:390px;
        max-width:calc(100vw - 16px);
        box-sizing:border-box;
        padding:16px;
        border-radius:16px;
        background:${this.colors.layerBg};
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:2px solid ${this.colors.layerBorder};
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

    // Dev-only source hint (⌖ components/Foo.tsx:38 · <Name>) — hidden until
    // the annotator captures one; absent entirely on production builds.
    this.sourceHintEl = el("div", {
      style: `
        display:none;align-items:center;gap:6px;
        margin-bottom:10px;padding:5px 9px;border-radius:7px;
        background:${this.colors.accentLight};color:${this.colors.accent};
        font-family:"IBM Plex Mono","SF Mono",Consolas,monospace;
        font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      `,
    });

    // Pasted-image row — thumbnail + remove, shown after a ⌘V image paste.
    this.pastedImageRow = el("div", {
      style: "display:none;align-items:center;gap:8px;margin:8px 0 0;",
    });
    this.pastedImageThumb = document.createElement("img");
    this.pastedImageThumb.style.cssText = `
      height:40px;max-width:120px;border-radius:7px;object-fit:cover;
      border:1px solid ${this.colors.border};
    `;
    const pastedLabel = el("span", {
      style: `font-size:11px;color:${this.colors.textTertiary};font-family:${FONT_STACK};`,
    });
    setText(pastedLabel, "📎");
    const pastedRemove = document.createElement("button");
    pastedRemove.type = "button";
    pastedRemove.style.cssText = `
      border:none;background:none;color:${this.colors.textTertiary};
      font-family:${FONT_STACK};font-size:11px;font-weight:600;
      text-decoration:underline;cursor:pointer;padding:0;
    `;
    setText(pastedRemove, "×");
    pastedRemove.setAttribute("aria-label", "remove pasted image");
    pastedRemove.addEventListener("click", () => this.setPastedImage(null));
    this.pastedImageRow.appendChild(this.pastedImageThumb);
    this.pastedImageRow.appendChild(pastedLabel);
    this.pastedImageRow.appendChild(pastedRemove);

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

    // Type selector — one row of 4 (was a 2x2 grid; the wider popover now
    // has room, and one row reads faster than two). Labels are bound later
    // by `applyLabels()` — the constructor only builds the structure (icon +
    // empty label span).
    const typeOptions: TypeOption[] = [
      { type: "question", icon: ICON_QUESTION },
      { type: "change", icon: ICON_CHANGE },
      { type: "bug", icon: ICON_BUG },
      { type: "other", icon: ICON_OTHER },
    ];
    this.typeRow = el("div", {
      style: "display:grid;grid-template-columns:repeat(4, 1fr);gap:5px;margin-bottom:12px;",
    });
    for (const option of typeOptions) {
      const btn = document.createElement("button");
      btn.style.cssText = `
        height:36px;
        border-radius:9999px;border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:4px;
        font-family:${FONT_STACK};
        font-size:12px;font-weight:500;color:${this.colors.textTertiary};
        transition:all 0.2s ease;
        padding:0 4px;
        min-width:0;
      `;
      const icon = parseSvg(option.icon);
      icon.setAttribute("style", "width:12px;height:12px;flex-shrink:0;");
      btn.appendChild(icon);
      const label = document.createElement("span");
      // One row of 4 at this width is tight for longer-language labels
      // ("Question", "Discussion", …) — truncate instead of wrapping or
      // overflowing the pill. The icon alone still identifies the type.
      label.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;";
      btn.appendChild(label);
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
      this.clearedMessage = null;
      this.setComposerActionEnabled(this.undoClearBtn, false);
      this.setComposerActionEnabled(this.redoClearBtn, false);
      clearDraft();
      this.hideDraftBanner();
      this.updateSubmitState();
      this.textarea.focus();
    });
    this.draftBanner.appendChild(draftLabel);
    this.draftBanner.appendChild(discardBtn);
    this.draftLabelEl = draftLabel;
    this.draftDiscardBtn = discardBtn;

    // Textarea — auto-grows with content (100→220px, then scrolls), the
    // modern composer behavior (Linear/Slack style); no manual resize
    // handle, autogrowTextarea() owns the height. Wrapped in a relative
    // container so the clear/undo/redo trio (below) can sit in its
    // top-right corner without affecting textarea layout.
    this.textareaWrap = el("div", { style: "position:relative;" });
    this.textarea = document.createElement("textarea");
    this.textarea.style.cssText = `
      width:100%;min-height:100px;height:100px;
      padding:10px 12px;border-radius:12px;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBgHeavy};
      color:${this.colors.text};font-family:${FONT_STACK};
      font-size:13px;line-height:1.5;resize:none;overflow-y:auto;
      outline:none;transition:border-color 0.2s ease,box-shadow 0.2s ease,background 0.2s ease;
      box-sizing:border-box;
    `;
    this.textarea.maxLength = 5000;

    // Clear / undo / redo trio — a floating overlay in the textarea's
    // top-right corner, ON TOP of whatever text is typed there (no reserved
    // padding pushing text out of the way), so it must read as buttons at
    // rest, not just on hover: a circular outline + translucent fill (same
    // glass tokens the textarea itself uses) rather than the fully
    // transparent-until-hover treatment other icon buttons use. Clearing via
    // this button sets `.value` directly, which does NOT go through the
    // browser's native undo stack (Ctrl+Z does nothing after it) — hence a
    // small dedicated one-slot history just for this action, not a general
    // text-editing undo stack the rest of the textarea doesn't have either.
    const composerActions = el("div", {
      style: `
        position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:4px;
      `,
    });
    const makeComposerActionBtn = (icon: string): HTMLButtonElement => {
      const b = document.createElement("button");
      b.type = "button";
      b.style.cssText = `
        width:22px;height:22px;border-radius:50%;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};color:${this.colors.textTertiary};
        box-shadow:0 1px 3px ${this.colors.shadow};
        display:flex;align-items:center;justify-content:center;cursor:pointer;
        transition:background 0.15s ease,color 0.15s ease,border-color 0.15s ease;
      `;
      const svg = parseSvg(icon);
      svg.setAttribute("style", "width:12px;height:12px;flex-shrink:0;");
      b.appendChild(svg);
      b.addEventListener("mouseenter", () => {
        if (b.disabled) return;
        b.style.background = this.colors.glassBgHeavy;
        b.style.color = this.colors.text;
        b.style.borderColor = this.colors.accent;
      });
      b.addEventListener("mouseleave", () => {
        b.style.background = this.colors.glassBg;
        b.style.color = b.disabled ? this.colors.border : this.colors.textTertiary;
        b.style.borderColor = this.colors.border;
      });
      return b;
    };
    this.clearBtn = makeComposerActionBtn(ICON_CLOSE);
    this.undoClearBtn = makeComposerActionBtn(ICON_UNDO);
    this.redoClearBtn = makeComposerActionBtn(ICON_REDO);
    this.setComposerActionEnabled(this.undoClearBtn, false);
    this.setComposerActionEnabled(this.redoClearBtn, false);

    this.clearBtn.addEventListener("click", () => {
      if (this.submittingState || !this.textarea.value) return;
      this.clearedMessage = this.textarea.value;
      this.textarea.value = "";
      this.textarea.dispatchEvent(new Event("input"));
      this.textarea.focus();
      this.setComposerActionEnabled(this.undoClearBtn, true);
      this.setComposerActionEnabled(this.redoClearBtn, false);
    });
    this.undoClearBtn.addEventListener("click", () => {
      if (this.clearedMessage === null) return;
      this.textarea.value = this.clearedMessage;
      this.textarea.dispatchEvent(new Event("input"));
      this.textarea.focus();
      this.setComposerActionEnabled(this.undoClearBtn, false);
      this.setComposerActionEnabled(this.redoClearBtn, true);
    });
    this.redoClearBtn.addEventListener("click", () => {
      if (this.clearedMessage === null) return;
      this.textarea.value = "";
      this.textarea.dispatchEvent(new Event("input"));
      this.textarea.focus();
      this.setComposerActionEnabled(this.undoClearBtn, true);
      this.setComposerActionEnabled(this.redoClearBtn, false);
    });
    composerActions.appendChild(this.clearBtn);
    composerActions.appendChild(this.undoClearBtn);
    composerActions.appendChild(this.redoClearBtn);

    // Keyboard shortcut hint. keep-all: when the voice-status text squeezes
    // this narrow, the line must break between words ("Ctrl+Enter" / "로
    // 전송"), never inside the chord ("Ctrl+E" / "nter").
    this.hint = el("div", {
      style: `
        font-size:11px;color:${this.colors.textTertiary};
        text-align:right;margin-top:4px;
        font-family:${FONT_STACK};
        letter-spacing:0.01em;
        word-break:keep-all;
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

    // Button row — copy-prompt on the left, cancel/submit on the right.
    const btnRow = el("div", {
      style: "display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;",
    });

    // "Copy prompt" — the exact context an agent needs (page, viewport,
    // selectors, bounds, the note as typed) without submitting first.
    // Instant copy + transient ✓ state, no modal — the composer is the
    // wrong place for a preview dialog (the panel's copy button has one).
    this.copyContextBtn = document.createElement("button");
    this.copyContextBtn.type = "button";
    this.copyContextBtn.style.cssText = `
      height:34px;padding:0 12px;border-radius:9999px;
      border:1px solid ${this.colors.border};
      background:transparent;
      color:${this.colors.textTertiary};font-family:${FONT_STACK};
      font-size:12px;font-weight:500;cursor:pointer;
      display:none;align-items:center;gap:5px;
      transition:all 0.2s ease;white-space:nowrap;
    `;
    const copyIcon = parseSvg(ICON_AGENT_COPY);
    copyIcon.setAttribute("style", "width:13px;height:13px;flex-shrink:0;");
    this.copyContextBtn.appendChild(copyIcon);
    this.copyContextLabel = document.createElement("span");
    this.copyContextBtn.appendChild(this.copyContextLabel);
    this.copyContextBtn.addEventListener("click", () => void this.copyComposeContext());
    this.copyContextBtn.addEventListener("mouseenter", () => {
      this.copyContextBtn.style.borderColor = this.colors.accent;
      this.copyContextBtn.style.color = this.colors.accent;
    });
    this.copyContextBtn.addEventListener("mouseleave", () => {
      this.copyContextBtn.style.borderColor = this.colors.border;
      this.copyContextBtn.style.color = this.colors.textTertiary;
    });

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

    btnRow.appendChild(this.copyContextBtn);
    // Right-aligned even while the copy button is hidden (display:none).
    const rightBtns = el("div", { style: "display:flex;gap:8px;margin-left:auto;" });
    rightBtns.appendChild(this.cancelBtn);
    rightBtns.appendChild(this.submitBtn);
    btnRow.appendChild(rightBtns);

    this.root.appendChild(this.sourceHintEl);
    this.root.appendChild(this.targetSizeRow);
    this.root.appendChild(this.typeRow);
    this.root.appendChild(this.legendRow);
    if (this.draftBanner) this.root.appendChild(this.draftBanner);
    this.textareaWrap.appendChild(this.textarea);
    this.textareaWrap.appendChild(composerActions);
    this.root.appendChild(this.textareaWrap);
    this.root.appendChild(this.pastedImageRow);
    this.root.appendChild(hintRow);
    this.root.appendChild(btnRow);
    document.body.appendChild(this.root);

    // ⌘V image paste — the pasted image replaces the auto-captured
    // screenshot for this feedback (design references, other-app examples).
    this.textarea.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") this.setPastedImage(reader.result);
        };
        reader.readAsDataURL(file);
        return;
      }
    });

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
    this.clearBtn.setAttribute("aria-label", this.t("popup.clearMessage"));
    this.undoClearBtn.setAttribute("aria-label", this.t("popup.undoClear"));
    this.redoClearBtn.setAttribute("aria-label", this.t("popup.redoClear"));

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

    setText(this.copyContextLabel, this.t("popup.copyContext"));
    this.copyContextBtn.setAttribute("aria-label", this.t("popup.copyContext"));
  }

  /**
   * Give the composer a live view of the current session's annotations so
   * its "copy prompt" button can format them on demand — a GETTER (not a
   * snapshot) because the annotator reassigns the list when the user flips
   * the Element/Container or summary/detail toggles. Called by the annotator
   * right after `show()` (which resets it to null); null hides the button.
   */
  setPromptContext(getAnnotations: (() => readonly AnnotationPayload[]) | null): void {
    this.getPromptAnnotations = getAnnotations;
    this.copyContextBtn.style.display = getAnnotations ? "inline-flex" : "none";
  }

  /**
   * Show (or clear) the dev-only component source hint for the current
   * selection — a "⌖ file:line · <Name>" line above the type chips, also
   * appended to the compose copy. Reset to null by show(); absent entirely
   * on production host builds (dom/source-hint.ts returns null there).
   */
  setSourceHint(hint: { location: string | null; componentPath: string } | null): void {
    if (!hint) {
      this.sourceHint = null;
      this.sourceHintEl.style.display = "none";
      return;
    }
    const parts: string[] = [];
    if (hint.componentPath) parts.push(`<${hint.componentPath}>`);
    if (hint.location) parts.push(`\`${hint.location}\``);
    this.sourceHint = parts.join(" — ");
    const display = [hint.componentPath, hint.location].filter(Boolean).join(" · ");
    setText(this.sourceHintEl, `⌖ ${display}`);
    this.sourceHintEl.title = display;
    this.sourceHintEl.style.display = "flex";
  }

  /** Attach (or clear) a pasted image — used in place of the auto screenshot. */
  private setPastedImage(dataUrl: string | null): void {
    this.pastedImage = dataUrl;
    if (dataUrl) {
      this.pastedImageThumb.src = dataUrl;
      this.pastedImageRow.style.display = "flex";
    } else {
      this.pastedImageThumb.removeAttribute("src");
      this.pastedImageRow.style.display = "none";
    }
  }

  /**
   * Cancel an open composer from OUTSIDE (the annotator's document-level
   * Escape handler) — same path as the cancel button, so the pending
   * `show()` promise resolves null instead of being orphaned when the
   * overlay around the popup is torn down.
   */
  cancelOpen(): void {
    if (this.isOpen) this.cancel();
  }

  /** Instant-copy the in-composition context+note as agent Markdown — transient ✓/✗ label, no modal. */
  private async copyComposeContext(): Promise<void> {
    const getAnnotations = this.getPromptAnnotations;
    if (!getAnnotations || this.copyResetTimer) return; // mid ✓/✗ flash — ignore spam clicks

    const markdown = buildComposePrompt(getAnnotations(), this.selectedType ?? "other", this.textarea.value.trim(), {
      instructions: this.agentInstructions,
      sourceHint: this.sourceHint ?? undefined,
    });
    const ok = await copyTextToClipboard(markdown);

    setText(this.copyContextLabel, this.t(ok ? "popup.copyContextCopied" : "popup.copyContextFailed"));
    this.copyContextBtn.style.borderColor = ok ? "#22c55e" : "#ef4444";
    this.copyContextBtn.style.color = ok ? "#22c55e" : "#ef4444";
    this.copyResetTimer = setTimeout(() => {
      this.copyResetTimer = null;
      setText(this.copyContextLabel, this.t("popup.copyContext"));
      this.copyContextBtn.style.borderColor = this.colors.border;
      this.copyContextBtn.style.color = this.colors.textTertiary;
    }, 1600);
  }

  /** Auto-grow the note textarea with its content: 100px floor, 220px cap (then it scrolls). */
  private autogrowTextarea(): void {
    const ta = this.textarea;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, 100), 220)}px`;
  }

  /** Enable/disable a composer action button (undo/redo) and dim it to match. */
  private setComposerActionEnabled(btn: HTMLButtonElement, enabled: boolean): void {
    btn.disabled = !enabled;
    btn.style.cursor = enabled ? "pointer" : "default";
    btn.style.opacity = enabled ? "1" : "0.35";
    btn.style.color = enabled ? this.colors.textTertiary : this.colors.border;
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
    const anchor = this.lastAnchorRect;
    if (!anchor) return;

    // Re-project the anchor into CURRENT viewport coordinates — it was
    // captured once in show(), so a scroll since then (this method re-runs
    // on every scroll/resize tick while open, see the listener in show())
    // must be compensated the same way annotator.ts's effectiveDragStart()
    // does, or the popup would clamp itself against where the selection USED
    // to be on screen rather than where it actually is now. Offsets the
    // exact top/bottom/left/right fields used below — NOT reconstructed via
    // `new DOMRect(x, y, w, h)`, which silently drops top/bottom/left/right
    // when they were set independently of x/y/width/height (a real
    // getBoundingClientRect() keeps both in sync, but Popup only ever reads
    // these four fields, so that's the only invariant this needs to honor).
    const dx = window.scrollX - this.lastAnchorScrollX;
    const dy = window.scrollY - this.lastAnchorScrollY;
    const rectBounds = {
      top: anchor.top - dy,
      bottom: anchor.bottom - dy,
      left: anchor.left - dx,
      right: anchor.right - dx,
    };

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
    // The popup's own `max-width` shrinks it on narrow viewports, but the
    // flip-right branch above can still push `left` far enough that the
    // (now-narrower) popup runs off the right edge — clamp last so the
    // right edge always stays on-screen regardless of popupW.
    left = Math.min(left, window.innerWidth - popupW - 8);
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
      this.clearedMessage = null;
      this.setComposerActionEnabled(this.undoClearBtn, false);
      this.setComposerActionEnabled(this.redoClearBtn, false);
      this.submittingState = false;
      this.resetTypeButtons();
      this.hideDraftBanner();
      this.setLegend([]);
      this.setPromptContext(null);
      this.setSourceHint(null);
      this.setPastedImage(null);

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
      // Default type: "버그" pre-selected — most feedbacks during a
      // debugging session ARE bugs, so the common path is "just type the
      // note and send" with zero extra clicks. A restored draft's own type
      // wins above; picking another chip stays one click away.
      if (!this.selectedType) this.selectType("bug", this.typeRow);
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
      this.lastAnchorScrollX = window.scrollX;
      this.lastAnchorScrollY = window.scrollY;
      this.root.style.display = "block";
      this.positionPopup();

      // Keep the popup anchored while the visitor scrolls (or resizes) with
      // it open — e.g. scrolling to re-read context before finishing the
      // comment. { passive: true }: never blocks the scroll itself.
      this.onWindowChange = () => this.positionPopup();
      window.addEventListener("scroll", this.onWindowChange, { passive: true, capture: true });
      window.addEventListener("resize", this.onWindowChange, { passive: true });

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
    // Every path that changes the note's value runs through here (typing,
    // draft restore, voice transcript, discard) — the one hook point where
    // the auto-grow can't be forgotten.
    this.autogrowTextarea();
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
    if (this.onWindowChange) {
      window.removeEventListener("scroll", this.onWindowChange, true);
      window.removeEventListener("resize", this.onWindowChange);
      this.onWindowChange = null;
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
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
      this.copyResetTimer = null;
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
