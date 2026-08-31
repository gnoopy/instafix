import { FeedbackRecord, FeedbackStatus, FeedbackPayload, FeedbackType, InstaFixStore, ScreenshotStorage, FeedbackCreateInput, FeedbackQuery, FeedbackPage, FeedbackUpdateInput } from './instafix-core.cjs';
export { InstaFixStore, ScreenshotStorage, StoreDuplicateError, StoreNotFoundError, StorePersistenceError, flattenAnnotation, isStorePersistence } from './instafix-core.cjs';

/**
 * Outgoing webhook notifications for newly-created feedbacks.
 *
 * Plug a Slack, Discord, or generic HTTP endpoint into `createInstaFixHandler`
 * to receive a payload whenever a feedback is successfully persisted. Webhooks
 * are dispatched as fire-and-forget (`void Promise.all(...)`) so a slow or
 * down receiver never blocks the client response — the feedback is already in
 * the DB by the time we dial out.
 *
 * - **Type-specific formatting**: Slack uses `{ text, blocks }`, Discord uses
 *   `{ content, embeds }`, generic uses the raw `FeedbackRecord` JSON.
 * - **Timeout**: 5s by default (overridable per webhook).
 * - **Error handling**: `config.onError(err, feedback.id)` is invoked when
 *   present; otherwise we log a one-liner to `console.warn` so the issue is
 *   surfaced without crashing the request.
 */

/** Supported webhook integrations — drives the JSON body shape. */
type WebhookType = "slack" | "discord" | "generic";
/**
 * Outgoing webhook configuration.
 *
 * - `url` — required, the HTTPS endpoint to POST to.
 * - `type` — payload format. Defaults to `"generic"` (raw JSON).
 * - `headers` — extra headers merged on top of `Content-Type: application/json`.
 *   Useful for signed-payload schemes (`X-Signature`, bearer tokens, …).
 * - `timeoutMs` — abort the fetch after this many ms. Defaults to 5000.
 * - `onError` — invoked with the underlying error and the feedback id when
 *   the dispatch fails (network error, non-2xx, timeout). The webhook is
 *   fire-and-forget, so this is your only chance to observe failures.
 */
interface WebhookConfig {
    url: string;
    type?: WebhookType;
    headers?: Record<string, string>;
    timeoutMs?: number;
    onError?: (err: Error, feedbackId: string) => void;
}
/** Block Kit envelope used by Slack incoming webhooks. */
interface SlackWebhookPayload {
    text: string;
    blocks: ReadonlyArray<SlackHeaderBlock | SlackSectionBlock | SlackContextBlock>;
}
interface SlackHeaderBlock {
    type: "header";
    text: {
        type: "plain_text";
        text: string;
        emoji: true;
    };
}
interface SlackSectionBlock {
    type: "section";
    text: {
        type: "mrkdwn";
        text: string;
    };
}
interface SlackContextBlock {
    type: "context";
    elements: ReadonlyArray<{
        type: "mrkdwn";
        text: string;
    }>;
}
/** Embed envelope used by Discord incoming webhooks. */
interface DiscordWebhookPayload {
    content: string;
    embeds: ReadonlyArray<{
        title: string;
        description: string;
        color: number;
        fields: ReadonlyArray<{
            name: string;
            value: string;
            inline: boolean;
        }>;
        timestamp: string;
    }>;
}
/** Mapping from webhook type to its concrete body shape. */
interface WebhookPayloadMap {
    slack: SlackWebhookPayload;
    discord: DiscordWebhookPayload;
    generic: FeedbackRecord;
}
/**
 * Dispatch a single webhook. Fire-and-forget: never throws, never rejects.
 *
 * - Builds the type-specific payload.
 * - POSTs with an `AbortSignal` timeout.
 * - On any error (network, non-2xx, timeout, exception), invokes
 *   `config.onError(err, feedbackId)` if provided; otherwise logs a one-liner.
 */
declare function dispatchWebhook(config: WebhookConfig, feedback: FeedbackRecord): Promise<void>;
/**
 * Dispatch every configured webhook in parallel. Awaiting the returned promise
 * lets tests synchronize on completion, but production callers should drop the
 * promise on the floor (`void dispatchWebhooks(...)`) so the HTTP response
 * isn't held back on slow receivers.
 */
declare function dispatchWebhooks(configs: readonly WebhookConfig[], feedback: FeedbackRecord): Promise<void>;

interface FeedbackPatchInput {
    id: string;
    projectName: string;
    status: FeedbackStatus;
    message?: string | undefined;
    annotations?: FeedbackPayload["annotations"] | undefined;
}
interface FeedbackDeleteSingle {
    id: string;
    projectName: string;
}
interface FeedbackDeleteAll {
    projectName: string;
    deleteAll: true;
}
type FeedbackDeleteInput = FeedbackDeleteSingle | FeedbackDeleteAll;
interface GetQueryInput {
    projectName: string;
    /** Set to 1 by schema default when omitted from raw input. */
    page: number;
    /** Set to 50 by schema default when omitted from raw input. */
    limit: number;
    type?: FeedbackType | undefined;
    status?: FeedbackStatus | undefined;
    statuses?: FeedbackStatus[] | undefined;
    search?: string | undefined;
    url?: string | undefined;
    urlPattern?: string | undefined;
}

/**
 * @deprecated The create wire shape is core's `FeedbackPayload` — import
 * that instead. This alias is kept for one release cycle.
 */
type FeedbackCreateSchemaInput = FeedbackPayload;

/**
 * Structural type for a Prisma model delegate (`prisma.instafixFeedback`).
 *
 * Arguments are kept `unknown` so any Prisma version's generated client
 * satisfies the constraint; the adapter assembles type-safe payloads
 * internally before forwarding them.
 *
 * Members use **method syntax** (`create(args)`) rather than function-property
 * syntax (`create: (args) => ...`) on purpose: under `strictFunctionTypes`,
 * function-property parameters are checked *contravariantly*, so a real
 * generated delegate — whose `create(args: SpecificArgs)` takes a type narrower
 * than `unknown` — would fail to assign to `PrismaModelDelegate`. Method
 * signatures are checked *bivariantly* on parameters, which is exactly what we
 * want for structurally matching a third-party generated client (#99).
 */
interface PrismaModelDelegate {
    create(args: unknown): Promise<unknown>;
    findMany(args: unknown): Promise<unknown[]>;
    findUnique(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
    delete(args: unknown): Promise<unknown>;
    deleteMany(args: unknown): Promise<unknown>;
    count(args: unknown): Promise<number>;
}
/**
 * Minimal Prisma client shape expected by this adapter.
 * Consumers pass their own `PrismaClient` instance at runtime — this interface
 * defines the subset of methods the adapter actually uses, so it can be
 * referenced in handler option types without importing `@prisma/client`.
 */
interface InstaFixPrismaClient {
    instafixFeedback: PrismaModelDelegate;
}
/**
 * Options accepted by `PrismaStore`.
 */
interface PrismaStoreOptions {
    /**
     * When `true`, the `?search=` filter is built with `mode: "insensitive"`
     * (case-insensitive across all letters, including non-ASCII).
     *
     * When `false`, the filter is built without `mode` — uses each database's
     * default `LIKE` semantics (case-insensitive ASCII on SQLite by default;
     * case-sensitive on PostgreSQL with the standard `LIKE` operator;
     * collation-driven on MySQL and SQL Server).
     *
     * When omitted, the value is auto-detected from the Prisma client's active
     * provider: providers whose generated client exposes `mode?: QueryMode`
     * (`postgresql`, `mongodb`, `cockroachdb`) get `true`; others (`mysql`,
     * `sqlite`, `sqlserver`) get `false`. Unknown / undetectable providers
     * default to `false` — `contains` without `mode` works on every provider;
     * `mode: "insensitive"` throws on MySQL/SQLite/SQL Server, so the safer
     * default is to omit it.
     */
    caseInsensitiveSearch?: boolean;
    /**
     * Optional storage backend for screenshots. Without it, the data URL is
     * persisted inline on `Feedback.screenshotUrl` with a one-time warn.
     */
    screenshotStorage?: ScreenshotStorage | undefined;
}
/**
 * Prisma-backed implementation of `InstaFixStore`.
 *
 * Wraps a PrismaClient to satisfy the abstract store interface.
 *
 * Pass `screenshotStorage` to externalise screenshots (S3, R2, B2, …) — the
 * widget's data URL is uploaded and only the returned URL is persisted, so
 * the database stays small. Without `screenshotStorage`, the data URL is
 * persisted inline (logged once on first use as a heads-up).
 */
declare class PrismaStore implements InstaFixStore {
    /** @internal */
    private prisma;
    private readonly screenshotStorage;
    /** Module-level flag would leak across PrismaStore instances in tests; use per-instance. */
    private inlineFallbackWarned;
    /** @internal */
    private caseInsensitiveSearch;
    constructor(prisma: InstaFixPrismaClient, options?: PrismaStoreOptions);
    createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord>;
    /**
     * Resolve the value to persist on `Feedback.screenshotUrl`.
     *
     * - No data URL → null
     * - Storage configured → upload, return remote URL. Upload failures
     *   persist `null` (drop the screenshot) rather than silently inlining
     *   the data URL — an inline fallback would bloat Postgres unnoticed
     *   during a multi-minute storage outage. The feedback message itself is
     *   preserved; only the screenshot is missing, and the warn surfaces it.
     * - No storage → inline base64, with a one-time warn so prod operators
     *   notice the footgun.
     *
     * Operators who prefer the legacy inline-on-failure behaviour can wrap
     * their `ScreenshotStorage.upload` with their own catch + return the
     * data URL — the adapter treats whatever the storage returns as final.
     */
    private persistScreenshot;
    findByClientId(clientId: string): Promise<FeedbackRecord | null>;
    getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage>;
    updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord>;
    deleteFeedback(id: string): Promise<void>;
    deleteAllFeedbacks(projectName: string): Promise<void>;
    /**
     * Verify that a feedback record with `id` belongs to `projectName`.
     * Returns `true` when the record exists and matches, `false` otherwise.
     */
    verifyProjectOwnership(id: string, projectName: string): Promise<boolean>;
}
/** HTTP methods that may be listed in `HandlerOptions.publicEndpoints`. */
type InstaFixHttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";
interface HandlerOptions {
    /** Prisma client — used when `store` is not provided. Wrapped in a `PrismaStore` internally. */
    prisma?: InstaFixPrismaClient;
    /** Abstract store — when provided, takes precedence over `prisma`. */
    store?: InstaFixStore;
    /**
     * Optional storage backend for screenshots. Used only with `prisma`
     * (ignored when a custom `store` is passed — that store is responsible
     * for its own screenshot strategy). Without a storage, the data URL is
     * persisted inline on `Feedback.screenshotUrl` with a one-time warn.
     */
    screenshotStorage?: ScreenshotStorage;
    /**
     * Optional API key for bearer-token authentication.
     *
     * - **When set:** every request not listed in `publicEndpoints` must include an
     *   `Authorization: Bearer {apiKey}` header. Requests without a valid token
     *   receive a 401 Unauthorized response.
     * - **When not set:** the API is fully public — anyone can create, read,
     *   update, and delete feedbacks (including destructive DELETE operations).
     * - **Recommendation:** always set `apiKey` in production environments.
     */
    apiKey?: string | undefined;
    /**
     * HTTP methods that don't require API key authentication.
     * Defaults to `['POST', 'OPTIONS']` when `apiKey` is set — POST must stay open
     * because the browser widget submits feedback from unauthenticated contexts.
     */
    publicEndpoints?: ReadonlyArray<InstaFixHttpMethod>;
    /** Allowed CORS origins — when set, validates the Origin header */
    allowedOrigins?: ReadonlyArray<string> | undefined;
    /**
     * Override case-insensitive search behaviour for the built-in `PrismaStore`.
     *
     * Only applied when `prisma` is provided (not when a custom `store` is
     * passed). See `PrismaStoreOptions.caseInsensitiveSearch` for details on
     * auto-detection and per-provider semantics.
     */
    caseInsensitiveSearch?: boolean;
    /**
     * Whether destructive endpoints (DELETE, PATCH) require `apiKey`.
     *
     * Defaults to `true` and intentionally cannot be disabled in production:
     * - `NODE_ENV === "production"` without `apiKey` throws at startup. The
     *   factory refuses to return an unauthenticated destructive surface.
     * - `NODE_ENV !== "production"` without `apiKey` keeps the handler running
     *   for local dev/tests, but DELETE/PATCH return 401 until you set
     *   `apiKey` or explicitly opt out with `requireAuthForDestructive: false`.
     *
     * Set to `false` only when you wrap `createInstaFixHandler` in your own
     * auth middleware (session, OAuth, etc.) and want InstaFix to stay open.
     */
    requireAuthForDestructive?: boolean;
    /**
     * Blank `authorEmail` in GET/PATCH responses to requests that do not carry
     * a valid `Authorization: Bearer <apiKey>` header. Defaults to `true`:
     * reviewer emails are PII and the widget needs GET to be reachable, so an
     * unauthenticated response must not enumerate them (issue #105).
     *
     * Set to `false` ONLY when the handler sits behind your own auth layer
     * that covers GET as well (e.g. `requireAuthForDestructive: false` behind
     * session middleware) — the handler cannot see that layer, and without it
     * every visitor who can reach the endpoint can read reviewer emails.
     * `clientId` is stripped from responses regardless of this option.
     */
    redactUnauthenticatedEmails?: boolean;
    /**
     * Outgoing webhooks fired after a feedback is successfully persisted.
     *
     * Pass a single config or an array — every entry receives a POST with a
     * type-specific payload (Slack, Discord, or generic JSON). Dispatch is
     * fire-and-forget: the HTTP response is returned to the widget before
     * webhook delivery completes, so a slow receiver never blocks the client.
     * Provide `onError` on each config to observe failures.
     */
    webhooks?: WebhookConfig | ReadonlyArray<WebhookConfig>;
}
/**
 * Object returned by `createInstaFixHandler` — one handler per HTTP method.
 */
interface InstaFixHandler {
    OPTIONS: (request: Request) => Response;
    POST: (request: Request) => Promise<Response>;
    GET: (request: Request) => Promise<Response>;
    PATCH: (request: Request) => Promise<Response>;
    DELETE: (request: Request) => Promise<Response>;
}
/**
 * Create request handlers for the InstaFix API endpoint.
 *
 * Accepts either a `store` (abstract) or a `prisma` client (backwards compatible).
 * When `prisma` is provided without `store`, it is wrapped in a `PrismaStore`.
 *
 * **Rate limiting** is not handled by this library. Apply rate limiting at the
 * framework or reverse-proxy level (e.g. Next.js middleware, Nginx, Cloudflare).
 * The POST endpoint in particular should be rate-limited to prevent abuse, since
 * the widget typically calls it from unauthenticated browser contexts.
 *
 * @example Next.js App Router — `app/api/instafix/route.ts`
 * ```ts
 * import { createInstaFixHandler } from '@instafix/adapter-prisma'
 * import { prisma } from '@/lib/prisma'
 *
 * export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({ prisma })
 * ```
 *
 * @example With abstract store
 * ```ts
 * import { createInstaFixHandler, PrismaStore } from '@instafix/adapter-prisma'
 * import { prisma } from '@/lib/prisma'
 *
 * const store = new PrismaStore(prisma)
 * export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({ store })
 * ```
 */
declare function createInstaFixHandler({ prisma, store: providedStore, screenshotStorage, apiKey, publicEndpoints, allowedOrigins, caseInsensitiveSearch, requireAuthForDestructive, redactUnauthenticatedEmails, webhooks, }: HandlerOptions): InstaFixHandler;

export { type DiscordWebhookPayload, type FeedbackCreateSchemaInput, type FeedbackDeleteInput, type FeedbackPatchInput, type GetQueryInput, type HandlerOptions, type InstaFixHandler, type InstaFixHttpMethod, type InstaFixPrismaClient, type PrismaModelDelegate, PrismaStore, type PrismaStoreOptions, type SlackWebhookPayload, type WebhookConfig, type WebhookPayloadMap, type WebhookType, createInstaFixHandler, dispatchWebhook, dispatchWebhooks };
