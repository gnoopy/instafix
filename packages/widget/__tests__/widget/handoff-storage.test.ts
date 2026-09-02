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
});
