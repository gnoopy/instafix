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

  it("reads file:line from the fiber's _debugSource and trims the path (React ≤18 dev builds)", () => {
    const el = document.createElement("button");
    attachFiber(el, {
      _debugSource: { fileName: "/Users/dev/app/src/components/ContactForm.tsx", lineNumber: 38 },
      type: "button",
      _debugOwner: { type: function EmailField() {} },
    });

    const hint = getSourceHint(el);
    expect(hint).not.toBeNull();
    expect(hint!.location).toBe("app/src/components/ContactForm.tsx:38");
    expect(hint!.componentPath).toBe("EmailField");
  });

  it("falls back to the owner-chain component path when _debugSource is gone (React 19)", () => {
    // The live-verified shape on Next 14 / React 19: no _debugSource
    // anywhere, but authored component names up the owner chain.
    const el = document.createElement("button");
    attachFiber(el, {
      type: "button",
      _debugOwner: {
        type: {}, // anonymous wrapper object — skipped
        _debugOwner: {
          type: function PasswordField() {},
          _debugOwner: {
            type: function AccountKeyBootstrap() {},
            _debugOwner: { type: function InnerLayoutRouter() {} }, // framework noise — filtered
          },
        },
      },
    });

    const hint = getSourceHint(el);
    expect(hint).not.toBeNull();
    expect(hint!.location).toBeNull();
    expect(hint!.componentPath).toBe("PasswordField ‹ AccountKeyBootstrap");
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
    expect(hint!.componentPath).toBe("Card");
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
