import {
  type AnnotationInspect,
  type AnnotationRecord,
  type AnnotationTarget,
  buildAnnotationRecord,
  buildFeedbackRecord,
  type DiagnosticsSnapshot,
  type FeedbackCreateInput,
  type FeedbackPage,
  type FeedbackQuery,
  type FeedbackRecord,
  type FeedbackStatus,
  type FeedbackType,
  type FeedbackUpdateInput,
  hasOwn,
  type InstaFixStore,
  type ScreenshotRegion,
  type ScreenshotStorage,
  StoreDuplicateError,
  StoreNotFoundError,
  StorePersistenceError,
} from "@instafix/core";
import Database from "better-sqlite3";

export type { InstaFixStore, ScreenshotStorage } from "@instafix/core";
// The HTTP handler (auth, CORS, validation, webhooks, routing) lives in
// @instafix/core and has nothing to do with any particular store — every
// InstaFix adapter (Prisma, SQLite, memory, a third-party one) gets the same
// request handling. Re-exported under this package's own name (rather than
// `HandlerOptions`/`createStoreHandler`) so this stays a drop-in match for
// every other adapter's `createInstaFixHandler({ ... })` shape.
export {
  createStoreHandler as createInstaFixHandler,
  type InstaFixHandler,
  type InstaFixHttpMethod,
  isStoreDuplicate,
  isStoreNotFound,
  isStorePersistence,
  StoreDuplicateError,
  type StoreHandlerOptions as HandlerOptions,
  StoreNotFoundError,
  StorePersistenceError,
} from "@instafix/core";

// ---------------------------------------------------------------------------
// Schema bootstrap
// ---------------------------------------------------------------------------

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS instafix_feedback (
  id TEXT PRIMARY KEY,
  projectName TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  url TEXT NOT NULL,
  urlPattern TEXT,
  screenshotUrl TEXT,
  screenshotRegion TEXT,
  diagnostics TEXT,
  viewport TEXT NOT NULL,
  userAgent TEXT NOT NULL,
  authorName TEXT NOT NULL,
  authorEmail TEXT NOT NULL,
  clientId TEXT NOT NULL UNIQUE,
  resolvedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project ON instafix_feedback(projectName);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project_status_created ON instafix_feedback(projectName, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project_url ON instafix_feedback(projectName, url);

CREATE TABLE IF NOT EXISTS instafix_annotation (
  id TEXT PRIMARY KEY,
  feedbackId TEXT NOT NULL REFERENCES instafix_feedback(id) ON DELETE CASCADE,
  cssSelector TEXT NOT NULL,
  xpath TEXT NOT NULL,
  textSnippet TEXT NOT NULL,
  elementTag TEXT NOT NULL,
  elementId TEXT,
  textPrefix TEXT NOT NULL,
  textSuffix TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  neighborText TEXT NOT NULL,
  anchorKey TEXT,
  xPct REAL NOT NULL,
  yPct REAL NOT NULL,
  wPct REAL NOT NULL,
  hPct REAL NOT NULL,
  scrollX REAL NOT NULL,
  scrollY REAL NOT NULL,
  viewportW INTEGER NOT NULL,
  viewportH INTEGER NOT NULL,
  devicePixelRatio REAL NOT NULL,
  createdAt TEXT NOT NULL,
  target TEXT,
  inspect TEXT
);
CREATE INDEX IF NOT EXISTS idx_instafix_annotation_feedback ON instafix_annotation(feedbackId);
`;

// ---------------------------------------------------------------------------
// Row shapes — the raw column types better-sqlite3 hands back
// ---------------------------------------------------------------------------

interface FeedbackRow {
  id: string;
  projectName: string;
  type: string;
  message: string;
  status: string;
  url: string;
  urlPattern: string | null;
  screenshotUrl: string | null;
  screenshotRegion: string | null;
  diagnostics: string | null;
  viewport: string;
  userAgent: string;
  authorName: string;
  authorEmail: string;
  clientId: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnotationRow {
  id: string;
  feedbackId: string;
  cssSelector: string;
  xpath: string;
  textSnippet: string;
  elementTag: string;
  elementId: string | null;
  textPrefix: string;
  textSuffix: string;
  fingerprint: string;
  neighborText: string;
  anchorKey: string | null;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  scrollX: number;
  scrollY: number;
  viewportW: number;
  viewportH: number;
  devicePixelRatio: number;
  createdAt: string;
  target: string | null;
  inspect: string | null;
}

function rowToAnnotation(row: AnnotationRow): AnnotationRecord {
  return {
    id: row.id,
    feedbackId: row.feedbackId,
    cssSelector: row.cssSelector,
    xpath: row.xpath,
    textSnippet: row.textSnippet,
    elementTag: row.elementTag,
    elementId: row.elementId,
    textPrefix: row.textPrefix,
    textSuffix: row.textSuffix,
    fingerprint: row.fingerprint,
    neighborText: row.neighborText,
    anchorKey: row.anchorKey,
    xPct: row.xPct,
    yPct: row.yPct,
    wPct: row.wPct,
    hPct: row.hPct,
    scrollX: row.scrollX,
    scrollY: row.scrollY,
    viewportW: row.viewportW,
    viewportH: row.viewportH,
    devicePixelRatio: row.devicePixelRatio,
    createdAt: new Date(row.createdAt),
    target: row.target ? (JSON.parse(row.target) as AnnotationTarget) : null,
    inspect: row.inspect ? (JSON.parse(row.inspect) as AnnotationInspect) : null,
  };
}

function rowToFeedback(row: FeedbackRow, annotations: AnnotationRecord[]): FeedbackRecord {
  return {
    id: row.id,
    type: row.type as FeedbackType,
    message: row.message,
    status: row.status as FeedbackStatus,
    projectName: row.projectName,
    url: row.url,
    urlPattern: row.urlPattern,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
    viewport: row.viewport,
    userAgent: row.userAgent,
    clientId: row.clientId,
    resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    annotations,
    screenshotUrl: row.screenshotUrl,
    screenshotRegion: row.screenshotRegion ? (JSON.parse(row.screenshotRegion) as ScreenshotRegion) : null,
    diagnostics: row.diagnostics ? (JSON.parse(row.diagnostics) as DiagnosticsSnapshot) : null,
  };
}

/** Escape SQLite `LIKE`/`GLOB` wildcards in user-supplied search text. */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function escapeGlobPattern(value: string): string {
  return value.replace(/[[\]*?]/g, (ch) => `[${ch}]`);
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return hasOwn(error, "code") && error.code === "SQLITE_CONSTRAINT_UNIQUE";
}

// ---------------------------------------------------------------------------
// SqliteStore
// ---------------------------------------------------------------------------

export interface SqliteStoreOptions {
  /**
   * Path to the SQLite database file. Created (along with its tables) on
   * first use if it doesn't exist yet — there is no separate migration
   * step to run.
   *
   * Defaults to `"./instafix.db"`.
   */
  path?: string;
  /**
   * Optional storage backend for screenshots. Without it, the data URL is
   * persisted inline (as TEXT) with a one-time warn — see `PrismaStore`'s
   * option of the same name for the full rationale.
   */
  screenshotStorage?: ScreenshotStorage | undefined;
  /**
   * Whether `?search=` matches case-insensitively.
   *
   * SQLite's `LIKE` is already case-insensitive for ASCII by default (not
   * for non-ASCII letters — there is no ICU extension loaded), so `true`
   * (the default) costs nothing extra. `false` switches to `GLOB`, which is
   * always case-sensitive.
   */
  caseInsensitiveSearch?: boolean;
}

/**
 * SQLite-backed implementation of `InstaFixStore`, via `better-sqlite3`.
 *
 * Zero external services: no ORM, no database server, no migration command
 * to run — the two tables are created (if missing) the first time a store
 * is constructed against a given file. This makes it the lowest-friction
 * durable backend for projects that don't already have Prisma (or any other
 * ORM) set up.
 *
 * @example Next.js App Router — `app/api/instafix/route.ts`
 * ```ts
 * import { createInstaFixHandler, SqliteStore } from '@instafix/adapter-sqlite'
 *
 * const store = new SqliteStore({ path: './instafix.db' })
 * export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({ store })
 * ```
 */
export class SqliteStore implements InstaFixStore {
  private readonly db: Database.Database;
  private readonly screenshotStorage: ScreenshotStorage | undefined;
  private readonly caseInsensitiveSearch: boolean;
  private inlineFallbackWarned = false;
  private idCounter = 0;

  constructor(options: SqliteStoreOptions = {}) {
    this.db = new Database(options.path ?? "./instafix.db");
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(SCHEMA_SQL);
    this.migrate();
    this.screenshotStorage = options.screenshotStorage;
    this.caseInsensitiveSearch = options.caseInsensitiveSearch ?? true;
  }

  /**
   * Additive column migrations for databases created by an older version.
   *
   * `CREATE TABLE IF NOT EXISTS` leaves an existing table exactly as it was,
   * so a column added to SCHEMA_SQL never reaches a database that already
   * exists — reads would be fine, but the INSERT naming the new column would
   * fail with "no such column". There is no migration command by design (see
   * the class doc), so the check runs on every construction: read the table's
   * actual columns and add whatever is missing. Adding a nullable column is
   * instant and lossless in SQLite regardless of table size.
   */
  private migrate(): void {
    const columns = new Set(
      this.db
        .prepare("PRAGMA table_info(instafix_annotation)")
        .all()
        .map((row) => (row as { name: string }).name),
    );
    if (!columns.has("inspect")) {
      this.db.exec("ALTER TABLE instafix_annotation ADD COLUMN inspect TEXT");
    }
  }

  private generateId(): string {
    this.idCounter += 1;
    return `sqlite-${Date.now().toString(36)}-${this.idCounter}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private hydrate(row: FeedbackRow): FeedbackRecord {
    const annotationRows = this.db
      // All annotations of one feedback share the same `createdAt` (stamped
      // once per createFeedback/updateFeedback call) — rowid preserves the
      // array order they were submitted in.
      .prepare("SELECT * FROM instafix_annotation WHERE feedbackId = ? ORDER BY createdAt ASC, rowid ASC")
      .all(row.id) as AnnotationRow[];
    return rowToFeedback(row, annotationRows.map(rowToAnnotation));
  }

  private async persistScreenshot(dataUrl: string | null | undefined, clientId: string): Promise<string | null> {
    if (!dataUrl) return null;

    if (this.screenshotStorage) {
      try {
        const { url } = await this.screenshotStorage.upload(dataUrl, {
          feedbackId: clientId,
          mimeType: "image/jpeg",
        });
        return url;
      } catch (err) {
        console.warn(
          "[instafix] screenshotStorage.upload failed — feedback will be saved without a screenshot. Wrap your storage's upload to handle this differently:",
          err,
        );
        return null;
      }
    }

    if (!this.inlineFallbackWarned) {
      this.inlineFallbackWarned = true;
      console.warn(
        "[instafix] enableScreenshot is on but no `screenshotStorage` is configured — base64 data URLs will be persisted inline in SQLite. Configure a ScreenshotStorage (S3/R2/…) for production.",
      );
    }
    return dataUrl;
  }

  private insertAnnotation(annotation: AnnotationRecord): void {
    this.db
      .prepare(
        `INSERT INTO instafix_annotation
          (id, feedbackId, cssSelector, xpath, textSnippet, elementTag, elementId, textPrefix, textSuffix,
           fingerprint, neighborText, anchorKey, xPct, yPct, wPct, hPct, scrollX, scrollY, viewportW,
           viewportH, devicePixelRatio, createdAt, target, inspect)
         VALUES
          (@id, @feedbackId, @cssSelector, @xpath, @textSnippet, @elementTag, @elementId, @textPrefix, @textSuffix,
           @fingerprint, @neighborText, @anchorKey, @xPct, @yPct, @wPct, @hPct, @scrollX, @scrollY, @viewportW,
           @viewportH, @devicePixelRatio, @createdAt, @target, @inspect)`,
      )
      .run({
        ...annotation,
        createdAt: annotation.createdAt.toISOString(),
        target: annotation.target ? JSON.stringify(annotation.target) : null,
        inspect: annotation.inspect ? JSON.stringify(annotation.inspect) : null,
      });
  }

  async createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord> {
    const screenshotUrl = await this.persistScreenshot(data.screenshotDataUrl, data.clientId);
    const record = buildFeedbackRecord(data, { id: this.generateId(), annotationId: () => this.generateId() });
    record.screenshotUrl = screenshotUrl;

    const insert = this.db.transaction((rec: FeedbackRecord) => {
      this.db
        .prepare(
          `INSERT INTO instafix_feedback
            (id, projectName, type, message, status, url, urlPattern, screenshotUrl, screenshotRegion,
             diagnostics, viewport, userAgent, authorName, authorEmail, clientId, resolvedAt, createdAt, updatedAt)
           VALUES
            (@id, @projectName, @type, @message, @status, @url, @urlPattern, @screenshotUrl, @screenshotRegion,
             @diagnostics, @viewport, @userAgent, @authorName, @authorEmail, @clientId, @resolvedAt, @createdAt, @updatedAt)`,
        )
        .run({
          id: rec.id,
          projectName: rec.projectName,
          type: rec.type,
          message: rec.message,
          status: rec.status,
          url: rec.url,
          urlPattern: rec.urlPattern,
          screenshotUrl: rec.screenshotUrl,
          screenshotRegion: rec.screenshotRegion ? JSON.stringify(rec.screenshotRegion) : null,
          diagnostics: rec.diagnostics ? JSON.stringify(rec.diagnostics) : null,
          viewport: rec.viewport,
          userAgent: rec.userAgent,
          authorName: rec.authorName,
          authorEmail: rec.authorEmail,
          clientId: rec.clientId,
          resolvedAt: rec.resolvedAt ? rec.resolvedAt.toISOString() : null,
          createdAt: rec.createdAt.toISOString(),
          updatedAt: rec.updatedAt.toISOString(),
        });

      for (const annotation of rec.annotations) {
        this.insertAnnotation(annotation);
      }
    });

    try {
      insert(record);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new StoreDuplicateError();
      }
      throw new StorePersistenceError("Failed to persist feedback", { cause: error });
    }

    return record;
  }

  async getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage> {
    const { projectName, type, status, statuses, search, url, urlPattern } = query;
    // Same clamp as the in-memory pipeline (core's applyFeedbackFilters):
    // page floors at 1, limit is bounded to [1, 100] regardless of what the
    // caller asked for.
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(query.limit ?? 50, 100));

    const clauses = ["projectName = @projectName"];
    const params: Record<string, unknown> = { projectName };

    if (type) {
      clauses.push("type = @type");
      params.type = type;
    }
    if (statuses && statuses.length > 0) {
      const placeholders = statuses.map((_, i) => `@status${i}`).join(", ");
      clauses.push(`status IN (${placeholders})`);
      statuses.forEach((s, i) => {
        params[`status${i}`] = s;
      });
    } else if (status) {
      clauses.push("status = @status");
      params.status = status;
    }
    if (url) {
      clauses.push("url = @url");
      params.url = url;
    }
    if (urlPattern) {
      clauses.push("urlPattern = @urlPattern");
      params.urlPattern = urlPattern;
    }
    if (search) {
      if (this.caseInsensitiveSearch) {
        clauses.push("message LIKE @search ESCAPE '\\'");
        params.search = `%${escapeLikePattern(search)}%`;
      } else {
        clauses.push("message GLOB @search");
        params.search = `*${escapeGlobPattern(search)}*`;
      }
    }

    const where = clauses.join(" AND ");
    const total = (
      this.db.prepare(`SELECT COUNT(*) as count FROM instafix_feedback WHERE ${where}`).get(params) as {
        count: number;
      }
    ).count;

    const rows = this.db
      // `createdAt` only has millisecond resolution — under load, two feedbacks
      // can land in the same millisecond, so break ties with the implicit
      // rowid (monotonically increasing with insertion order) for a stable sort.
      .prepare(
        `SELECT * FROM instafix_feedback WHERE ${where} ORDER BY createdAt DESC, rowid DESC LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit, offset: (page - 1) * limit }) as FeedbackRow[];

    return { feedbacks: rows.map((row) => this.hydrate(row)), total };
  }

  async findByClientId(clientId: string): Promise<FeedbackRecord | null> {
    const row = this.db.prepare("SELECT * FROM instafix_feedback WHERE clientId = ?").get(clientId) as
      | FeedbackRow
      | undefined;
    return row ? this.hydrate(row) : null;
  }

  async updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord> {
    const now = new Date();

    const update = this.db.transaction(() => {
      const sets = ["status = @status", "resolvedAt = @resolvedAt", "updatedAt = @updatedAt"];
      const params: Record<string, unknown> = {
        id,
        status: data.status,
        resolvedAt: data.resolvedAt ? data.resolvedAt.toISOString() : null,
        updatedAt: now.toISOString(),
      };
      if (data.message !== undefined) {
        sets.push("message = @message");
        params.message = data.message;
      }

      const result = this.db.prepare(`UPDATE instafix_feedback SET ${sets.join(", ")} WHERE id = @id`).run(params);
      if (result.changes === 0) {
        throw new StoreNotFoundError(`Feedback ${id} not found`);
      }

      // Reconnect (G7): replace the whole annotation set, mirroring
      // PrismaStore's deleteMany + create inside the same transaction.
      if (data.annotations !== undefined) {
        this.db.prepare("DELETE FROM instafix_annotation WHERE feedbackId = ?").run(id);
        for (const input of data.annotations) {
          this.insertAnnotation(buildAnnotationRecord(input, { id: this.generateId(), feedbackId: id, now }));
        }
      }
    });

    try {
      update();
    } catch (error) {
      if (error instanceof StoreNotFoundError) throw error;
      throw new StorePersistenceError("Failed to update feedback", { cause: error });
    }

    const row = this.db.prepare("SELECT * FROM instafix_feedback WHERE id = ?").get(id) as FeedbackRow | undefined;
    if (!row) throw new StoreNotFoundError(`Feedback ${id} not found`);
    return this.hydrate(row);
  }

  async deleteFeedback(id: string): Promise<void> {
    let result: Database.RunResult;
    try {
      // ON DELETE CASCADE (foreign_keys = ON) drops the annotations too.
      result = this.db.prepare("DELETE FROM instafix_feedback WHERE id = ?").run(id);
    } catch (error) {
      throw new StorePersistenceError("Failed to delete feedback", { cause: error });
    }
    if (result.changes === 0) {
      throw new StoreNotFoundError(`Feedback ${id} not found`);
    }
  }

  async deleteAllFeedbacks(projectName: string): Promise<void> {
    try {
      this.db.prepare("DELETE FROM instafix_feedback WHERE projectName = ?").run(projectName);
    } catch (error) {
      throw new StorePersistenceError("Failed to delete feedbacks", { cause: error });
    }
  }

  async verifyProjectOwnership(id: string, projectName: string): Promise<boolean> {
    const row = this.db.prepare("SELECT projectName FROM instafix_feedback WHERE id = ?").get(id) as
      | { projectName: string }
      | undefined;
    return row !== undefined && row.projectName === projectName;
  }

  /** Close the underlying database connection. */
  close(): void {
    this.db.close();
  }
}
