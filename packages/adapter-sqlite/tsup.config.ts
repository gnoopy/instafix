import { defineConfig } from "tsup";
import { instafixLibrary } from "../../tsup.preset.js";

export default defineConfig(
  instafixLibrary({
    platform: "node",
    target: "node20",
    // better-sqlite3 ships a native .node binary — bundling it breaks the
    // native require() resolution, so it must stay external.
    external: ["better-sqlite3", "@instafix/adapter-prisma"],
  }),
);
