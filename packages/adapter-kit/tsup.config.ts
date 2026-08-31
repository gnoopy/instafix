import { defineConfig } from "tsup";
import { instafixLibrary } from "../../tsup.preset.js";

// vitest stays external automatically (optional peer, only needed by ./testing).
export default defineConfig(
  instafixLibrary({
    platform: "neutral",
    entry: ["src/index.ts", "src/testing.ts"],
  }),
);
