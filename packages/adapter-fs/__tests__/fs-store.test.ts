import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testInstaFixStore } from "@instafix/core/testing";
import { FsStore } from "../src/index.js";

// Every test gets its own throwaway directory under the OS tmpdir — no
// cross-test interference, and it never touches this repo's own `.instafix`.
testInstaFixStore(() => new FsStore({ dir: mkdtempSync(join(tmpdir(), "instafix-adapter-fs-")) }), {
  screenshotBehavior: "external",
});
