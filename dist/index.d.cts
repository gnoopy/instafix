import { InstaFixStore, ScreenshotStorage, FeedbackCreateInput, FeedbackRecord, FeedbackQuery, FeedbackPage, FeedbackUpdateInput } from './instafix-core.cjs';
export { StoreHandlerOptions as HandlerOptions, InstaFixHandler, InstaFixHttpMethod, InstaFixStore, ScreenshotStorage, StoreDuplicateError, StoreNotFoundError, StorePersistenceError, createStoreHandler as createInstaFixHandler, isStoreDuplicate, isStoreNotFound, isStorePersistence } from './instafix-core.cjs';

interface SqliteStoreOptions {
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
declare class SqliteStore implements InstaFixStore {
    private readonly db;
    private readonly screenshotStorage;
    private readonly caseInsensitiveSearch;
    private inlineFallbackWarned;
    private idCounter;
    constructor(options?: SqliteStoreOptions);
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
    private migrate;
    private generateId;
    private hydrate;
    private persistScreenshot;
    private insertAnnotation;
    createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord>;
    getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage>;
    findByClientId(clientId: string): Promise<FeedbackRecord | null>;
    updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord>;
    deleteFeedback(id: string): Promise<void>;
    deleteAllFeedbacks(projectName: string): Promise<void>;
    verifyProjectOwnership(id: string, projectName: string): Promise<boolean>;
    /** Close the underlying database connection. */
    close(): void;
}

export { SqliteStore, type SqliteStoreOptions };
