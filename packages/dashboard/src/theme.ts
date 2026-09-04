import { INSTAFIX_SHARED_SETTINGS_KEY, type InstaFixSyncedSettings } from "@instafix/core";

/** Theme requested by the host — `auto` follows the system preference live. */
export type InboxTheme = "light" | "dark" | "auto";

const INBOX_THEMES: ReadonlySet<InboxTheme> = new Set(["light", "dark", "auto"]);

/** Concrete theme applied to the root element's `data-theme` attribute. */
export type ResolvedTheme = "light" | "dark";

const DEFAULT_ACCENT = "#0066ff";
const HEX6_RE = /^#[0-9a-fA-F]{6}$/;
const HEX3_RE = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const HEX8_RE = /^#[0-9a-fA-F]{8}$/;

/**
 * Normalize an accent color to a 6-digit hex string.
 *
 * **Only hex formats are accepted:**
 * - `#RGB`      (3-digit shorthand, expanded to 6-digit)
 * - `#RRGGBB`   (standard 6-digit)
 * - `#RRGGBBAA` (8-digit with alpha, alpha is stripped)
 *
 * Any other CSS color format (named colors like `"red"`, `hsl()`, `rgb()`,
 * `oklch()`, etc.) is **not** supported and will fall back to the default
 * accent color with a console warning. Every accent derivative in the
 * stylesheet is a `color-mix()` of this single value — no further JS color
 * math is needed.
 */
export function normalizeAccent(raw: string): string {
  if (HEX6_RE.test(raw)) return raw;
  const short = HEX3_RE.test(raw) ? raw.match(HEX3_RE) : null;
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  if (HEX8_RE.test(raw)) return raw.slice(0, 7);

  console.warn(
    `[instafix] Invalid accentColor "${raw}" — only hex colors (#RGB, #RRGGBB, #RRGGBBAA) are supported. Using default.`,
  );
  return DEFAULT_ACCENT;
}

/**
 * Read the accent color, theme, and locale `@instafix/widget` last resolved
 * and wrote to the shared `INSTAFIX_SHARED_SETTINGS_KEY` localStorage
 * entry's `synced*` fields — used as `<InstaFixInbox />`'s fallback for
 * whichever of `accentColor`/`theme`/`locale` the host doesn't pass
 * explicitly, so a visitor's widget-side settings (whether host-configured
 * or picked via the widget's own settings panel) carry over here even though
 * this is typically a full page navigation to a different route, not the
 * same JS runtime — including a direct/bookmarked visit with no query
 * string.
 *
 * Deliberately reads the `synced*` fields, NOT the widget's own
 * visitor-preference `accentColor`/`theme`/`locale` fields in the same
 * blob — those are designed to override the widget's host config on its
 * *own* next load, and reading them here too would just be reading the
 * wrong field, not reusing a mechanism (the widget writes the `synced*`
 * fields unconditionally on every mount specifically so the dashboard has
 * something safe to read).
 *
 * Each returned field is `undefined` (never a hardcoded default) when
 * nothing usable is stored for it, so the caller's own
 * `explicitProp ?? shared.field ?? componentDefault` fallback chain stays
 * the single place that knows the actual defaults. SSR-safe, and tolerant
 * of localStorage being disabled, absent, or holding a foreign/malformed
 * value (the widget owns the schema; this only reads three fields
 * defensively rather than importing any widget-internal type).
 */
export function readSharedSettings(): InstaFixSyncedSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(INSTAFIX_SHARED_SETTINGS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const raw2 = parsed as Record<string, unknown>;
    const out: InstaFixSyncedSettings = {};
    if (typeof raw2.syncedAccentColor === "string" && raw2.syncedAccentColor.length > 0) {
      out.syncedAccentColor = raw2.syncedAccentColor;
    }
    if (typeof raw2.syncedTheme === "string" && INBOX_THEMES.has(raw2.syncedTheme as InboxTheme)) {
      out.syncedTheme = raw2.syncedTheme as InboxTheme;
    }
    if (typeof raw2.syncedLocale === "string" && raw2.syncedLocale.length > 0) {
      out.syncedLocale = raw2.syncedLocale;
    }
    return out;
  } catch {
    return {};
  }
}

/** Detect if the user prefers dark mode via media query. SSR-safe (false). */
function prefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Resolve the requested theme to the concrete `light`/`dark` value applied at
 * mount time. `auto` reads the system preference once — pair it with
 * {@link watchSystemTheme} to follow later preference changes live.
 */
export function resolveInitialTheme(theme: InboxTheme): ResolvedTheme {
  if (theme === "dark") return "dark";
  if (theme === "auto") return prefersDark() ? "dark" : "light";
  return "light";
}

/**
 * Subscribe to system color-scheme changes. Returns an unsubscribe function.
 * No-ops (and returns a no-op disposer) outside the browser so SSR renders
 * never touch `window`.
 */
export function watchSystemTheme(callback: (theme: ResolvedTheme) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = (event: MediaQueryListEvent): void => {
    callback(event.matches ? "dark" : "light");
  };
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
