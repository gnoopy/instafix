import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { computeAutoScrollDelta } from "../../src/dom/auto-scroll.js";

describe("computeAutoScrollDelta", () => {
  it("is zero when the pointer is well inside the viewport", () => {
    expect(computeAutoScrollDelta(500, 400, 1000, 800)).toEqual({ dx: 0, dy: 0 });
  });

  it("scrolls up/left (negative) near the top/left edge", () => {
    const delta = computeAutoScrollDelta(10, 5, 1000, 800);
    expect(delta.dx).toBeLessThan(0);
    expect(delta.dy).toBeLessThan(0);
  });

  it("scrolls down/right (positive) near the bottom/right edge", () => {
    const delta = computeAutoScrollDelta(995, 795, 1000, 800);
    expect(delta.dx).toBeGreaterThan(0);
    expect(delta.dy).toBeGreaterThan(0);
  });

  it("reaches max speed exactly at the edge", () => {
    const delta = computeAutoScrollDelta(0, 0, 1000, 800, { edgeMargin: 48, maxSpeed: 18 });
    expect(delta.dx).toBe(-18);
    expect(delta.dy).toBe(-18);
  });

  it("respects a custom edge margin and max speed", () => {
    expect(computeAutoScrollDelta(30, 400, 1000, 800, { edgeMargin: 20, maxSpeed: 5 })).toEqual({ dx: 0, dy: 0 });
    const delta = computeAutoScrollDelta(0, 400, 1000, 800, { edgeMargin: 20, maxSpeed: 5 });
    expect(delta.dx).toBe(-5);
  });

  it("never exceeds maxSpeed in either direction for any pointer position (property)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 2000 }),
        fc.integer({ min: -100, max: 2000 }),
        fc.integer({ min: 200, max: 4000 }),
        fc.integer({ min: 200, max: 4000 }),
        (x, y, w, h) => {
          const { dx, dy } = computeAutoScrollDelta(x, y, w, h);
          expect(Math.abs(dx)).toBeLessThanOrEqual(18);
          expect(Math.abs(dy)).toBeLessThanOrEqual(18);
        },
      ),
    );
  });
});
