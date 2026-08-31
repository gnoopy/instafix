/**
 * Shared conformance test suite for `InstaFixStore` implementations.
 *
 * Adapters import this and run it with their store factory to verify they
 * satisfy the full store contract — no need to write the same 40+ tests
 * from scratch.
 *
 * @example
 * ```ts
 * import { testInstaFixStore } from './instafix-core-testing.cjs'
 * import { DrizzleStore } from '../src/index.js'
 *
 * testInstaFixStore(() => new DrizzleStore(db))
 * ```
 */
import type { InstaFixStore } from "./types.cjs";
/** Tuning knobs for backends whose documented contract legitimately varies. */
export interface StoreConformanceOptions {
    /**
     * How `createFeedback` reacts to a duplicate `clientId` — both are valid
     * per the `InstaFixStore` contract:
     * - `"return"` (default): idempotently return the existing record.
     * - `"throw"`: throw `StoreDuplicateError` (matched via `isStoreDuplicate`).
     */
    duplicateBehavior?: "return" | "throw" | undefined;
    /**
     * Whether `search` matches case-insensitively. Defaults to `true` (the
     * in-memory pipeline's behavior). Set to `false` for SQL backends whose
     * collation is case-sensitive — the suite then only asserts same-case
     * substring matching.
     */
    caseInsensitiveSearch?: boolean | undefined;
}
/**
 * Run the full `InstaFixStore` conformance test suite.
 *
 * @param factory — called before each test to create a fresh, empty store instance. May be async.
 * @param options — contract variations, see {@link StoreConformanceOptions}.
 */
export declare function testInstaFixStore(factory: () => InstaFixStore | Promise<InstaFixStore>, options?: StoreConformanceOptions): void;
