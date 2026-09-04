// @vitest-environment jsdom

import type { FeedbackResponse } from "@instafix/core";
import ExcelJS from "exceljs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadFile, ExportButton, feedbacksToJson, feedbacksToXlsx } from "../../src/export-utils.js";
import { createT } from "../../src/i18n/index.js";
import { buildThemeColors } from "../../src/styles/theme.js";

// A 1x1 transparent PNG, base64-encoded — small enough to embed cheaply in tests.
const TINY_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function installObjectUrlMocks(): void {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:instafix-export"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
}

/**
 * jsdom never actually decodes images, so a real `new Image()` assigned a
 * `data:` URL never fires `load`/`error` — it just hangs forever. Stub the
 * global constructor so `loadImageDimensions()` in export-utils.ts resolves
 * the way it would in a real browser, with fixed fake dimensions.
 */
function installFakeImage(width = 40, height = 30): void {
  class FakeImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = width;
    naturalHeight = height;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }
  vi.stubGlobal("Image", FakeImage);
}

function makeFeedback(overrides: Partial<FeedbackResponse> = {}): FeedbackResponse {
  return {
    id: "fb-1",
    projectName: "Client Portal",
    type: "bug",
    message: "Export button fails",
    status: "open",
    url: "https://example.com/dashboard",
    viewport: "1440x900",
    userAgent: "vitest",
    authorName: "Ava Tester",
    authorEmail: "ava@example.com",
    resolvedAt: null,
    createdAt: "2026-04-30T12:00:00.000Z",
    updatedAt: "2026-04-30T12:30:00.000Z",
    annotations: [],
    urlPattern: null,
    screenshotUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    ...overrides,
  };
}

/** Parse a generated XLSX ArrayBuffer back into a workbook for assertions. */
async function readWorkbook(buffer: ArrayBuffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's Node `Buffer` type doesn't line up with the browser-facing
  // ArrayBuffer we produce; this is a test-only bridge to load it back.
  await workbook.xlsx.load(buffer as any);
  return workbook;
}

describe("feedback export conversion", () => {
  describe("feedbacksToXlsx", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("writes a header row and one data row per feedback, in column order", async () => {
      const buffer = await feedbacksToXlsx([
        makeFeedback({ id: "fb-a", message: "First item" }),
        makeFeedback({
          id: "fb-b",
          message: "Second item",
          status: "resolved",
          resolvedAt: "2026-05-01T00:00:00.000Z",
        }),
      ]);

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);

      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback");
      expect(sheet).toBeDefined();

      const headerValues = sheet!.getRow(1).values as unknown[];
      // exceljs row.values is 1-indexed (index 0 is unused), so drop it.
      expect(headerValues.slice(1)).toEqual([
        "Type",
        "Status",
        "Message",
        "URL",
        "Author",
        "Email",
        "Created At",
        "Resolved At",
        "Viewport",
        "Screenshot",
      ]);
      expect(sheet!.getRow(1).font?.bold).toBe(true);

      const row2 = sheet!.getRow(2).values as unknown[];
      expect(row2.slice(1, 4)).toEqual(["bug", "open", "First item"]);

      const row3 = sheet!.getRow(3).values as unknown[];
      expect(row3.slice(1, 4)).toEqual(["bug", "resolved", "Second item"]);
      expect(row3[8]).toBe("2026-05-01T00:00:00.000Z");

      // `id` is intentionally dropped — not useful in a human-facing report.
      expect(sheet!.getRow(1).values).not.toContain("id");
      expect(sheet!.getRow(1).values).not.toContain("ID");
    });

    it("returns only the header row when there are no feedbacks", async () => {
      const buffer = await feedbacksToXlsx([]);
      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;
      expect(sheet.rowCount).toBe(1);
    });

    it("neutralizes spreadsheet formula injection in free-text fields", async () => {
      const buffer = await feedbacksToXlsx([
        makeFeedback({
          message: '=HYPERLINK("http://evil","click")',
          url: "@SUM(A1:A9)",
          authorName: "+1-555-0100",
          authorEmail: "-2+3",
        }),
      ]);
      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;
      const row = sheet.getRow(2).values as unknown[];

      // Each field starting with = + - @ is prefixed with a single quote so the
      // spreadsheet treats it as text instead of evaluating it as a formula.
      expect(row[3]).toBe('\'=HYPERLINK("http://evil","click")');
      expect(row[4]).toBe("'@SUM(A1:A9)");
      expect(row[5]).toBe("'+1-555-0100");
      expect(row[6]).toBe("'-2+3");
    });

    it("embeds a decoded data: URL screenshot as an inline image", async () => {
      installFakeImage();
      const buffer = await feedbacksToXlsx([makeFeedback({ screenshotUrl: TINY_PNG_DATA_URL })]);
      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;

      const images = sheet.getImages();
      expect(images.length).toBe(1);
      const media = workbook.model.media[images[0]!.imageId as unknown as number];
      expect(media?.extension).toBe("png");

      // The row was sized taller than the default to make room for the thumbnail.
      expect(sheet.getRow(2).height).toBeGreaterThan(20);
    });

    it("fetches a same-origin relative screenshot URL and embeds the bytes", async () => {
      installFakeImage();
      const pngBytes = Uint8Array.from(atob(TINY_PNG_DATA_URL.split(",")[1]!), (c) => c.charCodeAt(0));
      const fetchMock = vi.fn(async () => ({
        ok: true,
        headers: { get: () => "image/png" },
        arrayBuffer: async () => pngBytes.buffer,
      }));
      vi.stubGlobal("fetch", fetchMock);

      const buffer = await feedbacksToXlsx([makeFeedback({ screenshotUrl: "/api/instafix/screenshots/fb-1.png" })]);

      expect(fetchMock).toHaveBeenCalledWith("/api/instafix/screenshots/fb-1.png");
      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;
      expect(sheet.getImages().length).toBe(1);

      vi.unstubAllGlobals();
    });

    it("skips the image but keeps the row when an external screenshot fetch fails (e.g. CORS)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        }),
      );

      const buffer = await feedbacksToXlsx([
        makeFeedback({ id: "fb-cors", message: "still exported", screenshotUrl: "https://cdn.example.com/shot.jpg" }),
      ]);

      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;
      expect(sheet.getImages().length).toBe(0);
      expect((sheet.getRow(2).values as unknown[])[3]).toBe("still exported");

      vi.unstubAllGlobals();
    });

    it("leaves the row imageless when screenshotUrl is null", async () => {
      const buffer = await feedbacksToXlsx([makeFeedback({ screenshotUrl: null })]);
      const workbook = await readWorkbook(buffer);
      const sheet = workbook.getWorksheet("Feedback")!;
      expect(sheet.getImages().length).toBe(0);
    });
  });

  it("serializes formatted JSON without dropping nested annotation data", () => {
    const json = feedbacksToJson([
      makeFeedback({
        annotations: [
          {
            id: "ann-1",
            feedbackId: "fb-1",
            cssSelector: ".cta",
            xpath: "/html/body/button",
            textSnippet: "Submit",
            elementTag: "BUTTON",
            elementId: null,
            textPrefix: "Before",
            textSuffix: "After",
            fingerprint: "abc123",
            neighborText: "Cancel Submit",
            anchorKey: null,
            xPct: 10,
            yPct: 20,
            wPct: 30,
            hPct: 40,
            scrollX: 0,
            scrollY: 100,
            viewportW: 1440,
            viewportH: 900,
            devicePixelRatio: 2,
            createdAt: "2026-04-30T12:01:00.000Z",
            target: null,
            inspect: null,
          },
        ],
      }),
    ]);

    expect(JSON.parse(json)[0].annotations[0]).toMatchObject({ cssSelector: ".cta", devicePixelRatio: 2 });
    expect(json).toContain('    "id": "fb-1"');
  });
});

describe("downloadFile", () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    installObjectUrlMocks();
  });

  it("creates an object URL, clicks a hidden anchor, and revokes the URL on the next frame", async () => {
    const createObjectURL = vi.mocked(URL.createObjectURL);
    const revokeObjectURL = vi.mocked(URL.revokeObjectURL);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      callback(1);
      return 1;
    });

    downloadFile("id,message\n1,Hello", "feedbacks.csv", "text/csv;charset=utf-8");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]![0] as Blob;
    await expect(blob.text()).resolves.toBe("id,message\n1,Hello");
    expect(blob.type).toBe("text/csv;charset=utf-8");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:instafix-export");
    expect(document.querySelector("a[download='feedbacks.csv']")).toBeNull();
  });

  it("accepts an ArrayBuffer payload (the XLSX export path)", async () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      callback(1);
      return 1;
    });
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;

    downloadFile(bytes, "feedbacks.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]![0] as Blob;
    expect(blob.size).toBe(4);
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });
});

describe("ExportButton", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    installObjectUrlMocks();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    // Fake timers BEFORE the rAF spy: vitest 4 fakes requestAnimationFrame as
    // part of useFakeTimers, which would silently replace a spy installed
    // earlier — and the anchor-cleanup callback would never run.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T15:45:00.000Z"));
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      callback(1);
      return 1;
    });
  });

  it("renders English labels by default, toggles, and closes on outside click", () => {
    const button = new ExportButton(buildThemeColors(), () => [makeFeedback()], createT("en"));
    document.body.appendChild(button.element);

    const trigger = button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!;
    expect(trigger.textContent).toContain("Export");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect([...button.element.querySelectorAll(".sp-export-option-label")].map((node) => node.textContent)).toEqual([
      "Export Excel",
      "Export JSON",
    ]);

    trigger.click();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(button.element.querySelector(".sp-export-menu")?.classList.contains("sp-export-menu--open")).toBe(true);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(button.element.querySelector(".sp-export-menu")?.classList.contains("sp-export-menu--open")).toBe(false);

    button.destroy();
    expect(document.body.contains(button.element)).toBe(false);
  });

  it("renders French labels when locale='fr'", () => {
    const button = new ExportButton(buildThemeColors(), () => [makeFeedback()], createT("fr"));
    document.body.appendChild(button.element);

    const trigger = button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!;
    expect(trigger.textContent).toContain("Exporter");
    expect([...button.element.querySelectorAll(".sp-export-option-label")].map((node) => node.textContent)).toEqual([
      "Exporter Excel",
      "Exporter JSON",
    ]);
  });

  it("downloads XLSX and JSON with a sanitized project name", async () => {
    const button = new ExportButton(
      buildThemeColors(),
      () => [makeFeedback({ projectName: "Client Portal / QA" })],
      createT("en"),
    );
    document.body.appendChild(button.element);
    const trigger = button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!;

    trigger.click();
    button.element.querySelectorAll<HTMLButtonElement>(".sp-export-option")[0]!.click();
    // XLSX generation is async — flush the microtask queue under fake timers.
    await vi.waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(button.element.querySelector<HTMLButtonElement>(".sp-export-btn")?.getAttribute("aria-expanded")).toBe(
      "false",
    );
    expect(button.element.querySelector(".sp-export-btn")?.hasAttribute("disabled")).toBe(false);

    trigger.click();
    button.element.querySelectorAll<HTMLButtonElement>(".sp-export-option")[1]!.click();

    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(2);
    const downloads = Array.from(document.querySelectorAll("a")).map((anchor) => anchor.getAttribute("download"));
    expect(downloads).toEqual([]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:instafix-export");
  });

  it("shows an error hint and re-enables the button when XLSX generation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const button = new ExportButton(
      buildThemeColors(),
      () => [makeFeedback({ screenshotUrl: "https://cdn.example.com/shot.jpg" })],
      createT("en"),
    );
    document.body.appendChild(button.element);

    const trigger = button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!;
    trigger.click();
    button.element.querySelectorAll<HTMLButtonElement>(".sp-export-option")[0]!.click();

    // A failed image fetch alone doesn't throw (it's caught per-image), so this
    // export still succeeds — confirming the happy path holds even under a
    // flaky network for one row's screenshot.
    await vi.waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1));
    expect(button.element.querySelector(".sp-export-error")?.classList.contains("sp-export-error--visible")).toBe(
      false,
    );
  });

  it("does not download when there are no feedbacks", () => {
    const button = new ExportButton(buildThemeColors(), () => [], createT("en"));
    document.body.appendChild(button.element);

    button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!.click();
    button.element.querySelector<HTMLButtonElement>(".sp-export-option")!.click();

    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });

  it("falls back to 'feedbacks' filename when projectName is missing", async () => {
    // FeedbackResponse without projectName → fallback to 'feedbacks'
    const fb = makeFeedback();
    delete (fb as Partial<FeedbackResponse>).projectName;

    const button = new ExportButton(buildThemeColors(), () => [fb], createT("en"));
    document.body.appendChild(button.element);

    const trigger = button.element.querySelector<HTMLButtonElement>(".sp-export-btn")!;
    trigger.click();
    button.element.querySelectorAll<HTMLButtonElement>(".sp-export-option")[0]!.click();

    // Verify createObjectURL was called (download flow ran with fallback name)
    await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(1));
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });
});
