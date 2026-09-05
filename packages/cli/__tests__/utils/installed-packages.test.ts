import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  formatPackageStatus,
  readInstalledVersion,
  surveyInstaFixPackages,
} from "../../src/utils/installed-packages.js";

let cwd: string;

function writeJson(path: string, value: unknown): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(value));
}

function installPackage(name: string, version: string): void {
  writeJson(join(cwd, "node_modules", ...name.split("/"), "package.json"), { name, version });
}

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "instafix-survey-"));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("readInstalledVersion", () => {
  it("reads the version a package will actually load with", () => {
    installPackage("@instafix/widget", "0.10.16");
    expect(readInstalledVersion(cwd, "@instafix/widget")).toBe("0.10.16");
  });

  it("returns null when the package is not on disk", () => {
    expect(readInstalledVersion(cwd, "@instafix/widget")).toBeNull();
  });

  it("returns null for an unparseable or version-less package.json", () => {
    mkdirSync(join(cwd, "node_modules", "@instafix", "widget"), { recursive: true });
    writeFileSync(join(cwd, "node_modules", "@instafix", "widget", "package.json"), "{ not json");
    expect(readInstalledVersion(cwd, "@instafix/widget")).toBeNull();

    writeJson(join(cwd, "node_modules", "@instafix", "dashboard", "package.json"), { name: "x" });
    expect(readInstalledVersion(cwd, "@instafix/dashboard")).toBeNull();
  });
});

describe("surveyInstaFixPackages", () => {
  it("merges declared, installed and expected packages", () => {
    writeJson(join(cwd, "package.json"), {
      name: "host",
      dependencies: { "@instafix/widget": "^0.10.0", react: "19.0.0" },
      devDependencies: { "@instafix/cli": "^0.5.0" },
    });
    installPackage("@instafix/widget", "0.10.16");
    installPackage("@instafix/adapter-sqlite", "0.4.2");

    const rows = surveyInstaFixPackages(cwd, ["@instafix/dashboard"]);
    expect(rows).toEqual([
      { name: "@instafix/adapter-sqlite", version: "0.4.2", spec: null },
      { name: "@instafix/cli", version: null, spec: "^0.5.0" },
      { name: "@instafix/dashboard", version: null, spec: null },
      { name: "@instafix/widget", version: "0.10.16", spec: "^0.10.0" },
    ]);
  });

  it("survives a missing, unreadable or oddly-shaped package.json", () => {
    expect(surveyInstaFixPackages(cwd)).toEqual([]);

    writeFileSync(join(cwd, "package.json"), "{ broken");
    expect(surveyInstaFixPackages(cwd, ["@instafix/widget"])).toEqual([
      { name: "@instafix/widget", version: null, spec: null },
    ]);

    writeJson(join(cwd, "package.json"), { dependencies: "nope", devDependencies: null });
    expect(surveyInstaFixPackages(cwd)).toEqual([]);
  });

  it("ignores non-instafix scopes and non-string specs", () => {
    writeJson(join(cwd, "package.json"), { dependencies: { "@instafix/widget": 1, next: "15" } });
    installPackage("@other/thing", "1.0.0");
    expect(surveyInstaFixPackages(cwd)).toEqual([]);
  });
});

describe("formatPackageStatus", () => {
  it("aligns names and flags what is not installed", () => {
    const lines = formatPackageStatus([
      { name: "@instafix/widget", version: "0.10.16", spec: "^0.10.0" },
      { name: "@instafix/cli", version: null, spec: "^0.5.0" },
      { name: "@instafix/dashboard", version: null, spec: null },
      { name: "@instafix/adapter-fs", version: "0.3.1", spec: "^0.3.1" },
    ]);
    expect(lines).toEqual([
      "@instafix/widget      0.10.16  (declared ^0.10.0)",
      "@instafix/cli         not installed (declared ^0.5.0)",
      "@instafix/dashboard   not installed",
      "@instafix/adapter-fs  0.3.1",
    ]);
  });

  it("handles an empty survey", () => {
    expect(formatPackageStatus([])).toEqual([]);
  });
});
