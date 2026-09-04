// @vitest-environment node
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateDashboardPage } from "../../src/generators/dashboard-page.js";

describe("generateDashboardPage", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "instafix-dashboard-page-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // Directory detection
  // -------------------------------------------------------------------------

  it("creates the page in app/instafix/page.tsx when no src/app/ exists", () => {
    const result = generateDashboardPage(tmpDir, "acme");

    expect(result.created).toBe(true);
    expect(result.path).toBe(join(tmpDir, "app", "instafix", "page.tsx"));
    expect(existsSync(result.path)).toBe(true);
  });

  it("creates the page in src/app/instafix/page.tsx when src/app/ exists", () => {
    mkdirSync(join(tmpDir, "src", "app"), { recursive: true });

    const result = generateDashboardPage(tmpDir, "acme");

    expect(result.path).toBe(join(tmpDir, "src", "app", "instafix", "page.tsx"));
    expect(existsSync(result.path)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // URL
  // -------------------------------------------------------------------------

  it("always reports /instafix as the served URL, regardless of layout", () => {
    expect(generateDashboardPage(tmpDir, "acme").url).toBe("/instafix");

    const srcDir = mkdtempSync(join(tmpdir(), "instafix-dashboard-page-test-src-"));
    try {
      mkdirSync(join(srcDir, "src", "app"), { recursive: true });
      expect(generateDashboardPage(srcDir, "acme").url).toBe("/instafix");
    } finally {
      rmSync(srcDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Idempotency
  // -------------------------------------------------------------------------

  it("returns { created: false } when the file already exists", () => {
    const first = generateDashboardPage(tmpDir, "acme");
    expect(first.created).toBe(true);

    const second = generateDashboardPage(tmpDir, "acme");
    expect(second.created).toBe(false);
    expect(second.path).toBe(first.path);
    expect(second.url).toBe(first.url);
  });

  // -------------------------------------------------------------------------
  // Generated content
  // -------------------------------------------------------------------------

  it("generates a client component that mounts InstaFixInbox against /api/instafix with the given project name", () => {
    const result = generateDashboardPage(tmpDir, "acme");
    const content = readFileSync(result.path, "utf-8");

    expect(content).toContain('"use client"');
    expect(content).toContain('import { InstaFixInbox } from "@instafix/dashboard"');
    expect(content).toContain('projects="acme"');
    expect(content).toContain('endpoint="/api/instafix"');
    expect(content).toContain("export default function InstaFixDashboardPage()");
    // No auth of its own — the page must say so, since init's own next-steps
    // note repeats this and the two need to stay consistent.
    expect(content).toContain("no access control of its own");
  });

  it("defaults the project name to my-project when not given", () => {
    const result = generateDashboardPage(tmpDir);
    const content = readFileSync(result.path, "utf-8");

    expect(content).toContain('projects="my-project"');
  });

  // -------------------------------------------------------------------------
  // Permission error
  // -------------------------------------------------------------------------

  it("throws descriptive error message on EACCES permission error", () => {
    mkdirSync(join(tmpDir, "app"), { recursive: true });
    chmodSync(join(tmpDir, "app"), 0o444);

    try {
      expect(() => generateDashboardPage(tmpDir, "acme")).toThrow(/Permission denied.*cannot write to/);
    } finally {
      chmodSync(join(tmpDir, "app"), 0o755);
    }
  });

  it("rethrows non-permission errors (e.g. EEXIST) verbatim", () => {
    // "app/instafix" already exists as a plain file, so mkdirSync(..., { recursive: true })
    // fails to create the directory in its place.
    mkdirSync(join(tmpDir, "app"), { recursive: true });
    writeFileSync(join(tmpDir, "app", "instafix"), "blocker");

    expect(() => generateDashboardPage(tmpDir, "acme")).toThrow();
    try {
      generateDashboardPage(tmpDir, "acme");
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
      const result = generateDashboardPage();
      expect(result.path).toBe(join(tmpDir, "app", "instafix", "page.tsx"));
    } finally {
      process.chdir(originalCwd);
    }
  });
});
