import { Command } from "commander";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { promptCommand } from "./commands/prompt.js";
import { resolveCommand } from "./commands/resolve.js";
import { installSlashCommand } from "./commands/slash-command.js";
import { statusCommand } from "./commands/status.js";
import { syncCommand } from "./commands/sync.js";
import { watchCommand } from "./commands/watch.js";

const program = new Command()
  .name("instafix")
  .description("CLI to configure @instafix/* in your project")
  .version("0.5.8"); // x-release-please-version

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

program
  .command("prompt")
  .description("Print feedbacks as agent-ready Markdown on stdout (reads the @instafix/adapter-fs store)")
  .option("--dir <path>", "InstaFix store directory", ".instafix")
  .option("--status <statuses>", "Comma-separated statuses, or 'all'", "open")
  .option("--id <ids>", "Comma-separated feedback IDs (overrides --status)")
  .option("--instructions <text>", "Newline-separated instruction bullets replacing the defaults")
  .action(promptCommand)
  .addHelpText(
    "after",
    "\n  Examples:\n    $ instafix prompt --status open | claude -p\n    $ instafix prompt --id fb_x7k2,fb_m3q9 | claude -p",
  );

program
  .command("resolve")
  .description("Mark feedbacks resolved by ID (the close-the-loop half of `instafix prompt`)")
  .argument("<ids...>", "Feedback IDs to close")
  .option("--dir <path>", "InstaFix store directory", ".instafix")
  .option("--reopen", "Reopen instead of resolving")
  .action(resolveCommand)
  .addHelpText("after", "\n  Examples:\n    $ instafix resolve fb_x7k2\n    $ instafix resolve fb_x7k2 --reopen");

program
  .command("watch")
  .description("Wait for widget handoffs (the 'Agent에게' button) and print each prompt to stdout")
  .option("--dir <path>", "InstaFix store directory", ".instafix")
  .option("--once", "Exit after delivering one handoff (for background-task wake patterns)")
  .action(watchCommand)
  .addHelpText(
    "after",
    "\n  Examples:\n    $ instafix watch --once   # run as a background task in your Claude Code session",
  );

program
  .command("agent-setup")
  .description("Install the /instafix slash command into .claude/commands/ for the current project")
  .action(async () => {
    const filePath = await installSlashCommand();
    process.stderr.write(`Installed ${filePath} — type /instafix in a Claude Code session here.\n`);
  });

program.parse();
