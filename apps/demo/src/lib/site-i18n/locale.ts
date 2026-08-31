import { cookies, headers } from "next/headers";
import { SITE_LOCALE_COOKIE, SITE_LOCALES, type SiteLocale } from "./constants";

export { SITE_LOCALE_COOKIE, SITE_LOCALE_LABELS, SITE_LOCALES, type SiteLocale } from "./constants";

/**
 * Language switcher for the marketing/landing pages — separate from the docs
 * site's own `/[lang]/docs` URL-based i18n (`@/lib/docs/i18n`). The landing
 * pages have no locale segment in their URLs (`/`, `/contact`, ...), so the
 * preference is stored in a cookie instead and read server-side on each
 * render; no client-side flash, no route restructuring.
 *
 * Server-only (imports `next/headers`) — Client Components must import the
 * constants they need from `./constants` instead.
 */
const DEFAULT_LOCALE: SiteLocale = "ko";

function isSiteLocale(value: string): value is SiteLocale {
  return (SITE_LOCALES as readonly string[]).includes(value);
}

/** First `Accept-Language` tag that matches a supported site locale, if any. */
function localeFromAcceptLanguage(header: string | null): SiteLocale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0] ?? tag;
    if (isSiteLocale(base)) return base;
  }
  return null;
}

/**
 * Resolve the visitor's site locale: explicit cookie choice first (set by
 * `LanguageSwitcher`), then browser language, then Korean (the target
 * audience for this deployment).
 */
export async function getSiteLocale(): Promise<SiteLocale> {
  const store = await cookies();
  const cookieValue = store.get(SITE_LOCALE_COOKIE)?.value;
  if (cookieValue && isSiteLocale(cookieValue)) return cookieValue;

  const hdrs = await headers();
  return localeFromAcceptLanguage(hdrs.get("accept-language")) ?? DEFAULT_LOCALE;
}
