import { watch as fsWatch } from "node:fs";
import { mkdir, readdir, readFile, rename } from "node:fs/promises";
import { join } from "node:path";

export interface WatchOptions {
  dir: string;
  once?: boolean;
}

/**
 * `instafix watch` — wait for handoff files in the outbox and print each to
 * stdout as it arrives. The widget's "Agent에게" button drops a ready-made
 * prompt file into `<dir>/outbox/`; this command is the terminal-side half.
 *
 * `--once` prints the next (or an already-waiting) handoff and EXITS — built
 * for Claude Code's background-task pattern: run it as a background command
 * in your working session and the session wakes when the file lands, with
 * the prompt as the command's output. Consumed files move to
 * `outbox/processed/` so a handoff is delivered exactly once.
 */
export async function watchCommand(options: WatchOptions): Promise<void> {
  const outboxDir = join(options.dir, "outbox");
  const processedDir = join(outboxDir, "processed");
  await mkdir(processedDir, { recursive: true });

  const consume = async (name: string): Promise<boolean> => {
    if (!name.endsWith(".md")) return false;
    const filePath = join(outboxDir, name);
    let content: string;
    try {
      content = await readFile(filePath, "utf8");
    } catch {
      return false; // raced with another consumer or a partial write
    }
    process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
    await rename(filePath, join(processedDir, name)).catch(() => {});
    process.stderr.write(`instafix watch: delivered ${name}\n`);
    return true;
  };

  // Anything already queued is delivered first — a handoff clicked before
  // the watch started must not be lost.
  const existing = (await readdir(outboxDir)).filter((n) => n.endsWith(".md")).sort();
  let delivered = 0;
  for (const name of existing) {
    if (await consume(name)) delivered++;
    if (options.once && delivered > 0) return;
  }

  process.stderr.write(`instafix watch: watching ${outboxDir}${options.once ? " (exits after next handoff)" : ""}\n`);
  await new Promise<void>((resolve) => {
    const watcher = fsWatch(outboxDir, (_event, name) => {
      if (!name) return;
      // Small delay so the writer finishes before we read.
      setTimeout(() => {
        void consume(name.toString()).then((ok) => {
          if (ok && options.once) {
            watcher.close();
            resolve();
          }
        });
      }, 150);
    });
  });
}
