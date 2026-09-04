/**
 * DOM/CSSOM snapshot of an annotated element — the "what am I actually
 * looking at" context an agent needs and a CSS selector alone cannot give.
 *
 * Competing tools read this out of the React fiber tree, which is why they
 * only work on React. Everything here comes from the DOM and the CSSOM, so
 * it works on any framework or none — the same property that lets the widget
 * itself drop into a jQuery page.
 *
 * Read at selection time, on the LIVE element, so a hover- or
 * animation-dependent value is captured as the user actually saw it. Pair it
 * with `dom/freeze.ts` and even a state that only exists mid-transition is
 * recorded accurately.
 */

import type { AnnotationInspect } from "@instafix/core";

/** Depth of the ancestor chain. Enough to place an element in a page; short enough to stay readable in a prompt. */
const MAX_DEPTH = 8;

/** Classes listed per element in the DOM path. Utility-CSS pages routinely have 30+; the first few identify it. */
const MAX_CLASSES = 3;

/**
 * Properties worth handing to an agent, grouped by the question they answer:
 * how is it laid out, how big is it, what does it look like, what type is it.
 *
 * Deliberately curated rather than dumped: `getComputedStyle` exposes ~340
 * longhand properties, almost all of them defaults, and burying six useful
 * values in that is worse than not sending them. These are the ones a UI fix
 * actually turns on.
 */
const CAPTURED_PROPERTIES = [
  // Box + layout
  "display",
  "position",
  "width",
  "height",
  "padding",
  "margin",
  "gap",
  "flex-direction",
  "align-items",
  "justify-content",
  "grid-template-columns",
  // Appearance
  "color",
  "background-color",
  "border",
  "border-radius",
  "box-shadow",
  "opacity",
  // Typography
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "text-align",
  // State-ish
  "overflow",
  "z-index",
  "visibility",
] as const;

/**
 * Values that carry no information — the CSS initial value for that property.
 * Dropping them is what keeps the captured set to the handful that were
 * actually authored rather than 25 lines of `normal` / `none` / `auto`.
 */
const NOISE = new Set(["none", "normal", "auto", "0px", "0px 0px", "rgba(0, 0, 0, 0)", "visible", "static", "1"]);

/** `button.btn.btn-primary`, `div#app`, `section` — compact and pasteable back into a selector. */
function describe(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = Array.from(element.classList)
    .slice(0, MAX_CLASSES)
    .map((c) => `.${c}`)
    .join("");
  return `${tag}${id}${classes}`;
}

/**
 * Ancestor chain, outermost first, ending with the element itself. Stops at
 * `<body>` — everything above it is the same on every page and would only
 * spend prompt budget.
 */
function buildDomPath(element: Element): string[] {
  const path: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body && current !== document.documentElement && path.length < MAX_DEPTH) {
    path.unshift(describe(current));
    current = current.parentElement;
  }
  return path;
}

/**
 * Capture the snapshot. Returns null when there is nothing useful to say —
 * a caller can then omit the field entirely rather than persisting an empty
 * object. Never throws: this is context, and losing the whole feedback
 * because a style read failed would be a bad trade.
 */
export function inspectElement(element: Element, component?: string): AnnotationInspect | null {
  try {
    if (typeof getComputedStyle !== "function") return null;
    const computed = getComputedStyle(element);
    const styles: Record<string, string> = {};
    for (const property of CAPTURED_PROPERTIES) {
      const value = computed.getPropertyValue(property).trim();
      if (!value || NOISE.has(value)) continue;
      styles[property] = value;
    }

    const domPath = buildDomPath(element);
    if (domPath.length === 0 && Object.keys(styles).length === 0) return null;

    return {
      domPath,
      styles,
      ...(component ? { component } : {}),
    };
  } catch {
    return null;
  }
}
