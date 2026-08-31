import { InstaFixStore, FeedbackCreateInput, FeedbackRecord, FeedbackQuery, FeedbackPage, FeedbackUpdateInput } from './instafix-core.cjs';
export { InstaFixStore, StoreDuplicateError, StoreNotFoundError, StorePersistenceError, isStorePersistence } from './instafix-core.cjs';

interface LocalStorageStoreOptions {
    /** localStorage key prefix — defaults to `'instafix_feedbacks'` */
    key?: string | undefined;
}
/**
 * Client-side `InstaFixStore` implementation backed by `localStorage`.
 *
 * Designed for demos, prototyping, and static sites that don't need a server.
 * Data persists across page reloads but is scoped to the current origin.
 *
 * All store semantics (clientId dedup, filtering, pagination, error
 * contract, screenshot-drop retry on quota) come from core's
 * `createCollectionStore` engine — this class only supplies the storage
 * primitives: JSON persistence with Date revival, quota-safe writes, an id
 * generator.
 *
 * Note: localStorage has its own ~5 MB hard cap; inline screenshots are OK
 * for prototyping but will hit the cap quickly. Production users should use
 * adapter-prisma with a configured `ScreenshotStorage`.
 *
 * @example
 * ```ts
 * import { initInstaFix } from '@instafix/widget'
 * import { LocalStorageStore } from '@instafix/adapter-localstorage'
 *
 * const store = new LocalStorageStore()
 *
 * initInstaFix({
 *   store,
 *   projectName: 'my-demo',
 * })
 * ```
 */
declare class LocalStorageStore implements InstaFixStore {
    private readonly key;
    private readonly engine;
    constructor(options?: LocalStorageStoreOptions);
    private load;
    /**
     * Persist the full feedback array, or throw `StorePersistenceError` (with
     * the underlying exception as `cause` — quota, storage disabled, …) when the
     * write fails. Centralized here so no mutating method can accidentally
     * report a phantom success on a lost write.
     */
    private persist;
    private generateId;
    createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord>;
    getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage>;
    findByClientId(clientId: string): Promise<FeedbackRecord | null>;
    updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord>;
    deleteFeedback(id: string): Promise<void>;
    deleteAllFeedbacks(projectName: string): Promise<void>;
    verifyProjectOwnership(id: string, projectName: string): Promise<boolean>;
    /** Remove all data from localStorage for this store key. */
    clear(): void;
}

export { LocalStorageStore, type LocalStorageStoreOptions };
