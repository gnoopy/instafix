import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchCommand } from "../../src/commands/watch.js";

describe("watchCommand", () => {
  let dir: string;
  let stdout: string[];
  let stderr: string[];

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "instafix-watch-test-"));
    stdout = [];
    stderr = [];
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      stdout.push(chunk.toString());
      return true;
    });
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      stderr.push(chunk.toString());
      return true;
    });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("--once delivers an already-queued handoff and exits without watching", async () => {
    const outbox = join(dir, "outbox");
    mkdirSync(outbox, { recursive: true });
    writeFileSync(join(outbox, "fb-a.md"), "# Fix this\n", "utf8");

    await watchCommand({ dir, once: true });

    expect(stdout.join("")).toContain("# Fix this");
    expect(stderr.join("")).toContain("delivered fb-a.md");
    // Consumed exactly once — moved out of outbox into outbox/processed.
    expect(readdirSync(outbox)).not.toContain("fb-a.md");
    expect(readdirSync(join(outbox, "processed"))).toContain("fb-a.md");
  });

  it("ignores non-.md files already queued in the outbox", async () => {
    const outbox = join(dir, "outbox");
    mkdirSync(outbox, { recursive: true });
    writeFileSync(join(outbox, "fb-a.md"), "# Fix this\n", "utf8");
    writeFileSync(join(outbox, "notes.txt"), "not a handoff\n", "utf8");

    await watchCommand({ dir, once: true });

    expect(stdout.join("")).not.toContain("not a handoff");
    expect(readdirSync(outbox)).toContain("notes.txt");
  });

  it("delivers multiple already-queued handoffs in sorted order when not --once bound to one", async () => {
    const outbox = join(dir, "outbox");
    mkdirSync(outbox, { recursive: true });
    writeFileSync(join(outbox, "fb-b.md"), "# Second\n", "utf8");
    writeFileSync(join(outbox, "fb-a.md"), "# First\n", "utf8");

    await watchCommand({ dir, once: true });

    // --once stops after the FIRST delivered file, in sorted (fb-a before fb-b) order.
    expect(stdout.join("")).toContain("# First");
    expect(stdout.join("")).not.toContain("# Second");
  });

  // Deliberately not testing the "nothing queued, fall through to fs.watch"
  // path: that needs a real inotify watch, and CI/shared runners commonly
  // cap max_user_instances at 128 — a limit the rest of a large parallel
  // test run can plausibly exhaust on its own (observed locally). Every
  // scenario above already exercises the recursive mkdir and the delivery/
  // rename logic without that risk.
});
