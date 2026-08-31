// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectTextSelection } from "../../src/dom/text-selection.js";
import { makeDOMRect } from "../helpers.js";

const STUB_RECT = makeDOMRect(10, 10, 100, 20);

/** Build a `caretRangeFromPoint` stand-in that resolves a fake (x) to a fixed offset into `textNode`. */
function caretAt(textNode: Text, offset: number): Range {
  const r = document.createRange();
  r.setStart(textNode, offset);
  r.setEnd(textNode, offset);
  return r;
}

describe("detectTextSelection", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("p");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("builds a text target from two caret points spanning a substring", () => {
    const text = document.createTextNode("please click here to continue reading this paragraph of prose");
    container.appendChild(text);

    // "click here" starts at index 7, ends at 17.
    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 7) : caretAt(text, 17)),
      getRangeRect: () => STUB_RECT,
    });

    expect(result).not.toBeNull();
    expect(result?.quote).toBe("click here");
    expect(result?.quotePrefix.endsWith("please ")).toBe(true);
    expect(result?.quoteSuffix.startsWith(" to continue")).toBe(true);
    expect(result?.container).toBe(container);
  });

  it("produces the same forward selection regardless of drag direction", () => {
    const text = document.createTextNode("one two three four five");
    container.appendChild(text);
    // "two three" = indices 4..13

    const forward = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 4) : caretAt(text, 13)),
      getRangeRect: () => STUB_RECT,
    });
    const reversed = detectTextSelection(10, 0, 0, 0, {
      caretRangeFromPoint: (x) => (x === 10 ? caretAt(text, 13) : caretAt(text, 4)),
      getRangeRect: () => STUB_RECT,
    });

    expect(forward?.quote).toBe("two three");
    expect(reversed?.quote).toBe("two three");
  });

  it("returns null when the browser doesn't support caret-from-point APIs", () => {
    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: () => null,
      getRangeRect: () => STUB_RECT,
    });
    expect(result).toBeNull();
  });

  it("returns null for a collapsed/whitespace-only selection", () => {
    const text = document.createTextNode("a    b");
    container.appendChild(text);

    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 1) : caretAt(text, 5)),
      getRangeRect: () => STUB_RECT,
    });
    expect(result).toBeNull();
  });

  it("stays an element target — returns null — when the text sits inside a button", () => {
    const button = document.createElement("button");
    const text = document.createTextNode("Save changes");
    button.appendChild(text);
    container.appendChild(button);

    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 0) : caretAt(text, 4)),
      getRangeRect: () => STUB_RECT,
    });
    expect(result).toBeNull();
  });

  it("returns null when the range has no rendered geometry", () => {
    const text = document.createTextNode("some visible text here");
    container.appendChild(text);

    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 0) : caretAt(text, 4)),
      getRangeRect: () => makeDOMRect(0, 0, 0, 0),
    });
    expect(result).toBeNull();
  });

  it("truncates a very long quote instead of storing it unbounded", () => {
    const long = "x".repeat(2000);
    const text = document.createTextNode(long);
    container.appendChild(text);

    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 0) : caretAt(text, 2000)),
      getRangeRect: () => STUB_RECT,
    });
    expect(result?.quote.length).toBe(500);
  });

  it("caps prefix/suffix context to ~32 characters", () => {
    const text = document.createTextNode(`${"a".repeat(100)}TARGET${"b".repeat(100)}`);
    container.appendChild(text);

    const result = detectTextSelection(0, 0, 10, 0, {
      caretRangeFromPoint: (x) => (x === 0 ? caretAt(text, 100) : caretAt(text, 106)),
      getRangeRect: () => STUB_RECT,
    });
    expect(result?.quote).toBe("TARGET");
    expect(result?.quotePrefix.length).toBe(32);
    expect(result?.quoteSuffix.length).toBe(32);
  });
});
