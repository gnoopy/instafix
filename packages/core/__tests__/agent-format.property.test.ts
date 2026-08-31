import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatFeedbacksForAgent } from "../src/agent-format.js";
import type { AnnotationResponse, AnnotationTarget, FeedbackResponse } from "../src/types.js";

/**
 * `formatFeedbacksForAgent` runs on strings the widget captured from
 * arbitrary host-page DOM and arbitrary user notes — it must never throw or
 * hang regardless of what's inside them (circular-looking text, huge
 * strings, adversarial Markdown/HTML). This is the property backing G6's
 * "formatter never throws" requirement.
 */

const arbitraryText = fc.string({ maxLength: 500 });

const targetArb: fc.Arbitrary<AnnotationTarget | null> = fc.oneof(
  fc.constant(null),
  fc.constant({ kind: "element" } as const),
  fc.record({
    kind: fc.constant("text" as const),
    quote: arbitraryText,
    quotePrefix: arbitraryText,
    quoteSuffix: arbitraryText,
  }),
  fc.constant({ kind: "area" } as const),
);

const annotationArb: fc.Arbitrary<AnnotationResponse> = fc.record({
  id: fc.constant("ann-1"),
  feedbackId: fc.constant("fb-1"),
  cssSelector: arbitraryText,
  xpath: arbitraryText,
  textSnippet: arbitraryText,
  elementTag: fc.constantFrom("DIV", "BUTTON", "SPAN", "A"),
  elementId: fc.option(arbitraryText, { nil: null }),
  textPrefix: arbitraryText,
  textSuffix: arbitraryText,
  fingerprint: arbitraryText,
  neighborText: arbitraryText,
  anchorKey: fc.option(arbitraryText, { nil: null }),
  xPct: fc.float({ min: 0, max: 1, noNaN: true }),
  yPct: fc.float({ min: 0, max: 1, noNaN: true }),
  wPct: fc.float({ min: 0, max: 1, noNaN: true }),
  hPct: fc.float({ min: 0, max: 1, noNaN: true }),
  scrollX: fc.integer(),
  scrollY: fc.integer(),
  viewportW: fc.integer({ min: 0, max: 10_000 }),
  viewportH: fc.integer({ min: 0, max: 10_000 }),
  devicePixelRatio: fc.float({ min: 0.5, max: 4, noNaN: true }),
  createdAt: fc.constant("2026-01-01T00:00:00.000Z"),
  target: targetArb,
});

const feedbackArb: fc.Arbitrary<FeedbackResponse> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 8 }),
  type: fc.constantFrom("question", "change", "bug", "other"),
  message: fc.string({ maxLength: 10_000 }),
  status: fc.constant("open"),
  projectName: fc.constant("test"),
  url: fc.string({ maxLength: 200 }),
  urlPattern: fc.constant(null),
  authorName: fc.constant(""),
  authorEmail: fc.constant(""),
  viewport: arbitraryText,
  userAgent: fc.constant("test"),
  resolvedAt: fc.constant(null),
  createdAt: fc.constant("2026-01-01T00:00:00.000Z"),
  updatedAt: fc.constant("2026-01-01T00:00:00.000Z"),
  annotations: fc.array(annotationArb, { maxLength: 3 }),
  screenshotUrl: fc.constant(null),
  screenshotRegion: fc.constant(null),
  diagnostics: fc.constant(null),
});

describe("formatFeedbacksForAgent — properties", () => {
  it("never throws for arbitrary feedback content", () => {
    fc.assert(
      fc.property(fc.array(feedbackArb, { maxLength: 20 }), (feedbacks) => {
        expect(() => formatFeedbacksForAgent(feedbacks)).not.toThrow();
      }),
    );
  });

  it("is deterministic for arbitrary input", () => {
    fc.assert(
      fc.property(fc.array(feedbackArb, { maxLength: 10 }), (feedbacks) => {
        expect(formatFeedbacksForAgent(feedbacks)).toBe(formatFeedbacksForAgent(feedbacks));
      }),
    );
  });

  it("always returns a bounded string (no runaway growth from a single item)", () => {
    fc.assert(
      fc.property(feedbackArb, (feedback) => {
        const out = formatFeedbacksForAgent([feedback]);
        // Generous bound: capped fields (~300 chars each) plus the message,
        // which can expand up to ~2x under blockquoting (a "> " prefix per
        // line) when it's all newlines — worst case is still a small multiple
        // of MAX_MESSAGE_LEN, never proportional to arbitrarily large input.
        expect(out.length).toBeLessThan(20_000);
      }),
    );
  });

  it("never throws and always reports the true target count for oversized multi-select feedbacks", () => {
    fc.assert(
      fc.property(fc.array(annotationArb, { minLength: 21, maxLength: 40 }), (annotations) => {
        const feedback: FeedbackResponse = {
          id: "fb-1",
          type: "change",
          message: "many targets",
          status: "open",
          projectName: "test",
          url: "/page",
          urlPattern: null,
          authorName: "",
          authorEmail: "",
          viewport: "1440x900",
          userAgent: "test",
          resolvedAt: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          annotations,
          screenshotUrl: null,
          screenshotRegion: null,
          diagnostics: null,
        };
        let out = "";
        expect(() => {
          out = formatFeedbacksForAgent([feedback]);
        }).not.toThrow();
        expect(out).toContain(`Targets (${annotations.length}):`);
      }),
    );
  });
});
