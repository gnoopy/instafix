/**
 * Headless capture for hosts that render their own feedback UI.
 *
 * The regular Annotator still owns element/region selection, anchors, DOM/CSS
 * inspection and the screenshot. Instead of the built-in popup, the host
 * receives the finished selection and decides how to comment on, store or send
 * it. Nothing is posted to a store from here.
 */
import type { AnnotationPayload } from "@instafix/core";
import { type AnnotationComplete, Annotator, type HostPopup } from "./annotator.js";
import { type AnchorResolution, resolveAnchor } from "./dom/resolver.js";
import { EventBus, type WidgetEvents } from "./events.js";
import { createT, loadLocale } from "./i18n/index.js";
import type { AnnotatedScreenshot } from "./screenshot.js";
import { buildThemeColors } from "./styles/theme.js";

export type HeadlessCaptureMode = "element" | "region";

export interface HeadlessCapture {
  annotations: AnnotationPayload[];
  url: string;
  title: string;
  viewport: string;
  capturedAt: string;
  /** Dev-only component source hint (`Component · file:line`) when the page exposes one. */
  sourceHint: string | null;
  screenshotDataUrl: string | null;
  /** Where the selection sits inside the screenshot, as fractions of the image. */
  screenshotRegion: AnnotatedScreenshot["region"] | null;
  /** `off` when not requested, `failed` when requested but unavailable. */
  screenshotState: "off" | "captured" | "failed";
}

export interface HeadlessCaptureOptions {
  mode: HeadlessCaptureMode;
  screenshot: boolean;
  /** Selection accent color. Default `#4f8cf7`. */
  accent?: string;
  /** Locale of the selection chrome. Default `en`. */
  locale?: string;
  /** The selection is final; the screenshot, when requested, is being taken (can take seconds). */
  onSelect?: () => void;
  onCapture: (capture: HeadlessCapture) => void;
  onCancel: () => void;
}

type SubmitHandler = Parameters<HostPopup["show"]>[1];

/** Start one element or region selection. Resolves to a function that cancels it. */
export async function startCapture(options: HeadlessCaptureOptions): Promise<() => void> {
  const locale = options.locale ?? "en";
  await loadLocale(locale);
  const bus = new EventBus<WidgetEvents>();
  let annotator: Annotator | undefined;
  let open = false;
  let selected = false;
  let cancelled = false;
  let sourceHint: string | null = null;
  let resolvePopup: ((value: null) => void) | null = null;
  let abort = () => {};
  const aborted = new Promise<void>((resolve) => {
    abort = resolve;
  });

  const popup: HostPopup = {
    get isOpen() {
      return open;
    },
    pastedScreenshotDataUrl: null,
    refreshLabels() {},
    setLegend() {},
    setPromptContext() {},
    setSourceHint(hint) {
      sourceHint = hint ? [hint.componentPath, hint.location].filter(Boolean).join(" · ") : null;
    },
    cancelOpen() {
      open = false;
      resolvePopup?.(null);
      resolvePopup = null;
    },
    destroy() {
      this.cancelOpen();
    },
    show(_rect, onSubmit) {
      open = true;
      const closed = new Promise<null>((resolve) => {
        resolvePopup = resolve;
      });
      // After show() returns: the Annotator sets the source hint synchronously.
      queueMicrotask(() => void submit(onSubmit));
      return closed;
    },
  };

  // Run the Annotator's own submit handler, as the built-in popup's Send does.
  // It captures the screenshot once, with the rectangle it reports (the drawn
  // region or the picked element's viewport-clamped box), while the session is
  // still live, then announces `annotation:complete`. Nothing is sent to a
  // store, so the submission is settled right there.
  async function submit(onSubmit: SubmitHandler) {
    if (selected || cancelled) return;
    selected = true;
    if (!onSubmit) {
      cancel();
      options.onCancel();
      return;
    }
    options.onSelect?.();
    // Read before the async capture: route and viewport belong to this selection.
    const context = {
      url: location.href,
      title: document.title,
      viewport: `${innerWidth}x${innerHeight}`,
      capturedAt: new Date().toISOString(),
      sourceHint,
    };
    const outcome: { value?: AnnotationComplete } = {};
    const unsubscribe = bus.on("annotation:complete", (data) => {
      outcome.value = data;
      bus.emit("submission:cancelled");
    });
    await Promise.race([onSubmit({ type: "change", message: "" }).catch(() => {}), aborted]);
    unsubscribe();
    if (cancelled) return;
    popup.cancelOpen();
    teardown();
    const completed = outcome.value;
    if (!completed) {
      options.onCancel();
      return;
    }
    options.onCapture({
      annotations: structuredClone(completed.annotations),
      ...context,
      screenshotDataUrl: completed.screenshotDataUrl ?? null,
      screenshotRegion: completed.screenshotRegion ?? null,
      screenshotState: !options.screenshot ? "off" : completed.screenshotDataUrl ? "captured" : "failed",
    });
  }

  function teardown() {
    surfaces.disconnect();
    annotator?.destroy();
    window.removeEventListener("keydown", onKeydown, true);
    window.removeEventListener("pointerdown", shield, true);
    window.removeEventListener("mousedown", shield, true);
    window.removeEventListener("blur", onInterrupted);
    document.removeEventListener("visibilitychange", onInterrupted);
  }

  function end() {
    cancel();
    options.onCancel();
  }

  function cancel() {
    cancelled = true;
    abort();
    popup.cancelOpen();
    teardown();
    bus.removeAll();
  }

  // Element selection picks on click. Suppress the page's own pointerdown and
  // mousedown actions (menus, drags) so picking a control does not also run it.
  // Window capture runs before any document listener, so a host menu that
  // dismisses on a document-level press stays open while its items are picked.
  function shield(event: Event) {
    if (options.mode !== "element") return;
    const target = event.composedPath()[0];
    if (target instanceof Element && isWidgetChrome(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // Escape always ends a live session. Window capture is the first stop of a
  // key event, so no host handler that stops propagation can swallow it, and
  // the key is consumed so it does not also close a host popover being
  // recorded. `code` covers IME composition, where `key` reads "Process".
  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Escape" && event.code !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    end();
  }

  // Failsafe: a selection that has not been made yet ends when the page loses
  // the keyboard (another window, or an iframe that would receive Escape) or
  // is hidden. A finished selection keeps its capture.
  function onInterrupted(event: Event) {
    if (selected || cancelled) return;
    if (event.type === "visibilitychange" && document.visibilityState !== "hidden") return;
    end();
  }

  // Guard: if the host removes the selection surfaces (e.g. re-rendering
  // <body>), end the session so no listener or scroll lock outlives them.
  const surfaces = new MutationObserver(() => {
    if (selected || cancelled || document.querySelector(SESSION_SURFACES)) return;
    end();
  });

  window.addEventListener("pointerdown", shield, true);
  window.addEventListener("mousedown", shield, true);
  annotator = new Annotator(
    buildThemeColors(options.accent ?? "#4f8cf7", "dark"),
    bus,
    createT(locale),
    options.screenshot,
    undefined,
    undefined,
    popup,
  );
  window.addEventListener("keydown", onKeydown, true);
  window.addEventListener("blur", onInterrupted);
  document.addEventListener("visibilitychange", onInterrupted);
  bus.emit(options.mode === "region" ? "annotation:start" : "targeting:start");
  surfaces.observe(document.body, { childList: true });
  return cancel;
}

/** The body-level surfaces of a live session: the region overlay or the element-picker highlight. */
const SESSION_SURFACES = '[data-instafix-targeting-highlight],[data-instafix-ignore][role="application"]';

function isWidgetChrome(target: Element): boolean {
  if (target.closest("instafix-widget,[data-instafix-ignore]")) return true;
  const root = target.getRootNode();
  return root instanceof ShadowRoot && root.host.matches("instafix-widget");
}

export interface LocateOptions {
  /** Outline color of visible matches. Default `#4f8cf7`. */
  color?: string;
  /** How long the outlines stay. Default 2500 ms. */
  outlineMs?: number;
}

/**
 * Find recorded annotations on the current page and briefly outline the
 * visible matches. Inspection only: nothing is clicked or changed.
 */
export function locateAnnotations(
  annotations: readonly AnnotationPayload[],
  options: LocateOptions = {},
): AnchorResolution[] {
  const budget = { remaining: 1 };
  const matches = annotations
    .map((annotation) => resolveAnchor(annotation.anchor, { scanBudget: budget }))
    .filter((match): match is AnchorResolution => match !== null);
  for (const match of matches) {
    const rect = match.element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const outline = document.createElement("div");
    outline.dataset.instafixIgnore = "true";
    outline.dataset.instafixLocate = "true";
    Object.assign(outline.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: `2px solid ${options.color ?? "#4f8cf7"}`,
      pointerEvents: "none",
      zIndex: "2147483647",
      boxSizing: "border-box",
    });
    document.body.append(outline);
    setTimeout(() => outline.remove(), options.outlineMs ?? 2500);
  }
  return matches;
}
