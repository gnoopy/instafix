// @vitest-environment jsdom

import type { AnnotationResponse, FeedbackResponse } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentCopyButton, copyTextToClipboard } from "../../src/agent-copy.js";
import { createT } from "../../src/i18n/index.js";
import { buildThemeColors } from "../../src/styles/theme.js";
import { createShadowRoot } from "../helpers.js";

if (typeof globalThis.CSS === "undefined") {
  (globalThis as Record<string, unknown>).CSS = { escape: (s: string) => s };
}

function makeAnnotation(overrides: Partial<AnnotationResponse> = {}): AnnotationResponse {
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
    fingerprint: "1:0:x",
    neighborText: "",
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
    ...overrides,
  };
}

function makeFeedback(overrides: Partial<FeedbackResponse> = {}): FeedbackResponse {
  return {
    id: "fb-1",
    type: "change",
    message: "Make it bigger",
    status: "open",
    projectName: "test",
    url: "/settings",
    urlPattern: null,
    authorName: "",
    authorEmail: "",
    viewport: "1440x900",
    userAgent: "test",
    resolvedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    annotations: [makeAnnotation()],
    screenshotUrl: null,
    screenshotRegion: null,
    diagnostics: null,
    ...overrides,
  };
}

async function raf(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(() => r(undefined)));
}

describe("copyTextToClipboard", () => {
  const originalIsSecureContext = window.isSecureContext;

  afterEach(() => {
    Object.defineProperty(window, "isSecureContext", { value: originalIsSecureContext, configurable: true });
    delete (navigator as { clipboard?: unknown }).clipboard;
  });

  it("uses the async Clipboard API when available in a secure context", async () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const ok = await copyTextToClipboard("hello");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when the Clipboard API rejects", async () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const execCommand = vi.fn().mockReturnValue(true);
    (document as unknown as { execCommand: typeof execCommand }).execCommand = execCommand;

    const ok = await copyTextToClipboard("hello");
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  });

  it("falls back to execCommand in a non-secure context", async () => {
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const execCommand = vi.fn().mockReturnValue(true);
    (document as unknown as { execCommand: typeof execCommand }).execCommand = execCommand;

    const ok = await copyTextToClipboard("hello");
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  });

  it("reports failure instead of a phantom success when every path fails", async () => {
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const execCommand = vi.fn().mockReturnValue(false);
    (document as unknown as { execCommand: typeof execCommand }).execCommand = execCommand;

    const ok = await copyTextToClipboard("hello");
    expect(ok).toBe(false);
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  });
});

describe("AgentCopyButton", () => {
  const t = createT("en");
  let root: ShadowRoot;

  beforeEach(() => {
    root = createShadowRoot();
  });

  afterEach(() => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    delete (navigator as { clipboard?: unknown }).clipboard;
  });

  it("opens a preview dialog with the formatted Markdown and item count", async () => {
    const btn = new AgentCopyButton(
      buildThemeColors(),
      { getFeedbacks: () => [makeFeedback()], getContainer: () => root },
      t,
    );
    root.appendChild(btn.element);

    btn.element.click();
    await Promise.resolve();
    await raf();

    const dialog = root.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    const textarea = root.querySelector<HTMLTextAreaElement>(".sp-agent-modal-textarea");
    expect(textarea?.value).toContain("Make it bigger");
    expect(textarea?.value).toContain("Page: /settings");

    btn.destroy();
  });

  it("shows a success state and closes after a successful clipboard copy", async () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const btn = new AgentCopyButton(
      buildThemeColors(),
      { getFeedbacks: () => [makeFeedback()], getContainer: () => root },
      t,
    );
    root.appendChild(btn.element);

    btn.element.click();
    await Promise.resolve();
    await raf();

    const copyBtn = Array.from(root.querySelectorAll("button")).find((b) => b.textContent === "Copy");
    expect(copyBtn).toBeDefined();
    copyBtn?.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalled();
    expect(root.querySelector(".sp-agent-modal-success")).not.toBeNull();

    btn.destroy();
  });

  it("keeps the dialog open with a manual-copy fallback when clipboard writes fail", async () => {
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const execCommand = vi.fn().mockReturnValue(false);
    (document as unknown as { execCommand: typeof execCommand }).execCommand = execCommand;

    const btn = new AgentCopyButton(
      buildThemeColors(),
      { getFeedbacks: () => [makeFeedback()], getContainer: () => root },
      t,
    );
    root.appendChild(btn.element);

    btn.element.click();
    await Promise.resolve();
    await raf();

    const copyBtn = Array.from(root.querySelectorAll("button")).find((b) => b.textContent === "Copy");
    copyBtn?.click();
    await Promise.resolve();
    await Promise.resolve();

    const hint = root.querySelector(".sp-agent-modal-hint");
    expect(hint?.textContent).toMatch(/manually|select/i);
    // The textarea (the manual-copy fallback itself) is still present and gets focus.
    const textarea = root.querySelector<HTMLTextAreaElement>(".sp-agent-modal-textarea");
    expect(textarea).not.toBeNull();
    expect(root.activeElement).toBe(textarea);

    delete (document as unknown as { execCommand?: unknown }).execCommand;
    btn.destroy();
  });

  it("disables the confirm action and reports an empty state when there's nothing to copy", async () => {
    const btn = new AgentCopyButton(buildThemeColors(), { getFeedbacks: () => [], getContainer: () => root }, t);
    root.appendChild(btn.element);

    btn.element.click();
    await Promise.resolve();
    await raf();

    const copyBtn = Array.from(root.querySelectorAll("button")).find((b) => b.textContent === "Copy");
    expect((copyBtn as HTMLButtonElement | undefined)?.disabled).toBe(true);

    btn.destroy();
  });
});
