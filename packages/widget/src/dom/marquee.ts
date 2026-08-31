/**
 * Marquee (drag-rectangle) element collection — G3. Samples a grid of
 * points across the drawn rect via `elementFromPoint` (cheap: bounded
 * sample count, never a full-document scan) instead of testing every
 * element in the DOM against the rect.
 */

import { isWidgetChrome } from "../focus-tracker.js";
import { classifyVisibility } from "./visibility.js";

export interface MarqueeOptions {
  /** Max elements returned — a marquee over a huge page must stay bounded. */
  maxElements?: number;
  /** Sample grid resolution per axis (gridSize × gridSize points total). */
  gridSize?: number;
  /** Injectable for tests — defaults to `document.elementFromPoint`. */
  elementFromPoint?: (x: number, y: number) => Element | null;
}

const DEFAULT_MAX_ELEMENTS = 20;
const DEFAULT_GRID_SIZE = 6;
/** An element whose box exceeds this multiple of the marquee's own area, and
 * isn't fully contained by it, is a layout wrapper the grid sampled through
 * (e.g. a page-wide `<section>`) rather than something the user meant to
 * select — dropped during normalization. */
const OVERSIZE_AREA_RATIO = 4;

function samplePoints(rect: DOMRect, gridSize: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      points.push({
        x: rect.left + (rect.width * (i + 0.5)) / gridSize,
        y: rect.top + (rect.height * (j + 0.5)) / gridSize,
      });
    }
  }
  return points;
}

function isFullyContained(box: DOMRect, marquee: DOMRect): boolean {
  return (
    box.left >= marquee.left - 1 &&
    box.top >= marquee.top - 1 &&
    box.right <= marquee.right + 1 &&
    box.bottom <= marquee.bottom + 1
  );
}

function area(el: Element): number {
  const box = el.getBoundingClientRect();
  return box.width * box.height;
}

/**
 * Symmetric log-ratio distance between an element's area and the marquee's —
 * 0 when they match exactly, and equal for "half the marquee" and "double
 * the marquee" (a plain ratio would treat those very differently).
 */
function closenessToMarquee(el: Element, marqueeArea: number): number {
  return Math.abs(Math.log(area(el) / marqueeArea));
}

/**
 * Resolve ancestor/descendant conflicts in the candidate set structurally:
 * of any element and everything nested inside it, keep whichever single one's
 * bounding box area is the closest match to the marquee the user actually
 * drew — the strongest available signal for what they meant to encompass.
 *
 * This replaces a naive "always keep the most specific descendant" rule,
 * which broke down for card-like components: a marquee drawn tightly around
 * a whole card can still have a few grid samples land on a heading or badge
 * inside it, and always preferring the descendant fragmented the selection
 * down to that inner text instead of the card the user actually dragged
 * over. Processing largest-area-first and resolving each containment group
 * in one shot keeps a real wrapper-div chain (near-identical boxes all the
 * way down) collapsing to its innermost element as before, since the
 * marquee area is then closest to the innermost box.
 */
function resolveContainment(list: Element[], marqueeArea: number): Element[] {
  const sorted = [...list].sort((a, b) => area(b) - area(a));
  const dropped = new Set<Element>();

  for (const el of sorted) {
    if (dropped.has(el)) continue;
    const contained = sorted.filter((other) => other !== el && !dropped.has(other) && el.contains(other));
    if (contained.length === 0) continue;

    const group = [el, ...contained];
    let best = group[0] as Element;
    let bestScore = closenessToMarquee(best, marqueeArea);
    for (let i = 1; i < group.length; i++) {
      const candidate = group[i] as Element;
      const score = closenessToMarquee(candidate, marqueeArea);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    for (const candidate of group) {
      if (candidate !== best) dropped.add(candidate);
    }
  }

  return sorted.filter((el) => !dropped.has(el));
}

/**
 * Collect the meaningful elements a marquee rect intersects, normalized:
 * widget chrome and hidden elements excluded, oversized ancestor wrappers
 * dropped, and ancestor/descendant conflicts resolved by `resolveContainment`
 * (whichever one best matches the size of what was actually dragged). Returned
 * in document order, capped at `maxElements`.
 */
export function collectMarqueeElements(rect: DOMRect, options: MarqueeOptions = {}): Element[] {
  const maxElements = options.maxElements ?? DEFAULT_MAX_ELEMENTS;
  const gridSize = options.gridSize ?? DEFAULT_GRID_SIZE;
  // Some test environments (jsdom) don't implement elementFromPoint at all —
  // degrade to "nothing found" (callers already treat that as an empty
  // area) rather than throwing.
  const elementFromPoint =
    options.elementFromPoint ??
    (typeof document.elementFromPoint === "function" ? document.elementFromPoint.bind(document) : () => null);

  if (rect.width <= 0 || rect.height <= 0) return [];

  const candidates = new Set<Element>();
  for (const { x, y } of samplePoints(rect, gridSize)) {
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
    const el = elementFromPoint(x, y);
    if (!el) continue;
    if (el === document.documentElement || el === document.body) continue;
    if (isWidgetChrome(el)) continue;
    candidates.add(el);
  }

  const marqueeArea = rect.width * rect.height;
  let list = [...candidates].filter((el) => {
    if (classifyVisibility(el) === "hidden") return false;
    const box = el.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return false;
    const area = box.width * box.height;
    if (!isFullyContained(box, rect) && area > marqueeArea * OVERSIZE_AREA_RATIO) return false;
    return true;
  });

  list = resolveContainment(list, marqueeArea);

  list.sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  return list.slice(0, maxElements);
}
