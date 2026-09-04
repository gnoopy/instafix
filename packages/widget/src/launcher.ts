import type {
  DiagnosticsSnapshot,
  FeedbackPayload,
  InstaFixConfig,
  InstaFixInstance,
  InstaFixPublicEventListener,
  InstaFixPublicEvents,
  PageScope,
} from "@instafix/core";
import { Annotator } from "./annotator.js";
import { ApiClient, flushRetryQueue, type WidgetClient } from "./api-client.js";
import { FONT_STACK, MOBILE_BREAKPOINT, PAGE_SIZE, Z_INDEX_MAX } from "./constants.js";
import { ConsoleBuffer } from "./diagnostics/console-buffer.js";
import { NetworkBuffer } from "./diagnostics/network-buffer.js";
import { pickAvoidingPosition } from "./dom/overlay-collision.js";
import { detectSelectionColor } from "./dom/selection-color.js";
import { EventBus, type WidgetEvents } from "./events.js";
import { Fab } from "./fab.js";
import { createFocusTracker } from "./focus-tracker.js";
import { createT, loadLocale, type TFunction } from "./i18n/index.js";
import { getIdentity, type Identity, saveIdentity } from "./identity.js";
import { MarkerManager } from "./markers.js";
import { hasSeenOnboarding, Onboarding } from "./onboarding.js";
import type { Panel as PanelType } from "./panel.js";
import { loadPersistedSettings, syncSharedSettings } from "./settings-storage.js";
import { StoreClient } from "./store-client.js";
import { buildStyles } from "./styles/base.js";
import { applyLayerColor, buildThemeColors } from "./styles/theme.js";
import { Tooltip } from "./tooltip.js";

/** Raw, single-mount instance shape — everything `InstaFixInstance` has except `updateConfig`, which is facade-level (see `launch`). */
type RawInstance = Omit<InstaFixInstance, "updateConfig"> & {
  /**
   * Snapshot of UI state that `updateConfig` restores after tearing this
   * instance down and remounting a fresh one — otherwise a single settings
   * tweak would visibly close the panel (the whole widget is rebuilt).
   * Internal to the launcher; never exposed on the public `InstaFixInstance`.
   */
  getUiState: () => { open: boolean; settingsExpanded: boolean };
  /** Re-expand the settings accordion right after a remount. */
  expandSettings: () => void;
};

/** Singleton guard — prevents duplicate widgets from overlapping. Set only on a real mount (never for a skipped one), matching the pre-`updateConfig` behavior of allowing repeated skipped calls to re-evaluate the guards fresh. */
let activeInstance: { readonly facade: InstaFixInstance } | null = null;

interface NormalisedDiagnostics {
  console: boolean;
  network: boolean;
  maxConsoleEntries: number;
  maxNetworkEntries: number;
}

/**
 * Resolve `InstaFixConfig.captureDiagnostics` into a normalised shape.
 *
 * - `undefined` / `false` → everything off (no monkey-patching).
 * - `true` → console + network on with the defaults (50 / 20).
 * - object → per-channel toggles + optional custom sizes; missing booleans
 *   default to `true` so users can pass `{ maxConsoleEntries: 200 }` and
 *   still get both channels.
 */
function normaliseDiagnosticsOptions(value: InstaFixConfig["captureDiagnostics"]): NormalisedDiagnostics {
  if (value === undefined || value === false) {
    return { console: false, network: false, maxConsoleEntries: 50, maxNetworkEntries: 20 };
  }
  if (value === true) {
    return { console: true, network: true, maxConsoleEntries: 50, maxNetworkEntries: 20 };
  }
  return {
    console: value.console !== false,
    network: value.network !== false,
    maxConsoleEntries: typeof value.maxConsoleEntries === "number" ? value.maxConsoleEntries : 50,
    maxNetworkEntries: typeof value.maxNetworkEntries === "number" ? value.maxNetworkEntries : 20,
  };
}

/**
 * Build a no-op InstaFixInstance for when the widget is skipped (SSR, or a
 * guard rejected `config`). `updateConfig` is the one non-noop method: it
 * retries a full `launch()` with the merged config, so e.g. `forceShow`
 * flipped on later via `updateConfig({ forceShow: true })` can still mount
 * for real — that new attempt becomes the actual singleton if it succeeds.
 */
function skippedInstance(config: InstaFixConfig): InstaFixInstance {
  const noop = () => {};
  return {
    destroy: noop,
    open: noop,
    close: noop,
    refresh: noop,
    focusFeedback: () => false,
    on: () => noop,
    off: noop,
    updateConfig: (partial) => {
      launch({ ...config, ...partial } as InstaFixConfig);
    },
  };
}

/** Build a fully inert `RawInstance` — used by `updateConfig` when the merged config now fails a guard. */
function inertRaw(): RawInstance {
  const noop = () => {};
  return {
    destroy: noop,
    open: noop,
    close: noop,
    refresh: noop,
    focusFeedback: () => false,
    on: () => noop,
    off: noop,
    getUiState: () => ({ open: false, settingsExpanded: false }),
    expandSettings: noop,
  };
}

/**
 * Read NODE_ENV so that BOTH detection paths keep working:
 *
 * - The literal `process.env.NODE_ENV` member expression must survive into
 *   our own dist — an identity define in tsup.config.ts stops esbuild's
 *   browser-platform auto-define from folding it to `"production"` and
 *   deleting the guard from the shipped bundle (issue #104).
 * - Shipping the literal lets the CONSUMER's bundler (webpack DefinePlugin,
 *   Vite, esbuild) inline their real environment, so "dev-only by default"
 *   works in bundled deployments even when no `process` global exists at
 *   runtime. Computed-key dodges (`env["NODE_" + "ENV"]`) would defeat that
 *   inlining — do not reintroduce them.
 * - No `typeof process` gate: it would return before a consumer-inlined
 *   constant is reached. Plain browsers without `process` (script-tag usage)
 *   land in the catch instead. Runtime environments with a real `process`
 *   (Node/SSR, E2E's `globalThis.process = { env: { NODE_ENV: 'test' } }`)
 *   read it live.
 *
 * `scripts/verify-dist-guard.mjs` asserts these invariants against every
 * built bundle after each build.
 */
function readNodeEnv(): string | undefined {
  try {
    return process.env.NODE_ENV;
  } catch {
    // No `process` global (plain browser) or restricted access — no signal
    return undefined;
  }
}

interface NormalisedDeepLink {
  enabled: boolean;
  param: string;
}

/**
 * Resolve `InstaFixConfig.deepLink` into a normalised shape.
 *
 * - `undefined` / `false` → disabled, no URL parsing.
 * - `true` → enabled with default param name `instafix`.
 * - object → enabled with optional custom param name. A bare empty object
 *   `{}` falls back to the default param so callers never need to repeat it.
 */
function normaliseDeepLinkOptions(value: InstaFixConfig["deepLink"]): NormalisedDeepLink {
  if (value === undefined || value === false) return { enabled: false, param: "instafix" };
  if (value === true) return { enabled: true, param: "instafix" };
  return { enabled: true, param: value.param ?? "instafix" };
}

/**
 * Main widget launcher — the stable public entry point.
 *
 * Architecture (built by `mount()`, below):
 * - Creates a <instafix-widget> custom element in the document
 * - Attaches a closed Shadow DOM for CSS isolation
 * - FAB + Panel live inside the Shadow DOM
 * - Overlay, markers, tooltips live outside (appended to document.body)
 *
 * Guards (SSR / duplicate-call) live here; everything else (production/mobile/
 * validation guards, then actually building the widget) is `mount()`, which
 * `updateConfig` re-runs with a merged config to apply a live setting change.
 * This wrapper is what makes that possible without invalidating the
 * `InstaFixInstance` the host already has a reference to: `mount()` returns a
 * fresh `RawInstance` every time, but `on`/`off`/etc. here always delegate to
 * whichever raw instance is current, and registered listeners are replayed
 * onto the new one after a remount.
 */
export function launch(config: InstaFixConfig): InstaFixInstance {
  // Guard: no DOM, no widget — SSR frameworks (Next.js, Remix) may run the
  // init on the server. Deliberately NOT bypassed by forceShow: the widget
  // cannot render without a document.
  if (typeof window === "undefined" || typeof document === "undefined") {
    config.onSkip?.("ssr");
    return skippedInstance(config);
  }

  // Guard: prevent duplicate initInstaFix() calls
  if (activeInstance) {
    if (config.debug) console.debug("[instafix]", "initInstaFix() called more than once — returning existing instance");
    return activeInstance.facade;
  }

  const listeners = new Map<string, Set<(...args: never[]) => void>>();
  // Settings the visitor changed via the panel's own settings accordion on a
  // previous visit win over the host's static defaults for those specific
  // fields — otherwise every in-widget setting change would silently revert
  // on the next page load / initInstaFix() call, defeating the point of
  // exposing the control at all. Fields never touched fall through to
  // whatever the host configured.
  let currentConfig = { ...config, ...loadPersistedSettings() };

  function updateConfig(partial: Partial<InstaFixConfig>): void {
    // A setting change (theme/locale/accentColor/...) always comes from the
    // panel's own settings accordion, which means the panel is open and the
    // accordion is expanded right up until the destroy below — capture that
    // so the fresh mount can restore it, or the panel would visibly vanish
    // on every single settings tweak.
    const uiState = current.getUiState();
    current.destroy();
    currentConfig = { ...currentConfig, ...partial } as InstaFixConfig;
    current = mount(currentConfig, updateConfig) ?? inertRaw();
    for (const [event, fns] of listeners) {
      for (const fn of fns) current.on(event as never, fn as never);
    }
    if (uiState.open) current.open();
    if (uiState.settingsExpanded) current.expandSettings();
  }

  const firstMount = mount(currentConfig, updateConfig);
  if (!firstMount) return skippedInstance(currentConfig);
  // Explicitly typed as non-null `RawInstance` (not the `RawInstance | null`
  // `mount()` returns) — every closure below captures this `let` binding, and
  // without the annotation TypeScript widens its type to include `null` from
  // the pre-narrowing assignment above, even though it is never reassigned to
  // null (a fallback `?? inertRaw()` guarantees that in `updateConfig`).
  let current: RawInstance = firstMount;

  const facade: InstaFixInstance = {
    destroy: () => {
      current.destroy();
      activeInstance = null;
    },
    open: () => current.open(),
    close: () => current.close(),
    refresh: () => current.refresh(),
    focusFeedback: (feedbackId) => current.focusFeedback(feedbackId),
    on: (event, listener) => {
      let set = listeners.get(event);
      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }
      set.add(listener as (...args: never[]) => void);
      current.on(event, listener);
      // The returned unsubscribe (and `facade.off`, below) always act on
      // whichever `current` is live *at call time* — not the raw instance
      // that happened to exist when `.on()` was called — so a listener
      // survives an `updateConfig()` remount and can still be removed
      // afterward.
      return () => {
        set?.delete(listener as (...args: never[]) => void);
        current.off(event, listener);
      };
    },
    off: (event, listener) => {
      listeners.get(event)?.delete(listener as (...args: never[]) => void);
      current.off(event, listener);
    },
    updateConfig,
  };

  activeInstance = { facade };
  return facade;
}

/**
 * Build one real widget mount — the production/mobile/validation guards,
 * then everything that creates DOM, wires events, and starts network
 * requests. Returns `null` when a guard rejects `config` (never cached as
 * the singleton — see `launch`).
 */
function mount(config: InstaFixConfig, onUpdateConfig: (partial: Partial<InstaFixConfig>) => void): RawInstance | null {
  // Debug helper — only logs when config.debug is true
  const log: (...args: unknown[]) => void = config.debug
    ? (...args: unknown[]) => console.debug("[instafix]", ...args)
    : () => {};

  // Guard: only show in development (forceShow bypasses). Uses readNodeEnv()
  // instead of the literal `process.env.NODE_ENV` — avoids both bundler
  // constant-folding (#104) and "Critical dependency" import.meta warnings
  // in Next.js webpack builds.
  if (!config.forceShow && readNodeEnv() === "production") {
    const reason = "production";
    console.info("[instafix] Widget not loaded: production mode detected. Use forceShow: true to override.");
    config.onSkip?.(reason);
    return null;
  }

  // Guard: desktop only (viewport below the threshold = hidden). forceShow
  // bypasses this just like the production guard above; minViewportWidth lets
  // hosts tune (or disable, with 0) the threshold. Non-finite values (NaN from
  // an untyped script-tag consumer, Infinity) would silently break the `<`
  // comparison — fail back to the default instead. See issue #103.
  const minViewportWidth =
    typeof config.minViewportWidth === "number" && Number.isFinite(config.minViewportWidth)
      ? config.minViewportWidth
      : MOBILE_BREAKPOINT;
  if (!config.forceShow && window.innerWidth < minViewportWidth) {
    const reason = "mobile";
    console.info(
      `[instafix] Widget not loaded: viewport width < ${minViewportWidth}px (mobile not supported). Use forceShow: true or lower minViewportWidth to override.`,
    );
    config.onSkip?.(reason);
    return null;
  }

  // Guard: validate required config fields
  if (!config.store && (!config.endpoint || typeof config.endpoint !== "string")) {
    console.error(
      "[instafix] Missing 'endpoint' or 'store' in config. Provide an endpoint like '/api/instafix' or a InstaFixStore instance.",
    );
    return null;
  }
  if (!config.projectName || typeof config.projectName !== "string") {
    console.error("[instafix] Missing or invalid 'projectName' in config. Expected a non-empty string.");
    return null;
  }

  const locale = config.locale ?? "ko";
  // Kick off the locale fetch immediately. English and Korean (the default)
  // are both bundled synchronously and used immediately while any other
  // chunk is in flight. The launcher awaits `localeReady` before rendering
  // markers and re-localizes the FAB and popup once the dictionary lands —
  // both are mounted synchronously so the widget is interactive immediately,
  // but labels for any other locale start in the English fallback until the
  // chunk arrives.
  const localeReady: Promise<unknown> =
    locale === "en" || locale === "ko"
      ? Promise.resolve()
      : loadLocale(locale).catch(() => {
          /* fallback to English — already handled by createT */
        });
  const t = createT(locale);

  // Page scope — concrete URL + optional template, used to keep annotations
  // and panel results scoped to the current page. The widget calls this on
  // every initial markers load and on `instance.refresh()`, so SPA hosts can
  // re-fetch when the route changes.
  const scopeAnnotationsByUrl = config.scopeAnnotationsByUrl ?? true;
  const getScope = (): PageScope => {
    try {
      const result = config.getPageScope?.();
      if (result) return result;
    } catch (e) {
      log("getPageScope() threw, falling back to pathname:", e);
    }
    return { url: window.location.pathname, urlPattern: null };
  };

  log("Initializing widget", {
    projectName: config.projectName,
    theme: config.theme ?? "light",
    locale,
    scopeAnnotationsByUrl,
  });

  // Diagnostics — capture console + failed network at submit time when
  // `captureDiagnostics` is set. Buffers are installed eagerly so they
  // cover the entire session, then snapshotted in the annotation handler
  // below. We default to `false` even in dev to avoid surprise side
  // effects; users opt in via the config flag.
  const diagnosticsOpts = normaliseDiagnosticsOptions(config.captureDiagnostics);
  const consoleBuffer = diagnosticsOpts.console ? new ConsoleBuffer(diagnosticsOpts.maxConsoleEntries) : null;
  const networkBuffer = diagnosticsOpts.network ? new NetworkBuffer(diagnosticsOpts.maxNetworkEntries) : null;

  const colors = buildThemeColors(config.accentColor, config.theme);

  // Keep @instafix/dashboard's accent/theme/locale fallback in sync — not
  // just when the visitor opens the settings panel, so a host that only sets
  // these via config (never touched by the visitor) still reaches the
  // dashboard, a full page navigation away and not the same JS runtime.
  // `colors.accent` is already the validated/normalized 6-digit hex; `locale`
  // (above) and `config.theme` are each already the widget's own effective
  // value. Uses sync-only fields (see syncSharedSettings's doc comment)
  // instead of SettingsPatch's same-named fields specifically so this write
  // can never feed back into `loadPersistedSettings()` and "stick" a
  // visitor's first-visit values forever, overriding later host-side config
  // changes.
  //
  // This baseline call covers `autoSelectionColor: false` and "detection
  // found nothing" for accent — both call sites below re-sync accent once
  // `colors.accent` has actually been mutated to the detected tone, since
  // syncing the pre-detection configured accent here and never again
  // silently desynced the dashboard from whatever color the toolbar visibly
  // renders in (auto-detection is the default, so this was the common case,
  // not the edge case). Theme and locale have no equivalent async detection
  // step, so this one call is the only one they need.
  syncSharedSettings({ accentColor: colors.accent, theme: config.theme ?? "light", locale });

  // ---- Layer identity ----------------------------------------------------
  // InstaFix must read as ONE overlay layer, visually distinct from the host
  // app: toolbar, composer popover, panel, and markers all wear the SAME
  // detected tone (see styles/theme.ts `applyLayerColor` for the full color
  // rules). Detection runs SYNCHRONOUSLY here — before the stylesheet is
  // built or any component is constructed — so even surfaces with
  // constructor-baked inline styles (the composer) are born in the layer
  // tone. A null result (page not painted yet, or a grayscale host) leaves
  // the configured accent as the tone; the rAF retry further below covers
  // the not-yet-painted case for everything CSS-var-driven.
  let layerColorApplied = false;
  if (config.autoSelectionColor !== false) {
    const detected = detectSelectionColor();
    if (detected) {
      applyLayerColor(colors, detected.hex, config.theme);
      layerColorApplied = true;
      syncSharedSettings({ accentColor: colors.accent });
    }
  }

  const bus = new EventBus<WidgetEvents>();
  const publicBus = new EventBus<InstaFixPublicEvents>();

  // Client-side mode (store) vs HTTP mode (endpoint).
  // The earlier guard guarantees one of `store` / `endpoint` is set; we
  // capture the chosen branch in a typed local so TypeScript narrows on
  // each side without resorting to a non-null assertion.
  const client: WidgetClient = (() => {
    if (config.store) return new StoreClient(config.store, config.projectName);
    const endpoint = config.endpoint;
    if (typeof endpoint !== "string" || endpoint.length === 0) {
      throw new Error("[instafix] internal invariant: endpoint must be a non-empty string in HTTP mode");
    }
    return new ApiClient(endpoint, config.projectName, { apiKey: config.apiKey, headers: config.headers });
  })();

  // Wire config callbacks to event bus
  if (config.onOpen) bus.on("open", config.onOpen);
  if (config.onClose) bus.on("close", config.onClose);
  if (config.onFeedbackSent) bus.on("feedback:sent", config.onFeedbackSent);
  if (config.onError) bus.on("feedback:error", config.onError);
  if (config.onAnnotationStart) bus.on("annotation:start", config.onAnnotationStart);
  if (config.onAnnotationEnd) bus.on("annotation:end", config.onAnnotationEnd);

  // Bridge internal events to the public bus. The mapped-object type forces
  // one entry per public event — adding a key to InstaFixPublicEvents
  // without bridging it here is a compile error, so `instance.on` can never
  // silently miss an event.
  const publicBridges: { [K in keyof InstaFixPublicEvents]: () => void } = {
    "feedback:sent": () => bus.on("feedback:sent", (fb) => publicBus.emit("feedback:sent", fb)),
    "feedback:deleted": () => bus.on("feedback:deleted", (id) => publicBus.emit("feedback:deleted", id)),
    "feedback:error": () => bus.on("feedback:error", (err) => publicBus.emit("feedback:error", err)),
    "panel:open": () => bus.on("open", () => publicBus.emit("panel:open")),
    "panel:close": () => bus.on("close", () => publicBus.emit("panel:close")),
    "annotation:start": () => bus.on("annotation:start", () => publicBus.emit("annotation:start")),
    "annotation:end": () => bus.on("annotation:end", () => publicBus.emit("annotation:end")),
  };
  for (const wire of Object.values(publicBridges)) wire();

  // Debug logging for key lifecycle events
  bus.on("open", () => log("Panel opened"));
  bus.on("close", () => log("Panel closed"));
  bus.on("feedback:sent", (fb) => log("Feedback sent", fb.id));
  bus.on("feedback:error", (err) => log("Feedback failed", err.message));
  bus.on("annotation:start", () => log("Annotation started"));
  bus.on("annotation:end", () => log("Annotation ended"));

  // Create host element + Shadow DOM
  const host = document.createElement("instafix-widget");
  host.style.cssText = `position:fixed;z-index:${Z_INDEX_MAX};`;
  // Use open mode only for testing — closed in production for CSS isolation.
  // Shadow DOM mode is determined by environment, never by public config.
  const shadowMode = readNodeEnv() === "test" ? ("open" as const) : ("closed" as const);
  const shadow = host.attachShadow({ mode: shadowMode });

  // Inject styles into Shadow DOM — adoptedStyleSheets with fallback for Safari < 16.4
  const supportsAdoptedStyleSheets = "adoptedStyleSheets" in ShadowRoot.prototype;
  if (supportsAdoptedStyleSheets) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(buildStyles(colors));
    shadow.adoptedStyleSheets = [sheet];
  } else {
    const style = document.createElement("style");
    style.textContent = buildStyles(colors);
    shadow.appendChild(style);
  }

  document.body.appendChild(host);

  // Corner-collision avoidance: only kicks in when nobody — not the host
  // app, not a visitor via the settings panel — has ever picked a side, so
  // it never overrides an explicit `position`. Checks once now (catches an
  // overlay already on the page) and once more shortly after mount (catches
  // one injected asynchronously by its own script, e.g. a deploy-preview
  // toolbar or consent banner); after either check picks a side, `config`
  // carries an explicit `position` and this stops rechecking — flipping
  // corners once someone's already using the widget would be disruptive.
  // `pickAvoidingPosition` only asks "is something sizeable already sitting
  // at this exact spot" — it never inspects, names, or targets any specific
  // tool.
  if (config.avoidOverlays !== false && !config.position) {
    const avoided = pickAvoidingPosition("bottom-right", host);
    if (avoided !== "bottom-right") config = { ...config, position: avoided };
  }
  if (config.avoidOverlays !== false && !config.position) {
    setTimeout(() => {
      if (destroyed) return;
      const avoidedLate = pickAvoidingPosition("bottom-right", host);
      if (avoidedLate !== "bottom-right") onUpdateConfig({ position: avoidedLate });
    }, 1000);
  }

  // Z_INDEX_MAX is already the highest value CSS accepts, so the widget wins
  // a stacking fight against virtually anything — except another fixed
  // overlay that *also* uses the max value and mounts after us, since a tie
  // resolves in favor of the later sibling in the DOM. Keep our own host
  // element pinned as <body>'s last child so we win that tie too, no matter
  // what else the host page inserts later. This only ever repositions our
  // own element; it doesn't inspect, name, or touch anything else on the
  // page — the same technique toast/modal libraries commonly use to stay on
  // top of whatever else is on the page.
  const keepHostLast = new MutationObserver(() => {
    if (host.nextSibling) document.body.appendChild(host);
  });
  keepHostLast.observe(document.body, { childList: true });

  // Layer-identity retry — only needed when the synchronous pass above found
  // nothing to sample (the widget mounted before the host page's first
  // paint). One frame later the page has real layout; on success, mutate the
  // shared colors in place AND set inline custom properties on the host so
  // every CSS-var-driven surface (the whole panel stylesheet, FAB/toolbar,
  // drawing rects, markers) recolors live. The composer's constructor-baked
  // inline styles keep the configured accent in this rare path — an accepted
  // limitation, since the sync pass covers every normally-timed mount.
  if (config.autoSelectionColor !== false && !layerColorApplied) {
    requestAnimationFrame(() => {
      if (destroyed) return;
      // Pass the shadow host so the detector can sample the real page
      // background at the viewport center (hiding the widget for the
      // sample) and adjust the color's lightness for contrast against it.
      const detected = detectSelectionColor(host);
      if (!detected) return;
      applyLayerColor(colors, detected.hex, config.theme);
      syncSharedSettings({ accentColor: colors.accent });
      host.style.setProperty("--sp-accent", colors.accent);
      host.style.setProperty("--sp-accent-light", colors.accentLight);
      host.style.setProperty("--sp-accent-dark", colors.accentDark);
      host.style.setProperty("--sp-accent-glow", colors.accentGlow);
      host.style.setProperty("--sp-accent-gradient", colors.accentGradient);
      host.style.setProperty("--sp-accent-fg", colors.accentForeground);
      host.style.setProperty("--sp-accent-ink", colors.accentInk);
      host.style.setProperty("--sp-selection", colors.selection);
      host.style.setProperty("--sp-selection-light", colors.selectionLight);
      host.style.setProperty("--sp-selection-glow", colors.selectionGlow);
      host.style.setProperty("--sp-selection-gradient", colors.accentGradient);
      host.style.setProperty("--sp-layer-bg", colors.layerBg);
      host.style.setProperty("--sp-layer-bg-heavy", colors.layerBgHeavy);
      host.style.setProperty("--sp-layer-border", colors.layerBorder);
    });
  }

  // Track the last page element the user focused. FAB-launched annotation
  // moves focus into the shadow root before the annotator activates, so its
  // own activeElement capture only sees the 0x0 shadow host — the tracker
  // supplies the real keyboard (Enter) target instead. See issue #162.
  const focusTracker = createFocusTracker(host);

  // Screen reader live region for feedback submission announcements
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;";
  document.body.appendChild(liveRegion);

  // Components outside Shadow DOM
  const tooltip = new Tooltip(colors, locale);
  const markers = new MarkerManager(colors, tooltip, bus, t, liveRegion);

  // Components inside Shadow DOM
  const fab = new Fab(shadow, config, bus, t);

  // Keep the FAB unread-count badge in sync with the visible markers. Marker
  // mutations (initial render, addFeedback after submit, panel-driven resolve /
  // delete / bulk-delete via re-render) all emit `markers:changed`, so a single
  // listener covers every path that can change the open count.
  bus.on("markers:changed", (openCount) => fab.updateBadge(openCount));

  // First-use-only 3-step coachmark (G8) — shown once ever, after the FAB's
  // own entrance animation has had a moment to settle so it doesn't compete
  // for attention immediately on paint.
  let onboarding: Onboarding | null = null;
  if (typeof window !== "undefined" && !hasSeenOnboarding()) {
    setTimeout(() => {
      if (destroyed) return;
      const isRight = (config.position ?? "bottom-right") === "bottom-right";
      onboarding = new Onboarding(shadow, t, fab.buttonElement, isRight);
    }, 600);
  }

  // Lazy-load Panel on first use (FAB click, instance.open, etc.) to keep the
  // initial bundle small. Panel + sub-modules are ~14 KB gzip on their own.
  // Memoize the import promise so subsequent calls reuse the same instance.
  // The promise honestly resolves to null when the widget was destroyed
  // before the panel chunk landed — callers already null-guard.
  let panelInstance: PanelType | null = null;
  let panelPromise: Promise<PanelType | null> | null = null;
  let destroyed = false;
  // Monotonic token guarding the launcher's own marker renders (initial load +
  // doRefresh). The panel guards its own renders with an AbortController; the
  // two direct launcher paths share this counter so the *last-issued* fetch
  // wins, never the last to resolve. Without it, an SPA nav burst (or an
  // initial load racing the first navigation) could render a stale page's
  // markers out of order, since markers.render() is a full clear-and-rebuild.
  let markerGeneration = 0;
  async function loadPanel(): Promise<PanelType | null> {
    if (destroyed) return null;
    if (panelInstance) return panelInstance;
    if (!panelPromise) {
      panelPromise = import("./panel.js").then((mod) => {
        if (destroyed) return null;
        panelInstance = new mod.Panel(
          shadow,
          colors,
          bus,
          client,
          config.projectName,
          markers,
          t,
          locale,
          { getScope, scopeAnnotationsByUrl },
          { config, onUpdateConfig },
        );
        return panelInstance;
      });
    }
    return panelPromise;
  }

  // Prefetch Panel in idle time so the first FAB click doesn't pay the
  // network/parse cost of the dynamic import. The chunk still ships lazily
  // (saves first-paint gzip), but it's already warming up by the time the
  // user is likely to click. Falls back to setTimeout in browsers without
  // requestIdleCallback (Safari before 17).
  if (typeof window !== "undefined") {
    const prefetch = () => {
      if (!destroyed) void loadPanel();
    };
    const ric = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (typeof ric === "function") ric(prefetch);
    else setTimeout(prefetch, 200);
  }

  // The FAB emits `panel:toggle` on chat click — we intercept here so the
  // launcher (which holds the lazy loader) can drive the Panel lifecycle.
  // Panel itself also subscribes to `panel:toggle` once loaded; once the
  // dynamic import resolves we manually call `p.open()` because the missed
  // initial emit can't be replayed.
  let pendingOpen = false;
  const unsubToggle = bus.on("panel:toggle", (open) => {
    if (panelInstance) return; // Real Panel already handles subsequent toggles
    if (open) {
      pendingOpen = true;
      loadPanel()
        .then((p) => {
          if (p && pendingOpen) p.open();
          pendingOpen = false;
        })
        .catch((err) => log("Failed to lazy-load panel:", err));
    } else {
      pendingOpen = false;
    }
  });

  const annotator = new Annotator(
    colors,
    bus,
    t,
    config.enableScreenshot ?? false,
    () => focusTracker.getLastPageFocus(),
    config.agentInstructions,
  );

  // Once the locale dictionary lands, swap the FAB + popup labels from the
  // English fallback to the configured language. `t` already resolves to the
  // loaded dictionary at call time, so the markers list rendered below (which
  // calls `t` lazily) only needs to wait on `localeReady` once.
  if (locale !== "en" && locale !== "ko") {
    localeReady.then(() => {
      if (destroyed) return;
      fab.refreshLabels();
      annotator.refreshLabels();
    });
  }

  // Handle annotation completion via event bus (not DOM events).
  // Concurrency guard: a second `annotation:complete` while one is still in
  // flight must not start a duplicate submission. The Annotator already
  // serializes its own submissions (no second annotation can be drawn while
  // the popup is open), so this is defence-in-depth — but it must not *silently*
  // drop the event: a dropped event would leave any waiting `runSubmission`
  // listener hung forever. We emit `submission:cancelled` so the waiter
  // unblocks as a benign abort (the popup restores, `onError` is not called).
  let submitting = false;
  const unsubAnnotation = bus.on("annotation:complete", async (data) => {
    if (submitting) {
      bus.emit("submission:cancelled");
      return;
    }
    submitting = true;
    try {
      const { annotations, type, message, screenshotDataUrl, screenshotRegion } = data;

      // Ensure identity — config wins (host-provided), then localStorage,
      // then prompt the user as a last resort. Host-provided identity is
      // not persisted: the host stays the source of truth on every render.
      let identity = config.identity ?? getIdentity();
      if (!identity) {
        identity = await promptIdentity(shadow, t);
        if (!identity) {
          // User cancelled the identity prompt. Emit `submission:cancelled`
          // (not `feedback:error`) so the popup's pending submit handler
          // unblocks and restores the form — cancelling a prompt is a benign
          // user action, so `config.onError` must not fire for it.
          bus.emit("submission:cancelled");
          return;
        }
        saveIdentity(identity);
      }

      // crypto.randomUUID() throws in non-secure contexts (plain HTTP)
      const clientId = (() => {
        try {
          return crypto.randomUUID();
        } catch {
          return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
      })();

      // Use scope.url as the single source of truth — same identifier the
      // panel filter and marker filter use. If we stored full URLs here while
      // filtering by pathname, freshly-created feedbacks would never match
      // their own scope filter and would vanish from the UI immediately.
      // Default scope.url is `window.location.pathname` (no query string,
      // so token/key/secret query params can't leak by construction). Hosts
      // that need origin or query in the identifier override `getPageScope`.
      const scope = getScope();

      // Snapshot the buffers right before submit so the captured slice
      // matches the moment the user clicked "send", not some earlier point.
      let diagnostics: DiagnosticsSnapshot | null = null;
      if (consoleBuffer || networkBuffer) {
        diagnostics = {
          console: consoleBuffer?.getEntries() ?? [],
          network: networkBuffer?.getEntries() ?? [],
        };
      }

      const payload: FeedbackPayload = {
        projectName: config.projectName,
        type,
        message,
        url: scope.url,
        urlPattern: scope.urlPattern,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        authorName: identity.name,
        authorEmail: identity.email,
        annotations,
        clientId,
        screenshotDataUrl: screenshotDataUrl ?? null,
        screenshotRegion: screenshotRegion ?? null,
        diagnostics,
      };

      try {
        const response = await client.sendFeedback(payload);
        bus.emit("feedback:sent", response);
        // Compare against the scope captured before submit (route may have
        // changed during the network round-trip — re-reading scope here
        // would race with SPA navigation).
        if (!scopeAnnotationsByUrl || response.url === scope.url) {
          markers.addFeedback(response, markers.count + 1);
        }
        liveRegion.textContent = t("feedback.sent.confirmation");
        // Only refresh the panel if it has been loaded — `refresh()` is a
        // no-op when the panel is closed, so skipping the dynamic import here
        // avoids loading 14 KB of code that would otherwise do nothing.
        if (panelInstance) await panelInstance.refresh();
      } catch (error) {
        bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
        liveRegion.textContent = t("feedback.error.message");
      }
    } finally {
      submitting = false;
    }
  });

  // Load markers immediately on page load. We always pass the current page URL
  // when scopeAnnotationsByUrl is enabled so the server narrows results to the
  // current page — preventing annotations from one page accidentally rendering
  // on another (when CSS selectors happen to match unrelated elements).
  const initialScope = getScope();
  const initialOptions = scopeAnnotationsByUrl ? { limit: PAGE_SIZE, url: initialScope.url } : { limit: PAGE_SIZE };
  const deepLinkOpts = normaliseDeepLinkOptions(config.deepLink);
  // Claim a generation for the initial load so a navigation that fires while
  // this fetch is in flight (doRefresh bumps the counter) supersedes it — the
  // old page's markers must never clobber the page the user navigated to.
  const initialLoadGeneration = ++markerGeneration;
  // Render markers only once both the feedbacks and the locale dictionary are
  // ready. Marker aria-labels are built via `t(...)` at render time — without
  // this `Promise.all`, a fast HTTP response could outrun a slow locale chunk
  // and freeze marker labels in the English fallback for non-English locales.
  Promise.all([client.getFeedbacks(config.projectName, initialOptions), localeReady])
    .then(([{ feedbacks }]) => {
      if (destroyed || markerGeneration !== initialLoadGeneration) return;
      // Defensive client-side filter — backend may not yet support the `url` query.
      const visible = scopeAnnotationsByUrl ? feedbacks.filter((f) => f.url === initialScope.url) : feedbacks;
      markers.render(visible);
      // Apply deeplink focus once markers exist. Failures here are
      // non-fatal — a malformed URL or an unknown ID just leaves the page
      // as the user found it, so log and move on.
      if (deepLinkOpts.enabled) {
        try {
          const focusId = new URLSearchParams(window.location.search).get(deepLinkOpts.param);
          if (focusId) {
            const matched = markers.focusFeedback(focusId);
            log(
              `deepLink ?${deepLinkOpts.param}=${focusId} ${matched ? "focused" : "did not match a visible feedback"}`,
            );
          }
        } catch (e) {
          log("deepLink parsing failed:", e);
        }
      }
    })
    .catch((err) => {
      log("Failed to load initial markers:", err);
    });

  // Flush retry queue on load (HTTP mode only — store mode has no retry queue)
  if (config.endpoint) {
    flushRetryQueue(config.endpoint, config.identity ?? getIdentity(), {
      apiKey: config.apiKey,
      headers: config.headers,
    })
      .then(() => log("Retry queue flushed"))
      .catch(() => {});
  }

  // Re-fetch feedbacks for the *current* scope and update the UI. Shared by the
  // public `instance.refresh()` and the SPA navigation watcher below.
  //
  // When the panel is open, its own `refresh()` already runs `loadFeedbacks()`
  // which re-renders markers — a second fetch here would race with it (the
  // loser overwrites the winner's markers, off by a generation). So we delegate
  // when open, and fetch markers ourselves when closed (the panel won't, but
  // SPA hosts still need the new page's markers after a route change).
  //
  // Returns the in-flight promise (rejecting on fetch failure) so callers can
  // react — `instance.refresh()` swallows it (the public API never rejects onto
  // the host), the navigation watcher uses it to re-arm its dedup on failure.
  const doRefresh = (): Promise<void> => {
    // Bump first, before the open/closed split, so switching to panel-driven
    // rendering also invalidates any closed-panel fetch still in flight.
    const generation = ++markerGeneration;
    if (panelInstance?.isCurrentlyOpen) {
      return panelInstance.refresh();
    }
    const scope = getScope();
    const opts = scopeAnnotationsByUrl ? { limit: PAGE_SIZE, url: scope.url } : { limit: PAGE_SIZE };
    return client.getFeedbacks(config.projectName, opts).then(({ feedbacks }) => {
      // Drop the result if a newer refresh superseded us (out-of-order
      // resolution), the widget was torn down, or the panel opened mid-flight
      // and now owns marker rendering itself.
      if (destroyed || generation !== markerGeneration || panelInstance?.isCurrentlyOpen) return;
      const visible = scopeAnnotationsByUrl ? feedbacks.filter((f) => f.url === scope.url) : feedbacks;
      markers.render(visible);
    });
  };

  // SPA route-change watcher. The widget is normally mounted once (singleton)
  // inside a persistent layout — e.g. a Next.js App Router `layout.tsx`, which
  // does NOT remount on client-side navigation. Without this, init runs once and
  // the panel list + markers stay frozen on the page where the widget first
  // mounted. We patch the History API (SPA routers call pushState/replaceState
  // rather than triggering popstate) and listen for popstate/hashchange, then
  // re-fetch only when the scope key actually changes. This re-fetches data
  // only — it deliberately does NOT re-focus/re-scroll (deep-link focus stays
  // initial-load only; see `deepLink`). Opt out with `watchNavigation: false`.
  let teardownNavigation: (() => void) | null = null;
  if (config.watchNavigation !== false && typeof window !== "undefined" && typeof history !== "undefined") {
    const scopeKey = (s: PageScope): string => `${s.url}\n${s.urlPattern ?? ""}`;
    let lastScopeKey = scopeKey(initialScope);
    const onLocationChange = (): void => {
      if (destroyed) return;
      const key = scopeKey(getScope());
      // Same scope (e.g. query-only or hash-only nav under the default pathname
      // scope) — nothing to re-fetch. Guards against pushState storms too.
      if (key === lastScopeKey) return;
      const prevKey = lastScopeKey;
      lastScopeKey = key;
      log("SPA navigation detected — refreshing feedbacks for new scope");
      doRefresh().catch(() => {
        // The refresh failed (network error). Roll the dedup key back so a
        // later nav *back* to this same scope retries instead of being
        // silently suppressed — unless a newer navigation already moved on.
        if (lastScopeKey === key) lastScopeKey = prevKey;
      });
    };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    // Call through to the original first so `location` is already updated by the
    // time onLocationChange() reads getScope().
    const patchedPushState: typeof history.pushState = function (this: History, ...args) {
      originalPushState.apply(this, args);
      onLocationChange();
    };
    const patchedReplaceState: typeof history.replaceState = function (this: History, ...args) {
      originalReplaceState.apply(this, args);
      onLocationChange();
    };
    history.pushState = patchedPushState;
    history.replaceState = patchedReplaceState;
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);

    teardownNavigation = () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
      // Restore only if nobody patched on top of us — otherwise we'd clobber
      // another library's History wrapper. If a library did wrap on top, our
      // patch stays in the chain (and keeps its closure alive), but it's inert:
      // `destroyed` is already true above, so onLocationChange() is a no-op.
      if (history.pushState === patchedPushState) history.pushState = originalPushState;
      if (history.replaceState === patchedReplaceState) history.replaceState = originalReplaceState;
    };
  }

  const raw: RawInstance = {
    destroy: () => {
      // Idempotent: `updateConfig` (and a stale reference held across one)
      // may call this more than once on the same raw instance.
      if (destroyed) return;
      log("Destroying widget");
      destroyed = true;
      pendingOpen = false;
      keepHostLast.disconnect();
      teardownNavigation?.();
      focusTracker.destroy();
      unsubAnnotation();
      unsubToggle();
      fab.destroy();
      onboarding?.destroy();
      panelInstance?.destroy();
      annotator.destroy();
      markers.destroy();
      tooltip.destroy();
      // Restore the original console / fetch / XHR so the host page isn't
      // left with patched globals after the widget tears itself down.
      consoleBuffer?.dispose();
      networkBuffer?.dispose();
      bus.removeAll();
      publicBus.removeAll();
      liveRegion.remove();
      host.remove();
    },
    open: () => {
      // Emit synchronously so consumers wired through `onOpen` / `panel:open`
      // see the open event immediately, even before the Panel module has
      // finished loading on the first call.
      bus.emit("panel:toggle", true);
    },
    close: () => {
      if (panelInstance) {
        panelInstance.close();
      } else {
        // Cancel a pending open before the panel has loaded.
        pendingOpen = false;
      }
    },
    focusFeedback: (feedbackId: string) => {
      // Returns false when no entry matches — unknown ID, feedback filtered
      // out by `scopeAnnotationsByUrl`, or markers not yet loaded (the
      // initial getFeedbacks is async, and the widget exposes no public
      // "markers ready" event today). Hosts that race against initial load
      // can retry, or trigger focus from a user gesture instead.
      return markers.focusFeedback(feedbackId);
    },
    // Public API must never reject onto the host — swallow the promise.
    refresh: () => {
      void doRefresh().catch(() => {});
    },
    on: <K extends keyof InstaFixPublicEvents>(event: K, listener: InstaFixPublicEventListener<K>) =>
      publicBus.on(event, listener),
    off: <K extends keyof InstaFixPublicEvents>(event: K, listener: InstaFixPublicEventListener<K>) => {
      publicBus.off(event, listener);
    },
    getUiState: () => ({
      open: panelInstance?.isCurrentlyOpen ?? false,
      settingsExpanded: panelInstance?.isSettingsExpanded ?? false,
    }),
    expandSettings: () => {
      void loadPanel().then((p) => p?.expandSettings());
    },
  };

  return raw;
}

/**
 * Show a modal identity form inside the Shadow DOM.
 * Glassmorphism: frosted backdrop, glass modal, gradient CTA.
 * Returns null if the user cancels.
 */
function promptIdentity(shadowRoot: ShadowRoot, t: TFunction): Promise<Identity | null> {
  return new Promise((resolve) => {
    // Save the currently focused element to restore on close
    const previouslyFocused = (shadowRoot.activeElement ?? document.activeElement) as HTMLElement | null;

    // Move the shadow host to the end of <body> so the identity prompt wins
    // the source-order tiebreak against the feedback popup. Both elements
    // already sit at `Z_INDEX_MAX` (max int32 — no \"higher\"), and since #114
    // the popup stays visible during submission, so it can be on screen at
    // the moment `promptIdentity` runs. The popup is appended to `document.body`
    // later than the host during init, which made it win when z-indices tied.
    // Re-appending an existing node just moves it; no remount, no listener
    // loss, no visual jitter when the popup isn't open. See issue #126.
    const host = shadowRoot.host;
    if (host.parentNode) host.parentNode.appendChild(host);

    const backdrop = document.createElement("div");
    backdrop.style.cssText = `
      position:fixed;inset:0;
      background:var(--sp-identity-overlay);
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
      z-index:${Z_INDEX_MAX};
      opacity:0;transition:opacity 0.25s ease;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      width:340px;padding:28px;border-radius:var(--sp-radius-xl);
      background:var(--sp-identity-bg);
      backdrop-filter:blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter:blur(var(--sp-blur-heavy));
      border:1px solid var(--sp-glass-border);
      box-shadow:0 16px 48px var(--sp-shadow), 0 8px 16px var(--sp-shadow);
      font-family:var(--sp-font, ${FONT_STACK});
      color:var(--sp-text);
      transform:translateY(12px) scale(0.97);
      transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      -webkit-font-smoothing:antialiased;
    `;

    const titleId = `sp-identity-title-${Date.now()}`;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", titleId);

    const title = document.createElement("div");
    title.className = "sp-identity-title";
    title.id = titleId;
    title.textContent = t("identity.title");
    title.style.marginBottom = "20px";

    const nameInputId = `sp-identity-name-${Date.now()}`;
    const emailInputId = `sp-identity-email-${Date.now()}`;

    const nameLabel = document.createElement("label");
    nameLabel.className = "sp-input-label";
    nameLabel.textContent = t("identity.nameLabel");
    nameLabel.setAttribute("for", nameInputId);
    const nameInput = document.createElement("input");
    nameInput.className = "sp-input";
    nameInput.id = nameInputId;
    nameInput.type = "text";
    nameInput.placeholder = t("identity.namePlaceholder");
    nameInput.style.marginBottom = "14px";

    const emailLabel = document.createElement("label");
    emailLabel.className = "sp-input-label";
    emailLabel.textContent = t("identity.emailLabel");
    emailLabel.setAttribute("for", emailInputId);
    const emailInput = document.createElement("input");
    emailInput.className = "sp-input";
    emailInput.id = emailInputId;
    emailInput.type = "email";
    emailInput.placeholder = t("identity.emailPlaceholder");

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;margin-top:20px;";

    const closeModal = (result: Identity | null) => {
      backdrop.removeEventListener("keydown", onKeydown);
      backdrop.style.opacity = "0";
      modal.style.transform = "translateY(12px) scale(0.97)";
      setTimeout(() => {
        backdrop.remove();
        previouslyFocused?.focus();
        resolve(result);
      }, 250);
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "sp-btn-ghost";
    cancelBtn.textContent = t("identity.cancel");
    cancelBtn.addEventListener("click", () => closeModal(null));

    const submitBtn = document.createElement("button");
    submitBtn.className = "sp-btn-primary";
    submitBtn.textContent = t("identity.submit");
    submitBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!name || !email) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailInput.style.borderColor = "var(--sp-type-bug, #ef4444)";
        return;
      }
      closeModal({ name, email });
    });

    // Focus trap: cycle Tab/Shift+Tab within the modal
    const focusableSelectors = 'input, button, [tabindex]:not([tabindex="-1"])';
    const onKeydown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        closeModal(null);
        return;
      }
      if (ke.key === "Tab") {
        const focusableEls = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));
        if (focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (!first || !last) return;
        const active = shadowRoot.activeElement as HTMLElement | null;
        if (ke.shiftKey) {
          if (active === first || !modal.contains(active)) {
            ke.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !modal.contains(active)) {
            ke.preventDefault();
            first.focus();
          }
        }
      }
    };
    backdrop.addEventListener("keydown", onKeydown);

    // Close on backdrop click
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(null);
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(submitBtn);

    modal.appendChild(title);
    modal.appendChild(nameLabel);
    modal.appendChild(nameInput);
    modal.appendChild(emailLabel);
    modal.appendChild(emailInput);
    modal.appendChild(btnRow);
    backdrop.appendChild(modal);

    shadowRoot.appendChild(backdrop);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.style.opacity = "1";
      modal.style.transform = "translateY(0) scale(1)";
      nameInput.focus();
    });
  });
}
