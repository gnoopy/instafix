// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockMatchMedia } from "../helpers.js";

mockMatchMedia(false);

vi.mock(new URL("../../src/dom/anchor.js", import.meta.url).pathname, () => ({
  // The picker hit-tests a 1×1 rect at the click point; jsdom has no layout.
  findAnchorElement: vi.fn(() => document.getElementById("target") ?? document.body),
  findLargestAncestor: vi.fn((element: Element) => element),
  generateAnchor: vi.fn().mockReturnValue({
    cssSelector: "#target",
    xpath: "/html/body/button",
    textSnippet: "Save",
    elementTag: "BUTTON",
    elementId: "target",
    textPrefix: "",
    textSuffix: "",
    fingerprint: "0:0:0",
    neighborText: "",
  }),
  rectToPercentages: vi.fn().mockReturnValue({ xPct: 0, yPct: 0, wPct: 1, hPct: 1 }),
}));

vi.mock(new URL("../../src/dom/resolver.js", import.meta.url).pathname, () => ({
  resolveAnchor: vi.fn(() => {
    const element = document.getElementById("target");
    return element ? { element, confidence: 0.9, strategy: "id" } : null;
  }),
}));

const screenshot = vi.hoisted(() => ({ calls: [] as Array<{ rect: number[]; sessionLive: boolean }> }));
vi.mock(new URL("../../src/screenshot.js", import.meta.url).pathname, () => ({
  captureAnnotatedScreenshot: vi.fn(async (rect: DOMRect) => {
    screenshot.calls.push({
      rect: [rect.x, rect.y, rect.width, rect.height],
      sessionLive: document.querySelector("[data-instafix-ignore]") !== null,
    });
    return { dataUrl: "data:image/jpeg;base64,AA==", region: { xPct: 0.1, yPct: 0.2, wPct: 0.3, hPct: 0.4 } };
  }),
}));

import type { AnnotationPayload } from "@instafix/core";
import { type HeadlessCapture, locateAnnotations, startCapture } from "../../src/headless.js";

function addTarget(): HTMLButtonElement {
  const target = document.createElement("button");
  target.id = "target";
  target.textContent = "Save";
  target.getBoundingClientRect = () => new DOMRect(10, 20, 30, 40);
  document.body.append(target);
  return target;
}

function click(target: Element) {
  target.dispatchEvent(new MouseEvent("click", { clientX: 15, clientY: 25, bubbles: true, cancelable: true }));
}

describe("headless capture", () => {
  let stop: (() => void) | null = null;

  afterEach(() => {
    stop?.();
    stop = null;
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("hands the picked element to the host instead of opening the built-in popup", async () => {
    const target = addTarget();
    const onCapture = vi.fn<(capture: HeadlessCapture) => void>();
    stop = await startCapture({ mode: "element", screenshot: false, onCapture, onCancel: vi.fn() });

    click(target);

    await vi.waitFor(() => expect(onCapture).toHaveBeenCalledOnce());
    const capture = onCapture.mock.lastCall?.[0];
    expect(capture?.annotations).toHaveLength(1);
    expect(capture?.url).toBe(location.href);
    expect(capture?.screenshotState).toBe("off");
    expect(capture?.screenshotDataUrl).toBeNull();
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  it("captures the rectangle handed to the popup while the selection session is still live", async () => {
    screenshot.calls.length = 0;
    const target = addTarget();
    const onCapture = vi.fn<(capture: HeadlessCapture) => void>();
    const onSelect = vi.fn(() => expect(screenshot.calls).toHaveLength(0));
    stop = await startCapture({ mode: "element", screenshot: true, onSelect, onCapture, onCancel: vi.fn() });

    click(target);

    await vi.waitFor(() => expect(onCapture).toHaveBeenCalledOnce());
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screenshot.calls).toEqual([{ rect: [10, 20, 30, 40], sessionLive: true }]);
    const capture = onCapture.mock.lastCall?.[0];
    expect(capture?.screenshotState).toBe("captured");
    expect(capture?.screenshotRegion).toEqual({ xPct: 0.1, yPct: 0.2, wPct: 0.3, hPct: 0.4 });
  });

  it("captures the drawn rectangle in region mode", async () => {
    screenshot.calls.length = 0;
    addTarget();
    const onCapture = vi.fn<(capture: HeadlessCapture) => void>();
    stop = await startCapture({ mode: "region", screenshot: true, onCapture, onCancel: vi.fn() });
    const overlay = document.querySelector<HTMLElement>('div[data-instafix-ignore][tabindex="0"]');
    expect(overlay).not.toBeNull();

    overlay?.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, clientY: 100, bubbles: true }));
    overlay?.dispatchEvent(new MouseEvent("mousemove", { clientX: 300, clientY: 250, bubbles: true }));
    overlay?.dispatchEvent(new MouseEvent("mouseup", { clientX: 300, clientY: 250, bubbles: true }));

    await vi.waitFor(() => expect(onCapture).toHaveBeenCalledOnce());
    const [left = 0, top = 0, width = 0, height = 0] = screenshot.calls[0]?.rect ?? [];
    expect(left).toBeLessThanOrEqual(100);
    expect(top).toBeLessThanOrEqual(100);
    expect(left + width).toBeGreaterThanOrEqual(300);
    expect(top + height).toBeGreaterThanOrEqual(250);
    expect(screenshot.calls[0]?.sessionLive).toBe(true);
  });

  it("suppresses page pointerdown actions while picking, but not on widget chrome or after cancel", async () => {
    const target = addTarget();
    const chrome = document.createElement("div");
    chrome.dataset.instafixIgnore = "true";
    document.body.append(chrome);
    const cancel = await startCapture({ mode: "element", screenshot: false, onCapture: vi.fn(), onCancel: vi.fn() });

    const onPage = new Event("pointerdown", { bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(onPage);
    const onChrome = new Event("mousedown", { bubbles: true, cancelable: true, composed: true });
    chrome.dispatchEvent(onChrome);
    cancel();
    const afterCancel = new Event("pointerdown", { bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(afterCancel);

    expect(onPage.defaultPrevented).toBe(true);
    expect(onChrome.defaultPrevented).toBe(false);
    expect(afterCancel.defaultPrevented).toBe(false);
  });

  it("Escape cancels the selection and reports it once", async () => {
    const target = addTarget();
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    stop = await startCapture({ mode: "element", screenshot: false, onCapture, onCancel });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    click(target);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCapture).not.toHaveBeenCalled();
  });

  it("Escape ends the session even when host handlers stop the key first, and is consumed", async () => {
    addTarget();
    const stopper = (event: Event) => event.stopPropagation();
    const hostEscape = vi.fn();
    window.addEventListener("keydown", stopper, true);
    document.addEventListener("keydown", stopper, true);
    document.addEventListener("keydown", hostEscape);
    const onCancel = vi.fn();
    try {
      stop = await startCapture({ mode: "region", screenshot: false, onCapture: vi.fn(), onCancel });
      const key = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      document.body.dispatchEvent(key);

      expect(onCancel).toHaveBeenCalledOnce();
      expect(key.defaultPrevented).toBe(true);
      expect(hostEscape).not.toHaveBeenCalled();
      expect(document.querySelector('[data-instafix-ignore][role="application"]')).toBeNull();
      expect(document.body.style.overflow).toBe("");
    } finally {
      window.removeEventListener("keydown", stopper, true);
      document.removeEventListener("keydown", stopper, true);
      document.removeEventListener("keydown", hostEscape);
    }
  });

  it("Escape typed during IME composition still ends the session", async () => {
    addTarget();
    const onCancel = vi.fn();
    stop = await startCapture({ mode: "element", screenshot: false, onCapture: vi.fn(), onCancel });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Process", code: "Escape", bubbles: true }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(document.querySelector("[data-instafix-targeting-highlight]")).toBeNull();
  });

  it("ends an unselected session when the page loses the keyboard or is hidden", async () => {
    addTarget();
    const onBlur = vi.fn();
    stop = await startCapture({ mode: "region", screenshot: false, onCapture: vi.fn(), onCancel: onBlur });
    window.dispatchEvent(new Event("blur"));
    expect(onBlur).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-instafix-ignore][role="application"]')).toBeNull();

    const onHidden = vi.fn();
    stop = await startCapture({ mode: "element", screenshot: false, onCapture: vi.fn(), onCancel: onHidden });
    let visibility: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility });
    try {
      document.dispatchEvent(new Event("visibilitychange"));
      expect(onHidden).not.toHaveBeenCalled();
      visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    } finally {
      Reflect.deleteProperty(document, "visibilityState");
    }
    expect(onHidden).toHaveBeenCalledOnce();
    expect(document.querySelector("[data-instafix-targeting-highlight]")).toBeNull();
  });

  it("ends the session when the host removes its selection surface", async () => {
    addTarget();
    const onCancel = vi.fn();
    stop = await startCapture({ mode: "region", screenshot: false, onCapture: vi.fn(), onCancel });
    expect(document.body.style.overflow).toBe("hidden");

    document.querySelector('[data-instafix-ignore][role="application"]')?.remove();

    await vi.waitFor(() => expect(onCancel).toHaveBeenCalledOnce());
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps a picked host menu's document-level outside-press listeners from seeing the pick", async () => {
    const target = addTarget();
    const outsidePress = vi.fn();
    for (const type of ["pointerdown", "mousedown", "click"]) document.addEventListener(type, outsidePress, true);
    const onCapture = vi.fn();
    try {
      stop = await startCapture({ mode: "element", screenshot: false, onCapture, onCancel: vi.fn() });
      target.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, composed: true }));
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, composed: true }));
      click(target);

      await vi.waitFor(() => expect(onCapture).toHaveBeenCalledOnce());
      expect(outsidePress).not.toHaveBeenCalled();
    } finally {
      for (const type of ["pointerdown", "mousedown", "click"]) document.removeEventListener(type, outsidePress, true);
    }
  });

  it("lifts the selection surface into the top layer, then the widget host above it", async () => {
    const shown: Element[] = [];
    const proto = HTMLElement.prototype;
    const original = {
      show: Object.getOwnPropertyDescriptor(proto, "showPopover"),
      hide: Object.getOwnPropertyDescriptor(proto, "hidePopover"),
    };
    Object.defineProperty(proto, "showPopover", {
      configurable: true,
      value(this: HTMLElement) {
        shown.push(this);
      },
    });
    Object.defineProperty(proto, "hidePopover", { configurable: true, value() {} });
    const host = document.createElement("instafix-widget");
    document.body.append(host);
    try {
      stop = await startCapture({ mode: "region", screenshot: false, onCapture: vi.fn(), onCancel: vi.fn() });
      const overlay = document.querySelector('[data-instafix-ignore][role="application"]');
      expect(overlay?.getAttribute("popover")).toBe("manual");
      expect(shown).toEqual([overlay, host]);

      stop();
      stop = await startCapture({ mode: "element", screenshot: false, onCapture: vi.fn(), onCancel: vi.fn() });
      const highlight = document.querySelector("[data-instafix-targeting-highlight]");
      expect(highlight?.getAttribute("popover")).toBe("manual");
      expect(shown.slice(-2)).toEqual([highlight, host]);
    } finally {
      for (const [name, descriptor] of [
        ["showPopover", original.show],
        ["hidePopover", original.hide],
      ] as const) {
        if (descriptor) Object.defineProperty(proto, name, descriptor);
        else Reflect.deleteProperty(proto, name);
      }
    }
  });
});

describe("locateAnnotations", () => {
  it("returns matches and outlines visible ones briefly without touching them", () => {
    vi.useFakeTimers();
    const target = addTarget();
    const onClick = vi.fn();
    target.addEventListener("click", onClick);
    const annotation = { anchor: { cssSelector: "#target" } } as unknown as AnnotationPayload;

    const matches = locateAnnotations([annotation], { outlineMs: 1000 });

    expect(matches.map((match) => match.element)).toEqual([target]);
    expect(document.querySelectorAll("[data-instafix-locate]")).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(document.querySelectorAll("[data-instafix-locate]")).toHaveLength(0);
    expect(onClick).not.toHaveBeenCalled();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });
});
