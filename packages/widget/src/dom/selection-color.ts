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
import { parseRgb, relativeLuminance, sampleBackgroundIsLight } from "./background-contrast.js";

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
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Exported for direct unit testing — not otherwise part of the module's public surface. */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  const toHex = (v: number): string => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** 0-180 — the shorter way around the wheel between two hues. Exported for direct unit testing. */
export function circularHueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * WCAG 1.4.11 non-text contrast — the minimum ratio a UI indicator needs
 * against the surface it sits on. A hue picked purely by wheel distance can
 * still be invisible in practice: yellow at l=0.52 over a white page is a
 * maximally-distinct HUE with near-zero LUMINANCE contrast.
 */
const MIN_BACKGROUND_CONTRAST = 3;
const LIGHTNESS_STEP = 0.03;
const MIN_LIGHTNESS = 0.22;
const MAX_LIGHTNESS = 0.78;

function contrastRatio(lumA: number, lumB: number): number {
  const hi = Math.max(lumA, lumB);
  const lo = Math.min(lumA, lumB);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Walk the lightness away from the page background (darker on a light page,
 * lighter on a dark one) until the color clears `MIN_BACKGROUND_CONTRAST`
 * against it, keeping the chosen hue intact. Clamped to a range that still
 * reads as a vivid "signal" tone rather than near-black/near-white.
 * Exported for direct unit testing.
 */
export function adjustLightnessForBackground(h: number, s: number, startL: number, backgroundIsLight: boolean): number {
  // The worst realistic case, not the average one: a white (lum 1) or
  // near-black (lum 0) page surface.
  const bgLum = backgroundIsLight ? 1 : 0;
  const step = backgroundIsLight ? -LIGHTNESS_STEP : LIGHTNESS_STEP;
  let l = startL;
  while (l >= MIN_LIGHTNESS && l <= MAX_LIGHTNESS) {
    const { r, g, b } = hslToRgb(h, s, l);
    if (contrastRatio(relativeLuminance(r, g, b), bgLum) >= MIN_BACKGROUND_CONTRAST) return l;
    l += step;
  }
  return backgroundIsLight ? MIN_LIGHTNESS : MAX_LIGHTNESS;
}

/**
 * Is the page behind the widget light or dark? Prefers a real sample at the
 * viewport center (through `sampleBackgroundIsLight`, which needs the shadow
 * host to hide); falls back to the body/html computed background, then to
 * "light" — the browser's own canvas is white in every engine.
 */
function samplePageBackgroundIsLight(hostToIgnore?: HTMLElement): boolean {
  if (hostToIgnore) {
    const sampled = sampleBackgroundIsLight(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2),
      hostToIgnore,
    );
    if (sampled !== null) return sampled;
  }
  for (const el of [document.body, document.documentElement]) {
    if (!el) continue;
    const parsed = parseRgb(getComputedStyle(el).backgroundColor);
    if (parsed && parsed.a > 0.5) return relativeLuminance(parsed.r, parsed.g, parsed.b) > 0.5;
  }
  return true;
}

/**
 * Sample the host page's own visible buttons/links and pick a hue that's
 * maximally distinct from all of them. Fails closed (returns null) on any
 * error or when nothing chromatic is found — same discipline as
 * `background-contrast.ts`'s `sampleBackgroundIsLight`: an uncaught throw
 * here must never break the host page.
 */
export function detectSelectionColor(hostToIgnore?: HTMLElement): SelectionColorResult | null {
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

    // Hue distance alone doesn't guarantee visibility — pull the lightness
    // away from the page background until the color actually clears WCAG
    // non-text contrast against it (a light page darkens yellows toward
    // amber, a dark page lifts deep blues, etc).
    const backgroundIsLight = samplePageBackgroundIsLight(hostToIgnore);
    const lightness = adjustLightnessForBackground(bestHue, SIGNAL_SATURATION, SIGNAL_LIGHTNESS, backgroundIsLight);
    return { hex: hslToHex(bestHue, SIGNAL_SATURATION, lightness) };
  } catch {
    return null;
  }
}
