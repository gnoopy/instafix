/**
 * Record-construction helpers and the collection-store engine.
 *
 * Every snapshot-style adapter (memory, localStorage, flat file, KV, …)
 * needs the same three ingredients: turn a `FeedbackCreateInput` into a
 * `FeedbackRecord` (null-normalizing optional fields, stamping ids and
 * timestamps), filter/paginate with `applyFeedbackFilters`, and implement
 * the dedup/update/delete choreography of the `InstaFixStore` contract.
 *
 * `buildFeedbackRecord` / `buildAnnotationRecord` cover the first part for
 * any adapter. `createCollectionStore` covers all of it: give it `load`,
 * `persist`, and `generateId`, and it returns a fully conformant
 * `InstaFixStore` — writing a new snapshot adapter is ~20 lines plus its
 * storage specifics.
 */
import type { AnnotationCreateInput, AnnotationRecord, FeedbackCreateInput, FeedbackRecord, InstaFixStore } from "./types.cjs";
/**
 * Build a persisted `AnnotationRecord` from its create input — normalizes
 * the optional anchor fields to `null` and stamps identity/timestamp.
 */
export declare function buildAnnotationRecord(input: AnnotationCreateInput, ctx: {
    id: string;
    feedbackId: string;
    now: Date;
}): AnnotationRecord;
/**
 * Build a persisted `FeedbackRecord` (with its annotations) from a create
 * input — normalizes every optional field to `null` and stamps ids and
 * timestamps. Adapters without external screenshot storage keep the data
 * URL inline on `screenshotUrl`, which is what this helper does; adapters
 * with a `ScreenshotStorage` upload first and override `screenshotUrl`.
 */
export declare function buildFeedbackRecord(input: FeedbackCreateInput, ctx: {
    id: string;
    annotationId: () => string;
    now?: Date;
}): FeedbackRecord;
/**
 * Storage primitives behind a collection store. `load`/`persist` may be
 * sync or async — the engine awaits both, so in-memory arrays, localStorage
 * and async KV stores all fit the same three functions.
 */
export interface CollectionStoreBackend {
    /** Return the current full snapshot of feedback records. */
    load(): FeedbackRecord[] | Promise<FeedbackRecord[]>;
    /**
     * Persist the full snapshot. Throw `StorePersistenceError` when the write
     * is lost (quota, storage disabled, …) — never swallow the failure.
     */
    persist(feedbacks: FeedbackRecord[]): void | Promise<void>;
    /** Generate a unique id for a new feedback or annotation record. */
    generateId(): string;
}
/**
 * A `InstaFixStore` with the optional `verifyProjectOwnership` guaranteed —
 * what `createCollectionStore` returns.
 */
export type CollectionStore = InstaFixStore & Required<Pick<InstaFixStore, "verifyProjectOwnership">>;
/**
 * Build a fully conformant `InstaFixStore` on top of a snapshot backend.
 *
 * The engine implements the whole store contract: clientId dedup (idempotent
 * create), newest-first ordering, the standard filter/pagination pipeline,
 * `StoreNotFoundError` on missing update/delete, project-scoped bulk delete,
 * and `verifyProjectOwnership`. When `persist` fails during `createFeedback`
 * and the record carries an inline screenshot, the engine retries once
 * without the screenshot (by far the heaviest field) so the text feedback
 * survives a storage-quota hit; if that also fails, the error propagates —
 * returning the record would claim a success that was never persisted.
 *
 * @example
 * ```ts
 * export class MemoryStore implements InstaFixStore {
 *   private feedbacks: FeedbackRecord[] = [];
 *   private readonly store = createCollectionStore({
 *     load: () => this.feedbacks,
 *     persist: (next) => {
 *       this.feedbacks = next;
 *     },
 *     generateId: () => crypto.randomUUID(),
 *   });
 *   createFeedback = this.store.createFeedback;
 *   // …delegate the remaining methods the same way
 * }
 * ```
 */
export declare function createCollectionStore(backend: CollectionStoreBackend): CollectionStore;
