import type { FeedbackResponse } from "@instafix/core";
import { el, parseSvg, setText } from "./dom-utils.js";
import type { TFunction } from "./i18n/index.js";
import type { ThemeColors } from "./styles/theme.js";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

export const ICON_EXPORT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

// Generic spreadsheet/grid icon — used for the XLSX export option.
const ICON_XLSX = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;

const ICON_JSON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"/><path d="M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/></svg>`;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

export const EXPORT_CSS = `
  /* ============================
     Export Button & Menu
     ============================ */

  .sp-export-btn {
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: transparent;
    color: var(--sp-text-tertiary);
    font-family: var(--sp-font);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
    position: relative;
  }

  .sp-export-btn svg {
    width: 13px;
    height: 13px;
  }

  .sp-export-btn:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sp-export-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    padding: 4px;
    border-radius: var(--sp-radius);
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-lg);
    z-index: 10;
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }

  .sp-export-menu--open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .sp-export-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .sp-export-option:hover,
  .sp-export-option:focus-visible {
    background: var(--sp-accent-light);
    color: var(--sp-accent);
  }

  .sp-export-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sp-export-option-icon svg {
    width: 16px;
    height: 16px;
  }

  .sp-export-option-label {
    flex: 1;
  }

  .sp-export-error {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    max-width: 220px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-lg);
    color: #ef4444;
    font-family: var(--sp-font);
    font-size: 11px;
    line-height: 1.4;
    z-index: 11;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }

  .sp-export-error--visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (forced-colors: active) {
    .sp-export-btn,
    .sp-export-option,
    .sp-export-menu {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-export-btn:focus-visible,
    .sp-export-option:focus-visible {
      outline: 3px solid Highlight !important;
    }
  }
`;

// ---------------------------------------------------------------------------
// XLSX / JSON conversion
// ---------------------------------------------------------------------------

/** Columns written to the XLSX export, in order. `id` is dropped — not useful in a report meant for humans. */
const XLSX_COLUMNS: ReadonlyArray<{
  key: Extract<
    keyof FeedbackResponse,
    "type" | "status" | "message" | "url" | "authorName" | "authorEmail" | "createdAt" | "resolvedAt" | "viewport"
  >;
  header: string;
  width: number;
}> = [
  { key: "type", header: "Type", width: 12 },
  { key: "status", header: "Status", width: 14 },
  { key: "message", header: "Message", width: 50 },
  { key: "url", header: "URL", width: 40 },
  { key: "authorName", header: "Author", width: 20 },
  { key: "authorEmail", header: "Email", width: 26 },
  { key: "createdAt", header: "Created At", width: 22 },
  { key: "resolvedAt", header: "Resolved At", width: 22 },
  { key: "viewport", header: "Viewport", width: 14 },
];

const SCREENSHOT_COLUMN_KEY = "screenshot";
const SCREENSHOT_COLUMN_WIDTH = 24;
const SCREENSHOT_COLUMN_INDEX = XLSX_COLUMNS.length; // 0-based
const MAX_THUMBNAIL_PX = 160;
const DEFAULT_ROW_HEIGHT_PT = 20;

/**
 * Guard a free-text spreadsheet cell against formula injection.
 *
 * Spreadsheet apps (Excel, Google Sheets, LibreOffice) may treat a cell
 * starting with `=`, `+`, `-`, `@`, or a leading TAB/CR as a formula — even
 * one written as a plain string value through a library like exceljs, since
 * some viewers re-evaluate leading-formula-trigger characters regardless of
 * the underlying cell type. Columns like `message`, `authorName`,
 * `authorEmail`, and `url` are arbitrary end-user input, so a payload such as
 * `=HYPERLINK("http://evil", A1)` could execute when a reviewer opens the
 * exported file. We neutralize it by prefixing a single quote (the
 * OWASP-recommended guard), which forces the cell to be treated as text.
 */
function guardFormulaInjection(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Convert feedbacks to formatted JSON string */
export function feedbacksToJson(feedbacks: FeedbackResponse[]): string {
  return JSON.stringify(feedbacks, null, 2);
}

// ---------------------------------------------------------------------------
// Screenshot resolution — data URL, same-origin URL, or external URL
// ---------------------------------------------------------------------------

type SupportedImageExtension = "jpeg" | "png" | "gif";

function extensionFromMime(mime: string): SupportedImageExtension | null {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpeg";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  return null;
}

function extensionFromUrl(url: string): SupportedImageExtension | null {
  const match = /\.(jpe?g|png|gif)(?:[?#]|$)/i.exec(url);
  if (!match) return null;
  const ext = match[1]?.toLowerCase();
  return ext === "jpg" ? "jpeg" : ((ext as SupportedImageExtension | undefined) ?? null);
}

/** Convert an ArrayBuffer to a base64 `data:` URL, chunked to avoid call-stack limits on large buffers. */
function arrayBufferToDataUrl(buffer: ArrayBuffer, mime: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

/** Load an image's natural dimensions from a data URL, without inserting it into the page. */
function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

interface ResolvedScreenshot {
  dataUrl: string;
  extension: SupportedImageExtension;
  width: number;
  height: number;
}

/**
 * Resolve a `FeedbackResponse.screenshotUrl` to actual image bytes, whatever
 * form it takes: `null` (no screenshot), an inline `data:` URL (memory /
 * localStorage adapters), a same-origin relative URL (adapter-fs's
 * screenshots route), or an absolute external URL (S3/CDN via
 * `ScreenshotStorage`). Never throws — a failed fetch (e.g. CORS on an
 * external CDN) or an unsupported image format just skips the image so the
 * rest of the row's data still exports.
 */
async function resolveScreenshot(screenshotUrl: string | null): Promise<ResolvedScreenshot | null> {
  if (!screenshotUrl) return null;
  try {
    let dataUrl: string;
    let mime: string;

    if (screenshotUrl.startsWith("data:")) {
      const match = /^data:([^;,]+)/.exec(screenshotUrl);
      mime = match?.[1] ?? "image/jpeg";
      dataUrl = screenshotUrl;
    } else {
      const response = await fetch(screenshotUrl);
      if (!response.ok) return null;
      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();
      const buffer = await response.arrayBuffer();
      mime = contentType || (extensionFromUrl(screenshotUrl) ? `image/${extensionFromUrl(screenshotUrl)}` : "");
      if (!mime) mime = "image/jpeg"; // best-effort default when neither header nor extension helps
      dataUrl = arrayBufferToDataUrl(buffer, mime);
    }

    const extension = extensionFromMime(mime) ?? extensionFromUrl(screenshotUrl);
    if (!extension) return null; // unsupported format (e.g. webp/svg) — skip the image, keep the row

    const dims = await loadImageDimensions(dataUrl);
    return { dataUrl, extension, width: dims?.width ?? 1, height: dims?.height ?? 1 };
  } catch (err) {
    console.warn("[instafix] Failed to embed screenshot in XLSX export:", err);
    return null;
  }
}

/** Scale (width, height) down to fit within a square thumbnail box, preserving aspect ratio, never upscaling. */
function fitThumbnail(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(MAX_THUMBNAIL_PX / width, MAX_THUMBNAIL_PX / height, 1);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** px -> Excel row height points (96dpi: 1px = 0.75pt), with headroom for cell padding. */
function pxToRowHeightPt(px: number): number {
  return Math.round(px * 0.75) + 16;
}

// ---------------------------------------------------------------------------
// XLSX conversion
// ---------------------------------------------------------------------------

/**
 * Convert feedbacks to a polished, submittable XLSX report: one worksheet,
 * one row per feedback, a bold header row, and each item's screenshot
 * embedded inline as a thumbnail in a "Screenshot" column.
 *
 * Async because it lazy-loads exceljs (a meaningfully large library kept out
 * of the widget's main bundle, same spirit as `screenshot.ts`'s dynamic
 * `import("html2canvas")`) and fetches/decodes each screenshot's bytes.
 */
export async function feedbacksToXlsx(feedbacks: FeedbackResponse[]): Promise<ArrayBuffer> {
  // Dynamic import kept out of the module's static graph on purpose — see
  // the doc comment above and screenshot.ts's html2canvas loader.
  const mod = (await import("exceljs")) as typeof import("exceljs") & {
    default?: typeof import("exceljs");
  };
  const ExcelJS = mod.default ?? mod;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "instafix";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Feedback", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = [
    ...XLSX_COLUMNS.map((col) => ({ header: col.header, key: col.key, width: col.width })),
    { header: "Screenshot", key: SCREENSHOT_COLUMN_KEY, width: SCREENSHOT_COLUMN_WIDTH },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = DEFAULT_ROW_HEIGHT_PT;

  for (const fb of feedbacks) {
    const rowValues: Record<string, string> = {};
    for (const col of XLSX_COLUMNS) {
      const raw = fb[col.key];
      rowValues[col.key] = guardFormulaInjection(raw == null ? "" : String(raw));
    }
    rowValues[SCREENSHOT_COLUMN_KEY] = "";

    const row = worksheet.addRow(rowValues);
    row.alignment = { vertical: "middle", wrapText: true };
    row.height = DEFAULT_ROW_HEIGHT_PT;

    const image = await resolveScreenshot(fb.screenshotUrl);
    if (image) {
      const thumb = fitThumbnail(image.width, image.height);
      const imageId = workbook.addImage({ base64: image.dataUrl, extension: image.extension });
      worksheet.addImage(imageId, {
        tl: { col: SCREENSHOT_COLUMN_INDEX, row: row.number - 1 },
        ext: thumb,
      });
      row.height = Math.max(DEFAULT_ROW_HEIGHT_PT, pxToRowHeightPt(thumb.height));
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

/** Normalize a Uint8Array to a standalone ArrayBuffer slice (BlobPart-compatible across TS lib versions). */
function toBlobPart(content: string | ArrayBuffer | Uint8Array): BlobPart {
  if (typeof content === "string" || content instanceof ArrayBuffer) return content;
  return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength) as ArrayBuffer;
}

/** Trigger browser download of a string or binary buffer as a file */
export function downloadFile(content: string | ArrayBuffer | Uint8Array, filename: string, mimeType: string): void {
  const blob = new Blob([toBlobPart(content)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  // Clean up after a tick to ensure the download starts
  requestAnimationFrame(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  });
}

// ---------------------------------------------------------------------------
// ExportButton component
// ---------------------------------------------------------------------------

export class ExportButton {
  readonly element: HTMLElement;

  private menu: HTMLElement;
  private errorHint: HTMLElement;
  private isOpen = false;
  private errorHideTimer: ReturnType<typeof setTimeout> | undefined;
  private onDocumentClick: (e: MouseEvent) => void;

  constructor(
    _colors: ThemeColors,
    private readonly getFeedbacks: () => FeedbackResponse[],
    private readonly t: TFunction,
  ) {
    // Wrapper for relative positioning of the menu
    this.element = el("div", { style: "position: relative; display: inline-flex;" });

    // Trigger button — matches .sp-btn-delete-all pill style
    const btn = document.createElement("button");
    btn.className = "sp-export-btn";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.appendChild(parseSvg(ICON_EXPORT));
    const label = document.createElement("span");
    setText(label, t("export.label"));
    btn.appendChild(label);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Dropdown menu
    this.menu = el("div", { class: "sp-export-menu" });
    this.menu.setAttribute("role", "menu");

    // Excel (XLSX) option
    const xlsxOption = this.createOption(ICON_XLSX, t("export.xlsx"), () => {
      this.exportAs("xlsx");
    });

    // JSON option
    const jsonOption = this.createOption(ICON_JSON, t("export.json"), () => {
      this.exportAs("json");
    });

    this.menu.appendChild(xlsxOption);
    this.menu.appendChild(jsonOption);

    // Transient error hint, shown when an export fails (e.g. an XLSX
    // screenshot fetch throws unexpectedly outside the per-image guard).
    this.errorHint = el("div", { class: "sp-export-error" });
    this.errorHint.setAttribute("role", "status");
    this.errorHint.setAttribute("aria-live", "polite");

    this.element.appendChild(btn);
    this.element.appendChild(this.menu);
    this.element.appendChild(this.errorHint);

    // Close on outside click
    this.onDocumentClick = (e: MouseEvent) => {
      if (this.isOpen && !this.element.contains(e.target as Node)) {
        this.close();
      }
    };
    document.addEventListener("click", this.onDocumentClick, true);
  }

  private createOption(iconSvg: string, labelText: string, onClick: () => void): HTMLButtonElement {
    const option = document.createElement("button");
    option.className = "sp-export-option";
    option.setAttribute("role", "menuitem");

    const iconWrap = el("span", { class: "sp-export-option-icon" });
    iconWrap.appendChild(parseSvg(iconSvg));

    const labelEl = el("span", { class: "sp-export-option-label" });
    setText(labelEl, labelText);

    option.appendChild(iconWrap);
    option.appendChild(labelEl);

    option.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
      this.close();
    });

    return option;
  }

  private toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  private open(): void {
    this.isOpen = true;
    this.menu.classList.add("sp-export-menu--open");
    const btn = this.element.querySelector<HTMLButtonElement>(".sp-export-btn");
    btn?.setAttribute("aria-expanded", "true");
  }

  private close(): void {
    this.isOpen = false;
    this.menu.classList.remove("sp-export-menu--open");
    const btn = this.element.querySelector<HTMLButtonElement>(".sp-export-btn");
    btn?.setAttribute("aria-expanded", "false");
  }

  private showError(): void {
    setText(this.errorHint, this.t("export.failedHint"));
    this.errorHint.classList.add("sp-export-error--visible");
    if (this.errorHideTimer) clearTimeout(this.errorHideTimer);
    this.errorHideTimer = setTimeout(() => {
      this.errorHint.classList.remove("sp-export-error--visible");
    }, 4000);
  }

  private exportAs(format: "xlsx" | "json"): void {
    const feedbacks = this.getFeedbacks();
    if (feedbacks.length === 0) return;

    const projectName = feedbacks[0]?.projectName ?? "feedbacks";
    const date = new Date().toISOString().slice(0, 10);
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, "_");

    if (format === "json") {
      const content = feedbacksToJson(feedbacks);
      downloadFile(content, `feedbacks-${safeName}-${date}.json`, "application/json;charset=utf-8");
      return;
    }

    // XLSX generation is async (lazy-loads exceljs, fetches screenshots) and
    // can fail — never let that leave the button stuck disabled or fail silently.
    void this.exportXlsx(feedbacks, safeName, date);
  }

  private async exportXlsx(feedbacks: FeedbackResponse[], safeName: string, date: string): Promise<void> {
    const btn = this.element.querySelector<HTMLButtonElement>(".sp-export-btn");
    btn?.setAttribute("disabled", "true");
    try {
      const buffer = await feedbacksToXlsx(feedbacks);
      downloadFile(
        buffer,
        `feedbacks-${safeName}-${date}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (err) {
      console.error("[instafix] XLSX export failed:", err);
      this.showError();
    } finally {
      btn?.removeAttribute("disabled");
    }
  }

  destroy(): void {
    document.removeEventListener("click", this.onDocumentClick, true);
    if (this.errorHideTimer) clearTimeout(this.errorHideTimer);
    this.element.remove();
  }
}
