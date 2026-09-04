import {
  INSTAFIX_SHARED_SETTINGS_KEY,
  type InstaFixPosition,
  type InstaFixSyncedSettings,
  type InstaFixTheme,
} from "@instafix/core";
import type { SettingsPatch } from "./settings-view.js";

// Shared with @instafix/dashboard — see INSTAFIX_SHARED_SETTINGS_KEY's doc
// comment in @instafix/core for the cross-package contract (only the
// `InstaFixSyncedSettings` fields are guaranteed shape; everything else here
// is widget-internal).
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
 * Writes the widget's currently-resolved accent color, theme, and locale
 * under the `synced*` fields of {@link InstaFixSyncedSettings} in the same
 * shared blob — read by `@instafix/dashboard` (see `readSharedSettings`
 * there) as its own fallback for whichever of `accentColor`/`theme`/`locale`
 * the host didn't pass explicitly to `<InstaFixInbox />`. Pass only the
 * fields that changed or are known; omitted fields leave whatever was
 * already stored untouched.
 *
 * Deliberately its own `synced*` fields, NOT `SettingsPatch`'s
 * `accentColor`/`theme`/`locale`, and deliberately bypassing
 * `sanitize()`/`loadPersistedSettings()` on both the read and write side
 * here: every `SettingsPatch` field in this blob is written only from an
 * explicit settings-panel change and is designed to win over the host's
 * config on the next load (see `loadPersistedSettings`'s doc comment) —
 * exactly what a visitor's remembered preference should do. The `synced*`
 * fields are written unconditionally on *every* mount (launcher.ts), so if
 * they fed back into that same merge, whatever was in effect on a visitor's
 * very first visit would silently "stick" forever, overriding every later
 * host-side config change for that returning visitor — nobody asked for
 * that. Keeping them separate, never-read-back fields avoids the loop
 * entirely while still sharing one localStorage key with
 * `@instafix/dashboard` (see `INSTAFIX_SHARED_SETTINGS_KEY`).
 */
export function syncSharedSettings(patch: { accentColor?: string; theme?: InstaFixTheme; locale?: string }): void {
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
  const synced: InstaFixSyncedSettings = {};
  if (patch.accentColor !== undefined) synced.syncedAccentColor = patch.accentColor;
  if (patch.theme !== undefined) synced.syncedTheme = patch.theme;
  if (patch.locale !== undefined) synced.syncedLocale = patch.locale;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...synced }));
  } catch {
    // localStorage disabled/full — the dashboard just won't see synced settings this session
  }
}

/** Reads back what `syncSharedSettings` last wrote — mainly for tests; the widget itself never needs its own synced values. */
export function getSyncedSettings(): InstaFixSyncedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const raw2 = parsed as Record<string, unknown>;
    const out: InstaFixSyncedSettings = {};
    if (typeof raw2.syncedAccentColor === "string" && raw2.syncedAccentColor.length > 0) {
      out.syncedAccentColor = raw2.syncedAccentColor;
    }
    if (typeof raw2.syncedTheme === "string" && THEMES.has(raw2.syncedTheme as InstaFixTheme)) {
      out.syncedTheme = raw2.syncedTheme as InstaFixTheme;
    }
    if (typeof raw2.syncedLocale === "string" && raw2.syncedLocale.length > 0) {
      out.syncedLocale = raw2.syncedLocale;
    }
    return out;
  } catch {
    return {};
  }
}
