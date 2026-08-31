import { describe, expect, it } from "vitest";
import { InstaFixAuthError, InstaFixError, InstaFixNetworkError, InstaFixValidationError } from "../src/errors.js";

describe("InstaFixError (base)", () => {
  it("constructs with explicit code and retryable flag", () => {
    const err = new InstaFixError("boom", "CUSTOM", true);
    expect(err.message).toBe("boom");
    expect(err.code).toBe("CUSTOM");
    expect(err.retryable).toBe(true);
    expect(err.name).toBe("InstaFixError");
  });

  it("is an Error subclass — instanceof Error", () => {
    const err = new InstaFixError("x", "X", false);
    expect(err).toBeInstanceOf(Error);
  });

  it("retryable can be explicitly false", () => {
    const err = new InstaFixError("nope", "NOPE", false);
    expect(err.retryable).toBe(false);
  });
});

describe("InstaFixNetworkError", () => {
  it("has code NETWORK and is retryable", () => {
    const err = new InstaFixNetworkError("connection refused");
    expect(err.code).toBe("NETWORK");
    expect(err.retryable).toBe(true);
    expect(err.name).toBe("InstaFixNetworkError");
  });

  it("is instanceof InstaFixError", () => {
    const err = new InstaFixNetworkError("x");
    expect(err).toBeInstanceOf(InstaFixError);
  });

  it("preserves the message", () => {
    const err = new InstaFixNetworkError("timed out after 10s");
    expect(err.message).toBe("timed out after 10s");
  });
});

describe("InstaFixValidationError", () => {
  it("has code VALIDATION and is not retryable", () => {
    const err = new InstaFixValidationError("bad shape");
    expect(err.code).toBe("VALIDATION");
    expect(err.retryable).toBe(false);
    expect(err.name).toBe("InstaFixValidationError");
  });

  it("is instanceof InstaFixError", () => {
    const err = new InstaFixValidationError("x");
    expect(err).toBeInstanceOf(InstaFixError);
  });
});

describe("InstaFixAuthError", () => {
  it("has code AUTH and is not retryable", () => {
    const err = new InstaFixAuthError("401");
    expect(err.code).toBe("AUTH");
    expect(err.retryable).toBe(false);
    expect(err.name).toBe("InstaFixAuthError");
  });

  it("is instanceof InstaFixError", () => {
    const err = new InstaFixAuthError("x");
    expect(err).toBeInstanceOf(InstaFixError);
  });

  it("is distinguishable from InstaFixValidationError despite both not retryable", () => {
    const auth = new InstaFixAuthError("401");
    const validation = new InstaFixValidationError("400");
    expect(auth).toBeInstanceOf(InstaFixAuthError);
    expect(auth).not.toBeInstanceOf(InstaFixValidationError);
    expect(validation).toBeInstanceOf(InstaFixValidationError);
    expect(validation).not.toBeInstanceOf(InstaFixAuthError);
  });
});
