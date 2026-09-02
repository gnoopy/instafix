import { InstaFixStore, FeedbackCreateInput, FeedbackRecord, FeedbackQuery, FeedbackPage, FeedbackUpdateInput, createStoreHandler } from './instafix-core.js';
export { InstaFixStore, StoreDuplicateError, StoreNotFoundError, StorePersistenceError, isStorePersistence } from './instafix-core.js';

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
declare function createInstaFixHandler(options: Parameters<typeof createStoreHandler>[0]): ReturnType<typeof createStoreHandler>;
interface FsStoreOptions {
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
}
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
declare class FsStore implements InstaFixStore {
    private readonly dir;
    private readonly screenshotsDir;
    private readonly screenshotUrlPrefix;
    private readonly engine;
    constructor(options?: FsStoreOptions);
    private get historyPath();
    /** Revive the Date fields JSON.stringify flattened to ISO strings. */
    private static reviveRecord;
    /**
     * Always reads fresh from disk rather than caching in memory — this file
     * is meant to be readable/editable outside the running process too (a
     * history viewer, `git diff`, a text editor), so a stale in-memory copy
     * would be a correctness bug, not just a performance tradeoff.
     */
    private loadAll;
    private persistAll;
    /**
     * Decode a captured screenshot data URL to a file under `screenshots/`,
     * named after the client-generated id (known before the server id is
     * assigned) so the write can happen before `createCollectionStore` runs.
     * Returns the URL to persist on the record, or `null` on decode failure —
     * matching `createCollectionStore`'s own graceful-degradation behavior
     * for a screenshot that can't be saved.
     */
    private saveScreenshot;
    createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord>;
    getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage>;
    findByClientId(clientId: string): Promise<FeedbackRecord | null>;
    updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord>;
    deleteFeedback(id: string): Promise<void>;
    deleteAllFeedbacks(projectName: string): Promise<void>;
    /**
     * Write one feedback as an agent-ready prompt file into `<dir>/outbox/` —
     * the server half of the widget's "Agent에게" handoff button (see
     * `createInstaFixHandler` above). Returns false when the id is unknown.
     * `outbox/processed/` is where `instafix watch` moves files it delivered.
     */
    writeHandoff(id: string): Promise<boolean>;
    verifyProjectOwnership(id: string, projectName: string): Promise<boolean>;
}

export { FsStore, type FsStoreOptions, createInstaFixHandler };
