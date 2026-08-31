import { i18n } from "./i18n";

/** Canonical origin of the public site — every absolute docs URL derives from it. */
export const SITE_URL = "https://instafix.realstory.blog";

/**
 * Strip the locale prefix from a page URL.
 *
 * Every locale is explicit-prefixed (`hideLocale: "never"` — see the comment
 * on `i18n` in `./i18n.ts` for why), so `page.url` always carries it
 * (`/en/docs/...`, `/fr/docs/...`, `/ko/docs/...`).
 */
export function pathWithoutLocale(url: string, lang: string): string {
  return url.slice(`/${lang}`.length);
}

/** Absolute URL of a locale-neutral docs path in a given language. */
export function absoluteUrl(path: string, lang: string): string {
  return `${SITE_URL}/${lang}${path}`;
}

/**
 * hreflang map for a docs page, keyed the way Next's `alternates.languages`
 * expects.
 *
 * Every page exists in every language: those without a `.<lang>.mdx` twin are
 * served through `fallbackLanguage: "en"`, so the French URL always resolves
 * (200, `<html lang="fr">`). Declaring the pair for all of them is accurate and
 * is what tells search engines the two URLs are the same document.
 */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of i18n.languages) {
    languages[lang] = absoluteUrl(path, lang);
  }
  // x-default points at the language-neutral entry point. Bare /docs/...
  // now redirects (see next.config.ts) rather than resolving directly, so
  // point search engines straight at the canonical English URL instead.
  languages["x-default"] = absoluteUrl(path, i18n.defaultLanguage);
  return languages;
}
