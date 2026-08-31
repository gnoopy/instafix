import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInstaFixHandler } from "../src/index.js";
import { validAnnotation, validPayloadNoAnnotations } from "./fixtures.js";

// NOTE: the type-level regression guard for #99 (delegate bivariance) lives in
// src/index.ts next to PrismaModelDelegate, where it documents the constraint
// at the definition site.

function mockPrisma() {
  return {
    instafixFeedback: {
      create: vi.fn().mockResolvedValue({
        id: "fb-1",
        ...validPayloadNoAnnotations,
        status: "open",
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        annotations: [],
      }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi
        .fn()
        .mockResolvedValue({ id: "fb-1", status: "resolved", resolvedAt: new Date().toISOString(), annotations: [] }),
      delete: vi.fn().mockResolvedValue({ id: "fb-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
    },
  };
}

describe("createInstaFixHandler", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let handler: ReturnType<typeof createInstaFixHandler>;

  beforeEach(() => {
    prisma = mockPrisma();
    // These tests focus on validation/persistence/error paths; the destructive-op
    // auth gate is exercised in auth-cors.test.ts.
    handler = createInstaFixHandler({ prisma, requireAuthForDestructive: false });
  });

  describe("POST", () => {
    it("creates a feedback with valid payload", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
      expect(prisma.instafixFeedback.create).toHaveBeenCalledOnce();
    });

    it("returns 400 for invalid JSON", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: "not json",
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing required fields", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({ type: "bug" }),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it("returns 400 for invalid email", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({ ...validPayloadNoAnnotations, authorEmail: "not-email" }),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(400);
    });

    it("handles duplicate clientId gracefully", async () => {
      prisma.instafixFeedback.create.mockRejectedValue({ code: "P2002" });
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", ...validPayloadNoAnnotations });
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
    });

    it("returns 500 on unexpected DB error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      prisma.instafixFeedback.create.mockRejectedValue(new Error("DB down"));
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(500);
      consoleSpy.mockRestore();
    });

    it("maps annotation anchor fields to Prisma create", async () => {
      const payloadWithAnnotation = {
        ...validPayloadNoAnnotations,
        annotations: [validAnnotation],
      };

      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(payloadWithAnnotation),
      });

      await handler.POST(req);

      expect(prisma.instafixFeedback.create).toHaveBeenCalledOnce();
      const createArg = prisma.instafixFeedback.create.mock.calls[0]?.[0] as {
        data: { annotations: { create: Array<Record<string, unknown>> } };
      };
      const [flatAnnotation] = createArg.data.annotations.create;
      if (!flatAnnotation) throw new Error("expected one annotation in the Prisma create payload");

      expect(flatAnnotation.cssSelector).toBe("div.main > section:nth-child(2)");
      expect(flatAnnotation.xpath).toBe("/html/body/div[1]/section[2]");
      expect(flatAnnotation.textSnippet).toBe("Welcome to our platform");
      expect(flatAnnotation.elementTag).toBe("SECTION");
      expect(flatAnnotation.elementId).toBe("hero");
      expect(flatAnnotation.textPrefix).toBe("Navigation links here");
      expect(flatAnnotation.textSuffix).toBe("Learn more about us");
      expect(flatAnnotation.fingerprint).toBe("3:1:a1b2c3");
      expect(flatAnnotation.neighborText).toBe("Previous section | Next section");
      expect(flatAnnotation.xPct).toBe(0.1);
      expect(flatAnnotation.yPct).toBe(0.2);
      expect(flatAnnotation.wPct).toBe(0.5);
      expect(flatAnnotation.hPct).toBe(0.3);
      expect(flatAnnotation.scrollX).toBe(0);
      expect(flatAnnotation.scrollY).toBe(150);
      expect(flatAnnotation.viewportW).toBe(1920);
      expect(flatAnnotation.viewportH).toBe(1080);
      expect(flatAnnotation.devicePixelRatio).toBe(2);
    });

    it("passes screenshotRegion into Prisma create", async () => {
      const region = { xPct: 0.25, yPct: 0.4, wPct: 0.3, hPct: 0.1 };
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({ ...validPayloadNoAnnotations, screenshotRegion: region }),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
      const createArg = prisma.instafixFeedback.create.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(createArg.data.screenshotRegion).toEqual(region);
    });

    it("omits the screenshotRegion column when the payload has none (unsynced schemas)", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
      const createArg = prisma.instafixFeedback.create.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(createArg.data).not.toHaveProperty("screenshotRegion");
    });

    it("returns 400 for an invalid screenshotRegion", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify({
          ...validPayloadNoAnnotations,
          screenshotRegion: { xPct: 1.5, yPct: 0, wPct: 0.5, hPct: 0.5 },
        }),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(400);
      expect(prisma.instafixFeedback.create).not.toHaveBeenCalled();
    });
  });

  describe("GET", () => {
    it("returns feedbacks for a project", async () => {
      prisma.instafixFeedback.findMany.mockResolvedValue([]);
      prisma.instafixFeedback.count.mockResolvedValue(0);
      const req = new Request("http://localhost/api/instafix?projectName=test");
      const res = await handler.GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("feedbacks");
      expect(body).toHaveProperty("total");
    });

    it("returns 400 without projectName", async () => {
      const req = new Request("http://localhost/api/instafix");
      const res = await handler.GET(req);
      expect(res.status).toBe(400);
    });

    it("rejects limit > 100 via Zod validation", async () => {
      const req = new Request("http://localhost/api/instafix?projectName=test&limit=999");
      const res = await handler.GET(req);
      expect(res.status).toBe(400);
    });

    it("applies type and status filters", async () => {
      prisma.instafixFeedback.findMany.mockResolvedValue([]);
      prisma.instafixFeedback.count.mockResolvedValue(0);
      const req = new Request("http://localhost/api/instafix?projectName=test&type=bug&status=open");
      await handler.GET(req);
      const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as { where: Record<string, unknown> };
      expect(callArgs.where.type).toBe("bug");
      expect(callArgs.where.status).toBe("open");
    });

    it.each(["in_progress", "wont_fix"] as const)("applies the %s status filter", async (status) => {
      prisma.instafixFeedback.findMany.mockResolvedValue([]);
      prisma.instafixFeedback.count.mockResolvedValue(0);
      const req = new Request(`http://localhost/api/instafix?projectName=test&status=${status}`);
      const res = await handler.GET(req);
      expect(res.status).toBe(200);
      const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as { where: Record<string, unknown> };
      expect(callArgs.where.status).toBe(status);
    });

    it("applies a statuses bucket as where.status.in", async () => {
      prisma.instafixFeedback.findMany.mockResolvedValue([]);
      prisma.instafixFeedback.count.mockResolvedValue(0);
      const req = new Request("http://localhost/api/instafix?projectName=test&statuses=open,in_progress");
      const res = await handler.GET(req);
      expect(res.status).toBe(200);
      const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as { where: Record<string, unknown> };
      expect(callArgs.where.status).toEqual({ in: ["open", "in_progress"] });
    });

    it("prefers the statuses bucket over an exact status when both are present", async () => {
      prisma.instafixFeedback.findMany.mockResolvedValue([]);
      prisma.instafixFeedback.count.mockResolvedValue(0);
      const req = new Request("http://localhost/api/instafix?projectName=test&status=open&statuses=resolved,wont_fix");
      const res = await handler.GET(req);
      expect(res.status).toBe(200);
      const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as { where: Record<string, unknown> };
      expect(callArgs.where.status).toEqual({ in: ["resolved", "wont_fix"] });
    });

    it("rejects a statuses bucket with an unknown value", async () => {
      const req = new Request("http://localhost/api/instafix?projectName=test&statuses=open,bogus");
      const res = await handler.GET(req);
      expect(res.status).toBe(400);
    });

    describe("?search filter — case-insensitive mode", () => {
      it("falls back to omitting mode when the active provider can't be detected", async () => {
        // The default mockPrisma() exposes none of the internal probe paths,
        // so detectActiveProvider returns null. The safe default is to omit
        // `mode` — `contains` works on every provider; `mode: "insensitive"`
        // would throw on MySQL/SQLite/SQL Server.
        prisma.instafixFeedback.findMany.mockResolvedValue([]);
        prisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await handler.GET(req);
        const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello" });
        expect(callArgs.where.message).not.toHaveProperty("mode");
      });

      it("omits mode when caseInsensitiveSearch:false is passed explicitly", async () => {
        const sqliteHandler = createInstaFixHandler({ prisma, caseInsensitiveSearch: false });
        prisma.instafixFeedback.findMany.mockResolvedValue([]);
        prisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await sqliteHandler.GET(req);
        const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello" });
        expect(callArgs.where.message).not.toHaveProperty("mode");
      });

      it("auto-detects sqlite via _activeProvider and omits mode", async () => {
        const sqlitePrisma = Object.assign(mockPrisma(), { _activeProvider: "sqlite" });
        const sqliteHandler = createInstaFixHandler({ prisma: sqlitePrisma });
        sqlitePrisma.instafixFeedback.findMany.mockResolvedValue([]);
        sqlitePrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await sqliteHandler.GET(req);
        const callArgs = sqlitePrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello" });
      });

      it("auto-detects postgresql via _activeProvider and keeps mode", async () => {
        const pgPrisma = Object.assign(mockPrisma(), { _activeProvider: "postgresql" });
        const pgHandler = createInstaFixHandler({ prisma: pgPrisma });
        pgPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        pgPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await pgHandler.GET(req);
        const callArgs = pgPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello", mode: "insensitive" });
      });

      it("explicit caseInsensitiveSearch:true overrides sqlite auto-detect", async () => {
        const sqlitePrisma = Object.assign(mockPrisma(), { _activeProvider: "sqlite" });
        const overriddenHandler = createInstaFixHandler({
          prisma: sqlitePrisma,
          caseInsensitiveSearch: true,
        });
        sqlitePrisma.instafixFeedback.findMany.mockResolvedValue([]);
        sqlitePrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await overriddenHandler.GET(req);
        const callArgs = sqlitePrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello", mode: "insensitive" });
      });

      it("does not touch where.message when search is absent", async () => {
        const sqliteHandler = createInstaFixHandler({ prisma, caseInsensitiveSearch: false });
        prisma.instafixFeedback.findMany.mockResolvedValue([]);
        prisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test");
        await sqliteHandler.GET(req);
        const callArgs = prisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: Record<string, unknown>;
        };
        expect(callArgs.where).not.toHaveProperty("message");
      });

      it("auto-detects mysql via _activeProvider and omits mode", async () => {
        // MySQL's generated Prisma client does not expose `mode?:` on string
        // filters — passing it raises `Unknown argument 'mode'` at runtime.
        const mysqlPrisma = Object.assign(mockPrisma(), { _activeProvider: "mysql" });
        const mysqlHandler = createInstaFixHandler({ prisma: mysqlPrisma });
        mysqlPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        mysqlPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await mysqlHandler.GET(req);
        const callArgs = mysqlPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).not.toHaveProperty("mode");
      });

      it("auto-detects mongodb via _activeProvider and keeps mode", async () => {
        // MongoDB's generated Prisma client exposes `mode?: QueryMode` (Prisma
        // compiles it to a case-insensitive $regex under the hood).
        const mongoPrisma = Object.assign(mockPrisma(), { _activeProvider: "mongodb" });
        const mongoHandler = createInstaFixHandler({ prisma: mongoPrisma });
        mongoPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        mongoPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await mongoHandler.GET(req);
        const callArgs = mongoPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello", mode: "insensitive" });
      });

      it("auto-detects cockroachdb via _activeProvider and keeps mode", async () => {
        const cockroachPrisma = Object.assign(mockPrisma(), { _activeProvider: "cockroachdb" });
        const cockroachHandler = createInstaFixHandler({ prisma: cockroachPrisma });
        cockroachPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        cockroachPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await cockroachHandler.GET(req);
        const callArgs = cockroachPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello", mode: "insensitive" });
      });

      it("auto-detects sqlserver via _activeProvider and omits mode", async () => {
        const mssqlPrisma = Object.assign(mockPrisma(), { _activeProvider: "sqlserver" });
        const mssqlHandler = createInstaFixHandler({ prisma: mssqlPrisma });
        mssqlPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        mssqlPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await mssqlHandler.GET(req);
        const callArgs = mssqlPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).not.toHaveProperty("mode");
      });

      it("reads provider from _engineConfig.activeProvider when _activeProvider is missing", async () => {
        const altPrisma = Object.assign(mockPrisma(), { _engineConfig: { activeProvider: "postgresql" } });
        const altHandler = createInstaFixHandler({ prisma: altPrisma });
        altPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        altPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await altHandler.GET(req);
        const callArgs = altPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        expect(callArgs.where.message).toEqual({ contains: "hello", mode: "insensitive" });
      });

      it("survives a prisma client whose provider probe throws", async () => {
        // Some test doubles use Proxies whose get-traps throw — the constructor
        // must still build a working store rather than crash.
        const throwingPrisma = new Proxy(mockPrisma(), {
          get(target, prop, receiver) {
            if (prop === "_activeProvider" || prop === "_engineConfig" || prop === "_engine") {
              throw new Error("probe denied");
            }
            return Reflect.get(target, prop, receiver);
          },
        }) as unknown as ReturnType<typeof mockPrisma>;
        const throwingHandler = createInstaFixHandler({ prisma: throwingPrisma });
        throwingPrisma.instafixFeedback.findMany.mockResolvedValue([]);
        throwingPrisma.instafixFeedback.count.mockResolvedValue(0);
        const req = new Request("http://localhost/api/instafix?projectName=test&search=hello");
        await throwingHandler.GET(req);
        const callArgs = throwingPrisma.instafixFeedback.findMany.mock.calls[0]?.[0] as {
          where: { message?: { contains: string; mode?: string } };
        };
        // Probe threw → fallback → no mode (safe default).
        expect(callArgs.where.message).not.toHaveProperty("mode");
      });
    });
  });

  describe("PATCH", () => {
    it("resolves a feedback", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "resolved",
        resolvedAt: new Date().toISOString(),
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "resolved" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(200);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(updateArgs.data.status).toBe("resolved");
      expect(updateArgs.data.resolvedAt).toBeInstanceOf(Date);
    });

    it("edits the message in place when provided (G7)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "open",
        resolvedAt: null,
        message: "edited note",
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "open", message: "edited note" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(200);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(updateArgs.data.message).toBe("edited note");
    });

    it("omits the message key entirely when not provided (no phantom overwrite)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "open",
        resolvedAt: null,
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "open" }),
      });
      await handler.PATCH(req);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect("message" in updateArgs.data).toBe(false);
    });

    it("replaces the annotation set via nested deleteMany+create when provided (G7 reconnect)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "open",
        resolvedAt: null,
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({
          id: "fb-1",
          projectName: "test-project",
          status: "open",
          annotations: [
            {
              anchor: {
                cssSelector: "button.reconnected",
                xpath: "/html/body/button",
                textSnippet: "Save",
                elementTag: "BUTTON",
                textPrefix: "",
                textSuffix: "",
                fingerprint: "0:0:0",
                neighborText: "",
              },
              rect: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
              scrollX: 0,
              scrollY: 0,
              viewportW: 1920,
              viewportH: 1080,
              devicePixelRatio: 1,
            },
          ],
        }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(200);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as {
        data: { annotations?: { deleteMany: unknown; create: Array<{ cssSelector: string }> } };
      };
      expect(updateArgs.data.annotations?.deleteMany).toEqual({});
      expect(updateArgs.data.annotations?.create).toHaveLength(1);
      expect(updateArgs.data.annotations?.create[0]?.cssSelector).toBe("button.reconnected");
    });

    it("omits the annotations key entirely when not provided (existing targets untouched)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "open",
        resolvedAt: null,
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "open" }),
      });
      await handler.PATCH(req);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect("annotations" in updateArgs.data).toBe(false);
    });

    it("unresolves a feedback (clears resolvedAt)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status: "open",
        resolvedAt: null,
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "open" }),
      });
      await handler.PATCH(req);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(updateArgs.data.resolvedAt).toBeNull();
    });

    // resolvedAt is the CLOSURE timestamp — derived at the handler edge from
    // the status: set for terminal statuses (resolved, wont_fix), null for
    // active ones (open, in_progress).
    it.each([
      ["open", null],
      ["in_progress", null],
      ["resolved", "date"],
      ["wont_fix", "date"],
    ] as const)("PATCH to %s derives resolvedAt = %s", async (status, expected) => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue({
        id: "fb-1",
        projectName: "test-project",
        status,
        resolvedAt: expected === "date" ? new Date().toISOString() : null,
        annotations: [],
      });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(200);
      const updateArgs = prisma.instafixFeedback.update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(updateArgs.data.status).toBe(status);
      if (expected === "date") {
        expect(updateArgs.data.resolvedAt).toBeInstanceOf(Date);
      } else {
        expect(updateArgs.data.resolvedAt).toBeNull();
      }
    });

    it("returns 404 when feedback belongs to a different project", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "other-project" });
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "resolved" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(404);
      expect(prisma.instafixFeedback.update).not.toHaveBeenCalled();
    });

    it("returns 404 when feedback does not exist", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue(null);
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "nonexistent", projectName: "test-project", status: "resolved" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(404);
      expect(prisma.instafixFeedback.update).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid status", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "pending" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE", () => {
    it("deletes a single feedback by id", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project" }),
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(200);
      expect(prisma.instafixFeedback.delete).toHaveBeenCalledWith({ where: { id: "fb-1" } });
    });

    it("deletes all feedbacks for a project", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: JSON.stringify({ projectName: "test", deleteAll: true }),
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(200);
      expect(prisma.instafixFeedback.deleteMany).toHaveBeenCalledWith({ where: { projectName: "test" } });
    });

    it("returns 400 for invalid JSON", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: "not json",
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for empty body", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: JSON.stringify({}),
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(400);
    });

    it("returns 404 when feedback not found (P2025)", async () => {
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "nonexistent", projectName: "test-project" });
      prisma.instafixFeedback.delete.mockRejectedValue({ code: "P2025" });
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: JSON.stringify({ id: "nonexistent", projectName: "test-project" }),
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(404);
    });

    it("returns 500 on unexpected DB error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.delete.mockRejectedValue(new Error("DB down"));
      const req = new Request("http://localhost/api/instafix", {
        method: "DELETE",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project" }),
      });
      const res = await handler.DELETE(req);
      expect(res.status).toBe(500);
      consoleSpy.mockRestore();
    });
  });

  // clientId is a browser-local dedup secret and authorEmail is PII — the
  // handler strips/redacts them at the HTTP edge (#105); stores stay raw.
  describe("response redaction", () => {
    function feedbackRow(overrides: Record<string, unknown> = {}) {
      return {
        id: "fb-1",
        ...validPayloadNoAnnotations,
        status: "open",
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        annotations: [],
        ...overrides,
      };
    }

    it("GET without apiKey blanks authorEmail and strips clientId on every feedback", async () => {
      prisma.instafixFeedback.findMany.mockResolvedValue([
        feedbackRow(),
        feedbackRow({ id: "fb-2", clientId: "uuid-456", authorEmail: "bob@example.com" }),
      ]);
      prisma.instafixFeedback.count.mockResolvedValue(2);
      const res = await handler.GET(new Request("http://localhost/api/instafix?projectName=test-project"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.feedbacks).toHaveLength(2);
      for (const row of body.feedbacks) {
        expect(row.authorEmail).toBe("");
        expect("clientId" in row).toBe(false);
      }
    });

    it("POST 201 strips clientId but keeps the submitter's own authorEmail", async () => {
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect("clientId" in body).toBe(false);
      expect(body.authorEmail).toBe("alice@example.com");
    });

    it("POST dedup response strips clientId (no record-theft oracle) and keeps authorEmail", async () => {
      prisma.instafixFeedback.create.mockRejectedValue({ code: "P2002" });
      prisma.instafixFeedback.findUnique.mockResolvedValue(feedbackRow());
      const req = new Request("http://localhost/api/instafix", {
        method: "POST",
        body: JSON.stringify(validPayloadNoAnnotations),
      });
      const res = await handler.POST(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect("clientId" in body).toBe(false);
      expect(body.authorEmail).toBe("alice@example.com");
    });

    it("unauthenticated PATCH blanks authorEmail and strips clientId", async () => {
      // handler has requireAuthForDestructive: false and no apiKey → PATCH is reachable unauthenticated
      prisma.instafixFeedback.findUnique.mockResolvedValue({ id: "fb-1", projectName: "test-project" });
      prisma.instafixFeedback.update.mockResolvedValue(feedbackRow({ status: "resolved" }));
      const req = new Request("http://localhost/api/instafix", {
        method: "PATCH",
        body: JSON.stringify({ id: "fb-1", projectName: "test-project", status: "resolved" }),
      });
      const res = await handler.PATCH(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.authorEmail).toBe("");
      expect("clientId" in body).toBe(false);
    });
  });
});
