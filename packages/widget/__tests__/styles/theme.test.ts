import { describe, expect, it } from "vitest";
import { hslToRgb, LAYER_PALETTES } from "../../src/dom/selection-color.js";
import {
  applyLayerColor,
  buildThemeColors,
  contrastRatio,
  cssVariables,
  getTypeColor,
} from "../../src/styles/theme.js";

describe("buildThemeColors", () => {
  it("uses default accent when none provided", () => {
    const colors = buildThemeColors();
    expect(colors.accent).toBe("#0066ff");
  });

  it("normalizes 6-digit hex", () => {
    const colors = buildThemeColors("#ff5500");
    expect(colors.accent).toBe("#ff5500");
    expect(colors.accentLight).toBe("#ff550014");
  });

  it("expands 3-digit shorthand hex", () => {
    const colors = buildThemeColors("#f50");
    expect(colors.accent).toBe("#ff5500");
  });

  it("strips alpha from 8-digit hex", () => {
    const colors = buildThemeColors("#ff5500cc");
    expect(colors.accent).toBe("#ff5500");
  });

  it("falls back to default for rgb() format", () => {
    const colors = buildThemeColors("rgb(255,85,0)");
    expect(colors.accent).toBe("#0066ff");
  });

  it("falls back to default for invalid string", () => {
    const colors = buildThemeColors("not-a-color");
    expect(colors.accent).toBe("#0066ff");
  });

  it("falls back to default for empty string", () => {
    const colors = buildThemeColors("");
    expect(colors.accent).toBe("#0066ff");
  });
});

describe("applyLayerColor", () => {
  it("rewrites BOTH the accent and selection families to the same layer tone (rule 1: one tone per mount)", () => {
    const colors = buildThemeColors("#0066ff", "light");
    applyLayerColor(colors, "#b45309", "light");

    expect(colors.accent).toBe("#b45309");
    expect(colors.selection).toBe("#b45309");
    expect(colors.accentLight).toBe("#b4530914");
    expect(colors.selectionLight).toBe(colors.accentLight);
    expect(colors.accentGlow).toBe("#b4530933");
    expect(colors.selectionGlow).toBe(colors.accentGlow);
    expect(colors.accentGradient).toContain("#b45309");
    // Darkened second stop — same construction buildThemeColors uses.
    expect(colors.accentGradient).toMatch(/linear-gradient\(135deg, #b45309, #[0-9a-f]{6}\)/);
  });

  it("uses the dark theme's stronger alphas when the resolved theme is dark", () => {
    const colors = buildThemeColors("#0066ff", "dark");
    applyLayerColor(colors, "#b45309", "dark");
    expect(colors.accentLight).toBe("#b4530922");
    expect(colors.accentGlow).toBe("#b4530944");
  });

  it("derives layer SURFACE tokens from the tone (tinted glass + toned edge), not just accents", () => {
    const colors = buildThemeColors("#0066ff", "light");
    const neutralBg = colors.layerBg;
    applyLayerColor(colors, "#b45309", "light");

    // Tinted toward the layer hue — no longer the neutral white glass.
    expect(colors.layerBg).not.toBe(neutralBg);
    expect(colors.layerBg).toMatch(/^rgba\(\d+, \d+, \d+, 0.9\)$/);
    expect(colors.layerBgHeavy).toMatch(/^rgba\(\d+, \d+, \d+, 0.96\)$/);
    // 7% blend of #b45309 into white: r=255-(255-180)*0.07≈250, stays warm.
    const m = colors.layerBg.match(/rgba\((\d+), (\d+), (\d+)/);
    const [r, g, b] = [Number(m![1]), Number(m![2]), Number(m![3])];
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
    // Edge border is the layer tone at 45% alpha.
    expect(colors.layerBorder).toBe("#b4530973");
  });

  it("seeds layer surface tokens neutral so no-detection behaves like today", () => {
    const colors = buildThemeColors("#0066ff", "light");
    expect(colors.layerBg).toBe("rgba(255, 255, 255, 0.9)");
    expect(colors.layerBorder).toBe("#e2e8f0");
  });

  it("leaves semantic data colors untouched (rule 3)", () => {
    const colors = buildThemeColors("#0066ff", "light");
    const typeBug = colors.typeBug;
    const statusOpen = colors.statusOpen;
    applyLayerColor(colors, "#b45309", "light");
    expect(colors.typeBug).toBe(typeBug);
    expect(colors.statusOpen).toBe(statusOpen);
  });
});

describe("getTypeColor", () => {
  const colors = buildThemeColors();

  it("returns blue for question", () => {
    expect(getTypeColor("question", colors)).toBe(colors.typeQuestion);
  });

  it("returns orange for change", () => {
    expect(getTypeColor("change", colors)).toBe(colors.typeChange);
  });

  it("returns red for bug", () => {
    expect(getTypeColor("bug", colors)).toBe(colors.typeBug);
  });

  it("returns gray for other and unknown", () => {
    expect(getTypeColor("other", colors)).toBe(colors.typeOther);
    expect(getTypeColor("unknown", colors)).toBe(colors.typeOther);
  });
});

describe("accessible accent tokens", () => {
  // The bug these guard: the layer tone is picked for HUE distance from the
  // host palette, so it can legitimately land on a light hue (LAYER_PALETTES'
  // amber is hsl(45, 85%, 50%)). A hardcoded white-on-accent chip is 1.9:1
  // there — the toolbar icons stopped being distinguishable.
  const AMBER = "#ecb613";
  const WCAG_AA = 4.5;
  const WCAG_NON_TEXT = 3;

  it("keeps white ink on the default blue (no regression for the common case)", () => {
    expect(buildThemeColors("#0066ff").accentForeground).toBe("#ffffff");
  });

  it("flips to dark ink on a light accent white could not survive", () => {
    const colors = buildThemeColors(AMBER);
    expect(colors.accentForeground).not.toBe("#ffffff");
    expect(contrastRatio(colors.accentForeground, AMBER)).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it("clears the non-text floor on EVERY curated layer palette, and always picks the better ink", () => {
    // 3:1 is the normative bar for icons and UI components (WCAG 1.4.11),
    // which is what a toolbar chip actually carries — and what the reported
    // white-on-amber bug violated at 1.9:1. Most palettes clear 4.5 as well;
    // magenta tops out at 4.45 with white (dark ink is worse there at 3.9),
    // so the contract asserted here is "the best available ink, never below
    // the non-text floor" rather than a promise the color space can't keep.
    for (const palette of LAYER_PALETTES) {
      const { r, g, b } = hslToRgb(palette.h, palette.s, palette.l);
      const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      for (const theme of ["light", "dark"] as const) {
        const colors = buildThemeColors("#0066ff", theme);
        applyLayerColor(colors, hex, theme);
        const chosen = contrastRatio(colors.accentForeground, hex);
        const best = Math.max(contrastRatio("#ffffff", hex), contrastRatio("#0f172a", hex));
        expect(chosen, `${palette.name} (${hex}) in ${theme}`).toBeGreaterThanOrEqual(WCAG_NON_TEXT);
        expect(chosen, `${palette.name} (${hex}) in ${theme} is the better of the two inks`).toBeCloseTo(best, 5);
      }
    }
  });

  it("darkens the ink until the tone is legible AS text on a light surface", () => {
    const colors = buildThemeColors(AMBER, "light");
    expect(contrastRatio(colors.accentInk, "#ffffff")).toBeGreaterThanOrEqual(WCAG_AA);
    // Raw amber is exactly what was unreadable — the ink must differ from it.
    expect(colors.accentInk).not.toBe(colors.accent);
  });

  it("leaves the ink untouched when the accent is already legible", () => {
    const colors = buildThemeColors("#0066ff", "light");
    expect(colors.accentInk).toBe(colors.accent);
  });

  it("lightens rather than darkens on a dark theme", () => {
    const dark = buildThemeColors("#0b3ba8", "dark");
    expect(contrastRatio(dark.accentInk, "#0f172a")).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it("re-derives both tokens when a layer tone replaces the accent", () => {
    const colors = buildThemeColors("#0066ff", "light");
    expect(colors.accentForeground).toBe("#ffffff");
    applyLayerColor(colors, AMBER, "light");
    expect(colors.accentForeground).not.toBe("#ffffff");
    expect(contrastRatio(colors.accentForeground, AMBER)).toBeGreaterThanOrEqual(WCAG_AA);
    expect(contrastRatio(colors.accentInk, "#ffffff")).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it("exposes both tokens as CSS variables", () => {
    const css = cssVariables(buildThemeColors(AMBER));
    expect(css).toContain("--sp-accent-fg:");
    expect(css).toContain("--sp-accent-ink:");
  });
});
