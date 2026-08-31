import { spawnSync } from "node:child_process";

/**
 * Run `npx prisma db push` in `cwd`, streaming stdio directly so Prisma's own
 * interactive prompts (e.g. confirming a destructive schema change) reach the
 * user unmodified.
 *
 * Returns `true` on a zero exit code, `false` otherwise (including when the
 * `prisma` CLI itself cannot be found).
 */
export function runPrismaDbPush(cwd: string): boolean {
  const result = spawnSync("npx", ["prisma", "db", "push"], {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return result.status === 0;
}
