import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetSessionIdentityForTests, getIdentity, saveIdentity } from "../../src/identity.js";

describe("identity", () => {
  beforeEach(() => {
    // The identity now also lives in an in-memory session tier (so a blocked
    // localStorage cannot re-trigger the prompt) — clear it between cases.
    _resetSessionIdentityForTests();
    // Mock localStorage
    const store: Record<string, string> = {};
    const sessionStore: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => sessionStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete sessionStore[key];
      }),
    });
  });

  it("returns null when no identity stored", () => {
    expect(getIdentity()).toBeNull();
  });

  it("saves and retrieves identity", () => {
    saveIdentity({ name: "Alice", email: "alice@test.com" });
    const identity = getIdentity();
    expect(identity).toEqual({ name: "Alice", email: "alice@test.com" });
  });

  it("returns null for corrupted JSON", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("not json");
    expect(getIdentity()).toBeNull();
  });

  it("returns null for partial identity (missing email)", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('{"name":"Alice"}');
    expect(getIdentity()).toBeNull();
  });

  it("handles localStorage quota error gracefully", () => {
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    // Should not throw
    expect(() => saveIdentity({ name: "Alice", email: "a@b.com" })).not.toThrow();
  });
});

describe("identity — storage failures must not re-open the prompt", () => {
  beforeEach(() => {
    _resetSessionIdentityForTests();
  });

  it("holds the answer for the session when localStorage refuses to write", () => {
    const sessionStore: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new DOMException("QuotaExceededError");
      }),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => sessionStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStore[key] = value;
      }),
      removeItem: vi.fn(),
    });

    saveIdentity({ name: "Alice", email: "alice@test.com" });
    // This is the exact loop the prompt was stuck in: a swallowed write, then
    // a null read, then another prompt on the next submit.
    expect(getIdentity()).toEqual({ name: "Alice", email: "alice@test.com" });
  });

  it("holds it even when BOTH storages are denied", () => {
    const deny = {
      getItem: vi.fn(() => {
        throw new Error("denied");
      }),
      setItem: vi.fn(() => {
        throw new Error("denied");
      }),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("localStorage", deny);
    vi.stubGlobal("sessionStorage", deny);

    saveIdentity({ name: "Bob", email: "bob@test.com" });
    expect(getIdentity()).toEqual({ name: "Bob", email: "bob@test.com" });
  });

  it("recovers from sessionStorage when only localStorage is blocked", () => {
    const stored = JSON.stringify({ name: "Carol", email: "carol@test.com" });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => stored),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    expect(getIdentity()).toEqual({ name: "Carol", email: "carol@test.com" });
  });
});
