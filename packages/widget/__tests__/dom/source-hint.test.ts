// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { getSourceHint } from "../../src/dom/source-hint.js";

/** Attach a fake dev-build React fiber to an element, the way react-dom does. */
function attachFiber(el: Element, fiber: object): void {
  (el as unknown as Record<string, object>)[`__reactFiber$${Math.random().toString(36).slice(2)}`] = fiber;
}

describe("getSourceHint", () => {
  it("returns null for a plain element (production build / non-React host)", () => {
    expect(getSourceHint(document.createElement("div"))).toBeNull();
  });

  it("reads file:line from the fiber's _debugSource and trims the path", () => {
    const el = document.createElement("button");
    attachFiber(el, {
      _debugSource: { fileName: "/Users/dev/app/src/components/ContactForm.tsx", lineNumber: 38 },
      type: "button",
      _debugOwner: { type: function EmailField() {} },
    });

    const hint = getSourceHint(el);
    expect(hint).not.toBeNull();
    expect(hint!.location).toBe("app/src/components/ContactForm.tsx:38");
    expect(hint!.componentName).toBe("EmailField");
  });

  it("walks up the owner chain when the host fiber itself has no source", () => {
    const el = document.createElement("div");
    attachFiber(el, {
      type: "div",
      _debugOwner: {
        type: function Card() {},
        _debugSource: { fileName: "webpack-internal:///./components/Card.tsx", lineNumber: 12 },
      },
    });

    const hint = getSourceHint(el);
    expect(hint!.location).toBe("components/Card.tsx:12");
    expect(hint!.componentName).toBe("Card");
  });

  it("never throws on hostile fiber shapes", () => {
    const el = document.createElement("div");
    attachFiber(el, {
      get _debugSource(): never {
        throw new Error("boom");
      },
    });
    expect(getSourceHint(el)).toBeNull();
  });
});
