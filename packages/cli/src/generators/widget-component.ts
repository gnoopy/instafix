import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function componentTemplate(projectName: string, dashboardUrl?: string): string {
  const dashboardLine = dashboardUrl ? `\n      dashboardUrl: "${dashboardUrl}",` : "";
  return `"use client";

import { useEffect } from "react";
import { initInstaFix } from "@instafix/widget";

export function InstaFixWidget() {
  useEffect(() => {
    const { destroy } = initInstaFix({
      endpoint: "/api/instafix",
      projectName: "${projectName}",${dashboardLine}
    });
    return destroy;
  }, []);

  return null;
}
`;
}

/** Result of a widget-component-generation attempt. */
export interface WidgetComponentGenerationResult {
  /** `true` when the file was just created, `false` when it already existed. */
  created: boolean;
  /** Absolute path of the target component file. */
  path: string;
}

/**
 * Generate a client component that wires up `initInstaFix()`.
 *
 * Creates `components/instafix-widget.tsx` (or `src/components/...` when the
 * project uses a `src/` layout) so the caller only has to drop
 * `<InstaFixWidget />` into their root layout. Skips if the file already
 * exists.
 *
 * `dashboardUrl`, when given, is threaded into the generated `initInstaFix()`
 * call so the panel's "Open dashboard" button shows up pointing at the page
 * `generateDashboardPage()` scaffolds (see dashboard-page.ts) — the button is
 * only rendered when this option is set, so omitting it here is what keeps it
 * hidden for widget-only setups.
 */
export function generateWidgetComponent(
  basePath: string = process.cwd(),
  projectName = "my-project",
  dashboardUrl?: string,
): WidgetComponentGenerationResult {
  const componentsDir = existsSync(join(basePath, "src", "app"))
    ? join(basePath, "src", "components")
    : join(basePath, "components");

  const componentPath = join(componentsDir, "instafix-widget.tsx");

  if (existsSync(componentPath)) {
    return { created: false, path: componentPath };
  }

  try {
    mkdirSync(dirname(componentPath), { recursive: true });
    writeFileSync(componentPath, componentTemplate(projectName, dashboardUrl), "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Permission denied: cannot write to ${componentPath}. Check file permissions.`);
    }
    throw error;
  }

  return { created: true, path: componentPath };
}
