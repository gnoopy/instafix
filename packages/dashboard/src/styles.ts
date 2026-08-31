/**
 * Complete stylesheet for `<InstaFixInbox />`.
 *
 * Design: Linear/Vercel — speed, density, sobriety. The dashboard is MATTE:
 * 1px borders, flat surfaces, no glassmorphism. Deliberate contrast with the
 * glassy widget; same family via accent, slate ramp, Inter.
 *
 * Principles:
 * - Every selector is scoped under `.ifd-root`; specificity stays flat
 *   (single class nesting), no `!important` anywhere.
 * - All custom properties are `--ifd-*`; the palette switches via
 *   `.ifd-root[data-theme="dark"|"light"]`. The accent is injected inline on
 *   the root (`style="--ifd-accent: #0066ff"`) and every accent derivative is
 *   a `color-mix()` — no JS color math beyond hex normalization.
 * - The root is a container (`container-name: spd`); responsive behavior uses
 *   container queries, never viewport media queries.
 * - Drop shadows appear in exactly three places: drawer overlay mode, toast,
 *   and the annotation rect glow. Everything else is borders.
 *
 * Class hooks beyond the S2 inventory (components must use these names):
 * - `.ifd-type-square[data-type]` — 6×6 rounded type marker (row + drawer).
 * - `.ifd-type-label` — type text inside `.ifd-row-type` (shown ≥720cq).
 * - `.ifd-row-leaving` — transient class animating a row out after a status
 *   change removes it from the current filter.
 * - `.ifd-status-menu-trigger` / `.ifd-status-menu-pop` / `.ifd-status-menu-item`
 *   — status menu internals (`data-status` on trigger and items).
 * - `[data-status]` on the direct parent of a glyph `<svg>` colors it (first
 *   svg only, so trailing chevrons/check marks keep the text color).
 * - `.ifd-diag-entry[data-expanded="true"]` — un-clamps the console message.
 * - `.ifd-micro` — micro-label (10.5px caps); `.ifd-mono` — mono metadata;
 *   `.ifd-clamp-2` — 2-line clamp (userAgent, console messages).
 * - `.ifd-evidence-zoomed` — toggled on `.ifd-evidence-stage`; region overlay
 *   is hidden while zoomed (percentages only map to the fitted image).
 */
export const INBOX_CSS = `
/* ---------------------------------------------------------------- tokens */
.ifd-root {
  --ifd-accent: #0066ff; /* overridden inline via style="--ifd-accent: ..." */
  --ifd-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --ifd-mono: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --ifd-fs-body: 13px;
  --ifd-radius: 10px;
  --ifd-radius-sm: 6px;
  --ifd-radius-xs: 4px;
  --ifd-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ifd-row-h: 44px;

  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  height: 100%;
  container-type: inline-size;
  container-name: spd;
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius);
  background: var(--ifd-bg);
  color: var(--ifd-text);
  font-family: var(--ifd-font);
  font-size: var(--ifd-fs-body);
  font-weight: 400;
  line-height: 1.45;
  text-align: left;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.ifd-root[data-theme="dark"] {
  color-scheme: dark;
  --ifd-bg: #0b1120;
  --ifd-surface: #0f172a;
  --ifd-raised: #1e293b;
  --ifd-border: #1e293b;
  --ifd-border-strong: #334155;
  --ifd-text: #f1f5f9;
  --ifd-text-2: #a5b3c7;
  --ifd-text-3: #8a99b0; /* >=4.5:1 on every dark surface incl. raised */
  --ifd-accent-bright: color-mix(in srgb, var(--ifd-accent) 65%, #ffffff);
  --ifd-st-open: var(--ifd-accent-bright);
  --ifd-st-progress: #fbbf24;
  --ifd-st-resolved: #34d399;
  --ifd-st-wontfix: #94a3b8;
  --ifd-ty-question: #60a5fa;
  --ifd-ty-change: #fbbf24;
  --ifd-ty-bug: #f87171;
  --ifd-ty-other: #94a3b8;
  --ifd-danger: #f87171;
  --ifd-danger-strong: #ef4444;
  --ifd-dim: rgb(2 6 23 / 0.42);
}

.ifd-root[data-theme="light"] {
  color-scheme: light;
  --ifd-bg: #f8fafc;
  --ifd-surface: #ffffff;
  --ifd-raised: #f1f5f9;
  --ifd-border: #e2e8f0;
  --ifd-border-strong: #cbd5e1;
  --ifd-text: #0f172a;
  --ifd-text-2: #475569;
  --ifd-text-3: #56657b; /* >=4.5:1 on white AND raised #f1f5f9 */
  --ifd-accent-bright: var(--ifd-accent);
  --ifd-st-open: var(--ifd-accent);
  --ifd-st-progress: #b45309;
  --ifd-st-resolved: #047857;
  --ifd-st-wontfix: #64748b;
  --ifd-ty-question: #3b82f6;
  --ifd-ty-change: #b45309;
  --ifd-ty-bug: #ef4444;
  --ifd-ty-other: #64748b;
  --ifd-danger: #dc2626;
  --ifd-danger-strong: #b91c1c;
  --ifd-dim: rgb(2 6 23 / 0.42);
}

.ifd-root[data-density="comfortable"] { --ifd-row-h: 44px; }
.ifd-root[data-density="compact"] { --ifd-row-h: 36px; }

/* ----------------------------------------------------------------- reset */
.ifd-root *,
.ifd-root *::before,
.ifd-root *::after { box-sizing: border-box; }

.ifd-root :is(h1, h2, h3, h4, p, ul, ol, figure, blockquote) { margin: 0; padding: 0; }
.ifd-root :is(ul, ol) { list-style: none; }
.ifd-root :where(a) { color: inherit; text-decoration: none; }
.ifd-root svg { display: block; flex: none; }

/* :where() keeps this reset at zero specificity so every component rule
   below wins by source order — :is(button) would weigh 0-1-1 and silently
   defeat single-class rules like .ifd-tab. */
.ifd-root :where(button, input, select) {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
}
.ifd-root :where(button) { cursor: pointer; }
.ifd-root :where(button):disabled { opacity: 0.55; cursor: default; }
.ifd-root :where(button):not(:disabled):active { transform: translateY(0.5px); }
.ifd-root :where(h2, h3, p, dl, dt, dd, ul, li, figure) { margin: 0; padding: 0; font: inherit; list-style: none; }

/* visually hidden, exposed to assistive tech */
.ifd-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.ifd-root :focus-visible {
  outline: 2px solid var(--ifd-accent-bright);
  outline-offset: 2px;
}

.ifd-root :is(.ifd-list-pane, .ifd-drawer-scroll, .ifd-shortcuts-card, .ifd-evidence-stage) {
  scrollbar-width: thin;
  scrollbar-color: var(--ifd-border-strong) transparent;
}

/* --------------------------------------------------------------- toolbar */
.ifd-toolbar {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 8px 10px;
  background: var(--ifd-surface);
  border-bottom: 1px solid var(--ifd-border);
}

.ifd-project,
.ifd-type-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: none;
}

.ifd-root :is(.ifd-project-select, .ifd-type-filter select, select.ifd-type-filter) {
  appearance: none;
  height: 28px;
  padding: 0 22px 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text);
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  background: transparent;
  cursor: pointer;
  max-width: 160px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifd-root :is(.ifd-project-select, .ifd-type-filter select, select.ifd-type-filter):hover {
  background: var(--ifd-raised);
  border-color: var(--ifd-border-strong);
}
.ifd-root :is(.ifd-project, .ifd-type-filter) > svg {
  position: absolute;
  right: 6px;
  width: 12px;
  height: 12px;
  color: var(--ifd-text-3);
  pointer-events: none;
}

/* tabs */
/* Segmented control: inset track one step below the toolbar surface, the
   active tab lifted back up as a bordered pill — each tab owns a clear zone
   so a count never visually attaches to the next tab's glyph. */
/* Each tab is a standalone bordered chip with real air between them; the
   active one is tinted with the accent so the current filter is unmissable. */
.ifd-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.ifd-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text-2);
  background: color-mix(in srgb, var(--ifd-raised) 55%, transparent);
  box-shadow: inset 0 0 0 1px var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
}
.ifd-tab:hover {
  color: var(--ifd-text);
  background: color-mix(in srgb, var(--ifd-raised) 90%, transparent);
  box-shadow: inset 0 0 0 1px var(--ifd-border-strong);
}
.ifd-tab[aria-checked="true"] {
  color: var(--ifd-text);
  background: color-mix(in srgb, var(--ifd-accent) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ifd-accent) 42%, transparent);
}
.ifd-tab-glyph { display: inline-flex; }
.ifd-tab-glyph svg { width: 13px; height: 13px; }
.ifd-tab-count {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ifd-text-3) 16%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-2);
}
/* count chips take their status hue — each label reads as its own object */
.ifd-tab[data-status="open"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-open) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-open) 75%, var(--ifd-text));
}
.ifd-tab[data-status="in_progress"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-progress) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-progress) 75%, var(--ifd-text));
}
.ifd-tab[data-status="resolved"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-resolved) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-resolved) 75%, var(--ifd-text));
}
.ifd-tab[data-status="wont_fix"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-wontfix) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-wontfix) 75%, var(--ifd-text));
}
.ifd-tab[aria-checked="true"] .ifd-tab-count { font-weight: 600; }

.ifd-toolbar-spacer { flex: 1 1 0; min-width: 0; }

/* search */
.ifd-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  width: 200px;
  padding: 0 8px;
  background: var(--ifd-raised);
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  flex: none;
}
.ifd-search:focus-within { border-color: var(--ifd-accent); }
.ifd-search > svg { width: 14px; height: 14px; color: var(--ifd-text-3); }
.ifd-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  font-size: 12px;
  color: var(--ifd-text);
}
.ifd-search-input::placeholder { color: var(--ifd-text-3); }
.ifd-search-clear {
  display: inline-flex;
  flex: none;
  color: var(--ifd-text-3);
  border-radius: var(--ifd-radius-xs);
}
.ifd-search-clear:hover { color: var(--ifd-text); }
.ifd-search-clear svg { width: 12px; height: 12px; }
.ifd-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
.ifd-search-input:focus-visible { outline: none; }

/* kbd chips */
.ifd-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-family: var(--ifd-mono);
  font-size: 10.5px;
  line-height: 1;
  color: var(--ifd-text-3);
  background: var(--ifd-raised);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-xs);
  white-space: nowrap;
}

/* icon buttons */
.ifd-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-sm);
}
.ifd-icon-btn:hover { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-spin svg { animation: ifd-spin 0.8s linear infinite; }
@keyframes ifd-spin { to { transform: rotate(360deg); } }

/* ------------------------------------------------------------------ body */
.ifd-body {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
}
.ifd-list-pane {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.ifd-list { outline: none; transition: opacity 120ms var(--ifd-ease); }
.ifd-list[aria-busy="true"] { opacity: 0.6; pointer-events: none; }
.ifd-list:focus-visible { outline: none; }

/* ------------------------------------------------------------------ rows */
.ifd-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--ifd-row-h);
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
  cursor: pointer;
  transition: opacity 160ms var(--ifd-ease), height 160ms var(--ifd-ease);
}
.ifd-row:hover { background: var(--ifd-raised); }
.ifd-row-focused,
.ifd-row[aria-selected="true"] {
  background: var(--ifd-raised);
  box-shadow: inset 2px 0 0 0 var(--ifd-accent-bright);
}
.ifd-list:focus-visible .ifd-row-focused {
  outline: 2px solid var(--ifd-accent-bright);
  outline-offset: -2px;
}
/* Transient exit after a status change removes the row from the filter.
   A @keyframes animation, NOT a transition — ghost rows are inserted fresh
   into the DOM and transitions never fire on newly inserted elements. */
.ifd-row-leaving {
  overflow: hidden;
  pointer-events: none;
  animation: ifd-row-leave 160ms var(--ifd-ease) forwards;
}
@keyframes ifd-row-leave {
  from {
    opacity: 1;
    height: var(--ifd-row-h);
  }
  to {
    opacity: 0;
    height: 0;
    min-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    border-bottom-width: 0;
  }
}

.ifd-row-status { display: inline-flex; flex: none; }
.ifd-row[data-status="open"] .ifd-row-status { color: var(--ifd-st-open); }
.ifd-row[data-status="in_progress"] .ifd-row-status { color: var(--ifd-st-progress); }
.ifd-row[data-status="resolved"] .ifd-row-status { color: var(--ifd-st-resolved); }
.ifd-row[data-status="wont_fix"] .ifd-row-status { color: var(--ifd-st-wontfix); }

/* Closed items (resolved / wont_fix) fade the whole row so an open backlog
   stands out at a glance; hover/focus/selection lift it back to full opacity
   since the row is still actionable (e.g. reopening it). */
.ifd-row[data-status="resolved"],
.ifd-row[data-status="wont_fix"] {
  opacity: 0.55;
}
.ifd-row[data-status="resolved"]:hover,
.ifd-row[data-status="wont_fix"]:hover,
.ifd-row[data-status="resolved"].ifd-row-focused,
.ifd-row[data-status="wont_fix"].ifd-row-focused,
.ifd-row[data-status="resolved"][aria-selected="true"],
.ifd-row[data-status="wont_fix"][aria-selected="true"] {
  opacity: 0.85;
}

/* status glyph coloring contract: data-status on the glyph's direct parent
   (first svg only — trailing chevrons/checks keep the text color) */
.ifd-root [data-status="open"] > svg:first-of-type { color: var(--ifd-st-open); }
.ifd-root [data-status="in_progress"] > svg:first-of-type { color: var(--ifd-st-progress); }
.ifd-root [data-status="resolved"] > svg:first-of-type { color: var(--ifd-st-resolved); }
.ifd-root [data-status="wont_fix"] > svg:first-of-type { color: var(--ifd-st-wontfix); }
.ifd-tab[data-status="open"] .ifd-tab-glyph { color: var(--ifd-st-open); }
.ifd-tab[data-status="in_progress"] .ifd-tab-glyph { color: var(--ifd-st-progress); }
.ifd-tab[data-status="resolved"] .ifd-tab-glyph { color: var(--ifd-st-resolved); }
.ifd-tab[data-status="wont_fix"] .ifd-tab-glyph { color: var(--ifd-st-wontfix); }

/* type marker: 6×6 filled rounded square — square = type, circle = status */
.ifd-type-square {
  width: 6px;
  height: 6px;
  border-radius: 1.5px;
  flex: none;
  background: currentColor;
}
.ifd-type-square[data-type="question"] { background: var(--ifd-ty-question); }
.ifd-type-square[data-type="change"] { background: var(--ifd-ty-change); }
.ifd-type-square[data-type="bug"] { background: var(--ifd-ty-bug); }
.ifd-type-square[data-type="other"] { background: var(--ifd-ty-other); }

.ifd-row-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-row-type .ifd-type-label { display: none; }

.ifd-row-message {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 450;
}
.ifd-row[data-status="resolved"] .ifd-row-message,
.ifd-row[data-status="wont_fix"] .ifd-row-message { color: var(--ifd-text-2); }

.ifd-row-path {
  display: none;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-3);
}
.ifd-row-author {
  display: none;
  flex: none;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-row-camera { display: inline-flex; flex: none; color: var(--ifd-text-3); }
.ifd-row-camera svg { width: 13px; height: 13px; }
.ifd-row-time {
  flex: none;
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-3);
}

.ifd-loadmore {
  display: flex;
  justify-content: center;
  padding: 8px 12px;
}

/* -------------------------------------------------------------- buttons */
.ifd-root :is(.ifd-btn, .ifd-btn-ghost, .ifd-btn-primary, .ifd-btn-danger, .ifd-btn-danger-ghost) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
  cursor: pointer;
}
.ifd-btn {
  color: var(--ifd-text);
  background: var(--ifd-raised);
  border-color: var(--ifd-border-strong);
}
.ifd-btn:hover { border-color: var(--ifd-text-3); }
.ifd-btn-ghost { color: var(--ifd-text-2); }
.ifd-btn-ghost:hover { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-btn-primary { color: #ffffff; background: var(--ifd-accent); }
.ifd-btn-primary:hover { background: color-mix(in srgb, var(--ifd-accent) 88%, #ffffff); }
.ifd-btn-primary svg { width: 13px; height: 13px; }
.ifd-btn-danger { color: #ffffff; background: var(--ifd-danger-strong); }
.ifd-btn-danger:hover { background: color-mix(in srgb, var(--ifd-danger-strong) 85%, #ffffff); }
.ifd-btn-danger-ghost { color: var(--ifd-danger); }
.ifd-btn-danger-ghost:hover { background: color-mix(in srgb, var(--ifd-danger) 12%, transparent); }

/* -------------------------------------------------------------- skeleton */
.ifd-skel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--ifd-row-h);
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
}
.ifd-skel-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--ifd-raised);
  animation: ifd-pulse 1.6s linear infinite;
}
.ifd-skel-bar:nth-child(1) { width: 16px; height: 16px; border-radius: 8px; }
.ifd-skel-bar:nth-child(2) { width: 45%; }
.ifd-skel-bar:nth-child(3) { width: 90px; margin-left: auto; }
.ifd-skel-row:nth-child(2) .ifd-skel-bar { animation-delay: 0.15s; }
.ifd-skel-row:nth-child(3) .ifd-skel-bar { animation-delay: 0.3s; }
.ifd-skel-row:nth-child(4) .ifd-skel-bar { animation-delay: 0.45s; }
.ifd-skel-row:nth-child(5) .ifd-skel-bar { animation-delay: 0.6s; }
@keyframes ifd-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* --------------------------------------------------------- empty / error */
.ifd-empty,
.ifd-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 280px;
  padding: 48px 24px;
  text-align: center;
}
.ifd-empty-glyph {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--ifd-text-3);
}
.ifd-empty-glyph > svg { width: 20px; height: 20px; }
.ifd-empty-title { font-size: 13px; font-weight: 600; color: var(--ifd-text); }
.ifd-empty-sub { font-size: 12px; color: var(--ifd-text-2); }
.ifd-root :is(.ifd-empty, .ifd-error) :is(.ifd-btn, .ifd-btn-ghost) { margin-top: 10px; }

/* ---------------------------------------------------------------- drawer */
.ifd-drawer-backdrop {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--ifd-dim);
  animation: ifd-fade-in 180ms var(--ifd-ease);
}
@keyframes ifd-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ifd-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--ifd-surface);
  border-left: 1px solid var(--ifd-border);
  box-shadow: 0 0 0 1px var(--ifd-border), -24px 0 48px -24px rgb(0 0 0 / 0.5);
  animation: ifd-drawer-in 180ms var(--ifd-ease);
}
@keyframes ifd-drawer-in {
  from { transform: translateX(16px); opacity: 0; }
  to { transform: none; opacity: 1; }
}

.ifd-drawer-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
}
.ifd-drawer-titles {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ifd-drawer-type {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ifd-text);
  white-space: nowrap;
}
.ifd-drawer-id {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ifd-drawer-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px 14px 18px;
}

.ifd-drawer-foot {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--ifd-border);
}
.ifd-drawer-foot .ifd-btn-primary { flex: 1 1 auto; }

/* ----------------------------------------------------------- status menu */
.ifd-status-menu { position: relative; flex: none; }
.ifd-status-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 9px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
}
.ifd-status-menu-trigger:hover { background: var(--ifd-raised); }
.ifd-status-menu-trigger > svg { width: 13px; height: 13px; }
.ifd-status-menu-pop {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 7;
  min-width: 160px;
  padding: 4px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
}
.ifd-status-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-xs);
  text-align: left;
}
.ifd-status-menu-item:hover,
.ifd-status-menu-item-active { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-status-menu-item[aria-selected="true"] { color: var(--ifd-text); }
.ifd-status-menu-item > svg:last-child { margin-left: auto; color: var(--ifd-text-2); }

/* expandable console entries render as real buttons; inherit the mono look.
   No display here — the base .ifd-diag-msg -webkit-box clamp must keep
   applying while collapsed (data-expanded flips it to block). */
.ifd-root :where(button).ifd-diag-msg { width: 100%; text-align: left; }
.ifd-root :where(button).ifd-diag-msg:hover { color: var(--ifd-text); }

/* --------------------------------------------- evidence card (signature) */
.ifd-evidence {
  flex: none;
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  overflow: hidden;
  background: var(--ifd-surface);
}
.ifd-evidence-stage {
  position: relative;
  overflow: hidden;
  background: #000000;
}
.ifd-root[data-theme="light"] .ifd-evidence-stage { background: #f1f5f9; }
.ifd-evidence-img {
  display: block;
  width: 100%;
  height: auto;
  cursor: zoom-in;
}
.ifd-evidence-zoomed { overflow: auto; max-height: 420px; }
.ifd-evidence-zoomed .ifd-evidence-img {
  width: auto;
  max-width: none;
  cursor: zoom-out;
}
/* the region overlay only maps onto the fitted (non-zoomed) image */
.ifd-evidence-zoomed :is(.ifd-evidence-dim, .ifd-evidence-rect) { display: none; }

.ifd-evidence-dim {
  position: absolute;
  background: rgb(2 6 23 / 0.42);
  pointer-events: none;
}
.ifd-evidence-rect {
  position: absolute;
  border: 1.5px solid var(--ifd-accent-bright);
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 20px color-mix(in srgb, var(--ifd-accent) 45%, transparent);
  pointer-events: none;
}
/* viewfinder corner brackets — 8 gradient strips, one element, always shown */
.ifd-evidence-corners {
  position: absolute;
  inset: 5px;
  pointer-events: none;
  background-image:
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent));
  background-repeat: no-repeat;
  background-size: 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px;
  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;
}

.ifd-evidence-caption {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 6px 10px;
  border-top: 1px solid var(--ifd-border);
  font-family: var(--ifd-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-3);
}
.ifd-evidence-caption > * { white-space: nowrap; }
.ifd-evidence-caption > :first-child {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ifd-evidence-toggle {
  margin-left: auto;
  padding: 2px 5px;
  font-family: var(--ifd-font);
  font-size: 11px;
  font-weight: 500;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-xs);
  white-space: nowrap;
}
.ifd-evidence-toggle:hover { color: var(--ifd-text); background: var(--ifd-raised); }

/* no-screenshot fallback — same bracket framing around the anchor data */
.ifd-evidence-fallback {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 18px;
}
.ifd-anchor-selector {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-2);
  background: var(--ifd-raised);
  padding: 4px 8px;
  border-radius: var(--ifd-radius-xs);
  overflow-wrap: anywhere;
  cursor: copy;
}
.ifd-anchor-selector:hover { color: var(--ifd-text); }
.ifd-anchor-snippet {
  padding: 2px 0 2px 10px;
  border-left: 2px solid var(--ifd-border-strong);
  font-size: 12px;
  font-style: italic;
  line-height: 1.5;
  color: var(--ifd-text-2);
  overflow-wrap: anywhere;
}

/* --------------------------------------------------------- drawer content */
.ifd-message {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--ifd-text);
}

.ifd-micro,
.ifd-meta-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ifd-text-3);
}
.ifd-mono {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
}
.ifd-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ifd-meta-grid {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 7px 12px;
  align-items: baseline;
}
.ifd-meta-value {
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ifd-text);
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.ifd-meta-value a { color: var(--ifd-accent-bright); }
.ifd-meta-value a:hover { text-decoration: underline; }
/* technical values (URL, viewport, email) get the mono treatment */
.ifd-meta-value[data-mono],
.ifd-meta-value [data-mono] {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  overflow-wrap: anywhere;
}

/* ------------------------------------------------------------ diagnostics */
.ifd-diagnostics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ifd-diag-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ifd-diag-entry {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 8px 4px 10px;
  border-left: 2px solid var(--ifd-border-strong);
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--ifd-text-2);
}
.ifd-diag-entry[data-level="error"] { border-left-color: var(--ifd-danger); }
.ifd-diag-entry[data-level="warn"] { border-left-color: var(--ifd-st-progress); }
.ifd-diag-time {
  flex: none;
  color: var(--ifd-text-3);
  font-variant-numeric: tabular-nums;
}
.ifd-diag-level {
  flex: none;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ifd-diag-entry[data-level="error"] :is(.ifd-diag-level, .ifd-diag-status) { color: var(--ifd-danger); }
.ifd-diag-entry[data-level="warn"] .ifd-diag-level { color: var(--ifd-st-progress); }
.ifd-diag-msg {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}
.ifd-diag-entry[data-expanded="true"] .ifd-diag-msg { display: block; }
.ifd-diag-method { flex: none; font-weight: 600; }
.ifd-diag-status { flex: none; font-variant-numeric: tabular-nums; }
.ifd-diag-url {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifd-diag-dur {
  flex: none;
  color: var(--ifd-text-3);
  font-variant-numeric: tabular-nums;
}

/* ------------------------------------------------------------ danger zone */
.ifd-danger-zone {
  display: flex;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--ifd-border);
}
.ifd-confirm {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--ifd-text-2);
}

/* ----------------------------------------------------------------- hints */
.ifd-hints {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  height: 32px;
  padding: 0 12px;
  border-top: 1px solid var(--ifd-border);
  background: var(--ifd-surface);
  font-size: 11px;
  color: var(--ifd-text-3);
  overflow: hidden;
  white-space: nowrap;
}
.ifd-hints > * {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
}

/* ----------------------------------------------------------------- toast */
.ifd-toast {
  position: absolute;
  left: 50%;
  bottom: 44px;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px 5px 12px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
  box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.4);
  font-size: 12px;
  color: var(--ifd-text);
  white-space: nowrap;
  animation: ifd-toast-in 160ms var(--ifd-ease);
}
@keyframes ifd-toast-in {
  from { transform: translate(-50%, 8px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.ifd-toast-msg { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

/* ------------------------------------------------------ shortcuts overlay */
.ifd-shortcuts {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--ifd-dim);
  animation: ifd-fade-in 160ms var(--ifd-ease);
}
.ifd-shortcuts-card {
  min-width: 260px;
  max-width: 340px;
  max-height: 100%;
  overflow-y: auto;
  padding: 18px 20px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius);
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-shortcuts-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 14px;
  align-items: center;
  margin-top: 12px;
}
.ifd-shortcut-keys {
  display: inline-flex;
  gap: 4px;
  justify-self: start;
}
.ifd-shortcut-label::first-letter { text-transform: uppercase; }

/* ---------------------------------------------------- container queries */
@container spd (min-width: 560px) {
  .ifd-row-path { display: block; }
}
@container spd (min-width: 640px) {
  .ifd-row-author { display: block; }
}
@container spd (min-width: 720px) {
  .ifd-row-type .ifd-type-label { display: inline; }
}
@container spd (min-width: 960px) {
  .ifd-drawer {
    position: static;
    flex: none;
    width: 400px;
    box-shadow: none;
    z-index: auto;
    animation: none;
  }
  .ifd-drawer-backdrop { display: none; }
}
/* narrow containers: keep the toolbar on one line */
@container spd (max-width: 719.98px) {
  .ifd-search { width: 150px; }
  .ifd-search .ifd-kbd { display: none; }
}
@container spd (max-width: 619.98px) {
  .ifd-tab .ifd-tab-label { display: none; }
  .ifd-tab[data-status="all"] .ifd-tab-label,
  .ifd-tab[aria-checked="true"] .ifd-tab-label { display: inline; }
}
@container spd (max-width: 479.98px) {
  /* Keep the type filter reachable (WCAG 1.4.10 reflow) — the wrapping
     toolbar absorbs the width; just tighten it. */
  .ifd-type-filter select { max-width: 110px; }
  .ifd-search { width: 120px; }
}

/* ---------------------------------------------------------------- motion */
@media (prefers-reduced-motion: reduce) {
  /* !important is deliberate: this kill-switch must beat every specificity,
     including compound rules like .ifd-spin svg. */
  .ifd-root *,
  .ifd-root *::before,
  .ifd-root *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* ---------------------------------------------------------- forced colors */
@media (forced-colors: active) {
  .ifd-root,
  .ifd-root * { border-color: CanvasText; }
  .ifd-row-focused,
  .ifd-row[aria-selected="true"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
`;
