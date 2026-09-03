import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FeedbackResponse } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveCommand } from "../../src/commands/resolve.js";

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

function readHistory(dir: string): FeedbackResponse[] {
  return readFileSync(join(dir, "history.jsonl"), "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as FeedbackResponse);
}

describe("resolveCommand", () => {
  let dir: string;
  let stderr: string[];

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "instafix-resolve-test-"));
    stderr = [];
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
    await resolveCommand(["fb-1"], { dir });
    expect(process.exitCode).toBe(1);
    expect(stderr.join("")).toContain("no InstaFix history");
  });

  it("marks matching feedbacks resolved and leaves others untouched", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "open" }), makeFeedback({ id: "fb-b", status: "open" })]);

    await resolveCommand(["fb-a"], { dir });

    expect(process.exitCode).toBe(0);
    const records = readHistory(dir);
    const a = records.find((r) => r.id === "fb-a");
    const b = records.find((r) => r.id === "fb-b");
    expect(a?.status).toBe("resolved");
    expect(a?.resolvedAt).not.toBeNull();
    expect(b?.status).toBe("open");
    expect(b?.resolvedAt).toBeNull();
    expect(stderr.join("")).toContain("1 fix note(s) resolved");
  });

  it("--reopen clears resolvedAt and sets status back to open", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "resolved", resolvedAt: "2026-01-02T00:00:00.000Z" })]);

    await resolveCommand(["fb-a"], { dir, reopen: true });

    const [record] = readHistory(dir);
    expect(record?.status).toBe("open");
    expect(record?.resolvedAt).toBeNull();
    expect(stderr.join("")).toContain("1 fix note(s) reopened");
  });

  it("resolves multiple ids in one call", async () => {
    writeHistory(dir, [
      makeFeedback({ id: "fb-a", status: "open" }),
      makeFeedback({ id: "fb-b", status: "open" }),
      makeFeedback({ id: "fb-c", status: "open" }),
    ]);

    await resolveCommand(["fb-a", "fb-c"], { dir });

    const records = readHistory(dir);
    expect(records.find((r) => r.id === "fb-a")?.status).toBe("resolved");
    expect(records.find((r) => r.id === "fb-c")?.status).toBe("resolved");
    expect(records.find((r) => r.id === "fb-b")?.status).toBe("open");
  });

  it("fails atomically when any requested id is missing — no write at all", async () => {
    writeHistory(dir, [makeFeedback({ id: "fb-a", status: "open" })]);
    const before = readFileSync(join(dir, "history.jsonl"), "utf8");

    await resolveCommand(["fb-a", "fb-missing"], { dir });

    expect(process.exitCode).toBe(1);
    expect(stderr.join("")).toContain("id(s) not found: fb-missing");
    // fb-a must NOT have been resolved even though it was found —
    // the whole operation is all-or-nothing.
    expect(readFileSync(join(dir, "history.jsonl"), "utf8")).toBe(before);
  });
});
