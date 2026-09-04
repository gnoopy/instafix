/**
 * Freeze the host page so a transient state can be annotated.
 *
 * Two problems, one mechanism:
 *
 * 1. **Animations and media** run away from you. A loading spinner, a toast
 *    mid-fade, a carousel — by the time the selection is drawn the frame you
 *    meant is gone. Pausing CSS animations, killing transitions, and pausing
 *    `<video>`/`<audio>` holds the frame.
 *
 * 2. **Hover- and focus-revealed elements** disappear the moment the pointer
 *    leaves to go operate the widget — a dropdown, a tooltip, a hover toolbar.
 *    This is the harder one, and a screenshot cannot solve it: html2canvas
 *    renders a *clone* of the document, and `:hover` applies to the real
 *    pointer position only, so the clone comes out un-hovered. What does
 *    survive is the computed style of the live, currently-hovered subtree —
 *    so freezing copies those computed values into inline styles. The reveal
 *    then no longer depends on `:hover` at all, and the element stays put
 *    after the pointer moves away.
 *
 * Everything is restored exactly on `release()`: the injected stylesheet is
 * removed, media that WE paused is resumed (media the user had already
 * paused is left alone), and every inline property we wrote is put back to
 * the value it had — including "was not set at all", which is why the
 * snapshot stores `null` rather than an empty string for absent properties.
 *
 * Trigger this from a keyboard shortcut, not a click: reaching for a button
 * moves the pointer, and moving the pointer is exactly what loses the hover
 * state you are trying to keep.
 */

/** Injected stylesheet id — also how `isFrozen` answers without extra state. */
const STYLE_ID = "instafix-freeze-style";

/**
 * Properties copied from the live computed style onto the revealed subtree.
 *
 * Deliberately short: these are the ones a reveal is actually implemented
 * with. Writing a broader set (every box-model property, say) would pin
 * layout that should still respond to a resize, and would fight the host's
 * own responsive rules for no benefit.
 */
const REVEAL_PROPERTIES = [
  "display",
  "visibility",
  "opacity",
  "transform",
  "pointer-events",
  "max-height",
  "clip-path",
] as const;

/** Upper bound on pinned elements — a hovered `<body>` must not mean inlining styles onto the whole page. */
const MAX_PINNED_ELEMENTS = 300;

/** One element's inline values before we touched them; `null` means "the property was not set inline". */
interface PinnedElement {
  element: HTMLElement;
  previous: Array<[string, string | null]>;
}

export interface FrozenPage {
  /** Elements whose reveal state was pinned — the hovered chain's deepest subtree. */
  readonly pinnedCount: number;
  /** Media elements this freeze paused (and will resume). */
  readonly pausedMediaCount: number;
  /** Undo everything: stylesheet, media, inline styles. Safe to call twice. */
  release(): void;
}

function isFrozenStyleMounted(): boolean {
  return typeof document !== "undefined" && document.getElementById(STYLE_ID) !== null;
}

/** True while a freeze is active. */
export function isFrozen(): boolean {
  return isFrozenStyleMounted();
}

/**
 * Pause CSS animations and transitions everywhere EXCEPT the widget's own
 * chrome. The panel/FAB live in a closed shadow root, which a page-level
 * stylesheet cannot reach anyway; the annotator overlay, popup and markers
 * live in `document.body` and opt out through `data-instafix-ignore`, the
 * same attribute the screenshot capture already excludes them with.
 */
function injectFreezeStylesheet(): HTMLStyleElement {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    *:not(instafix-widget):not(instafix-widget *):not([data-instafix-ignore]):not([data-instafix-ignore] *) {
      animation-play-state: paused !important;
      transition: none !important;
      caret-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

/** Pause playing media; returns only what WE paused, so `release` cannot resume something the user had stopped. */
function pauseMedia(): HTMLMediaElement[] {
  const paused: HTMLMediaElement[] = [];
  const media = document.querySelectorAll<HTMLMediaElement>("video, audio");
  for (const el of media) {
    if (el.closest("instafix-widget") || el.closest("[data-instafix-ignore]")) continue;
    if (el.paused) continue;
    try {
      el.pause();
      paused.push(el);
    } catch {
      // Cross-origin media in an iframe-ish context, or a detached element — skip it
    }
  }
  return paused;
}

/**
 * Copy the live computed values of {@link REVEAL_PROPERTIES} onto the deepest
 * hovered element and its descendants, so the reveal outlives the pointer.
 *
 * `:hover` matches the whole chain from `<html>` down; the LAST entry is the
 * innermost hovered element, and the thing a `:hover` rule reveals is
 * essentially always inside it. Starting from `<html>` instead would pin the
 * entire document.
 */
function pinHoverReveal(): PinnedElement[] {
  let chain: NodeListOf<Element>;
  try {
    chain = document.querySelectorAll(":hover");
  } catch {
    return []; // No pointer, or an engine that rejects the selector
  }
  const deepest = chain[chain.length - 1];
  if (!(deepest instanceof HTMLElement)) return [];
  // Nothing meaningful to pin when the pointer is only over page furniture.
  if (deepest === document.body || deepest === document.documentElement) return [];
  if (deepest.closest("instafix-widget") || deepest.closest("[data-instafix-ignore]")) return [];

  const targets: HTMLElement[] = [deepest];
  for (const child of deepest.querySelectorAll<HTMLElement>("*")) {
    if (targets.length >= MAX_PINNED_ELEMENTS) break;
    targets.push(child);
  }

  const pinned: PinnedElement[] = [];
  for (const element of targets) {
    const computed = getComputedStyle(element);
    const previous: Array<[string, string | null]> = [];
    for (const property of REVEAL_PROPERTIES) {
      // `getPropertyValue` on the inline style returns "" for unset, which is
      // indistinguishable from an explicit empty — record null instead so the
      // restore can remove the property rather than blank it.
      const inline = element.style.getPropertyValue(property);
      previous.push([property, inline === "" ? null : inline]);
      element.style.setProperty(property, computed.getPropertyValue(property), "important");
    }
    pinned.push({ element, previous });
  }
  return pinned;
}

/**
 * Freeze the page. Returns a handle that undoes everything; calling it twice
 * is a no-op. When a freeze is already active this is a no-op too, returning
 * an inert handle, so a double-trigger cannot double-pin styles.
 */
export function freezePage(): FrozenPage {
  if (typeof document === "undefined" || isFrozenStyleMounted()) {
    return { pinnedCount: 0, pausedMediaCount: 0, release: () => {} };
  }

  // Pin BEFORE injecting the stylesheet: the stylesheet sets
  // `transition: none`, and reading computed styles after that would capture
  // the mid-transition value as if it were the settled one.
  const pinned = pinHoverReveal();
  const style = injectFreezeStylesheet();
  const paused = pauseMedia();

  let released = false;
  return {
    pinnedCount: pinned.length,
    pausedMediaCount: paused.length,
    release() {
      if (released) return;
      released = true;
      style.remove();
      for (const element of paused) {
        // The element may have been removed from the DOM while frozen.
        void element.play().catch(() => {});
      }
      for (const { element, previous } of pinned) {
        for (const [property, value] of previous) {
          if (value === null) element.style.removeProperty(property);
          else element.style.setProperty(property, value);
        }
      }
    },
  };
}
