// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createT } from "../../src/i18n/index.js";
import { MultiTargetPreview, type PreviewResolution } from "../../src/multi-target-preview.js";
import { buildThemeColors } from "../../src/styles/theme.js";
import { makeDOMRect } from "../helpers.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const colors = buildThemeColors();
const t = createT("en");

function stubLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  });
  return store;
}

function stubRect(el: Element, rect: { x: number; y: number; width: number; height: number }): void {
  (el as HTMLElement).getBoundingClientRect = () => makeDOMRect(rect.x, rect.y, rect.width, rect.height);
}

function makeElements(n: number): HTMLElement[] {
  const els: HTMLElement[] = [];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    stubRect(el, { x: i * 100, y: 0, width: 40, height: 20 });
    document.body.appendChild(el);
    els.push(el);
  }
  return els;
}

const ANCHOR_RECT = makeDOMRect(0, 0, 200, 100);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MultiTargetPreview", () => {
  let store: Record<string, string>;
  let elements: HTMLElement[];
  let preview: MultiTargetPreview | null;
  let onResolutionChange: ReturnType<
    typeof vi.fn<(resolution: PreviewResolution, elements: readonly Element[]) => void>
  >;

  beforeEach(() => {
    store = stubLocalStorage();
    elements = makeElements(3);
    preview = null;
    onResolutionChange = vi.fn();
  });

  afterEach(() => {
    preview?.destroy();
    for (const el of elements) el.remove();
  });

  it("renders one numbered badge per element, in order", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const badges = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent === "1" || b.textContent === "2" || b.textContent === "3",
    );
    expect(badges.map((b) => b.textContent)).toEqual(["1", "2", "3"]);
  });

  it("sets an aria-label on each badge with its number", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const badges = document.querySelectorAll("button");
    const second = Array.from(badges).find((b) => b.textContent === "2")!;
    expect(second.getAttribute("aria-label")).toBe(t("annotator.targetBadgeAria").replace("{number}", "2"));
  });

  it("does not show an outline until a badge is hovered", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    // Only badges + the toggle chip should exist; no outline divs yet.
    const outlineCandidates = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlineCandidates.length).toBe(0);
  });

  it("shows an outline on badge mouseenter and removes it on mouseleave", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const badge = Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "1")!;

    badge.dispatchEvent(new MouseEvent("mouseenter"));
    let outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(1);

    badge.dispatchEvent(new MouseEvent("mouseleave"));
    outlines = Array.from(document.body.querySelectorAll("div")).filter((d) => d.style.border?.includes("2px solid"));
    expect(outlines.length).toBe(0);
  });

  it("shows an outline on badge focus and removes it on blur", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const badge = Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "2")!;

    badge.dispatchEvent(new FocusEvent("focus"));
    let outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(1);

    badge.dispatchEvent(new FocusEvent("blur"));
    outlines = Array.from(document.body.querySelectorAll("div")).filter((d) => d.style.border?.includes("2px solid"));
    expect(outlines.length).toBe(0);
  });

  it("clicking the 'always show' toggle shows all outlines at once", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;

    toggle.click();

    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(3);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  it("outlines stay visible after mouseleave once 'always show' is on", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;
    toggle.click();

    const badge = Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "1")!;
    badge.dispatchEvent(new MouseEvent("mouseenter"));
    badge.dispatchEvent(new MouseEvent("mouseleave"));

    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(3);
  });

  it("clicking the toggle again turns 'always show' back off and clears outlines", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;

    toggle.click(); // on
    toggle.click(); // off

    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(0);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("persists the 'always show' preference across instances", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;
    toggle.click();
    expect(store.instafix_target_preview_always_show).toBe("1");

    preview.destroy();
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );

    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(3);
  });

  it("turning the preference back off clears the stored key", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;
    toggle.click(); // on
    toggle.click(); // off

    expect(store.instafix_target_preview_always_show).toBeUndefined();
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new DOMException("blocked");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("blocked");
      }),
    });

    expect(() => {
      preview = new MultiTargetPreview(
        colors,
        { summary: elements, detail: elements },
        t,
        ANCHOR_RECT,
        onResolutionChange,
      );
      const toggle = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
      )!;
      toggle.click();
    }).not.toThrow();
  });

  it("destroy() removes all badges, outlines, and the toggle from the DOM", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const toggle = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === t("annotator.targetPreviewAlwaysShow"),
    )!;
    toggle.click(); // show all outlines too

    preview.destroy();
    preview = null;

    expect(document.querySelectorAll("button").length).toBe(0);
    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(0);
  });

  it("hovering the same badge twice does not create duplicate outlines", () => {
    preview = new MultiTargetPreview(
      colors,
      { summary: elements, detail: elements },
      t,
      ANCHOR_RECT,
      onResolutionChange,
    );
    const badge = Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "1")!;

    badge.dispatchEvent(new MouseEvent("mouseenter"));
    badge.dispatchEvent(new MouseEvent("mouseenter"));

    const outlines = Array.from(document.body.querySelectorAll("div")).filter((d) =>
      d.style.border?.includes("2px solid"),
    );
    expect(outlines.length).toBe(1);
  });

  // -------------------------------------------------------------------------
  // Summary/detail resolution toggle
  // -------------------------------------------------------------------------

  describe("resolution toggle", () => {
    it("starts in summary resolution, showing the summary set's badges", () => {
      const summary = elements.slice(0, 2);
      const detail = elements;
      preview = new MultiTargetPreview(colors, { summary, detail }, t, ANCHOR_RECT, onResolutionChange);

      const badges = Array.from(document.querySelectorAll("button")).filter((b) =>
        ["1", "2", "3"].includes(b.textContent ?? ""),
      );
      expect(badges.map((b) => b.textContent)).toEqual(["1", "2"]);
    });

    it("switching to detail rebuilds badges from the detail set and calls onResolutionChange", () => {
      const summary = elements.slice(0, 2);
      const detail = elements;
      preview = new MultiTargetPreview(colors, { summary, detail }, t, ANCHOR_RECT, onResolutionChange);

      const detailBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === t("annotator.resolutionDetail"),
      )!;
      detailBtn.click();

      const badges = Array.from(document.querySelectorAll("button")).filter((b) =>
        ["1", "2", "3"].includes(b.textContent ?? ""),
      );
      expect(badges.map((b) => b.textContent)).toEqual(["1", "2", "3"]);
      expect(onResolutionChange).toHaveBeenCalledWith("detail", detail);
      expect(detailBtn.getAttribute("aria-pressed")).toBe("true");
    });

    it("switching back to summary removes the extra detail badges", () => {
      const summary = elements.slice(0, 2);
      const detail = elements;
      preview = new MultiTargetPreview(colors, { summary, detail }, t, ANCHOR_RECT, onResolutionChange);

      const detailBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === t("annotator.resolutionDetail"),
      )!;
      const summaryBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === t("annotator.resolutionSummary"),
      )!;
      detailBtn.click();
      summaryBtn.click();

      const badges = Array.from(document.querySelectorAll("button")).filter((b) =>
        ["1", "2", "3"].includes(b.textContent ?? ""),
      );
      expect(badges.map((b) => b.textContent)).toEqual(["1", "2"]);
      expect(onResolutionChange).toHaveBeenLastCalledWith("summary", summary);
    });

    it("switching resolution clears any outline left over from the previous resolution's badges", () => {
      const summary = elements.slice(0, 2);
      const detail = elements;
      preview = new MultiTargetPreview(colors, { summary, detail }, t, ANCHOR_RECT, onResolutionChange);

      const badge1 = Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "1")!;
      badge1.dispatchEvent(new MouseEvent("mouseenter"));
      expect(
        Array.from(document.body.querySelectorAll("div")).filter((d) => d.style.border?.includes("2px solid")),
      ).toHaveLength(1);

      const detailBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === t("annotator.resolutionDetail"),
      )!;
      detailBtn.click();

      expect(
        Array.from(document.body.querySelectorAll("div")).filter((d) => d.style.border?.includes("2px solid")),
      ).toHaveLength(0);
    });

    it("does not render a resolution toggle when both sets have at most one element", () => {
      const single = elements.slice(0, 1);
      preview = new MultiTargetPreview(colors, { summary: single, detail: single }, t, ANCHOR_RECT, onResolutionChange);

      expect(
        Array.from(document.querySelectorAll("button")).some((b) => b.textContent === t("annotator.resolutionDetail")),
      ).toBe(false);
    });

    it("destroy() removes the resolution toggle too", () => {
      preview = new MultiTargetPreview(
        colors,
        { summary: elements, detail: elements },
        t,
        ANCHOR_RECT,
        onResolutionChange,
      );
      preview.destroy();
      preview = null;

      expect(
        Array.from(document.querySelectorAll("button")).some((b) => b.textContent === t("annotator.resolutionDetail")),
      ).toBe(false);
    });
  });
});
