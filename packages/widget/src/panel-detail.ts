/**
 * Detail View for the feedback panel.
 *
 * Slides in from the right (panel-in-panel pattern) when a user clicks
 * a feedback card, showing full details: message, metadata, annotation
 * info, status actions, and a "Go to annotation" button.
 *
 * Glassmorphism design — frosted glass surfaces, staggered section
 * animations, accent gradients, premium micro-interactions.
 */

import { type AnnotationPayload, type FeedbackResponse, type FeedbackStatus, isClosedStatus } from "@instafix/core";
import { AgentCopyButton } from "./agent-copy.js";
import { generateAnchor } from "./dom/anchor.js";
import { resolveAnchor } from "./dom/resolver.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import { isWidgetChrome } from "./focus-tracker.js";
import { getStatusLabel, type TFunction, tWithParams } from "./i18n/index.js";
import { getTypeBgColor, getTypeColor, type ThemeColors } from "./styles/theme.js";

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

export const ICON_ARROW_LEFT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;

export const ICON_MAP_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

export const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

export const ICON_USER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

export const ICON_CALENDAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

export const ICON_MONITOR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

const ICON_UNDO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;

const ICON_TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

const ICON_CODE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;

const ICON_CROSSHAIR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`;

const ICON_CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_TERMINAL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
const ICON_ALERT_TRIANGLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_X_CIRCLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

export const DETAIL_CSS = /* css */ `
  /* ============================
     Detail View — Panel-in-Panel
     ============================ */

  .sp-detail {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--sp-glass-bg);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    z-index: 20;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
    overflow: hidden;
    /* Slid out of view via the transform above — belt-and-suspenders against
       it ever intercepting clicks meant for what's behind it (the list, the
       panel header) while hidden, regardless of how the transform/clipping
       interacts with a given engine. */
    pointer-events: none;
  }

  .sp-detail--visible {
    transform: translateX(0);
    pointer-events: auto;
  }

  /* Fallback for browsers that cannot deliver a readable "frosted glass":
     drop the translucent background to a solid one so the underlying list
     does not bleed through. Two disjoint cohorts:

       1. No backdrop-filter at all (Firefox <=102, legacy Edge / IE,
          older Chromium on Linux).
       2. Safari / iOS Safari where backdrop-filter is detectable only
          via the -webkit- prefix. Empirically this still includes recent
          Safari (observed on macOS Safari 18.6 in 2026, where
          CSS.supports('backdrop-filter', 'blur(...)') returns false even
          though the unprefixed property has shipped). On these builds the
          long-standing nested-backdrop + transform compositing bug
          silently no-ops the blur on .sp-detail (which is transformed and
          lives inside another backdrop-filter ancestor, .sp-panel), so
          the translucent default is unreadable. Detection is a pure
          feature query: prefixed supported AND unprefixed not. No
          user-agent sniffing.

     Browsers where the glass effect renders correctly (most Chromium,
     modern Firefox, any engine that advertises both property names via
     CSS.supports) are unaffected. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .sp-detail {
      background: var(--sp-bg);
    }
  }

  @supports (-webkit-backdrop-filter: blur(1px)) and (not (backdrop-filter: blur(1px))) {
    .sp-detail {
      background: var(--sp-bg);
    }
  }

  /* ---- Header ---- */

  .sp-detail-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--sp-border);
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    flex-shrink: 0;
    min-height: 64px;
  }

  .sp-detail-back {
    width: 40px;
    height: 40px;
    border-radius: var(--sp-radius);
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sp-text-tertiary);
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;
  }

  .sp-detail-back:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-detail-back:active {
    transform: scale(0.92);
    transition-duration: 0.1s;
  }

  .sp-detail-back svg {
    width: 18px;
    height: 18px;
  }

  .sp-detail-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sp-text);
    letter-spacing: -0.02em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sp-detail-header .sp-badge {
    flex-shrink: 0;
  }

  /* ---- Content ---- */

  .sp-detail-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
  }

  .sp-detail-content::-webkit-scrollbar {
    width: 6px;
  }

  .sp-detail-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .sp-detail-content::-webkit-scrollbar-thumb {
    background: var(--sp-border);
    border-radius: var(--sp-radius-full);
  }

  .sp-detail-content::-webkit-scrollbar-thumb:hover {
    background: var(--sp-text-tertiary);
  }

  /* ---- Section ---- */

  .sp-detail-section {
    padding: 20px 24px;
    border-bottom: 1px solid var(--sp-border);
    opacity: 0;
    transform: translateY(8px);
    animation: sp-detail-section-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes sp-detail-section-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sp-detail-section:last-child {
    border-bottom: none;
  }

  .sp-detail-section-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-detail-section-title svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }

  /* ---- Status + Actions Section ---- */

  .sp-detail-status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .sp-detail-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: var(--sp-radius-full);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .sp-detail-status-pill--open {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .sp-detail-status-pill--resolved {
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.2);
  }

  .sp-detail-status-pill--in-progress {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .sp-detail-status-pill--wont-fix {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .sp-detail-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sp-detail-actions {
    display: flex;
    gap: 8px;
  }

  .sp-detail-actions button {
    flex: 1;
    height: 40px;
    padding: 0 16px;
    border-radius: var(--sp-radius);
    font-family: var(--sp-font);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .sp-detail-actions button svg {
    width: 15px;
    height: 15px;
  }

  .sp-detail-btn-resolve {
    border: 1.5px solid #22c55e;
    background: rgba(34, 197, 94, 0.06);
    color: #22c55e;
  }

  .sp-detail-btn-resolve:hover {
    background: rgba(34, 197, 94, 0.14);
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.12);
    transform: translateY(-1px);
  }

  .sp-detail-btn-resolve:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-btn-reopen {
    border: 1.5px solid var(--sp-accent);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
  }

  .sp-detail-btn-reopen:hover {
    background: rgba(var(--sp-accent), 0.14);
    box-shadow: 0 0 16px var(--sp-accent-glow);
    transform: translateY(-1px);
  }

  .sp-detail-btn-reopen:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-btn-delete {
    border: 1.5px solid #ef4444;
    background: rgba(239, 68, 68, 0.06);
    color: #ef4444;
  }

  .sp-detail-btn-delete:hover {
    background: rgba(239, 68, 68, 0.14);
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.12);
    transform: translateY(-1px);
  }

  .sp-detail-btn-delete:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    transform: none;
    box-shadow: none;
  }

  /* ---- Message Section ---- */

  .sp-detail-message {
    font-size: 14px;
    line-height: 1.65;
    color: var(--sp-text);
    padding: 14px 16px;
    border-left: 3px solid var(--sp-accent);
    border-radius: 0 var(--sp-radius) var(--sp-radius) 0;
    background: var(--sp-glass-bg-heavy);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .sp-detail-message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 14px;
  }

  .sp-detail-message-edit-btn {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s ease;
  }

  .sp-detail-message-edit-btn:hover {
    color: var(--sp-accent);
    border-color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-detail-message-edit-btn svg {
    width: 13px;
    height: 13px;
  }

  .sp-detail-message-textarea {
    width: 100%;
    min-height: 90px;
    padding: 12px 14px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-accent);
    background: var(--sp-glass-bg-heavy);
    color: var(--sp-text);
    font-family: var(--sp-font);
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }

  .sp-detail-message-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .sp-detail-btn-save {
    height: 34px;
    padding: 0 18px;
    border-radius: var(--sp-radius-full);
    border: 1.5px solid #22c55e;
    background: rgba(34, 197, 94, 0.06);
    color: #22c55e;
    font-family: var(--sp-font);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sp-detail-btn-save:hover {
    background: rgba(34, 197, 94, 0.14);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.12);
  }

  .sp-detail-btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ---- Screenshot Section ---- */

  .sp-detail-screenshot {
    display: block;
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border);
    background: var(--sp-glass-bg-heavy);
  }

  /* ---- 수정 검증 (verify-fix) row under a closed feedback's screenshot ---- */

  .sp-detail-verify-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .sp-detail-verify-label {
    font-size: 11px;
    color: var(--sp-text-tertiary);
    margin-right: auto;
  }

  .sp-detail-verify-btn {
    height: 28px;
    padding: 0 12px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: var(--sp-glass-bg);
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .sp-detail-verify-btn:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
  }

  .sp-detail-verify-btn--keep {
    border-color: rgba(46, 125, 70, 0.4);
    color: #2e7d46;
  }

  .sp-detail-verify-btn--reopen {
    border-color: rgba(179, 38, 30, 0.35);
    color: #b3261e;
  }

  .sp-detail-verify-btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* ---- Metadata Section ---- */

  .sp-detail-meta {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .sp-detail-meta-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .sp-detail-meta-row svg {
    width: 14px;
    height: 14px;
    color: var(--sp-text-tertiary);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .sp-detail-meta-content {
    flex: 1;
    min-width: 0;
  }

  .sp-detail-meta-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    margin-bottom: 4px;
  }

  .sp-detail-meta-value {
    font-size: 13px;
    line-height: 1.4;
    color: var(--sp-text);
    word-break: break-all;
  }

  .sp-detail-meta-value--mono {
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    background: var(--sp-glass-bg-heavy);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--sp-glass-border-subtle);
  }

  .sp-detail-meta-value--secondary {
    color: var(--sp-text-secondary);
    font-size: 12px;
  }

  /* ---- Annotation Section ---- */

  .sp-detail-annotation {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sp-detail-resolution-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    font-size: 12px;
    font-weight: 600;
  }

  .sp-detail-resolution-badge svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .sp-detail-resolution-badge--found {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .sp-detail-resolution-badge--approximate {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .sp-detail-resolution-badge--unresolved {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .sp-detail-reconnect-btn {
    width: 100%;
    height: 36px;
  }

  .sp-detail-reconnect-picking {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--sp-radius);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
    font-size: 12px;
    font-weight: 600;
  }

  .sp-detail-annotation-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: var(--sp-radius);
    background: var(--sp-glass-bg-heavy);
    border: 1px solid var(--sp-glass-border-subtle);
  }

  .sp-detail-annotation-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .sp-detail-annotation-row svg {
    width: 13px;
    height: 13px;
    color: var(--sp-text-tertiary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .sp-detail-annotation-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    margin-bottom: 3px;
  }

  .sp-detail-annotation-value {
    font-size: 12px;
    line-height: 1.4;
    color: var(--sp-text);
    word-break: break-all;
  }

  .sp-detail-annotation-value--mono {
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 11px;
    background: var(--sp-bg-hover);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sp-detail-btn-goto {
    width: 100%;
    height: 44px;
    padding: 0 20px;
    border-radius: var(--sp-radius);
    border: none;
    background: var(--sp-accent-gradient);
    color: #fff;
    font-family: var(--sp-font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 2px 12px var(--sp-accent-glow);
  }

  .sp-detail-btn-goto svg {
    width: 16px;
    height: 16px;
  }

  .sp-detail-btn-goto:hover {
    box-shadow: 0 4px 20px var(--sp-accent-glow);
    transform: translateY(-2px);
  }

  .sp-detail-btn-goto:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  /* ---- Forced Colors / High Contrast ---- */

  @media (forced-colors: active) {
    .sp-detail {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
    }

    .sp-detail-back,
    .sp-detail-btn-goto,
    .sp-detail-btn-resolve,
    .sp-detail-btn-reopen,
    .sp-detail-btn-delete,
    .sp-detail-btn-save,
    .sp-detail-message-edit-btn,
    .sp-detail-message-textarea,
    .sp-detail-resolution-badge,
    .sp-detail-reconnect-picking {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-detail-back:focus-visible,
    .sp-detail-btn-goto:focus-visible,
    .sp-detail-btn-resolve:focus-visible,
    .sp-detail-btn-reopen:focus-visible,
    .sp-detail-btn-delete:focus-visible {
      outline: 3px solid Highlight !important;
    }

    .sp-detail-status-pill {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-detail-message {
      border-left: 3px solid ButtonText !important;
    }
  }

  /* ---- Diagnostics Section ---- */

  .sp-detail-diag {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sp-detail-diag-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg-heavy);
    color: var(--sp-text);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .sp-detail-diag-toggle:hover {
    background: var(--sp-bg-hover);
  }

  .sp-detail-diag-toggle svg {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
  }

  .sp-detail-diag-toggle[aria-expanded="true"] svg {
    transform: rotate(90deg);
  }

  .sp-detail-diag-counts {
    display: inline-flex;
    gap: 6px;
    font-weight: 500;
    color: var(--sp-text-tertiary);
  }

  .sp-detail-diag-count {
    padding: 1px 7px;
    border-radius: var(--sp-radius-full);
    background: var(--sp-bg-hover);
    font-variant-numeric: tabular-nums;
  }

  .sp-detail-diag-count--errors {
    background: rgba(239, 68, 68, 0.14);
    color: #ef4444;
  }

  .sp-detail-diag-body {
    display: none;
    flex-direction: column;
    gap: 14px;
  }

  .sp-detail-diag-body--open {
    display: flex;
  }

  .sp-detail-diag-group-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .sp-detail-diag-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg-heavy);
    max-height: 240px;
    overflow-y: auto;
  }

  .sp-detail-diag-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--sp-glass-border-subtle);
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 11px;
    line-height: 1.45;
    color: var(--sp-text);
  }

  .sp-detail-diag-list li:last-child {
    border-bottom: none;
  }

  .sp-detail-diag-level {
    flex-shrink: 0;
    font-weight: 700;
    width: 44px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10px;
  }

  .sp-detail-diag-level--log {
    color: var(--sp-text-tertiary);
  }
  .sp-detail-diag-level--info {
    color: #3b82f6;
  }
  .sp-detail-diag-level--warn {
    color: #f59e0b;
  }
  .sp-detail-diag-level--error {
    color: #ef4444;
  }

  .sp-detail-diag-message {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .sp-detail-diag-net {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .sp-detail-diag-net-status {
    flex-shrink: 0;
    font-weight: 700;
    color: #ef4444;
    min-width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .sp-detail-diag-net-method {
    flex-shrink: 0;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    min-width: 44px;
  }

  .sp-detail-diag-net-url {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--sp-text);
  }

  .sp-detail-diag-empty {
    padding: 12px;
    font-style: italic;
    font-size: 11px;
    color: var(--sp-text-tertiary);
    text-align: center;
  }

  /* ---- Reduced Motion ---- */

  @media (prefers-reduced-motion: reduce) {
    .sp-detail {
      transition-duration: 0.01ms !important;
    }

    .sp-detail-section {
      animation-duration: 0.01ms !important;
    }
  }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a userAgent string to extract the browser name and version. */
function parseBrowser(ua: string): string {
  // Order matters: Edge includes "Edg/", Chrome includes "Chrome/", etc.
  if (/Edg\//i.test(ua)) {
    const m = ua.match(/Edg\/([\d.]+)/);
    return m ? `Edge ${m[1]}` : "Edge";
  }
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    const m = ua.match(/OPR\/([\d.]+)/);
    return m ? `Opera ${m[1]}` : "Opera";
  }
  if (/Firefox\//i.test(ua)) {
    const m = ua.match(/Firefox\/([\d.]+)/);
    return m ? `Firefox ${m[1]}` : "Firefox";
  }
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    const m = ua.match(/Chrome\/([\d.]+)/);
    return m ? `Chrome ${m[1]}` : "Chrome";
  }
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    const m = ua.match(/Version\/([\d.]+)/);
    return m ? `Safari ${m[1]}` : "Safari";
  }
  return "Unknown";
}

/** Format an ISO date string to a full locale-aware date/time. */
function formatFullDate(isoString: string, locale: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/** Extract the pathname from a URL string, falling back to the raw string. */
function extractPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/**
 * Whitelist URL schemes that are safe to use as `<img src>`. Defends against
 * a buggy or compromised `ScreenshotStorage` (or DB) writing a `javascript:`,
 * `data:text/html`, or `data:image/svg+xml` URL — the latter can host
 * external `<image href>` references that exfiltrate IP/UA/Referer when the
 * panel renders. Browsers refuse to execute scripts via `<img>`, but the
 * fetch itself still happens for arbitrary URLs.
 */
function isSafeImageUrl(url: string): boolean {
  // data:image/(jpeg|png|webp) is what the widget produces; SVG is excluded
  // because it can contain external references and is rarely a useful
  // screenshot format.
  if (/^data:image\/(jpeg|png|webp);/i.test(url)) return true;
  // Remote URLs over https are accepted (S3, R2, etc.). http: is rejected
  // because the panel typically runs over https and mixed-content is blocked
  // anyway — surfacing the issue here is clearer than a silent network error.
  if (/^https:\/\//i.test(url)) return true;
  return false;
}

/** Truncate a string to a max length with ellipsis. */
function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "\u2026";
}

/**
 * Whether a feedback carries a usable diagnostics payload. We only render the
 * section when at least one channel has entries; the section title alone with
 * two empty lists is just noise.
 */
function hasDiagnostics(diagnostics: FeedbackResponse["diagnostics"]): boolean {
  if (!diagnostics) return false;
  const consoleLen = Array.isArray(diagnostics.console) ? diagnostics.console.length : 0;
  const networkLen = Array.isArray(diagnostics.network) ? diagnostics.network.length : 0;
  return consoleLen > 0 || networkLen > 0;
}

/** Format a duration in ms as a compact "123 ms" / "1.4 s" string. */
function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "\u2014";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

export interface DetailCallbacks {
  onBack: () => void;
  onResolve: (feedback: FeedbackResponse) => Promise<void>;
  onDelete: (feedback: FeedbackResponse) => Promise<void>;
  /** Edit the note text in place (G7) — status/target are unaffected. */
  onEditMessage: (feedback: FeedbackResponse, message: string) => Promise<void>;
  /** Re-point an unresolved/ambiguous target at a freshly picked element (G7 "재연결"). Replaces the whole target set. */
  onReconnect: (feedback: FeedbackResponse, annotations: AnnotationPayload[]) => Promise<void>;
  onGoToAnnotation: (feedback: FeedbackResponse) => void;
  /** Drop this feedback's agent prompt into the server outbox ("Agent에게" handoff). Absent when the backend has no outbox — the button doesn't render then. */
  onHandoff?: (feedback: FeedbackResponse) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// DetailView Class
// ---------------------------------------------------------------------------

export class DetailView {
  readonly element: HTMLElement;

  private _isVisible = false;
  private currentFeedback: FeedbackResponse | null = null;
  private readonly content: HTMLElement;
  private readonly t: TFunction;
  private readonly locale: string;
  private resolveBtn: HTMLButtonElement | null = null;
  private deleteBtn: HTMLButtonElement | null = null;
  private isProcessing = false;
  private readonly agentCopyBtn: AgentCopyButton;
  private messageSectionEl: HTMLElement | null = null;
  private editingMessage = false;
  private savingMessage = false;

  // --- G7 reconnect ---
  private annotationSectionEl: HTMLElement | null = null;
  private reconnecting = false;
  private cleanupReconnectPick: (() => void) | null = null;

  constructor(
    private readonly colors: ThemeColors,
    private readonly callbacks: DetailCallbacks,
    t: TFunction,
    locale: string,
    getContainer: () => HTMLElement | ShadowRoot,
  ) {
    this.t = t;
    this.locale = locale;

    this.agentCopyBtn = new AgentCopyButton(
      colors,
      {
        getFeedbacks: () => (this.currentFeedback ? [this.currentFeedback] : []),
        getContainer,
        variant: "detail",
      },
      t,
    );

    // Root container
    this.element = el("div", { class: "sp-detail" });
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-label", "Feedback detail");
    this.element.setAttribute("aria-hidden", "true");

    // Header (built once, title/badge updated on show())
    const header = el("div", { class: "sp-detail-header" });

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "sp-detail-back";
    backBtn.setAttribute("aria-label", this.t("detail.back"));
    backBtn.appendChild(parseSvg(ICON_ARROW_LEFT));
    backBtn.addEventListener("click", () => {
      this.hide();
      this.callbacks.onBack();
    });

    this.element.appendChild(header);
    header.appendChild(backBtn);

    // Title and badge are appended in show()

    // Scrollable content area
    this.content = el("div", { class: "sp-detail-content" });
    this.element.appendChild(this.content);
  }

  /** Show the detail view for a specific feedback. */
  show(feedback: FeedbackResponse, number: number): void {
    this.currentFeedback = feedback;
    this.isProcessing = false;

    // ---- Update header ----
    const header = this.element.querySelector<HTMLElement>(".sp-detail-header");
    if (!header) return;
    // Remove old title/badge but keep the back button
    const backBtn = header.querySelector<HTMLElement>(".sp-detail-back");
    if (!backBtn) return;
    header.replaceChildren(backBtn);

    const title = el("span", { class: "sp-detail-title" });
    setText(title, tWithParams(this.t, "detail.title", { number }));
    header.appendChild(title);

    const badge = el("span", { class: "sp-badge" });
    badge.style.background = getTypeBgColor(feedback.type, this.colors);
    badge.style.color = getTypeColor(feedback.type, this.colors);
    setText(badge, feedback.type);
    header.appendChild(badge);

    // ---- Build content sections ----
    this.content.replaceChildren();

    let sectionIndex = 0;

    // Section 1: Status + Actions
    const statusSection = this.buildSection(sectionIndex++);
    this.buildStatusActions(statusSection, feedback);
    this.content.appendChild(statusSection);

    // Section 2: Message (editable — G7)
    const messageSection = this.buildSection(sectionIndex++);
    this.messageSectionEl = messageSection;
    this.editingMessage = false;
    this.savingMessage = false;
    this.renderMessageSection(feedback);
    this.content.appendChild(messageSection);

    // Section 2b: Screenshot (when captured)
    if (feedback.screenshotUrl && isSafeImageUrl(feedback.screenshotUrl)) {
      const screenshotSection = this.buildSection(sectionIndex++);
      const screenshotSectionTitle = el("div", { class: "sp-detail-section-title" });
      setText(screenshotSectionTitle, this.t("detail.screenshot"));
      screenshotSection.appendChild(screenshotSectionTitle);

      const img = document.createElement("img");
      img.className = "sp-detail-screenshot";
      img.src = feedback.screenshotUrl;
      img.alt = this.t("detail.screenshotAlt");
      img.loading = "lazy";
      // Avoid leaking the panel viewer's referrer to the storage host —
      // a malicious or compromised storage URL could otherwise track which
      // operators view which feedbacks.
      img.referrerPolicy = "no-referrer";
      screenshotSection.appendChild(img);

      // 수정 검증 (G-v3): a CLOSED feedback with a capture gets a 10-second
      // human check — "그때 스크린샷" above, one click to the live view, and
      // an approve/reopen verdict. The verdict buttons reuse onResolve's
      // binary toggle (closed → reopen).
      if (isClosedStatus(feedback.status)) {
        const verifyRow = el("div", { class: "sp-detail-verify-row" });

        const thenLabel = el("span", { class: "sp-detail-verify-label" });
        setText(thenLabel, this.t("detail.verifyThen"));
        verifyRow.appendChild(thenLabel);

        const goLiveBtn = document.createElement("button");
        goLiveBtn.className = "sp-detail-verify-btn";
        setText(goLiveBtn, this.t("detail.verifyNow"));
        goLiveBtn.addEventListener("click", () => this.callbacks.onGoToAnnotation(feedback));
        verifyRow.appendChild(goLiveBtn);

        const keepBtn = document.createElement("button");
        keepBtn.className = "sp-detail-verify-btn sp-detail-verify-btn--keep";
        setText(keepBtn, this.t("detail.verifyKeepResolved"));
        keepBtn.addEventListener("click", () => {
          verifyRow.remove(); // verdict given — nothing left to ask
        });
        verifyRow.appendChild(keepBtn);

        const reopenBtn = document.createElement("button");
        reopenBtn.className = "sp-detail-verify-btn sp-detail-verify-btn--reopen";
        setText(reopenBtn, this.t("detail.verifyReopen"));
        reopenBtn.addEventListener("click", () => {
          reopenBtn.disabled = true;
          this.callbacks.onResolve(feedback).catch(() => {
            reopenBtn.disabled = false;
          });
        });
        verifyRow.appendChild(reopenBtn);

        screenshotSection.appendChild(verifyRow);
      }

      this.content.appendChild(screenshotSection);
    }

    // Section 3: Metadata
    const metaSection = this.buildSection(sectionIndex++);
    const metaSectionTitle = el("div", { class: "sp-detail-section-title" });
    setText(metaSectionTitle, this.t("detail.metadata"));
    metaSection.appendChild(metaSectionTitle);
    this.buildMetadata(metaSection, feedback);
    this.content.appendChild(metaSection);

    // Section 4: Annotation (if any) — target resolution status + reconnect (G7)
    if (feedback.annotations.length > 0) {
      const annSection = this.buildSection(sectionIndex++);
      this.annotationSectionEl = annSection;
      this.reconnecting = false;
      this.cleanupReconnectPick?.();
      this.cleanupReconnectPick = null;
      this.renderAnnotationSection(feedback);
      this.content.appendChild(annSection);
    } else {
      this.annotationSectionEl = null;
    }

    // Section 5: Diagnostics (only when present + non-empty).
    // Skipped silently when the widget was launched without capture, so legacy
    // records (and hosts who never opt in) never see an empty pane.
    if (hasDiagnostics(feedback.diagnostics)) {
      const diagSection = this.buildSection(sectionIndex++);
      const diagSectionTitle = el("div", { class: "sp-detail-section-title" });
      diagSectionTitle.appendChild(parseSvg(ICON_TERMINAL));
      const diagTitleText = el("span");
      setText(diagTitleText, this.t("detail.diagnostics"));
      diagSectionTitle.appendChild(diagTitleText);
      diagSection.appendChild(diagSectionTitle);
      this.buildDiagnostics(diagSection, feedback);
      this.content.appendChild(diagSection);
    }

    // ---- Show with animation ----
    this._isVisible = true;
    this.element.setAttribute("aria-hidden", "false");

    // Force reflow before adding visible class to trigger CSS transition
    void this.element.offsetHeight;
    this.element.classList.add("sp-detail--visible");

    // Focus the back button for keyboard users
    requestAnimationFrame(() => {
      backBtn.focus();
    });
  }

  /** Hide the detail view with slide-out animation. */
  hide(): void {
    if (!this._isVisible) return;
    this._isVisible = false;
    this.element.classList.remove("sp-detail--visible");
    this.element.setAttribute("aria-hidden", "true");
    this.currentFeedback = null;
    this.resolveBtn = null;
    this.deleteBtn = null;
    this.cleanupReconnectPick?.();
    this.cleanupReconnectPick = null;
    this.reconnecting = false;
  }

  /** Whether the detail view is currently visible. */
  get isVisible(): boolean {
    return this._isVisible;
  }

  /** Cleanup all references. */
  destroy(): void {
    this.hide();
    this.agentCopyBtn.destroy();
    this.element.remove();
  }

  // -----------------------------------------------------------------------
  // Private — Section builders
  // -----------------------------------------------------------------------

  /** Create a section element with stagger delay. */
  private buildSection(index: number): HTMLElement {
    const section = el("div", { class: "sp-detail-section" });
    section.style.animationDelay = `${index * 40}ms`;
    return section;
  }

  /** Build Status pill + Resolve/Delete action buttons. */
  private buildStatusActions(container: HTMLElement, feedback: FeedbackResponse): void {
    // Closed = terminal (resolved, wont_fix): actions stay binary — closed
    // feedbacks get "Reopen", everything else gets "Resolve" — but the pill
    // always renders the record's actual status.
    const isClosed = isClosedStatus(feedback.status);

    // Section title
    const sectionTitle = el("div", { class: "sp-detail-section-title" });
    setText(sectionTitle, this.t("detail.status"));
    container.appendChild(sectionTitle);

    // Status pill — one modifier class per status (open, in-progress,
    // resolved, wont-fix), each with its own dot colour.
    const statusModifier = feedback.status.replace(/_/g, "-");
    const dotColors: Record<FeedbackStatus, string> = {
      open: "#22c55e",
      in_progress: "#f59e0b",
      resolved: "#9ca3af",
      wont_fix: "#94a3b8",
    };
    const statusRow = el("div", { class: "sp-detail-status" });
    const pill = el("span", {
      class: `sp-detail-status-pill sp-detail-status-pill--${statusModifier}`,
    });
    const dot = el("span", { class: "sp-detail-status-dot" });
    dot.style.background = dotColors[feedback.status] ?? dotColors.open;
    pill.appendChild(dot);
    const pillLabel = el("span");
    setText(pillLabel, getStatusLabel(feedback.status, this.t));
    pill.appendChild(pillLabel);
    statusRow.appendChild(pill);
    container.appendChild(statusRow);

    // Action buttons
    const actions = el("div", { class: "sp-detail-actions" });

    // Resolve / Reopen
    this.resolveBtn = document.createElement("button");
    this.resolveBtn.type = "button";
    if (isClosed) {
      this.resolveBtn.className = "sp-detail-btn-reopen";
      this.resolveBtn.appendChild(parseSvg(ICON_UNDO));
      const span = document.createElement("span");
      setText(span, this.t("detail.reopen"));
      this.resolveBtn.appendChild(span);
    } else {
      this.resolveBtn.className = "sp-detail-btn-resolve";
      this.resolveBtn.appendChild(parseSvg(ICON_CHECK));
      const span = document.createElement("span");
      setText(span, this.t("detail.resolve"));
      this.resolveBtn.appendChild(span);
    }
    this.resolveBtn.addEventListener("click", () => this.handleResolve());

    // Delete
    this.deleteBtn = document.createElement("button");
    this.deleteBtn.type = "button";
    this.deleteBtn.className = "sp-detail-btn-delete";
    this.deleteBtn.appendChild(parseSvg(ICON_TRASH));
    const deleteSpan = document.createElement("span");
    setText(deleteSpan, this.t("detail.delete"));
    this.deleteBtn.appendChild(deleteSpan);
    this.deleteBtn.addEventListener("click", () => this.handleDelete());

    actions.appendChild(this.resolveBtn);
    actions.appendChild(this.deleteBtn);
    container.appendChild(actions);
    container.appendChild(this.agentCopyBtn.element);

    // "Agent에게" — one click drops this feedback's prompt into the server's
    // outbox for `instafix watch` to deliver into the developer's RUNNING
    // Claude Code session (mode B handoff). Only rendered when the backend
    // path exists (HTTP client + adapter-fs); on a 404/failed handoff the
    // button reports it inline instead of pretending.
    if (this.callbacks.onHandoff) {
      const handoffBtn = document.createElement("button");
      handoffBtn.type = "button";
      handoffBtn.className = "sp-agent-btn sp-agent-btn--detail";
      const handoffLabel = document.createElement("span");
      setText(handoffLabel, `⇥ ${this.t("agent.sendToAgent")}`);
      handoffBtn.appendChild(handoffLabel);
      handoffBtn.addEventListener("click", async () => {
        handoffBtn.disabled = true;
        const ok = await this.callbacks.onHandoff?.(feedback);
        handoffBtn.disabled = false;
        setText(handoffLabel, ok ? `✓ ${this.t("agent.handedOff")}` : this.t("agent.sendToAgentFailed"));
        setTimeout(() => setText(handoffLabel, `⇥ ${this.t("agent.sendToAgent")}`), 2000);
      });
      container.appendChild(handoffBtn);
    }
  }

  /**
   * Render the Message section — either the read-only text with an edit
   * button, or an inline textarea + Save/Cancel form (G7 "편집"). Re-renders
   * in place inside `messageSectionEl` rather than the whole detail view, so
   * toggling edit mode doesn't disturb scroll position or other sections.
   */
  private renderMessageSection(feedback: FeedbackResponse): void {
    const container = this.messageSectionEl;
    if (!container) return;
    container.replaceChildren();

    const header = el("div", { class: "sp-detail-message-header" });
    const title = el("div", { class: "sp-detail-section-title" });
    setText(title, this.t("detail.message"));
    header.appendChild(title);

    if (!this.editingMessage) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "sp-detail-message-edit-btn";
      editBtn.setAttribute("aria-label", this.t("detail.editMessage"));
      editBtn.appendChild(parseSvg(ICON_EDIT));
      editBtn.addEventListener("click", () => {
        this.editingMessage = true;
        this.renderMessageSection(feedback);
      });
      header.appendChild(editBtn);
      container.appendChild(header);

      const messageBlock = el("div", { class: "sp-detail-message" });
      messageBlock.style.borderLeftColor = getTypeColor(feedback.type, this.colors);
      setText(messageBlock, feedback.message);
      container.appendChild(messageBlock);
      return;
    }

    container.appendChild(header);

    const textarea = document.createElement("textarea");
    textarea.className = "sp-detail-message-textarea";
    textarea.value = feedback.message;
    textarea.setAttribute("aria-label", this.t("detail.editMessage"));
    textarea.disabled = this.savingMessage;
    container.appendChild(textarea);

    const actions = el("div", { class: "sp-detail-message-actions" });
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "sp-btn-ghost";
    setText(cancelBtn, this.t("panel.cancel"));
    cancelBtn.disabled = this.savingMessage;
    cancelBtn.addEventListener("click", () => {
      this.editingMessage = false;
      this.renderMessageSection(feedback);
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "sp-detail-btn-save";
    setText(saveBtn, this.t("detail.saveMessage"));
    saveBtn.addEventListener("click", () => {
      const next = textarea.value.trim();
      if (!next || this.savingMessage) return;

      // Manipulate the live form in place rather than re-rendering from
      // `feedback.message` — a failed save must leave the user's edited
      // text exactly as they typed it (G7 "입력 원문을 회수할 수 있다"),
      // not reset to the pre-edit value.
      this.savingMessage = true;
      textarea.disabled = true;
      saveBtn.disabled = true;
      cancelBtn.disabled = true;

      this.callbacks
        .onEditMessage(feedback, next)
        .then(() => {
          // The parent re-shows with the updated record (edit mode implicitly ends).
        })
        .catch(() => {
          this.savingMessage = false;
          textarea.disabled = false;
          saveBtn.disabled = false;
          cancelBtn.disabled = false;
          textarea.focus();
        });
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    container.appendChild(actions);

    requestAnimationFrame(() => textarea.focus());
  }

  /** Build the metadata grid. */
  private buildMetadata(container: HTMLElement, feedback: FeedbackResponse): void {
    const meta = el("div", { class: "sp-detail-meta" });

    // Page
    this.addMetaRow(meta, ICON_LINK, this.t("detail.page"), () => {
      const value = el("div", { class: "sp-detail-meta-value" });
      const pathname = extractPathname(feedback.url);
      setText(value, truncate(pathname, 60));
      value.title = feedback.url;
      return value;
    });

    // Author
    this.addMetaRow(meta, ICON_USER, this.t("detail.author"), () => {
      const value = el("div", { class: "sp-detail-meta-value" });
      const name = feedback.authorName || "Anonymous";
      const email = feedback.authorEmail;
      setText(value, email ? `${name} (${email})` : name);
      return value;
    });

    // Date
    this.addMetaRow(meta, ICON_CALENDAR, this.t("detail.date"), () => {
      const value = el("div", { class: "sp-detail-meta-value" });
      setText(value, formatFullDate(feedback.createdAt, this.locale.startsWith("fr") ? "fr" : "en"));
      return value;
    });

    // Viewport
    this.addMetaRow(meta, ICON_MONITOR, this.t("detail.viewport"), () => {
      const value = el("div", { class: "sp-detail-meta-value sp-detail-meta-value--mono" });
      setText(value, feedback.viewport || "Unknown");
      return value;
    });

    // Browser
    this.addMetaRow(
      meta,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      this.t("detail.browser"),
      () => {
        const value = el("div", { class: "sp-detail-meta-value" });
        setText(value, parseBrowser(feedback.userAgent));
        return value;
      },
    );

    // Closure date (resolvedAt is the closure timestamp for BOTH terminal
    // statuses — label it "closed" rather than "resolved" for won't-fix)
    if (feedback.resolvedAt) {
      const resolvedDate = feedback.resolvedAt;
      const dateLabel = feedback.status === "wont_fix" ? this.t("detail.closedAt") : this.t("detail.resolvedAt");
      this.addMetaRow(meta, ICON_CHECK, dateLabel, () => {
        const value = el("div", { class: "sp-detail-meta-value sp-detail-meta-value--secondary" });
        setText(value, formatFullDate(resolvedDate, this.locale.startsWith("fr") ? "fr" : "en"));
        return value;
      });
    }

    container.appendChild(meta);
  }

  /** Add a single metadata row with icon, label, and custom value element. */
  private addMetaRow(container: HTMLElement, iconSvg: string, label: string, buildValue: () => HTMLElement): void {
    const row = el("div", { class: "sp-detail-meta-row" });
    row.appendChild(parseSvg(iconSvg));

    const content = el("div", { class: "sp-detail-meta-content" });
    const labelEl = el("div", { class: "sp-detail-meta-label" });
    setText(labelEl, label);
    content.appendChild(labelEl);
    content.appendChild(buildValue());

    row.appendChild(content);
    container.appendChild(row);
  }

  /** Build the annotation detail section. */
  /**
   * Render the Annotation section: title, target resolution status
   * (resolved/approximate/unresolved \u2014 G4/G7), the existing selector/
   * position info, "Go to annotation", and a "Reconnect" action that
   * re-points the target at a freshly clicked element (G7 "\uc7ac\uc5f0\uacb0").
   * Re-renders in place inside `annotationSectionEl`, mirroring
   * `renderMessageSection`, so entering/leaving pick mode doesn't disturb
   * the rest of the detail view.
   */
  private renderAnnotationSection(feedback: FeedbackResponse): void {
    const container = this.annotationSectionEl;
    const ann = feedback.annotations[0];
    if (!container || !ann) return;
    container.replaceChildren();

    const title = el("div", { class: "sp-detail-section-title" });
    title.appendChild(parseSvg(ICON_MAP_PIN));
    const titleText = el("span");
    setText(titleText, this.t("detail.annotation"));
    title.appendChild(titleText);
    container.appendChild(title);

    const wrapper = el("div", { class: "sp-detail-annotation" });

    // Target kind \u2014 `area` has no DOM element to resolve/reconnect at all.
    const targetKind = (ann as { target?: { kind: string } | null }).target?.kind ?? "element";
    const isReconnectable = targetKind !== "area";

    if (isReconnectable) {
      wrapper.appendChild(this.buildResolutionStatus(ann));
    }

    // Info card
    const info = el("div", { class: "sp-detail-annotation-info" });

    // Element tag
    this.addAnnotationRow(info, ICON_CODE, this.t("detail.element"), () => {
      const value = el("span", { class: "sp-detail-annotation-value sp-detail-annotation-value--mono" });
      const tagDisplay = ann.elementId ? `<${ann.elementTag}#${ann.elementId}>` : `<${ann.elementTag}>`;
      setText(value, tagDisplay);
      return value;
    });

    // CSS selector
    this.addAnnotationRow(info, ICON_CROSSHAIR, this.t("detail.selector"), () => {
      const value = el("span", { class: "sp-detail-annotation-value sp-detail-annotation-value--mono" });
      setText(value, truncate(ann.cssSelector, 60));
      value.title = ann.cssSelector;
      return value;
    });

    // Position
    this.addAnnotationRow(info, ICON_MAP_PIN, this.t("detail.position"), () => {
      const value = el("span", { class: "sp-detail-annotation-value" });
      setText(
        value,
        `${ann.xPct.toFixed(1)}%, ${ann.yPct.toFixed(1)}%` +
          (ann.wPct > 0 || ann.hPct > 0 ? ` (${ann.wPct.toFixed(1)}% \u00d7 ${ann.hPct.toFixed(1)}%)` : ""),
      );
      return value;
    });

    wrapper.appendChild(info);

    // "Go to annotation" button
    const gotoBtn = document.createElement("button");
    gotoBtn.type = "button";
    gotoBtn.className = "sp-detail-btn-goto";
    gotoBtn.appendChild(parseSvg(ICON_MAP_PIN));
    const gotoLabel = document.createElement("span");
    setText(gotoLabel, this.t("detail.goToAnnotation"));
    gotoBtn.appendChild(gotoLabel);
    gotoBtn.addEventListener("click", () => {
      if (this.currentFeedback) {
        this.callbacks.onGoToAnnotation(this.currentFeedback);
      }
    });
    wrapper.appendChild(gotoBtn);

    if (isReconnectable) {
      wrapper.appendChild(this.buildReconnectButton(feedback));
    }

    container.appendChild(wrapper);
  }

  /** Resolve the first annotation's anchor right now and render a status badge \u2014 icon + text, never color alone (G8). */
  private buildResolutionStatus(ann: FeedbackResponse["annotations"][number]): HTMLElement {
    const resolution =
      typeof document !== "undefined"
        ? resolveAnchor({
            cssSelector: ann.cssSelector,
            xpath: ann.xpath,
            textSnippet: ann.textSnippet,
            elementTag: ann.elementTag,
            elementId: ann.elementId ?? undefined,
            textPrefix: ann.textPrefix,
            textSuffix: ann.textSuffix,
            fingerprint: ann.fingerprint,
            neighborText: ann.neighborText,
            anchorKey: ann.anchorKey ?? null,
          })
        : null;

    const badge = el("div", { class: "sp-detail-resolution-badge" });
    if (!resolution) {
      badge.classList.add("sp-detail-resolution-badge--unresolved");
      badge.appendChild(parseSvg(ICON_X_CIRCLE));
      const text = el("span");
      setText(text, this.t("detail.targetNotFound"));
      badge.appendChild(text);
    } else if (resolution.confidence < 0.7) {
      badge.classList.add("sp-detail-resolution-badge--approximate");
      badge.appendChild(parseSvg(ICON_ALERT_TRIANGLE));
      const text = el("span");
      setText(
        text,
        tWithParams(this.t, "detail.targetApproximate", { confidence: Math.round(resolution.confidence * 100) }),
      );
      badge.appendChild(text);
    } else {
      badge.classList.add("sp-detail-resolution-badge--found");
      badge.appendChild(parseSvg(ICON_CHECK));
      const text = el("span");
      setText(text, this.t("detail.targetFound"));
      badge.appendChild(text);
    }
    return badge;
  }

  /** "Reconnect" \u2014 either the idle button, or (while picking) a cancellable status line. */
  private buildReconnectButton(feedback: FeedbackResponse): HTMLElement {
    if (this.reconnecting) {
      const row = el("div", { class: "sp-detail-reconnect-picking" });
      const text = el("span");
      setText(text, this.t("detail.reconnectPicking"));
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "sp-btn-ghost";
      setText(cancelBtn, this.t("detail.reconnectCancel"));
      cancelBtn.addEventListener("click", () => this.stopReconnectPick(feedback));
      row.appendChild(text);
      row.appendChild(cancelBtn);
      return row;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sp-btn-ghost sp-detail-reconnect-btn";
    setText(btn, this.t("detail.reconnect"));
    btn.addEventListener("click", () => this.startReconnectPick(feedback));
    return btn;
  }

  /**
   * Enter pick mode: the next click anywhere on the host page (not our own
   * chrome) becomes the target's new anchor. Captured on `document` so it
   * works regardless of what the host page's own handlers do; the pick
   * click itself is prevented/stopped so it doesn't also trigger a host
   * button/link underneath the user's cursor.
   */
  private startReconnectPick(feedback: FeedbackResponse): void {
    if (this.reconnecting) return;
    this.reconnecting = true;
    this.renderAnnotationSection(feedback);

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement) || isWidgetChrome(target)) return; // keep listening for a real page element
      e.preventDefault();
      e.stopPropagation();
      this.finishReconnectPick(feedback, target);
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") this.stopReconnectPick(feedback);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeydown, true);
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "crosshair";

    this.cleanupReconnectPick = () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeydown, true);
      document.body.style.cursor = previousCursor;
    };
  }

  private stopReconnectPick(feedback: FeedbackResponse): void {
    this.cleanupReconnectPick?.();
    this.cleanupReconnectPick = null;
    this.reconnecting = false;
    this.renderAnnotationSection(feedback);
  }

  private finishReconnectPick(feedback: FeedbackResponse, target: HTMLElement): void {
    this.cleanupReconnectPick?.();
    this.cleanupReconnectPick = null;
    this.reconnecting = false;

    const annotation: AnnotationPayload = {
      anchor: generateAnchor(target),
      rect: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      target: { kind: "element" },
    };

    this.callbacks.onReconnect(feedback, [annotation]).catch(() => {
      // The parent surfaces the error; re-render so the button becomes clickable again.
      this.renderAnnotationSection(feedback);
    });
    this.renderAnnotationSection(feedback);
  }

  /**
   * Build the collapsible Diagnostics section.
   *
   * Toggle expand/collapse via a single button; the body is hidden by default
   * to keep the detail view compact. Console entries get a colour-coded level
   * pill, network entries get a status/method/url row truncated to fit.
   */
  private buildDiagnostics(container: HTMLElement, feedback: FeedbackResponse): void {
    const diag = feedback.diagnostics;
    if (!diag) return;

    const consoleEntries = Array.isArray(diag.console) ? diag.console : [];
    const networkEntries = Array.isArray(diag.network) ? diag.network : [];
    const errorCount = consoleEntries.filter((e) => e.level === "error").length;

    const wrapper = el("div", { class: "sp-detail-diag" });

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "sp-detail-diag-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", this.t("detail.diagnostics.expand"));
    const toggleLabel = document.createElement("span");
    const leftRow = document.createElement("span");
    leftRow.style.display = "inline-flex";
    leftRow.style.alignItems = "center";
    leftRow.style.gap = "8px";
    leftRow.appendChild(parseSvg(ICON_CHEVRON));
    setText(toggleLabel, this.t("detail.diagnostics"));
    leftRow.appendChild(toggleLabel);
    toggle.appendChild(leftRow);

    const counts = el("span", { class: "sp-detail-diag-counts" });
    const consoleCount = el("span", {
      class: `sp-detail-diag-count${errorCount > 0 ? " sp-detail-diag-count--errors" : ""}`,
    });
    setText(consoleCount, `${consoleEntries.length} console`);
    const networkCount = el("span", {
      class: `sp-detail-diag-count${networkEntries.length > 0 ? " sp-detail-diag-count--errors" : ""}`,
    });
    setText(networkCount, `${networkEntries.length} net`);
    counts.appendChild(consoleCount);
    counts.appendChild(networkCount);
    toggle.appendChild(counts);

    const body = el("div", { class: "sp-detail-diag-body" });

    // ---- Console group ----
    if (consoleEntries.length > 0) {
      const group = document.createElement("div");
      const title = el("div", { class: "sp-detail-diag-group-title" });
      setText(title, this.t("detail.diagnostics.console"));
      group.appendChild(title);

      const list = document.createElement("ul");
      list.className = "sp-detail-diag-list";
      for (const entry of consoleEntries) {
        const item = document.createElement("li");
        const level = el("span", {
          class: `sp-detail-diag-level sp-detail-diag-level--${entry.level}`,
        });
        setText(level, entry.level);
        const msg = el("span", { class: "sp-detail-diag-message" });
        // Cap the rendered message length to keep the list readable.
        setText(msg, truncate(entry.message, 240));
        msg.title = entry.message;
        item.appendChild(level);
        item.appendChild(msg);
        list.appendChild(item);
      }
      group.appendChild(list);
      body.appendChild(group);
    }

    // ---- Network group ----
    if (networkEntries.length > 0) {
      const group = document.createElement("div");
      const title = el("div", { class: "sp-detail-diag-group-title" });
      setText(title, this.t("detail.diagnostics.network"));
      group.appendChild(title);

      const list = document.createElement("ul");
      list.className = "sp-detail-diag-list";
      for (const entry of networkEntries) {
        const item = document.createElement("li");
        item.classList.add("sp-detail-diag-net");
        const status = el("span", { class: "sp-detail-diag-net-status" });
        setText(status, entry.status === 0 ? "ERR" : String(entry.status));
        const method = el("span", { class: "sp-detail-diag-net-method" });
        setText(method, entry.method);
        const url = el("span", { class: "sp-detail-diag-net-url" });
        setText(url, truncate(entry.url, 120));
        url.title = `${entry.url} — ${formatDuration(entry.durationMs)}`;
        item.appendChild(status);
        item.appendChild(method);
        item.appendChild(url);
        list.appendChild(item);
      }
      group.appendChild(list);
      body.appendChild(group);
    }

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      toggle.setAttribute("aria-expanded", String(next));
      toggle.setAttribute(
        "aria-label",
        next ? this.t("detail.diagnostics.collapse") : this.t("detail.diagnostics.expand"),
      );
      body.classList.toggle("sp-detail-diag-body--open", next);
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(body);
    container.appendChild(wrapper);
  }

  /** Add a single annotation info row. */
  private addAnnotationRow(
    container: HTMLElement,
    iconSvg: string,
    label: string,
    buildValue: () => HTMLElement,
  ): void {
    const row = el("div", { class: "sp-detail-annotation-row" });
    row.appendChild(parseSvg(iconSvg));

    const content = el("div", { class: "sp-detail-meta-content" });
    const labelEl = el("div", { class: "sp-detail-annotation-label" });
    setText(labelEl, label);
    content.appendChild(labelEl);
    content.appendChild(buildValue());

    row.appendChild(content);
    container.appendChild(row);
  }

  // -----------------------------------------------------------------------
  // Private — Action handlers
  // -----------------------------------------------------------------------

  private async handleResolve(): Promise<void> {
    if (this.isProcessing || !this.currentFeedback) return;
    this.isProcessing = true;

    if (this.resolveBtn) this.setButtonLoading(this.resolveBtn);
    if (this.deleteBtn) this.deleteBtn.disabled = true;

    try {
      await this.callbacks.onResolve(this.currentFeedback);
      // The parent will call hide() or re-show with updated data
    } catch {
      // Restore buttons on error
      this.isProcessing = false;
      if (this.resolveBtn) this.restoreResolveBtn(this.currentFeedback);
      if (this.deleteBtn) this.deleteBtn.disabled = false;
    }
  }

  private async handleDelete(): Promise<void> {
    if (this.isProcessing || !this.currentFeedback) return;
    this.isProcessing = true;

    if (this.deleteBtn) this.setButtonLoading(this.deleteBtn);
    if (this.resolveBtn) this.resolveBtn.disabled = true;

    try {
      await this.callbacks.onDelete(this.currentFeedback);
      // The parent will call hide() after deletion
    } catch {
      this.isProcessing = false;
      if (this.deleteBtn) this.restoreDeleteBtn();
      if (this.resolveBtn) this.resolveBtn.disabled = false;
    }
  }

  private setButtonLoading(btn: HTMLButtonElement): void {
    btn.disabled = true;
    btn.replaceChildren(el("div", { class: "sp-spinner sp-spinner--sm" }));
  }

  private restoreResolveBtn(feedback: FeedbackResponse): void {
    if (!this.resolveBtn) return;
    this.resolveBtn.disabled = false;
    this.resolveBtn.replaceChildren();

    const isClosed = isClosedStatus(feedback.status);
    this.resolveBtn.appendChild(parseSvg(isClosed ? ICON_UNDO : ICON_CHECK));
    const span = document.createElement("span");
    setText(span, isClosed ? this.t("detail.reopen") : this.t("detail.resolve"));
    this.resolveBtn.appendChild(span);
  }

  private restoreDeleteBtn(): void {
    if (!this.deleteBtn) return;
    this.deleteBtn.disabled = false;
    this.deleteBtn.replaceChildren();
    this.deleteBtn.appendChild(parseSvg(ICON_TRASH));
    const span = document.createElement("span");
    setText(span, this.t("detail.delete"));
    this.deleteBtn.appendChild(span);
  }
}
