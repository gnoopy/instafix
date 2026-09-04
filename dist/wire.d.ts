/**
 * HTTP wire helpers shared by every client that talks to a InstaFix
 * endpoint (widget `ApiClient`, dashboard `createEndpointSource`).
 *
 * One definition of the query-string encoding and the HTTP→typed-error
 * mapping — two clients implementing them independently already drifted
 * once (the dashboard forgot to serialize `statuses`), so they live here
 * now.
 */
import { InstaFixError, InstaFixNetworkError } from "./errors.js";
import type { FeedbackQuery } from "./types.js";
/**
 * Encode a `FeedbackQuery` as the endpoint's expected query string.
 * Omitted/empty filters are not serialized; `statuses` uses the CSV form
 * the server's schema splits (`statuses=open,in_progress`).
 */
export declare function feedbackQueryToSearchParams(query: FeedbackQuery): URLSearchParams;
/**
 * Map a non-OK `Response` to the appropriate typed error:
 *   - 401 / 403 → `InstaFixAuthError`
 *   - other 4xx → `InstaFixValidationError`
 *   - 5xx (or anything else) → generic `InstaFixError` (code `"SERVER"`)
 *
 * The response body is consumed via `.text()` so the caller keeps the
 * server-supplied message in the thrown error; `.text()` failures fall back
 * to `"Unknown error"` (kept verbatim — host apps grep for it).
 */
export declare function errorFromResponse(response: Response, label: string): Promise<InstaFixError>;
/**
 * Normalise an exception thrown by `fetch` (or a timeout AbortController)
 * into a `InstaFixNetworkError`. AbortErrors count as network failures —
 * in InstaFix client code they always come from internal timeouts, never a
 * user-driven cancellation.
 */
export declare function networkErrorFromException(error: unknown, label: string): InstaFixNetworkError;
