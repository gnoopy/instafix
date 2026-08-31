// @vitest-environment node
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateWidgetComponent } from "../../src/generators/widget-component.js";

describe("generateWidgetComponent", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "instafix-widget-component-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // Directory detection
  // -------------------------------------------------------------------------

  it("creates the component in components/instafix-widget.tsx when no src/app/ exists", () => {
    const result = generateWidgetComponent(tmpDir, "acme");

    expect(result.created).toBe(true);
    expect(result.path).toBe(join(tmpDir, "components", "instafix-widget.tsx"));
    expect(existsSync(result.path)).toBe(true);
  });

  it("creates the component in src/components/instafix-widget.tsx when src/app/ exists", () => {
    mkdirSync(join(tmpDir, "src", "app"), { recursive: true });

    const result = generateWidgetComponent(tmpDir, "acme");

    expect(result.path).toBe(join(tmpDir, "src", "components", "instafix-widget.tsx"));
    expect(existsSync(result.path)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Idempotency
  // -------------------------------------------------------------------------

  it("returns { created: false } when the file already exists", () => {
    const first = generateWidgetComponent(tmpDir, "acme");
    expect(first.created).toBe(true);

    const second = generateWidgetComponent(tmpDir, "acme");
    expect(second.created).toBe(false);
    expect(second.path).toBe(first.path);
  });

  // -------------------------------------------------------------------------
  // Generated content
  // -------------------------------------------------------------------------

  it("generates a client component that wires up initInstaFix with the given project name", () => {
    const result = generateWidgetComponent(tmpDir, "acme");
    const content = readFileSync(result.path, "utf-8");

    expect(content).toContain('"use client"');
    expect(content).toContain('import { initInstaFix } from "@instafix/widget"');
    expect(content).toContain('endpoint: "/api/instafix"');
    expect(content).toContain('projectName: "acme"');
    expect(content).toContain("export function InstaFixWidget()");
    expect(content).toContain("return destroy;");
  });

  it("defaults the project name to my-project when not given", () => {
    const result = generateWidgetComponent(tmpDir);
    const content = readFileSync(result.path, "utf-8");

    expect(content).toContain('projectName: "my-project"');
  });

  // -------------------------------------------------------------------------
  // Permission error
  // -------------------------------------------------------------------------

  it("throws descriptive error message on EACCES permission error", () => {
    mkdirSync(join(tmpDir, "components"), { recursive: true });
    chmodSync(join(tmpDir, "components"), 0o444);

    try {
      expect(() => generateWidgetComponent(tmpDir, "acme")).toThrow(/Permission denied.*cannot write to/);
    } finally {
      chmodSync(join(tmpDir, "components"), 0o755);
    }
  });

  it("rethrows non-permission errors (e.g. EEXIST) verbatim", () => {
    // "components" already exists as a plain file, so mkdirSync(..., { recursive: true })
    // fails to create the directory in its place.
    writeFileSync(join(tmpDir, "components"), "blocker");

    expect(() => generateWidgetComponent(tmpDir, "acme")).toThrow();
    try {
      generateWidgetComponent(tmpDir, "acme");
    } catch (e) {
      expect((e as Error).message).not.toMatch(/Permission denied/);
      expect((e as NodeJS.ErrnoException).code).toBe("EEXIST");
    }
  });

  // -------------------------------------------------------------------------
  // Default basePath / projectName
  // -------------------------------------------------------------------------

  it("uses process.cwd() as default basePath when not provided", () => {
    const originalCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      const result = generateWidgetComponent();
      expect(result.path).toBe(join(tmpDir, "components", "instafix-widget.tsx"));
    } finally {
      process.chdir(originalCwd);
    }
  });
});
