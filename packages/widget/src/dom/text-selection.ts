/**
 * Text-Range selection detection — G3. Dragging across text produces a
 * `text`-kind target instead of an `element`/marquee one. Rather than
 * relying on the browser's native selection (which would require handing
 * pointer control to the underlying page and fighting the marquee overlay
 * for the same gesture — the exact mode conflict GOAL.md calls out),
 * this synthesizes a `Range` from the drag's start/end points via
 * `caretRangeFromPoint`/`caretPositionFromPoint`. Both gestures can then
 * share one drag with no separate "text mode" toggle: the heuristic below
 * decides after the fact.
 */

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"], [role="link"], svg';

/** Max chars kept for the quote / prefix / suffix — mirrors the server-side caps. */
const MAX_QUOTE_LEN = 500;
const MAX_CONTEXT_LEN = 32;

export interface TextSelectionResult {
  /** Nearest Element ancestor of the selected text — the target's anchor. */
  container: Element;
  quote: string;
  quotePrefix: string;
  quoteSuffix: string;
  /** Bounding rect of the selected range, viewport-relative. */
  rect: DOMRect;
}

export interface DetectTextSelectionOptions {
  /** Injectable for tests — defaults to `document.caretRangeFromPoint`. */
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  doc?: Document;
  /** Injectable for tests — defaults to `range.getBoundingClientRect()` (jsdom has no layout engine, so it always returns a zero rect). */
  getRangeRect?: (range: Range) => DOMRect;
}

function isInteractiveContext(el: Element | null): boolean {
  if (!el) return false;
  return el.closest(INTERACTIVE_SELECTOR) !== null;
}

/** Flat character offset of (node, offset) relative to the start of `container`. */
function flatOffset(doc: Document, container: Node, node: Node, offset: number): number {
  const r = doc.createRange();
  r.setStart(container, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

/**
 * Detect whether a drag from (startX, startY) to (endX, endY) selected text,
 * and if so, build its target data. Returns `null` when the browser doesn't
 * support caret-from-point APIs, either endpoint misses text entirely, the
 * text sits inside interactive chrome (a button/link — those should stay
 * `element` targets, not be reinterpreted as prose), or the selection is
 * empty/whitespace-only.
 */
export function detectTextSelection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: DetectTextSelectionOptions = {},
): TextSelectionResult | null {
  const doc = options.doc ?? document;
  const caretFn =
    options.caretRangeFromPoint ??
    ((x: number, y: number) =>
      (doc as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }).caretRangeFromPoint?.(
        x,
        y,
      ) ?? null);

  const startCaret = caretFn(startX, startY);
  const endCaret = caretFn(endX, endY);
  if (!startCaret || !endCaret) return null;

  const range = doc.createRange();
  if (startCaret.compareBoundaryPoints(Range.START_TO_START, endCaret) <= 0) {
    range.setStart(startCaret.startContainer, startCaret.startOffset);
    range.setEnd(endCaret.startContainer, endCaret.startOffset);
  } else {
    range.setStart(endCaret.startContainer, endCaret.startOffset);
    range.setEnd(startCaret.startContainer, startCaret.startOffset);
  }

  const quote = range.toString().trim();
  if (!quote) return null;

  const commonAncestor = range.commonAncestorContainer;
  const container =
    commonAncestor.nodeType === Node.ELEMENT_NODE ? (commonAncestor as Element) : commonAncestor.parentElement;
  if (!container) return null;
  if (isInteractiveContext(container)) return null;

  const containerText = container.textContent ?? "";
  const startFlat = flatOffset(doc, container, range.startContainer, range.startOffset);
  const endFlat = flatOffset(doc, container, range.endContainer, range.endOffset);

  const quotePrefix = containerText.slice(Math.max(0, startFlat - MAX_CONTEXT_LEN), startFlat);
  const quoteSuffix = containerText.slice(endFlat, endFlat + MAX_CONTEXT_LEN);

  const getRangeRect = options.getRangeRect ?? ((r: Range) => r.getBoundingClientRect());
  let rect: DOMRect;
  try {
    rect = getRangeRect(range);
  } catch {
    return null;
  }
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;

  return {
    container,
    quote: quote.slice(0, MAX_QUOTE_LEN),
    quotePrefix,
    quoteSuffix,
    rect,
  };
}
