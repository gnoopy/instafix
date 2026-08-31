/**
 * Pure edge-autoscroll math for G3 "viewport edge 자동 스크롤" — kept
 * separate from the drag loop so the speed curve is unit-testable without a
 * real DOM/rAF loop. The caller drives an interval/rAF that calls
 * `window.scrollBy(delta.dx, delta.dy)` while a pointer sits near an edge.
 */

export interface AutoScrollDelta {
  dx: number;
  dy: number;
}

export interface AutoScrollOptions {
  /** Distance from the edge (px) where autoscroll starts ramping up. */
  edgeMargin?: number;
  /** Max scroll speed (px per tick) at the very edge. */
  maxSpeed?: number;
}

const DEFAULT_EDGE_MARGIN = 48;
const DEFAULT_MAX_SPEED = 18;

/** Signed ramp for one axis: 0 in the middle, growing to ±maxSpeed at the edge. */
function axisDelta(pos: number, size: number, edgeMargin: number, maxSpeed: number): number {
  if (pos < edgeMargin) {
    const intensity = Math.min(1, (edgeMargin - pos) / edgeMargin);
    return -Math.ceil(intensity * maxSpeed);
  }
  if (pos > size - edgeMargin) {
    const intensity = Math.min(1, (pos - (size - edgeMargin)) / edgeMargin);
    return Math.ceil(intensity * maxSpeed);
  }
  return 0;
}

/**
 * Compute the per-tick scroll delta for a pointer at (clientX, clientY)
 * within a viewport of (viewportW, viewportH). Zero on both axes when the
 * pointer isn't near an edge.
 */
export function computeAutoScrollDelta(
  clientX: number,
  clientY: number,
  viewportW: number,
  viewportH: number,
  options: AutoScrollOptions = {},
): AutoScrollDelta {
  const edgeMargin = options.edgeMargin ?? DEFAULT_EDGE_MARGIN;
  const maxSpeed = options.maxSpeed ?? DEFAULT_MAX_SPEED;
  return {
    dx: axisDelta(clientX, viewportW, edgeMargin, maxSpeed),
    dy: axisDelta(clientY, viewportH, edgeMargin, maxSpeed),
  };
}
