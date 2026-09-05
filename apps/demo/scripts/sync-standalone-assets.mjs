#!/usr/bin/env node
/**
 * Copy `.next/static` and `public/` into the standalone output tree.
 *
 * `output: "standalone"` (next.config.ts) deliberately omits both — Next
 * expects a CDN or a Dockerfile to place them. We serve the standalone
 * `server.js` directly (see deploy/start.sh), so without this the running
 * site answers every asset request with a 500 and renders as unstyled HTML.
 *
 * It lives in the build script rather than only in the deploy script because
 * the failure mode is silent and remote: any `bun run build` — including the
 * one inside `bun run verify` — replaces `.next/`, and the already-running
 * server then serves a page whose CSS no longer exists. Rebuilding is the
 * moment to repair it, not the next deploy.
 *
 * A no-op when there is no standalone output (a plain `next build`).
 */

import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const standalone = join(appDir, ".next", "standalone", "apps", "demo");

if (!existsSync(standalone)) {
  console.log("sync-standalone-assets: no standalone output — nothing to do");
  process.exit(0);
}

/** Replace rather than merge: a stale hashed chunk left behind is how a half-updated tree happens. */
function replace(from, to, label) {
  if (!existsSync(from)) {
    console.log(`sync-standalone-assets: ${label} missing at ${from} — skipped`);
    return;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`sync-standalone-assets: ${label} -> ${to}`);
}

replace(join(appDir, ".next", "static"), join(standalone, ".next", "static"), ".next/static");
replace(join(appDir, "public"), join(standalone, "public"), "public");
