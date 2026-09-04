import { AGENT_COPY_CSS } from "../agent-copy.js";
import { Z_INDEX_MAX } from "../constants.js";
import { EXPORT_CSS } from "../export-utils.js";
import { ONBOARDING_CSS } from "../onboarding.js";
import { BULK_CSS } from "../panel-bulk.js";
import { DETAIL_CSS } from "../panel-detail.js";
import { SORT_CSS } from "../panel-sort.js";
import { STATS_CSS } from "../panel-stats.js";
import { SETTINGS_CSS } from "../settings-view.js";
import { SHORTCUTS_CSS } from "../shortcuts.js";
import { ANIMATION_CSS } from "./animations.js";
import { cssVariables, type ThemeColors } from "./theme.js";

/**
 * Build the complete CSS stylesheet for the Shadow DOM.
 *
 * Design: Glassmorphism — frosted glass surfaces, soft depth,
 * accent gradients, premium micro-interactions.
 *
 * Principles:
 * - :host uses `all: initial` to block inherited styles
 * - All classes prefixed with sp- (defense in depth)
 * - CSS custom properties for theming
 * - No external fonts — system-ui stack (Inter if available)
 * - :focus-visible on all interactive elements
 * - prefers-reduced-motion support
 */
export function buildStyles(colors: ThemeColors): string {
  return `
    :host {
      all: initial;
      position: fixed;
      z-index: ${Z_INDEX_MAX};
      font-family: var(--sp-font);
      font-size: 14px;
      line-height: 1.5;
      color: var(--sp-text);
      /* Match native sub-controls (autofill, scrollbars, etc.) to the resolved theme */
      color-scheme: ${colors.bg === "#ffffff" ? "light" : "dark"};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      ${cssVariables(colors)}

      /* Identity modal — theme-aware backdrop + panel */
      --sp-identity-bg: ${colors.glassBgHeavy};
      --sp-identity-overlay: ${colors.bg === "#ffffff" ? "rgba(15, 23, 42, 0.2)" : "rgba(0, 0, 0, 0.4)"};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ============================
       Focus visible (accessibility)
       ============================ */

    :focus-visible {
      outline: 2px solid var(--sp-accent);
      outline-offset: 2px;
      /* Double-ring against any background colour: the bg-coloured halo
         separates the accent ring from busy host-page surfaces. */
      box-shadow: 0 0 0 4px var(--sp-bg);
    }

    /* ============================
       FAB (Floating Action Button)
       ============================ */

    /* Wears the auto-detected selection color (host-distinct, see
       dom/selection-color.ts) once launcher.ts sets the --sp-selection-*
       inline properties on the host — until then (or with detection off)
       the fallbacks keep it on the configured accent. The point: the FAB
       and its toolbar must never look like the HOST app's own primary
       buttons. */
    .sp-fab {
      position: fixed;
      width: 52px;
      height: 52px;
      border-radius: var(--sp-radius-full);
      background: var(--sp-selection-gradient, var(--sp-accent-gradient));
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 4px 20px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 2px 8px rgba(0, 0, 0, 0.08);
      transition:
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;
      outline: none;
    }

    .sp-fab:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .sp-fab:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow:
        0 8px 28px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sp-fab:active {
      transform: translateY(0) scale(0.95);
      transition-duration: 0.1s;
    }

    .sp-fab--bottom-right {
      bottom: 24px;
      right: 24px;
    }

    .sp-fab--bottom-left {
      bottom: 24px;
      left: 24px;
    }

    .sp-fab svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ---- FAB Badge ---- */

    .sp-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: var(--sp-radius-full);
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      pointer-events: none;
      font-family: var(--sp-font);
      line-height: 1;
    }

    /* ============================
       Action Toolbar (next to the FAB)
       ============================ */

    /* Persistent horizontal row, not a menu — visible by default (the FAB
       only toggles it), positioned right next to the FAB so it reads as one
       unit. Width/height auto-size to content; only the anchored edge
       (right for bottom-right, left for bottom-left) is fixed, so the row
       grows away from the FAB as items are added. */
    .sp-toolbar {
      position: fixed;
      bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(6px);
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sp-toolbar--visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* 24px FAB offset + 52px FAB width + 12px gap */
    .sp-toolbar--bottom-right {
      right: 88px;
    }

    .sp-toolbar--bottom-left {
      left: 88px;
    }

    /* Filled with the same (auto-detected, host-distinct) color as the FAB —
       not the neutral glass other surfaces use, and never the raw accent
       when detection has produced a selection color — so the row reads as
       one unit: "the FAB, and the buttons that belong to it", visibly NOT
       part of the host app's own palette. */
    .sp-toolbar-item {
      position: relative;
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: var(--sp-radius-full);
      background: var(--sp-selection, var(--sp-accent));
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--sp-shadow-md), 0 2px 10px var(--sp-selection-glow, var(--sp-accent-glow));
      font-size: 12px;
      font-weight: 600;
      transition: filter 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    }

    .sp-toolbar-item:hover,
    .sp-toolbar-item:focus-visible {
      filter: brightness(1.08);
      box-shadow:
        var(--sp-shadow-md),
        0 0 0 3px var(--sp-selection-light, var(--sp-accent-light));
      outline: none;
    }

    .sp-toolbar-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      stroke: currentColor;
      fill: none;
    }

    /* Persistent "mode is on" state for the auto-target picker button —
       distinct from :hover/:focus-visible, which only apply while the
       pointer/keyboard focus is actually on the button itself. INVERTED
       relative to the row's filled idle chips (white fill, colored icon,
       colored ring): a fill-swap or brightness tweak between two shades of
       the same color was not readable at a glance, and inversion stays
       readable even when selection === accent (detection off, or nothing
       chromatic on the host page to contrast against). */
    .sp-toolbar-item--active {
      background: #ffffff;
      border-color: var(--sp-selection, var(--sp-accent));
      color: var(--sp-selection, var(--sp-accent));
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.12),
        0 0 0 3px var(--sp-selection-glow, var(--sp-accent-glow));
    }

    /* ---- Auto-contrast against the host page's background (G8) ----
       Fab.updateContrast() samples the actual rendered background behind
       the FAB/toolbar and toggles one of these on the shared root wrapper.
       Unlike before, the toolbar items keep their accent fill on any host
       background (same branding logic as the FAB, which never swaps its own
       background either) — contrast is assisted with a light ring, exactly
       like the FAB's own on-light/on-dark rule below. */

    .sp-fab-root--on-light .sp-toolbar-item,
    .sp-fab-root--on-dark .sp-toolbar-item {
      box-shadow:
        var(--sp-shadow-md),
        0 2px 10px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 0 0 3px rgba(255, 255, 255, 0.9);
    }

    /* Active chip is white — a white contrast ring would vanish against it,
       so the on-light/on-dark assist ring stays the selection color here. */
    .sp-fab-root--on-light .sp-toolbar-item--active,
    .sp-fab-root--on-dark .sp-toolbar-item--active {
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.12),
        0 0 0 3px var(--sp-selection-glow, var(--sp-accent-glow));
    }

    /* A thin light ring around the FAB itself separates its (already
       saturated, generally-visible) accent color from either a very light
       or very dark page background sitting right up against it. */
    .sp-fab-root--on-light .sp-fab,
    .sp-fab-root--on-dark .sp-fab {
      box-shadow:
        0 4px 20px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 0 0 3px rgba(255, 255, 255, 0.9),
        0 2px 10px rgba(0, 0, 0, 0.3);
    }

    /* ---- Discovery shine — a diagonal light sweep across the FAB + toolbar
       (G8) ---- a persistent-but-easy-to-miss toolbar needs some way to say
       "look here" the first time it appears. Plays once, right-to-left
       (matching the FAB → eye → target → pencil → list reading order), sized and
       positioned in JS to exactly span whatever's currently rendered
       (Fab.playShine()) rather than a fixed guess at the toolbar's width. */
    .sp-toolbar-shine {
      position: fixed;
      pointer-events: none;
      overflow: hidden;
      z-index: ${Z_INDEX_MAX};
      border-radius: 9999px;
    }

    /* White/light-gray sweep — the buttons underneath wear the detected
       selection color, which can itself land in the yellow family; a yellow
       band over yellow buttons is invisible, while a white one reads on any
       detected hue. */
    .sp-toolbar-shine::before {
      content: "";
      position: absolute;
      top: -60%;
      left: 100%;
      width: 48px;
      height: 220%;
      background: linear-gradient(
        100deg,
        transparent,
        rgba(241, 245, 249, 0.75) 45%,
        rgba(255, 255, 255, 0.95) 50%,
        rgba(241, 245, 249, 0.75) 55%,
        transparent
      );
      transform: rotate(18deg);
      animation: sp-toolbar-shine-sweep 1.3s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes sp-toolbar-shine-sweep {
      from {
        left: 100%;
      }
      to {
        left: -80px;
      }
    }

    /* Hover/focus tooltip — appears above the item, matching a horizontal
       toolbar (the old vertical radial menu showed labels to the side). */
    .sp-toolbar-label {
      position: absolute;
      bottom: 52px;
      left: 50%;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 500;
      color: var(--sp-text);
      pointer-events: none;
      opacity: 0;
      padding: 4px 12px;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--sp-glass-border);
      box-shadow: var(--sp-shadow-sm);
      transform: translateX(-50%) translateY(4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    /* The item's global shortcut, at the tooltip's right end — a small kbd
       chip, visually secondary to the name. */
    .sp-toolbar-label-key {
      font-size: 10px;
      font-weight: 600;
      color: var(--sp-text-tertiary);
      border: 1px solid var(--sp-border);
      border-radius: 4px;
      padding: 1px 5px;
      line-height: 1.4;
    }

    .sp-toolbar-item:hover .sp-toolbar-label,
    .sp-toolbar-item:focus-visible .sp-toolbar-label {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ============================
       Panel (Side drawer)
       ============================ */

    /* Layer surface: tinted with the detected layer hue and edged with a
       layer-toned border, so the panel never dissolves into a host page of
       the same background color — the surface itself says "overlaid app". */
    .sp-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: var(--sp-layer-bg, var(--sp-glass-bg));
      backdrop-filter: blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
      border-left: 2px solid var(--sp-layer-border, var(--sp-glass-border));
      box-shadow: var(--sp-shadow-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 480px) {
      .sp-panel {
        width: 100vw;
        border-left: none;
      }
    }

    .sp-panel-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur));
      -webkit-backdrop-filter: blur(var(--sp-blur));
      position: relative;
      z-index: 2;
    }

    /* Title + close only — always exactly these two, so the close button can
       never be crowded out by however many action buttons the row below
       grows to. */
    .sp-panel-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .sp-panel-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sp-panel-close {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: var(--sp-radius);
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sp-text-tertiary);
      transition: all 0.2s ease;
    }

    .sp-panel-close:hover {
      background: var(--sp-bg-hover);
      color: var(--sp-text);
    }

    .sp-panel-close svg {
      width: 16px;
      height: 16px;
    }

    /* ============================
       Filters & Search
       ============================ */

    .sp-filters {
      padding: 10px 16px;
      border-bottom: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur));
      -webkit-backdrop-filter: blur(var(--sp-blur));
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .sp-search-wrap {
      position: relative;
    }

    /* Select-all + search share one row directly above the cards. */
    .sp-list-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }

    .sp-list-toolbar .sp-search-wrap {
      flex: 1;
      min-width: 0;
    }

    /* Filled instead of outlined — the soft background says "input" without
       adding yet another border line to a stack of them; focus brings the
       accent outline back. */
    .sp-search {
      width: 100%;
      height: 32px;
      padding: 0 12px 0 34px;
      border-radius: var(--sp-radius);
      border: 1px solid transparent;
      background: var(--sp-bg-hover);
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }

    .sp-search::placeholder {
      color: var(--sp-text-tertiary);
    }

    .sp-search:focus {
      border-color: var(--sp-accent);
      box-shadow: 0 0 0 3px var(--sp-accent-light);
      background: var(--sp-bg);
    }

    .sp-search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--sp-text-tertiary);
      width: 16px;
      height: 16px;
      transition: color 0.2s ease;
    }

    .sp-search:focus ~ .sp-search-icon,
    .sp-search-wrap:focus-within .sp-search-icon {
      color: var(--sp-accent);
    }

    /* ============================
       Filter bar (type dropdown + status segmented)
       ============================ */

    .sp-filter-bar {
      display: flex;
      align-items: center;
      gap: 4px 6px;
      margin-bottom: 0;
      flex-wrap: wrap;
    }

    /* ============================
       Type filter dropdown
       ============================ */

    .sp-filter-dropdown {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
    }

    .sp-filter-dropdown-btn {
      --sp-chip-color: var(--sp-text-secondary);
      --sp-chip-bg: var(--sp-glass-bg-heavy);

      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      height: 28px;
      padding: 0 8px 0 10px;
      border-radius: var(--sp-radius-full);
      /* Ghost chip — border only appears with state (hover/open/filtered). */
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }

    .sp-filter-dropdown-btn:hover {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
    }

    .sp-filter-dropdown-btn[aria-expanded="true"] {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sp-chip-color) 14%, transparent);
    }

    .sp-filter-dropdown-btn--filtered {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
    }

    .sp-filter-dropdown-btn__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-btn__icon svg {
      width: 14px;
      height: 14px;
    }

    .sp-filter-dropdown-btn__label {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .sp-filter-dropdown-btn__prefix {
      color: var(--sp-text-tertiary);
      font-weight: 500;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .sp-filter-dropdown-btn__value {
      color: var(--sp-chip-color);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sp-filter-dropdown-btn__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--sp-text-tertiary);
      transition: transform 0.18s ease, color 0.18s ease;
    }

    .sp-filter-dropdown-btn__chevron svg {
      width: 12px;
      height: 12px;
    }

    .sp-filter-dropdown-btn[aria-expanded="true"] .sp-filter-dropdown-btn__chevron {
      transform: rotate(180deg);
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      min-width: 180px;
      padding: 4px;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
      border: 1px solid var(--sp-glass-border);
      box-shadow: var(--sp-shadow-md);
      z-index: 10;
      animation: sp-filter-menu-in 0.15s ease-out both;
    }

    @keyframes sp-filter-menu-in {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sp-filter-dropdown-option {
      --sp-chip-color: var(--sp-text-secondary);
      --sp-chip-bg: transparent;

      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.12s ease, color 0.12s ease;
    }

    .sp-filter-dropdown-option__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      border-radius: 6px;
      background: var(--sp-chip-bg);
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-option__icon svg {
      width: 13px;
      height: 13px;
    }

    .sp-filter-dropdown-option__label {
      flex: 1;
      min-width: 0;
    }

    .sp-filter-dropdown-option__check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-option__check svg {
      width: 13px;
      height: 13px;
    }

    .sp-filter-dropdown-option:hover {
      background: var(--sp-bg-hover);
    }

    .sp-filter-dropdown-option--active {
      color: var(--sp-chip-color);
      font-weight: 600;
    }

    .sp-filter-dropdown-option--active:hover {
      background: var(--sp-chip-bg);
    }

    /* ============================
       Status segmented control
       ============================ */

    /* Borderless group — the active chip's tinted fill + inset ring carries
       the selection; the enclosing outline added a line without meaning. */
    .sp-segmented {
      display: inline-flex;
      align-items: stretch;
      padding: 0;
      gap: 2px;
      border-radius: var(--sp-radius-full);
      border: none;
      background: transparent;
      flex-shrink: 0;
    }

    .sp-segmented__btn {
      --sp-chip-color: var(--sp-text-tertiary);
      --sp-chip-bg: transparent;

      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 24px;
      padding: 0 8px;
      border: none;
      border-radius: var(--sp-radius-full);
      background: transparent;
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    }

    .sp-segmented__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
      transition: color 0.18s ease, transform 0.18s ease;
    }

    .sp-segmented__icon svg {
      width: 13px;
      height: 13px;
    }

    .sp-segmented__btn:hover {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn:hover .sp-segmented__icon {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn--active {
      background: var(--sp-chip-bg);
      color: var(--sp-chip-color);
      font-weight: 600;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--sp-chip-color) 35%, transparent),
        0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .sp-segmented__btn--active .sp-segmented__icon {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn--open.sp-segmented__btn--active .sp-segmented__icon {
      animation: sp-segmented-pulse 2.4s ease-in-out infinite;
    }

    @keyframes sp-segmented-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.85); }
    }

    @media (prefers-reduced-motion: reduce) {
      .sp-filter-dropdown-btn,
      .sp-filter-dropdown-btn__chevron,
      .sp-filter-dropdown-option,
      .sp-segmented__btn,
      .sp-segmented__icon {
        transition: none;
      }
      .sp-filter-dropdown-menu {
        animation: none;
      }
      .sp-segmented__btn--open.sp-segmented__btn--active .sp-segmented__icon {
        animation: none;
      }
    }

    /* ============================
       Feedback Cards
       ============================ */

    .sp-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 10px;
    }

    .sp-list::-webkit-scrollbar {
      width: 6px;
    }

    .sp-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .sp-list::-webkit-scrollbar-thumb {
      background: var(--sp-border);
      border-radius: var(--sp-radius-full);
    }

    .sp-list::-webkit-scrollbar-thumb:hover {
      background: var(--sp-text-tertiary);
    }

    /* Card separation comes from background + shadow + the left status bar
       — no resting border, so the list isn't a grid of outlines. */
    .sp-card {
      display: flex;
      padding: 9px 12px;
      margin-bottom: 5px;
      cursor: pointer;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      border: 1px solid transparent;
      box-shadow: var(--sp-shadow-xs);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sp-card:hover {
      background: var(--sp-bg);
      border-color: var(--sp-border);
      box-shadow: var(--sp-shadow-md);
      transform: translateY(-2px);
    }

    .sp-card:active {
      transform: translateY(0) scale(0.99);
      transition-duration: 0.1s;
    }

    /* The list's current selection — set by clicking a card or the card's
       on-page numbered marker. Selection-colored (host-distinct) ring, the
       same visual language as the on-page outline it corresponds to. */
    .sp-card--selected {
      background: var(--sp-bg);
      border-color: var(--sp-selection, var(--sp-accent));
      box-shadow:
        0 0 0 2px var(--sp-selection-light, var(--sp-accent-light)),
        var(--sp-shadow-sm);
    }

    .sp-card-bar {
      width: 3px;
      border-radius: var(--sp-radius-full);
      margin-right: 10px;
      flex-shrink: 0;
    }

    .sp-card-body {
      flex: 1;
      min-width: 0;
    }

    .sp-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }

    .sp-card-number {
      font-size: 12px;
      font-weight: 700;
      color: var(--sp-text-tertiary);
      font-variant-numeric: tabular-nums;
    }

    .sp-badge {
      padding: 2px 10px;
      border-radius: var(--sp-radius-full);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* "이미 에이전트에 전달됨" 배지 — 레이어 톤, 카드 헤더의 날짜 왼쪽. */
    .sp-card-handed {
      font-size: 10px;
      font-weight: 600;
      color: var(--sp-selection, var(--sp-accent));
      background: var(--sp-selection-light, var(--sp-accent-light));
      border-radius: 5px;
      padding: 1px 6px;
      white-space: nowrap;
      margin-left: auto;
    }
    .sp-card-handed + .sp-card-date { margin-left: 8px; }

    .sp-card-date {
      font-size: 11px;
      color: var(--sp-text-tertiary);
      margin-left: auto;
    }

    .sp-card-message {
      font-size: 12.5px;
      line-height: 1.45;
      color: var(--sp-text);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sp-card-message--expanded {
      -webkit-line-clamp: unset;
    }

    .sp-card-expand {
      font-size: 12px;
      font-weight: 500;
      color: var(--sp-accent);
      cursor: pointer;
      background: none;
      border: none;
      padding: 4px 0;
      font-family: var(--sp-font);
      transition: opacity 0.15s ease;
    }

    .sp-card-expand:hover {
      opacity: 0.8;
    }

    .sp-card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      margin-top: 6px;
    }

    /* On pointer devices the footer floats over the card's top-right corner
       and only materializes on hover/focus/selection — cards stay two lines
       tall (that's what lets the list show twice the items) and hovering
       never shifts the layout. Touch devices (no hover) keep the inline,
       always-visible footer. */
    @media (hover: hover) and (pointer: fine) {
      .sp-card {
        position: relative;
      }

      .sp-card-footer {
        display: none;
        position: absolute;
        top: 5px;
        right: 8px;
        margin-top: 0;
        padding: 2px 4px;
        border-radius: var(--sp-radius-full);
        background: var(--sp-bg);
        box-shadow: var(--sp-shadow-sm);
        z-index: 1;
      }

      .sp-card:hover .sp-card-footer,
      .sp-card:focus-within .sp-card-footer,
      .sp-card--selected .sp-card-footer {
        display: flex;
      }
    }

    .sp-btn-resolve,
    .sp-btn-delete,
    .sp-btn-handoff {
      padding: 4px 10px;
      border-radius: var(--sp-radius-full);
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .sp-btn-resolve svg,
    .sp-btn-delete svg {
      width: 14px;
      height: 14px;
    }

    .sp-btn-resolve:hover {
      border-color: #22c55e;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.06);
    }

    .sp-btn-delete:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }

    /* Handoff sits apart on the left — send-to-agent is a different kind of
       act than the resolve/delete pair, and the gap keeps a mis-click from
       landing on delete. */
    .sp-btn-handoff {
      margin-right: auto;
    }

    .sp-btn-handoff:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    .sp-btn-resolve:disabled,
    .sp-btn-delete:disabled,
    .sp-btn-handoff:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .sp-spinner--sm {
      width: 14px;
      height: 14px;
    }

    /* ---- Delete All (header) ---- */

    /* Secondary actions row — free to wrap onto multiple lines as more
       buttons are added; never shares a row with the close button. */
    .sp-panel-header-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .sp-btn-delete-all {
      padding: 5px 12px;
      border-radius: var(--sp-radius-full);
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text-tertiary);
      font-family: var(--sp-font);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .sp-btn-delete-all svg {
      width: 13px;
      height: 13px;
    }

    .sp-btn-delete-all:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }

    .sp-btn-delete-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Same ghost-pill shape as .sp-btn-delete-all/.sp-export-btn — neutral
       until hover, then picks up the widget's accent instead of a danger or
       brand-specific color (this is a plain navigation action, not export or
       a destructive one). */
    .sp-btn-open-dashboard {
      padding: 6px;
      border-radius: var(--sp-radius-full);
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .sp-btn-open-dashboard svg {
      width: 13px;
      height: 13px;
    }

    .sp-btn-open-dashboard:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    /* ---- Confirm Dialog ---- */

    .sp-confirm-backdrop {
      position: fixed;
      inset: 0;
      background: var(--sp-backdrop, rgba(15, 23, 42, 0.2));
      backdrop-filter: blur(var(--sp-blur));
      -webkit-backdrop-filter: blur(var(--sp-blur));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${Z_INDEX_MAX};
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .sp-confirm-dialog {
      width: 340px;
      padding: 28px;
      border-radius: 20px;
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
      border: 1px solid var(--sp-glass-border);
      box-shadow: var(--sp-shadow-xl);
      font-family: var(--sp-font);
      transform: translateY(8px) scale(0.97);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sp-confirm-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .sp-confirm-message {
      font-size: 14px;
      color: var(--sp-text-secondary);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .sp-confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .sp-btn-danger {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: none;
      background: #ef4444;
      color: #fff;
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    }

    .sp-btn-danger:hover {
      background: #dc2626;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }

    .sp-btn-danger:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 0.1s;
    }

    .sp-card--resolved {
      opacity: 0.5;
    }

    .sp-card--resolved .sp-card-message {
      text-decoration: line-through;
      text-decoration-color: var(--sp-text-tertiary);
    }

    /* ============================
       Loading State
       ============================ */

    .sp-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }

    /* ============================
       Identity Form
       ============================ */

    .sp-identity-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
    }

    .sp-input {
      width: 100%;
      height: 42px;
      padding: 0 14px;
      border-radius: var(--sp-radius);
      border: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }

    .sp-input::placeholder {
      color: var(--sp-text-tertiary);
    }

    .sp-input:focus {
      border-color: var(--sp-accent);
      box-shadow: 0 0 0 3px var(--sp-accent-light);
      background: var(--sp-bg);
    }

    .sp-input-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--sp-text-secondary);
      margin-bottom: 6px;
      display: block;
    }

    /* ============================
       Buttons
       ============================ */

    .sp-btn-primary {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: none;
      background: var(--sp-accent-gradient);
      color: #fff;
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px var(--sp-accent-glow);
    }

    .sp-btn-primary:hover {
      box-shadow: 0 4px 16px var(--sp-accent-glow);
      transform: translateY(-1px);
    }

    .sp-btn-primary:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 0.1s;
    }

    .sp-btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .sp-btn-ghost {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sp-btn-ghost:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    /* ============================
       Empty State
       ============================ */

    .sp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 24px;
      color: var(--sp-text-tertiary);
      text-align: center;
      gap: 8px;
      animation: sp-fade-in 0.3s ease-out both;
    }

    .sp-empty-text {
      font-size: 14px;
      font-weight: 500;
    }

    /* ============================
       Load More
       ============================ */

    .sp-load-more-wrap {
      display: flex;
      justify-content: center;
      padding: 12px 0 4px;
    }

    .sp-btn-load-more {
      width: 100%;
    }

    /* ---- Delete UNDO toast (single-card deletes, 5s grace) ---- */
    .sp-undo-toast {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--sp-radius);
      background: var(--sp-text);
      color: var(--sp-bg);
      font-size: 13px;
      box-shadow: var(--sp-shadow-lg);
      z-index: 5;
    }

    /* Transient notice variant (e.g. handoff failure) — same body as the
       undo toast, centered text, no action, removes itself. */
    .sp-notice-toast {
      justify-content: center;
      text-align: center;
      animation: sp-notice-toast-in 0.2s ease;
    }

    @keyframes sp-notice-toast-in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sp-undo-toast-btn {
      border: none;
      background: none;
      color: var(--sp-selection, var(--sp-accent));
      font-family: var(--sp-font);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 4px;
      letter-spacing: 0.01em;
    }

    /* ============================
       Forced Colors / High Contrast
       ============================ */

    @media (forced-colors: active) {
      .sp-fab,
      .sp-toolbar-item,
      .sp-filter-dropdown-btn,
      .sp-segmented,
      .sp-segmented__btn,
      .sp-card,
      .sp-panel-close,
      .sp-search,
      .sp-btn-resolve,
      .sp-btn-delete,
      .sp-btn-delete-all,
      .sp-btn-open-dashboard,
      .sp-btn-primary,
      .sp-btn-ghost,
      .sp-btn-danger,
      .sp-card-expand,
      .sp-input,
      .sp-confirm-dialog {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
        color: ButtonText !important;
      }

      .sp-segmented__btn--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-toolbar-item--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-filter-dropdown-menu {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
      }

      .sp-filter-dropdown-option--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-fab:focus-visible,
      .sp-toolbar-item:focus-visible,
      .sp-filter-dropdown-btn:focus-visible,
      .sp-segmented__btn:focus-visible,
      .sp-filter-dropdown-option:focus-visible,
      .sp-panel-close:focus-visible,
      .sp-btn-resolve:focus-visible,
      .sp-btn-delete:focus-visible,
      .sp-btn-delete-all:focus-visible,
      .sp-btn-open-dashboard:focus-visible,
      .sp-btn-primary:focus-visible,
      .sp-btn-ghost:focus-visible,
      .sp-btn-danger:focus-visible,
      .sp-card-expand:focus-visible,
      .sp-input:focus-visible,
      .sp-search:focus-visible {
        outline: 3px solid Highlight !important;
      }

      .sp-panel {
        border: 2px solid ButtonText !important;
      }

      .sp-fab-badge {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
        color: ButtonText !important;
      }

      .sp-card-bar {
        background: ButtonText !important;
      }
    }

    ${ANIMATION_CSS}
    ${STATS_CSS}
    ${SORT_CSS}
    ${BULK_CSS}
    ${EXPORT_CSS}
    ${SHORTCUTS_CSS}
    ${DETAIL_CSS}
    ${SETTINGS_CSS}
    ${AGENT_COPY_CSS}
    ${ONBOARDING_CSS}
  `;
}
