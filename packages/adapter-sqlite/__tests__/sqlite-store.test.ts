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

  /**
   * Every handle opened by a test, closed on the way out.
   *
   * Not hygiene for its own sake: better-sqlite3's `Statement` destructor
   * calls `node::RemoveEnvironmentCleanupHook`, which asserts on a null
   * environment. A handle left to the GC can be finalized after the worker's
   * environment is gone, and the process aborts with a native assertion
   * instead of failing a test (seen on Node 24 in CI, where it took the whole
   * vitest worker down mid-run). Closing here finalizes the statements while
   * the environment is still alive.
   */
  let handles: Array<{ close(): void }>;

  function open(): Database.Database {
    const db = new Database(path);
    handles.push(db);
    return db;
  }

  function openStore(): SqliteStore {
    const store = new SqliteStore({ path });
    handles.push(store);
    return store;
  }

  function columnNames(): string[] {
    const info = open().pragma("table_info(instafix_annotation)") as Array<{ name: string }>;
    return info.map((c) => c.name);
  }

  beforeEach(() => {
    handles = [];
    dir = mkdtempSync(join(tmpdir(), "instafix-sqlite-"));
    path = join(dir, "test.db");
  });

  afterEach(() => {
    for (const handle of handles.reverse()) handle.close();
    rmSync(dir, { recursive: true, force: true });
  });

  /** Build the annotation table as an older release left it — no `inspect`. */
  function seedLegacyDatabase(): void {
    open().exec(`
      CREATE TABLE instafix_annotation (
        id TEXT PRIMARY KEY,
        feedbackId TEXT NOT NULL,
        cssSelector TEXT NOT NULL,
        target TEXT
      );
    `);
  }

  it("adds the inspect column to a database created before it existed", () => {
    seedLegacyDatabase();
    expect(columnNames()).not.toContain("inspect");

    // Constructing the store runs the migration. `CREATE TABLE IF NOT EXISTS`
    // leaves the legacy table alone, so without this the INSERT naming
    // `inspect` would fail with "no such column".
    openStore();

    expect(columnNames()).toContain("inspect");
  });

  it("is idempotent — reopening an already-migrated database is a no-op", () => {
    seedLegacyDatabase();
    openStore();
    expect(() => openStore()).not.toThrow();
    expect(columnNames().filter((name) => name === "inspect")).toHaveLength(1);
  });
});
