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

import { timingSafeEqual } from "node:crypto";
import type { FeedbackRecord, InstaFixStore } from "./types.js";
import { flattenAnnotation, isStoreDuplicate, isStoreNotFound, toFeedbackUpdate } from "./types.js";
import {
  feedbackCreateSchema,
  feedbackDeleteSchema,
  feedbackPatchSchema,
  formatValidationErrors,
  getQuerySchema,
} from "./validation.js";
import { dispatchWebhooks, type WebhookConfig } from "./webhooks.js";

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

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------

type CorsHeaders = Readonly<Record<string, string>>;

/**
 * Build CORS headers for a given request.
 * When `allowedOrigins` is set, only matching origins get reflected.
 * When unset, no CORS headers are added (no permissive wildcard by default).
 */
function buildCorsHeaders(request: Request, allowedOrigins: ReadonlyArray<string> | undefined): CorsHeaders {
  if (!allowedOrigins) return {};

  const origin = request.headers.get("Origin");
  if (!origin) return {};

  if (!allowedOrigins.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/**
 * Attach CORS headers to an existing Response.
 */
function withCors(response: Response, corsHeaders: CorsHeaders): Response {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// ---------------------------------------------------------------------------
// Handler factory
// ---------------------------------------------------------------------------

/**
 * Perform a constant-time string comparison to prevent timing attacks on API key validation.
 * Returns `false` immediately when lengths differ (unavoidable length leak), but the
 * byte-level comparison itself is timing-safe.
 *
 * Length must be compared in BYTES: `timingSafeEqual` throws on byte-length
 * mismatch, and multi-byte characters make equal `.length` strings differ in
 * bytes — an attacker-controlled `Authorization` header must never turn that
 * into a 500.
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Serialize a feedback record for the HTTP wire (edge DTO — stores return raw
 * records, redaction happens here).
 *
 * `clientId` is always stripped: it is a browser-local dedup secret, and the
 * POST dedup path returns the full existing record for whoever presents it —
 * exposing it via responses would turn that into a record-theft oracle.
 * `authorEmail` is PII: blanked unless the requester is Bearer-authenticated.
 * Never mutates the input — webhooks receive the same record object.
 */
function toWireFeedback(feedback: FeedbackRecord, includeEmail: boolean): Omit<FeedbackRecord, "clientId"> {
  const { clientId: _clientId, ...wire } = feedback;
  return includeEmail ? wire : { ...wire, authorEmail: "" };
}

const defaultMapUnknownError = (): string => "Internal server error";

/**
 * Create request handlers for the InstaFix API endpoint, backed by any
 * `InstaFixStore`.
 *
 * **Rate limiting** is not handled by this library. Apply rate limiting at the
 * framework or reverse-proxy level (e.g. Next.js middleware, Nginx, Cloudflare).
 * The POST endpoint in particular should be rate-limited to prevent abuse, since
 * the widget typically calls it from unauthenticated browser contexts.
 */
export function createStoreHandler({
  store,
  apiKey,
  publicEndpoints = apiKey ? ["POST", "OPTIONS"] : undefined,
  allowedOrigins,
  requireAuthForDestructive = true,
  redactUnauthenticatedEmails = true,
  webhooks,
  mapUnknownError = defaultMapUnknownError,
}: StoreHandlerOptions): InstaFixHandler {
  // Refuse to expose destructive endpoints publicly in production. Without
  // this guard, anyone could `DELETE { deleteAll: true }` against the API.
  if (!apiKey && requireAuthForDestructive && process.env.NODE_ENV === "production") {
    throw new Error(
      "[instafix] apiKey is required in production. " +
        "Set `apiKey` to enable destructive endpoints, or pass " +
        "`requireAuthForDestructive: false` if InstaFix sits behind your own auth middleware.",
    );
  }

  const publicMethods: ReadonlySet<InstaFixHttpMethod> | null = publicEndpoints ? new Set(publicEndpoints) : null;

  // Normalise the webhook config to an array once so every POST avoids the
  // allocation. Empty array short-circuits `dispatchWebhooks` cheaply.
  const webhookList: ReadonlyArray<WebhookConfig> = webhooks
    ? Array.isArray(webhooks)
      ? (webhooks as ReadonlyArray<WebhookConfig>)
      : [webhooks as WebhookConfig]
    : [];

  /**
   * True iff `apiKey` is configured AND the request carries a matching Bearer
   * token. Distinct from `authenticate`: a valid token on a public method still
   * counts as authenticated here (drives PII redaction, not access control).
   */
  function isBearerAuthenticated(request: Request): boolean {
    if (!apiKey) return false;
    const header = request.headers.get("Authorization");
    return header !== null && safeCompare(header, `Bearer ${apiKey}`);
  }

  /** Whether this request may see `authorEmail` (see `redactUnauthenticatedEmails`). */
  function emailPermitted(request: Request): boolean {
    return !redactUnauthenticatedEmails || isBearerAuthenticated(request);
  }

  /** Verify Bearer token when apiKey is configured. Skips methods listed in `publicEndpoints`. */
  function authenticate(request: Request, method: InstaFixHttpMethod): Response | null {
    if (!apiKey) {
      // No apiKey + destructive method + guard enabled → reject. GET/POST/OPTIONS
      // stay open by default so the widget keeps working in dev without config.
      if (requireAuthForDestructive && (method === "DELETE" || method === "PATCH")) {
        return Response.json({ error: "apiKey required for destructive operations" }, { status: 401 });
      }
      return null;
    }
    if (publicMethods?.has(method)) return null;
    if (!isBearerAuthenticated(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
  }

  return {
    /**
     * CORS preflight handler. In production, always configure `allowedOrigins`
     * to restrict which domains can make cross-origin requests to the API.
     * Without it, no CORS headers are emitted and browsers will block widget requests.
     */
    OPTIONS: (request: Request): Response => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      return new Response(null, { status: 204, headers: corsHeaders });
    },

    POST: async (request: Request): Promise<Response> => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      const authError = authenticate(request, "POST");
      if (authError) return withCors(authError, corsHeaders);
      const body = await request.json().catch(() => null);
      if (!body) {
        return withCors(Response.json({ error: "Invalid JSON" }, { status: 400 }), corsHeaders);
      }

      const parsed = feedbackCreateSchema.safeParse(body);
      if (!parsed.success) {
        return withCors(Response.json({ errors: formatValidationErrors(parsed.error) }, { status: 400 }), corsHeaders);
      }

      const data = parsed.data;

      // Defense-in-depth: enforce annotation limit at handler level in addition to schema validation
      if (data.annotations.length > 50) {
        return withCors(Response.json({ error: "Too many annotations (max 50)" }, { status: 400 }), corsHeaders);
      }

      try {
        const feedback = await store.createFeedback({
          projectName: data.projectName,
          type: data.type,
          message: data.message,
          status: "open",
          url: data.url,
          urlPattern: data.urlPattern ?? null,
          viewport: data.viewport,
          userAgent: data.userAgent,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
          clientId: data.clientId,
          annotations: data.annotations.map(flattenAnnotation),
          screenshotDataUrl: data.screenshotDataUrl ?? null,
          screenshotRegion: data.screenshotRegion ?? null,
          diagnostics: data.diagnostics ?? null,
        });

        // Fire-and-forget: drop the promise so the widget isn't held back
        // on slow Slack/Discord/generic receivers. `dispatchWebhooks` traps
        // its own errors and reports them through `WebhookConfig.onError`.
        if (webhookList.length > 0) {
          void dispatchWebhooks(webhookList, feedback);
        }

        // Email stays intact on POST responses: the requester supplied it.
        return withCors(Response.json(toWireFeedback(feedback, true), { status: 201 }), corsHeaders);
      } catch (error) {
        // Handle unique constraint violation (clientId dedup) — presenting the
        // clientId proves ownership of the record, so the email stays intact.
        if (isStoreDuplicate(error)) {
          const existing = await store.findByClientId(data.clientId);
          if (existing) return withCors(Response.json(toWireFeedback(existing, true), { status: 201 }), corsHeaders);
        }

        const message = mapUnknownError(error);
        console.error("[instafix] Failed to create feedback:", error);
        return withCors(Response.json({ error: message }, { status: 500 }), corsHeaders);
      }
    },

    GET: async (request: Request): Promise<Response> => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      const authError = authenticate(request, "GET");
      if (authError) return withCors(authError, corsHeaders);

      const url = new URL(request.url);
      const rawQuery: Record<string, string> = {};
      for (const key of [
        "projectName",
        "page",
        "limit",
        "type",
        "status",
        "statuses",
        "search",
        "url",
        "urlPattern",
      ] as const) {
        const val = url.searchParams.get(key);
        if (val !== null) rawQuery[key] = val;
      }

      const parsed = getQuerySchema.safeParse(rawQuery);
      if (!parsed.success) {
        return withCors(Response.json({ errors: formatValidationErrors(parsed.error) }, { status: 400 }), corsHeaders);
      }

      try {
        // GET can be public (no apiKey, or "GET" in publicEndpoints for widget
        // hosts) — redact author emails unless the requester sent the key.
        const authed = emailPermitted(request);
        const result = await store.getFeedbacks(parsed.data);
        const body = { ...result, feedbacks: result.feedbacks.map((f) => toWireFeedback(f, authed)) };
        return withCors(Response.json(body, { headers: { "Cache-Control": "private, max-age=5" } }), corsHeaders);
      } catch (error) {
        const message = mapUnknownError(error);
        console.error("[instafix] Failed to fetch feedbacks:", error);
        return withCors(Response.json({ error: message }, { status: 500 }), corsHeaders);
      }
    },

    PATCH: async (request: Request): Promise<Response> => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      const authError = authenticate(request, "PATCH");
      if (authError) return withCors(authError, corsHeaders);

      const body = await request.json().catch(() => null);
      if (!body) {
        return withCors(Response.json({ error: "Invalid JSON" }, { status: 400 }), corsHeaders);
      }

      const parsed = feedbackPatchSchema.safeParse(body);
      if (!parsed.success) {
        return withCors(Response.json({ errors: formatValidationErrors(parsed.error) }, { status: 400 }), corsHeaders);
      }

      try {
        // Verify project ownership before updating. Any store implementing
        // the optional InstaFixStore.verifyProjectOwnership gets the check;
        // duck-typing instead of `instanceof` keeps it bundling-safe and
        // open to third-party adapters.
        if (store.verifyProjectOwnership) {
          const owns = await store.verifyProjectOwnership(parsed.data.id, parsed.data.projectName);
          if (!owns) {
            return withCors(Response.json({ error: "Feedback not found" }, { status: 404 }), corsHeaders);
          }
        }

        // resolvedAt is the CLOSURE timestamp — set when the feedback enters
        // a terminal status (resolved / wont_fix), cleared otherwise. The
        // derivation lives here at the edge; stores persist what they're given.
        const feedback = await store.updateFeedback(
          parsed.data.id,
          toFeedbackUpdate(
            parsed.data.status,
            new Date(),
            parsed.data.message,
            parsed.data.annotations?.map(flattenAnnotation),
          ),
        );

        // PATCH can be made public via publicEndpoints / requireAuthForDestructive:
        // false — don't leak the author's email through the update response.
        return withCors(Response.json(toWireFeedback(feedback, emailPermitted(request))), corsHeaders);
      } catch (error) {
        if (isStoreNotFound(error)) {
          return withCors(Response.json({ error: "Feedback not found" }, { status: 404 }), corsHeaders);
        }
        const message = mapUnknownError(error);
        console.error("[instafix] Failed to update feedback:", error);
        return withCors(Response.json({ error: message }, { status: 500 }), corsHeaders);
      }
    },

    DELETE: async (request: Request): Promise<Response> => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      const authError = authenticate(request, "DELETE");
      if (authError) return withCors(authError, corsHeaders);

      const body = await request.json().catch(() => null);
      if (!body) {
        return withCors(Response.json({ error: "Invalid JSON" }, { status: 400 }), corsHeaders);
      }

      const parsed = feedbackDeleteSchema.safeParse(body);
      if (!parsed.success) {
        return withCors(Response.json({ errors: formatValidationErrors(parsed.error) }, { status: 400 }), corsHeaders);
      }

      try {
        if ("deleteAll" in parsed.data) {
          await store.deleteAllFeedbacks(parsed.data.projectName);
          return withCors(Response.json({ deleted: true }), corsHeaders);
        }

        // Verify project ownership before deleting. Any store implementing
        // the optional InstaFixStore.verifyProjectOwnership gets the check;
        // duck-typing instead of `instanceof` keeps it bundling-safe and
        // open to third-party adapters.
        if (store.verifyProjectOwnership) {
          const owns = await store.verifyProjectOwnership(parsed.data.id, parsed.data.projectName);
          if (!owns) {
            return withCors(Response.json({ error: "Feedback not found" }, { status: 404 }), corsHeaders);
          }
        }

        await store.deleteFeedback(parsed.data.id);
        return withCors(Response.json({ deleted: true }), corsHeaders);
      } catch (error) {
        if (isStoreNotFound(error)) {
          return withCors(Response.json({ error: "Feedback not found" }, { status: 404 }), corsHeaders);
        }
        const message = mapUnknownError(error);
        console.error("[instafix] Failed to delete feedback:", error);
        return withCors(Response.json({ error: message }, { status: 500 }), corsHeaders);
      }
    },
  };
}
