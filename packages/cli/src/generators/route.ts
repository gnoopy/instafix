import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Storage backend to scaffold the API route against. */
export type RouteBackend = "prisma" | "sqlite" | "fs";

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
  fs: `import { createInstaFixHandler, FsStore } from "@instafix/adapter-fs";

// No database, no server to run — feedback (and screenshots) are stored as
// plain files under .instafix/ at your project root, the same idea as
// .git. Delete the folder any time to reset. Meant for a single developer
// working locally, not for taking feedback from real site visitors — there's
// no auth here by design.
const store = new FsStore();

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({ store });
`,
};

/**
 * Serves screenshots FsStore writes to \`.instafix/screenshots/\` back over
 * HTTP — FsStore's own \`screenshotUrl\` points here
 * (\`/api/instafix/screenshots/<file>\`), and the widget/dashboard load it as
 * a plain \`<img src>\`. Only generated for the "fs" backend; the other
 * backends' adapters serve screenshots from wherever \`screenshotStorage\`
 * (S3, R2, …) or the database puts them instead.
 */
const SCREENSHOT_ROUTE_TEMPLATE = `import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Guards against \`..\`/absolute-path segments — Next's dynamic segment
// already excludes "/", but a stray \`..\` alone wouldn't be, so this is
// the one thing this route actually needs to get right.
const SAFE_FILENAME = /^[A-Za-z0-9_-]+\\.[A-Za-z0-9]+$/;

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!SAFE_FILENAME.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(join(process.cwd(), ".instafix", "screenshots", file));
    const ext = file.split(".").pop();
    const contentType = ext === "png" ? "image/png" : "image/jpeg";
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": contentType } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
`;

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
    if (backend === "fs") {
      const screenshotRoutePath = join(appDir, "api", "instafix", "screenshots", "[file]", "route.ts");
      mkdirSync(dirname(screenshotRoutePath), { recursive: true });
      writeFileSync(screenshotRoutePath, SCREENSHOT_ROUTE_TEMPLATE, "utf-8");
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Permission denied: cannot write to ${routePath}. Check file permissions.`);
    }
    throw error;
  }

  return { created: true, path: routePath };
}
