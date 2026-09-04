import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function pageTemplate(projectName: string): string {
  return `"use client";

import { InstaFixInbox } from "@instafix/dashboard";

// This page has no access control of its own — @instafix/dashboard is just a
// UI component, the same way the widget is. Guard this route the way you'd
// guard any other admin page in your app (session check, middleware, whatever
// you already use) before shipping it — the generated app/api/instafix/route.ts
// only gates the API, not this page.
export default function InstaFixDashboardPage() {
  return (
    <div style={{ height: "100vh" }}>
      <InstaFixInbox projects="${projectName}" endpoint="/api/instafix" theme="auto" />
    </div>
  );
}
`;
}

/** Result of a dashboard-page-generation attempt. */
export interface DashboardPageGenerationResult {
  /** `true` when the file was just created, `false` when it already existed. */
  created: boolean;
  /** Absolute path of the target page file. */
  path: string;
  /** URL path the generated page is served at (e.g. `/instafix`) — pass this as the widget's `dashboardUrl`. */
  url: string;
}

/**
 * Generate a Next.js App Router page that mounts `<InstaFixInbox />`.
 *
 * Creates `app/instafix/page.tsx` (or `src/app/instafix/page.tsx` when the
 * project uses a `src/` layout) wired to the same `/api/instafix` endpoint
 * the generated API route serves. Skips if the file already exists.
 */
export function generateDashboardPage(
  basePath: string = process.cwd(),
  projectName = "my-project",
): DashboardPageGenerationResult {
  const appDir = existsSync(join(basePath, "src", "app")) ? join(basePath, "src", "app") : join(basePath, "app");

  const pagePath = join(appDir, "instafix", "page.tsx");
  const url = "/instafix";

  if (existsSync(pagePath)) {
    return { created: false, path: pagePath, url };
  }

  try {
    mkdirSync(dirname(pagePath), { recursive: true });
    writeFileSync(pagePath, pageTemplate(projectName), "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Permission denied: cannot write to ${pagePath}. Check file permissions.`);
    }
    throw error;
  }

  return { created: true, path: pagePath, url };
}
