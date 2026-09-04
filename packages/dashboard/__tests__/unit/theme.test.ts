// @vitest-environment jsdom

import { INSTAFIX_SHARED_SETTINGS_KEY } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeAccent, readSharedAccentColor, resolveInitialTheme, watchSystemTheme } from "../../src/theme.js";

// ---------------------------------------------------------------------------
// matchMedia stub — jsdom ships none by default
// ---------------------------------------------------------------------------

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_type: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_type: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb)),
  };
  const matchMedia = vi.fn(() => mql);
  Object.defineProperty(window, "matchMedia", { value: matchMedia, writable: true, configurable: true });
  return {
    mql,
    listeners,
    fire(next: boolean) {
      mql.matches = next;
      for (const cb of listeners) cb({ matches: next });
    },
  };
}

afterEach(() => {
  // jsdom has no matchMedia by default — remove any stub between tests.
  Reflect.deleteProperty(window, "matchMedia");
  vi.restoreAllMocks();
});

describe("normalizeAccent", () => {
  it("passes a 6-digit hex through", () => {
    expect(normalizeAccent("#173cff")).toBe("#173cff");
  });

  it("expands a 3-digit shorthand", () => {
    expect(normalizeAccent("#0af")).toBe("#00aaff");
  });

  it("strips the alpha from an 8-digit hex", () => {
    expect(normalizeAccent("#0066ffcc")).toBe("#0066ff");
  });

  it.each(["red", "rgb(0,0,0)", "hsl(200 100% 50%)", "oklch(0.7 0.1 200)", "", "#12", "#12345", "0066ff"])(
    "warns and falls back to #0066ff for %s",
    (input) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(normalizeAccent(input)).toBe("#0066ff");
      expect(warn).toHaveBeenCalledOnce();
    },
  );
});

describe("resolveInitialTheme", () => {
  it("returns dark for an explicit dark request without touching matchMedia", () => {
    expect(resolveInitialTheme("dark")).toBe("dark");
  });

  it("returns light for an explicit light request", () => {
    expect(resolveInitialTheme("light")).toBe("light");
  });

  it("auto resolves to dark when the system prefers dark", () => {
    stubMatchMedia(true);
    expect(resolveInitialTheme("auto")).toBe("dark");
  });

  it("auto resolves to light when the system prefers light", () => {
    stubMatchMedia(false);
    expect(resolveInitialTheme("auto")).toBe("light");
  });

  it("auto resolves to light when matchMedia is unavailable", () => {
    expect(window.matchMedia).toBeUndefined();
    expect(resolveInitialTheme("auto")).toBe("light");
  });
});

describe("watchSystemTheme", () => {
  it("invokes the callback with the new theme on a change event", () => {
    const media = stubMatchMedia(false);
    const cb = vi.fn();
    watchSystemTheme(cb);
    media.fire(true);
    expect(cb).toHaveBeenCalledWith("dark");
    media.fire(false);
    expect(cb).toHaveBeenCalledWith("light");
  });

  it("stops firing after unsubscribe", () => {
    const media = stubMatchMedia(false);
    const cb = vi.fn();
    const unsubscribe = watchSystemTheme(cb);
    unsubscribe();
    expect(media.mql.removeEventListener).toHaveBeenCalledOnce();
    media.fire(true);
    expect(cb).not.toHaveBeenCalled();
  });

  it("is a no-op (returns a disposer) when matchMedia is unavailable", () => {
    const cb = vi.fn();
    const unsubscribe = watchSystemTheme(cb);
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("readSharedAccentColor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(readSharedAccentColor()).toBeNull();
  });

  it("reads the syncedAccentColor field @instafix/widget writes under the shared key", () => {
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, JSON.stringify({ syncedAccentColor: "#7c3aed", theme: "dark" }));
    expect(readSharedAccentColor()).toBe("#7c3aed");
  });

  it("returns null when the stored blob has no syncedAccentColor field", () => {
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, JSON.stringify({ theme: "dark" }));
    expect(readSharedAccentColor()).toBeNull();
  });

  it("ignores the widget's own visitor-preference accentColor field — only syncedAccentColor is the cross-package contract", () => {
    // Regression guard: reading the widget's `accentColor` field here (instead
    // of the dedicated `syncedAccentColor` one) would mean the dashboard only
    // ever reflects a value that was *also* designed to override the widget's
    // own host config on its next load — not the intent here at all.
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, JSON.stringify({ accentColor: "#7c3aed" }));
    expect(readSharedAccentColor()).toBeNull();
  });

  it("returns null for a non-string or empty syncedAccentColor", () => {
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, JSON.stringify({ syncedAccentColor: 42 }));
    expect(readSharedAccentColor()).toBeNull();
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, JSON.stringify({ syncedAccentColor: "" }));
    expect(readSharedAccentColor()).toBeNull();
  });

  it("returns null for non-object stored JSON (null, array, primitive)", () => {
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, "null");
    expect(readSharedAccentColor()).toBeNull();
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, "42");
    expect(readSharedAccentColor()).toBeNull();
  });

  it("survives corrupted (non-JSON) storage without throwing", () => {
    localStorage.setItem(INSTAFIX_SHARED_SETTINGS_KEY, "{not json");
    expect(readSharedAccentColor()).toBeNull();
  });

  it("survives localStorage.getItem throwing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    expect(readSharedAccentColor()).toBeNull();
  });
});
