import type { InstaFixPosition } from "@instafix/core";

// Matches the FAB's own CSS (see styles/base.ts: `.sp-fab` + `.sp-fab--bottom-*`)
// — this is the point the FAB's center lands on for a given corner.
const FAB_MARGIN = 24;
const FAB_SIZE = 52;

function isCornerOccupied(corner: InstaFixPosition, hostToIgnore: Element): boolean {
  if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") return false;

  const x = corner === "bottom-right" ? window.innerWidth - FAB_MARGIN - FAB_SIZE / 2 : FAB_MARGIN + FAB_SIZE / 2;
  const y = window.innerHeight - FAB_MARGIN - FAB_SIZE / 2;
  if (x < 0 || y < 0) return false;

  return document.elementsFromPoint(x, y).some((el) => {
    if (el === hostToIgnore || hostToIgnore.contains(el)) return false;
    if (el === document.documentElement || el === document.body) return false;

    const style = getComputedStyle(el);
    if (style.position !== "fixed" && style.position !== "sticky") return false;
    if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity) === 0) {
      return false;
    }

    const rect = el.getBoundingClientRect();
    return rect.width > 4 && rect.height > 4;
  });
}

/**
 * Generic corner-collision avoidance for the FAB: reports which bottom
 * corner InstaFix should use so it doesn't render on top of some other
 * fixed/sticky element the host page already anchored at `preferred`. Never
 * inspects an element's identity (id/class/selector) — only whether
 * *something* sizeable and visible already occupies that exact spot — so it
 * treats a chat bubble, a deploy-preview toolbar, a cookie banner, and any
 * other feedback widget identically. Falls back to `preferred` when there's
 * no conflict, or when the other corner is occupied too.
 */
export function pickAvoidingPosition(preferred: InstaFixPosition, hostToIgnore: Element): InstaFixPosition {
  if (!isCornerOccupied(preferred, hostToIgnore)) return preferred;
  const fallback: InstaFixPosition = preferred === "bottom-right" ? "bottom-left" : "bottom-right";
  return isCornerOccupied(fallback, hostToIgnore) ? preferred : fallback;
}
