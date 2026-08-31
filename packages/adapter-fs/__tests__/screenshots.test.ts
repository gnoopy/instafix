import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FeedbackCreateInput } from "@instafix/core";
import { describe, expect, it } from "vitest";
import { FsStore } from "../src/index.js";

const MINIMAL_ANNOTATION = {
  cssSelector: "div.main",
  xpath: "/html/body/div",
  textSnippet: "Hello",
  elementTag: "DIV",
  textPrefix: "",
  textSuffix: "",
  fingerprint: "abc",
  neighborText: "",
  xPct: 0.1,
  yPct: 0.1,
  wPct: 0.2,
  hPct: 0.2,
  scrollX: 0,
  scrollY: 0,
  viewportW: 1280,
  viewportH: 800,
  devicePixelRatio: 1,
};

function baseInput(overrides: Partial<FeedbackCreateInput> = {}): FeedbackCreateInput {
  return {
    projectName: "test-project",
    type: "bug" as const,
    message: "Something is broken",
    status: "open" as const,
    url: "https://example.com",
    viewport: "1280x800",
    userAgent: "test-agent",
    authorName: "Tester",
    authorEmail: "tester@example.com",
    clientId: "client-1",
    annotations: [MINIMAL_ANNOTATION],
    ...overrides,
  };
}

function newStore() {
  return new FsStore({ dir: mkdtempSync(join(tmpdir(), "instafix-adapter-fs-screenshots-")) });
}

// A 1x1 red pixel JPEG, base64-encoded — small enough to inline here.
const TINY_JPEG =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

describe("FsStore screenshot handling", () => {
  it("writes the screenshot to a file and rewrites screenshotUrl to point at it", async () => {
    const store = newStore();
    const record = await store.createFeedback(baseInput({ screenshotDataUrl: `data:image/jpeg;base64,${TINY_JPEG}` }));

    expect(record.screenshotUrl).not.toBeNull();
    expect(record.screenshotUrl).toMatch(/^\/api\/instafix\/screenshots\/client-1\.jpg$/);
  });

  it("respects a custom screenshotUrlPrefix", async () => {
    const dir = mkdtempSync(join(tmpdir(), "instafix-adapter-fs-screenshots-"));
    const store = new FsStore({ dir, screenshotUrlPrefix: "/shots" });
    const record = await store.createFeedback(baseInput({ screenshotDataUrl: `data:image/jpeg;base64,${TINY_JPEG}` }));

    expect(record.screenshotUrl).toBe("/shots/client-1.jpg");
    const bytes = readFileSync(join(dir, "screenshots", "client-1.jpg"));
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("falls back to a random filename when clientId isn't filesystem-safe", async () => {
    const store = newStore();
    const record = await store.createFeedback(
      baseInput({ clientId: "../../etc/passwd", screenshotDataUrl: `data:image/jpeg;base64,${TINY_JPEG}` }),
    );

    expect(record.screenshotUrl).not.toContain("..");
    expect(record.screenshotUrl).toMatch(/^\/api\/instafix\/screenshots\/[A-Za-z0-9_-]+\.jpg$/);
  });

  it("leaves screenshotUrl null when the data URL doesn't match the expected shape", async () => {
    const store = newStore();
    const record = await store.createFeedback(baseInput({ screenshotDataUrl: "not-a-data-url" }));
    expect(record.screenshotUrl).toBeNull();
  });

  it("persists history across store instances pointed at the same directory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "instafix-adapter-fs-history-"));
    const storeA = new FsStore({ dir });
    await storeA.createFeedback(baseInput());

    const storeB = new FsStore({ dir });
    const page = await storeB.getFeedbacks({ projectName: "test-project" });
    expect(page.feedbacks).toHaveLength(1);
  });
});
