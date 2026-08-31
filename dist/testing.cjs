"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/testing.ts
var testing_exports = {};
__export(testing_exports, {
  testInstaFixStore: () => testInstaFixStore
});
module.exports = __toCommonJS(testing_exports);

// ../core/src/testing.ts
var import_vitest = require("vitest");

// ../core/src/type-utils.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function hasOwn(value, key) {
  return isRecord(value) && key in value;
}

// ../core/src/types.ts
var StoreNotFoundError = class extends Error {
  code = "STORE_NOT_FOUND";
  constructor(message = "Record not found") {
    super(message);
    this.name = "StoreNotFoundError";
  }
};
var StoreDuplicateError = class extends Error {
  code = "STORE_DUPLICATE";
  constructor(message = "Duplicate record") {
    super(message);
    this.name = "StoreDuplicateError";
  }
};
function hasErrorCode(error, code) {
  return hasOwn(error, "code") && error.code === code;
}
function isStoreDuplicate(error) {
  if (error instanceof StoreDuplicateError) return true;
  return hasErrorCode(error, "P2002");
}

// ../core/src/testing.ts
function createInput(overrides) {
  return {
    projectName: "test-project",
    type: "bug",
    message: "Something is broken",
    status: "open",
    url: "https://example.com",
    viewport: "1920x1080",
    userAgent: "Mozilla/5.0",
    authorName: "Alice",
    authorEmail: "alice@test.com",
    clientId: `client-${Date.now()}-${Math.random()}`,
    annotations: [
      {
        cssSelector: "div.main",
        xpath: "/html/body/div",
        textSnippet: "Hello",
        elementTag: "DIV",
        elementId: "main",
        textPrefix: "before",
        textSuffix: "after",
        fingerprint: "3:1:abc",
        neighborText: "sibling",
        xPct: 0.1,
        yPct: 0.2,
        wPct: 0.5,
        hPct: 0.3,
        scrollX: 0,
        scrollY: 100,
        viewportW: 1920,
        viewportH: 1080,
        devicePixelRatio: 2
      }
    ],
    ...overrides
  };
}
var MINIMAL_ANNOTATION = {
  cssSelector: "div",
  xpath: "/div",
  textSnippet: "",
  elementTag: "DIV",
  textPrefix: "",
  textSuffix: "",
  fingerprint: "1:0:x",
  neighborText: "",
  xPct: 0,
  yPct: 0,
  wPct: 1,
  hPct: 1,
  scrollX: 0,
  scrollY: 0,
  viewportW: 1920,
  viewportH: 1080,
  devicePixelRatio: 1
};
function testInstaFixStore(factory, options) {
  const duplicateBehavior = options?.duplicateBehavior ?? "return";
  const caseInsensitiveSearch = options?.caseInsensitiveSearch ?? true;
  (0, import_vitest.describe)("InstaFixStore conformance", () => {
    let store;
    (0, import_vitest.beforeEach)(async () => {
      store = await factory();
    });
    (0, import_vitest.describe)("createFeedback", () => {
      (0, import_vitest.it)("creates a feedback and returns a FeedbackRecord", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.id).toBeDefined();
        (0, import_vitest.expect)(record.projectName).toBe("test-project");
        (0, import_vitest.expect)(record.type).toBe("bug");
        (0, import_vitest.expect)(record.message).toBe("Something is broken");
        (0, import_vitest.expect)(record.status).toBe("open");
        (0, import_vitest.expect)(record.resolvedAt).toBeNull();
        (0, import_vitest.expect)(record.createdAt).toBeInstanceOf(Date);
        (0, import_vitest.expect)(record.updatedAt).toBeInstanceOf(Date);
      });
      (0, import_vitest.it)("creates annotations with feedbackId reference", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.annotations).toHaveLength(1);
        const [ann] = record.annotations;
        (0, import_vitest.expect)(ann).toBeDefined();
        (0, import_vitest.expect)(ann?.id).toBeDefined();
        (0, import_vitest.expect)(ann?.feedbackId).toBe(record.id);
        (0, import_vitest.expect)(ann?.cssSelector).toBe("div.main");
        (0, import_vitest.expect)(ann?.xPct).toBe(0.1);
        (0, import_vitest.expect)(ann?.elementId).toBe("main");
        (0, import_vitest.expect)(ann?.createdAt).toBeInstanceOf(Date);
      });
      (0, import_vitest.it)("sets elementId to null when undefined in input", async () => {
        const record = await store.createFeedback(createInput({ annotations: [{ ...MINIMAL_ANNOTATION }] }));
        (0, import_vitest.expect)(record.annotations[0]?.elementId).toBeNull();
      });
      (0, import_vitest.it)("persists anchorKey when provided", async () => {
        const record = await store.createFeedback(
          createInput({
            annotations: [
              {
                ...MINIMAL_ANNOTATION,
                cssSelector: "section",
                xpath: "/section",
                textSnippet: "Services",
                elementTag: "SECTION",
                anchorKey: "order-card.services"
              }
            ]
          })
        );
        (0, import_vitest.expect)(record.annotations[0]?.anchorKey).toBe("order-card.services");
      });
      (0, import_vitest.it)("persists anchorKey as null when omitted", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.annotations[0]?.anchorKey).toBeNull();
      });
      (0, import_vitest.it)("persists screenshotUrl as null when no data URL is provided", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.screenshotUrl).toBeNull();
      });
      (0, import_vitest.it)("persists the screenshot data URL inline when no external storage is configured", async () => {
        const dataUrl = "data:image/jpeg;base64,/9j/4AAQ";
        const record = await store.createFeedback(createInput({ screenshotDataUrl: dataUrl }));
        (0, import_vitest.expect)(record.screenshotUrl).toBe(dataUrl);
      });
      (0, import_vitest.it)("persists screenshotRegion verbatim when provided", async () => {
        const region = { xPct: 0.1234, yPct: 0.5678, wPct: 0.25, hPct: 0.125 };
        const record = await store.createFeedback(createInput({ screenshotRegion: region }));
        (0, import_vitest.expect)(record.screenshotRegion).toEqual(region);
      });
      (0, import_vitest.it)("persists screenshotRegion as null when omitted", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.screenshotRegion).toBeNull();
      });
      (0, import_vitest.it)("persists diagnostics verbatim when provided", async () => {
        const diagnostics = {
          console: [{ level: "error", timestamp: "2026-01-01T00:00:00.000Z", message: "boom" }],
          network: [
            {
              url: "https://api.test/things",
              method: "GET",
              status: 500,
              durationMs: 123,
              timestamp: "2026-01-01T00:00:01.000Z"
            }
          ]
        };
        const record = await store.createFeedback(createInput({ diagnostics }));
        (0, import_vitest.expect)(record.diagnostics).toEqual(diagnostics);
      });
      (0, import_vitest.it)("persists diagnostics as null when omitted", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.diagnostics).toBeNull();
      });
      if (duplicateBehavior === "return") {
        (0, import_vitest.it)("deduplicates by clientId (idempotent)", async () => {
          const input = createInput({ clientId: "same-id" });
          const first = await store.createFeedback(input);
          const second = await store.createFeedback(input);
          (0, import_vitest.expect)(second.id).toBe(first.id);
          const { total } = await store.getFeedbacks({ projectName: "test-project" });
          (0, import_vitest.expect)(total).toBe(1);
        });
      } else {
        (0, import_vitest.it)("throws StoreDuplicateError on duplicate clientId", async () => {
          const input = createInput({ clientId: "same-id" });
          await store.createFeedback(input);
          await (0, import_vitest.expect)(store.createFeedback(input)).rejects.toSatisfy(isStoreDuplicate);
          const { total } = await store.getFeedbacks({ projectName: "test-project" });
          (0, import_vitest.expect)(total).toBe(1);
        });
      }
      (0, import_vitest.it)("stores newest feedbacks first", async () => {
        const a = await store.createFeedback(createInput({ message: "first" }));
        const b = await store.createFeedback(createInput({ message: "second" }));
        const { feedbacks } = await store.getFeedbacks({ projectName: "test-project" });
        (0, import_vitest.expect)(feedbacks[0]?.id).toBe(b.id);
        (0, import_vitest.expect)(feedbacks[1]?.id).toBe(a.id);
      });
      (0, import_vitest.it)("generates unique IDs across calls", async () => {
        const a = await store.createFeedback(createInput());
        const b = await store.createFeedback(createInput());
        (0, import_vitest.expect)(a.id).not.toBe(b.id);
      });
      (0, import_vitest.it)("creates feedbacks with no annotations", async () => {
        const record = await store.createFeedback(createInput({ annotations: [] }));
        (0, import_vitest.expect)(record.annotations).toHaveLength(0);
      });
    });
    (0, import_vitest.describe)("getFeedbacks", () => {
      (0, import_vitest.it)("returns empty array when no feedbacks", async () => {
        const result = await store.getFeedbacks({ projectName: "test-project" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(0);
        (0, import_vitest.expect)(result.total).toBe(0);
      });
      (0, import_vitest.it)("filters by projectName", async () => {
        await store.createFeedback(createInput({ projectName: "a" }));
        await store.createFeedback(createInput({ projectName: "b" }));
        const result = await store.getFeedbacks({ projectName: "a" });
        (0, import_vitest.expect)(result.total).toBe(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.projectName).toBe("a");
      });
      (0, import_vitest.it)("filters by type", async () => {
        await store.createFeedback(createInput({ type: "bug" }));
        await store.createFeedback(createInput({ type: "question" }));
        const result = await store.getFeedbacks({ projectName: "test-project", type: "bug" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.type).toBe("bug");
      });
      (0, import_vitest.it)("filters by status", async () => {
        const fb = await store.createFeedback(createInput());
        await store.updateFeedback(fb.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        await store.createFeedback(createInput());
        const result = await store.getFeedbacks({ projectName: "test-project", status: "open" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
      });
      (0, import_vitest.it)("filters by status in_progress", async () => {
        const fb = await store.createFeedback(createInput());
        await store.updateFeedback(fb.id, { status: "in_progress", resolvedAt: null });
        await store.createFeedback(createInput());
        const result = await store.getFeedbacks({ projectName: "test-project", status: "in_progress" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.status).toBe("in_progress");
      });
      (0, import_vitest.it)("filters by status wont_fix", async () => {
        const fb = await store.createFeedback(createInput());
        await store.updateFeedback(fb.id, { status: "wont_fix", resolvedAt: /* @__PURE__ */ new Date() });
        await store.createFeedback(createInput());
        const result = await store.getFeedbacks({ projectName: "test-project", status: "wont_fix" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.status).toBe("wont_fix");
      });
      (0, import_vitest.it)("filters by a statuses bucket (any of the listed values)", async () => {
        const open = await store.createFeedback(createInput());
        const prog = await store.createFeedback(createInput());
        await store.updateFeedback(prog.id, { status: "in_progress", resolvedAt: null });
        const resolved = await store.createFeedback(createInput());
        await store.updateFeedback(resolved.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        const result = await store.getFeedbacks({
          projectName: "test-project",
          statuses: ["open", "in_progress"]
        });
        (0, import_vitest.expect)(result.total).toBe(2);
        (0, import_vitest.expect)(result.feedbacks.map((f) => f.id).sort()).toEqual([open.id, prog.id].sort());
      });
      (0, import_vitest.it)("paginates a statuses bucket with the correct total", async () => {
        for (let i = 0; i < 3; i++) {
          const fb = await store.createFeedback(createInput());
          await store.updateFeedback(fb.id, { status: "in_progress", resolvedAt: null });
        }
        const closed = await store.createFeedback(createInput());
        await store.updateFeedback(closed.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        const page1 = await store.getFeedbacks({
          projectName: "test-project",
          statuses: ["open", "in_progress"],
          page: 1,
          limit: 2
        });
        (0, import_vitest.expect)(page1.total).toBe(3);
        (0, import_vitest.expect)(page1.feedbacks).toHaveLength(2);
        const page2 = await store.getFeedbacks({
          projectName: "test-project",
          statuses: ["open", "in_progress"],
          page: 2,
          limit: 2
        });
        (0, import_vitest.expect)(page2.total).toBe(3);
        (0, import_vitest.expect)(page2.feedbacks).toHaveLength(1);
      });
      (0, import_vitest.it)("prefers statuses over status when both are set", async () => {
        await store.createFeedback(createInput());
        const prog = await store.createFeedback(createInput());
        await store.updateFeedback(prog.id, { status: "in_progress", resolvedAt: null });
        const result = await store.getFeedbacks({
          projectName: "test-project",
          status: "open",
          statuses: ["open", "in_progress"]
        });
        (0, import_vitest.expect)(result.total).toBe(2);
      });
      (0, import_vitest.it)("ignores an empty statuses array (no status filter)", async () => {
        await store.createFeedback(createInput());
        const prog = await store.createFeedback(createInput());
        await store.updateFeedback(prog.id, { status: "in_progress", resolvedAt: null });
        const result = await store.getFeedbacks({ projectName: "test-project", statuses: [] });
        (0, import_vitest.expect)(result.total).toBe(2);
      });
      (0, import_vitest.it)("filters by search (same-case substring)", async () => {
        await store.createFeedback(createInput({ message: "Button is broken" }));
        await store.createFeedback(createInput({ message: "Layout looks great" }));
        const result = await store.getFeedbacks({ projectName: "test-project", search: "broken" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.message).toBe("Button is broken");
      });
      if (caseInsensitiveSearch) {
        (0, import_vitest.it)("filters by search (case-insensitive)", async () => {
          await store.createFeedback(createInput({ message: "Button is broken" }));
          await store.createFeedback(createInput({ message: "Layout looks great" }));
          const result = await store.getFeedbacks({ projectName: "test-project", search: "BROKEN" });
          (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
          (0, import_vitest.expect)(result.feedbacks[0]?.message).toBe("Button is broken");
        });
      }
      (0, import_vitest.it)("filters by exact url", async () => {
        await store.createFeedback(createInput({ url: "https://app.test/orders/42" }));
        await store.createFeedback(createInput({ url: "https://app.test/dashboard" }));
        const result = await store.getFeedbacks({ projectName: "test-project", url: "https://app.test/dashboard" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(1);
        (0, import_vitest.expect)(result.feedbacks[0]?.url).toBe("https://app.test/dashboard");
      });
      (0, import_vitest.it)("filters by urlPattern", async () => {
        await store.createFeedback(createInput({ url: "https://app.test/orders/42", urlPattern: "/orders/:id" }));
        await store.createFeedback(createInput({ url: "https://app.test/orders/99", urlPattern: "/orders/:id" }));
        await store.createFeedback(createInput({ url: "https://app.test/dashboard", urlPattern: "/dashboard" }));
        const result = await store.getFeedbacks({ projectName: "test-project", urlPattern: "/orders/:id" });
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(2);
      });
      (0, import_vitest.it)("persists urlPattern as null when omitted from input", async () => {
        const record = await store.createFeedback(createInput());
        (0, import_vitest.expect)(record.urlPattern).toBeNull();
      });
      (0, import_vitest.it)("paginates correctly", async () => {
        for (let i = 0; i < 5; i++) {
          await store.createFeedback(createInput());
        }
        const page1 = await store.getFeedbacks({ projectName: "test-project", page: 1, limit: 2 });
        (0, import_vitest.expect)(page1.feedbacks).toHaveLength(2);
        (0, import_vitest.expect)(page1.total).toBe(5);
        const page3 = await store.getFeedbacks({ projectName: "test-project", page: 3, limit: 2 });
        (0, import_vitest.expect)(page3.feedbacks).toHaveLength(1);
      });
      (0, import_vitest.it)("caps limit at 100", async () => {
        for (let i = 0; i < 105; i++) {
          await store.createFeedback(createInput({ annotations: [] }));
        }
        const result = await store.getFeedbacks({ projectName: "test-project", limit: 200 });
        (0, import_vitest.expect)(result.total).toBe(105);
        (0, import_vitest.expect)(result.feedbacks).toHaveLength(100);
      });
    });
    (0, import_vitest.describe)("findByClientId", () => {
      (0, import_vitest.it)("returns the record when found", async () => {
        const created = await store.createFeedback(createInput({ clientId: "find-me" }));
        const found = await store.findByClientId("find-me");
        (0, import_vitest.expect)(found).not.toBeNull();
        (0, import_vitest.expect)(found?.id).toBe(created.id);
      });
      (0, import_vitest.it)("returns null when not found", async () => {
        (0, import_vitest.expect)(await store.findByClientId("nope")).toBeNull();
      });
    });
    (0, import_vitest.describe)("updateFeedback", () => {
      (0, import_vitest.it)("updates status to resolved with resolvedAt", async () => {
        const fb = await store.createFeedback(createInput());
        const resolvedAt = /* @__PURE__ */ new Date();
        const updated = await store.updateFeedback(fb.id, { status: "resolved", resolvedAt });
        (0, import_vitest.expect)(updated.status).toBe("resolved");
        (0, import_vitest.expect)(updated.resolvedAt).toEqual(resolvedAt);
        (0, import_vitest.expect)(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(fb.updatedAt.getTime());
      });
      (0, import_vitest.it)("updates status to in_progress with resolvedAt null", async () => {
        const fb = await store.createFeedback(createInput());
        const updated = await store.updateFeedback(fb.id, { status: "in_progress", resolvedAt: null });
        (0, import_vitest.expect)(updated.status).toBe("in_progress");
        (0, import_vitest.expect)(updated.resolvedAt).toBeNull();
      });
      (0, import_vitest.it)("updates status to wont_fix with the given resolvedAt", async () => {
        const fb = await store.createFeedback(createInput());
        const resolvedAt = /* @__PURE__ */ new Date();
        const updated = await store.updateFeedback(fb.id, { status: "wont_fix", resolvedAt });
        (0, import_vitest.expect)(updated.status).toBe("wont_fix");
        (0, import_vitest.expect)(updated.resolvedAt).toEqual(resolvedAt);
      });
      (0, import_vitest.it)("throws StoreNotFoundError for unknown id", async () => {
        await (0, import_vitest.expect)(store.updateFeedback("unknown", { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() })).rejects.toThrow(
          StoreNotFoundError
        );
      });
      (0, import_vitest.it)("can reopen a closed feedback", async () => {
        const fb = await store.createFeedback(createInput());
        await store.updateFeedback(fb.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        const reopened = await store.updateFeedback(fb.id, { status: "open", resolvedAt: null });
        (0, import_vitest.expect)(reopened.status).toBe("open");
        (0, import_vitest.expect)(reopened.resolvedAt).toBeNull();
        await store.updateFeedback(fb.id, { status: "wont_fix", resolvedAt: /* @__PURE__ */ new Date() });
        const reopenedAgain = await store.updateFeedback(fb.id, { status: "open", resolvedAt: null });
        (0, import_vitest.expect)(reopenedAgain.status).toBe("open");
        (0, import_vitest.expect)(reopenedAgain.resolvedAt).toBeNull();
      });
      (0, import_vitest.it)("edits the message in place when provided (G7), preserving status/resolvedAt", async () => {
        const fb = await store.createFeedback(createInput({ message: "original" }));
        const updated = await store.updateFeedback(fb.id, { status: "open", resolvedAt: null, message: "edited" });
        (0, import_vitest.expect)(updated.message).toBe("edited");
        (0, import_vitest.expect)(updated.status).toBe("open");
      });
      (0, import_vitest.it)("leaves the message untouched when omitted from the update", async () => {
        const fb = await store.createFeedback(createInput({ message: "keep me" }));
        const updated = await store.updateFeedback(fb.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        (0, import_vitest.expect)(updated.message).toBe("keep me");
      });
      (0, import_vitest.it)("replaces the annotation set when annotations are provided (G7 reconnect)", async () => {
        const fb = await store.createFeedback(createInput());
        (0, import_vitest.expect)(fb.annotations).toHaveLength(1);
        const originalAnnotationId = fb.annotations[0]?.id;
        const replacement = { ...MINIMAL_ANNOTATION, cssSelector: "button.reconnected" };
        const updated = await store.updateFeedback(fb.id, {
          status: "open",
          resolvedAt: null,
          annotations: [replacement]
        });
        (0, import_vitest.expect)(updated.annotations).toHaveLength(1);
        (0, import_vitest.expect)(updated.annotations[0]?.cssSelector).toBe("button.reconnected");
        (0, import_vitest.expect)(updated.annotations[0]?.feedbackId).toBe(fb.id);
        (0, import_vitest.expect)(updated.annotations[0]?.id).not.toBe(originalAnnotationId);
      });
      (0, import_vitest.it)("leaves annotations untouched when omitted from the update", async () => {
        const fb = await store.createFeedback(createInput());
        const originalSelector = fb.annotations[0]?.cssSelector;
        const updated = await store.updateFeedback(fb.id, { status: "resolved", resolvedAt: /* @__PURE__ */ new Date() });
        (0, import_vitest.expect)(updated.annotations[0]?.cssSelector).toBe(originalSelector);
      });
    });
    (0, import_vitest.describe)("deleteFeedback", () => {
      (0, import_vitest.it)("removes the feedback", async () => {
        const fb = await store.createFeedback(createInput());
        await store.deleteFeedback(fb.id);
        const { total } = await store.getFeedbacks({ projectName: "test-project" });
        (0, import_vitest.expect)(total).toBe(0);
      });
      (0, import_vitest.it)("throws StoreNotFoundError for unknown id", async () => {
        await (0, import_vitest.expect)(store.deleteFeedback("unknown")).rejects.toThrow(StoreNotFoundError);
      });
    });
    (0, import_vitest.describe)("deleteAllFeedbacks", () => {
      (0, import_vitest.it)("removes all feedbacks for a project but keeps others", async () => {
        await store.createFeedback(createInput({ projectName: "delete-me" }));
        await store.createFeedback(createInput({ projectName: "delete-me" }));
        await store.createFeedback(createInput({ projectName: "keep-me" }));
        await store.deleteAllFeedbacks("delete-me");
        (0, import_vitest.expect)((await store.getFeedbacks({ projectName: "delete-me" })).total).toBe(0);
        (0, import_vitest.expect)((await store.getFeedbacks({ projectName: "keep-me" })).total).toBe(1);
      });
      (0, import_vitest.it)("is a no-op when project has no feedbacks", async () => {
        await (0, import_vitest.expect)(store.deleteAllFeedbacks("nonexistent")).resolves.toBeUndefined();
      });
    });
    (0, import_vitest.describe)("verifyProjectOwnership", () => {
      (0, import_vitest.it)("returns true for the owning project, false otherwise (when implemented)", async () => {
        if (!store.verifyProjectOwnership) return;
        const fb = await store.createFeedback(createInput({ projectName: "owner" }));
        await (0, import_vitest.expect)(store.verifyProjectOwnership(fb.id, "owner")).resolves.toBe(true);
        await (0, import_vitest.expect)(store.verifyProjectOwnership(fb.id, "intruder")).resolves.toBe(false);
        await (0, import_vitest.expect)(store.verifyProjectOwnership("unknown-id", "owner")).resolves.toBe(false);
      });
    });
  });
}
//# sourceMappingURL=testing.cjs.map