import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  createCollectionStore,
  createStoreHandler,
  type FeedbackCreateInput,
  type FeedbackPage,
  type FeedbackQuery,
  type FeedbackRecord,
  type FeedbackResponse,
  type FeedbackUpdateInput,
  formatFeedbacksForAgent,
  type InstaFixStore,
} from "@instafix/core";

export type { InstaFixStore } from "@instafix/core";
export { isStorePersistence, StoreDuplicateError, StoreNotFoundError, StorePersistenceError } from "@instafix/core";

/**
 * Same shape as core's `createStoreHandler`, plus the FS-only HANDOFF
 * extension: a widget POST of `{ "action": "handoff", "id": "<feedbackId>" }`
 * formats that feedback as an agent prompt and drops it into
 * `<dir>/outbox/<id>.md` — the file `npx @instafix/cli watch` (running as a
 * background task in the developer's Claude Code session) delivers into the
 * session. Every other request passes through to the core handler untouched,
 * so this stays a drop-in replacement. When the store isn't an `FsStore`
 * (no outbox to write), handoff requests get a 404 and nothing else changes.
 */
export function createInstaFixHandler(
  options: Parameters<typeof createStoreHandler>[0],
): ReturnType<typeof createStoreHandler> {
  const base = createStoreHandler(options);
  const store = options.store;
  return {
    ...base,
    POST: async (request: Request) => {
      try {
        const probe = await request.clone().json();
        if (probe && typeof probe === "object" && (probe as { action?: unknown }).action === "handoff") {
          const id = (probe as { id?: unknown }).id;
          if (typeof id !== "string" || !(store instanceof FsStore)) {
            return new Response(JSON.stringify({ error: "handoff not supported" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          const ok = await store.writeHandoff(id);
          return new Response(JSON.stringify(ok ? { ok: true } : { error: "feedback not found" }), {
            status: ok ? 200 : 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch {
        // Not JSON (or unreadable) — the core handler owns the error shape.
      }
      return base.POST(request);
    },
  };
}

export interface FsStoreOptions {
  /**
   * Directory feedback is stored under — a `history.jsonl` file (one record
   * per line) plus a `screenshots/` subfolder. Defaults to `.instafix` in
   * the current working directory, mirroring `.git`: created on first
   * write, meant to live at the project root.
   */
  dir?: string;
  /**
   * Absolute (or request-relative) URL prefix screenshots are served from —
   * whatever route your app mounts to read `screenshots/<file>` back over
   * HTTP for the widget's `<img src>`. Defaults to `/api/instafix/screenshots`.
   */
  screenshotUrlPrefix?: string;
  /**
   * `FsStore` writes to the local filesystem of whatever process constructs
   * it — the right place in development (same machine, same project folder
   * a coding agent already has open), the wrong place almost everywhere
   * else: most production hosts run each request in a fresh, ephemeral
   * container with no persistent disk (writes vanish silently), and even a
   * host with a real persistent disk puts `.instafix/` on a *server* the
   * developer's agent isn't running on, defeating the point of it being a
   * plain project folder. To catch a route accidentally deployed with this
   * adapter before it silently loses feedback, the constructor throws when
   * `NODE_ENV === "production"`. If you're certain you want it anyway (e.g.
   * a self-hosted single-instance server with a real persistent volume),
   * set this to `true`. For real production feedback collection, reach for
   * `@instafix/adapter-prisma` or `@instafix/adapter-sqlite` instead.
   */
  allowProduction?: boolean;
}

const DATA_URL_RE = /^data:image\/(\w+);base64,(.+)$/;
/** `clientId` is attacker-controlled input reused as a filename — keep it to a safe, boring charset. */
const SAFE_ID_RE = /^[A-Za-z0-9_-]+$/;

/**
 * `InstaFixStore` implementation backed by flat files instead of a database —
 * `<dir>/history.jsonl` (append-friendly, grep/jq-able) plus
 * `<dir>/screenshots/<id>.<ext>`.
 *
 * Built for the single-developer "local history" use case: no server to run,
 * no schema to migrate, and the whole history is plain text you can read,
 * diff, or commit. All store semantics (clientId dedup, filtering,
 * pagination, error contract) come from core's `createCollectionStore`
 * engine — this class only supplies the storage primitives plus screenshot
 * file handling (the one thing the engine doesn't do for any adapter).
 *
 * @example
 * ```ts
 * import { FsStore } from '@instafix/adapter-fs'
 *
 * const store = new FsStore() // writes to ./.instafix
 * // Pass to createInstaFixHandler({ store }) or initInstaFix({ store })
 * ```
 */
export class FsStore implements InstaFixStore {
  private readonly dir: string;
  private readonly screenshotsDir: string;
  private readonly screenshotUrlPrefix: string;

  private readonly engine = createCollectionStore({
    load: () => this.loadAll(),
    persist: (next) => this.persistAll(next),
    generateId: () => randomUUID(),
  });

  constructor(options: FsStoreOptions = {}) {
    if (process.env.NODE_ENV === "production" && !options.allowProduction) {
      throw new Error(
        "[instafix] FsStore refuses to run with NODE_ENV=production: most hosts give each request a " +
          "fresh, ephemeral filesystem, so writes to .instafix/ would silently vanish, and even a " +
          "persistent-disk host puts the folder on a server your coding agent isn't running on. Use " +
          "@instafix/adapter-prisma or @instafix/adapter-sqlite for real production feedback collection, " +
          "or pass `allowProduction: true` if you've verified this host has a persistent, single-instance " +
          "filesystem and you still want it.",
      );
    }
    this.dir = options.dir ?? join(process.cwd(), ".instafix");
    this.screenshotsDir = join(this.dir, "screenshots");
    this.screenshotUrlPrefix = options.screenshotUrlPrefix ?? "/api/instafix/screenshots";
  }

  private get historyPath(): string {
    return join(this.dir, "history.jsonl");
  }

  /** Revive the Date fields JSON.stringify flattened to ISO strings. */
  private static reviveRecord(raw: FeedbackRecord): FeedbackRecord {
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      resolvedAt: raw.resolvedAt ? new Date(raw.resolvedAt) : null,
      annotations: raw.annotations.map((ann) => ({ ...ann, createdAt: new Date(ann.createdAt) })),
    };
  }

  /**
   * Always reads fresh from disk rather than caching in memory — this file
   * is meant to be readable/editable outside the running process too (a
   * history viewer, `git diff`, a text editor), so a stale in-memory copy
   * would be a correctness bug, not just a performance tradeoff.
   */
  private async loadAll(): Promise<FeedbackRecord[]> {
    let text: string;
    try {
      text = await readFile(this.historyPath, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => FsStore.reviveRecord(JSON.parse(line) as FeedbackRecord));
  }

  private async persistAll(next: FeedbackRecord[]): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const body = next.map((record) => JSON.stringify(record)).join("\n");
    await writeFile(this.historyPath, body.length > 0 ? `${body}\n` : "", "utf8");
  }

  /**
   * Decode a captured screenshot data URL to a file under `screenshots/`,
   * named after the client-generated id (known before the server id is
   * assigned) so the write can happen before `createCollectionStore` runs.
   * Returns the URL to persist on the record, or `null` on decode failure —
   * matching `createCollectionStore`'s own graceful-degradation behavior
   * for a screenshot that can't be saved.
   */
  private async saveScreenshot(clientId: string, dataUrl: string): Promise<string | null> {
    const match = DATA_URL_RE.exec(dataUrl);
    if (!match) return null;
    const safeId = SAFE_ID_RE.test(clientId) ? clientId : randomUUID();
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `${safeId}.${ext}`;
    const filePath = join(this.screenshotsDir, filename);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from(match[2] as string, "base64"));
    return `${this.screenshotUrlPrefix}/${filename}`;
  }

  async createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord> {
    let input = data;
    if (data.screenshotDataUrl) {
      const url = await this.saveScreenshot(data.clientId, data.screenshotDataUrl);
      input = { ...data, screenshotDataUrl: url };
    }
    return this.engine.createFeedback(input);
  }

  getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage> {
    return this.engine.getFeedbacks(query);
  }

  findByClientId(clientId: string): Promise<FeedbackRecord | null> {
    return this.engine.findByClientId(clientId);
  }

  updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord> {
    return this.engine.updateFeedback(id, data);
  }

  deleteFeedback(id: string): Promise<void> {
    return this.engine.deleteFeedback(id);
  }

  deleteAllFeedbacks(projectName: string): Promise<void> {
    return this.engine.deleteAllFeedbacks(projectName);
  }

  /**
   * Write one feedback as an agent-ready prompt file into `<dir>/outbox/` —
   * the server half of the widget's "Agent에게" handoff button (see
   * `createInstaFixHandler` above). Returns false when the id is unknown.
   * `outbox/processed/` is where `instafix watch` moves files it delivered.
   */
  async writeHandoff(id: string): Promise<boolean> {
    const all = await this.loadAll();
    const record = all.find((r) => r.id === id);
    if (!record) return false;
    // Round-trip through JSON to get the serialized (wire) shape the
    // formatter expects — the same flattening persistAll applies.
    const serialized = JSON.parse(JSON.stringify(record)) as FeedbackResponse;
    const outboxDir = join(this.dir, "outbox");
    await mkdir(outboxDir, { recursive: true });
    const safeId = SAFE_ID_RE.test(id) ? id : randomUUID();
    await writeFile(join(outboxDir, `${safeId}.md`), formatFeedbacksForAgent([serialized]), "utf8");
    return true;
  }

  verifyProjectOwnership(id: string, projectName: string): Promise<boolean> {
    return this.engine.verifyProjectOwnership(id, projectName);
  }
}
