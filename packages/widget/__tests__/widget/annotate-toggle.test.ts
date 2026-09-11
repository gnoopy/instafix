// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Annotator, type HostPopup } from "../../src/annotator.js";
import { EventBus, type WidgetEvents } from "../../src/events.js";
import { Fab } from "../../src/fab.js";
import { createT } from "../../src/i18n/index.js";
import { buildThemeColors } from "../../src/styles/theme.js";
import { createShadowRoot, mockMatchMedia } from "../helpers.js";

mockMatchMedia(false);

const overlay = () => document.querySelector('[data-instafix-ignore][role="application"]');

function hostPopup(): HostPopup & { open: boolean } {
  return {
    open: false,
    get isOpen() {
      return this.open;
    },
    pastedScreenshotDataUrl: null,
    refreshLabels() {},
    setLegend() {},
    setPromptContext() {},
    setSourceHint() {},
    cancelOpen() {
      this.open = false;
    },
    destroy() {},
    show() {
      this.open = true;
      return new Promise(() => {});
    },
  };
}

describe("annotate toolbar button toggles its session", () => {
  let bus: EventBus<WidgetEvents>;
  let fab: Fab;
  let annotator: Annotator;
  let popup: ReturnType<typeof hostPopup>;
  let annotateButton: HTMLButtonElement;

  beforeEach(() => {
    bus = new EventBus<WidgetEvents>();
    const shadow = createShadowRoot();
    fab = new Fab(shadow, { endpoint: "", projectName: "test", position: "bottom-right" }, bus, createT("en"));
    popup = hostPopup();
    annotator = new Annotator(
      buildThemeColors("#4f8cf7", "dark"),
      bus,
      createT("en"),
      false,
      undefined,
      undefined,
      popup,
    );
    annotateButton = shadow.querySelector<HTMLButtonElement>('[data-item-id="annotate"]') as HTMLButtonElement;
  });

  afterEach(() => {
    annotator.destroy();
    fab.destroy();
    bus.removeAll();
    document.body.innerHTML = "";
  });

  it("pressing the lit button again ends the session and releases the page", () => {
    const ended = vi.fn();
    bus.on("annotation:end", ended);

    annotateButton.click();
    expect(overlay()).not.toBeNull();
    expect(annotateButton.getAttribute("aria-pressed")).toBe("true");

    annotateButton.click();
    expect(overlay()).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(annotateButton.getAttribute("aria-pressed")).toBe("false");
    expect(ended).toHaveBeenCalledOnce();

    annotateButton.click();
    expect(overlay()).not.toBeNull();
  });

  it("a cancel request closes an open composer first so it is never orphaned", () => {
    annotateButton.click();
    popup.open = true;

    bus.emit("annotation:cancel");

    expect(popup.isOpen).toBe(false);
    expect(overlay()).toBeNull();
  });

  it("a cancel request without a live session does nothing", () => {
    const ended = vi.fn();
    bus.on("annotation:end", ended);
    bus.emit("annotation:cancel");
    expect(ended).not.toHaveBeenCalled();
  });
});
