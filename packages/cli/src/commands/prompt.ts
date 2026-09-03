import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type FeedbackResponse, formatFeedbacksForAgent } from "@instafix/core";

export interface PromptOptions {
  dir: string;
  status: string;
  id?: string;
  instructions?: string;
}

/**
 * Read the FS store's history file as serialized feedback objects. The JSONL
 * lines are `FeedbackRecord`s whose Date fields were flattened to ISO strings
 * by JSON.stringify — which is exactly the `FeedbackResponse` wire shape, so
 * no revival is needed for formatting.
 */
async function loadFeedbacks(dir: string): Promise<FeedbackResponse[]> {
  const historyPath = join(dir, "history.jsonl");
  let text: string;
  try {
    text = await readFile(historyPath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `No InstaFix history at ${historyPath}. This command reads the @instafix/adapter-fs store — pass --dir if it lives elsewhere.`,
      );
    }
    throw err;
  }
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as FeedbackResponse);
}

/**
 * `instafix prompt` — print open (or selected) feedbacks as agent-ready
 * Markdown on stdout, for piping straight into a coding agent:
 *
 *     npx @instafix/cli prompt --status open | claude -p
 *     npx @instafix/cli prompt --id fb_x7k2,fb_m3q9 | claude -p
 *
 * Everything human-facing goes to stderr so stdout stays a clean document.
 */
export async function promptCommand(options: PromptOptions): Promise<void> {
  try {
    const all = await loadFeedbacks(options.dir);

    let selected = all;
    if (options.id) {
      const wanted = new Set(
        options.id
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      selected = all.filter((fb) => wanted.has(fb.id));
      const missing = [...wanted].filter((id) => !selected.some((fb) => fb.id === id));
      if (missing.length > 0) {
        process.stderr.write(`instafix prompt: id(s) not found: ${missing.join(", ")}\n`);
        process.exitCode = 1;
        return;
      }
    } else if (options.status !== "all") {
      const wanted = new Set(options.status.split(",").map((s) => s.trim()));
      selected = all.filter((fb) => wanted.has(fb.status));
    }

    if (selected.length === 0) {
      process.stderr.write("instafix prompt: no matching fix notes — nothing to output.\n");
      return;
    }

    const instructions = options.instructions
      ? options.instructions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    process.stdout.write(formatFeedbacksForAgent(selected, instructions ? { instructions } : undefined));
    process.stderr.write(`instafix prompt: ${selected.length} fix note(s) written to stdout.\n`);
  } catch (err) {
    process.stderr.write(`instafix prompt: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
}
