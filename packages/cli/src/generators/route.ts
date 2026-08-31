import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Storage backend to scaffold the API route against. */
export type RouteBackend = "prisma" | "sqlite";

const ROUTE_TEMPLATES: Record<RouteBackend, string> = {
  prisma: `import { createInstaFixHandler } from "@instafix/adapter-prisma";
import { prisma } from "@/lib/prisma";

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({
  prisma,
  // Uncomment to require authentication:
  // apiKey: process.env.INSTAFIX_API_KEY,
  // allowedOrigins: ["https://your-site.com"],
});
`,
  sqlite: `import { createInstaFixHandler, SqliteStore } from "@instafix/adapter-sqlite";

// Zero external services — creates ./instafix.db (and its tables) on first
// use. No migration command to run.
const store = new SqliteStore({ path: "./instafix.db" });

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({
  store,
  // Uncomment to require authentication:
  // apiKey: process.env.INSTAFIX_API_KEY,
  // allowedOrigins: ["https://your-site.com"],
});
`,
};

/** Result of a route-generation attempt. */
export interface RouteGenerationResult {
  /** `true` when the file was just created, `false` when it already existed. */
  created: boolean;
  /** Absolute path of the target route file. */
  path: string;
}

/**
 * Generate the Next.js App Router API route file.
 *
 * Creates `app/api/instafix/route.ts` wired to the given storage `backend`
 * (defaults to `"prisma"` for backwards compatibility). Skips if the file
 * already exists — it is never overwritten, regardless of `backend`.
 */
export function generateRoute(
  basePath: string = process.cwd(),
  backend: RouteBackend = "prisma",
): RouteGenerationResult {
  // Detect app directory
  const appDir = existsSync(join(basePath, "src", "app")) ? join(basePath, "src", "app") : join(basePath, "app");

  if (!existsSync(appDir)) {
    throw new Error("Cannot find the app/ directory. Are you in a Next.js App Router project?");
  }

  const routePath = join(appDir, "api", "instafix", "route.ts");

  if (existsSync(routePath)) {
    return { created: false, path: routePath };
  }

  try {
    mkdirSync(dirname(routePath), { recursive: true });
    writeFileSync(routePath, ROUTE_TEMPLATES[backend], "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Permission denied: cannot write to ${routePath}. Check file permissions.`);
    }
    throw error;
  }

  return { created: true, path: routePath };
}
