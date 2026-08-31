import { defineI18n } from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "ko", "fr"],
  // Every locale is explicitly prefixed, including English (/en/docs/...).
  //
  // This used to be `hideLocale: "default-locale"` (bare /docs/... for
  // English). That relies on the i18n middleware issuing a same-path
  // `NextResponse.rewrite()` to the default-locale route, which — verified
  // empirically — works in `next dev` but comes back as a raw, un-resolved
  // 307 (infinite redirect loop) in production on this self-hosted
  // (standalone) deployment once the destination is a static/ISR-cached
  // page. Every locale being explicit-prefixed avoids that code path
  // entirely: each `/xx/docs/...` URL is an ordinary top-level route, no
  // rewrite involved. `next.config.ts` redirects bare `/docs` to `/en/docs`
  // for convenience.
  hideLocale: "never",
  // Pages without a .fr.mdx/.ko.mdx twin still appear in that language's
  // tree, in English.
  fallbackLanguage: "en",
});
