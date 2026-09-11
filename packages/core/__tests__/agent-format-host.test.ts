import { describe, expect, it } from "vitest";
import {
  DEFAULT_AGENT_LABELS,
  formatFeedbackContext,
  formatFeedbacksForAgent,
  isProjectRelativeInstafixPath,
} from "../src/agent-format.js";
import { isGeneratedElementId } from "../src/generated-id.js";
import type { AnnotationResponse, FeedbackResponse } from "../src/types.js";

function annotation(overrides: Partial<AnnotationResponse> = {}): AnnotationResponse {
  return {
    id: "ann-1",
    feedbackId: "fb-1",
    cssSelector: "button.save",
    xpath: "/html/body/button",
    textSnippet: "Save",
    elementTag: "BUTTON",
    elementId: null,
    textPrefix: "",
    textSuffix: "",
    fingerprint: "1:0:0",
    neighborText: "Cancel Save",
    anchorKey: null,
    xPct: 0,
    yPct: 0,
    wPct: 1,
    hPct: 1,
    scrollX: 0,
    scrollY: 0,
    viewportW: 1440,
    viewportH: 900,
    devicePixelRatio: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    target: null,
    inspect: { domPath: ["main", "button.save"], styles: { "font-size": "12px" } },
    ...overrides,
  };
}

function feedback(overrides: Partial<FeedbackResponse> = {}): FeedbackResponse {
  return {
    id: "fx-20260911-134501-3f9a2c",
    type: "change",
    message: "Make the label larger",
    status: "open",
    projectName: "demo",
    url: "http://localhost:5173/settings",
    urlPattern: null,
    authorName: "",
    authorEmail: "",
    viewport: "1440x900",
    userAgent: "test",
    resolvedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    annotations: [annotation()],
    screenshotUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    ...overrides,
  };
}

describe("project-relative .instafix screenshot paths", () => {
  it("prints an .instafix/img path exactly as stored", () => {
    const out = formatFeedbacksForAgent([feedback({ screenshotUrl: ".instafix/img/fx-20260911-134501-3f9a2c.jpg" })]);
    expect(out).toContain("Screenshot: `.instafix/img/fx-20260911-134501-3f9a2c.jpg`");
  });

  it("accepts only plain .instafix segments", () => {
    expect(isProjectRelativeInstafixPath(".instafix/img/a.jpg")).toBe(true);
    expect(isProjectRelativeInstafixPath(".instafix/screenshots/a.png")).toBe(true);
    for (const bad of [
      ".instafix/../secret.jpg",
      ".instafix//a.jpg",
      ".instafix/./a.jpg",
      ".instafix/a b.jpg",
      "instafix/a.jpg",
      "/abs/.instafix/a.jpg",
    ]) {
      expect(isProjectRelativeInstafixPath(bad)).toBe(false);
    }
  });
});

describe("labels", () => {
  it("defaults reproduce the English document", () => {
    const fb = feedback();
    expect(formatFeedbacksForAgent([fb], { labels: {} })).toBe(formatFeedbacksForAgent([fb]));
    expect(formatFeedbacksForAgent([fb], { labels: DEFAULT_AGENT_LABELS })).toBe(formatFeedbacksForAgent([fb]));
  });

  it("replaces every structural word and leaves user content untouched", () => {
    const labels = {
      title: "화면 개선 요청",
      instructions: ["코드를 먼저 확인하세요."],
      page: "페이지",
      viewport: "화면 크기",
      request: "요청 원문:",
      target: "대상",
      element: "요소",
      selectors: "선택자:",
      context: "주변",
      nearbyText: "가까운 글자",
      domPath: "DOM 경로",
      computed: "실측 스타일",
      bounds: "위치",
      relativeToElement: "대상 요소 기준",
      screenshot: "화면 캡처",
      resolveProtocol: "고친 뒤 ID로 닫으세요:",
    };
    const out = formatFeedbacksForAgent([feedback({ screenshotUrl: ".instafix/img/x.jpg" })], { labels });
    for (const english of [
      "UI change requests",
      "Request (verbatim):",
      "Selectors:",
      "Computed:",
      "Bounds:",
      "Screenshot:",
      "Page:",
    ]) {
      expect(out).not.toContain(english);
    }
    expect(out).toContain("# 화면 개선 요청");
    expect(out).toContain("> Make the label larger");
    expect(out).toContain('대상: 요소 `button` "Save"');
    expect(out).toContain("위치: x=0% y=0% w=100% h=100% (대상 요소 기준)");
    expect(out).toContain("화면 캡처: `.instafix/img/x.jpg`");
  });
});

describe("formatFeedbackContext", () => {
  it("is the item body without title, page lines or the request quote", () => {
    const fb = feedback({ message: "ONLY-IN-THE-QUOTE" });
    const context = formatFeedbackContext(fb);
    expect(context).not.toContain("ONLY-IN-THE-QUOTE");
    expect(context).not.toContain("# ");
    expect(context.startsWith('Target: element `button` "Save"')).toBe(true);
    expect(formatFeedbacksForAgent([fb])).toContain(context);
  });

  it("says when no anchor was captured", () => {
    expect(
      formatFeedbackContext(feedback({ annotations: [] }), { labels: { target: "대상", noAnchor: "(없음)" } }),
    ).toBe("대상: (없음)");
  });
});

describe("generated element ids", () => {
  it("recognises framework ids and keeps authored ones", () => {
    for (const id of [
      ":r0:",
      ":R1a:",
      "«r3»",
      "_r_7_",
      "base-ui-_r_7_",
      "radix-:r1:",
      "headlessui-menu-button-:r3:",
      "react-aria123-4",
    ]) {
      expect(isGeneratedElementId(id)).toBe(true);
    }
    for (const id of ["buy", "main", "app", "user-card", "r_1", "header_r"]) {
      expect(isGeneratedElementId(id)).toBe(false);
    }
    expect(isGeneratedElementId(null)).toBe(false);
  });

  it("drops selectors and labels built on a generated id from older records", () => {
    const out = formatFeedbackContext(
      feedback({
        annotations: [
          annotation({
            textSnippet: "",
            elementId: "base-ui-_r_7_",
            cssSelector: "#base-ui-_r_7_ > span",
            xpath: "//button[@id='base-ui-_r_7_']",
          }),
        ],
      }),
    );
    expect(out).not.toContain("_r_7_");
    expect(out).toContain("Target: element `button`");
    expect(out).not.toContain("Selectors:");
  });

  it("keeps an authored id selector", () => {
    const out = formatFeedbackContext(
      feedback({ annotations: [annotation({ elementId: "buy", cssSelector: "#buy", xpath: "//button[@id='buy']" })] }),
    );
    expect(out).toContain("- id: `#buy`");
    expect(out).toContain("- css: `#buy`");
  });
});
