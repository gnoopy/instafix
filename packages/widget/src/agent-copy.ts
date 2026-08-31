/**
 * "Copy for Claude Code" — the widget-side wiring around
 * `formatFeedbacksForAgent` (pure, in `@instafix/core`): a button that opens
 * a preview dialog, copies the generated Markdown to the clipboard, and
 * falls back to a selectable textarea when the Clipboard API is unavailable
 * or denied (non-secure context, permission prompt dismissed, etc).
 */

import { type FeedbackResponse, formatFeedbacksForAgent } from "@instafix/core";
import { Z_INDEX_MAX } from "./constants.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import { type TFunction, tWithParams } from "./i18n/index.js";
import { ICON_CHECK } from "./icons.js";
import type { ThemeColors } from "./styles/theme.js";

const ICON_AGENT_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

export const AGENT_COPY_CSS = `
  .sp-agent-btn {
    height: 30px;
    padding: 0 14px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-accent);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .sp-agent-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .sp-agent-btn:hover {
    background: var(--sp-accent);
    color: #fff;
    box-shadow: 0 2px 12px var(--sp-accent-glow);
  }

  .sp-agent-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sp-agent-btn--detail {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    justify-content: center;
    border-radius: var(--sp-radius);
  }

  .sp-agent-modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--sp-backdrop, rgba(15, 23, 42, 0.2));
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${Z_INDEX_MAX};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .sp-agent-modal {
    width: min(560px, 92vw);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-radius: 20px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    font-family: var(--sp-font);
    transform: translateY(8px) scale(0.97);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-agent-modal-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sp-text);
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .sp-agent-modal-textarea {
    flex: 1;
    min-height: 220px;
    resize: vertical;
    padding: 12px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg);
    color: var(--sp-text);
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre;
    overflow: auto;
  }

  .sp-agent-modal-hint {
    margin-top: 10px;
    font-size: 12px;
    color: var(--sp-text-tertiary);
    line-height: 1.4;
  }

  .sp-agent-modal-hint--error {
    color: #ef4444;
  }

  .sp-agent-modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .sp-agent-modal-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 0;
  }

  .sp-agent-modal-success-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.14);
    color: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sp-agent-modal-success-icon svg {
    width: 24px;
    height: 24px;
  }

  .sp-agent-modal-success-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--sp-text);
  }

  @media (forced-colors: active) {
    .sp-agent-btn,
    .sp-agent-modal,
    .sp-agent-modal-textarea {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-agent-btn:focus-visible {
      outline: 3px solid Highlight !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sp-agent-modal-backdrop,
    .sp-agent-modal {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ---------------------------------------------------------------------------
// Clipboard helper
// ---------------------------------------------------------------------------

/**
 * Copy text to the clipboard. Tries the async Clipboard API first (requires
 * a secure context); falls back to a hidden, selected `<textarea>` +
 * `execCommand("copy")` for older/non-secure environments. Returns whether
 * the copy actually succeeded — callers must not assume success.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy fallback below
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// AgentCopyButton
// ---------------------------------------------------------------------------

export interface AgentCopyButtonOptions {
  /** Resolve the feedbacks to copy — called fresh on every click. */
  getFeedbacks: () => FeedbackResponse[] | Promise<FeedbackResponse[]>;
  /**
   * Where to append the preview dialog. Must be the Shadow DOM root (not a
   * transformed descendant like the sliding panel) so the dialog's
   * `position: fixed` backdrop is positioned against the viewport instead of
   * a transformed ancestor's containing block.
   */
  getContainer: () => HTMLElement | ShadowRoot;
  /** `"panel"` (pill, header) or `"detail"` (full-width, matches detail actions). */
  variant?: "panel" | "detail";
}

/**
 * Self-contained "Copy for Claude Code" button: resolves feedbacks, formats
 * them (pure, testable in `@instafix/core`), shows a preview dialog, and
 * copies to the clipboard on confirm. The preview textarea doubles as the
 * manual-copy fallback when the Clipboard API fails.
 */
export class AgentCopyButton {
  readonly element: HTMLButtonElement;
  private modal: HTMLElement | null = null;

  constructor(
    _colors: ThemeColors,
    private readonly options: AgentCopyButtonOptions,
    private readonly t: TFunction,
  ) {
    const variant = options.variant ?? "panel";
    this.element = document.createElement("button");
    this.element.type = "button";
    this.element.className = variant === "detail" ? "sp-agent-btn sp-agent-btn--detail" : "sp-agent-btn";
    this.element.appendChild(parseSvg(ICON_AGENT_COPY));
    const label = document.createElement("span");
    setText(label, this.t("agent.copyButton"));
    this.element.appendChild(label);
    this.element.addEventListener("click", () => this.open());
  }

  destroy(): void {
    this.modal?.remove();
    this.modal = null;
  }

  private async open(): Promise<void> {
    this.element.disabled = true;
    let feedbacks: FeedbackResponse[];
    try {
      feedbacks = await this.options.getFeedbacks();
    } finally {
      this.element.disabled = false;
    }

    const markdown = formatFeedbacksForAgent(feedbacks);
    this.showModal(feedbacks.length, markdown);
  }

  private showModal(count: number, markdown: string): void {
    this.modal?.remove();

    const backdrop = el("div", { class: "sp-agent-modal-backdrop" });
    const dialog = el("div", { class: "sp-agent-modal" });
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const titleId = `sp-agent-title-${Date.now()}`;
    dialog.setAttribute("aria-labelledby", titleId);

    const title = el("div", { class: "sp-agent-modal-title" });
    title.id = titleId;
    setText(title, count > 0 ? tWithParams(this.t, "agent.previewTitle", { count }) : this.t("agent.previewEmpty"));
    dialog.appendChild(title);

    const textarea = document.createElement("textarea");
    textarea.className = "sp-agent-modal-textarea";
    textarea.readOnly = true;
    textarea.value = markdown;
    textarea.setAttribute("aria-label", this.t("agent.previewAria"));
    dialog.appendChild(textarea);

    const hint = el("div", { class: "sp-agent-modal-hint" });
    hint.setAttribute("role", "status");
    hint.setAttribute("aria-live", "polite");
    dialog.appendChild(hint);

    const actions = el("div", { class: "sp-agent-modal-actions" });
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "sp-btn-ghost";
    setText(cancelBtn, this.t("agent.cancel"));

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "sp-btn-danger";
    copyBtn.style.background = "var(--sp-accent)";
    copyBtn.style.boxShadow = "0 2px 8px var(--sp-accent-glow)";
    setText(copyBtn, this.t("agent.copyAction"));
    copyBtn.disabled = count === 0;

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      backdrop.removeEventListener("keydown", onKeydown);
      backdrop.style.opacity = "0";
      dialog.style.transform = "translateY(8px) scale(0.97)";
      setTimeout(() => backdrop.remove(), 200);
      if (this.modal === backdrop) this.modal = null;
    };

    copyBtn.addEventListener("click", async () => {
      copyBtn.disabled = true;
      const ok = await copyTextToClipboard(markdown);
      if (ok) {
        this.showSuccess(dialog, count, close);
      } else {
        copyBtn.disabled = false;
        setText(hint, this.t("agent.copyFailedHint"));
        hint.classList.add("sp-agent-modal-hint--error");
        textarea.focus();
        textarea.select();
      }
    });
    cancelBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    const onKeydown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        close();
        return;
      }
      if (ke.key === "Tab") {
        const focusable = [textarea, cancelBtn, copyBtn].filter((elm) => !("disabled" in elm && elm.disabled));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        const active = (backdrop.getRootNode() as ShadowRoot | Document).activeElement;
        if (ke.shiftKey && active === first) {
          ke.preventDefault();
          last.focus();
        } else if (!ke.shiftKey && active === last) {
          ke.preventDefault();
          first.focus();
        }
      }
    };
    backdrop.addEventListener("keydown", onKeydown);

    actions.appendChild(cancelBtn);
    actions.appendChild(copyBtn);
    dialog.appendChild(actions);
    backdrop.appendChild(dialog);

    this.options.getContainer().appendChild(backdrop);
    this.modal = backdrop;

    requestAnimationFrame(() => {
      backdrop.style.opacity = "1";
      dialog.style.transform = "translateY(0) scale(1)";
      (count > 0 ? copyBtn : cancelBtn).focus();
    });
  }

  private showSuccess(dialog: HTMLElement, count: number, close: () => void): void {
    dialog.replaceChildren();
    const success = el("div", { class: "sp-agent-modal-success" });
    success.setAttribute("role", "status");
    success.setAttribute("aria-live", "polite");
    const icon = el("div", { class: "sp-agent-modal-success-icon" });
    icon.appendChild(parseSvg(ICON_CHECK));
    const text = el("div", { class: "sp-agent-modal-success-text" });
    setText(text, tWithParams(this.t, "agent.copiedToast", { count }));
    success.appendChild(icon);
    success.appendChild(text);
    dialog.appendChild(success);
    setTimeout(close, 1400);
  }
}
