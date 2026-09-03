// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadPersistedSettings, savePersistedSettings } from "../../src/settings-storage.js";

describe("settings-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty patch when nothing is persisted", () => {
    expect(loadPersistedSettings()).toEqual({});
  });

  it("round-trips a full valid settings patch", () => {
    savePersistedSettings({
      theme: "dark",
      locale: "ko",
      position: "bottom-left",
      accentColor: "#ff0000",
      enableScreenshot: false,
      captureDiagnostics: true,
    });
    expect(loadPersistedSettings()).toEqual({
      theme: "dark",
      locale: "ko",
      position: "bottom-left",
      accentColor: "#ff0000",
      enableScreenshot: false,
      captureDiagnostics: true,
    });
  });

  it("merges a new patch into what was already persisted, one field at a time", () => {
    savePersistedSettings({ theme: "dark" });
    savePersistedSettings({ locale: "fr" });
    expect(loadPersistedSettings()).toEqual({ theme: "dark", locale: "fr" });
  });

  it("drops an invalid theme or position while keeping the rest of the patch", () => {
    localStorage.setItem(
      "instafix_settings",
      JSON.stringify({ theme: "rainbow", position: "top-center", locale: "de" }),
    );
    expect(loadPersistedSettings()).toEqual({ locale: "de" });
  });

  it("drops a non-string/empty locale and accentColor", () => {
    localStorage.setItem("instafix_settings", JSON.stringify({ locale: "", accentColor: "", theme: "light" }));
    expect(loadPersistedSettings()).toEqual({ theme: "light" });
  });

  it("drops non-boolean enableScreenshot/captureDiagnostics", () => {
    localStorage.setItem(
      "instafix_settings",
      JSON.stringify({ enableScreenshot: "yes", captureDiagnostics: 1, theme: "auto" }),
    );
    expect(loadPersistedSettings()).toEqual({ theme: "auto" });
  });

  it("returns an empty patch for non-object stored JSON (null, array, primitive)", () => {
    localStorage.setItem("instafix_settings", "null");
    expect(loadPersistedSettings()).toEqual({});
    localStorage.setItem("instafix_settings", "42");
    expect(loadPersistedSettings()).toEqual({});
  });

  it("survives corrupted (non-JSON) storage without throwing", () => {
    localStorage.setItem("instafix_settings", "{not json");
    expect(loadPersistedSettings()).toEqual({});
  });

  it("save is a no-op that never throws when localStorage itself throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => savePersistedSettings({ theme: "dark" })).not.toThrow();
  });

  it("load survives localStorage.getItem throwing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    expect(loadPersistedSettings()).toEqual({});
  });
});
