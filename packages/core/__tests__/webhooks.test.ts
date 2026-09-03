import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedbackRecord } from "../src/types.js";
import { buildWebhookPayload, dispatchWebhook, dispatchWebhooks } from "../src/webhooks.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const FEEDBACK: FeedbackRecord = {
  id: "fb-test-1",
  projectName: "test-project",
  type: "bug",
  message: "The button overlaps the modal close icon",
  status: "open",
  url: "https://example.com/orders/42",
  urlPattern: "/orders/:orderId",
  viewport: "1920x1080",
  userAgent: "Mozilla/5.0",
  authorName: "Alice",
  authorEmail: "alice@example.com",
  clientId: "client-uuid-1",
  resolvedAt: null,
  createdAt: new Date("2026-05-14T10:00:00Z"),
  updatedAt: new Date("2026-05-14T10:00:00Z"),
  annotations: [],
  screenshotUrl: null,
  screenshotRegion: null,
  diagnostics: null,
};

let fetchSpy: ReturnType<typeof vi.fn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.fn().mockResolvedValue(new Response("", { status: 200 }));
  globalThis.fetch = fetchSpy as unknown as typeof fetch;
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Payload formatting
// ---------------------------------------------------------------------------

describe("buildWebhookPayload", () => {
  it("formats Slack payload with blocks + text fallback", () => {
    const payload = buildWebhookPayload("slack", FEEDBACK);
    expect(payload.text).toContain("Alice");
    expect(payload.text).toContain("bug");
    expect(payload.text).toContain("The button overlaps");
    expect(Array.isArray(payload.blocks)).toBe(true);
    expect(payload.blocks.length).toBeGreaterThan(0);
    expect(payload.blocks[0]).toEqual(expect.objectContaining({ type: "header" }));
  });

  it("formats Discord payload with content + embed", () => {
    const payload = buildWebhookPayload("discord", FEEDBACK);
    expect(payload.content).toContain("Alice");
    expect(payload.content).toContain("bug");
    expect(payload.embeds[0]?.title).toContain("test-project");
    expect(payload.embeds[0]?.description).toContain("button overlaps");
    // Bug type maps to the red palette colour.
    expect(payload.embeds[0]?.color).toBe(0xef4444);
  });

  it("returns raw feedback as generic payload", () => {
    const payload = buildWebhookPayload("generic", FEEDBACK);
    expect(payload).toBe(FEEDBACK);
  });

  it("truncates excessively long messages for chat platforms", () => {
    const long = { ...FEEDBACK, message: "x".repeat(2000) };
    const slack = buildWebhookPayload("slack", long);
    const discord = buildWebhookPayload("discord", long);
    // Headline + ': ' prefix + 300 char preview (with ellipsis) — stays
    // well below Slack's 3000-char block limit.
    expect(slack.text.length).toBeLessThan(500);
    expect(discord.embeds[0]?.description.length).toBeLessThan(500);
    expect(discord.embeds[0]?.description.endsWith("…")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// dispatchWebhook — golden + edge cases
// ---------------------------------------------------------------------------

describe("dispatchWebhook", () => {
  it("POSTs Slack payload to the configured URL", async () => {
    await dispatchWebhook({ url: "https://hooks.slack.com/T/B/X", type: "slack" }, FEEDBACK);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [calledUrl, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe("https://hooks.slack.com/T/B/X");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    const sent = JSON.parse(init.body as string) as { text: string };
    expect(sent.text).toContain("Alice");
  });

  it("POSTs Discord payload to the configured URL", async () => {
    await dispatchWebhook({ url: "https://discord.com/api/webhooks/x", type: "discord" }, FEEDBACK);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const sent = JSON.parse(init.body as string) as { content: string; embeds: unknown[] };
    expect(sent.content).toContain("bug");
    expect(sent.embeds).toHaveLength(1);
  });

  it("POSTs raw feedback as generic JSON by default", async () => {
    await dispatchWebhook({ url: "https://hooks.example.com" }, FEEDBACK);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const sent = JSON.parse(init.body as string) as { id: string; type: string };
    expect(sent.id).toBe(FEEDBACK.id);
    expect(sent.type).toBe("bug");
  });

  it("merges custom headers on top of Content-Type default", async () => {
    await dispatchWebhook(
      {
        url: "https://hooks.example.com",
        headers: { "X-Signature": "abc", Authorization: "Bearer xyz" },
      },
      FEEDBACK,
    );
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "X-Signature": "abc",
      Authorization: "Bearer xyz",
    });
  });

  it("invokes onError on a 500 response and does not throw", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    const onError = vi.fn();
    await expect(dispatchWebhook({ url: "https://hooks.example.com", onError }, FEEDBACK)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
    const [err, id] = onError.mock.calls[0] as [Error, string];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(/500/);
    expect(id).toBe(FEEDBACK.id);
  });

  it("invokes onError on a network failure and does not throw", async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const onError = vi.fn();
    await expect(dispatchWebhook({ url: "https://hooks.example.com", onError }, FEEDBACK)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
    expect((onError.mock.calls[0] as [Error, string])[0].message).toBe("Failed to fetch");
  });

  it("falls back to console.warn when no onError is provided", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 502 }));
    await dispatchWebhook({ url: "https://hooks.example.com" }, FEEDBACK);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(String(warnSpy.mock.calls[0]?.[0])).toContain("502");
  });

  it("aborts the fetch when the per-webhook timeout elapses", async () => {
    // Spy on fetch so we observe the signal and never resolve.
    let abortReason: unknown;
    fetchSpy.mockImplementationOnce(
      (_url: RequestInfo, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init.signal as AbortSignal;
          signal.addEventListener("abort", () => {
            abortReason = signal.reason;
            // Match real fetch behaviour: rejects with a DOMException-like
            // AbortError when aborted.
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    vi.useFakeTimers();
    const onError = vi.fn();
    const promise = dispatchWebhook({ url: "https://hooks.example.com", timeoutMs: 50, onError }, FEEDBACK);
    await vi.advanceTimersByTimeAsync(60);
    await promise;
    vi.useRealTimers();

    expect(onError).toHaveBeenCalledOnce();
    expect(abortReason).toBeDefined();
  });

  it("wraps a non-Error rejection (e.g. a thrown string) into a real Error before reporting", async () => {
    fetchSpy.mockRejectedValueOnce("network died");
    const onError = vi.fn();
    await dispatchWebhook({ url: "https://hooks.example.com", onError }, FEEDBACK);
    expect(onError).toHaveBeenCalledOnce();
    const reported = onError.mock.calls[0]?.[0];
    expect(reported).toBeInstanceOf(Error);
    expect((reported as Error).message).toBe("network died");
  });

  it("does not throw when the user-supplied onError itself throws", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("boom"));
    const onError = vi.fn(() => {
      throw new Error("user bug");
    });
    await expect(dispatchWebhook({ url: "https://hooks.example.com", onError }, FEEDBACK)).resolves.toBeUndefined();
    // The thrown user error is reported via console.warn so it isn't swallowed.
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(String(warnSpy.mock.calls[0]?.[0])).toContain("user bug");
  });
});

// ---------------------------------------------------------------------------
// dispatchWebhooks — parallelism
// ---------------------------------------------------------------------------

describe("dispatchWebhooks", () => {
  it("dispatches every configured webhook in parallel", async () => {
    let resolveCount = 0;
    fetchSpy.mockImplementation(
      () =>
        new Promise((resolve) => {
          // Tiny stagger to make sure they're actually concurrent — if these
          // ran sequentially, the sum of delays would exceed any single one.
          setTimeout(() => {
            resolveCount++;
            resolve(new Response("", { status: 200 }));
          }, 20);
        }),
    );

    const start = Date.now();
    await dispatchWebhooks(
      [
        { url: "https://slack.example.com", type: "slack" },
        { url: "https://discord.example.com", type: "discord" },
        { url: "https://generic.example.com" },
      ],
      FEEDBACK,
    );
    const elapsed = Date.now() - start;

    expect(resolveCount).toBe(3);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    // 3 × 20ms sequentially would be >= 60ms; in parallel it should land
    // well below 60ms. Generous bound to avoid flakes on CI.
    expect(elapsed).toBeLessThan(120);
  });

  it("returns immediately when no webhooks are configured", async () => {
    await dispatchWebhooks([], FEEDBACK);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
