import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FeedbackResponse } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promptCommand } from "../../src/commands/prompt.js";

function makeFeedback(overrides: Partial<FeedbackResponse> = {}): FeedbackResponse {
  return {
    id: "fb-1",
    type: "bug",
    message: "저장 버튼이 동작하지 않음",
    status: "open",
    projectName: "instafix",
    url: "http://localhost/page",
    urlPattern: null,
    authorName: "tester",
    authorEmail: "t@example.com",
    viewport: "1280x800",
    userAgent: "test",
    resolvedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    annotations: [],
    screenshotUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    ...overrides,
  };
}

function writeHistory(dir: string, feedbacks: FeedbackResponse[]): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "history.jsonl"), `${feedbacks.map((f) => JSON.stringify(f)).join("\n")}\n`, "utf8");
}

describe("promptCommand", () => {
  let dir: string;
  let stdout: string[];
  let stderr: string[];

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "instafix-prompt-test-"));
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
    process.exitCode = 0;
  });

  it("reports a helpful error when no history file exists", async () => {
    await promptCommand({ dir, status: "open" });
    expect(process.exitCode).toBe(1);
    expect(stderr.join("")).toContain("No InstaFix history");
    expect(stdout).toHaveLength(0);
  });

  it("defaults to open feedbacks and writes agent markdown to stdout", async () => {
    writeHistory(dir, [
      makeFeedback({ id: "fb-open", status: "open" }),
      makeFeedback({ id: "fb-resolved", status: "resolved" }),
    ]);

    await promptCommand({ dir, status: "open" });

    expect(process.exitCode).toBe(0);
    const out = stdout.join("");
    expect(out).toContain("fb-open");
    expect(out).not.toContain("fb-resolved");
    expect(stderr.join("")).toContain("1 fix note(s) written to stdout");
  });

  it("--status all skips filtering entirely", async () => {
    writeHistory(dir, [
      makeFeedback({ id: "fb-open", status: "open" }),
      makeFeedback({ id: "fb-resolved", status: "resolved" }),
    ]);

    await promptCommand({ dir, status: "all" });

    const out = stdout.join("");
    expect(out).toContain("fb-open");
    expect(out).toContain("fb-resolved");
  });

  it("--status accepts a comma list", async () => {
    writeHistory(dir, [
      makeFeedback({ id: "fb-open", status: "open" }),
      makeFeedback({ id: "fb-progress", status: "in_progress" }),
      makeFeedback({ id: "fb-resolved", status: "resolved" }),
    ]);

    await promptCommand({ dir, status: "open,in_progress" });

    const out = stdout.join("");
    expect(out).toContain("fb-open");
    expect(out).toContain("fb-progress");
    expect(out).not.toContain("fb-resolved");
  });

  it("--id selects specific feedbacks regardless of status", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "resolved" }), makeFeedback({ id: "fb-b", status: "open" })]);

    await promptCommand({ dir, status: "open", id: "fb-a" });

    expect(process.exitCode).toBe(0);
    const out = stdout.join("");
    expect(out).toContain("fb-a");
    expect(out).not.toContain("fb-b");
  });

  it("--id with an unknown id fails without writing stdout", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a" })]);

    await promptCommand({ dir, status: "open", id: "fb-a,fb-missing" });

    expect(process.exitCode).toBe(1);
    expect(stderr.join("")).toContain("id(s) not found: fb-missing");
    expect(stdout).toHaveLength(0);
  });

  it("reports no matches without touching exitCode", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "resolved" })]);

    await promptCommand({ dir, status: "open" });

    expect(process.exitCode).toBe(0);
    expect(stderr.join("")).toContain("no matching fix notes");
    expect(stdout).toHaveLength(0);
  });

  it("passes --instructions through as a trimmed, non-empty line list", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "open" })]);

    await promptCommand({
      dir,
      status: "open",
      instructions: "  Fix these.  \n\n  Reply with DONE when finished.  ",
    });

    const out = stdout.join("");
    expect(out).toContain("Fix these.");
    expect(out).toContain("Reply with DONE when finished.");
  });
});
