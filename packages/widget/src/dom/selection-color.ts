/**
 * Detects a color for InstaFix's own on-page selection UI (toolbar
 * active-state, the drag/auto-target highlight outline, multi-target
 * badges) that reads as clearly distinct from the HOST APP's own
 * button/link colors — so a host using a similar blue (or whatever
 * `accentColor` happens to be) never makes it ambiguous whether an outline
 * is InstaFix's selection indicator or part of the page's own design.
 *
 * Approach: sample the hue of the host page's own interactive elements
 * (buttons/links actually visible in the viewport), then pick a hue from a
 * curated set of vivid "signal" tones — the same visual category browser
 * DevTools/annotation tools use — that maximizes the *minimum* circular
 * distance to every detected host hue (maximin), not just the most frequent
 * one: a single strongly-colored host element (e.g. a red "delete" button)
 * should be able to veto a nearby candidate even if it isn't the host's
 * dominant brand color. Returns null on a fully neutral/grayscale host —
 * there's nothing to contrast against, so callers should keep using
 * `accentColor` as-is.
 */

import { isWidgetChrome } from "../focus-tracker.js";
import { parseRgb } from "./background-contrast.js";

export interface SelectionColorResult {
  hex: string;
}

const CANDIDATE_SELECTOR = 'button, a[href], input[type="submit"], input[type="button"], [role="button"]';
/** Evenly spaced around the wheel — fine enough to land close to a true maximin optimum without per-page cost. */
const CANDIDATE_HUE_COUNT = 12;
/** Fixed tone for every candidate — vivid and legible over arbitrary host content, deliberately not derived from the host (that's the whole point). */
const SIGNAL_SATURATION = 0.82;
const SIGNAL_LIGHTNESS = 0.52;
/** Below this, a sampled color reads as gray/neutral chrome rather than a host "brand" color — excluded so borders/disabled states don't skew the result. */
const MIN_HOST_SATURATION = 0.2;
/** Bounds on a huge page — cheap enough to never be worth optimizing further. */
const MAX_ELEMENTS_SCANNED = 200;
const MAX_CHROMATIC_SAMPLES = 40;

/** Exported for direct unit testing — not otherwise part of the module's public surface. */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

/** Exported for direct unit testing — not otherwise part of the module's public surface. */
export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** 0-180 — the shorter way around the wheel between two hues. Exported for direct unit testing. */
export function circularHueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Sample the host page's own visible buttons/links and pick a hue that's
 * maximally distinct from all of them. Fails closed (returns null) on any
 * error or when nothing chromatic is found — same discipline as
 * `background-contrast.ts`'s `sampleBackgroundIsLight`: an uncaught throw
 * here must never break the host page.
 */
export function detectSelectionColor(): SelectionColorResult | null {
  if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return null;

  try {
    const hostHues: number[] = [];
    const candidates = document.querySelectorAll(CANDIDATE_SELECTOR);
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    for (let i = 0; i < candidates.length && i < MAX_ELEMENTS_SCANNED && hostHues.length < MAX_CHROMATIC_SAMPLES; i++) {
      const el = candidates[i];
      if (!el || isWidgetChrome(el)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (rect.right < 0 || rect.bottom < 0 || rect.left > viewportW || rect.top > viewportH) continue;

      const style = getComputedStyle(el);
      // A transparent-background link still carries its brand color in its
      // text — fall back to that when the background doesn't parse as opaque.
      let parsed = parseRgb(style.backgroundColor);
      if (!parsed || parsed.a <= 0.5) parsed = parseRgb(style.color);
      if (!parsed || parsed.a <= 0.5) continue;

      const { h, s } = rgbToHsl(parsed.r, parsed.g, parsed.b);
      if (s < MIN_HOST_SATURATION) continue;
      hostHues.push(h);
    }

    if (hostHues.length === 0) return null;

    let bestHue = 0;
    let bestScore = -1;
    for (let i = 0; i < CANDIDATE_HUE_COUNT; i++) {
      const candidateHue = (360 / CANDIDATE_HUE_COUNT) * i;
      let minDistance = Number.POSITIVE_INFINITY;
      for (const hostHue of hostHues) {
        const d = circularHueDistance(candidateHue, hostHue);
        if (d < minDistance) minDistance = d;
      }
      if (minDistance > bestScore) {
        bestScore = minDistance;
        bestHue = candidateHue;
      }
    }

    return { hex: hslToHex(bestHue, SIGNAL_SATURATION, SIGNAL_LIGHTNESS) };
  } catch {
    return null;
  }
}
