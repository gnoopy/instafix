/**
 * Shared feedback-record filtering and pagination — extracted from
 * `adapter-memory` and `adapter-localstorage` which previously kept two
 * near-identical copies of the same logic. Any adapter that holds an
 * in-memory snapshot of feedbacks can use it.
 *
 * Filtering order matches the historical adapter behaviour:
 *   1. projectName  (always required)
 *   2. type
 *   3. status / statuses  (`statuses` bucket wins when both are set)
 *   4. url
 *   5. urlPattern
 *   6. search       (lowercase substring match on `message`)
 *
 * Pagination clamps `limit` to a maximum of 100 and treats `page` as 1-based,
 * matching the public API contract documented on `getFeedbacks`. A page or
 * limit below 1 is clamped up to 1 rather than indexing backwards from the
 * end of the match set.
 */
import type { FeedbackQuery, FeedbackRecord } from "./types.js";
export interface FilterResult {
    feedbacks: FeedbackRecord[];
    total: number;
}
/**
 * Apply the standard feedback filter + pagination pipeline against an
 * in-memory snapshot. Used by `MemoryStore.getFeedbacks` and
 * `LocalStorageStore.getFeedbacks` so the two never drift.
 *
 * @param items  All known feedback records (already include `annotations`).
 * @param query  Filter and pagination options. `projectName` is required.
 */
export declare function applyFeedbackFilters(items: readonly FeedbackRecord[], query: FeedbackQuery): FilterResult;
