/**
 * Generic HTTP handler factory for the InstaFix API endpoint — auth, CORS,
 * validation, and webhooks. Nothing here is tied to any particular storage
 * backend: it operates entirely against the abstract `InstaFixStore`
 * contract, so every adapter (Prisma, SQLite, memory, a third-party one)
 * gets the exact same request handling for free.
 *
 * Adapter packages wrap this with their own store-construction shorthand
 * (e.g. `@instafix/adapter-prisma`'s `createInstaFixHandler({ prisma })`
 * builds a `PrismaStore` and calls through to `createStoreHandler`).
 */
import type { InstaFixStore } from "./types.js";
import { type WebhookConfig } from "./webhooks.js";
/** HTTP methods that may be listed in `StoreHandlerOptions.publicEndpoints`. */
export type InstaFixHttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";
export interface StoreHandlerOptions {
    /** The store backing every request. */
    store: InstaFixStore;
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
     * Whether destructive endpoints (DELETE, PATCH) require `apiKey`.
     *
     * Defaults to `true` and intentionally cannot be disabled in production:
     * - `NODE_ENV === "production"` without `apiKey` throws at startup. The
     *   factory refuses to return an unauthenticated destructive surface.
     * - `NODE_ENV !== "production"` without `apiKey` keeps the handler running
     *   for local dev/tests, but DELETE/PATCH return 401 until you set
     *   `apiKey` or explicitly opt out with `requireAuthForDestructive: false`.
     *
     * Set to `false` only when you wrap the handler in your own auth
     * middleware (session, OAuth, etc.) and want InstaFix to stay open.
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
    /**
     * Map an error caught from the store into a user-facing 500 message.
     * Defaults to a generic `"Internal server error"`. Adapters can supply a
     * backend-specific mapper (e.g. adapter-prisma recognizes Prisma's
     * "table not found" error and points at `npx prisma db push`).
     *
     * @internal — adapter authors only; not part of the stable public API.
     */
    mapUnknownError?: (error: unknown) => string;
}
/**
 * Object returned by `createStoreHandler` — one handler per HTTP method.
 */
export interface InstaFixHandler {
    OPTIONS: (request: Request) => Response;
    POST: (request: Request) => Promise<Response>;
    GET: (request: Request) => Promise<Response>;
    PATCH: (request: Request) => Promise<Response>;
    DELETE: (request: Request) => Promise<Response>;
}
/**
 * Create request handlers for the InstaFix API endpoint, backed by any
 * `InstaFixStore`.
 *
 * **Rate limiting** is not handled by this library. Apply rate limiting at the
 * framework or reverse-proxy level (e.g. Next.js middleware, Nginx, Cloudflare).
 * The POST endpoint in particular should be rate-limited to prevent abuse, since
 * the widget typically calls it from unauthenticated browser contexts.
 */
export declare function createStoreHandler({ store, apiKey, publicEndpoints, allowedOrigins, requireAuthForDestructive, redactUnauthenticatedEmails, webhooks, mapUnknownError, }: StoreHandlerOptions): InstaFixHandler;
