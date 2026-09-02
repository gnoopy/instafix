import { defineConfig } from "tsup";

// Three parallel builds:
//  - ESM+CJS main: ESM is code-split so dynamic imports (Panel, locale
//    chunks) ship as separate files and only load when actually used; the
//    CJS twin is a single file (splitting is ESM-only) for require()
//    consumers — Jest setups, legacy bundlers (#220).
//  - IIFE main: single global script for <script src> consumers — splitting is
//    incompatible with IIFE, so everything is inlined.
//  - ESM+CJS React entry (`@instafix/widget/react`): React stays external so
//    consumers pin their own version.
//
// `esbuildOptions.pure` strips `console.debug` / `console.info` calls in the
// production minifier — they're dev-only diagnostics. `console.warn` and
// `console.error` are kept because they signal real problems consumers need
// to see in their dashboards.
const pureCalls = ["console.debug", "console.info"] as const;

// Identity define: pins `process.env.NODE_ENV` to itself so esbuild's
// browser-platform auto-define cannot fold it to `"production"` at our build
// (issue #104 — the fold used to delete the production guard from dist).
// The literal survives into the shipped bundles, where the consumer's own
// bundler (webpack DefinePlugin, Vite, esbuild) can inline THEIR environment;
// plain browsers without `process` fall through via readNodeEnv's try/catch.
// `scripts/verify-dist-guard.mjs` asserts this after every build.
const keepNodeEnvLiteral = { "process.env.NODE_ENV": "process.env.NODE_ENV" } as const;

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "browser",
    target: "es2022",
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    splitting: true,
    treeshake: "recommended",
    // html2canvas is force-bundled (not left as an external runtime import) so
    // it code-splits into its own chunk file loaded via a relative path — see
    // packages/widget/src/screenshot.ts's header comment for why a plain
    // `await import("html2canvas")` is unsafe: it left a bare specifier in the
    // ESM/CJS output that only resolves when the *consumer's* bundler
    // processes @instafix/widget's dist code. Any consumer serving that dist
    // output directly (no bundler — e.g. a raw `<script type="module">`
    // embed, exactly what e2e/server.mjs does) hit a hard
    // `Failed to resolve module specifier 'html2canvas'` and silently lost
    // every screenshot (confirmed via scripts/e2e/_repro-screenshot.mjs,
    // 2026-09-01). Bundling it here keeps the lazy-load / bundle-size goal —
    // it's still a separate chunk, fetched only on first capture — while
    // making resolution self-contained in every deployment mode.
    noExternal: ["@medv/finder", "@instafix/core", "html2canvas"],
    esbuildOptions(o) {
      o.pure = [...pureCalls];
      o.define = { ...o.define, ...keepNodeEnvLiteral };
    },
  },
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "InstaFix",
    platform: "browser",
    target: "es2022",
    dts: false,
    sourcemap: true,
    clean: false,
    minify: true,
    splitting: false,
    treeshake: "recommended",
    noExternal: ["@medv/finder", "@instafix/core"],
    esbuildOptions(o) {
      o.pure = [...pureCalls];
      o.define = { ...o.define, ...keepNodeEnvLiteral };
    },
  },
  {
    entry: ["src/react.ts"],
    format: ["esm", "cjs"],
    platform: "browser",
    target: "es2022",
    dts: true,
    sourcemap: true,
    clean: false,
    minify: true,
    splitting: true,
    treeshake: "recommended",
    // Same reasoning as the main entry above — this entry reaches
    // screenshot.ts through initInstaFix too.
    noExternal: ["@medv/finder", "@instafix/core", "html2canvas"],
    external: ["react"],
    esbuildOptions(o) {
      o.pure = [...pureCalls];
      o.define = { ...o.define, ...keepNodeEnvLiteral };
    },
  },
]);
