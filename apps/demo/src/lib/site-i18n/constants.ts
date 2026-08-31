/**
 * Client-safe locale constants — no `next/headers` import here. Anything a
 * Client Component needs at runtime (not just as a type) must come from this
 * file rather than `./locale`, or bundling drags a server-only API into the
 * browser bundle. `./locale` re-exports these for server-side convenience.
 */
export const SITE_LOCALES = ["ko", "en", "fr"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

export const SITE_LOCALE_LABELS: Record<SiteLocale, string> = {
  ko: "한국어",
  en: "English",
  fr: "Français",
};

export const SITE_LOCALE_COOKIE = "instafix_locale";
