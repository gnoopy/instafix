import { FONT_STACK } from "../constants.js";

/** Color palette and glassmorphism tokens derived from the accent color */
export interface ThemeColors {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;
  accentGradient: string;
  /**
   * Selection-indicator color family — the toolbar's active-state
   * background, the drag/auto-target highlight outline, and the
   * multi-target numbered badges all read from this instead of `accent`,
   * since (unlike `accent`, used for the widget's own panel branding
   * inside an opaque card) these render directly over the host page and
   * can visually blend with a host button/link using a similar hue.
   * Seeded to the same values as `accent`/`accentLight`/`accentGlow` here —
   * `dom/selection-color.ts`'s host-palette detection (launcher.ts, once
   * per mount) overwrites these in place when it finds a real host color to
   * contrast against; until then (or if detection is disabled/fails),
   * behavior is identical to using `accent` directly.
   */
  selection: string;
  selectionLight: string;
  selectionGlow: string;
  bg: string;
  bgHover: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  shadow: string;
  // Glass tokens
  glassBg: string;
  glassBgHeavy: string;
  glassBorder: string;
  glassBorderSubtle: string;
  /**
   * Layer SURFACE tokens — the background/edge of InstaFix's own floating
   * surfaces (panel, composer popover, tooltips, on-page toggle chips).
   * Seeded to the neutral glass tokens; `applyLayerColor` rewrites them to
   * a subtle layer-hue tint + a clearly layer-toned edge, so a surface
   * never disappears into a host page of the same background color — the
   * "this is an overlaid app" cue lives in the surface itself, not only in
   * the accents on it (LAYER COLOR RULES, rule 1).
   */
  layerBg: string;
  layerBgHeavy: string;
  layerBorder: string;
  // Feedback type colors
  typeQuestion: string;
  typeChange: string;
  typeBug: string;
  typeOther: string;
  // Soft type backgrounds (pastel)
  typeQuestionBg: string;
  typeChangeBg: string;
  typeBugBg: string;
  typeOtherBg: string;
  // Status filter colors
  statusOpen: string;
  statusOpenBg: string;
  statusResolved: string;
  statusResolvedBg: string;
  statusInProgress: string;
  statusInProgressBg: string;
  statusWontFix: string;
  statusWontFixBg: string;
}

const DEFAULT_ACCENT = "#0066ff";
const HEX6_RE = /^#[0-9a-fA-F]{6}$/;
const HEX3_RE = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const HEX8_RE = /^#[0-9a-fA-F]{8}$/;

/**
 * Normalize an accent color to a 6-digit hex string.
 *
 * **Only hex formats are accepted:**
 * - `#RGB`      (3-digit shorthand, expanded to 6-digit)
 * - `#RRGGBB`   (standard 6-digit)
 * - `#RRGGBBAA` (8-digit with alpha, alpha is stripped)
 *
 * Any other CSS color format (named colors like `"red"`, `hsl()`, `rgb()`,
 * `oklch()`, etc.) is **not** supported and will fall back to the default
 * accent color with a console warning.
 */
function normalizeHex(raw: string): string {
  if (HEX6_RE.test(raw)) return raw;
  const short = HEX3_RE.test(raw) ? raw.match(HEX3_RE) : null;
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  if (HEX8_RE.test(raw)) return raw.slice(0, 7);

  console.warn(
    `[instafix] Invalid accentColor "${raw}" — only hex colors (#RGB, #RRGGBB, #RRGGBBAA) are supported. Using default.`,
  );
  return DEFAULT_ACCENT;
}

/** Channel-wise blend of two 6-digit hex colors — `ratioB` of `hexB` mixed into `hexA`. */
function mixHex(hexA: string, hexB: string, ratioB: number): { r: number; g: number; b: number } {
  const ch = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  const blend = (a: number, b: number) => Math.round(a * (1 - ratioB) + b * ratioB);
  return {
    r: blend(ch(hexA, 1), ch(hexB, 1)),
    g: blend(ch(hexA, 3), ch(hexB, 3)),
    b: blend(ch(hexA, 5), ch(hexB, 5)),
  };
}

/** Darken a hex color by a percentage (0-1). Exported for launcher.ts's detected-selection-color gradient. */
export function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Detect if user prefers dark mode via media query */
function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Resolve 'auto' theme to 'light' or 'dark' based on system preference */
export function resolveTheme(theme?: "light" | "dark" | "auto"): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "auto") return prefersDark() ? "dark" : "light";
  return "light";
}

export function buildThemeColors(accent: string = DEFAULT_ACCENT, theme?: "light" | "dark" | "auto"): ThemeColors {
  const hex = normalizeHex(accent);
  const dark = darkenHex(hex, 0.15);
  const resolved = resolveTheme(theme);

  if (resolved === "dark") {
    return {
      accent: hex,
      accentLight: hex + "22", // slightly more visible on dark bg
      accentDark: dark,
      accentGlow: hex + "44",
      accentGradient: `linear-gradient(135deg, ${hex}, ${dark})`,
      selection: hex,
      selectionLight: hex + "22",
      selectionGlow: hex + "44",
      bg: "#0f172a",
      bgHover: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      textTertiary: "#64748b",
      border: "#334155",
      shadow: "rgba(0, 0, 0, 0.3)",
      // Glass tokens — dark frosted glass
      glassBg: "rgba(15, 23, 42, 0.78)",
      glassBgHeavy: "rgba(15, 23, 42, 0.88)",
      glassBorder: "rgba(51, 65, 85, 0.5)",
      glassBorderSubtle: "rgba(51, 65, 85, 0.3)",
      // Layer surfaces — neutral until applyLayerColor derives the tinted set
      layerBg: "rgba(15, 23, 42, 0.88)",
      layerBgHeavy: "rgba(15, 23, 42, 0.94)",
      layerBorder: "rgba(51, 65, 85, 0.5)",
      // Type colors stay vibrant on dark
      typeQuestion: "#60a5fa",
      typeChange: "#fbbf24",
      typeBug: "#f87171",
      typeOther: "#94a3b8",
      // Dark pastel backgrounds
      typeQuestionBg: "rgba(59, 130, 246, 0.15)",
      typeChangeBg: "rgba(245, 158, 11, 0.15)",
      typeBugBg: "rgba(239, 68, 68, 0.15)",
      typeOtherBg: "rgba(100, 116, 139, 0.15)",
      // Status colors — vivid green / cool gray on dark
      statusOpen: "#4ade80",
      statusOpenBg: "rgba(74, 222, 128, 0.15)",
      statusResolved: "#94a3b8",
      statusResolvedBg: "rgba(148, 163, 184, 0.15)",
      statusInProgress: "#fbbf24",
      statusInProgressBg: "rgba(245, 158, 11, 0.15)",
      statusWontFix: "#94a3b8",
      statusWontFixBg: "rgba(148, 163, 184, 0.15)",
    };
  }

  return {
    accent: hex,
    accentLight: hex + "14", // 8% opacity
    accentDark: dark,
    accentGlow: hex + "33", // 20% opacity
    accentGradient: `linear-gradient(135deg, ${hex}, ${dark})`,
    selection: hex,
    selectionLight: hex + "14",
    selectionGlow: hex + "33",
    bg: "#ffffff",
    bgHover: "#f8f9fb",
    text: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#64748b",
    border: "#e2e8f0",
    shadow: "rgba(0, 0, 0, 0.06)",
    // Glass tokens
    glassBg: "rgba(255, 255, 255, 0.72)",
    glassBgHeavy: "rgba(255, 255, 255, 0.85)",
    glassBorder: "rgba(255, 255, 255, 0.35)",
    glassBorderSubtle: "rgba(255, 255, 255, 0.18)",
    // Layer surfaces — neutral until applyLayerColor derives the tinted set
    layerBg: "rgba(255, 255, 255, 0.9)",
    layerBgHeavy: "rgba(255, 255, 255, 0.96)",
    layerBorder: "#e2e8f0",
    // Vibrant type colors
    typeQuestion: "#3b82f6",
    typeChange: "#b45309",
    typeBug: "#ef4444",
    typeOther: "#64748b",
    // Pastel backgrounds
    typeQuestionBg: "#eff6ff",
    typeChangeBg: "#fffbeb",
    typeBugBg: "#fef2f2",
    typeOtherBg: "#f8fafc",
    // Status colors — saturated green / cool gray on light
    statusOpen: "#16a34a",
    statusOpenBg: "#f0fdf4",
    statusResolved: "#64748b",
    statusResolvedBg: "#f1f5f9",
    statusInProgress: "#d97706",
    statusInProgressBg: "#fffbeb",
    statusWontFix: "#64748b",
    statusWontFixBg: "#f1f5f9",
  };
}

/**
 * LAYER COLOR RULES — InstaFix is an overlay laid over the host app, and
 * must always read as ONE distinct layer, never as part of the host UI.
 *
 * 1. ONE tone per mount: the toolbar/FAB, the composer popover, the panel,
 *    the selection outlines, and the numbered markers ALL wear the same
 *    layer tone. No surface keeps a different brand color.
 * 2. The tone comes from `dom/selection-color.ts`: the curated
 *    LAYER_PALETTES entry farthest (maximin hue distance) from every
 *    sampled host brand color, lightness-adjusted for contrast against the
 *    page background. On a fully grayscale host — nothing to clash with —
 *    the configured `accentColor` is the layer tone.
 * 3. Semantic data colors are exempt: feedback-type colors (bug red …),
 *    status colors, and the red error/badge tones mark DATA, not the
 *    layer, and stay fixed.
 * 4. Neutrals (text, borders, glass surfaces) are theme-driven, not
 *    layer-toned — the tone is the identity, not a wash over everything.
 * 5. `autoSelectionColor: false` opts out entirely: the configured
 *    `accentColor` becomes the layer tone everywhere (still rule 1 — one
 *    tone, just a manually chosen one).
 *
 * This function is rule 1's enforcement point: it rewrites BOTH the
 * accent family (panel/popover branding) and the selection family
 * (on-page indicators) to the same detected tone, in place, so every
 * consumer of the shared `colors` object — stylesheet vars and
 * constructor-baked inline styles alike — is born in the layer tone.
 * Call BEFORE `buildStyles()`/component construction (launcher.ts).
 */
export function applyLayerColor(colors: ThemeColors, hex: string, theme?: "light" | "dark" | "auto"): void {
  const resolved = resolveTheme(theme);
  const dark = darkenHex(hex, 0.15);
  const lightAlpha = resolved === "dark" ? "22" : "14";
  const glowAlpha = resolved === "dark" ? "44" : "33";
  colors.accent = hex;
  colors.accentLight = hex + lightAlpha;
  colors.accentDark = dark;
  colors.accentGlow = hex + glowAlpha;
  colors.accentGradient = `linear-gradient(135deg, ${hex}, ${dark})`;
  colors.selection = hex;
  colors.selectionLight = hex + lightAlpha;
  colors.selectionGlow = hex + glowAlpha;

  // Layer SURFACES (the dynamic-palette rule extends to backgrounds, not
  // just accents): tint the floating surfaces with the layer hue — a
  // white-glass panel over a white host page is invisible as a layer — and
  // give their edge a clearly layer-toned border. The tint is a blend
  // toward the theme's base surface so text contrast is untouched.
  const base = resolved === "dark" ? "#0f172a" : "#ffffff";
  const tintRatio = resolved === "dark" ? 0.14 : 0.07;
  const tint = mixHex(base, hex, tintRatio);
  const surfaceAlpha = resolved === "dark" ? 0.9 : 0.9;
  const heavyAlpha = resolved === "dark" ? 0.95 : 0.96;
  colors.layerBg = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${surfaceAlpha})`;
  colors.layerBgHeavy = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${heavyAlpha})`;
  colors.layerBorder = `${hex}73`;
}

export function getTypeColor(type: string, colors: ThemeColors): string {
  switch (type) {
    case "question":
      return colors.typeQuestion;
    case "change":
      return colors.typeChange;
    case "bug":
      return colors.typeBug;
    default:
      return colors.typeOther;
  }
}

export function getStatusColor(status: string, colors: ThemeColors): string {
  switch (status) {
    case "in_progress":
      return colors.statusInProgress;
    case "resolved":
      return colors.statusResolved;
    case "wont_fix":
      return colors.statusWontFix;
    default:
      return colors.statusOpen;
  }
}

export function getStatusBgColor(status: string, colors: ThemeColors): string {
  switch (status) {
    case "in_progress":
      return colors.statusInProgressBg;
    case "resolved":
      return colors.statusResolvedBg;
    case "wont_fix":
      return colors.statusWontFixBg;
    default:
      return colors.statusOpenBg;
  }
}

export function getTypeBgColor(type: string, colors: ThemeColors): string {
  switch (type) {
    case "question":
      return colors.typeQuestionBg;
    case "change":
      return colors.typeChangeBg;
    case "bug":
      return colors.typeBugBg;
    default:
      return colors.typeOtherBg;
  }
}

export function cssVariables(colors: ThemeColors): string {
  return `
    --sp-accent: ${colors.accent};
    --sp-accent-light: ${colors.accentLight};
    --sp-accent-dark: ${colors.accentDark};
    --sp-accent-glow: ${colors.accentGlow};
    --sp-accent-gradient: ${colors.accentGradient};
    --sp-bg: ${colors.bg};
    --sp-bg-hover: ${colors.bgHover};
    --sp-text: ${colors.text};
    --sp-text-secondary: ${colors.textSecondary};
    --sp-text-tertiary: ${colors.textTertiary};
    --sp-border: ${colors.border};
    --sp-shadow: ${colors.shadow};
    --sp-glass-bg: ${colors.glassBg};
    --sp-glass-bg-heavy: ${colors.glassBgHeavy};
    --sp-glass-border: ${colors.glassBorder};
    --sp-glass-border-subtle: ${colors.glassBorderSubtle};
    --sp-layer-bg: ${colors.layerBg};
    --sp-layer-bg-heavy: ${colors.layerBgHeavy};
    --sp-layer-border: ${colors.layerBorder};
    --sp-type-question: ${colors.typeQuestion};
    --sp-type-change: ${colors.typeChange};
    --sp-type-bug: ${colors.typeBug};
    --sp-type-other: ${colors.typeOther};
    --sp-type-question-bg: ${colors.typeQuestionBg};
    --sp-type-change-bg: ${colors.typeChangeBg};
    --sp-type-bug-bg: ${colors.typeBugBg};
    --sp-type-other-bg: ${colors.typeOtherBg};
    --sp-radius: 12px;
    --sp-radius-lg: 16px;
    --sp-radius-xl: 20px;
    --sp-radius-full: 9999px;
    --sp-blur: 20px;
    --sp-blur-heavy: 32px;
    --sp-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
    --sp-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04);
    --sp-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
    --sp-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04);
    --sp-shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
    --sp-font: ${FONT_STACK};
  `;
}
