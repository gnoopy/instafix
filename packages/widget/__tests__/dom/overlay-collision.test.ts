// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { pickAvoidingPosition } from "../../src/dom/overlay-collision.js";
import { makeDOMRect } from "../helpers.js";

// Real elementsFromPoint answers depend on x/y — a stub that ignores them
// would report the intruder at every corner, including the one it isn't
// actually near. Only "hit" the right half of the viewport, matching where
// a bottom-right-anchored intruder would actually sit.
function stubElementsFromPoint(elements: Element[]): void {
  document.elementsFromPoint = (x: number) => (x > window.innerWidth / 2 ? elements : []);
}

function fixedEl(rect: { width: number; height: number } = { width: 48, height: 48 }): HTMLElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.getBoundingClientRect = () => makeDOMRect(0, 0, rect.width, rect.height);
  document.body.appendChild(el);
  return el;
}

describe("pickAvoidingPosition", () => {
  const host = document.createElement("div");

  afterEach(() => {
    document.body.replaceChildren();
    // @ts-expect-error — restore jsdom's (missing) default between tests
    document.elementsFromPoint = undefined;
  });

  it("keeps the preferred corner when elementsFromPoint isn't supported", () => {
    // @ts-expect-error — simulate a browser without the API
    document.elementsFromPoint = undefined;
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("keeps the preferred corner when nothing occupies it", () => {
    stubElementsFromPoint([document.body]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("switches to the other corner when a fixed element occupies the preferred one", () => {
    const intruder = fixedEl();
    stubElementsFromPoint([intruder]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-left");
  });

  it("falls back to the preferred corner when both corners are occupied", () => {
    const intruder = fixedEl();
    document.elementsFromPoint = () => [intruder];
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("ignores the widget's own host element", () => {
    stubElementsFromPoint([host]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("ignores elements nested inside the widget's own host", () => {
    const child = document.createElement("span");
    host.appendChild(child);
    stubElementsFromPoint([child]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
    host.removeChild(child);
  });

  it("ignores a statically positioned element even if it's large", () => {
    const el = document.createElement("div");
    el.style.position = "static";
    el.getBoundingClientRect = () => makeDOMRect(0, 0, 200, 200);
    document.body.appendChild(el);
    stubElementsFromPoint([el]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("ignores a hidden element (display: none)", () => {
    const el = fixedEl();
    el.style.display = "none";
    stubElementsFromPoint([el]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("ignores a tiny element", () => {
    const el = fixedEl({ width: 1, height: 1 });
    stubElementsFromPoint([el]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-right");
  });

  it("treats a sticky element the same as a fixed one", () => {
    const el = document.createElement("div");
    el.style.position = "sticky";
    el.getBoundingClientRect = () => makeDOMRect(0, 0, 48, 48);
    document.body.appendChild(el);
    stubElementsFromPoint([el]);
    expect(pickAvoidingPosition("bottom-right", host)).toBe("bottom-left");
  });
});
