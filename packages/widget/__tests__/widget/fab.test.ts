// @vitest-environment jsdom

import type { InstaFixConfig } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus, type WidgetEvents } from "../../src/events.js";
import { Fab } from "../../src/fab.js";
import { createT, type TFunction, type Translations } from "../../src/i18n/index.js";
import { createShadowRoot } from "../helpers.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOOLBAR_HIDDEN_KEY = "instafix_toolbar_hidden";

function defaultConfig() {
  return {
    endpoint: "/api/instafix",
    projectName: "test-project",
    position: "bottom-right" as const,
  };
}

function getToolbarItems(shadow: ShadowRoot): HTMLButtonElement[] {
  return Array.from(shadow.querySelectorAll<HTMLButtonElement>(".sp-toolbar-item"));
}

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Fab", () => {
  let shadow: ShadowRoot;
  let bus: EventBus<WidgetEvents>;
  let fab: Fab;
  let store: Record<string, string>;

  beforeEach(() => {
    store = stubLocalStorage();
    shadow = createShadowRoot();
    bus = new EventBus<WidgetEvents>();
    fab = new Fab(shadow, defaultConfig(), bus, createT("fr"));
  });

  afterEach(() => {
    fab.destroy();
    shadow.host.remove();
  });

  // -------------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------------

  describe("construction", () => {
    it("creates a FAB button element in the shadow root", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab");
      expect(btn).not.toBeNull();
      expect(btn!.tagName).toBe("BUTTON");
    });

    it("the toolbar is visible by default — aria-expanded=true, aria-label reflects 'hide'", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.getAttribute("aria-expanded")).toBe("true");
      expect(btn.getAttribute("aria-label")).toBe(createT("fr")("fab.hideTools"));
    });

    it("the toolbar container has sp-toolbar--visible by default", () => {
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--visible")).toBe(true);
    });

    it("creates a toolbar container with role=toolbar", () => {
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]');
      expect(toolbar).not.toBeNull();
    });

    it("creates four toolbar items as plain buttons (no menuitem role)", () => {
      const items = getToolbarItems(shadow);
      expect(items.length).toBe(4);
      for (const item of items) {
        expect(item.getAttribute("role")).toBeNull();
      }
    });

    it("assigns correct data-item-id to each toolbar item", () => {
      const items = getToolbarItems(shadow);
      const ids = items.map((btn) => btn.dataset.itemId);
      expect(ids).toEqual(["chat", "annotate", "target-picker", "toggle-annotations"]);
    });

    it("toolbar items are tabbable by default (toolbar visible)", () => {
      const items = getToolbarItems(shadow);
      for (const item of items) {
        expect(item.tabIndex).toBe(0);
      }
    });

    it("renders the documented icon family — list for chat, pencil for annotate, crosshair for target-picker, eye for toggle", () => {
      const items = getToolbarItems(shadow);
      const chatSvg = items.find((b) => b.dataset.itemId === "chat")?.querySelector("svg");
      const annotateSvg = items.find((b) => b.dataset.itemId === "annotate")?.querySelector("svg");
      const targetSvg = items.find((b) => b.dataset.itemId === "target-picker")?.querySelector("svg");
      const toggleSvg = items.find((b) => b.dataset.itemId === "toggle-annotations")?.querySelector("svg");

      expect(chatSvg?.querySelectorAll("line").length).toBe(6);
      expect(annotateSvg?.querySelectorAll("path").length).toBe(2);
      expect(targetSvg?.querySelectorAll("circle").length).toBe(3);
      expect(toggleSvg?.querySelector("circle")).not.toBeNull();
    });

    it("applies position class based on config", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.classList.contains("sp-fab--bottom-right")).toBe(true);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--bottom-right")).toBe(true);
    });

    it("applies bottom-left position class when configured", () => {
      fab.destroy();
      shadow.host.remove();

      shadow = createShadowRoot();
      const config = { ...defaultConfig(), position: "bottom-left" as const };
      fab = new Fab(shadow, config, bus, createT("fr"));

      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.classList.contains("sp-fab--bottom-left")).toBe(true);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--bottom-left")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Persisted visibility (localStorage) — G8 "평상시에는 도구가 보이도록"
  // -------------------------------------------------------------------------

  describe("persisted toolbar visibility", () => {
    it("defaults to visible when nothing is stored", () => {
      expect(store[TOOLBAR_HIDDEN_KEY]).toBeUndefined();
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.getAttribute("aria-expanded")).toBe("true");
    });

    it("starts hidden when a previous visit hid it", () => {
      fab.destroy();
      shadow.host.remove();
      store[TOOLBAR_HIDDEN_KEY] = "1";

      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, createT("fr"));

      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.getAttribute("aria-expanded")).toBe("false");
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--visible")).toBe(false);
    });

    it("hiding the toolbar persists the choice", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click(); // hide

      expect(store[TOOLBAR_HIDDEN_KEY]).toBe("1");
    });

    it("showing the toolbar again clears the stored preference", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click(); // hide
      btn.click(); // show

      expect(store[TOOLBAR_HIDDEN_KEY]).toBeUndefined();
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
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();

      expect(() => {
        fab = new Fab(shadow, defaultConfig(), bus, createT("fr"));
        shadow.querySelector<HTMLButtonElement>(".sp-fab")!.click();
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // config.showAnnotationsToggle — opt-out for the marker-visibility item
  // -------------------------------------------------------------------------

  describe("config.showAnnotationsToggle", () => {
    it("defaults to true — toggle-annotations item is present when the option is omitted", () => {
      const items = getToolbarItems(shadow);
      const ids = items.map((btn) => btn.dataset.itemId);
      expect(ids).toContain("toggle-annotations");
      expect(items.length).toBe(4);
    });

    it("`true` (explicit) keeps the toggle-annotations item", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, { ...defaultConfig(), showAnnotationsToggle: true }, bus, createT("fr"));

      const ids = getToolbarItems(shadow).map((btn) => btn.dataset.itemId);
      expect(ids).toEqual(["chat", "annotate", "target-picker", "toggle-annotations"]);
    });

    it("`false` hides the toggle-annotations item entirely — no DOM, no click handler", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, { ...defaultConfig(), showAnnotationsToggle: false }, bus, createT("fr"));

      const ids = getToolbarItems(shadow).map((btn) => btn.dataset.itemId);
      expect(ids).toEqual(["chat", "annotate", "target-picker"]);
      expect(shadow.querySelector('[data-item-id="toggle-annotations"]')).toBeNull();
    });

    it("`false` — `annotations:toggle` is never emitted from the FAB even when the bottom item is clicked", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, { ...defaultConfig(), showAnnotationsToggle: false }, bus, createT("fr"));

      const listener = vi.fn();
      bus.on("annotations:toggle", listener);

      shadow.querySelector<HTMLButtonElement>('[data-item-id="chat"]')!.click();
      shadow.querySelector<HTMLButtonElement>('[data-item-id="annotate"]')!.click();

      expect(listener).not.toHaveBeenCalled();
    });

    it("`false` — keyboard navigation still cycles through the remaining three items", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, { ...defaultConfig(), showAnnotationsToggle: false }, bus, createT("fr"));

      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(items.length).toBe(3);

      items[0]!.focus();
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(shadow.activeElement).toBe(items[1]);
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(shadow.activeElement).toBe(items[2]);

      // ArrowRight again wraps back to the first item (last → first)
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(shadow.activeElement).toBe(items[0]);
    });
  });

  // -------------------------------------------------------------------------
  // Show / Hide (FAB toggles the persistent toolbar)
  // -------------------------------------------------------------------------

  describe("show/hide", () => {
    it("hides the toolbar on FAB click — aria-expanded becomes false", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click();

      expect(btn.getAttribute("aria-expanded")).toBe("false");
      expect(btn.getAttribute("aria-label")).toBe(createT("fr")("fab.showTools"));
    });

    it("removes sp-toolbar--visible when hidden", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click();

      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--visible")).toBe(false);
    });

    it("moves hidden items out of Tab order", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click();

      for (const item of getToolbarItems(shadow)) {
        expect(item.tabIndex).toBe(-1);
      }
    });

    it("shows the toolbar again on a second FAB click", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click(); // hide
      btn.click(); // show

      expect(btn.getAttribute("aria-expanded")).toBe("true");
      expect(btn.getAttribute("aria-label")).toBe(createT("fr")("fab.hideTools"));
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--visible")).toBe(true);
      for (const item of getToolbarItems(shadow)) {
        expect(item.tabIndex).toBe(0);
      }
    });

    it("hides the toolbar on Escape key press", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });

    it("Escape does nothing when already hidden", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click(); // hide
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });

    it("an outside click does NOT hide the toolbar (deliberately no click-outside auto-hide)", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.getAttribute("aria-expanded")).toBe("true");

      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

      expect(btn.getAttribute("aria-expanded")).toBe("true");
    });

    it("the toolbar stays visible after clicking a toolbar item (no longer auto-closes)", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      const chatBtn = shadow.querySelector<HTMLButtonElement>('[data-item-id="chat"]')!;
      chatBtn.click();

      expect(btn.getAttribute("aria-expanded")).toBe("true");
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      expect(toolbar.classList.contains("sp-toolbar--visible")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation (horizontal: ArrowLeft/ArrowRight)
  // -------------------------------------------------------------------------

  describe("keyboard navigation", () => {
    it("ArrowRight cycles forward through toolbar items", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[0]!.focus();
      expect(shadow.activeElement).toBe(items[0]);

      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(shadow.activeElement).toBe(items[1]);
    });

    it("ArrowLeft cycles backward through toolbar items", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[1]!.focus();

      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(shadow.activeElement).toBe(items[0]);
    });

    it("ArrowRight wraps from last to first item", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[items.length - 1]!.focus();

      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(shadow.activeElement).toBe(items[0]);
    });

    it("ArrowLeft wraps from first to last item", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[0]!.focus();

      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(shadow.activeElement).toBe(items[items.length - 1]);
    });

    it("Home key moves focus to first item", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[2]!.focus();
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(shadow.activeElement).toBe(items[0]);
    });

    it("End key moves focus to last item", () => {
      const items = getToolbarItems(shadow);
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      items[0]!.focus();
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(shadow.activeElement).toBe(items[items.length - 1]);
    });

    it("ArrowRight is ignored when the toolbar is hidden (early return — items+!visible guard)", () => {
      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      btn.click(); // hide

      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;
      const items = getToolbarItems(shadow);

      items[0]!.focus();
      toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(shadow.activeElement).toBe(items[0]);
    });

    it("falls back to document.activeElement when shadowRoot.activeElement is null", () => {
      const toolbar = shadow.querySelector<HTMLElement>('[role="toolbar"]')!;

      Object.defineProperty(shadow, "activeElement", {
        configurable: true,
        get: () => null,
      });

      expect(() => {
        toolbar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      }).not.toThrow();

      delete (shadow as unknown as { activeElement?: unknown }).activeElement;
    });
  });

  // -------------------------------------------------------------------------
  // Toolbar item clicks — event bus emissions
  // -------------------------------------------------------------------------

  describe("toolbar item clicks", () => {
    it("clicking 'chat' item emits panel:toggle with true", () => {
      const listener = vi.fn();
      bus.on("panel:toggle", listener);

      const chatBtn = shadow.querySelector<HTMLButtonElement>('[data-item-id="chat"]')!;
      chatBtn.click();

      expect(listener).toHaveBeenCalledWith(true);
    });

    it("clicking 'annotate' item emits annotation:start", () => {
      const listener = vi.fn();
      bus.on("annotation:start", listener);

      const annotateBtn = shadow.querySelector<HTMLButtonElement>('[data-item-id="annotate"]')!;
      annotateBtn.click();

      expect(listener).toHaveBeenCalledOnce();
    });

    it("re-focuses the FAB when an annotation session it launched ends", () => {
      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      shadow.querySelector<HTMLButtonElement>('[data-item-id="annotate"]')!.click();

      // Simulate the annotator stealing focus to its body-level overlay, then
      // ending the session (Escape / cancel / submit).
      const decoy = document.createElement("div");
      decoy.setAttribute("tabindex", "0");
      document.body.appendChild(decoy);
      decoy.focus();
      try {
        bus.emit("annotation:end");
        expect(shadow.activeElement).toBe(fabBtn);
      } finally {
        decoy.remove();
      }
    });

    it("does not re-focus the FAB for annotation sessions it did not launch", () => {
      const decoy = document.createElement("div");
      decoy.setAttribute("tabindex", "0");
      document.body.appendChild(decoy);
      decoy.focus();
      try {
        bus.emit("annotation:end");
        expect(shadow.activeElement).toBeNull();
        expect(document.activeElement).toBe(decoy);
      } finally {
        decoy.remove();
      }
    });

    it("clicking 'toggle-annotations' emits annotations:toggle", () => {
      const listener = vi.fn();
      bus.on("annotations:toggle", listener);

      const toggleBtn = shadow.querySelector<HTMLButtonElement>('[data-item-id="toggle-annotations"]')!;
      toggleBtn.click();

      // First toggle: was visible (true), now hidden (false)
      expect(listener).toHaveBeenCalledWith(false);
    });
  });

  // -------------------------------------------------------------------------
  // target-picker — the auto-target hover-and-click toggle button. Its
  // active state is bus-driven (targeting:start/targeting:end), not mutated
  // directly on click, so it stays correct regardless of who ended the
  // session (Escape, a successful lock, or the button itself).
  // -------------------------------------------------------------------------

  describe("target-picker", () => {
    function targetBtn(): HTMLButtonElement {
      return shadow.querySelector<HTMLButtonElement>('[data-item-id="target-picker"]')!;
    }

    it("clicking it while inactive emits targeting:start", () => {
      const listener = vi.fn();
      bus.on("targeting:start", listener);

      targetBtn().click();

      expect(listener).toHaveBeenCalledOnce();
    });

    it("clicking it again while active emits targeting:end instead", () => {
      const startListener = vi.fn();
      const endListener = vi.fn();
      bus.on("targeting:start", startListener);
      bus.on("targeting:end", endListener);

      targetBtn().click(); // starts — bus emits targeting:start, which (via the same bus) flips the button active
      targetBtn().click(); // now active, so this emits targeting:end

      expect(startListener).toHaveBeenCalledOnce();
      expect(endListener).toHaveBeenCalledOnce();
    });

    it("starts with aria-pressed=false and no active class", () => {
      expect(targetBtn().getAttribute("aria-pressed")).toBe("false");
      expect(targetBtn().classList.contains("sp-toolbar-item--active")).toBe(false);
    });

    it("bus targeting:start sets aria-pressed=true and the active class, even when emitted by something else", () => {
      bus.emit("targeting:start");

      expect(targetBtn().getAttribute("aria-pressed")).toBe("true");
      expect(targetBtn().classList.contains("sp-toolbar-item--active")).toBe(true);
    });

    it("bus targeting:end clears the active state", () => {
      bus.emit("targeting:start");
      bus.emit("targeting:end");

      expect(targetBtn().getAttribute("aria-pressed")).toBe("false");
      expect(targetBtn().classList.contains("sp-toolbar-item--active")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Badge
  // -------------------------------------------------------------------------

  describe("updateBadge", () => {
    it("shows badge with count when count > 0", () => {
      fab.updateBadge(5);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge");
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe("5");
    });

    it("sets role=status and aria-live=polite on badge", () => {
      fab.updateBadge(3);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge")!;
      expect(badge.getAttribute("role")).toBe("status");
      expect(badge.getAttribute("aria-live")).toBe("polite");
    });

    it("sets aria-label with count on badge", () => {
      fab.updateBadge(7);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge")!;
      const t = createT("fr");
      expect(badge.getAttribute("aria-label")).toBe(t("fab.badge").replace("{count}", "7"));
    });

    it("displays '99+' for counts over 99", () => {
      fab.updateBadge(150);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge")!;
      expect(badge.textContent).toBe("99+");
    });

    it("hides badge when count is 0", () => {
      fab.updateBadge(5);
      fab.updateBadge(0);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge");
      expect(badge).toBeNull();
    });

    it("hides badge when count is negative", () => {
      fab.updateBadge(5);
      fab.updateBadge(-1);

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge");
      expect(badge).toBeNull();
    });

    it("updates existing badge count without creating a new element", () => {
      fab.updateBadge(3);
      const badge1 = shadow.querySelector<HTMLElement>(".sp-fab-badge");

      fab.updateBadge(10);
      const badge2 = shadow.querySelector<HTMLElement>(".sp-fab-badge");

      expect(badge1).toBe(badge2); // same DOM element
      expect(badge2!.textContent).toBe("10");
    });

    it("preserves badge after FAB icon swap (hide/show)", () => {
      fab.updateBadge(5);

      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.click(); // hide — icon changes to the logo icon
      fabBtn.click(); // show — icon changes back

      const badge = shadow.querySelector<HTMLElement>(".sp-fab-badge");
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe("5");
    });
  });

  // -------------------------------------------------------------------------
  // Destroy
  // -------------------------------------------------------------------------

  describe("destroy", () => {
    it("removes DOM elements from shadow root", () => {
      fab.destroy();

      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab");
      const toolbar = shadow.querySelector('[role="toolbar"]');
      expect(btn).toBeNull();
      expect(toolbar).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Default position fallback
  // -------------------------------------------------------------------------

  describe("default position fallback", () => {
    it("falls back to 'bottom-right' position when config.position is omitted", () => {
      fab.destroy();
      shadow.host.remove();

      shadow = createShadowRoot();
      const config: InstaFixConfig = { endpoint: "/api/instafix", projectName: "test-project" };
      fab = new Fab(shadow, config, bus, createT("fr"));

      const btn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(btn.classList.contains("sp-fab--bottom-right")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // refreshLabels — re-localizes the FAB after the locale dictionary lands
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

    it("re-reads `t` at refresh time and writes aria-labels + label spans", () => {
      const prefix = { value: "INIT" };
      const mutableT = makeMutableT(prefix);

      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, mutableT);

      // Initial state: labels reflect the first prefix. Toolbar starts
      // visible, so the FAB's own label is the "hide" variant.
      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      expect(fabBtn.getAttribute("aria-label")).toBe("INIT:fab.hideTools");

      // Swap the closure's return value, then refresh — DOM should track it.
      prefix.value = "SWAPPED";
      fab.refreshLabels();

      expect(fabBtn.getAttribute("aria-label")).toBe("SWAPPED:fab.hideTools");

      const items = getToolbarItems(shadow);
      const chatItem = items.find((b) => b.dataset.itemId === "chat")!;
      const annotateItem = items.find((b) => b.dataset.itemId === "annotate")!;
      const toggleItem = items.find((b) => b.dataset.itemId === "toggle-annotations")!;

      expect(chatItem.getAttribute("aria-label")).toBe("SWAPPED:fab.messages");
      expect(annotateItem.getAttribute("aria-label")).toBe("SWAPPED:fab.annotate");
      expect(toggleItem.getAttribute("aria-label")).toBe("SWAPPED:fab.annotations");

      // The name lives in its own child span (the tooltip also carries a
      // shortcut chip at its right end — see the "toolbar shortcuts" tests).
      expect(chatItem.querySelector(".sp-toolbar-label-text")?.textContent).toBe("SWAPPED:fab.messages");
      expect(annotateItem.querySelector(".sp-toolbar-label-text")?.textContent).toBe("SWAPPED:fab.annotate");
      expect(toggleItem.querySelector(".sp-toolbar-label-text")?.textContent).toBe("SWAPPED:fab.annotations");
    });

    it("reflects the hidden state's label after refresh when the toolbar is hidden", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, createT("en"));

      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.click(); // hide
      fab.refreshLabels();

      expect(fabBtn.getAttribute("aria-label")).toBe(createT("en")("fab.showTools"));
    });

    it("is idempotent — calling twice with the same `t` is a no-op on values", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, createT("en"));

      fab.refreshLabels();
      const first = shadow.querySelector<HTMLButtonElement>(".sp-fab")!.getAttribute("aria-label");
      fab.refreshLabels();
      const second = shadow.querySelector<HTMLButtonElement>(".sp-fab")!.getAttribute("aria-label");

      expect(second).toBe(first);
    });
  });

  describe("toggle-annotations icon swap", () => {
    it("two consecutive toggles swap the icon back to ICON_EYE (true branch of cond-expr)", () => {
      const toggleBtnSelector = '[data-item-id="toggle-annotations"]';

      // First toggle: visible -> hidden, icon becomes EYE_OFF
      let toggleBtn = shadow.querySelector<HTMLButtonElement>(toggleBtnSelector)!;
      toggleBtn.click();

      // Second toggle: hidden -> visible, icon becomes EYE again
      toggleBtn = shadow.querySelector<HTMLButtonElement>(toggleBtnSelector)!;

      const listener = vi.fn();
      bus.on("annotations:toggle", listener);
      toggleBtn.click();

      // The bus should now emit annotations:toggle with true (back to visible)
      expect(listener).toHaveBeenCalledWith(true);
    });

    // Regression: clicking the toggle used `replaceChildren(parseSvg(...))`,
    // which dropped the `<span class="sp-toolbar-label">` alongside the old
    // SVG — killing the hover label tooltip until a page reload. The fix
    // swaps the SVG node in place and leaves the label span untouched.
    it("preserves the hover label span across consecutive toggles", () => {
      const toggleBtnSelector = '[data-item-id="toggle-annotations"]';
      const t = createT("fr");
      const expectedLabel = t("fab.annotations");

      const toggleBtn = shadow.querySelector<HTMLButtonElement>(toggleBtnSelector)!;

      // Sanity: the name span exists with the translated text before any
      // click (the label wrapper also carries the shortcut key chip).
      const labelBefore = toggleBtn.querySelector<HTMLSpanElement>(".sp-toolbar-label-text");
      expect(labelBefore).not.toBeNull();
      expect(labelBefore!.textContent).toBe(expectedLabel);

      // First click — was the regression trigger.
      toggleBtn.click();

      const labelAfterFirst = toggleBtn.querySelector<HTMLSpanElement>(".sp-toolbar-label-text");
      expect(labelAfterFirst).not.toBeNull();
      expect(labelAfterFirst!.textContent).toBe(expectedLabel);

      // Toggle again — span must still survive the second swap.
      const toggleAgain = shadow.querySelector<HTMLButtonElement>(toggleBtnSelector)!;
      toggleAgain.click();

      const labelAfterSecond = toggleAgain.querySelector<HTMLSpanElement>(".sp-toolbar-label-text");
      expect(labelAfterSecond).not.toBeNull();
      expect(labelAfterSecond!.textContent).toBe(expectedLabel);
    });

    it("replaces only the SVG icon — button has exactly one <svg> and one .sp-toolbar-label after each toggle", () => {
      const toggleBtnSelector = '[data-item-id="toggle-annotations"]';
      const toggleBtn = shadow.querySelector<HTMLButtonElement>(toggleBtnSelector)!;

      for (let i = 0; i < 3; i++) {
        toggleBtn.click();
        expect(toggleBtn.querySelectorAll("svg").length).toBe(1);
        expect(toggleBtn.querySelectorAll(".sp-toolbar-label").length).toBe(1);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Auto-contrast against the host page's background (G8)
  // -------------------------------------------------------------------------

  describe("auto-contrast", () => {
    const originalElementFromPoint = document.elementFromPoint;

    afterEach(() => {
      vi.useRealTimers();
      document.elementFromPoint = originalElementFromPoint;
    });

    function stubFabRect(): void {
      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.getBoundingClientRect = () =>
        ({
          top: 800,
          left: 1300,
          width: 52,
          height: 52,
          right: 1352,
          bottom: 852,
          x: 1300,
          y: 800,
          toJSON: () => {},
        }) as DOMRect;
    }

    function stubPageBackground(color: string): void {
      const bgEl = document.createElement("div");
      bgEl.style.backgroundColor = color;
      document.body.appendChild(bgEl);
      document.elementFromPoint = (() => bgEl) as typeof document.elementFromPoint;
    }

    it("defers the initial contrast sample to the next animation frame", () => {
      // Regression: sampling synchronously in the constructor measured the
      // FAB before the shadow root's stylesheet was necessarily attached —
      // in a real browser that's still a 0×0 rect, silently skipping the
      // very first sample on most page loads. jsdom can't reproduce the
      // layout-timing bug itself (it never lays anything out), but this
      // pins the fix's mechanism: the initial sample must go through rAF.
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, createT("fr"));

      expect(rafSpy).toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it("does not sample when the FAB isn't laid out yet (0×0 rect — jsdom's default)", () => {
      // The shared beforeEach already constructed `fab` — jsdom reports an
      // all-zero rect, so the initial sample in the constructor is a no-op.
      const root = shadow.querySelector<HTMLElement>(".sp-fab")!.parentElement!;
      expect(root.classList.contains("sp-fab-root--on-light")).toBe(false);
      expect(root.classList.contains("sp-fab-root--on-dark")).toBe(false);
    });

    it("adds sp-fab-root--on-light when a light background is sampled on scroll", () => {
      vi.useFakeTimers();
      stubFabRect();
      stubPageBackground("rgb(255, 255, 255)");

      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(250);

      const root = shadow.querySelector<HTMLElement>(".sp-fab")!.parentElement!;
      expect(root.classList.contains("sp-fab-root--on-light")).toBe(true);
      expect(root.classList.contains("sp-fab-root--on-dark")).toBe(false);
    });

    it("adds sp-fab-root--on-dark when a dark background is sampled on resize", () => {
      vi.useFakeTimers();
      stubFabRect();
      stubPageBackground("rgb(10, 10, 10)");

      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(250);

      const root = shadow.querySelector<HTMLElement>(".sp-fab")!.parentElement!;
      expect(root.classList.contains("sp-fab-root--on-dark")).toBe(true);
      expect(root.classList.contains("sp-fab-root--on-light")).toBe(false);
    });

    it("switches from on-light to on-dark as the sampled background changes across scroll events", () => {
      vi.useFakeTimers();
      stubFabRect();

      stubPageBackground("rgb(255, 255, 255)");
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(250);
      const root = shadow.querySelector<HTMLElement>(".sp-fab")!.parentElement!;
      expect(root.classList.contains("sp-fab-root--on-light")).toBe(true);

      stubPageBackground("rgb(10, 10, 10)");
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(250);
      expect(root.classList.contains("sp-fab-root--on-light")).toBe(false);
      expect(root.classList.contains("sp-fab-root--on-dark")).toBe(true);
    });

    it("debounces rapid scroll events into a single re-sample", () => {
      vi.useFakeTimers();
      stubFabRect();
      stubPageBackground("rgb(255, 255, 255)");

      const spy = vi.spyOn(document, "elementFromPoint");
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(250);

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it("does not sample after destroy() (scroll/resize listeners removed)", () => {
      vi.useFakeTimers();
      stubFabRect();
      stubPageBackground("rgb(255, 255, 255)");

      fab.destroy();
      const spy = vi.spyOn(document, "elementFromPoint");
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(250);

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Discovery shine — periodic right-to-left light sweep (G8)
  // -------------------------------------------------------------------------

  describe("discovery shine", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    function stubLayout(): void {
      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.getBoundingClientRect = () =>
        ({
          top: 800,
          left: 1300,
          width: 52,
          height: 52,
          right: 1352,
          bottom: 852,
          x: 1300,
          y: 800,
          toJSON: () => {},
        }) as DOMRect;
      const toolbarEl = shadow.querySelector<HTMLElement>(".sp-toolbar")!;
      toolbarEl.getBoundingClientRect = () =>
        ({
          top: 804,
          left: 1050,
          width: 234,
          height: 44,
          right: 1284,
          bottom: 848,
          x: 1050,
          y: 804,
          toJSON: () => {},
        }) as DOMRect;
    }

    function findShine(): HTMLElement | null {
      return shadow.querySelector<HTMLElement>(".sp-toolbar-shine");
    }

    /**
     * The shared `beforeEach` constructs `fab` before this describe block's
     * mocks (fake timers, `Math.random`) exist — its constructor already
     * called `scheduleShine()` against a REAL, unmocked-random timer that
     * `vi.advanceTimersByTime()` can never see. Recreate it once the mocks
     * are in place so its own `scheduleShine()` call is the one under test.
     */
    function recreateFab(): void {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      fab = new Fab(shadow, defaultConfig(), bus, createT("fr"));
    }

    function mockRafSynchronous(): void {
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        cb(0);
        return 0;
      });
    }

    it("does not sweep before layout has happened (jsdom's default 0×0 rects)", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0); // shortest choice: 3000ms
      mockRafSynchronous();
      recreateFab();

      // No stubLayout() — the FAB/toolbar keep jsdom's default 0×0 rects, so
      // playShine()'s "not laid out yet" guard should skip creating anything.
      vi.advanceTimersByTime(3000);
      expect(findShine()).toBeNull();
    });

    it("sweeps once after the shortest random interval (3000ms) when Math.random rolls 0", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(3000);

      expect(findShine()).not.toBeNull();
    });

    it("sizes the sweep to span both the toolbar and the FAB", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(3000);

      const shine = findShine()!;
      // left = min(toolbar.left=1050, fab.left=1300) = 1050
      // right = max(toolbar.right=1284, fab.right=1352) = 1352 → width 302
      expect(shine.style.left).toBe("1050px");
      expect(shine.style.width).toBe("302px");
    });

    it("pauses the sweep while the panel is open and resumes when it closes", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      // Panel open — it covers the toolbar, so no sweep may fire.
      bus.emit("open");
      vi.advanceTimersByTime(10000);
      expect(findShine()).toBeNull();

      // Panel closed — the schedule restarts and the next interval sweeps.
      bus.emit("close");
      vi.advanceTimersByTime(3000);
      expect(findShine()).not.toBeNull();
    });

    it("removes the sweep element once its animation ends", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(3000);
      const shine = findShine()!;
      shine.dispatchEvent(new Event("animationend"));

      expect(findShine()).toBeNull();
    });

    it("schedules the next sweep after the previous one fires (repeats indefinitely)", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0); // always the shortest (3000ms) choice
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(3000);
      const first = findShine();
      expect(first).not.toBeNull();
      first?.dispatchEvent(new Event("animationend"));

      vi.advanceTimersByTime(3000);
      expect(findShine()).not.toBeNull();
    });

    it("picks the longest interval (5000ms) when Math.random rolls close to 1", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0.99);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(4000);
      expect(findShine()).toBeNull(); // too early for the 5000ms choice

      vi.advanceTimersByTime(1000);
      expect(findShine()).not.toBeNull();
    });

    it("hiding the toolbar cancels the pending cycle and removes an in-flight sweep", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      vi.advanceTimersByTime(3000);
      expect(findShine()).not.toBeNull();

      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.click(); // hide

      expect(findShine()).toBeNull();

      // No further sweep even after waiting well past every possible interval.
      vi.advanceTimersByTime(5000);
      expect(findShine()).toBeNull();
    });

    it("showing the toolbar again restarts the schedule", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      mockRafSynchronous();
      recreateFab();
      stubLayout();

      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      fabBtn.click(); // hide
      fabBtn.click(); // show again

      vi.advanceTimersByTime(3000);
      expect(findShine()).not.toBeNull();
    });

    it("destroy() cancels the pending cycle", () => {
      vi.useFakeTimers();
      vi.spyOn(Math, "random").mockReturnValue(0);
      recreateFab();
      stubLayout();
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");

      fab.destroy();
      vi.advanceTimersByTime(5000);

      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Global toolbar shortcuts — Alt+Shift+<letter>, one per item
  // -------------------------------------------------------------------------

  describe("toolbar shortcuts", () => {
    function pressShortcut(code: string, init: KeyboardEventInit = {}): void {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { code, altKey: true, shiftKey: true, bubbles: true, cancelable: true, ...init }),
      );
    }

    it("Alt+Shift+S opens the feedback panel (S for Sidebar — F clashes with Awesome Screenshot)", () => {
      const listener = vi.fn();
      bus.on("panel:toggle", listener);
      pressShortcut("KeyS");
      expect(listener).toHaveBeenCalledWith(true);
    });

    it("Alt+Shift+A starts an annotation", () => {
      const listener = vi.fn();
      bus.on("annotation:start", listener);
      pressShortcut("KeyA");
      expect(listener).toHaveBeenCalled();
    });

    it("Alt+Shift+T toggles targeting mode on, then off", () => {
      const start = vi.fn();
      const end = vi.fn();
      bus.on("targeting:start", start);
      bus.on("targeting:end", end);

      pressShortcut("KeyT");
      expect(start).toHaveBeenCalledTimes(1);
      // The Fab tracks its own state via the bus event it just emitted.
      pressShortcut("KeyT");
      expect(end).toHaveBeenCalledTimes(1);
    });

    it("Alt+Shift+V toggles marker visibility", () => {
      const listener = vi.fn();
      bus.on("annotations:toggle", listener);
      pressShortcut("KeyV");
      expect(listener).toHaveBeenCalledWith(false);
    });

    it("requires exactly Alt+Shift — bare keys and AltGr-style Ctrl+Alt combos are ignored", () => {
      const listener = vi.fn();
      bus.on("panel:toggle", listener);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyS", bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyS", altKey: true, bubbles: true }));
      pressShortcut("KeyS", { ctrlKey: true }); // AltGr reports ctrl+alt
      pressShortcut("KeyS", { metaKey: true });

      expect(listener).not.toHaveBeenCalled();
    });

    it("is suppressed while the user is typing in an editable element", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      const listener = vi.fn();
      bus.on("panel:toggle", listener);
      pressShortcut("KeyS");

      expect(listener).not.toHaveBeenCalled();
      input.remove();
    });

    it("Alt+Shift+V is inert when the annotations toggle is configured away", () => {
      fab.destroy();
      shadow.host.remove();
      shadow = createShadowRoot();
      bus = new EventBus<WidgetEvents>();
      fab = new Fab(shadow, { ...defaultConfig(), showAnnotationsToggle: false }, bus, createT("fr"));

      const listener = vi.fn();
      bus.on("annotations:toggle", listener);
      pressShortcut("KeyV");

      expect(listener).not.toHaveBeenCalled();
    });

    it("shows the shortcut in each tooltip's key chip and as aria-keyshortcuts", () => {
      const items = getToolbarItems(shadow);
      const chat = items.find((b) => b.dataset.itemId === "chat")!;
      // jsdom is not macOS — the Windows/Linux form is expected here.
      expect(chat.querySelector(".sp-toolbar-label-key")?.textContent).toBe("Alt+Shift+S");
      expect(chat.getAttribute("aria-keyshortcuts")).toBe("Alt+Shift+S");

      const target = items.find((b) => b.dataset.itemId === "target-picker")!;
      expect(target.querySelector(".sp-toolbar-label-key")?.textContent).toBe("Alt+Shift+T");
    });

    it("destroy() removes the document listener", () => {
      const listener = vi.fn();
      bus.on("panel:toggle", listener);
      fab.destroy();

      pressShortcut("KeyS");

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
