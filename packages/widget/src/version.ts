/**
 * The widget's own package version, inlined at build time.
 *
 * `__INSTAFIX_VERSION__` is an esbuild `define` set from package.json in
 * tsup.config.ts, so the string is baked into every dist bundle with no
 * runtime `package.json` read (which a browser bundle cannot do anyway).
 * Outside a tsup build — vitest, ts-node, a consumer importing raw source —
 * the identifier is simply undeclared, and `typeof` on an undeclared
 * identifier is legal JavaScript, so this falls back instead of throwing.
 *
 * It exists to answer the question a stale install raises: "which version am
 * I actually looking at?" The panel header shows it, which is how a widget
 * pinned to an old npm release is spotted without digging through
 * node_modules.
 */
declare const __INSTAFIX_VERSION__: string | undefined;

export const WIDGET_VERSION: string =
  typeof __INSTAFIX_VERSION__ === "string" && __INSTAFIX_VERSION__.length > 0 ? __INSTAFIX_VERSION__ : "dev";
