import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FeedbackResponse } from "@instafix/core";

export interface ResolveOptions {
  dir: string;
  reopen?: boolean;
}

/**
 * `instafix resolve <id...>` — mark feedbacks resolved in the FS store,
 * closing the loop from an agent prompt (each prompt item carries its ID and
 * the document's footer points here). `--reopen` reverses a close.
 *
 * Rewrites `<dir>/history.jsonl` line-by-line, only touching matched
 * records — the same one-record-per-line format @instafix/adapter-fs owns,
 * safe to edit while no server write is racing (the store re-reads the file
 * on every request, so the next widget/panel load sees this change).
 */
export async function resolveCommand(ids: string[], options: ResolveOptions): Promise<void> {
  const historyPath = join(options.dir, "history.jsonl");
  let text: string;
  try {
    text = await readFile(historyPath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      process.stderr.write(
        `instafix resolve: no InstaFix history at ${historyPath} — pass --dir if the store lives elsewhere.\n`,
      );
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const wanted = new Set(ids);
  const nowIso = new Date().toISOString();
  const found = new Set<string>();

  const lines = text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const record = JSON.parse(line) as FeedbackResponse;
      if (!wanted.has(record.id)) return line;
      found.add(record.id);
      const next: FeedbackResponse = options.reopen
        ? { ...record, status: "open", resolvedAt: null, updatedAt: nowIso }
        : { ...record, status: "resolved", resolvedAt: nowIso, updatedAt: nowIso };
      return JSON.stringify(next);
    });

  const missing = ids.filter((id) => !found.has(id));
  if (missing.length > 0) {
    process.stderr.write(`instafix resolve: id(s) not found: ${missing.join(", ")}\n`);
    process.exitCode = 1;
    return;
  }

  await writeFile(historyPath, `${lines.join("\n")}\n`, "utf8");
  const verb = options.reopen ? "reopened" : "resolved";
  process.stderr.write(`instafix resolve: ${found.size} feedback(s) ${verb}.\n`);
}
