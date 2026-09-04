// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSyncedSettings,
  loadPersistedSettings,
  savePersistedSettings,
  syncSharedSettings,
} from "../../src/settings-storage.js";

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

describe("syncSharedSettings / getSyncedSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns {} when nothing was ever synced", () => {
    expect(getSyncedSettings()).toEqual({});
  });

  it("round-trips a synced accent color, theme, and locale together", () => {
    syncSharedSettings({ accentColor: "#7c3aed", theme: "dark", locale: "fr" });
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#7c3aed", syncedTheme: "dark", syncedLocale: "fr" });
  });

  it("merges a partial patch — omitted fields keep whatever was already synced", () => {
    syncSharedSettings({ accentColor: "#7c3aed", theme: "dark", locale: "fr" });
    syncSharedSettings({ accentColor: "#059669" });
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#059669", syncedTheme: "dark", syncedLocale: "fr" });
  });

  it("overwrites on every call, reflecting the most recent sync", () => {
    syncSharedSettings({ accentColor: "#7c3aed" });
    syncSharedSettings({ accentColor: "#059669" });
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#059669" });
  });

  it("preserves whatever visitor-preference settings were already persisted", () => {
    savePersistedSettings({ theme: "dark", locale: "fr" });
    syncSharedSettings({ accentColor: "#7c3aed" });
    expect(loadPersistedSettings()).toEqual({ theme: "dark", locale: "fr" });
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#7c3aed" });
  });

  it("does NOT surface as SettingsPatch fields — synced values must never win over the host's config on the widget's own next load", () => {
    syncSharedSettings({ accentColor: "#7c3aed", theme: "dark", locale: "fr" });
    expect(loadPersistedSettings()).toEqual({});
  });

  it("sync is a no-op that never throws when localStorage itself throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => syncSharedSettings({ accentColor: "#7c3aed" })).not.toThrow();
  });

  it("read survives localStorage.getItem throwing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    expect(getSyncedSettings()).toEqual({});
  });

  it("drops an invalid syncedTheme while keeping the rest", () => {
    localStorage.setItem("instafix_settings", JSON.stringify({ syncedTheme: "rainbow", syncedAccentColor: "#7c3aed" }));
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#7c3aed" });
  });

  it("survives corrupted (non-JSON) storage without throwing", () => {
    localStorage.setItem("instafix_settings", "{not json");
    expect(getSyncedSettings()).toEqual({});
    expect(() => syncSharedSettings({ accentColor: "#7c3aed" })).not.toThrow();
    expect(getSyncedSettings()).toEqual({ syncedAccentColor: "#7c3aed" });
  });
});
