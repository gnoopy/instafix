import { syncPrismaModels } from "../generators/prisma.js";
import { generateRoute } from "../generators/route.js";
import { generateWidgetComponent } from "../generators/widget-component.js";
import { p } from "../prompts.js";
import { findPrismaSchema } from "../utils/find-schema.js";
import { readProjectName } from "../utils/read-project-name.js";
import { runPrismaDbPush } from "../utils/run-prisma-db-push.js";

export async function initCommand(): Promise<void> {
  p.intro("instafix — Setup");

  const cwd = process.cwd();
  let dbPushed = false;

  // Step 1: Prisma schema
  const schemaPath = findPrismaSchema(cwd);

  if (schemaPath) {
    p.log.info(`Prisma schema found: ${schemaPath}`);

    const shouldSync = await p.confirm({
      message: "Sync InstaFix models to your Prisma schema?",
    });

    if (p.isCancel(shouldSync)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    if (shouldSync) {
      try {
        const { addedModels, changes } = syncPrismaModels(schemaPath);

        if (addedModels.length > 0) {
          p.log.success(`Models synced: ${addedModels.join(", ")}`);
        }

        for (const change of changes) {
          if (change.action === "added") {
            p.log.success(`${change.model}.${change.field} — added (${change.detail})`);
          } else {
            p.log.success(`${change.model}.${change.field} — updated (${change.detail})`);
          }
        }

        if (addedModels.length === 0 && changes.length === 0) {
          p.log.info("Schema is already up to date.");
        }
      } catch (error) {
        p.log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        p.outro("Fix the errors above and re-run `instafix init`.");
        process.exit(1);
      }
    }

    const shouldPush = await p.confirm({
      message: "Run `npx prisma db push` now?",
    });

    if (p.isCancel(shouldPush)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    if (shouldPush) {
      p.log.info("Running `npx prisma db push`…");
      dbPushed = runPrismaDbPush(cwd);
      if (dbPushed) {
        p.log.success("Database schema pushed.");
      } else {
        p.log.error("`npx prisma db push` failed — see output above.");
      }
    }
  } else {
    p.log.warn("No schema.prisma file found. You will need to add the models manually.");
    p.log.info("See the documentation: https://github.com/gnoopy/instafix#prisma-schema-1");
  }

  // Step 2: API route
  const shouldRoute = await p.confirm({
    message: "Generate the Next.js App Router API route?",
  });

  if (p.isCancel(shouldRoute)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  if (shouldRoute) {
    try {
      const { created, path } = generateRoute(cwd);
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

  // Step 3: Widget component
  const shouldGenerateWidget = await p.confirm({
    message: "Generate the widget client component?",
  });

  if (p.isCancel(shouldGenerateWidget)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  let widgetResult: { created: boolean; path: string } | null = null;

  if (shouldGenerateWidget) {
    try {
      widgetResult = generateWidgetComponent(cwd, readProjectName(cwd));
      if (widgetResult.created) {
        p.log.success(`Widget component created: ${widgetResult.path}`);
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

  if (schemaPath && !dbPushed) {
    steps.push(`${steps.length + 1}. Run: npx prisma db push`);
  }

  if (widgetResult) {
    steps.push(
      `${steps.length + 1}. Add it to your root layout:`,
      "",
      '   import { InstaFixWidget } from "@/components/instafix-widget"',
      "",
      "   <InstaFixWidget />",
    );
  } else {
    steps.push(
      `${steps.length + 1}. Add the widget to your layout:`,
      "",
      '   import { initInstaFix } from "@instafix/widget"',
      "",
      "   initInstaFix({",
      '     endpoint: "/api/instafix",',
      `     projectName: "${readProjectName(cwd)}",`,
      "   })",
    );
  }

  if (steps.length > 0) {
    p.note(steps.join("\n"), "Next steps");
  }

  p.outro("Setup complete!");
}
