/**
 * Generic i18n machinery shared by the widget and the dashboard.
 *
 * Each package owns its `Translations` interface (their key sets differ) and
 * its locale dictionaries; everything else — locale normalization, the
 * custom-locale registry, lazy loading of built-ins, the translate-function
 * factory, interpolation — is identical and lives here once.
 *
 * The `loaders` map is typed `Record<Exclude<BuiltinLocale, "en">, …>`: the
 * moment a locale code is added to {@link BUILTIN_LOCALES}, every consuming
 * package fails to compile until its loader entry (and therefore its
 * dictionary file) exists. Adding a locale cannot silently fall back to
 * English anymore.
 */
import { type BuiltinLocale } from "./types.cjs";
/**
 * Lazy dictionary loaders for every non-English built-in locale. Use static
 * `() => import("./xx.cjs").then((m) => m.xx)` thunks — bundlers keep
 * emitting one chunk per locale, and only the requested one ships.
 */
export type LocaleLoaders<T> = Record<Exclude<BuiltinLocale, "en">, () => Promise<T>>;
/** Translate function over the message catalog `T`. */
export type TranslateFunction<T> = (key: keyof T & string) => string;
/** The i18n API returned by {@link createI18n}. */
export interface I18n<T> {
    /**
     * Create a translation function for the given locale.
     *
     * Locale resolution: exact language match > English fallback, per key.
     * Non-English built-in locales are lazy-loaded via `loadLocale` — call
     * `await loadLocale(locale)` at init if you want the UI to render in the
     * target language immediately; until the dictionary lands, keys resolve
     * to English.
     */
    createT(locale: string): TranslateFunction<T>;
    /**
     * Dynamically import a built-in locale and register it. Returns the
     * loaded dictionary, or `null` if the locale isn't a known built-in.
     * Custom locales registered via `registerLocale` bypass this loader —
     * they are already in the registry (and are returned as registered, so a
     * partial custom dictionary comes back partial).
     */
    loadLocale(locale: string): Promise<Partial<T> | null>;
    /**
     * Register a custom locale at runtime. Partial dictionaries are welcome —
     * missing keys fall back to English per key, so overriding a single
     * string never requires copying the whole catalog.
     */
    registerLocale(code: string, translations: Partial<T>): void;
}
/**
 * Build the i18n machinery for one message catalog.
 *
 * @param en — the complete English catalog, bundled synchronously as the fallback.
 * @param loaders — lazy import thunks for every other built-in locale.
 */
export declare function createI18n<T extends Record<keyof T & string, string>>(en: T, loaders: LocaleLoaders<T>): I18n<T>;
/**
 * Interpolate `{paramName}` placeholders in a translated string with the
 * values from `params`. Stringifies numbers and booleans inline so callers
 * can pass `t("marker.count")` along with `{ count: 3 }` directly.
 *
 * Unknown placeholders are left as-is.
 */
export declare function interpolate(template: string, params: Readonly<Record<string, string | number | boolean>>): string;
/** Shorthand for `interpolate(t(key), params)` — key-checked against the catalog. */
export declare function tWithParams<K extends string>(t: (key: K) => string, key: K, params: Readonly<Record<string, string | number | boolean>>): string;
