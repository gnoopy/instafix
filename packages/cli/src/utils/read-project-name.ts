import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Read the `name` field from the project's `package.json`, stripping any npm
 * scope (`@scope/name` → `name`). Falls back to `"my-project"` when the file
 * is missing, unreadable, or has no usable name.
 */
export function readProjectName(cwd: string): string {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return "my-project";

  try {
    const parsed: unknown = JSON.parse(readFileSync(pkgPath, "utf-8"));
    if (typeof parsed !== "object" || parsed === null || !("name" in parsed)) return "my-project";
    const name = (parsed as { name?: unknown }).name;
    if (typeof name !== "string" || name.trim() === "") return "my-project";
    return name.replace(/^@[^/]+\//, "");
  } catch {
    return "my-project";
  }
}
