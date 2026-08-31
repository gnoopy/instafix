import { defineConfig } from "tsup";
import { instafixLibrary } from "../../tsup.preset.js";

export default defineConfig(instafixLibrary({ platform: "neutral" }));
