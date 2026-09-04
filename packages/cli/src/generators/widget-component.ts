import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Escape a value for a double-quoted TS string literal in the generated file. */
function quote(value: string): string {
  return JSON.stringify(value);
}

function componentTemplate(projectName: string, dashboardUrl?: string, identity?: GeneratedIdentity): string {
  const dashboardLine = dashboardUrl ? `\n      dashboardUrl: "${dashboardUrl}",` : "";
  // Baking the developer's own identity in is what keeps the widget from
  // interrupting a submit to ask who you are. It is a DEV tool default, not a
  // claim about whoever else loads the page — hence the comment telling the
  // reader exactly how to drop it.
  const identityLine = identity
    ? `\n      // Prefilled from this machine at scaffold time (${identity.source === "gh" ? "gh api user" : "git config user.name/user.email"}).\n      // Delete this to have the widget ask each visitor for a name and email instead.\n      identity: { name: ${quote(identity.name)}, email: ${quote(identity.email)} },`
    : "";
  return `"use client";

import { useEffect } from "react";
import { initInstaFix } from "@instafix/widget";

export function InstaFixWidget() {
  useEffect(() => {
    const { destroy } = initInstaFix({
      endpoint: "/api/instafix",
      projectName: "${projectName}",${dashboardLine}${identityLine}
    });
    return destroy;
  }, []);

  return null;
}
`;
}

/** Developer identity baked into the generated call — see `detectGitIdentity`. */
export interface GeneratedIdentity {
  name: string;
  email: string;
  source: "gh" | "git";
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
 * `identity`, when given, is baked into the call so the widget never has to
 * interrupt a submit to ask who the developer is — the single most common
 * annoyance when the same person uses the widget across several local apps,
 * each of which is its own origin with its own empty localStorage.
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
  identity?: GeneratedIdentity,
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
    writeFileSync(componentPath, componentTemplate(projectName, dashboardUrl, identity), "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Permission denied: cannot write to ${componentPath}. Check file permissions.`);
    }
    throw error;
  }

  return { created: true, path: componentPath };
}
