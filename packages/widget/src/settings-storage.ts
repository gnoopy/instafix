import type { InstaFixPosition, InstaFixTheme } from "@instafix/core";
import type { SettingsPatch } from "./settings-view.js";

const STORAGE_KEY = "instafix_settings";

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
