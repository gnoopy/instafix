// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock node:child_process — spawnSync's return shape is fixed per test via
// spawnSyncMock.fn, keeping the process actually spawned to zero.
// ---------------------------------------------------------------------------

interface SpawnSyncMock {
  fn: ((...args: unknown[]) => unknown) | null;
  calls: unknown[][];
}

const spawnSyncMock: SpawnSyncMock = { fn: null, calls: [] };

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    spawnSync: (...args: unknown[]) => {
      spawnSyncMock.calls.push(args);
      if (spawnSyncMock.fn) return spawnSyncMock.fn(...args);
      throw new Error("spawnSync called without a mock implementation");
    },
  };
});

import { runPrismaDbPush } from "../../src/utils/run-prisma-db-push.js";

describe("runPrismaDbPush", () => {
  afterEach(() => {
    spawnSyncMock.fn = null;
    spawnSyncMock.calls = [];
  });

  it("returns true when npx prisma db push exits 0", () => {
    spawnSyncMock.fn = () => ({ status: 0 });

    const result = runPrismaDbPush("/some/project");

    expect(result).toBe(true);
    expect(spawnSyncMock.calls[0]?.[0]).toBe("npx");
    expect(spawnSyncMock.calls[0]?.[1]).toEqual(["prisma", "db", "push"]);
    expect(spawnSyncMock.calls[0]?.[2]).toMatchObject({ cwd: "/some/project", stdio: "inherit" });
  });

  it("returns false when npx prisma db push exits non-zero", () => {
    spawnSyncMock.fn = () => ({ status: 1 });

    expect(runPrismaDbPush("/some/project")).toBe(false);
  });

  it("returns false when the prisma CLI cannot be found (null status)", () => {
    spawnSyncMock.fn = () => ({ status: null, error: new Error("ENOENT") });

    expect(runPrismaDbPush("/some/project")).toBe(false);
  });
});
