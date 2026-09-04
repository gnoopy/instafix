import { testInstaFixStore } from "@instafix/core/testing";
import { SqliteStore } from "../src/index.js";

// `:memory:` gives every test a fresh, isolated, on-disk-free database — no
// file cleanup needed between the ~44 conformance tests.
//
// createFeedback doesn't self-resolve a duplicate clientId (it throws
// StoreDuplicateError, mirroring PrismaStore's raw-constraint-error
// propagation — the HTTP handler does the catch + refetch dance for both).
testInstaFixStore(() => new SqliteStore({ path: ":memory:" }), {
  duplicateBehavior: "throw",
  caseInsensitiveSearch: true,
});

// ---------------------------------------------------------------------------
// Additive column migration
// ---------------------------------------------------------------------------

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("schema migration", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "instafix-sqlite-"));
    path = join(dir, "test.db");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /** Build the annotation table as an older release left it — no `inspect`. */
  function seedLegacyDatabase(): void {
    const db = new Database(path);
    db.exec(`
      CREATE TABLE instafix_annotation (
        id TEXT PRIMARY KEY,
        feedbackId TEXT NOT NULL,
        cssSelector TEXT NOT NULL,
        target TEXT
      );
    `);
    db.close();
  }

  it("adds the inspect column to a database created before it existed", () => {
    seedLegacyDatabase();
    const before = new Database(path).pragma("table_info(instafix_annotation)") as Array<{ name: string }>;
    expect(before.map((c) => c.name)).not.toContain("inspect");

    // Constructing the store runs the migration. `CREATE TABLE IF NOT EXISTS`
    // leaves the legacy table alone, so without this the INSERT naming
    // `inspect` would fail with "no such column".
    new SqliteStore({ path });

    const after = new Database(path).pragma("table_info(instafix_annotation)") as Array<{ name: string }>;
    expect(after.map((c) => c.name)).toContain("inspect");
  });

  it("is idempotent — reopening an already-migrated database is a no-op", () => {
    seedLegacyDatabase();
    new SqliteStore({ path });
    expect(() => new SqliteStore({ path })).not.toThrow();
    const columns = (new Database(path).pragma("table_info(instafix_annotation)") as Array<{ name: string }>).filter(
      (c) => c.name === "inspect",
    );
    expect(columns).toHaveLength(1);
  });
});
