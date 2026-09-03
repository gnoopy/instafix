// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initCommand } from "../../src/commands/init.js";
import { p } from "../../src/prompts.js";

// ---------------------------------------------------------------------------
// ExitError — thrown by mocked process.exit to halt execution cleanly
// ---------------------------------------------------------------------------

class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`process.exit(${code})`);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createAppDir(dir: string): void {
  mkdirSync(join(dir, "app"), { recursive: true });
}

function createApiRoute(dir: string): void {
  const routeDir = join(dir, "app", "api", "instafix");
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "route.ts"), "export const GET = () => {};");
}

// ---------------------------------------------------------------------------
// Tests — integration style: real file system, spied clack output
// ---------------------------------------------------------------------------

describe("initCommand", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "instafix-init-test-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);

    vi.spyOn(process, "exit").mockImplementation(((code: number) => {
      throw new ExitError(code ?? 0);
    }) as never);
    vi.spyOn(p, "intro").mockImplementation(() => {});
    vi.spyOn(p, "outro").mockImplementation(() => {});
    vi.spyOn(p, "cancel").mockImplementation(() => {});
    vi.spyOn(p, "confirm").mockResolvedValue(false);
    vi.spyOn(p, "select").mockResolvedValue("skip" as never);
    vi.spyOn(p, "note").mockImplementation(() => {});
    vi.spyOn(p, "isCancel").mockImplementation((v: unknown) => typeof v === "symbol");
    vi.spyOn(p.log, "error").mockImplementation(() => {});
    vi.spyOn(p.log, "success").mockImplementation(() => {});
    vi.spyOn(p.log, "warn").mockImplementation(() => {});
    vi.spyOn(p.log, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Route generation
  // -------------------------------------------------------------------------

  describe("route generation", () => {
    it("shows success when the sqlite route is created", async () => {
      createAppDir(tmpDir);
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never); // backend choice
      vi.mocked(p.confirm).mockResolvedValueOnce(false); // decline widget

      await initCommand();

      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("Route created:"));
      // Verify the file was actually created
      const routePath = join(tmpDir, "app", "api", "instafix", "route.ts");
      expect(existsSync(routePath)).toBe(true);
      expect(readFileSync(routePath, "utf-8")).toContain("@instafix/adapter-sqlite");
    });

    it("shows info when route already exists", async () => {
      createApiRoute(tmpDir);
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never);
      vi.mocked(p.confirm).mockResolvedValueOnce(false);

      await initCommand();

      expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("Route already exists:"));
    });

    it("exits(1) when no app directory exists", async () => {
      // No app/ dir in tmpDir
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never); // will throw

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("Error:"));
      expect(p.outro).toHaveBeenCalledWith(expect.stringContaining("Fix the errors"));
    });

    it("exits(0) when the backend-choice select is cancelled", async () => {
      // No schema, so we go straight to the backend-choice prompt
      vi.mocked(p.select).mockResolvedValueOnce(Symbol("cancel") as any);

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(0);
      expect(p.cancel).toHaveBeenCalledWith("Cancelled.");
    });

    it("does not generate a route when the user skips storage setup", async () => {
      createAppDir(tmpDir);
      // beforeEach already defaults select() to "skip"

      await initCommand();

      expect(existsSync(join(tmpDir, "app", "api", "instafix", "route.ts"))).toBe(false);
    });

    it("always prompts for a backend choice, regardless of an existing Prisma schema", async () => {
      createAppDir(tmpDir);
      mkdirSync(join(tmpDir, "prisma"), { recursive: true });
      writeFileSync(join(tmpDir, "prisma", "schema.prisma"), "// a real schema, irrelevant to InstaFix's own storage");

      await initCommand();

      expect(p.select).toHaveBeenCalledWith(
        expect.objectContaining({ message: "How should InstaFix store feedback?" }),
      );
    });

    it("lists the API route as a manual next step when storage setup is skipped", async () => {
      createAppDir(tmpDir);
      // beforeEach already defaults select() to "skip"

      await initCommand();

      const noteText = vi.mocked(p.note).mock.calls.find((c) => c[1] === "Next steps")?.[0] as string;
      expect(noteText).toContain("Wire the API route yourself");
    });
  });

  // -------------------------------------------------------------------------
  // Widget component generation
  // -------------------------------------------------------------------------

  describe("widget component generation", () => {
    it("generates the component and reports success when confirmed", async () => {
      writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "acme" }));
      // beforeEach defaults select() to "skip" (no schema found)
      vi.mocked(p.confirm).mockResolvedValueOnce(true); // confirm widget

      await initCommand();

      const componentPath = join(tmpDir, "components", "instafix-widget.tsx");
      expect(existsSync(componentPath)).toBe(true);
      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("Widget component created:"));
    });

    it("shows info when the component already exists", async () => {
      mkdirSync(join(tmpDir, "components"), { recursive: true });
      writeFileSync(join(tmpDir, "components", "instafix-widget.tsx"), "// existing");
      vi.mocked(p.confirm).mockResolvedValueOnce(true);

      await initCommand();

      expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("Widget component already exists:"));
    });

    it("does not generate the component when declined", async () => {
      // beforeEach already defaults both select() and confirm() to decline

      await initCommand();

      expect(existsSync(join(tmpDir, "components", "instafix-widget.tsx"))).toBe(false);
    });

    it("exits(0) when the widget confirm is cancelled", async () => {
      // beforeEach defaults select() to "skip" (no schema found)
      vi.mocked(p.confirm).mockResolvedValueOnce(Symbol("cancel") as any); // cancel widget prompt

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(0);
      expect(p.cancel).toHaveBeenCalledWith("Cancelled.");
    });

    it("formats generation failures via String() when a non-Error value is thrown", async () => {
      const widgetModule = await import("../../src/generators/widget-component.js");
      const stub = vi.spyOn(widgetModule, "generateWidgetComponent").mockImplementation(() => {
        throw "plain-string widget failure"; // not an Error
      });

      vi.mocked(p.confirm).mockResolvedValueOnce(true); // confirm widget

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("plain-string widget failure"));
      expect(p.outro).toHaveBeenCalledWith(expect.stringContaining("Fix the errors"));

      stub.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Full happy path
  // -------------------------------------------------------------------------

  describe("full flow", () => {
    it("runs route + widget when both confirmed", async () => {
      createAppDir(tmpDir);
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never);
      vi.mocked(p.confirm).mockResolvedValueOnce(true); // widget

      await initCommand();

      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("Route created"));
      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("Widget component created"));
      expect(existsSync(join(tmpDir, "app", "api", "instafix", "route.ts"))).toBe(true);
      expect(existsSync(join(tmpDir, "components", "instafix-widget.tsx"))).toBe(true);
    });

    it("shows the short layout snippet referencing the generated component when everything ran", async () => {
      createAppDir(tmpDir);
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never);
      vi.mocked(p.confirm).mockResolvedValueOnce(true); // widget

      await initCommand();

      const noteText = vi.mocked(p.note).mock.calls.find((c) => c[1] === "Next steps")?.[0] as string;
      expect(noteText).toContain('import { InstaFixWidget } from "@/components/instafix-widget"');
      expect(noteText).toContain("<InstaFixWidget />");
      expect(noteText).not.toContain("initInstaFix");
    });
  });

  // -------------------------------------------------------------------------
  // Intro / outro / next steps
  // -------------------------------------------------------------------------

  describe("UI framing", () => {
    it("calls intro and outro", async () => {
      // beforeEach already defaults select()/confirm() to decline everything

      await initCommand();

      expect(p.intro).toHaveBeenCalledWith("instafix — Setup");
      expect(p.outro).toHaveBeenCalledWith("Setup complete!");
    });

    it("shows the full initInstaFix snippet in next steps when the widget component was declined", async () => {
      writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "acme" }));
      // beforeEach already defaults select()/confirm() to decline everything

      await initCommand();

      expect(p.note).toHaveBeenCalledWith(
        expect.stringContaining('import { initInstaFix } from "@instafix/widget"'),
        "Next steps",
      );
      expect(p.note).toHaveBeenCalledWith(expect.stringContaining('projectName: "acme"'), "Next steps");
    });
  });

  // -------------------------------------------------------------------------
  // Non-Error throwables — covers `String(error)` fallback in both catches
  // -------------------------------------------------------------------------

  describe("non-Error throwables", () => {
    it("formats route-generation failures via String() when a non-Error value is thrown", async () => {
      // Stub generateRoute to throw a plain string in the route-creation path.
      const routeModule = await import("../../src/generators/route.js");
      const stub = vi.spyOn(routeModule, "generateRoute").mockImplementation(() => {
        throw "plain-string route failure"; // not an Error
      });

      // No schema → flow goes straight to the backend-choice prompt; pick sqlite.
      vi.mocked(p.select).mockResolvedValueOnce("sqlite" as never);

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("plain-string route failure"));
      expect(p.outro).toHaveBeenCalledWith(expect.stringContaining("Fix the errors"));

      stub.mockRestore();
    });
  });
});
