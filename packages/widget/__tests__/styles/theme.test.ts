import { describe, expect, it } from "vitest";
import { applyLayerColor, buildThemeColors, getTypeColor } from "../../src/styles/theme.js";

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
