// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { relativeLuminance } from "../../src/dom/background-contrast.js";
import {
  adjustLightnessForBackground,
  circularHueDistance,
  detectSelectionColor,
  hslToHex,
  hslToRgb,
  rgbToHsl,
} from "../../src/dom/selection-color.js";
import { makeDOMRect } from "../helpers.js";

function stubRect(el: HTMLElement, rect: { x: number; y: number; width: number; height: number }): void {
  el.getBoundingClientRect = () => makeDOMRect(rect.x, rect.y, rect.width, rect.height);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

describe("rgbToHsl / hslToHex", () => {
  it("round-trips a saturated color", () => {
    const { h, s, l } = rgbToHsl(23, 60, 255); // #173CFF-ish, a vivid blue
    expect(h).toBeGreaterThan(220);
    expect(h).toBeLessThan(240);
    expect(s).toBeGreaterThan(0.9);
    const hex = hslToHex(h, s, l);
    const { r: r2, g: g2, b: b2 } = hexToRgb(hex);
    const back = rgbToHsl(r2, g2, b2);
    expect(circularHueDistance(back.h, h)).toBeLessThan(5);
  });

  it("treats pure gray as zero saturation regardless of lightness", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 128 / 255 });
    expect(rgbToHsl(0, 0, 0).s).toBe(0);
    expect(rgbToHsl(255, 255, 255).s).toBe(0);
  });

  it("hslToHex(0, s, l) produces pure red", () => {
    expect(hslToHex(0, 1, 0.5).toLowerCase()).toBe("#ff0000");
  });
});

describe("adjustLightnessForBackground", () => {
  /** WCAG contrast ratio between a color and pure white/black. */
  function contrastVs(lum: number, bgLum: number): number {
    const hi = Math.max(lum, bgLum);
    const lo = Math.min(lum, bgLum);
    return (hi + 0.05) / (lo + 0.05);
  }

  it("darkens a yellow until it clears 3:1 against a light page", () => {
    // Yellow at l=0.52 has very high luminance — invisible on white.
    const l = adjustLightnessForBackground(50, 0.82, 0.52, true);
    expect(l).toBeLessThan(0.52);
    const { r, g, b } = hslToRgb(50, 0.82, l);
    expect(contrastVs(relativeLuminance(r, g, b), 1)).toBeGreaterThanOrEqual(3);
  });

  it("keeps a lightness that already has enough contrast", () => {
    // Yellow on a DARK page is already high-contrast — untouched.
    expect(adjustLightnessForBackground(50, 0.82, 0.52, false)).toBe(0.52);
    // A vivid blue on a LIGHT page is already dark enough — untouched.
    expect(adjustLightnessForBackground(230, 0.82, 0.52, true)).toBe(0.52);
  });

  it("lightens a deep blue against a dark page when needed", () => {
    const l = adjustLightnessForBackground(230, 0.82, 0.3, false);
    const { r, g, b } = hslToRgb(230, 0.82, l);
    expect(contrastVs(relativeLuminance(r, g, b), 0)).toBeGreaterThanOrEqual(3);
  });

  it("never leaves the vivid-signal lightness range", () => {
    expect(adjustLightnessForBackground(50, 0.82, 0.52, true)).toBeGreaterThanOrEqual(0.22);
    expect(adjustLightnessForBackground(230, 0.82, 0.52, false)).toBeLessThanOrEqual(0.78);
  });
});

describe("circularHueDistance", () => {
  it("is 0 for identical hues", () => {
    expect(circularHueDistance(120, 120)).toBe(0);
  });

  it("takes the shorter way around the wheel", () => {
    expect(circularHueDistance(10, 350)).toBe(20);
  });

  it("maxes out at 180 for opposite hues", () => {
    expect(circularHueDistance(0, 180)).toBe(180);
  });

  it("is symmetric", () => {
    expect(circularHueDistance(40, 200)).toBe(circularHueDistance(200, 40));
  });
});

describe("detectSelectionColor", () => {
  afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
  });

  it("returns null when the page has no button/link elements at all", () => {
    expect(detectSelectionColor()).toBeNull();
  });

  it("returns null when every candidate is grayscale (no chromatic host colors)", () => {
    const btn = document.createElement("button");
    btn.style.backgroundColor = "rgb(240, 240, 240)"; // near-white, low saturation
    stubRect(btn, { x: 10, y: 10, width: 80, height: 30 });
    document.body.appendChild(btn);

    expect(detectSelectionColor()).toBeNull();
  });

  it("picks a hue far from a single saturated host color (vivid blue)", () => {
    const btn = document.createElement("button");
    btn.style.backgroundColor = "rgb(23, 60, 255)"; // vivid blue, h≈229
    stubRect(btn, { x: 10, y: 10, width: 80, height: 30 });
    document.body.appendChild(btn);

    const result = detectSelectionColor();
    expect(result).not.toBeNull();
    const { h } = rgbToHsl(hexToRgb(result!.hex).r, hexToRgb(result!.hex).g, hexToRgb(result!.hex).b);
    expect(circularHueDistance(h, 229)).toBeGreaterThan(120);
  });

  it("the returned color clears 3:1 non-text contrast against a light page (yellow gets darkened)", () => {
    // jsdom has no elementFromPoint and no body background — the sampler
    // falls back to "light page". A blue-heavy host pushes the maximin
    // choice toward yellow, the worst-case hue for luminance-on-white.
    const btn = document.createElement("button");
    btn.style.backgroundColor = "rgb(23, 60, 255)";
    stubRect(btn, { x: 10, y: 10, width: 80, height: 30 });
    document.body.appendChild(btn);

    const result = detectSelectionColor();
    expect(result).not.toBeNull();
    const { r, g, b } = hexToRgb(result!.hex);
    const lum = relativeLuminance(r, g, b);
    expect((1 + 0.05) / (lum + 0.05)).toBeGreaterThanOrEqual(3);
  });

  it("falls back to a link's text color when its background is transparent", () => {
    const link = document.createElement("a");
    link.href = "#";
    link.style.backgroundColor = "transparent";
    link.style.color = "rgb(220, 38, 38)"; // vivid red text
    stubRect(link, { x: 10, y: 10, width: 60, height: 20 });
    document.body.appendChild(link);

    const result = detectSelectionColor();
    expect(result).not.toBeNull();
    const { h } = rgbToHsl(hexToRgb(result!.hex).r, hexToRgb(result!.hex).g, hexToRgb(result!.hex).b);
    expect(circularHueDistance(h, 0)).toBeGreaterThan(90); // far from red
  });

  it("a single strongly-colored element can veto a candidate near it even if it's not the dominant hue", () => {
    // 5 blue buttons + 1 red one — maximin still avoids red, not just blue.
    for (let i = 0; i < 5; i++) {
      const btn = document.createElement("button");
      btn.style.backgroundColor = "rgb(23, 60, 255)";
      stubRect(btn, { x: 10 + i * 90, y: 10, width: 80, height: 30 });
      document.body.appendChild(btn);
    }
    const deleteBtn = document.createElement("button");
    deleteBtn.style.backgroundColor = "rgb(220, 38, 38)";
    stubRect(deleteBtn, { x: 500, y: 10, width: 80, height: 30 });
    document.body.appendChild(deleteBtn);

    const result = detectSelectionColor();
    expect(result).not.toBeNull();
    const { r, g, b } = hexToRgb(result!.hex);
    const { h } = rgbToHsl(r, g, b);
    expect(circularHueDistance(h, 229)).toBeGreaterThan(90); // far from blue
    expect(circularHueDistance(h, 0)).toBeGreaterThan(90); // far from red too
  });

  it("ignores elements outside the current viewport", () => {
    const offscreen = document.createElement("button");
    offscreen.style.backgroundColor = "rgb(23, 60, 255)";
    stubRect(offscreen, { x: -5000, y: -5000, width: 80, height: 30 });
    document.body.appendChild(offscreen);

    expect(detectSelectionColor()).toBeNull();
  });

  it("ignores widget chrome elements (data-instafix-ignore)", () => {
    const chrome = document.createElement("button");
    chrome.setAttribute("data-instafix-ignore", "true");
    chrome.style.backgroundColor = "rgb(23, 60, 255)";
    stubRect(chrome, { x: 10, y: 10, width: 80, height: 30 });
    document.body.appendChild(chrome);

    expect(detectSelectionColor()).toBeNull();
  });

  it("does not throw when getComputedStyle is unavailable", () => {
    const btn = document.createElement("button");
    stubRect(btn, { x: 10, y: 10, width: 80, height: 30 });
    document.body.appendChild(btn);
    const original = window.getComputedStyle;
    window.getComputedStyle = () => {
      throw new Error("boom");
    };

    try {
      expect(detectSelectionColor()).toBeNull();
    } finally {
      window.getComputedStyle = original;
    }
  });
});
