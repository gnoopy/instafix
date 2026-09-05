import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** One `@instafix/*` package as it exists in the caller's project right now. */
export interface PackageStatus {
  name: string;
  /**
   * The version actually on disk in `node_modules` — the one that will load at
   * runtime. `null` means the package is declared but not installed, or not
   * present at all.
   */
  version: string | null;
  /** The range declared in the project's `package.json`, when there is one. */
  spec: string | null;
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stringField(source: Record<string, unknown> | null, key: string): string | null {
  const value = source?.[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function declaredRanges(cwd: string): Map<string, string> {
  const ranges = new Map<string, string>();
  const pkg = readJson(join(cwd, "package.json"));
  if (!pkg) return ranges;
  for (const field of ["dependencies", "devDependencies"]) {
    const block = pkg[field];
    if (typeof block !== "object" || block === null) continue;
    for (const [name, spec] of Object.entries(block as Record<string, unknown>)) {
      if (name.startsWith("@instafix/") && typeof spec === "string") ranges.set(name, spec);
    }
  }
  return ranges;
}

/** Package names present under `node_modules/@instafix/`. */
function installedNames(cwd: string): string[] {
  const scopeDir = join(cwd, "node_modules", "@instafix");
  if (!existsSync(scopeDir)) return [];
  try {
    return readdirSync(scopeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .map((entry) => `@instafix/${entry.name}`);
  } catch {
    return [];
  }
}

/** The installed version of one package, read from its own `package.json`. */
export function readInstalledVersion(cwd: string, name: string): string | null {
  return stringField(readJson(join(cwd, "node_modules", ...name.split("/"), "package.json")), "version");
}

/**
 * Survey every `@instafix/*` package the project knows about: whatever is
 * declared in `package.json`, whatever is already unpacked in `node_modules`,
 * and any package `expected` by the files `init` just scaffolded (those show
 * up with a `null` version until the user runs the install line printed with
 * the next steps).
 *
 * Never throws — an unreadable `package.json` or a missing `node_modules`
 * degrades to "not installed", which is exactly what the reader needs to see.
 */
export function surveyInstaFixPackages(cwd: string, expected: readonly string[] = []): PackageStatus[] {
  const ranges = declaredRanges(cwd);
  const names = new Set<string>([...ranges.keys(), ...installedNames(cwd), ...expected]);

  return [...names].sort().map((name) => ({
    name,
    version: readInstalledVersion(cwd, name),
    spec: ranges.get(name) ?? null,
  }));
}

/**
 * Render the survey as an aligned block. Installed packages read as
 * `@instafix/widget  0.10.16`; missing ones say so, because the difference
 * between "declared" and "on disk" is precisely the confusion this report
 * exists to end (a stale `node_modules` shipping an old widget looks
 * identical to a current one until you check the version).
 */
export function formatPackageStatus(rows: readonly PackageStatus[]): string[] {
  const width = Math.max(0, ...rows.map((row) => row.name.length));
  return rows.map((row) => {
    const name = row.name.padEnd(width);
    if (!row.version) return `${name}  not installed${row.spec ? ` (declared ${row.spec})` : ""}`;
    // A spec that the installed version does not literally start from is worth
    // showing side by side; an exact match would just be noise.
    const suffix = row.spec && !row.spec.includes(row.version) ? `  (declared ${row.spec})` : "";
    return `${name}  ${row.version}${suffix}`;
  });
}
