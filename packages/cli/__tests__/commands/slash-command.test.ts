import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installSlashCommand } from "../../src/commands/slash-command.js";

describe("installSlashCommand", () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes .claude/commands/instafix.md under the given cwd", async () => {
    dir = mkdtempSync(join(tmpdir(), "instafix-slash-test-"));
    const filePath = await installSlashCommand(dir);
    expect(filePath).toBe(join(dir, ".claude", "commands", "instafix.md"));
    expect(readFileSync(filePath, "utf8")).toContain("npx @instafix/cli prompt");
  });

  it("defaults to process.cwd() when no cwd is given", async () => {
    dir = mkdtempSync(join(tmpdir(), "instafix-slash-test-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);

    const filePath = await installSlashCommand();

    expect(filePath).toBe(join(dir, ".claude", "commands", "instafix.md"));
  });
});
