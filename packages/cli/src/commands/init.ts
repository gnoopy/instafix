import { basename } from "node:path";
import { generateDashboardPage } from "../generators/dashboard-page.js";
import { generateRoute } from "../generators/route.js";
import { generateWidgetComponent } from "../generators/widget-component.js";
import { detectGitIdentity } from "../git-identity.js";
import { p } from "../prompts.js";
import { formatPackageStatus, surveyInstaFixPackages } from "../utils/installed-packages.js";
import { readProjectName } from "../utils/read-project-name.js";
import { CLI_VERSION } from "../version.js";
import { installSlashCommand } from "./slash-command.js";

export async function initCommand(): Promise<void> {
  p.intro("instafix — Setup");

  const cwd = process.cwd();

  // Step 1: API route. InstaFix's own feedback storage is independent of
  // whatever ORM the host project uses for its own data — even a project
  // with an existing Prisma schema gets asked the same sqlite/fs/skip
  // question (there's no InstaFix adapter that writes into a caller-owned
  // Prisma schema; a separate, zero-config sqlite.db is the point).
  function generateRouteOrExit(basePath: string, backend: "sqlite" | "fs"): void {
    try {
      const { created, path } = generateRoute(basePath, backend);
      if (created) {
        p.log.success(`Route created: ${path}`);
      } else {
        p.log.info(`Route already exists: ${path}`);
      }
    } catch (error) {
      p.log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      p.outro("Fix the errors above and re-run `instafix init`.");
      process.exit(1);
    }
  }

  let routeSkipped = false;
  let fsBackendChosen = false;

  const backend = await p.select({
    message: "How should InstaFix store feedback?",
    options: [
      {
        value: "sqlite" as const,
        label: "SQLite",
        hint: "recommended for a team — a local .db file, no ORM or database server needed",
      },
      {
        value: "fs" as const,
        label: "Local history (.instafix/ folder)",
        hint: "no database at all — plain files, for a single developer working solo",
      },
      { value: "skip" as const, label: "Skip — I'll wire storage myself" },
    ],
  });

  if (p.isCancel(backend)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  if (backend === "sqlite") {
    generateRouteOrExit(cwd, "sqlite");
  } else if (backend === "fs") {
    generateRouteOrExit(cwd, "fs");
    fsBackendChosen = true;
  } else {
    routeSkipped = true;
  }

  // Step 2: Widget component
  const shouldGenerateWidget = await p.confirm({
    message: "Generate the widget client component?",
  });

  if (p.isCancel(shouldGenerateWidget)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Step 3: Dashboard page — asked before generating the widget component
  // (below) so, when both are accepted, the widget can be scaffolded with
  // `dashboardUrl` already wired to the page this step creates, instead of
  // shipping a widget-only setup that leaves the panel's dashboard button
  // silently hidden (its only tell was `dashboardUrl` missing from the
  // generated component — nothing in `init`'s own output pointed at it).
  const shouldGenerateDashboard = await p.confirm({
    message: "Generate a dashboard page too? (a private /instafix admin view of the feedback)",
  });

  if (p.isCancel(shouldGenerateDashboard)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  let widgetResult: { created: boolean; path: string } | null = null;
  let dashboardResult: { created: boolean; path: string; url: string } | null = null;

  if (shouldGenerateDashboard) {
    try {
      dashboardResult = generateDashboardPage(cwd, readProjectName(cwd));
      if (dashboardResult.created) {
        p.log.success(`Dashboard page created: ${dashboardResult.path}`);
      } else {
        p.log.info(`Dashboard page already exists: ${dashboardResult.path}`);
      }
    } catch (error) {
      p.log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      p.outro("Fix the errors above and re-run `instafix init`.");
      process.exit(1);
    }
  }

  if (shouldGenerateWidget) {
    try {
      // Bake this machine's own identity in, so the widget never interrupts a
      // submit to ask who you are. Optional by construction: no gh, no git
      // config, or a half-filled one just means the widget asks once instead.
      const identity = detectGitIdentity(cwd);
      widgetResult = generateWidgetComponent(cwd, readProjectName(cwd), dashboardResult?.url, identity ?? undefined);
      if (widgetResult.created) {
        p.log.success(`Widget component created: ${widgetResult.path}`);
        if (identity) {
          p.log.info(
            `Author prefilled from ${identity.source === "gh" ? "your GitHub account" : "git config"}: ${identity.name} <${identity.email}>`,
          );
        }
      } else {
        p.log.info(`Widget component already exists: ${widgetResult.path}`);
      }
    } catch (error) {
      p.log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      p.outro("Fix the errors above and re-run `instafix init`.");
      process.exit(1);
    }
  }

  // Step 4: Next steps — only what's left to do by hand
  const steps: string[] = [];

  if (routeSkipped) {
    steps.push(
      `${steps.length + 1}. Wire the API route yourself: app/api/instafix/route.ts, using`,
      "   @instafix/adapter-sqlite or @instafix/adapter-fs's createInstaFixHandler(),",
      "   or a custom store — see /docs/adapters.",
    );
  }

  if (fsBackendChosen) {
    steps.push(
      `${steps.length + 1}. Install the adapter:`,
      "   npm install @instafix/adapter-fs",
      "",
      "   Feedback (and screenshots) will be written to .instafix/ at your",
      "   project root — nothing to run, nothing to configure. Whether to",
      "   commit that folder or add it to .gitignore is up to you.",
    );
  }

  if (dashboardResult) {
    steps.push(
      `${steps.length + 1}. Install the dashboard package:`,
      "   npm install @instafix/dashboard",
      "",
      `   The ${dashboardResult.url} page has no access control of its own — guard`,
      "   it the same way you'd guard any other admin page in your app before",
      "   shipping it.",
    );
  }

  if (widgetResult) {
    steps.push(
      `${steps.length + 1}. Add it to your root layout:`,
      "",
      '   import { InstaFixWidget } from "@/components/instafix-widget"',
      "",
      "   <InstaFixWidget />",
    );
    if (dashboardResult && !widgetResult.created) {
      steps.push(
        "",
        `   ${basename(widgetResult.path)} already existed, so it was left as-is — add`,
        `   dashboardUrl: "${dashboardResult.url}" to its initInstaFix({...}) call yourself`,
        "   if you want the panel's dashboard button to show up.",
      );
    }
  } else {
    steps.push(
      `${steps.length + 1}. Add the widget to your layout:`,
      "",
      '   import { initInstaFix } from "@instafix/widget"',
      "",
      "   initInstaFix({",
      '     endpoint: "/api/instafix",',
      `     projectName: "${readProjectName(cwd)}",`,
      ...(dashboardResult ? [`     dashboardUrl: "${dashboardResult.url}",`] : []),
      "   })",
    );
  }

  if (steps.length > 0) {
    p.note(steps.join("\n"), "Next steps");
  }

  // Step 5: what is actually on disk. `init` scaffolds files, it never runs a
  // package manager — so this is a survey, not a receipt. It exists because a
  // stale `node_modules` is indistinguishable from a current one until you
  // read the version, and "why does my widget still look old" has cost real
  // debugging time.
  const expected = [
    "@instafix/widget",
    ...(backend === "sqlite" ? ["@instafix/adapter-sqlite"] : []),
    ...(fsBackendChosen ? ["@instafix/adapter-fs"] : []),
    ...(dashboardResult ? ["@instafix/dashboard"] : []),
  ];
  const survey = surveyInstaFixPackages(cwd, expected);
  const lines = [`@instafix/cli  ${CLI_VERSION}  (this command)`, "", ...formatPackageStatus(survey)];
  if (survey.some((row) => !row.version)) {
    lines.push(
      "",
      'Packages marked "not installed" are pulled in by the files just',
      "scaffolded — install them before starting the dev server.",
    );
  }
  p.note(lines.join("\n"), "InstaFix packages in this project");

  // Agent handoff (mode B): a /instafix slash command in the project lets an
  // already-running Claude Code session pull queued feedback into its own
  // context. Best-effort — a read-only FS must not fail the whole init.
  try {
    const slashPath = await installSlashCommand(cwd);
    p.log.success(`Claude Code slash command installed: ${slashPath}`);
  } catch {
    p.log.warn("Could not install .claude/commands/instafix.md — run `instafix agent-setup` later.");
  }

  p.outro("Setup complete!");
}
