/** Maximum z-index value — ensures the widget renders above all page content. */
export const Z_INDEX_MAX = 2147483647;

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
