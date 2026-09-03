import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FsStore } from "../src/index.js";

describe("FsStore production guard", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  function tmpDir() {
    return mkdtempSync(join(tmpdir(), "instafix-adapter-fs-prod-guard-"));
  }

  it("throws when constructed with NODE_ENV=production", () => {
    process.env.NODE_ENV = "production";
    expect(() => new FsStore({ dir: tmpDir() })).toThrow(/NODE_ENV=production/);
  });

  it("does not throw when allowProduction is true", () => {
    process.env.NODE_ENV = "production";
    expect(() => new FsStore({ dir: tmpDir(), allowProduction: true })).not.toThrow();
  });

  it("does not throw outside production (e.g. development/test)", () => {
    process.env.NODE_ENV = "development";
    expect(() => new FsStore({ dir: tmpDir() })).not.toThrow();
  });
});
