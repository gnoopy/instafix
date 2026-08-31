import { InstaFixStore, FeedbackCreateInput, FeedbackRecord, FeedbackQuery, FeedbackPage, FeedbackUpdateInput } from './instafix-core.cjs';
export { InstaFixStore, StoreDuplicateError, StoreNotFoundError, StorePersistenceError, isStorePersistence } from './instafix-core.cjs';

/**
 * In-memory `InstaFixStore` implementation.
 *
 * Zero dependencies, works in any JS environment (Node, Bun, Deno, browser,
 * Cloudflare Workers). Data lives in a plain array — lost on process restart.
 *
 * Use cases:
 * - **Testing** — fast, isolated store for unit/integration tests
 * - **Demos** — lightweight store that needs no database or localStorage
 * - **Reference** — simplest possible adapter for contributors to study
 *
 * All store semantics (clientId dedup, filtering, pagination, error
 * contract) come from core's `createCollectionStore` engine — this class
 * only supplies the storage primitives: an array, an id generator.
 *
 * @example
 * ```ts
 * import { MemoryStore } from '@instafix/adapter-memory'
 *
 * const store = new MemoryStore()
 * // Pass to createInstaFixHandler({ store }) or initInstaFix({ store })
 * ```
 */
declare class MemoryStore implements InstaFixStore {
    private feedbacks;
    private idCounter;
    private readonly engine;
    createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord>;
    getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage>;
    findByClientId(clientId: string): Promise<FeedbackRecord | null>;
    updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord>;
    deleteFeedback(id: string): Promise<void>;
    deleteAllFeedbacks(projectName: string): Promise<void>;
    verifyProjectOwnership(id: string, projectName: string): Promise<boolean>;
    /** Remove all data from this store instance. */
    clear(): void;
}

export { MemoryStore };
