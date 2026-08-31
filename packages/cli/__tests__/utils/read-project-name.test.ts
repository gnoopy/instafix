// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readProjectName } from "../../src/utils/read-project-name.js";

describe("readProjectName", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "instafix-project-name-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("reads the name field from package.json", () => {
    writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "acme" }));
    expect(readProjectName(tmpDir)).toBe("acme");
  });

  it("strips the npm scope from a scoped package name", () => {
    writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "@acme/web" }));
    expect(readProjectName(tmpDir)).toBe("web");
  });

  it("falls back to my-project when package.json is missing", () => {
    expect(readProjectName(tmpDir)).toBe("my-project");
  });

  it("falls back to my-project when package.json has no name field", () => {
    writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ version: "1.0.0" }));
    expect(readProjectName(tmpDir)).toBe("my-project");
  });

  it("falls back to my-project when the name field is an empty string", () => {
    writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "   " }));
    expect(readProjectName(tmpDir)).toBe("my-project");
  });

  it("falls back to my-project when package.json is invalid JSON", () => {
    writeFileSync(join(tmpDir, "package.json"), "{ not json");
    expect(readProjectName(tmpDir)).toBe("my-project");
  });
});
