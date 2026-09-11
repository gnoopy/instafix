// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { markerPosition } from "../../src/markers.js";

describe("markerPosition", () => {
  it("keeps the default marker centred on the anchor's top-right corner", () => {
    expect(markerPosition(new DOMRect(100, 50, 40, 20))).toEqual({ top: 37, left: 127 });
  });

  it("puts an inside-start marker inside the anchor and never above the page top", () => {
    expect(markerPosition(new DOMRect(100, 50, 40, 20), "inside-start")).toEqual({ top: 52, left: 102 });
    // An anchor in a title bar at the very top of the page stays on the page.
    expect(markerPosition(new DOMRect(8, -4, 40, 24), "inside-start")).toEqual({ top: 0, left: 10 });
  });
});
