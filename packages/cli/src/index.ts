import { Command } from "commander";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { syncCommand } from "./commands/sync.js";

const program = new Command()
  .name("instafix")
  .description("CLI to configure @instafix/* in your project")
  .version("0.5.4"); // x-release-please-version

program
  .command("init")
  .description("Set up storage (Prisma or SQLite), the API route, and the widget component")
  .action(initCommand)
  .addHelpText("after", "\n  Examples:\n    $ instafix init");

program
  .command("sync")
  .description("Sync the Prisma schema (non-interactive, CI-friendly)")
  .option("--schema <path>", "Path to the schema.prisma file")
  .action(syncCommand)
  .addHelpText("after", "\n  Examples:\n    $ instafix sync\n    $ instafix sync --schema prisma/schema.prisma");

program
  .command("status")
  .description("Full diagnostic of the InstaFix integration")
  .option("--schema <path>", "Path to the schema.prisma file")
  .action(statusCommand)
  .addHelpText("after", "\n  Examples:\n    $ instafix status\n    $ instafix status --schema prisma/schema.prisma");

program
  .command("doctor")
  .description("Test the connection to the InstaFix API")
  .option("--url <url>", "Server URL (default: http://localhost:3000)")
  .option("--endpoint <path>", "Endpoint path (default: /api/instafix)")
  .action(doctorCommand)
  .addHelpText(
    "after",
    "\n  Examples:\n    $ instafix doctor\n    $ instafix doctor --url https://staging.example.com --endpoint /api/feedback",
  );

program.parse();
