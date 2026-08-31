// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { sampleBackgroundIsLight } from "../../src/dom/background-contrast.js";

function stubElementFromPoint(fn: (x: number, y: number) => Element | null): void {
  document.elementFromPoint = fn as typeof document.elementFromPoint;
}

describe("sampleBackgroundIsLight", () => {
  afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    // @ts-expect-error — restoring jsdom's own (unimplemented) default
    delete document.elementFromPoint;
  });

  it("returns true for a white background", () => {
    const target = document.createElement("div");
    target.style.backgroundColor = "rgb(255, 255, 255)";
    document.body.appendChild(target);
    stubElementFromPoint(() => target);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(true);
  });

  it("returns false for a black background", () => {
    const target = document.createElement("div");
    target.style.backgroundColor = "rgb(0, 0, 0)";
    document.body.appendChild(target);
    stubElementFromPoint(() => target);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(false);
  });

  it("walks up through transparent elements to find the nearest opaque ancestor", () => {
    const parent = document.createElement("div");
    parent.style.backgroundColor = "rgb(20, 20, 20)"; // dark
    const child = document.createElement("span");
    child.style.backgroundColor = "transparent";
    parent.appendChild(child);
    document.body.appendChild(parent);
    stubElementFromPoint(() => child);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(false);
  });

  it("skips a low-alpha (mostly transparent) background-color", () => {
    const parent = document.createElement("div");
    parent.style.backgroundColor = "rgb(0, 0, 0)"; // opaque dark, further up
    const child = document.createElement("span");
    child.style.backgroundColor = "rgba(255, 255, 255, 0.1)"; // barely-there overlay
    parent.appendChild(child);
    document.body.appendChild(parent);
    stubElementFromPoint(() => child);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(false);
  });

  it("defaults to light (true) when nothing up the chain is opaque", () => {
    const target = document.createElement("div");
    target.style.backgroundColor = "transparent";
    document.body.appendChild(target);
    stubElementFromPoint(() => target);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(true);
  });

  it("returns null when there is no element at that point", () => {
    stubElementFromPoint(() => null);
    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBeNull();
  });

  it("returns null when elementFromPoint isn't implemented", () => {
    // @ts-expect-error — simulating an environment without it
    delete document.elementFromPoint;
    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBeNull();
  });

  it("temporarily hides hostToIgnore during the sample and restores visibility after", () => {
    const host = document.createElement("div");
    host.style.visibility = "visible";
    let visibilityDuringSample: string | undefined;
    stubElementFromPoint(() => {
      visibilityDuringSample = host.style.visibility;
      const el = document.createElement("div");
      el.style.backgroundColor = "rgb(255, 255, 255)";
      document.body.appendChild(el);
      return el;
    });

    sampleBackgroundIsLight(10, 10, host);

    expect(visibilityDuringSample).toBe("hidden");
    expect(host.style.visibility).toBe("visible");
  });

  it("fails closed to null (and restores visibility) if elementFromPoint throws", () => {
    const host = document.createElement("div");
    host.style.visibility = "visible";
    stubElementFromPoint(() => {
      throw new Error("boom");
    });

    expect(sampleBackgroundIsLight(10, 10, host)).toBeNull();
    expect(host.style.visibility).toBe("visible");
  });

  it("treats a fully-opaque colored background correctly (e.g. a saturated dark blue)", () => {
    const target = document.createElement("div");
    target.style.backgroundColor = "rgb(15, 23, 42)"; // slate-900-ish, dark
    document.body.appendChild(target);
    stubElementFromPoint(() => target);

    const host = document.createElement("div");
    expect(sampleBackgroundIsLight(10, 10, host)).toBe(false);
  });
});
