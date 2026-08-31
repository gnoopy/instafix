// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initCommand } from "../../src/commands/init.js";
import { p } from "../../src/prompts.js";
import * as runPrismaDbPushModule from "../../src/utils/run-prisma-db-push.js";

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

const MINIMAL_SCHEMA = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`;

function createPrismaSchema(dir: string, content = MINIMAL_SCHEMA): void {
  const prismaDir = join(dir, "prisma");
  mkdirSync(prismaDir, { recursive: true });
  writeFileSync(join(prismaDir, "schema.prisma"), content);
}

function createAppDir(dir: string): void {
  mkdirSync(join(dir, "app"), { recursive: true });
}

function createApiRoute(dir: string): void {
  const routeDir = join(dir, "app", "api", "instafix");
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "route.ts"), "export const GET = () => {};");
}

function allMessages(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls.map((call) => String(call[0]));
}

/** Queue confirm() answers for schema found: sync, push, route, widget. */
function queueConfirms(answers: [sync: boolean, push: boolean, route: boolean, widget: boolean] | boolean[]): void {
  const mock = vi.mocked(p.confirm);
  for (const answer of answers) {
    mock.mockResolvedValueOnce(answer as never);
  }
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
    vi.spyOn(runPrismaDbPushModule, "runPrismaDbPush").mockReturnValue(true);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Schema found — sync paths
  // -------------------------------------------------------------------------

  describe("schema found + sync", () => {
    it("syncs new models when confirmed", async () => {
      createPrismaSchema(tmpDir);
      queueConfirms([true, false, false, false]); // sync, push, route, widget

      await initCommand();

      expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("Prisma schema found"));
      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("InstaFixFeedback"));
      expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining("InstaFixAnnotation"));
    });

    it("logs field changes for partial schema (added + updated)", async () => {
      createPrismaSchema(
        tmpDir,
        `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model InstaFixFeedback {
  id          String   @id @default(cuid())
  projectName String
  type        String
  message     String
  createdAt   DateTime @default(now())
}
`,
      );
      queueConfirms([true, false, false, false]); // sync, push, route, widget

      await initCommand();

      const successes = allMessages(vi.mocked(p.log.success));
      // InstaFixAnnotation model should be added
      expect(successes.some((m) => m.includes("InstaFixAnnotation"))).toBe(true);
      // Missing fields should be logged
      expect(successes.some((m) => m.includes("added"))).toBe(true);
    });

    it("reports schema already up to date when run twice", async () => {
      createPrismaSchema(tmpDir);

      // First run: sync models
      queueConfirms([true, false, false, false]);
      await initCommand();

      // Clear spies for second run
      vi.mocked(p.log.success).mockClear();
      vi.mocked(p.log.info).mockClear();

      // Second run: already up to date
      queueConfirms([true, false, false, false]);
      await initCommand();

      expect(p.log.info).toHaveBeenCalledWith("Schema is already up to date.");
    });

    it("exits(1) when schema file cannot be written (permission denied)", async () => {
      createPrismaSchema(tmpDir);
      const schemaPath = join(tmpDir, "prisma", "schema.prisma");
      // Make file read-only to trigger write error
      const { chmodSync } = await import("node:fs");
      chmodSync(schemaPath, 0o444);

      vi.mocked(p.confirm).mockResolvedValueOnce(true); // sync schema

      const err = await initCommand().catch((e) => e);

      // Restore write permission for cleanup
      chmodSync(schemaPath, 0o644);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("Error:"));
      expect(p.outro).toHaveBeenCalledWith(expect.stringContaining("Fix the errors"));
    });

    it("exits(0) when sync confirm is cancelled", async () => {
      createPrismaSchema(tmpDir);

      vi.mocked(p.confirm).mockResolvedValueOnce(Symbol("cancel") as any);

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(0);
      expect(p.cancel).toHaveBeenCalledWith("Cancelled.");
    });

    it("does not sync when user declines", async () => {
      createPrismaSchema(tmpDir);
      queueConfirms([false, false, false, false]); // decline sync, push, route, widget

      await initCommand();

      // Schema should not have been modified (no InstaFixFeedback model)
      const successes = allMessages(vi.mocked(p.log.success));
      expect(successes.some((m) => m.includes("Models synced"))).toBe(false);
    });

    it("exits(0) when the db push confirm is cancelled", async () => {
      createPrismaSchema(tmpDir);

      vi.mocked(p.confirm)
        .mockResolvedValueOnce(false) // decline sync
        .mockResolvedValueOnce(Symbol("cancel") as any); // cancel push prompt

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(0);
      expect(p.cancel).toHaveBeenCalledWith("Cancelled.");
    });
  });

  // -------------------------------------------------------------------------
  // Database push
  // -------------------------------------------------------------------------

  describe("db push", () => {
    it("runs prisma db push and reports success when confirmed", async () => {
      createPrismaSchema(tmpDir);
      queueConfirms([false, true, false, false]); // skip sync, run push, skip route, skip widget

      await initCommand();

      expect(runPrismaDbPushModule.runPrismaDbPush).toHaveBeenCalledWith(tmpDir);
      expect(p.log.success).toHaveBeenCalledWith("Database schema pushed.");
    });

    it("reports failure and keeps the next-steps hint when db push exits non-zero", async () => {
      createPrismaSchema(tmpDir);
      vi.mocked(runPrismaDbPushModule.runPrismaDbPush).mockReturnValue(false);
      queueConfirms([false, true, false, false]);

      await initCommand();

      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("failed"));
      expect(p.note).toHaveBeenCalledWith(expect.stringContaining("npx prisma db push"), "Next steps");
    });

    it("does not run db push when declined", async () => {
      createPrismaSchema(tmpDir);
      queueConfirms([false, false, false, false]);

      await initCommand();

      expect(runPrismaDbPushModule.runPrismaDbPush).not.toHaveBeenCalled();
      expect(p.note).toHaveBeenCalledWith(expect.stringContaining("npx prisma db push"), "Next steps");
    });

    it("does not prompt for db push when no schema is found", async () => {
      queueConfirms([false, false]); // route, widget only — no schema means no sync/push prompts

      await initCommand();

      expect(runPrismaDbPushModule.runPrismaDbPush).not.toHaveBeenCalled();
      const confirmMessages = vi.mocked(p.confirm).mock.calls.map((c) => (c[0] as { message: string }).message);
      expect(confirmMessages.some((m) => m.includes("db push"))).toBe(false);
    });

    it("omits the db push hint from next steps when no schema is found", async () => {
      queueConfirms([false, false]);

      await initCommand();

      const noteText = vi.mocked(p.note).mock.calls.find((c) => c[1] === "Next steps")?.[0] as string;
      expect(noteText).not.toContain("npx prisma db push");
    });
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

    it("prompts for a backend choice instead of assuming Prisma when no schema is found", async () => {
      createAppDir(tmpDir);

      await initCommand();

      expect(p.select).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining("No Prisma schema found") }),
      );
      expect(p.confirm).not.toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining("Prisma") }),
      );
    });

    it("lists the API route as a manual next step when storage setup is skipped", async () => {
      createAppDir(tmpDir);
      // beforeEach already defaults select() to "skip"

      await initCommand();

      const noteText = vi.mocked(p.note).mock.calls.find((c) => c[1] === "Next steps")?.[0] as string;
      expect(noteText).toContain("Wire the API route yourself");
    });

    it("asks the Prisma-flavored route prompt when a schema is present", async () => {
      createPrismaSchema(tmpDir);
      createAppDir(tmpDir);
      queueConfirms([false, false, true, false]); // sync, push, route, widget

      await initCommand();

      expect(p.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Generate the Next.js App Router API route (Prisma)?" }),
      );
      expect(p.select).not.toHaveBeenCalled();
      const routePath = join(tmpDir, "app", "api", "instafix", "route.ts");
      expect(readFileSync(routePath, "utf-8")).toContain("@instafix/adapter-prisma");
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
    it("runs schema sync + db push + route + widget when all confirmed", async () => {
      createPrismaSchema(tmpDir);
      createAppDir(tmpDir);
      queueConfirms([true, true, true, true]);

      await initCommand();

      const successes = allMessages(vi.mocked(p.log.success));
      expect(successes.some((m) => m.includes("InstaFixFeedback"))).toBe(true);
      expect(successes.some((m) => m.includes("Database schema pushed"))).toBe(true);
      expect(successes.some((m) => m.includes("Route created"))).toBe(true);
      expect(successes.some((m) => m.includes("Widget component created"))).toBe(true);
      expect(existsSync(join(tmpDir, "app", "api", "instafix", "route.ts"))).toBe(true);
      expect(existsSync(join(tmpDir, "components", "instafix-widget.tsx"))).toBe(true);
    });

    it("shows the short layout snippet referencing the generated component when everything ran", async () => {
      createPrismaSchema(tmpDir);
      createAppDir(tmpDir);
      queueConfirms([true, true, true, true]);

      await initCommand();

      const noteText = vi.mocked(p.note).mock.calls.find((c) => c[1] === "Next steps")?.[0] as string;
      expect(noteText).toContain('import { InstaFixWidget } from "@/components/instafix-widget"');
      expect(noteText).toContain("<InstaFixWidget />");
      expect(noteText).not.toContain("npx prisma db push");
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
    it("formats sync failures via String() when a non-Error value is thrown", async () => {
      // Stub syncPrismaModels to throw a plain string. The init catch block
      // chooses `String(error)` because the value is not an Error instance,
      // covering the falsy branch of the conditional in the schema-sync path.
      createPrismaSchema(tmpDir);
      const prismaModule = await import("../../src/generators/prisma.js");
      const stub = vi.spyOn(prismaModule, "syncPrismaModels").mockImplementation(() => {
        throw "plain-string sync failure"; // not an Error
      });

      vi.mocked(p.confirm).mockResolvedValueOnce(true); // confirm sync

      const err = await initCommand().catch((e) => e);

      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
      expect(p.log.error).toHaveBeenCalledWith(expect.stringContaining("plain-string sync failure"));
      expect(p.outro).toHaveBeenCalledWith(expect.stringContaining("Fix the errors"));

      stub.mockRestore();
    });

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
