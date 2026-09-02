/** Maximum z-index value — ensures the widget renders above all page content. */
export const Z_INDEX_MAX = 2147483647;

/**
 * The widget's single font stack — system-ui first, NO webfont. The old
 * stack led with "Inter", which the widget never loads itself: on a host
 * that happens to serve Inter (like the demo site) the panel rendered in
 * Inter, on every other host it fell back to system-ui — the same widget
 * looked different per host. Leading with system-ui makes every host (and
 * the demo) render identically, with zero external font requests.
 */
export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Minimum viewport width (px) below which the widget is hidden (mobile). */
export const MOBILE_BREAKPOINT = 768;

/** Default number of feedbacks to fetch per page. */
export const PAGE_SIZE = 20;

/**
 * Minimum drag distance (px, either axis) before a pointer-down/up pair is
 * treated as a drag rather than a click (G3). Below this, a small hand
 * tremor must not draw a bogus rectangle — it completes as a single-element
 * selection at the point instead of being silently discarded.
 */
export const CLICK_THRESHOLD_PX = 6;
