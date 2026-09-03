// @vitest-environment jsdom

import type { InstaFixConfig, InstaFixHttpConfig, InstaFixStore } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withViewportWidth } from "../helpers.js";

// jsdom does not implement window.matchMedia — provide a stub
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ---------------------------------------------------------------------------
// Mock modules before importing launcher
// ---------------------------------------------------------------------------

// Mock the ApiClient to avoid real HTTP requests.
// Hoist `flushRetryQueueMock` so it is a stable reference across the factory and tests.
const { flushRetryQueueMock } = vi.hoisted(() => ({
  flushRetryQueueMock: vi.fn(),
}));
flushRetryQueueMock.mockResolvedValue(undefined);
vi.mock(new URL("../../src/api-client.js", import.meta.url).pathname, () => ({
  ApiClient: vi.fn(function (this: unknown) {
    return {
      sendFeedback: vi.fn().mockResolvedValue({}),
      getFeedbacks: vi.fn().mockResolvedValue({ feedbacks: [], total: 0 }),
      resolveFeedback: vi.fn(),
      deleteFeedback: vi.fn(),
      deleteAllFeedbacks: vi.fn(),
    };
  }),
  flushRetryQueue: flushRetryQueueMock,
}));

// Mock heavy dependencies to keep tests fast and focused on launcher logic
// Capture the EventBus so we can emit events for callback wiring tests.
// Use a container object to work around vi.mock hoisting
const annotatorCapture: {
  bus: { emit: (event: string, ...args: unknown[]) => void } | null;
  startInstantAnnotation: ReturnType<typeof vi.fn>;
} = { bus: null, startInstantAnnotation: vi.fn().mockResolvedValue(undefined) };

vi.mock(new URL("../../src/annotator.js", import.meta.url).pathname, () => ({
  Annotator: vi.fn(function (
    this: unknown,
    _colors: unknown,
    bus: {
      emit: (event: string, ...args: unknown[]) => void;
      on: (event: string, listener: (...args: unknown[]) => void) => () => void;
    },
  ) {
    annotatorCapture.bus = bus;
    bus.on("annotation:start", () => {});
    return {
      destroy: vi.fn(),
      refreshLabels: vi.fn(),
      startInstantAnnotation: annotatorCapture.startInstantAnnotation,
      isBusy: false,
    };
  }),
}));

vi.mock("../../src/markers.js", () => ({
  MarkerManager: vi.fn(function (this: unknown) {
    return {
      render: vi.fn(),
      highlight: vi.fn(),
      pinHighlight: vi.fn(),
      addFeedback: vi.fn(),
      destroy: vi.fn(),
      count: 0,
    };
  }),
}));

vi.mock("../../src/tooltip.js", () => ({
  Tooltip: vi.fn(function (this: unknown) {
    return {
      destroy: vi.fn(),
    };
  }),
}));

vi.mock("../../src/styles/base.js", () => ({
  buildStyles: vi.fn().mockReturnValue("/* styles */"),
}));

import { launch } from "../../src/launcher.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultConfig(overrides: Partial<Omit<InstaFixHttpConfig, "store">> = {}): InstaFixConfig {
  return {
    endpoint: "/api/instafix",
    projectName: "test-project",
    forceShow: true, // bypass production guard in tests
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("launch", () => {
  afterEach(() => {
    // Clean up any instafix-widget elements left in the DOM
    for (const el of document.querySelectorAll("instafix-widget")) {
      el.remove();
    }
    for (const el of document.querySelectorAll('[role="status"]')) {
      el.remove();
    }
    annotatorCapture.bus = null;
    annotatorCapture.startInstantAnnotation.mockClear();
  });

  // -------------------------------------------------------------------------
  // Production guard
  // -------------------------------------------------------------------------

  describe("production guard", () => {
    it("returns a no-op instance when NODE_ENV is production and forceShow is not set", () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const instance = launch({ endpoint: "/api", projectName: "test" });

        // No widget element should be added
        const widget = document.querySelector("instafix-widget");
        expect(widget).toBeNull();

        // Should return an instance with no-op methods
        expect(instance.destroy).toBeTypeOf("function");
        expect(instance.open).toBeTypeOf("function");
        expect(instance.close).toBeTypeOf("function");
        expect(instance.refresh).toBeTypeOf("function");
        expect(instance.on).toBeTypeOf("function");
        expect(instance.off).toBeTypeOf("function");

        // No-ops should not throw
        instance.destroy();
        instance.open();
        instance.close();
        instance.refresh();
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it("initializes normally when forceShow is true even in production", () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const instance = launch(defaultConfig({ forceShow: true }));

        const widget = document.querySelector("instafix-widget");
        expect(widget).not.toBeNull();

        instance.destroy();
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it("calls onSkip callback with 'production' reason when skipped", () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const onSkip = vi.fn();
        launch({ endpoint: "/api", projectName: "test", onSkip });

        expect(onSkip).toHaveBeenCalledWith("production");
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it("mounts without forceShow when NODE_ENV is 'development' (#104)", () => {
      // Source-level sanity check only — vitest never applies bundler defines,
      // so the real #104 lock is the dist-level E2E test plus
      // scripts/verify-dist-guard.mjs at build time.
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const onSkip = vi.fn();
      const instance = launch({ endpoint: "/api", projectName: "test", onSkip });
      try {
        expect(document.querySelector("instafix-widget")).not.toBeNull();
        expect(onSkip).not.toHaveBeenCalled();
      } finally {
        instance.destroy();
        process.env.NODE_ENV = origEnv;
      }
    });
  });

  // -------------------------------------------------------------------------
  // Mobile guard
  // -------------------------------------------------------------------------

  describe("mobile guard", () => {
    // defaultConfig() sets forceShow:true, which now (intentionally, #103)
    // bypasses the mobile guard too — so every test that exercises the
    // threshold opts out of it. destroy() runs in finally so a failing
    // assertion can't leak the launcher's module-level singleton.
    it("returns a no-op instance when viewport is narrow (< 768px)", () => {
      withViewportWidth(600, () => {
        const instance = launch(defaultConfig({ forceShow: false }));
        try {
          expect(document.querySelector("instafix-widget")).toBeNull();
        } finally {
          instance.destroy();
        }
      });
    });

    it("calls onSkip with 'mobile' reason on narrow viewport", () => {
      withViewportWidth(500, () => {
        const onSkip = vi.fn();
        const instance = launch(defaultConfig({ forceShow: false, onSkip }));
        try {
          expect(onSkip).toHaveBeenCalledWith("mobile");
        } finally {
          instance.destroy();
        }
      });
    });

    it("initializes normally when viewport is >= 768px", () => {
      withViewportWidth(1024, () => {
        // forceShow:false so this actually exercises the default threshold —
        // with the bypass active the test would pass at any width.
        const instance = launch(defaultConfig({ forceShow: false }));
        try {
          expect(document.querySelector("instafix-widget")).not.toBeNull();
        } finally {
          instance.destroy();
        }
      });
    });

    it("forceShow bypasses the mobile guard (#103)", () => {
      withViewportWidth(600, () => {
        const onSkip = vi.fn();
        const instance = launch(defaultConfig({ forceShow: true, onSkip }));
        try {
          expect(document.querySelector("instafix-widget")).not.toBeNull();
          expect(onSkip).not.toHaveBeenCalled();
        } finally {
          instance.destroy();
        }
      });
    });

    it("minViewportWidth lowers the threshold so a narrow viewport renders (#103)", () => {
      withViewportWidth(600, () => {
        const instance = launch(defaultConfig({ forceShow: false, minViewportWidth: 0 }));
        try {
          expect(document.querySelector("instafix-widget")).not.toBeNull();
        } finally {
          instance.destroy();
        }
      });
    });

    it("minViewportWidth can raise the threshold (skips a mid-width viewport)", () => {
      withViewportWidth(1000, () => {
        const onSkip = vi.fn();
        const instance = launch(defaultConfig({ forceShow: false, minViewportWidth: 1200, onSkip }));
        try {
          expect(document.querySelector("instafix-widget")).toBeNull();
          expect(onSkip).toHaveBeenCalledWith("mobile");
        } finally {
          instance.destroy();
        }
      });
    });

    it("falls back to the 768px default when minViewportWidth is not a finite number", () => {
      withViewportWidth(600, () => {
        // NaN (e.g. Number('768px') from an untyped script-tag consumer) is not
        // nullish, and `innerWidth < NaN` is always false — without validation
        // it would silently disable the guard.
        const onSkip = vi.fn();
        const instance = launch(defaultConfig({ forceShow: false, minViewportWidth: Number.NaN, onSkip }));
        try {
          expect(document.querySelector("instafix-widget")).toBeNull();
          expect(onSkip).toHaveBeenCalledWith("mobile");
        } finally {
          instance.destroy();
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // Returns API
  // -------------------------------------------------------------------------

  describe("returned API", () => {
    let instance: ReturnType<typeof launch>;

    beforeEach(() => {
      instance = launch(defaultConfig());
    });

    afterEach(() => {
      instance.destroy();
    });

    it("returns an object with all expected methods", () => {
      expect(instance).toHaveProperty("destroy");
      expect(instance).toHaveProperty("open");
      expect(instance).toHaveProperty("close");
      expect(instance).toHaveProperty("refresh");
      expect(instance).toHaveProperty("on");
      expect(instance).toHaveProperty("off");
    });

    it("open() does not throw", () => {
      expect(() => instance.open()).not.toThrow();
    });

    it("close() does not throw", () => {
      expect(() => instance.close()).not.toThrow();
    });

    it("refresh() does not throw", () => {
      expect(() => instance.refresh()).not.toThrow();
    });

    it("on() returns an unsubscribe function", () => {
      const unsub = instance.on("panel:open", () => {});
      expect(unsub).toBeTypeOf("function");
      // Unsubscribe should not throw
      unsub();
    });

    it("off() does not throw", () => {
      const listener = () => {};
      expect(() => instance.off("panel:open", listener)).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Widget DOM structure
  // -------------------------------------------------------------------------

  describe("widget DOM structure", () => {
    it("creates a instafix-widget custom element", () => {
      const instance = launch(defaultConfig());

      const widget = document.querySelector("instafix-widget");
      expect(widget).not.toBeNull();

      instance.destroy();
    });

    it("creates a live region for screen reader announcements", () => {
      const instance = launch(defaultConfig());

      const liveRegions = document.querySelectorAll('[role="status"][aria-live="polite"]');
      expect(liveRegions.length).toBeGreaterThan(0);

      instance.destroy();
    });

    it("uses open shadow mode in test environment", () => {
      const instance = launch(defaultConfig());

      const widget = document.querySelector("instafix-widget")!;
      expect(widget.shadowRoot).not.toBeNull();

      instance.destroy();
    });

    it("reclaims a trailing position after another element is appended later (max-z-index tie-break)", async () => {
      const instance = launch(defaultConfig());
      const widget = document.querySelector("instafix-widget")!;

      const intruder = document.createElement("div");
      intruder.style.cssText = "position:fixed;z-index:2147483647;";
      document.body.appendChild(intruder);

      // The re-append happens from a MutationObserver callback — poll rather
      // than assume a fixed number of microtask ticks.
      await vi.waitFor(() => {
        // DOCUMENT_POSITION_FOLLOWING: `widget` comes after `intruder`.
        expect(intruder.compareDocumentPosition(widget) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      });

      intruder.remove();
      instance.destroy();
    });

    it("stops reclaiming a trailing position after destroy", async () => {
      const instance = launch(defaultConfig());
      instance.destroy();

      const intruder = document.createElement("div");
      document.body.appendChild(intruder);
      await new Promise((r) => setTimeout(r, 0));

      // The (now-removed) widget host must not have been reinserted after it.
      expect(document.querySelector("instafix-widget")).toBeNull();
      intruder.remove();
    });
  });

  describe("overlay-collision avoidance", () => {
    function stubOccupiedRight(): HTMLElement {
      const intruder = document.createElement("div");
      intruder.style.position = "fixed";
      intruder.getBoundingClientRect = () =>
        ({ x: 0, y: 0, width: 48, height: 48, top: 0, left: 0, right: 48, bottom: 48, toJSON: () => ({}) }) as DOMRect;
      document.body.appendChild(intruder);
      // Real elementsFromPoint answers depend on x/y — only "hit" the right
      // half of the viewport, matching where a bottom-right intruder sits.
      document.elementsFromPoint = (x: number) => (x > window.innerWidth / 2 ? [intruder] : []);
      return intruder;
    }

    afterEach(() => {
      // @ts-expect-error — restore jsdom's (missing) default between tests
      document.elementsFromPoint = undefined;
    });

    it("switches the FAB to the free corner when the default corner is already occupied", () => {
      const intruder = stubOccupiedRight();
      const instance = launch(defaultConfig());

      const widget = document.querySelector("instafix-widget")!;
      const fabEl = widget.shadowRoot!.querySelector(".sp-fab")!;
      expect(fabEl.classList.contains("sp-fab--bottom-left")).toBe(true);
      expect(fabEl.classList.contains("sp-fab--bottom-right")).toBe(false);

      instance.destroy();
      intruder.remove();
    });

    it("does not override an explicitly configured position", () => {
      const intruder = stubOccupiedRight();
      const instance = launch(defaultConfig({ position: "bottom-right" }));

      const widget = document.querySelector("instafix-widget")!;
      const fabEl = widget.shadowRoot!.querySelector(".sp-fab")!;
      expect(fabEl.classList.contains("sp-fab--bottom-right")).toBe(true);

      instance.destroy();
      intruder.remove();
    });

    it("does nothing when avoidOverlays is disabled", () => {
      const intruder = stubOccupiedRight();
      const instance = launch(defaultConfig({ avoidOverlays: false }));

      const widget = document.querySelector("instafix-widget")!;
      const fabEl = widget.shadowRoot!.querySelector(".sp-fab")!;
      expect(fabEl.classList.contains("sp-fab--bottom-right")).toBe(true);

      instance.destroy();
      intruder.remove();
    });
  });

  // -------------------------------------------------------------------------
  // Destroy
  // -------------------------------------------------------------------------

  describe("destroy", () => {
    it("removes the instafix-widget element", () => {
      const instance = launch(defaultConfig());
      instance.destroy();

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
    });

    it("removes the live region element", () => {
      const instance = launch(defaultConfig());
      instance.destroy();

      // After destroy, no live regions created by the widget should remain
      // (other tests may leave their own elements, so we just check the count didn't go up)
      const liveRegions = document.querySelectorAll('[aria-live="polite"][aria-atomic="true"]');
      expect(liveRegions.length).toBe(0);
    });

    it("can be called multiple times without throwing", () => {
      const instance = launch(defaultConfig());
      instance.destroy();
      // Second destroy should not throw (DOM elements already removed)
      expect(() => instance.destroy()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Config callbacks
  // -------------------------------------------------------------------------

  describe("config callbacks", () => {
    it("wires onOpen callback to bus 'open' event", async () => {
      const onOpen = vi.fn();
      const instance = launch(defaultConfig({ onOpen }));

      instance.open();

      // Panel is lazy-loaded — the "open" event fires once the dynamic
      // import resolves and Panel.open() executes.
      await vi.waitFor(() => {
        expect(onOpen).toHaveBeenCalled();
      });

      instance.destroy();
    });

    it("wires onClose callback to bus 'close' event", async () => {
      const onClose = vi.fn();
      const instance = launch(defaultConfig({ onClose }));

      instance.open();
      // Wait for the lazy-loaded Panel to actually open before closing it —
      // otherwise close() short-circuits while the import is still in flight.
      await vi.waitFor(() => {
        expect(document.querySelector("instafix-widget")?.shadowRoot?.querySelector(".sp-panel--open")).not.toBeNull();
      });
      instance.close();

      expect(onClose).toHaveBeenCalled();

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // Locale
  // -------------------------------------------------------------------------

  describe("locale", () => {
    it("defaults to Korean locale", () => {
      const instance = launch(defaultConfig());

      const widget = document.querySelector("instafix-widget")!;
      const shadow = widget.shadowRoot!;
      const fabBtn = shadow.querySelector<HTMLButtonElement>(".sp-fab")!;
      // Korean is the default locale and, like English, its dictionary is
      // bundled synchronously (no dynamic-import chunk to wait on), so the
      // FAB renders in Korean immediately — no fallback hedge needed.
      expect(fabBtn.getAttribute("aria-label")).toBe("도구 숨기기");

      instance.destroy();
    });

    it("supports English locale", async () => {
      const instance = launch(defaultConfig({ locale: "en" }));
      instance.open();

      // Panel is lazy-loaded — wait for it to mount into the shadow root.
      const widget = document.querySelector("instafix-widget")!;
      const shadow = widget.shadowRoot!;
      let panel: HTMLElement | null = null;
      await vi.waitFor(() => {
        panel = shadow.querySelector<HTMLElement>('[role="complementary"]');
        expect(panel).not.toBeNull();
      });
      expect(panel!.getAttribute("aria-label")).toBe("InstaFix fix note panel");

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // Config validation guards
  // -------------------------------------------------------------------------

  describe("config validation guards", () => {
    it("returns no-op when endpoint is missing", () => {
      const instance = launch({ projectName: "test", forceShow: true } as InstaFixConfig);

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      expect(instance.destroy).toBeTypeOf("function");
      instance.destroy();
    });

    it("returns no-op when endpoint is empty string", () => {
      const instance = launch(defaultConfig({ endpoint: "" }));

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      instance.destroy();
    });

    it("returns no-op when projectName is missing", () => {
      const instance = launch({ endpoint: "/api", forceShow: true } as InstaFixConfig);

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      instance.destroy();
    });

    it("returns no-op when projectName is empty string", () => {
      const instance = launch(defaultConfig({ projectName: "" }));

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      instance.destroy();
    });

    it("returns no-op when endpoint is not a string (number)", () => {
      const instance = launch(defaultConfig({ endpoint: 42 as unknown as string }));

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      instance.destroy();
    });

    it("returns no-op when projectName is not a string", () => {
      const instance = launch(defaultConfig({ projectName: 123 as unknown as string }));

      const widget = document.querySelector("instafix-widget");
      expect(widget).toBeNull();
      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // Additional callback wiring
  // -------------------------------------------------------------------------

  describe("additional callback wiring", () => {
    it("onAnnotationStart callback fires on annotation:start event", () => {
      const onAnnotationStart = vi.fn();
      const instance = launch(defaultConfig({ onAnnotationStart }));

      expect(annotatorCapture.bus).not.toBeNull();
      annotatorCapture.bus!.emit("annotation:start");
      expect(onAnnotationStart).toHaveBeenCalled();

      instance.destroy();
    });

    it("onAnnotationEnd callback fires on annotation:end event", () => {
      const onAnnotationEnd = vi.fn();
      const instance = launch(defaultConfig({ onAnnotationEnd }));

      expect(annotatorCapture.bus).not.toBeNull();
      annotatorCapture.bus!.emit("annotation:end");
      expect(onAnnotationEnd).toHaveBeenCalled();

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // Skipped instance API surface (no-op methods + on/off)
  // -------------------------------------------------------------------------

  describe("skipped instance API", () => {
    it("on() of skipped instance returns a no-op function", () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const instance = launch({ endpoint: "/api", projectName: "test" });

        const listener = () => {};
        const unsub = instance.on("panel:open", listener);
        expect(unsub).toBeTypeOf("function");

        // Calling unsub or off should not throw (it's a no-op)
        expect(() => unsub()).not.toThrow();
        expect(() => instance.off("panel:open", listener)).not.toThrow();
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });
  });

  // -------------------------------------------------------------------------
  // Debug logging
  // -------------------------------------------------------------------------

  describe("debug logging", () => {
    it("logs initialization details to console.debug when config.debug = true", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
      try {
        const instance = launch(defaultConfig({ debug: true }));

        // The launcher logs "Initializing widget", "Panel opened/closed", etc.
        // The first init log is fired synchronously
        expect(debugSpy).toHaveBeenCalled();
        const initialCalls = debugSpy.mock.calls.filter(
          (c: unknown[]) => typeof c[0] === "string" && c[0].includes("[instafix]"),
        );
        expect(initialCalls.length).toBeGreaterThan(0);

        instance.destroy();
        // destroy also logs
        const destroyCalls = debugSpy.mock.calls.filter(
          (c: unknown[]) => typeof c[1] === "string" && c[1].includes("Destroying"),
        );
        expect(destroyCalls.length).toBeGreaterThan(0);
      } finally {
        debugSpy.mockRestore();
      }
    });

    it("does not log when config.debug is false/undefined", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
      try {
        const instance = launch(defaultConfig());

        // No "[instafix]" debug messages should be emitted
        const instafixCalls = debugSpy.mock.calls.filter(
          (c: unknown[]) => typeof c[0] === "string" && c[0].includes("[instafix]"),
        );
        expect(instafixCalls.length).toBe(0);

        instance.destroy();
      } finally {
        debugSpy.mockRestore();
      }
    });

    it("debug log on duplicate launch() returns existing instance", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
      try {
        const first = launch(defaultConfig({ debug: true }));
        const second = launch(defaultConfig({ debug: true }));
        expect(first).toBe(second);

        // The second call should have triggered a debug log about "called more than once"
        const dupCalls = debugSpy.mock.calls.filter(
          (c: unknown[]) => typeof c[1] === "string" && c[1].includes("more than once"),
        );
        expect(dupCalls.length).toBeGreaterThan(0);

        first.destroy();
      } finally {
        debugSpy.mockRestore();
      }
    });
  });

  // -------------------------------------------------------------------------
  // process.env undefined branch (line 58)
  // -------------------------------------------------------------------------

  describe("production guard with process undefined", () => {
    it("does not skip when process is undefined (browser context)", () => {
      const origProcess = (globalThis as unknown as { process?: unknown }).process;
      // Simulate browser environment with no process global
      delete (globalThis as unknown as { process?: unknown }).process;

      try {
        const instance = launch({ endpoint: "/api", projectName: "test" });

        // Without process.env, the production guard's typeof check returns "undefined"
        // and the guard short-circuits — widget should mount
        const widget = document.querySelector("instafix-widget");
        expect(widget).not.toBeNull();

        instance.destroy();
      } finally {
        if (origProcess) {
          (globalThis as unknown as { process: unknown }).process = origProcess;
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // store config path (line 99)
  // -------------------------------------------------------------------------

  describe("store config path", () => {
    it("uses StoreClient when config.store is provided (no endpoint)", () => {
      const fakeStore = {
        createFeedback: vi.fn().mockResolvedValue({}),
        getFeedbacks: vi.fn().mockResolvedValue({ feedbacks: [], total: 0 }),
        getFeedback: vi.fn(),
        updateFeedback: vi.fn(),
        deleteFeedback: vi.fn(),
        deleteAllFeedbacks: vi.fn(),
      };
      const instance = launch({
        store: fakeStore as unknown as InstaFixStore,
        projectName: "test",
        forceShow: true,
      });

      // Widget should be mounted (no endpoint required)
      const widget = document.querySelector("instafix-widget");
      expect(widget).not.toBeNull();
      // store.getFeedbacks should be called for initial markers load
      expect(fakeStore.getFeedbacks).toHaveBeenCalled();
      // The "if (config.endpoint)" branch (line 251) should NOT call flushRetryQueue
      // (we can't directly check that from this side without exposing the mock)

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // flushRetryQueue rejection (line 254)
  // -------------------------------------------------------------------------

  describe("flushRetryQueue rejection", () => {
    it("does not throw when flushRetryQueue rejects on initial load", async () => {
      flushRetryQueueMock.mockRejectedValueOnce(new Error("Network failure"));

      const instance = launch(defaultConfig());
      // Wait for the .catch(() => {}) handler to run on the rejection
      await new Promise((r) => setTimeout(r, 50));

      // Widget should still mount even if flushRetryQueue rejects
      const widget = document.querySelector("instafix-widget");
      expect(widget).not.toBeNull();

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // feedback:deleted bridge (line 113 — anonymous_7)
  // -------------------------------------------------------------------------

  describe("feedback:deleted public bridge", () => {
    it("emits feedback:deleted on the public bus when internal bus emits it", () => {
      const instance = launch(defaultConfig());
      const listener = vi.fn();
      instance.on("feedback:deleted", listener);

      expect(annotatorCapture.bus).not.toBeNull();
      annotatorCapture.bus!.emit("feedback:deleted", "feedback-id-123");

      expect(listener).toHaveBeenCalledWith("feedback-id-123");

      instance.destroy();
    });
  });

  // -------------------------------------------------------------------------
  // adoptedStyleSheets branch (modern browsers)
  // -------------------------------------------------------------------------

  describe("style injection", () => {
    it("uses adoptedStyleSheets when supported", () => {
      // jsdom does not support adoptedStyleSheets — temporarily polyfill
      const proto = ShadowRoot.prototype as unknown as { adoptedStyleSheets?: CSSStyleSheet[] };
      const hadProp = Object.hasOwn(proto, "adoptedStyleSheets");

      // Provide a writable adoptedStyleSheets so the "in ShadowRoot.prototype" check passes
      Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
        value: [],
        writable: true,
        configurable: true,
      });

      // Polyfill CSSStyleSheet — jsdom's may not allow construction with replaceSync
      const origCSSStyleSheet = (globalThis as unknown as { CSSStyleSheet?: typeof CSSStyleSheet }).CSSStyleSheet;
      class FakeCSSStyleSheet {
        replaceSync = vi.fn();
      }
      (globalThis as unknown as { CSSStyleSheet: typeof CSSStyleSheet }).CSSStyleSheet =
        FakeCSSStyleSheet as unknown as typeof CSSStyleSheet;

      try {
        const instance = launch(defaultConfig());

        const widget = document.querySelector("instafix-widget")!;
        expect(widget).not.toBeNull();
        // Shadow root should have been mutated with the constructed sheet
        const shadow = widget.shadowRoot as ShadowRoot & { adoptedStyleSheets: CSSStyleSheet[] };
        expect(shadow.adoptedStyleSheets.length).toBe(1);

        instance.destroy();
      } finally {
        if (origCSSStyleSheet) {
          (globalThis as unknown as { CSSStyleSheet: typeof CSSStyleSheet }).CSSStyleSheet = origCSSStyleSheet;
        } else {
          delete (globalThis as unknown as { CSSStyleSheet?: typeof CSSStyleSheet }).CSSStyleSheet;
        }
        if (hadProp) {
          Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
            value: [],
            writable: true,
            configurable: true,
          });
        } else {
          delete (proto as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets;
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // updateConfig — the facade + listener-replay mechanism behind the
  // widget's in-panel Settings view (and any host calling it directly)
  // -------------------------------------------------------------------------

  describe("updateConfig", () => {
    it("tears down and remounts with a fresh host element, leaving exactly one in the DOM", () => {
      const instance = launch(defaultConfig());
      const before = document.querySelector("instafix-widget");
      expect(before).not.toBeNull();

      instance.updateConfig({ theme: "dark" });

      const after = document.querySelector("instafix-widget");
      expect(after).not.toBeNull();
      expect(after).not.toBe(before);
      expect(document.querySelectorAll("instafix-widget").length).toBe(1);

      instance.destroy();
      expect(document.querySelectorAll("instafix-widget").length).toBe(0);
    });

    it("replays .on() listeners onto the remounted instance", () => {
      const instance = launch(defaultConfig());
      const listener = vi.fn();
      instance.on("feedback:deleted", listener);

      instance.updateConfig({ theme: "dark" });

      // The Annotator mock captures whichever internal bus it was last
      // constructed with — after updateConfig that's the new mount's bus.
      annotatorCapture.bus?.emit("feedback:deleted", "feedback-id-after-update");
      expect(listener).toHaveBeenCalledWith("feedback-id-after-update");

      instance.destroy();
    });

    it("off() removes a listener even after updateConfig rebuilt the underlying bus", () => {
      const instance = launch(defaultConfig());
      const listener = vi.fn();
      instance.on("feedback:deleted", listener);
      instance.updateConfig({ theme: "dark" });
      instance.off("feedback:deleted", listener);

      annotatorCapture.bus?.emit("feedback:deleted", "should-not-fire");
      expect(listener).not.toHaveBeenCalled();

      instance.destroy();
    });

    it("the unsubscribe returned by .on() also still works after updateConfig", () => {
      const instance = launch(defaultConfig());
      const listener = vi.fn();
      const unsub = instance.on("feedback:deleted", listener);
      instance.updateConfig({ theme: "dark" });
      unsub();

      annotatorCapture.bus?.emit("feedback:deleted", "should-not-fire");
      expect(listener).not.toHaveBeenCalled();

      instance.destroy();
    });

    it("a merged option takes effect for real — showAnnotationsToggle removes the toolbar's eye button live", () => {
      const instance = launch(defaultConfig({ showAnnotationsToggle: true }));
      const shadowBefore = document.querySelector("instafix-widget")!.shadowRoot!;
      expect(shadowBefore.querySelector('[data-item-id="toggle-annotations"]')).not.toBeNull();

      instance.updateConfig({ showAnnotationsToggle: false });

      const shadowAfter = document.querySelector("instafix-widget")!.shadowRoot!;
      expect(shadowAfter.querySelector('[data-item-id="toggle-annotations"]')).toBeNull();

      instance.destroy();
    });

    it("destroy() is idempotent, including after an updateConfig remount", () => {
      const instance = launch(defaultConfig());
      instance.updateConfig({ theme: "dark" });
      instance.destroy();
      expect(() => instance.destroy()).not.toThrow();
    });

    it("preserves panel-open and settings-expanded state across a settings-triggered remount", async () => {
      const instance = launch(defaultConfig());
      instance.open();

      await vi.waitFor(() => {
        expect(document.querySelector("instafix-widget")?.shadowRoot?.querySelector(".sp-panel--open")).not.toBeNull();
      });

      const shadow = document.querySelector("instafix-widget")!.shadowRoot!;
      shadow.querySelector<HTMLButtonElement>(".sp-settings-toggle")!.click();
      expect(shadow.querySelector(".sp-settings-region")?.classList.contains("sp-settings-region--open")).toBe(true);

      // Changing the theme control fires onUpdateConfig, which is this same
      // updateConfig() — the widget tears down and remounts with a fresh
      // <instafix-widget> host, then the launcher should reopen the panel
      // and re-expand the settings accordion on the new one.
      shadow.querySelector<HTMLButtonElement>('[data-theme="dark"]')!.click();

      await vi.waitFor(() => {
        const freshShadow = document.querySelector("instafix-widget")?.shadowRoot;
        expect(freshShadow?.querySelector(".sp-panel--open")).not.toBeNull();
      });

      const freshShadow = document.querySelector("instafix-widget")!.shadowRoot!;
      expect(freshShadow.querySelector(".sp-settings-region")?.classList.contains("sp-settings-region--open")).toBe(
        true,
      );

      instance.destroy();
    });
  });
});
