/**
 * Top-layer placement for host-popup selection surfaces.
 *
 * An open `popover` or modal `<dialog>` renders in the browser's top layer,
 * above every z-index. A body-level selection overlay at the maximum z-index
 * therefore slides underneath exactly the menu or popover a user wants to
 * annotate: the picker outline is hidden behind it and a drag cannot start on
 * it. Showing the surface as a manual popover puts it in the top layer as
 * well, above whatever was already open.
 *
 * The top layer stacks in show order, so the widget's own `<instafix-widget>`
 * hosts are shown again afterwards: its toolbar must stay clickable above the
 * overlay (pressing the lit button again ends the session).
 *
 * Callers keep the popover UA defaults (`inset: 0`, `margin: auto`, padding,
 * border, fit-content size) neutral in their own inline styles.
 */

/** Show an attached element in the top layer, above what is already there. No-op without the Popover API. */
export function liftToTopLayer(element: HTMLElement): void {
  if (typeof element.showPopover !== "function" || !element.isConnected) return;
  if (!element.hasAttribute("popover")) element.setAttribute("popover", "manual");
  try {
    // Showing again is what moves an already open element to the top.
    if (isPopoverOpen(element)) element.hidePopover();
    element.showPopover();
  } catch {
    // Not showable here — normal z-index stacking still applies.
  }
}

function isPopoverOpen(element: Element): boolean {
  try {
    return element.matches(":popover-open");
  } catch {
    return false;
  }
}

/** Re-show every widget host above a surface that was just lifted. */
export function raiseWidgetHosts(): void {
  for (const host of document.querySelectorAll<HTMLElement>("instafix-widget")) liftToTopLayer(host);
}
