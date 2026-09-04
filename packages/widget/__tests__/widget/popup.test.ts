// @vitest-environment jsdom

import type { AnnotationPayload } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createT, type TFunction, type Translations } from "../../src/i18n/index.js";
import { buildComposePrompt, Popup } from "../../src/popup.js";
import { buildThemeColors } from "../../src/styles/theme.js";

// jsdom does not implement window.matchMedia — provide a stub
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const colors = buildThemeColors();
const t = createT("fr");

function makeBounds(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    x: 100,
    y: 100,
    width: 200,
    height: 50,
    top: 100,
    right: 300,
    bottom: 150,
    left: 100,
    toJSON: () => {},
    ...overrides,
  } as DOMRect;
}

function makeAnnotationPayload(overrides: Partial<AnnotationPayload> = {}): AnnotationPayload {
  return {
    anchor: {
      cssSelector: "button.save-btn",
      xpath: "/html/body/button",
      textSnippet: "Save changes",
      elementTag: "BUTTON",
      textPrefix: "",
      textSuffix: "",
      fingerprint: "0:0:0",
      neighborText: "",
    },
    rect: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
    scrollX: 0,
    scrollY: 0,
    viewportW: 1024,
    viewportH: 768,
    devicePixelRatio: 1,
    target: { kind: "element" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Popup", () => {
  let popup: Popup;

  beforeEach(() => {
    popup = new Popup(colors, t);
  });

  afterEach(() => {
    popup.destroy();
  });

  // -------------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------------

  describe("construction", () => {
    it("creates a dialog element with role=dialog", () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      expect(dialog).not.toBeNull();
    });

    it("sets aria-modal=true on dialog", () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("sets correct aria-label on dialog", () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.getAttribute("aria-label")).toBe(t("popup.ariaLabel"));
    });

    it("creates four type selection buttons", () => {
      const buttons = document.querySelectorAll<HTMLButtonElement>("[data-type]");
      expect(buttons.length).toBe(4);
    });

    it("type buttons have aria-pressed=false initially", () => {
      const buttons = document.querySelectorAll<HTMLButtonElement>("[data-type]");
      for (const btn of buttons) {
        expect(btn.getAttribute("aria-pressed")).toBe("false");
      }
    });

    it("creates type buttons for all four feedback types", () => {
      const buttons = document.querySelectorAll<HTMLButtonElement>("[data-type]");
      const types = Array.from(buttons).map((btn) => btn.dataset.type);
      expect(types).toEqual(["question", "change", "bug", "other"]);
    });

    it("creates a textarea with correct placeholder", () => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea!.placeholder).toBe(t("popup.placeholder"));
    });

    it("creates a textarea with correct aria-label", () => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textarea.getAttribute("aria-label")).toBe(t("popup.textareaAria"));
    });

    it("is appended to document.body on construction", () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.parentElement).toBe(document.body);
    });

    it("has a submit button", () => {
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"));
      expect(submitBtn).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Show / Hide
  // -------------------------------------------------------------------------

  describe("show/hide", () => {
    it("shows the popup (display: block) after calling show()", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.style.display).toBe("block");
    });

    it("positions the popup relative to the given bounds", () => {
      popup.show(makeBounds({ bottom: 200, left: 150 }));

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.style.top).toBe("208px"); // bottom + 8
      expect(dialog.style.left).toBe("150px");
    });

    it("flips up when not enough vertical space below", () => {
      // Simulate small viewport: bottom of rect is near the window bottom
      // window.innerHeight defaults to 768 in jsdom
      popup.show(makeBounds({ top: 500, bottom: 600 }));

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      // Should flip up: top = rectTop - 220 - 8 = 500 - 228 = 272
      expect(dialog.style.top).toBe("272px");
    });

    it("clamps to viewport bottom when rect is too tall to fit popup above or below", () => {
      // Tall rect that spans most of the viewport (jsdom default 1024x768)
      // — neither below (rect.bottom + 8 + 220 > 768) nor above
      // (rect.top - 220 - 8 < 8) leaves room.
      popup.show(makeBounds({ top: 50, bottom: 750 }));

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      // top = innerHeight - popupH - 8 = 768 - 220 - 8 = 540
      expect(dialog.style.top).toBe("540px");
    });

    it("positions using the REAL rendered height, not the fallback estimate", () => {
      // A tall composer (target-size row + legend + identity fields) near
      // the bottom edge: with the old fixed 220px estimate the popup would
      // stay below and push its Send button under the fold. jsdom reports
      // offsetHeight 0, so stub the real measurement.
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      Object.defineProperty(dialog, "offsetHeight", { value: 480, configurable: true });
      Object.defineProperty(dialog, "offsetWidth", { value: 300, configurable: true });

      popup.show(makeBounds({ top: 500, bottom: 600 }));

      // Below: 608 + 480 > 760 → flip above: 500 - 480 - 8 = 12.
      expect(dialog.style.top).toBe("12px");
    });

    it("re-clamps when setLegend grows the popup after show()", () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      let height = 220;
      Object.defineProperty(dialog, "offsetHeight", { get: () => height, configurable: true });
      Object.defineProperty(dialog, "offsetWidth", { value: 300, configurable: true });

      void popup.show(makeBounds({ top: 450, bottom: 500 }));
      // 220px fits below: 508 + 220 <= 760.
      expect(dialog.style.top).toBe("508px");

      // The marquee legend lands right after show() and grows the popup.
      height = 480;
      popup.setLegend([{ number: 1, label: "a" }]);
      // Below (988) and above (450 - 488 = -38) both fail → clamp:
      // 768 - 480 - 8 = 280.
      expect(dialog.style.top).toBe("280px");
    });

    it("resolves to null when cancelled (via cancel button)", async () => {
      const promise = popup.show(makeBounds());

      // Find the cancel button (it has the cancel text)
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const cancelBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.cancel"));
      cancelBtn!.click();

      const result = await promise;
      expect(result).toBeNull();
    });

    it("resolves to null when Escape is pressed in textarea", async () => {
      const promise = popup.show(makeBounds());

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Compose-context copy ("copy prompt" from the composer) + auto-grow
  // -------------------------------------------------------------------------

  describe("compose prompt copy", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("buildComposePrompt renders the note, selectors and bounds as agent Markdown", () => {
      const md = buildComposePrompt([makeAnnotationPayload()], "bug", "The save button does nothing");
      expect(md).toContain("# UI change request");
      expect(md).toContain("> The save button does nothing");
      expect(md).toContain("button.save-btn");
      expect(md).toContain("Bounds:");
      expect(md).toContain("Page:");
    });

    it("the copy button is hidden after show() until the annotator provides a context", () => {
      popup.show(makeBounds());
      const btn = document.querySelector<HTMLButtonElement>(`[aria-label="${t("popup.copyContext")}"]`)!;
      expect(btn.style.display).toBe("none");

      popup.setPromptContext(() => [makeAnnotationPayload()]);
      expect(btn.style.display).toBe("inline-flex");
    });

    it("clicking it copies the current context + note and flashes the copied state", async () => {
      Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

      popup.show(makeBounds());
      popup.setPromptContext(() => [makeAnnotationPayload()]);

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "half-typed note";

      const btn = document.querySelector<HTMLButtonElement>(`[aria-label="${t("popup.copyContext")}"]`)!;
      btn.click();
      await vi.waitFor(() => {
        expect(writeText).toHaveBeenCalledOnce();
      });

      const copied = writeText.mock.calls[0]![0] as string;
      expect(copied).toContain("half-typed note");
      expect(copied).toContain("button.save-btn");
      // The ✓ label lands after the clipboard promise resolves.
      await vi.waitFor(() => {
        expect(btn.textContent).toContain(t("popup.copyContextCopied"));
      });
    });

    it("auto-grows the textarea on input (100px floor in jsdom's zero-scrollHeight world)", () => {
      popup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "line1\nline2\nline3";
      textarea.dispatchEvent(new Event("input"));
      expect(textarea.style.height).toBe("100px");
    });
  });

  // -------------------------------------------------------------------------
  // Clear / undo / redo (composer corner buttons)
  // -------------------------------------------------------------------------

  describe("clear/undo/redo", () => {
    function getBtn(label: string): HTMLButtonElement {
      return document.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
    }

    it("undo/redo start disabled, clear starts enabled-but-inert with no text", () => {
      popup.show(makeBounds());
      expect(getBtn(t("popup.undoClear")).disabled).toBe(true);
      expect(getBtn(t("popup.redoClear")).disabled).toBe(true);
    });

    it("keeps a disabled action fully visible — only its icon tone dims", () => {
      // Regression: undo/redo used to drop to opacity 0.35 with a
      // border-colored (near-white) icon when disabled, which on a light
      // theme left the composer looking like a lone X with dead space.
      popup.show(makeBounds());
      const clear = getBtn(t("popup.clearMessage"));
      const undo = getBtn(t("popup.undoClear"));
      expect(undo.disabled).toBe(true);

      // The circular chrome is identical whether or not the action is live.
      expect(undo.style.opacity).toBe("");
      expect(undo.style.background).toBe(clear.style.background);
      expect(undo.style.borderColor || undo.style.border).toBe(clear.style.borderColor || clear.style.border);
      // Translucent (jsdom normalizes #rrggbbaa to rgba()), and toned by the
      // layer color rather than a flat neutral.
      expect(clear.style.background).toMatch(/^rgba\(0, 102, 255, 0?\.\d+\)$/);
      // Availability is the icon tone alone, and the two tones differ.
      expect(undo.style.color).not.toBe(clear.style.color);
    });

    it("clear empties the textarea and enables undo", () => {
      popup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "hello world";
      textarea.dispatchEvent(new Event("input"));

      getBtn(t("popup.clearMessage")).click();

      expect(textarea.value).toBe("");
      expect(getBtn(t("popup.undoClear")).disabled).toBe(false);
      expect(getBtn(t("popup.redoClear")).disabled).toBe(true);
    });

    it("undo restores the cleared text and flips to redo-enabled", () => {
      popup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "hello world";
      textarea.dispatchEvent(new Event("input"));
      getBtn(t("popup.clearMessage")).click();

      getBtn(t("popup.undoClear")).click();

      expect(textarea.value).toBe("hello world");
      expect(getBtn(t("popup.undoClear")).disabled).toBe(true);
      expect(getBtn(t("popup.redoClear")).disabled).toBe(false);
    });

    it("redo re-empties the textarea after an undo", () => {
      popup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "hello world";
      textarea.dispatchEvent(new Event("input"));
      getBtn(t("popup.clearMessage")).click();
      getBtn(t("popup.undoClear")).click();

      getBtn(t("popup.redoClear")).click();

      expect(textarea.value).toBe("");
      expect(getBtn(t("popup.undoClear")).disabled).toBe(false);
      expect(getBtn(t("popup.redoClear")).disabled).toBe(true);
    });

    it("clearing an already-empty textarea is a no-op (does not arm undo)", () => {
      popup.show(makeBounds());
      getBtn(t("popup.clearMessage")).click();
      expect(getBtn(t("popup.undoClear")).disabled).toBe(true);
    });

    it("re-showing the popup resets clear/undo/redo state", () => {
      popup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "hello world";
      textarea.dispatchEvent(new Event("input"));
      getBtn(t("popup.clearMessage")).click();
      expect(getBtn(t("popup.undoClear")).disabled).toBe(false);

      popup.show(makeBounds());

      expect(getBtn(t("popup.undoClear")).disabled).toBe(true);
      expect(getBtn(t("popup.redoClear")).disabled).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Type selection
  // -------------------------------------------------------------------------

  describe("type selection", () => {
    it("sets aria-pressed=true on selected type button", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      expect(bugBtn.getAttribute("aria-pressed")).toBe("true");
    });

    it("only one type button is active at a time", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const questionBtn = document.querySelector<HTMLButtonElement>('[data-type="question"]')!;
      questionBtn.click();

      expect(bugBtn.getAttribute("aria-pressed")).toBe("false");
      expect(questionBtn.getAttribute("aria-pressed")).toBe("true");
    });

    it("all other type buttons become inactive when one is selected", () => {
      popup.show(makeBounds());

      const changeBtn = document.querySelector<HTMLButtonElement>('[data-type="change"]')!;
      changeBtn.click();

      const allButtons = document.querySelectorAll<HTMLButtonElement>("[data-type]");
      for (const btn of allButtons) {
        if (btn.dataset.type === "change") {
          expect(btn.getAttribute("aria-pressed")).toBe("true");
        } else {
          expect(btn.getAttribute("aria-pressed")).toBe("false");
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Submit validation
  // -------------------------------------------------------------------------

  describe("submit", () => {
    it("enables submit button when type and message are provided", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "This is a bug";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"))!;
      expect(submitBtn.style.opacity).toBe("1");
      expect(submitBtn.style.pointerEvents).toBe("auto");
    });

    it("does not enable submit with only type selected (no message)", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"))!;
      expect(submitBtn.style.pointerEvents).toBe("none");
    });

    it("pre-selects 버그 so a message alone enables submit (zero extra clicks on the common path)", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      expect(bugBtn.getAttribute("aria-pressed")).toBe("true");

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "Some message";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"))!;
      expect(submitBtn.style.pointerEvents).toBe("auto");
    });

    it("resolves with type and message on submit", async () => {
      const promise = popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "Found a bug";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"))!;
      submitBtn.click();

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "Found a bug" });
    });

    it("trims message whitespace on submit", async () => {
      const promise = popup.show(makeBounds());

      const questionBtn = document.querySelector<HTMLButtonElement>('[data-type="question"]')!;
      questionBtn.click();

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "  How does this work?  ";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const submitBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.submit"))!;
      submitBtn.click();

      const result = await promise;
      expect(result!.message).toBe("How does this work?");
    });

    it("supports Ctrl+Enter keyboard shortcut to submit", async () => {
      const promise = popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "A bug";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "A bug" });
    });

    it("does not submit via Ctrl+Enter when form is incomplete", () => {
      popup.show(makeBounds());

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "A message without type";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      // This should not throw or resolve — the popup stays open
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));

      // Popup should still be visible
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.style.display).toBe("block");
    });
  });

  // -------------------------------------------------------------------------
  // Focus trap
  // -------------------------------------------------------------------------

  describe("focus trap", () => {
    it("installs keydown listener for Tab trapping when shown", () => {
      const spy = vi.spyOn(HTMLElement.prototype, "addEventListener");

      popup.show(makeBounds());

      const keydownCalls = spy.mock.calls.filter((call) => call[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);

      spy.mockRestore();
    });

    it("Tab wraps from last focusable to first focusable element", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      expect(focusableEls.length).toBeGreaterThan(0);

      const lastEl = focusableEls[focusableEls.length - 1]!;
      lastEl.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("Shift+Tab wraps from first focusable to last focusable element", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        ),
      );

      const firstEl = focusableEls[0]!;
      firstEl.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Reset state on re-show
  // -------------------------------------------------------------------------

  describe("reset on re-show", () => {
    it("clears textarea on each show()", async () => {
      const promise1 = popup.show(makeBounds());

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "Some text";

      // Cancel to complete the first show promise
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      const cancelBtn = Array.from(buttons).find((btn) => btn.textContent === t("popup.cancel"))!;
      cancelBtn.click();
      await promise1;

      // Re-show
      popup.show(makeBounds());

      const textarea2 = document.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textarea2.value).toBe("");
    });

    it("resets type selection back to the 버그 default on each show()", async () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const promise1 = popup.show(makeBounds());

      const questionBtn = dialog.querySelector<HTMLButtonElement>('[data-type="question"]')!;
      questionBtn.click();
      expect(questionBtn.getAttribute("aria-pressed")).toBe("true");

      // Cancel
      const cancelBtn = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
        (btn) => btn.textContent === t("popup.cancel"),
      )!;
      cancelBtn.click();
      await promise1;

      // Re-show — the previous session's pick must not stick; the fresh
      // session starts at the 버그 default again.
      popup.show(makeBounds());

      const allTypeButtons = dialog.querySelectorAll<HTMLButtonElement>("[data-type]");
      for (const btn of allTypeButtons) {
        expect(btn.getAttribute("aria-pressed")).toBe(btn.dataset.type === "bug" ? "true" : "false");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Destroy
  // -------------------------------------------------------------------------

  describe("destroy", () => {
    it("removes popup DOM element from document.body", () => {
      popup.destroy();

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      expect(dialog).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // refreshLabels — re-localizes the popup after the locale dictionary lands
  // -------------------------------------------------------------------------

  describe("refreshLabels", () => {
    // Tests use a mutable mock `t` (rather than the real i18n loader) so the
    // LOCALES module state of other test files can't bleed into these
    // assertions. `refreshLabels()` is a pure DOM re-binding pass over
    // `this.t`, so the only contract worth testing is "calls t at refresh
    // time and writes the result into the DOM".
    function makeMutableT(prefix: { value: string }): TFunction {
      return ((key: keyof Translations): string => `${prefix.value}:${key}`) as TFunction;
    }

    it("re-reads `t` at refresh time for dialog, type buttons, textarea, hint, and CTAs", () => {
      const prefix = { value: "INIT" };
      const mutableT = makeMutableT(prefix);

      popup.destroy();
      popup = new Popup(colors, mutableT);

      // Initial state — labels reflect the first prefix.
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.getAttribute("aria-label")).toBe("INIT:popup.ariaLabel");

      // Swap the closure's return value, then refresh — DOM should track it.
      prefix.value = "SWAPPED";
      popup.refreshLabels();

      expect(dialog.getAttribute("aria-label")).toBe("SWAPPED:popup.ariaLabel");

      const questionBtn = document.querySelector<HTMLButtonElement>('[data-type="question"]')!;
      const changeBtn = document.querySelector<HTMLButtonElement>('[data-type="change"]')!;
      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      const otherBtn = document.querySelector<HTMLButtonElement>('[data-type="other"]')!;
      expect(questionBtn.querySelector("span")?.textContent).toBe("SWAPPED:type.question");
      expect(changeBtn.querySelector("span")?.textContent).toBe("SWAPPED:type.change");
      expect(bugBtn.querySelector("span")?.textContent).toBe("SWAPPED:type.bug");
      expect(otherBtn.querySelector("span")?.textContent).toBe("SWAPPED:type.other");

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textarea.placeholder).toBe("SWAPPED:popup.placeholder");
      expect(textarea.getAttribute("aria-label")).toBe("SWAPPED:popup.textareaAria");

      // Cancel + submit buttons — find by their data attributes, not text
      const allButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
      const submitBtn = allButtons.find((b) => b.textContent === "SWAPPED:popup.submit");
      const cancelBtn = allButtons.find((b) => b.textContent === "SWAPPED:popup.cancel");
      expect(submitBtn).toBeDefined();
      expect(cancelBtn).toBeDefined();
    });

    it("is idempotent — calling twice with the same `t` is a no-op on values", () => {
      popup.destroy();
      popup = new Popup(colors, createT("en"));

      popup.refreshLabels();
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const first = dialog.getAttribute("aria-label");
      popup.refreshLabels();
      const second = dialog.getAttribute("aria-label");

      expect(second).toBe(first);
    });
  });

  // -------------------------------------------------------------------------
  // Type button hover effects
  // -------------------------------------------------------------------------

  describe("type button hover effects", () => {
    it("mouseenter on type button changes background", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      // Background should change from default glassBg to a type-specific bg color
      expect(bugBtn.style.background).not.toBe(colors.glassBg);
    });

    it("mouseleave on an unselected type button restores background", () => {
      popup.show(makeBounds());

      // bug is the pre-selected default (hover is a no-op on the selected
      // chip) — exercise hover/leave on an unselected one instead.
      const questionBtn = document.querySelector<HTMLButtonElement>('[data-type="question"]')!;
      questionBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const hoverBg = questionBtn.style.background;

      questionBtn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      // After mouseleave, background should differ from hover state
      expect(questionBtn.style.background).not.toBe(hoverBg);
    });
  });

  // -------------------------------------------------------------------------
  // Textarea focus/blur styles
  // -------------------------------------------------------------------------

  describe("textarea focus/blur styles", () => {
    it("focus on textarea changes border color to accent", () => {
      popup.show(makeBounds());

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      const borderBefore = textarea.style.borderColor;

      textarea.dispatchEvent(new Event("focus", { bubbles: true }));

      // Border color should change on focus
      expect(textarea.style.borderColor).not.toBe(borderBefore);
    });

    it("blur on textarea restores border color", () => {
      popup.show(makeBounds());

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.dispatchEvent(new Event("focus", { bubbles: true }));
      const focusBorder = textarea.style.borderColor;

      textarea.dispatchEvent(new Event("blur", { bubbles: true }));

      // Border color should revert from the focus state
      expect(textarea.style.borderColor).not.toBe(focusBorder);
    });
  });

  // -------------------------------------------------------------------------
  // Popup position collision — horizontal flip
  // -------------------------------------------------------------------------

  describe("horizontal collision", () => {
    it("popup flips left when not enough horizontal space (left + 300 > innerWidth)", () => {
      // innerWidth defaults to 1024 in jsdom — place rect near right edge
      popup.show(makeBounds({ left: 900, right: 950, bottom: 100, top: 50 }));

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      // Should flip: left = right - 300 = 950 - 300 = 650
      expect(Number.parseInt(dialog.style.left, 10)).toBeLessThan(900);
    });
  });

  // -------------------------------------------------------------------------
  // Reduced motion / focus trap edge cases
  // -------------------------------------------------------------------------

  describe("reduced motion + focus trap edge cases", () => {
    it("disables transitions when prefers-reduced-motion is reduce", () => {
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog.style.transition).toBe("none");
    });

    it("keeps the popup visible when Tab is pressed but no focusable elements exist", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      // Remove every focusable child so the trap returns early
      for (const focusable of dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
      )) {
        focusable.remove();
      }

      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("Tab from outside the popup focuses the first focusable element", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      // Move focus to the body so document.activeElement is not contained
      document.body.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("Shift+Tab from outside the popup focuses the last focusable element", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      document.body.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it("Shift+Tab from a middle element does not preventDefault", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      // Focus a middle element (not the first, not outside the popup)
      const middle = focusableEls[Math.floor(focusableEls.length / 2)]!;
      middle.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });

    it("Tab forward from a middle element does not preventDefault", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      const middle = focusableEls[Math.floor(focusableEls.length / 2)]!;
      middle.focus();

      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      const preventSpy = vi.spyOn(event, "preventDefault");
      dialog.dispatchEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Hover on already-selected type button (no-op branch)
  // -------------------------------------------------------------------------

  describe("type button hover with missing data-type attribute", () => {
    it("mouseenter falls back to empty type when data-type is removed", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      delete bugBtn.dataset.type;

      // Should not throw; uses the empty-string fallback for getTypeBgColor/getTypeColor
      bugBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    });

    it("selectType handles a button whose data-type was removed", () => {
      popup.show(makeBounds());

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const buttons = dialog.querySelectorAll<HTMLButtonElement>("[data-type]");
      // Strip data-type from one of the existing buttons before selectType iterates
      const target = buttons[0]!;
      delete target.dataset.type;

      // Click another button to trigger selectType which loops over all buttons
      buttons[2]!.click();

      // Should not throw — branch fallback `?? ""` is exercised
      expect(buttons[2]!.getAttribute("aria-pressed")).toBe("true");
    });
  });

  describe("hover on selected type button", () => {
    it("does not change background on mouseenter when the button is already selected", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click(); // make it selected
      const selectedBg = bugBtn.style.background;

      bugBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      expect(bugBtn.style.background).toBe(selectedBg);
    });

    it("does not restore background on mouseleave when the button is already selected", () => {
      popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();
      const selectedBg = bugBtn.style.background;

      bugBtn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      expect(bugBtn.style.background).toBe(selectedBg);
    });
  });

  // -------------------------------------------------------------------------
  // Cancel button hover effects
  // -------------------------------------------------------------------------

  describe("cancel button hover effects", () => {
    function getCancelButton(): HTMLButtonElement {
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      return Array.from(buttons).find((btn) => btn.textContent === t("popup.cancel"))!;
    }

    it("mouseenter on cancel button changes border and text color to accent", () => {
      popup.show(makeBounds());

      const cancelBtn = getCancelButton();
      const beforeBorder = cancelBtn.style.borderColor;
      const beforeColor = cancelBtn.style.color;

      cancelBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      expect(cancelBtn.style.borderColor).not.toBe(beforeBorder);
      expect(cancelBtn.style.color).not.toBe(beforeColor);
    });

    it("mouseleave on cancel button restores border and text color", () => {
      popup.show(makeBounds());

      const cancelBtn = getCancelButton();
      cancelBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const hoverBorder = cancelBtn.style.borderColor;
      const hoverColor = cancelBtn.style.color;

      cancelBtn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      expect(cancelBtn.style.borderColor).not.toBe(hoverBorder);
      expect(cancelBtn.style.color).not.toBe(hoverColor);
    });
  });

  // -------------------------------------------------------------------------
  // Mac shortcut hint via navigator.userAgentData
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Meta+Enter (Mac shortcut) submits the form
  // -------------------------------------------------------------------------

  describe("Meta+Enter shortcut", () => {
    it("Meta+Enter (Mac shortcut) submits the form", async () => {
      const promise = popup.show(makeBounds());

      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();

      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "Mac shortcut test";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "Mac shortcut test" });
    });
  });

  // -------------------------------------------------------------------------
  // Destroy without prior show should not throw
  // -------------------------------------------------------------------------

  describe("destroy without show", () => {
    it("destroy works even when no keydown trap is installed", () => {
      // Construct, destroy without ever calling show — exercises the
      // hideElement path elsewhere too. Specifically we assert that
      // the locally-constructed popup is removed without throwing.
      const localPopup = new Popup(colors, t);
      const dialogsBefore = document.querySelectorAll<HTMLElement>('[role="dialog"]').length;
      localPopup.destroy();
      const dialogsAfter = document.querySelectorAll<HTMLElement>('[role="dialog"]').length;

      expect(dialogsAfter).toBe(dialogsBefore - 1);
    });
  });

  // -------------------------------------------------------------------------
  // Submitting state (onSubmit callback — spinner, disabled controls, retry)
  // -------------------------------------------------------------------------

  describe("submitting state", () => {
    function fillForm(): void {
      const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
      bugBtn.click();
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "Found a bug";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function getSubmitButton(): HTMLButtonElement {
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      // The submit button is the only one with `aria-busy` once submitting OR
      // contains the submit label otherwise. Match by initial label.
      return Array.from(buttons).find((btn) => btn.querySelector("span")?.textContent === t("popup.submit"))!;
    }

    function getCancelButton(): HTMLButtonElement {
      const buttons = document.querySelectorAll<HTMLButtonElement>("button");
      return Array.from(buttons).find((btn) => btn.textContent === t("popup.cancel"))!;
    }

    it("invokes the onSubmit callback with the form result when submit is clicked", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      popup.show(makeBounds(), onSubmit);
      fillForm();

      getSubmitButton().click();

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce();
      });
      expect(onSubmit).toHaveBeenCalledWith({ type: "bug", message: "Found a bug" });
    });

    it("swaps the submit label for a spinner while onSubmit is pending", async () => {
      let resolveSubmit!: () => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
      );

      popup.show(makeBounds(), onSubmit);
      fillForm();

      const submitBtn = getSubmitButton();
      submitBtn.click();

      await vi.waitFor(() => {
        expect(submitBtn.getAttribute("aria-busy")).toBe("true");
        expect(submitBtn.querySelector('[data-role="sp-popup-spinner"]')).not.toBeNull();
      });

      resolveSubmit();
    });

    it("disables submit, cancel, textarea, and type buttons while onSubmit is pending", async () => {
      let resolveSubmit!: () => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
      );

      popup.show(makeBounds(), onSubmit);
      fillForm();

      const submitBtn = getSubmitButton();
      const cancelBtn = getCancelButton();
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      const typeButtons = document.querySelectorAll<HTMLButtonElement>("[data-type]");

      submitBtn.click();

      await vi.waitFor(() => {
        expect(submitBtn.disabled).toBe(true);
        expect(cancelBtn.disabled).toBe(true);
        expect(textarea.disabled).toBe(true);
        for (const btn of typeButtons) expect(btn.disabled).toBe(true);
      });

      resolveSubmit();
    });

    it("closes the popup and resolves with the result on successful onSubmit", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      const promise = popup.show(makeBounds(), onSubmit);
      fillForm();

      getSubmitButton().click();

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "Found a bug" });
    });

    it("restores the form for retry when onSubmit rejects", async () => {
      const onSubmit = vi.fn().mockRejectedValueOnce(new Error("network down"));

      popup.show(makeBounds(), onSubmit);
      fillForm();

      const submitBtn = getSubmitButton();
      const cancelBtn = getCancelButton();
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;

      submitBtn.click();

      // Wait for the rejection to propagate
      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
      // One extra tick for the .catch() handler
      await Promise.resolve();
      await Promise.resolve();

      // Submitting state is gone: buttons re-enabled, spinner removed, form
      // contents preserved so the user can retry with one click.
      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.getAttribute("aria-busy")).toBeNull();
      expect(submitBtn.querySelector('[data-role="sp-popup-spinner"]')).toBeNull();
      expect(cancelBtn.disabled).toBe(false);
      expect(textarea.disabled).toBe(false);
      expect(textarea.value).toBe("Found a bug");
    });

    it("re-runs onSubmit on retry after rejection", async () => {
      const onSubmit = vi.fn().mockRejectedValueOnce(new Error("network down")).mockResolvedValueOnce(undefined);

      const promise = popup.show(makeBounds(), onSubmit);
      fillForm();

      const submitBtn = getSubmitButton();

      // First click — rejects
      submitBtn.click();
      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      // Allow the .catch() handler to restore the form
      await Promise.resolve();
      await Promise.resolve();

      // Second click — resolves
      submitBtn.click();

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "Found a bug" });
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    it("ignores Escape, cancel click, and Ctrl+Enter while onSubmit is pending", async () => {
      let resolveSubmit!: () => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
      );

      const promise = popup.show(makeBounds(), onSubmit);
      let settled = false;
      void promise.then(() => {
        settled = true;
      });

      fillForm();
      getSubmitButton().click();

      // Wait for submitting state to engage
      await vi.waitFor(() => {
        expect(getSubmitButton().getAttribute("aria-busy")).toBe("true");
      });

      // Try every dismissal channel
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));
      getCancelButton().click();

      // None of these should have settled the show() promise
      await Promise.resolve();
      await Promise.resolve();
      expect(settled).toBe(false);

      // Releasing the submit promise should let everything close normally
      resolveSubmit();
      await promise;
    });

    it("falls back to legacy fire-and-forget behaviour when no onSubmit is provided", async () => {
      // Without onSubmit the show() promise resolves immediately on submit
      // and the popup hides — same as the original synchronous API.
      const promise = popup.show(makeBounds());
      fillForm();

      getSubmitButton().click();

      const result = await promise;
      expect(result).toEqual({ type: "bug", message: "Found a bug" });
    });

    it("destroy() while a submission is pending settles the show() promise and tears down", async () => {
      // onSubmit never resolves — the popup is stuck in the submitting state.
      const onSubmit = vi.fn().mockReturnValue(new Promise<void>(() => {}));

      const promise = popup.show(makeBounds(), onSubmit);
      fillForm();

      const submitBtn = getSubmitButton();
      submitBtn.click();

      // Confirm the popup actually entered the submitting state.
      await vi.waitFor(() => {
        expect(submitBtn.getAttribute("aria-busy")).toBe("true");
      });

      // destroy() must settle the pending show() promise (no hang) — it
      // resolves null, matching a cancellation — and remove the popup.
      popup.destroy();

      const result = await promise;
      expect(result).toBeNull();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    describe("isOpen (drawing-guard contract)", () => {
      it("is false at rest, true between show() and cancel", async () => {
        expect(popup.isOpen).toBe(false);
        const promise = popup.show(makeBounds());
        expect(popup.isOpen).toBe(true);
        getCancelButton().click();
        await promise;
        expect(popup.isOpen).toBe(false);
      });

      it("stays true while onSubmit is pending and after its rejection (retry window)", async () => {
        let rejectSubmit!: (e: Error) => void;
        const onSubmit = vi.fn().mockReturnValue(
          new Promise<void>((_resolve, reject) => {
            rejectSubmit = reject;
          }),
        );

        const promise = popup.show(makeBounds(), onSubmit);
        fillForm();
        getSubmitButton().click();
        await vi.waitFor(() => {
          expect(getSubmitButton().getAttribute("aria-busy")).toBe("true");
        });

        // The annotator's drawing guards read isOpen during exactly this
        // window — it must hold while the submission is in flight…
        expect(popup.isOpen).toBe(true);

        rejectSubmit(new Error("network down"));
        await Promise.resolve();
        await Promise.resolve();

        // …and through the retry window after a failed submit.
        expect(popup.isOpen).toBe(true);

        getCancelButton().click();
        expect(await promise).toBeNull();
        expect(popup.isOpen).toBe(false);
      });

      it("is false after a successful submit settles show()", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const promise = popup.show(makeBounds(), onSubmit);
        fillForm();
        getSubmitButton().click();
        await promise;
        expect(popup.isOpen).toBe(false);
      });

      it("is false after destroy()", () => {
        void popup.show(makeBounds());
        expect(popup.isOpen).toBe(true);
        popup.destroy();
        expect(popup.isOpen).toBe(false);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Platform detection (Mac vs other) for the keyboard hint
// ---------------------------------------------------------------------------

describe("Popup platform detection", () => {
  let originalUaData: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalUaData = Object.getOwnPropertyDescriptor(navigator, "userAgentData");
  });

  afterEach(() => {
    if (originalUaData) {
      Object.defineProperty(navigator, "userAgentData", originalUaData);
    } else {
      Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "userAgentData");
    }
  });

  it("uses macOS hint when navigator.userAgentData reports macOS", () => {
    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      value: { platform: "macOS" },
    });

    const localPopup = new Popup(colors, t);
    const hint = document.body.lastElementChild?.querySelectorAll("div") ?? [];
    const hintText = Array.from(hint)
      .map((el) => el.textContent ?? "")
      .join("\n");
    expect(hintText).toContain(t("popup.submitHintMac"));

    localPopup.destroy();
  });

  it("uses non-macOS hint when navigator.userAgentData reports Windows", () => {
    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      value: { platform: "Windows" },
    });

    const localPopup = new Popup(colors, t);
    const hint = document.body.lastElementChild?.querySelectorAll("div") ?? [];
    const hintText = Array.from(hint)
      .map((el) => el.textContent ?? "")
      .join("\n");
    expect(hintText).toContain(t("popup.submitHintOther"));

    localPopup.destroy();
  });

  it("falls back to userAgent regex when both userAgentData and platform are missing", () => {
    // Remove both userAgentData and platform so the chain falls all the way
    // through to the regex test against navigator.userAgent
    Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "userAgentData");
    const originalPlatform = Object.getOwnPropertyDescriptor(navigator, "platform");
    const originalUserAgent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
    Object.defineProperty(navigator, "platform", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    });

    try {
      const localPopup = new Popup(colors, t);
      const hint = document.body.lastElementChild?.querySelectorAll("div") ?? [];
      const hintText = Array.from(hint)
        .map((el) => el.textContent ?? "")
        .join("\n");
      expect(hintText).toContain(t("popup.submitHintMac"));
      localPopup.destroy();
    } finally {
      if (originalPlatform) Object.defineProperty(navigator, "platform", originalPlatform);
      if (originalUserAgent) Object.defineProperty(navigator, "userAgent", originalUserAgent);
    }
  });
});

// ---------------------------------------------------------------------------
// Draft recovery (G7)
// ---------------------------------------------------------------------------

describe("Popup draft recovery", () => {
  const DRAFT_KEY = "instafix_draft_v1";

  afterEach(() => {
    sessionStorage.removeItem(DRAFT_KEY);
  });

  it("restores a matching draft into the composer and shows the banner", () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ type: "bug", message: "recovered note", url: window.location.pathname, savedAt: Date.now() }),
    );

    const localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(textarea.value).toBe("recovered note");
    const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
    expect(bugBtn.getAttribute("aria-pressed")).toBe("true");

    localPopup.destroy();
  });

  it("does not restore a stale or foreign-page draft", () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ type: "bug", message: "old page note", url: "/some-other-page", savedAt: Date.now() }),
    );

    const localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(textarea.value).toBe("");

    localPopup.destroy();
  });

  it("persists what's typed and offers it back after a simulated reload (new Popup instance)", () => {
    vi.useFakeTimers();
    try {
      const first = new Popup(colors, t);
      first.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "typed before the crash";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      vi.advanceTimersByTime(600); // clears the debounce
      first.destroy(); // simulates the popup/page going away — draft must survive

      const second = new Popup(colors, t);
      second.show(makeBounds());
      const restoredTextarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(restoredTextarea.value).toBe("typed before the crash");
      second.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("discarding the draft clears both the textarea and storage", () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ type: "bug", message: "recovered note", url: window.location.pathname, savedAt: Date.now() }),
    );
    const localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    const discardBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) => btn.textContent === t("popup.discardDraft"),
    )!;
    discardBtn.click();

    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(textarea.value).toBe("");
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();

    localPopup.destroy();
  });

  it("clears the draft once a submission genuinely succeeds", async () => {
    vi.useFakeTimers();
    try {
      const localPopup = new Popup(colors, t);
      const promise = localPopup.show(makeBounds(), () => Promise.resolve());

      document.querySelector<HTMLButtonElement>('[data-type="bug"]')!.click();
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "message";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      vi.advanceTimersByTime(600);
      expect(sessionStorage.getItem(DRAFT_KEY)).not.toBeNull();

      const submitBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
        (btn) => btn.textContent === t("popup.submit"),
      )!;
      submitBtn.click();
      await promise;

      expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
      localPopup.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the draft when a submission fails (so the note isn't lost)", async () => {
    vi.useFakeTimers();
    try {
      const localPopup = new Popup(colors, t);
      localPopup.show(makeBounds(), () => Promise.reject(new Error("network down")));

      document.querySelector<HTMLButtonElement>('[data-type="bug"]')!.click();
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "message";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      vi.advanceTimersByTime(600);

      const submitBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
        (btn) => btn.textContent === t("popup.submit"),
      )!;
      submitBtn.click();
      await vi.waitFor(() => {
        expect(sessionStorage.getItem(DRAFT_KEY)).not.toBeNull();
      });

      localPopup.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears the draft on explicit cancel", () => {
    vi.useFakeTimers();
    try {
      const localPopup = new Popup(colors, t);
      localPopup.show(makeBounds());
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
      textarea.value = "abandoned note";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      vi.advanceTimersByTime(600);
      expect(sessionStorage.getItem(DRAFT_KEY)).not.toBeNull();

      const cancelBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
        (btn) => btn.textContent === t("popup.cancel"),
      )!;
      cancelBtn.click();

      expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
      localPopup.destroy();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Voice input (G5)
// ---------------------------------------------------------------------------

describe("Popup voice input", () => {
  class MockRecognition {
    lang = "";
    continuous = false;
    interimResults = false;
    onresult: ((e: unknown) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    onend: (() => void) | null = null;
    onstart: (() => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
  }

  let instances: MockRecognition[];
  let originalSpeechRecognition: unknown;
  let localPopup: Popup;

  beforeEach(() => {
    instances = [];
    originalSpeechRecognition = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = function (this: unknown) {
      const inst = new MockRecognition();
      instances.push(inst);
      return inst;
    };
    localPopup = new Popup(colors, t);
  });

  afterEach(() => {
    // Runs even when the test's own assertions threw — a mid-test failure
    // must never leave a stale popup (and its DOM nodes) for the NEXT
    // test's querySelector calls to accidentally pick up.
    localPopup.destroy();
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = originalSpeechRecognition;
  });

  function makeResult(transcript: string, isFinal: boolean) {
    return { isFinal, length: 1, 0: { transcript } };
  }

  it("renders a mic button when the browser supports the Web Speech API", () => {
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]');
    expect(micBtn).not.toBeNull();
  });

  it("does not render a mic button when unsupported", () => {
    localPopup.destroy();
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = undefined;
    localPopup = new Popup(colors, t);
    expect(document.querySelector('[data-role="sp-mic-btn"]')).toBeNull();
  });

  it("shows the privacy consent caption before any use (idle state)", () => {
    const status = document.querySelector('[data-role="sp-voice-status"]');
    expect(status?.textContent).toBe(t("voice.consent"));
  });

  it("does not request microphone access until the mic button is explicitly clicked", () => {
    expect(instances).toHaveLength(0);
  });

  it("clicking the mic requests access and transitions to listening once the engine confirms", () => {
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    const status = document.querySelector('[data-role="sp-voice-status"]')!;

    micBtn.click();
    expect(instances).toHaveLength(1);
    expect(status.textContent).toBe(t("voice.state.requestingPermission"));

    instances[0]?.onstart?.();
    expect(status.textContent).toBe(t("voice.state.listening"));
    expect(micBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("merges a final transcript into the textarea without touching prior text", () => {
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "Existing note.";

    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("also this", true)] });

    expect(textarea.value).toBe("Existing note. also this");
  });

  it("shows interim text live, then replaces it (not appends) on the next update", () => {
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("hello wor", false)] });
    expect(textarea.value).toBe("hello wor");

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("hello world", false)] });
    expect(textarea.value).toBe("hello world");
  });

  it("does not let a late transcript overwrite text the user typed manually mid-session", () => {
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("first segment", true)] });
    expect(textarea.value).toBe("first segment");

    // User edits directly — dispatch a real input event, as a keystroke would.
    textarea.value = "first segment, edited by hand";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // A further transcript must append AFTER the manual edit, not before/over it.
    instances[0]?.onresult?.({
      resultIndex: 1,
      results: [makeResult("first segment", true), makeResult("more speech", true)],
    });

    expect(textarea.value).toBe("first segment, edited by hand more speech");
  });

  it("clicking the mic again while listening stops it", () => {
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    const status = document.querySelector('[data-role="sp-voice-status"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    micBtn.click();
    expect(status.textContent).toBe(t("voice.state.processing"));
    expect(instances[0]?.stop).toHaveBeenCalledOnce();

    instances[0]?.onend?.();
    expect(status.textContent).toBe(t("voice.consent"));
  });

  it("shows a distinguishable (non-color-only) error state on permission denial", () => {
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    const status = document.querySelector('[data-role="sp-voice-status"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    instances[0]?.onerror?.({ error: "not-allowed" });

    expect(status.textContent).toBe(t("voice.error.permissionDenied"));
    // Icon swaps (mic -> mic-off), not just color — mic-off uniquely has the diagonal strike-through line.
    expect(micBtn.innerHTML).toContain('x1="1" y1="1" x2="23" y2="23"');
  });

  it("stops listening and disables the mic while a submission is in flight", async () => {
    let resolveSubmit: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const showPromise = localPopup.show(makeBounds(), () => pending);

    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();
    expect(micBtn.disabled).toBe(false);

    document.querySelector<HTMLButtonElement>('[data-type="bug"]')!.click();
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "message";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    const submitBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (btn) => btn.textContent === t("popup.submit"),
    )!;
    submitBtn.click();

    // Submitting: the in-flight session must not keep transcribing, and the mic control is frozen like every other input.
    expect(instances[0]?.stop).toHaveBeenCalled();
    expect(micBtn.disabled).toBe(true);

    resolveSubmit();
    await showPromise.catch(() => {});
  });

  it("stops an active listening session when the popup closes via cancel", () => {
    void localPopup.show(makeBounds());
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();
    expect(instances[0]?.stop).not.toHaveBeenCalled();

    const cancelBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (btn) => btn.textContent === t("popup.cancel"),
    );
    cancelBtn?.click();

    expect(instances[0]?.stop).toHaveBeenCalled();
  });

  it("tears down the voice controller on destroy() (aborts any active session)", () => {
    const micBtn = document.querySelector<HTMLButtonElement>('[data-role="sp-mic-btn"]')!;
    micBtn.click();
    instances[0]?.onstart?.();

    localPopup.destroy();
    expect(instances[0]?.abort).toHaveBeenCalledOnce();
    // afterEach also calls destroy() — must not double-abort or throw.
    localPopup = new Popup(colors, t);
  });
});

// ---------------------------------------------------------------------------
// Right-click target-size picker (G8)
// ---------------------------------------------------------------------------

describe("Popup target-size picker", () => {
  let localPopup: Popup;

  afterEach(() => {
    localPopup.destroy();
  });

  function findTargetButtons(): { smallest: HTMLButtonElement; largest: HTMLButtonElement } {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
    const smallest = buttons.find((b) => b.textContent === t("popup.targetElement"))!;
    const largest = buttons.find((b) => b.textContent === t("popup.targetContainer"))!;
    return { smallest, largest };
  }

  it("is hidden when show() is called without targetSizeOptions", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    const { smallest } = findTargetButtons();
    // The row wrapping the buttons is display:none.
    expect(smallest.closest("div")!.parentElement!.style.display).toBe("none");
  });

  it("is shown with 'Element' active when targetSizeOptions.initial is 'smallest'", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds(), undefined, { initial: "smallest", onChange: vi.fn() });

    const { smallest, largest } = findTargetButtons();
    expect(smallest.closest("div")!.parentElement!.style.display).toBe("flex");
    expect(smallest.getAttribute("aria-pressed")).toBe("true");
    expect(largest.getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking 'Container' calls onChange('largest') and flips the active state", () => {
    const onChange = vi.fn();
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds(), undefined, { initial: "smallest", onChange });

    const { smallest, largest } = findTargetButtons();
    largest.click();

    expect(onChange).toHaveBeenCalledWith("largest");
    expect(largest.getAttribute("aria-pressed")).toBe("true");
    expect(smallest.getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking back to 'Element' calls onChange('smallest')", () => {
    const onChange = vi.fn();
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds(), undefined, { initial: "largest", onChange });

    const { smallest, largest } = findTargetButtons();
    expect(largest.getAttribute("aria-pressed")).toBe("true");

    smallest.click();
    expect(onChange).toHaveBeenCalledWith("smallest");
    expect(smallest.getAttribute("aria-pressed")).toBe("true");
  });

  it("resets to hidden on the next show() call that omits targetSizeOptions", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds(), undefined, { initial: "smallest", onChange: vi.fn() });
    localPopup.show(makeBounds());

    const { smallest } = findTargetButtons();
    expect(smallest.closest("div")!.parentElement!.style.display).toBe("none");
  });

  it("does not toggle while a submission is in flight", async () => {
    const onChange = vi.fn();
    localPopup = new Popup(colors, t);
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    void localPopup.show(makeBounds(), onSubmit, { initial: "smallest", onChange });

    const bugBtn = document.querySelector<HTMLButtonElement>('[data-type="bug"]')!;
    bugBtn.click();
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "hello";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    const submitBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (btn) => btn.querySelector("span")?.textContent === t("popup.submit"),
    )!;
    submitBtn.click();
    await Promise.resolve();

    const { largest } = findTargetButtons();
    largest.click();
    expect(onChange).not.toHaveBeenCalled();

    resolveSubmit();
  });
});

describe("Popup legend", () => {
  let localPopup: Popup;

  afterEach(() => {
    localPopup.destroy();
  });

  function legendRow(): HTMLElement {
    // The legend heading text is the sole discriminator — walk up from it to
    // the row that toggles display:none/flex.
    const heading = Array.from(document.querySelectorAll<HTMLElement>("span")).find(
      (s) => s.textContent === t("popup.legendLabel"),
    )!;
    return heading.parentElement!;
  }

  it("is hidden until setLegend() is called with entries", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    expect(legendRow().style.display).toBe("none");
  });

  it("shows one entry per number/label pair", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());

    localPopup.setLegend([
      { number: 1, label: "header" },
      { number: 2, label: "search box" },
    ]);

    expect(legendRow().style.display).toBe("flex");
    const text = legendRow().textContent ?? "";
    expect(text).toContain("1. header");
    expect(text).toContain("2. search box");
  });

  it("calling setLegend([]) hides the row again", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());
    localPopup.setLegend([{ number: 1, label: "header" }]);
    expect(legendRow().style.display).toBe("flex");

    localPopup.setLegend([]);
    expect(legendRow().style.display).toBe("none");
  });

  it("resets to hidden on the next show() call", () => {
    localPopup = new Popup(colors, t);
    localPopup.show(makeBounds());
    localPopup.setLegend([{ number: 1, label: "header" }]);
    expect(legendRow().style.display).toBe("flex");

    localPopup.show(makeBounds());
    expect(legendRow().style.display).toBe("none");
  });
});
