// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectMarqueeElements } from "../../src/dom/marquee.js";
import { makeDOMRect } from "../helpers.js";

function stubRect(el: HTMLElement, rect: { x: number; y: number; width: number; height: number }): void {
  el.getBoundingClientRect = () => makeDOMRect(rect.x, rect.y, rect.width, rect.height);
}

/** A grid of `elementFromPoint` results keyed by rounded (x,y) — the test's stand-in for real hit-testing. */
function gridStub(cells: Map<string, Element>): (x: number, y: number) => Element | null {
  return (x, y) => {
    // Nearest-registered-cell lookup: find any registered point within the
    // caller's grid spacing so the marquee's sampled points (which land
    // between explicit cell centers) still resolve to the right element.
    let best: Element | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const [key, el] of cells) {
      const [cx, cy] = key.split(",").map(Number) as [number, number];
      const d = (cx - x) ** 2 + (cy - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }
    return best;
  };
}

describe("collectMarqueeElements", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("returns a single element when the marquee only covers it", () => {
    const button = document.createElement("button");
    container.appendChild(button);
    stubRect(button, { x: 0, y: 0, width: 100, height: 40 });

    const cells = new Map([["50,20", button]]);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 100, 40), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toEqual([button]);
  });

  it("collects multiple distinct elements intersecting the drag rect", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    container.appendChild(a);
    container.appendChild(b);
    stubRect(a, { x: 0, y: 0, width: 50, height: 50 });
    stubRect(b, { x: 200, y: 0, width: 50, height: 50 });

    const cells = new Map([
      ["25,25", a],
      ["225,25", b],
    ]);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 260, 50), {
      elementFromPoint: gridStub(cells),
      gridSize: 8,
    });

    expect(result).toContain(a);
    expect(result).toContain(b);
    expect(result).toHaveLength(2);
  });

  it("keeps the ancestor when the marquee matches its size (a card, not its inner text)", () => {
    // Regression test for the "drag over a whole card, only the heading gets
    // selected" bug: a few grid samples land on a small heading/badge inside
    // the card, but the user's drawn rect matches the CARD's size, not the
    // heading's — so the card must win, not the incidentally-sampled text.
    const card = document.createElement("div");
    const heading = document.createElement("h3");
    card.appendChild(heading);
    container.appendChild(card);
    stubRect(card, { x: 0, y: 0, width: 200, height: 100 });
    stubRect(heading, { x: 20, y: 20, width: 40, height: 20 });

    const cells = new Map<string, Element>();
    cells.set("30,30", heading);
    cells.set("150,80", card);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 200, 100), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toContain(card);
    expect(result).not.toContain(heading);
  });

  it("keeps the descendant when the marquee is drawn tightly around it, not the ancestor", () => {
    // The mirror case: the user deliberately drew a small rect around just
    // the heading — its (modestly larger) container, incidentally also
    // sampled at the rect's edge, must not steal the selection just because
    // it contains it — the heading is still the closest size match.
    const container2 = document.createElement("div");
    const heading = document.createElement("h3");
    container2.appendChild(heading);
    container.appendChild(container2);
    stubRect(container2, { x: 10, y: 10, width: 80, height: 40 });
    stubRect(heading, { x: 18, y: 18, width: 44, height: 24 });

    const cells = new Map<string, Element>();
    cells.set("30,30", heading);
    cells.set("62,42", container2); // one stray sample near the small rect's edge
    const result = collectMarqueeElements(makeDOMRect(18, 18, 44, 24), {
      elementFromPoint: gridStub(cells),
      gridSize: 3,
    });

    expect(result).toContain(heading);
    expect(result).not.toContain(container2);
  });

  it("drops a redundant wrapper chain, keeping only the innermost element", () => {
    // Several near-identical-sized wrapper divs around one button, marquee
    // drawn tightly around the button itself — the button's area is the
    // closest match to the drawn rect, so it wins over its ancestor divs
    // even though they were also incidentally sampled at the edges.
    const outer = document.createElement("div");
    const middle = document.createElement("div");
    const button = document.createElement("button");
    middle.appendChild(button);
    outer.appendChild(middle);
    container.appendChild(outer);
    stubRect(outer, { x: 0, y: 0, width: 104, height: 44 });
    stubRect(middle, { x: 1, y: 1, width: 102, height: 42 });
    stubRect(button, { x: 2, y: 2, width: 100, height: 40 });

    const cells = new Map<string, Element>([
      ["2,2", outer],
      ["50,20", button],
      ["100,40", middle],
    ]);
    const result = collectMarqueeElements(makeDOMRect(2, 2, 100, 40), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toEqual([button]);
  });

  it("excludes widget chrome elements", () => {
    const chrome = document.createElement("div");
    chrome.setAttribute("data-instafix-ignore", "true");
    container.appendChild(chrome);
    stubRect(chrome, { x: 0, y: 0, width: 100, height: 100 });

    const cells = new Map([["50,50", chrome]]);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 100, 100), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toEqual([]);
  });

  it("drops an oversized wrapper that isn't fully contained in the marquee", () => {
    const wrapper = document.createElement("section");
    container.appendChild(wrapper);
    // Wrapper spans far beyond the small marquee — a layout container the
    // grid sampled through, not something the user meant to select.
    stubRect(wrapper, { x: 0, y: 0, width: 2000, height: 2000 });

    const cells = new Map([["25,25", wrapper]]);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 50, 50), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toEqual([]);
  });

  it("keeps a fully-contained element even if it happens to be large", () => {
    const el = document.createElement("div");
    container.appendChild(el);
    stubRect(el, { x: 10, y: 10, width: 80, height: 80 });

    const cells = new Map([["50,50", el]]);
    const result = collectMarqueeElements(makeDOMRect(0, 0, 100, 100), {
      elementFromPoint: gridStub(cells),
    });

    expect(result).toEqual([el]);
  });

  it("returns an empty array for a zero-size rect", () => {
    const result = collectMarqueeElements(makeDOMRect(0, 0, 0, 0), { elementFromPoint: () => null });
    expect(result).toEqual([]);
  });

  it("returns an empty array when every sample point hits nothing (truly empty area)", () => {
    const result = collectMarqueeElements(makeDOMRect(0, 0, 200, 200), { elementFromPoint: () => null });
    expect(result).toEqual([]);
  });

  it("caps the number of returned elements", () => {
    const cells = new Map<string, Element>();
    const elements: HTMLElement[] = [];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      container.appendChild(el);
      stubRect(el, { x: i * 10, y: 0, width: 8, height: 8 });
      cells.set(`${i * 10 + 4},4`, el);
      elements.push(el);
    }

    const result = collectMarqueeElements(makeDOMRect(0, 0, 300, 10), {
      elementFromPoint: gridStub(cells),
      gridSize: 20,
      maxElements: 20,
    });

    expect(result.length).toBeLessThanOrEqual(20);
  });
});
