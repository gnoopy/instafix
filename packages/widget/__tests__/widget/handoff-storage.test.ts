// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { getHandedOffAt, markHandedOff } from "../../src/handoff-storage.js";

describe("handoff-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("records and reads back a handoff timestamp", () => {
    expect(getHandedOffAt("fb-1")).toBeNull();
    markHandedOff(["fb-1", "fb-2"]);
    expect(getHandedOffAt("fb-1")).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(getHandedOffAt("fb-2")).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(getHandedOffAt("fb-3")).toBeNull();
  });

  it("an empty id list is a no-op", () => {
    markHandedOff([]);
    expect(localStorage.getItem("instafix_handed_off")).toBeNull();
  });

  it("survives corrupted storage without throwing", () => {
    localStorage.setItem("instafix_handed_off", "{not json");
    expect(getHandedOffAt("fb-1")).toBeNull();
    expect(() => markHandedOff(["fb-1"])).not.toThrow();
    expect(getHandedOffAt("fb-1")).not.toBeNull();
  });

  it("caps the stored map at 500 entries, keeping the newest", () => {
    const seed: Record<string, string> = {};
    for (let i = 0; i < 500; i++) {
      seed[`fb-${i}`] = new Date(2026, 0, 1, 0, 0, i).toISOString();
    }
    localStorage.setItem("instafix_handed_off", JSON.stringify(seed));

    markHandedOff(["fb-new"]);

    expect(getHandedOffAt("fb-new")).not.toBeNull();
    // Over the 500 cap — the oldest entry must have been trimmed.
    expect(getHandedOffAt("fb-0")).toBeNull();
  });
});
