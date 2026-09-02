import { mkdtempSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FeedbackCreateInput } from "@instafix/core";
import { describe, expect, it } from "vitest";
import { createInstaFixHandler, FsStore } from "../src/index.js";

function makeCreateInput(overrides: Partial<FeedbackCreateInput> = {}): FeedbackCreateInput {
  return {
    clientId: "client-1",
    projectName: "handoff-test",
    type: "bug",
    status: "open",
    message: "저장 버튼이 동작하지 않음",
    url: "http://localhost/page",
    viewport: "1280x800",
    userAgent: "test",
    authorName: "tester",
    authorEmail: "t@example.com",
    annotations: [],
    screenshotDataUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    ...overrides,
  };
}

function freshStore(): { store: FsStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), "instafix-handoff-"));
  return { store: new FsStore({ dir }), dir };
}

describe("FsStore.writeHandoff", () => {
  it("writes the feedback as an agent prompt into <dir>/outbox/<id>.md", async () => {
    const { store, dir } = freshStore();
    const record = await store.createFeedback(makeCreateInput());

    expect(await store.writeHandoff(record.id)).toBe(true);

    const files = await readdir(join(dir, "outbox"));
    expect(files).toContain(`${record.id}.md`);
    const content = await readFile(join(dir, "outbox", `${record.id}.md`), "utf8");
    expect(content).toContain("저장 버튼이 동작하지 않음");
    expect(content).toContain(`(ID: ${record.id})`);
    // Close-the-loop footer — the whole point of a handoff file.
    expect(content).toContain("npx @instafix/cli resolve <ID>");
  });

  it("returns false for an unknown id and writes nothing", async () => {
    const { store, dir } = freshStore();
    await store.createFeedback(makeCreateInput());

    expect(await store.writeHandoff("nope")).toBe(false);
    await expect(readdir(join(dir, "outbox"))).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe("createInstaFixHandler handoff route", () => {
  it("POST {action:'handoff', id} writes the outbox file and answers ok", async () => {
    const { store, dir } = freshStore();
    const record = await store.createFeedback(makeCreateInput());
    const handler = createInstaFixHandler({ store });

    const res = await handler.POST(
      new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({ action: "handoff", id: record.id }),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(await readdir(join(dir, "outbox"))).toContain(`${record.id}.md`);
  });

  it("answers 404 for an unknown id", async () => {
    const { store } = freshStore();
    const handler = createInstaFixHandler({ store });
    const res = await handler.POST(
      new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({ action: "handoff", id: "nope" }),
      }),
    );
    expect(res.status).toBe(404);
  });

  it("a normal feedback POST still reaches the core handler untouched", async () => {
    const { store } = freshStore();
    const handler = createInstaFixHandler({ store });
    const res = await handler.POST(
      new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(makeCreateInput({ clientId: "client-2" })),
      }),
    );
    // The core handler owns this path — whatever it answers, it must not be
    // the handoff branch's 404-with-{error:"handoff not supported"} shape.
    const body = (await res.json()) as { error?: string };
    expect(body.error).not.toBe("handoff not supported");
  });
});
