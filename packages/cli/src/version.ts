/**
 * This CLI's own version.
 *
 * Kept as a literal (not read from `package.json` at runtime) because the
 * bundle in `dist/` can be executed by `npx` from a cache directory whose
 * layout is not ours to rely on. release-please rewrites the annotated line
 * on every release — see `release-please-config.json`'s `extra-files`.
 */
export const CLI_VERSION = "0.6.1"; // x-release-please-version
