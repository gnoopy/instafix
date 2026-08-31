import { describe, expect, it, vi } from "vitest";
import { clearDraft, loadDraft, saveDraft } from "../../src/draft-storage.js";

function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe("draft-storage", () => {
  it("round-trips a draft for the same page", () => {
    const storage = makeStorage();
    saveDraft({ type: "bug", message: "the button is broken", url: "/settings", savedAt: Date.now() }, storage);

    const loaded = loadDraft("/settings", storage);
    expect(loaded).toEqual(expect.objectContaining({ type: "bug", message: "the button is broken", url: "/settings" }));
  });

  it("returns null when there is no draft", () => {
    expect(loadDraft("/settings", makeStorage())).toBeNull();
  });

  it("does not resurface a draft written for a different page", () => {
    const storage = makeStorage();
    saveDraft({ type: "bug", message: "note about page A", url: "/page-a", savedAt: Date.now() }, storage);
    expect(loadDraft("/page-b", storage)).toBeNull();
  });

  it("does not resurface a stale draft (older than 30 minutes)", () => {
    const storage = makeStorage();
    const savedAt = Date.now() - 31 * 60 * 1000;
    saveDraft({ type: "bug", message: "old note", url: "/settings", savedAt }, storage);
    expect(loadDraft("/settings", storage, Date.now())).toBeNull();
  });

  it("keeps a draft right at the edge of the freshness window", () => {
    const storage = makeStorage();
    const now = Date.now();
    const savedAt = now - 29 * 60 * 1000;
    saveDraft({ type: "bug", message: "recent note", url: "/settings", savedAt }, storage);
    expect(loadDraft("/settings", storage, now)).not.toBeNull();
  });

  it("does not resurface an empty/whitespace-only draft", () => {
    const storage = makeStorage();
    saveDraft({ type: null, message: "   ", url: "/settings", savedAt: Date.now() }, storage);
    expect(loadDraft("/settings", storage)).toBeNull();
  });

  it("clearDraft removes the persisted draft", () => {
    const storage = makeStorage();
    saveDraft({ type: "bug", message: "note", url: "/settings", savedAt: Date.now() }, storage);
    clearDraft(storage);
    expect(loadDraft("/settings", storage)).toBeNull();
  });

  it("saveDraft never throws when storage.setItem throws (quota/disabled)", () => {
    const storage = makeStorage();
    storage.setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveDraft({ type: "bug", message: "note", url: "/x", savedAt: Date.now() }, storage)).not.toThrow();
  });

  it("loadDraft returns null instead of throwing on corrupt JSON", () => {
    const storage = makeStorage();
    storage.setItem("siteping_draft_v1", "{not json");
    expect(loadDraft("/settings", storage)).toBeNull();
  });

  it("loadDraft returns null instead of throwing when storage.getItem throws", () => {
    const storage = makeStorage();
    storage.getItem = vi.fn(() => {
      throw new Error("SecurityError");
    });
    expect(loadDraft("/settings", storage)).toBeNull();
  });

  it("clearDraft never throws when storage.removeItem throws", () => {
    const storage = makeStorage();
    storage.removeItem = vi.fn(() => {
      throw new Error("SecurityError");
    });
    expect(() => clearDraft(storage)).not.toThrow();
  });
});
