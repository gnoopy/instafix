// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { freezePage, isFrozen } from "../../src/dom/freeze.js";

describe("freezePage", () => {
  beforeEach(() => {
    document.body.replaceChildren();
    document.head.replaceChildren();
  });

  afterEach(() => {
    document.getElementById("instafix-freeze-style")?.remove();
  });

  it("injects a stylesheet that pauses animations, and removes it on release", () => {
    const frozen = freezePage();
    expect(isFrozen()).toBe(true);
    const style = document.getElementById("instafix-freeze-style");
    expect(style?.textContent).toContain("animation-play-state: paused");
    // The widget's own chrome must keep animating — it is the UI being used.
    expect(style?.textContent).toContain("data-instafix-ignore");
    frozen.release();
    expect(isFrozen()).toBe(false);
  });

  it("release is idempotent", () => {
    const frozen = freezePage();
    frozen.release();
    expect(() => frozen.release()).not.toThrow();
    expect(isFrozen()).toBe(false);
  });

  it("a second freeze while frozen is inert, so styles cannot be double-pinned", () => {
    const first = freezePage();
    const second = freezePage();
    expect(second.pinnedCount).toBe(0);
    second.release();
    // The real freeze is untouched by releasing the inert handle.
    expect(isFrozen()).toBe(true);
    first.release();
  });

  it("pauses playing media and resumes exactly what it paused", () => {
    const playing = document.createElement("video");
    const alreadyPaused = document.createElement("video");
    const play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(playing, "paused", { value: false });
    Object.defineProperty(alreadyPaused, "paused", { value: true });
    playing.pause = vi.fn();
    playing.play = play;
    alreadyPaused.pause = vi.fn();
    alreadyPaused.play = vi.fn().mockResolvedValue(undefined);
    document.body.append(playing, alreadyPaused);

    const frozen = freezePage();
    expect(playing.pause).toHaveBeenCalledOnce();
    expect(alreadyPaused.pause).not.toHaveBeenCalled();
    expect(frozen.pausedMediaCount).toBe(1);

    frozen.release();
    expect(play).toHaveBeenCalledOnce();
    // Media the user had already stopped stays stopped.
    expect(alreadyPaused.play).not.toHaveBeenCalled();
  });

  it("restores inline styles exactly, including properties that were unset", () => {
    document.body.innerHTML = `<div id="menu"><span id="drop" style="opacity: 0.5">x</span></div>`;
    const menu = document.getElementById("menu")!;
    const drop = document.getElementById("drop")!;
    // jsdom has no real pointer, so drive the hover chain directly.
    const original = document.querySelectorAll.bind(document);
    vi.spyOn(document, "querySelectorAll").mockImplementation(((selector: string) =>
      selector === ":hover" ? ([menu] as unknown as NodeListOf<Element>) : original(selector)) as typeof original);

    const frozen = freezePage();
    expect(frozen.pinnedCount).toBeGreaterThan(0);
    expect(drop.style.display).not.toBe("");

    frozen.release();
    // `display` was never set inline — it must be gone, not blanked to "".
    expect(drop.getAttribute("style")).not.toContain("display");
    // `opacity` was authored — its original value comes back.
    expect(drop.style.opacity).toBe("0.5");
    vi.restoreAllMocks();
  });
});
