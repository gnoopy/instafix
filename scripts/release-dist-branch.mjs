#!/usr/bin/env node
// Publishes one or more packages' *built* dist/ output to a disposable
// "<name>-dist" branch whose root IS the package (not the monorepo root),
// so `npx github:<owner>/<repo>#<name>-dist` (or `npm install github:...`)
// works with plain npm/pnpm/yarn — no npm registry publish involved. See
// package-install-guide.md Part 2 for why this exists: the monorepo root
// isn't a package itself, plain npm/npx can't install a git subdirectory
// directly (that fragment syntax is pnpm-only), and every published
// package here is fully self-contained after build (tsup's noExternal
// inlines all runtime deps), so the dist branch needs nothing beyond what
// this script copies over.
//
// Usage:
//   node scripts/release-dist-branch.mjs                  # every package in the manifest
//   node scripts/release-dist-branch.mjs cli widget        # only these (packages/<name>)
//   node scripts/release-dist-branch.mjs --dry-run cli     # build + commit locally, skip the push
//
// Each run, per package: builds it, checks out a fresh orphan branch in a
// throwaway worktree, empties it, copies in dist/ + package.json + README +
// LICENSE + CHANGELOG, commits, force-pushes "<name>-dist" to origin, then
// removes the local worktree/branch again. The branch is fully regenerated
// from scratch every time — never hand-edit it, and never build on top of
// its prior history.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, stdio: "inherit", ...opts });
const runQuiet = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, encoding: "utf8", ...opts }).trim();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const requested = args.filter((a) => !a.startsWith("--"));

const manifest = JSON.parse(readFileSync(join(root, ".release-please-manifest.json"), "utf8"));
const allPkgDirs = Object.keys(manifest); // e.g. "packages/cli"

function resolvePkgDir(name) {
  const direct = `packages/${name}`;
  if (allPkgDirs.includes(direct)) return direct;
  if (allPkgDirs.includes(name)) return name;
  const known = allPkgDirs.map((p) => p.replace("packages/", "")).join(", ");
  throw new Error(`Unknown package "${name}" — expected one of: ${known}`);
}

const targets = requested.length > 0 ? requested.map(resolvePkgDir) : allPkgDirs;

// This script only ever pushes to an already-configured origin — it never
// guesses a GitHub URL or creates the remote for you.
let originUrl;
try {
  originUrl = runQuiet("git", ["remote", "get-url", "origin"]);
} catch {
  console.error(
    'No "origin" remote configured.\n\n' +
      "  git remote add origin git@github.com:gnoopy/instafix.git\n" +
      "  git push -u origin main\n",
  );
  process.exit(1);
}

const dirty = runQuiet("git", ["status", "--porcelain"]);
if (dirty) {
  console.warn(
    "Warning: working tree has uncommitted changes — the dist branch will be built from what's on disk right now, not HEAD.\n",
  );
}

// A worktree left over from a crashed previous run would block `git branch
// -D`/`checkout --orphan` below with "already checked out elsewhere".
run("git", ["worktree", "prune"]);

const shortSha = runQuiet("git", ["rev-parse", "--short", "HEAD"]);

console.log(`origin → ${originUrl}`);
console.log(`targets → ${targets.map((d) => d.replace("packages/", "")).join(", ")}${dryRun ? "  (--dry-run)" : ""}\n`);

for (const pkgDir of targets) {
  releaseOne(pkgDir);
}

function releaseOne(pkgDir) {
  const pkgJson = JSON.parse(readFileSync(join(root, pkgDir, "package.json"), "utf8"));
  const name = pkgDir.replace("packages/", "");
  const branch = `${name}-dist`;

  console.log(`=== ${pkgJson.name} → branch ${branch} ===`);

  console.log(`[1/5] bun run build --filter=${pkgJson.name}`);
  run("bun", ["run", "build", "--filter", pkgJson.name]);

  const distDir = join(root, pkgDir, "dist");
  if (!existsSync(distDir)) {
    throw new Error(`${pkgDir}/dist was not produced by the build — aborting before touching any branch.`);
  }

  console.log("[2/5] preparing orphan worktree");
  const worktree = mkdtempSync(join(tmpdir(), `${name}-dist-`));
  rmSync(worktree, { recursive: true, force: true }); // `worktree add` wants to create this path itself
  if (runQuiet("git", ["branch", "--list", branch])) {
    run("git", ["branch", "-D", branch]);
  }
  // Older git (< 2.42) has no `worktree add --orphan`, so: check out a
  // normal detached worktree, then flip it to an orphan branch and clear
  // it — the standard pre-2.42 recipe for an empty orphan branch.
  run("git", ["worktree", "add", "--detach", worktree]);

  try {
    run("git", ["checkout", "--orphan", branch], { cwd: worktree });
    run("git", ["rm", "-rf", "-q", "."], { cwd: worktree });

    cpSync(distDir, join(worktree, "dist"), { recursive: true });
    for (const file of ["README.md", "LICENSE", "CHANGELOG.md"]) {
      const src = join(root, pkgDir, file);
      if (existsSync(src)) cpSync(src, join(worktree, file));
    }
    // devDependencies use "workspace:*" specifiers that only resolve inside
    // this monorepo — npm's git-dependency install (which always runs a
    // full `npm install --include=dev` on the clone, prepare script or not)
    // fails outright on them. tsup already inlined every runtime dep into
    // dist/ (see tsup.config.ts noExternal), so devDependencies and the
    // source-only scripts (build/check/clean) serve no purpose here anyway.
    const { devDependencies: _devDependencies, scripts: _scripts, ...distPkgJson } = pkgJson;
    writeFileSync(join(worktree, "package.json"), `${JSON.stringify(distPkgJson, null, 2)}\n`);

    console.log("[3/5] commit");
    run("git", ["add", "-A"], { cwd: worktree });
    run("git", ["commit", "-q", "-m", `release: ${pkgJson.name}@${pkgJson.version} dist (from ${shortSha})`], {
      cwd: worktree,
    });

    if (dryRun) {
      console.log(`[4/5] --dry-run: not pushing (would force-push ${branch} to origin)`);
    } else {
      console.log(`[4/5] git push --force origin ${branch}`);
      run("git", ["push", "--force", "origin", `${branch}:${branch}`]);
    }
  } finally {
    console.log("[5/5] cleanup");
    run("git", ["worktree", "remove", "--force", worktree]);
    if (dryRun) {
      console.log(`  (kept local branch "${branch}" for inspection — re-run without --dry-run to push it)`);
    } else {
      run("git", ["branch", "-D", branch]);
    }
  }

  if (!dryRun) {
    console.log(`  → npx github:${ownerRepoFromUrl(originUrl)}#${branch} ...\n`);
  } else {
    console.log("");
  }
}

function ownerRepoFromUrl(url) {
  const parts = url
    .replace(/\.git$/, "")
    .split(/[/:]/)
    .filter(Boolean);
  return parts.slice(-2).join("/");
}
