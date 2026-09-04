import { INSTAFIX_SHARED_SETTINGS_KEY, type InstaFixPosition, type InstaFixTheme } from "@instafix/core";
import type { SettingsPatch } from "./settings-view.js";

// Shared with @instafix/dashboard — see INSTAFIX_SHARED_SETTINGS_KEY's doc
// comment in @instafix/core for the cross-package contract (only
// `syncedAccentColor` is guaranteed shape; everything else here is
// widget-internal).
const STORAGE_KEY = INSTAFIX_SHARED_SETTINGS_KEY;

const THEMES: ReadonlySet<InstaFixTheme> = new Set(["light", "dark", "auto"]);
const POSITIONS: ReadonlySet<InstaFixPosition> = new Set(["bottom-right", "bottom-left"]);

/** Narrows an unknown parsed value down to just the fields `SettingsPatch` actually declares. */
function sanitize(value: unknown): SettingsPatch {
  if (typeof value !== "object" || value === null) return {};
  const raw = value as Record<string, unknown>;
  const patch: SettingsPatch = {};
  if (typeof raw.theme === "string" && THEMES.has(raw.theme as InstaFixTheme)) patch.theme = raw.theme as InstaFixTheme;
  if (typeof raw.locale === "string" && raw.locale.length > 0) patch.locale = raw.locale;
  if (typeof raw.position === "string" && POSITIONS.has(raw.position as InstaFixPosition)) {
    patch.position = raw.position as InstaFixPosition;
  }
  if (typeof raw.accentColor === "string" && raw.accentColor.length > 0) patch.accentColor = raw.accentColor;
  if (typeof raw.enableScreenshot === "boolean") patch.enableScreenshot = raw.enableScreenshot;
  if (typeof raw.captureDiagnostics === "boolean") patch.captureDiagnostics = raw.captureDiagnostics;
  return patch;
}

/**
 * Settings the visitor changed via the panel's own settings accordion,
 * persisted globally (one entry per browser, not per host page) so they
 * survive a full reload or a fresh `initInstaFix()` call elsewhere in the
 * host app — not just the in-memory `updateConfig()` remount within the
 * current page load. Deliberately global scope: a setting change is a
 * visitor preference ("I want dark theme"), not something scoped to one URL.
 */
export function loadPersistedSettings(): SettingsPatch {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
}

/** Merges `patch` into whatever was already persisted — a settings change only ever touches one field at a time. */
export function savePersistedSettings(patch: SettingsPatch): void {
  try {
    const merged = { ...loadPersistedSettings(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage disabled/full — the setting still applies for this session, it just won't survive a reload
  }
}

/**
 * Writes the widget's currently-resolved accent color under a `syncedAccentColor`
 * field in the same shared blob — read by `@instafix/dashboard` (see
 * `readSharedAccentColor` there) as its own accent fallback when it isn't
 * given an explicit `accentColor` prop.
 *
 * Deliberately a field of its own, NOT `SettingsPatch.accentColor`, and
 * deliberately bypassing `sanitize()`/`loadPersistedSettings()` on both the
 * read and write side here: every other field in this blob is written only
 * from an explicit settings-panel change and is designed to win over the
 * host's config on the next load (see `loadPersistedSettings`'s doc
 * comment) — exactly what a visitor's remembered preference should do. This
 * one is written unconditionally on *every* mount (launcher.ts), so if it
 * fed back into that same merge, whatever accent happened to be in effect on
 * a visitor's very first visit would silently "stick" forever, overriding
 * every later host-side `accentColor` config change for that returning
 * visitor — nobody asked for that. Keeping it a separate, never-read-back
 * field avoids the loop entirely while still sharing one localStorage key
 * with `@instafix/dashboard` (see `INSTAFIX_SHARED_SETTINGS_KEY`).
 */
export function syncSharedAccentColor(accentColor: string): void {
  // Read and write are guarded separately: a corrupted/foreign existing
  // value (JSON.parse throws) should still let the write below go through
  // with `existing = {}` — otherwise a single bad blob would permanently
  // block every future sync instead of self-healing on the very next mount.
  let existing: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) existing = parsed as Record<string, unknown>;
    }
  } catch {
    // corrupted/foreign existing value — fall through with existing = {}
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, syncedAccentColor: accentColor }));
  } catch {
    // localStorage disabled/full — the dashboard just won't see a synced accent this session
  }
}

/** Reads back what `syncSharedAccentColor` last wrote — mainly for tests; the widget itself never needs its own synced value. */
export function getSyncedAccentColor(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const value = (parsed as Record<string, unknown>).syncedAccentColor;
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}
