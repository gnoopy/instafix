/**
 * Composer draft persistence (G7) — recovers an in-progress note across a
 * popup crash, SPA navigation, or full page reload. Pure storage logic,
 * kept separate from popup.ts so the recovery rules (page match, max age,
 * non-empty) are unit-testable without a DOM.
 */

import type { FeedbackType } from "@siteping/core";

export interface AnnotationDraft {
  type: FeedbackType | null;
  message: string;
  /** The page the draft was written on — a restored draft must match it, so a note about page A never resurfaces while annotating page B. */
  url: string;
  savedAt: number;
}

const DRAFT_KEY = "siteping_draft_v1";
/** A draft older than this is considered stale and never offered back. */
const MAX_AGE_MS = 30 * 60 * 1000;

/** Persist the current composer state. Best-effort — storage being full/disabled must never block typing. */
export function saveDraft(draft: AnnotationDraft, storage: Storage = sessionStorage): void {
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Quota exceeded or storage disabled (private browsing) — draft
    // recovery is a nicety, not a requirement; never throw into the caller.
  }
}

/**
 * Load a recoverable draft for `currentUrl`, or null when there isn't one —
 * absent, for a different page, stale (older than 30 minutes), or empty.
 */
export function loadDraft(
  currentUrl: string,
  storage: Storage = sessionStorage,
  now: number = Date.now(),
): AnnotationDraft | null {
  let raw: string | null;
  try {
    raw = storage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let draft: AnnotationDraft;
  try {
    draft = JSON.parse(raw) as AnnotationDraft;
  } catch {
    return null;
  }

  if (typeof draft.message !== "string" || !draft.message.trim()) return null;
  if (draft.url !== currentUrl) return null;
  if (typeof draft.savedAt !== "number" || now - draft.savedAt > MAX_AGE_MS) return null;

  return draft;
}

/** Discard the draft — called on successful submit or an explicit user cancel (not on teardown mid-session). */
export function clearDraft(storage: Storage = sessionStorage): void {
  try {
    storage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to do if storage is unavailable — there's nothing persisted to clear.
  }
}
