/**
 * Detects whether the page content actually rendered behind a given viewport
 * point reads as light or dark — used to auto-contrast the FAB/toolbar
 * against whatever the host page's background happens to be there (G8).
 * A fixed-position widget can end up over very different content as the
 * page scrolls, so this is meant to be re-sampled, not computed once.
 */

/** WCAG relative luminance — https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Parses `rgb(...)` / `rgba(...)` from a computed style value — null for anything else ("transparent", a gradient, etc). */
function parseRgb(value: string): { r: number; g: number; b: number; a: number } | null {
  const match = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (!match) return null;
  const [, r, g, b, a] = match;
  if (r === undefined || g === undefined || b === undefined) return null;
  return { r: Number(r), g: Number(g), b: Number(b), a: a === undefined ? 1 : Number(a) };
}

/** Above this luminance the sampled background reads as "light" (dark UI wins contrast); at or below, "dark" (light UI wins). */
const LIGHT_THRESHOLD = 0.5;

/**
 * Walks up from the element at `(x, y)` to find the nearest ancestor with an
 * opaque-enough `background-color`, temporarily hiding `hostToIgnore` (our
 * own shadow host, which would otherwise be the topmost hit at that point)
 * so the sample reflects the actual page content underneath. Synchronous —
 * the hide/restore happens within one JS tick, so nothing visibly flickers
 * (the same technique `annotator.ts` uses to hit-test through its overlay).
 *
 * Returns `null` when there's nothing to sample (no `elementFromPoint`
 * support, or no element at that point) — callers should leave the default
 * styling in place rather than guess.
 */
export function sampleBackgroundIsLight(x: number, y: number, hostToIgnore: HTMLElement): boolean | null {
  if (typeof document.elementFromPoint !== "function") return null;

  // Wired into scroll/resize listeners (fab.ts) — an uncaught throw here
  // (host page quirk, hostile CSS, whatever) would break the HOST page's own
  // scroll handling, not just ours. Fail closed to "nothing sampled" instead.
  try {
    const previousVisibility = hostToIgnore.style.visibility;
    hostToIgnore.style.visibility = "hidden";
    let el: Element | null;
    try {
      el = document.elementFromPoint(x, y);
    } finally {
      hostToIgnore.style.visibility = previousVisibility;
    }
    if (!el) return null;

    let current: Element | null = el;
    while (current) {
      const parsed = parseRgb(getComputedStyle(current).backgroundColor);
      if (parsed && parsed.a > 0.5) {
        return relativeLuminance(parsed.r, parsed.g, parsed.b) > LIGHT_THRESHOLD;
      }
      current = current.parentElement;
    }
    // Nothing opaque up the whole ancestor chain — the browser's own canvas
    // shows through, which is white in every engine.
    return true;
  } catch {
    return null;
  }
}
