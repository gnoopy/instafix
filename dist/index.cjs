"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SqliteStore: () => SqliteStore,
  StoreDuplicateError: () => StoreDuplicateError,
  StoreNotFoundError: () => StoreNotFoundError,
  StorePersistenceError: () => StorePersistenceError,
  createInstaFixHandler: () => createStoreHandler,
  isStoreDuplicate: () => isStoreDuplicate,
  isStoreNotFound: () => isStoreNotFound,
  isStorePersistence: () => isStorePersistence
});
module.exports = __toCommonJS(index_exports);

// ../core/src/type-utils.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function hasOwn(value, key) {
  return isRecord(value) && key in value;
}

// ../core/src/types.ts
var FEEDBACK_TYPES = ["question", "change", "bug", "other"];
var FEEDBACK_STATUSES = ["open", "in_progress", "resolved", "wont_fix"];
var CLOSED_FEEDBACK_STATUSES = ["resolved", "wont_fix"];
function isClosedStatus(status) {
  return CLOSED_FEEDBACK_STATUSES.includes(status);
}
function toFeedbackUpdate(status, closedAt = /* @__PURE__ */ new Date(), message, annotations) {
  return isClosedStatus(status) ? { status, resolvedAt: closedAt, message, annotations } : { status, resolvedAt: null, message, annotations };
}
var StoreNotFoundError = class extends Error {
  code = "STORE_NOT_FOUND";
  constructor(message = "Record not found") {
    super(message);
    this.name = "StoreNotFoundError";
  }
};
var StoreDuplicateError = class extends Error {
  code = "STORE_DUPLICATE";
  constructor(message = "Duplicate record") {
    super(message);
    this.name = "StoreDuplicateError";
  }
};
var StorePersistenceError = class extends Error {
  code = "STORE_PERSISTENCE";
  constructor(message = "Failed to persist store mutation", options) {
    super(message, options);
    this.name = "StorePersistenceError";
  }
};
function hasErrorCode(error, code) {
  return hasOwn(error, "code") && error.code === code;
}
function isStoreNotFound(error) {
  if (error instanceof StoreNotFoundError) return true;
  if (hasErrorCode(error, "STORE_NOT_FOUND")) return true;
  return hasErrorCode(error, "P2025");
}
function isStoreDuplicate(error) {
  if (error instanceof StoreDuplicateError) return true;
  if (hasErrorCode(error, "STORE_DUPLICATE")) return true;
  return hasErrorCode(error, "P2002");
}
function isStorePersistence(error) {
  if (error instanceof StorePersistenceError) return true;
  return hasErrorCode(error, "STORE_PERSISTENCE");
}
function flattenAnnotation(ann) {
  return {
    cssSelector: ann.anchor.cssSelector,
    xpath: ann.anchor.xpath,
    textSnippet: ann.anchor.textSnippet,
    elementTag: ann.anchor.elementTag,
    elementId: ann.anchor.elementId,
    textPrefix: ann.anchor.textPrefix,
    textSuffix: ann.anchor.textSuffix,
    fingerprint: ann.anchor.fingerprint,
    neighborText: ann.anchor.neighborText,
    anchorKey: ann.anchor.anchorKey ?? null,
    xPct: ann.rect.xPct,
    yPct: ann.rect.yPct,
    wPct: ann.rect.wPct,
    hPct: ann.rect.hPct,
    scrollX: ann.scrollX,
    scrollY: ann.scrollY,
    viewportW: ann.viewportW,
    viewportH: ann.viewportH,
    devicePixelRatio: ann.devicePixelRatio,
    target: ann.target ?? null,
    inspect: ann.inspect ?? null
  };
}
var CONSOLE_DIAGNOSTIC_LEVELS = ["log", "info", "warn", "error"];

// ../core/src/handler.ts
var import_node_crypto = require("crypto");

// ../core/src/validation.ts
var zod = __toESM(require("zod"), 1);
var z2 = "z" in zod ? zod.z : zod;
var anchorSchema = z2.object({
  cssSelector: z2.string().min(1).max(2e3),
  xpath: z2.string().min(1).max(2e3),
  textSnippet: z2.string().max(500),
  elementTag: z2.string().min(1),
  elementId: z2.string().optional(),
  textPrefix: z2.string().max(200),
  textSuffix: z2.string().max(200),
  fingerprint: z2.string().max(200),
  neighborText: z2.string().max(500),
  // Optional semantic anchor identifier from `data-feedback-anchor`.
  // Null when no semantic ancestor exists; widget always sends this field.
  anchorKey: z2.string().max(200).nullable().optional()
});
var rectSchema = z2.object({
  xPct: z2.number().min(0).max(1),
  yPct: z2.number().min(0).max(1),
  wPct: z2.number().min(0).max(1),
  hPct: z2.number().min(0).max(1)
});
var targetSchema = z2.discriminatedUnion("kind", [
  z2.object({ kind: z2.literal("element") }),
  z2.object({
    kind: z2.literal("text"),
    quote: z2.string().max(500),
    quotePrefix: z2.string().max(64),
    quoteSuffix: z2.string().max(64)
  }),
  z2.object({ kind: z2.literal("area") })
]);
var inspectSchema = z2.object({
  domPath: z2.array(z2.string().max(200)).max(24),
  styles: z2.record(z2.string().max(80), z2.string().max(300)),
  component: z2.string().max(300).optional()
});
var annotationSchema = z2.object({
  anchor: anchorSchema,
  rect: rectSchema,
  scrollX: z2.number().min(0),
  scrollY: z2.number().min(0),
  viewportW: z2.number().int().positive(),
  viewportH: z2.number().int().positive(),
  devicePixelRatio: z2.number().positive().default(1),
  target: targetSchema.nullable().optional(),
  inspect: inspectSchema.nullable().optional()
});
var consoleEntrySchema = z2.object({
  level: z2.enum(CONSOLE_DIAGNOSTIC_LEVELS),
  timestamp: z2.string().max(50),
  message: z2.string().max(600)
});
var networkEntrySchema = z2.object({
  url: z2.string().max(2e3),
  method: z2.string().max(20),
  status: z2.number().int().min(0).max(599),
  durationMs: z2.number().min(0).max(6e5),
  timestamp: z2.string().max(50)
});
var diagnosticsSchema = z2.object({
  console: z2.array(consoleEntrySchema).max(50),
  network: z2.array(networkEntrySchema).max(20)
});
var screenshotRegionSchema = z2.strictObject({
  xPct: z2.number().min(0).max(1),
  yPct: z2.number().min(0).max(1),
  wPct: z2.number().min(0).max(1),
  hPct: z2.number().min(0).max(1)
});
var feedbackCreateSchema = z2.object({
  projectName: z2.string().min(1).max(200),
  type: z2.enum(FEEDBACK_TYPES),
  message: z2.string().min(1).max(5e3),
  // Page-scope identifier the widget uses to group feedbacks. Defaults to
  // `window.location.pathname` ("/orders/42"), but hosts can override
  // `getPageScope()` to return a full URL, an opaque slug, anything they
  // want. We trim + require non-empty so whitespace-only payloads don't
  // leak into the DB; otherwise the value is opaque to the server and only
  // used as a literal Prisma equality filter, so the loose shape is safe.
  url: z2.string().trim().min(1).max(2e3),
  // Optional parameterized URL template (e.g. "/orders/:orderId") provided
  // by the host via `getPageScope()`. Null when host omits it.
  urlPattern: z2.string().max(2e3).nullable().optional(),
  viewport: z2.string().min(1).max(50),
  userAgent: z2.string().min(1).max(500),
  authorName: z2.string().min(1).max(200),
  authorEmail: z2.email().max(200),
  annotations: z2.array(annotationSchema).max(50),
  // Restrict to URL-safe identifiers. The widget generates UUIDs (or a
  // Date+Math.random fallback), both of which match. Anything outside this
  // alphabet — `..`, `/`, NUL, etc. — would be a path-traversal vector once
  // the adapter forwards clientId to `screenshotStorage.upload({ feedbackId })`
  // (e.g. an S3 key prefix or a local FS path).
  clientId: z2.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/, "clientId must be alphanumeric (a-z, A-Z, 0-9, _, -)"),
  // Optional base64 JPEG data URL captured by the widget when
  // `enableScreenshot: true`. ~1.5 MB cap = roughly a 1.1 MB JPEG, well
  // above typical sizes (the widget downscales to 1200px). Rejects abuse
  // without truncating legitimate captures.
  screenshotDataUrl: z2.string().max(15e5).regex(/^data:image\/(jpeg|png|webp);base64,/, "screenshotDataUrl must be a data:image/* base64 URL").nullable().optional(),
  // Optional annotation-rect position within the screenshot. Sent by widgets
  // that capture context around the drawn rect; null + omitted are both
  // accepted so legacy clients (and captures without a screenshot) keep
  // working unchanged.
  screenshotRegion: screenshotRegionSchema.nullable().optional(),
  // Optional console + failed-network snapshot. The widget only attaches
  // this when `captureDiagnostics` is enabled; null + omitted are both
  // accepted so existing clients keep working unchanged.
  diagnostics: diagnosticsSchema.nullable().optional()
});
var feedbackPatchSchema = z2.object({
  id: z2.string().min(1),
  projectName: z2.string().min(1).max(200),
  status: z2.enum(FEEDBACK_STATUSES),
  // Optional message edit (G7) — sent alongside a status change, or alone
  // via a same-status PATCH, so editing a note never needs a second endpoint.
  message: z2.string().min(1).max(5e3).optional(),
  // Optional target replacement (G7 "재연결") — reconnecting an
  // unresolved/ambiguous annotation re-points it at a freshly captured
  // anchor. Replaces the feedback's whole annotation set, same shape and
  // cap as create.
  annotations: z2.array(annotationSchema).max(50).optional()
});
var feedbackDeleteSchema = z2.union([
  z2.object({ id: z2.string().min(1), projectName: z2.string().min(1).max(200) }),
  z2.object({ projectName: z2.string().min(1).max(200), deleteAll: z2.literal(true) })
]);
var getQuerySchema = z2.object({
  projectName: z2.string().min(1).max(200),
  page: z2.coerce.number().int().min(1).default(1),
  limit: z2.coerce.number().int().min(1).max(100).default(50),
  type: z2.enum(FEEDBACK_TYPES).optional(),
  status: z2.enum(FEEDBACK_STATUSES).optional(),
  // Bucket status filter serialized as CSV over the wire (e.g.
  // `statuses=open,in_progress`). Non-empty strings are split before each value
  // is validated against the known statuses; `statuses` wins over the exact
  // `status` filter downstream. Capped at 4 — the number of known statuses.
  statuses: z2.preprocess(
    (val) => typeof val === "string" && val.length > 0 ? val.split(",") : val,
    z2.array(z2.enum(FEEDBACK_STATUSES)).max(4)
  ).optional(),
  search: z2.string().max(200).optional(),
  // Page scope filters — used by the panel's "this page / this type" controls
  url: z2.string().max(2e3).optional(),
  urlPattern: z2.string().max(2e3).optional()
});
function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join("."),
    message: issue.message
  }));
}

// ../core/src/webhooks.ts
var DEFAULT_TIMEOUT_MS = 5e3;
var DISCORD_COLORS = {
  bug: 15680580,
  question: 3900150,
  change: 16096779,
  other: 7041664
};
var DEFAULT_DISCORD_COLOR = 7041664;
function truncate(text, max = 300) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}\u2026`;
}
function buildSlackPayload(feedback) {
  const preview = truncate(feedback.message);
  const headline = `New ${feedback.type} feedback from ${feedback.authorName}`;
  return {
    text: `${headline}: ${preview}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: headline, emoji: true }
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: preview }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `*Project:* ${feedback.projectName}` },
          { type: "mrkdwn", text: `*Type:* ${feedback.type}` },
          { type: "mrkdwn", text: `*URL:* ${feedback.url}` },
          { type: "mrkdwn", text: `*From:* ${feedback.authorName} <${feedback.authorEmail}>` }
        ]
      }
    ]
  };
}
function buildDiscordPayload(feedback) {
  const preview = truncate(feedback.message);
  return {
    content: `New **${feedback.type}** feedback from **${feedback.authorName}**`,
    embeds: [
      {
        title: `${feedback.type} \u2014 ${feedback.projectName}`,
        description: preview,
        color: DISCORD_COLORS[feedback.type] ?? DEFAULT_DISCORD_COLOR,
        fields: [
          { name: "URL", value: feedback.url, inline: false },
          { name: "Author", value: `${feedback.authorName} (${feedback.authorEmail})`, inline: true },
          { name: "Viewport", value: feedback.viewport, inline: true }
        ],
        timestamp: new Date(feedback.createdAt).toISOString()
      }
    ]
  };
}
function buildWebhookPayload(type, feedback) {
  switch (type) {
    case "slack":
      return buildSlackPayload(feedback);
    case "discord":
      return buildDiscordPayload(feedback);
    default:
      return feedback;
  }
}
async function dispatchWebhook(config, feedback) {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const body = JSON.stringify(buildWebhookPayload(config.type ?? "generic", feedback));
  const headers = { "Content-Type": "application/json", ...config.headers ?? {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) {
      const err = new Error(`Webhook responded with HTTP ${response.status}`);
      reportError(config, err, feedback.id);
    }
  } catch (rawError) {
    clearTimeout(timer);
    const err = rawError instanceof Error ? rawError : new Error(String(rawError));
    reportError(config, err, feedback.id);
  }
}
function reportError(config, err, feedbackId) {
  if (config.onError) {
    try {
      config.onError(err, feedbackId);
    } catch (callbackErr) {
      console.warn(
        `[instafix] webhook onError() callback threw for feedback ${feedbackId}: ${String(callbackErr)} (original error: ${err.message})`
      );
    }
    return;
  }
  console.warn(`[instafix] webhook to ${config.url} failed for feedback ${feedbackId}: ${err.message}`);
}
async function dispatchWebhooks(configs, feedback) {
  if (configs.length === 0) return;
  await Promise.all(configs.map((c) => dispatchWebhook(c, feedback)));
}

// ../core/src/handler.ts
function buildCorsHeaders(request, allowedOrigins) {
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
    Vary: "Origin"
  };
}
function withCors(response, corsHeaders) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return (0, import_node_crypto.timingSafeEqual)(bufA, bufB);
}
function toWireFeedback(feedback, includeEmail) {
  const { clientId: _clientId, ...wire } = feedback;
  return includeEmail ? wire : { ...wire, authorEmail: "" };
}
var defaultMapUnknownError = () => "Internal server error";
function createStoreHandler({
  store,
  apiKey,
  publicEndpoints = apiKey ? ["POST", "OPTIONS"] : void 0,
  allowedOrigins,
  requireAuthForDestructive = true,
  redactUnauthenticatedEmails = true,
  webhooks,
  mapUnknownError = defaultMapUnknownError
}) {
  if (!apiKey && requireAuthForDestructive && process.env.NODE_ENV === "production") {
    throw new Error(
      "[instafix] apiKey is required in production. Set `apiKey` to enable destructive endpoints, or pass `requireAuthForDestructive: false` if InstaFix sits behind your own auth middleware."
    );
  }
  const publicMethods = publicEndpoints ? new Set(publicEndpoints) : null;
  const webhookList = webhooks ? Array.isArray(webhooks) ? webhooks : [webhooks] : [];
  function isBearerAuthenticated(request) {
    if (!apiKey) return false;
    const header = request.headers.get("Authorization");
    return header !== null && safeCompare(header, `Bearer ${apiKey}`);
  }
  function emailPermitted(request) {
    return !redactUnauthenticatedEmails || isBearerAuthenticated(request);
  }
  function authenticate(request, method) {
    if (!apiKey) {
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
    OPTIONS: (request) => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      return new Response(null, { status: 204, headers: corsHeaders });
    },
    POST: async (request) => {
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
          diagnostics: data.diagnostics ?? null
        });
        if (webhookList.length > 0) {
          void dispatchWebhooks(webhookList, feedback);
        }
        return withCors(Response.json(toWireFeedback(feedback, true), { status: 201 }), corsHeaders);
      } catch (error) {
        if (isStoreDuplicate(error)) {
          const existing = await store.findByClientId(data.clientId);
          if (existing) return withCors(Response.json(toWireFeedback(existing, true), { status: 201 }), corsHeaders);
        }
        const message = mapUnknownError(error);
        console.error("[instafix] Failed to create feedback:", error);
        return withCors(Response.json({ error: message }, { status: 500 }), corsHeaders);
      }
    },
    GET: async (request) => {
      const corsHeaders = buildCorsHeaders(request, allowedOrigins);
      const authError = authenticate(request, "GET");
      if (authError) return withCors(authError, corsHeaders);
      const url = new URL(request.url);
      const rawQuery = {};
      for (const key of [
        "projectName",
        "page",
        "limit",
        "type",
        "status",
        "statuses",
        "search",
        "url",
        "urlPattern"
      ]) {
        const val = url.searchParams.get(key);
        if (val !== null) rawQuery[key] = val;
      }
      const parsed = getQuerySchema.safeParse(rawQuery);
      if (!parsed.success) {
        return withCors(Response.json({ errors: formatValidationErrors(parsed.error) }, { status: 400 }), corsHeaders);
      }
      try {
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
    PATCH: async (request) => {
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
        if (store.verifyProjectOwnership) {
          const owns = await store.verifyProjectOwnership(parsed.data.id, parsed.data.projectName);
          if (!owns) {
            return withCors(Response.json({ error: "Feedback not found" }, { status: 404 }), corsHeaders);
          }
        }
        const feedback = await store.updateFeedback(
          parsed.data.id,
          toFeedbackUpdate(
            parsed.data.status,
            /* @__PURE__ */ new Date(),
            parsed.data.message,
            parsed.data.annotations?.map(flattenAnnotation)
          )
        );
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
    DELETE: async (request) => {
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
    }
  };
}

// ../core/src/store-helpers.ts
function buildAnnotationRecord(input, ctx) {
  return {
    id: ctx.id,
    feedbackId: ctx.feedbackId,
    cssSelector: input.cssSelector,
    xpath: input.xpath,
    textSnippet: input.textSnippet,
    elementTag: input.elementTag,
    elementId: input.elementId ?? null,
    textPrefix: input.textPrefix,
    textSuffix: input.textSuffix,
    fingerprint: input.fingerprint,
    neighborText: input.neighborText,
    anchorKey: input.anchorKey ?? null,
    xPct: input.xPct,
    yPct: input.yPct,
    wPct: input.wPct,
    hPct: input.hPct,
    scrollX: input.scrollX,
    scrollY: input.scrollY,
    viewportW: input.viewportW,
    viewportH: input.viewportH,
    devicePixelRatio: input.devicePixelRatio,
    createdAt: ctx.now,
    target: input.target ?? null,
    inspect: input.inspect ?? null
  };
}
function buildFeedbackRecord(input, ctx) {
  const now = ctx.now ?? /* @__PURE__ */ new Date();
  return {
    id: ctx.id,
    type: input.type,
    message: input.message,
    status: input.status,
    projectName: input.projectName,
    url: input.url,
    urlPattern: input.urlPattern ?? null,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    viewport: input.viewport,
    userAgent: input.userAgent,
    clientId: input.clientId,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
    annotations: input.annotations.map(
      (ann) => buildAnnotationRecord(ann, { id: ctx.annotationId(), feedbackId: ctx.id, now })
    ),
    screenshotUrl: input.screenshotDataUrl ?? null,
    screenshotRegion: input.screenshotRegion ?? null,
    diagnostics: input.diagnostics ?? null
  };
}

// src/index.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS instafix_feedback (
  id TEXT PRIMARY KEY,
  projectName TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  url TEXT NOT NULL,
  urlPattern TEXT,
  screenshotUrl TEXT,
  screenshotRegion TEXT,
  diagnostics TEXT,
  viewport TEXT NOT NULL,
  userAgent TEXT NOT NULL,
  authorName TEXT NOT NULL,
  authorEmail TEXT NOT NULL,
  clientId TEXT NOT NULL UNIQUE,
  resolvedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project ON instafix_feedback(projectName);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project_status_created ON instafix_feedback(projectName, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_instafix_feedback_project_url ON instafix_feedback(projectName, url);

CREATE TABLE IF NOT EXISTS instafix_annotation (
  id TEXT PRIMARY KEY,
  feedbackId TEXT NOT NULL REFERENCES instafix_feedback(id) ON DELETE CASCADE,
  cssSelector TEXT NOT NULL,
  xpath TEXT NOT NULL,
  textSnippet TEXT NOT NULL,
  elementTag TEXT NOT NULL,
  elementId TEXT,
  textPrefix TEXT NOT NULL,
  textSuffix TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  neighborText TEXT NOT NULL,
  anchorKey TEXT,
  xPct REAL NOT NULL,
  yPct REAL NOT NULL,
  wPct REAL NOT NULL,
  hPct REAL NOT NULL,
  scrollX REAL NOT NULL,
  scrollY REAL NOT NULL,
  viewportW INTEGER NOT NULL,
  viewportH INTEGER NOT NULL,
  devicePixelRatio REAL NOT NULL,
  createdAt TEXT NOT NULL,
  target TEXT,
  inspect TEXT
);
CREATE INDEX IF NOT EXISTS idx_instafix_annotation_feedback ON instafix_annotation(feedbackId);
`;
function rowToAnnotation(row) {
  return {
    id: row.id,
    feedbackId: row.feedbackId,
    cssSelector: row.cssSelector,
    xpath: row.xpath,
    textSnippet: row.textSnippet,
    elementTag: row.elementTag,
    elementId: row.elementId,
    textPrefix: row.textPrefix,
    textSuffix: row.textSuffix,
    fingerprint: row.fingerprint,
    neighborText: row.neighborText,
    anchorKey: row.anchorKey,
    xPct: row.xPct,
    yPct: row.yPct,
    wPct: row.wPct,
    hPct: row.hPct,
    scrollX: row.scrollX,
    scrollY: row.scrollY,
    viewportW: row.viewportW,
    viewportH: row.viewportH,
    devicePixelRatio: row.devicePixelRatio,
    createdAt: new Date(row.createdAt),
    target: row.target ? JSON.parse(row.target) : null,
    inspect: row.inspect ? JSON.parse(row.inspect) : null
  };
}
function rowToFeedback(row, annotations) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    status: row.status,
    projectName: row.projectName,
    url: row.url,
    urlPattern: row.urlPattern,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
    viewport: row.viewport,
    userAgent: row.userAgent,
    clientId: row.clientId,
    resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    annotations,
    screenshotUrl: row.screenshotUrl,
    screenshotRegion: row.screenshotRegion ? JSON.parse(row.screenshotRegion) : null,
    diagnostics: row.diagnostics ? JSON.parse(row.diagnostics) : null
  };
}
function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
function escapeGlobPattern(value) {
  return value.replace(/[[\]*?]/g, (ch) => `[${ch}]`);
}
function isUniqueConstraintViolation(error) {
  return hasOwn(error, "code") && error.code === "SQLITE_CONSTRAINT_UNIQUE";
}
var SqliteStore = class {
  db;
  screenshotStorage;
  caseInsensitiveSearch;
  inlineFallbackWarned = false;
  idCounter = 0;
  constructor(options = {}) {
    this.db = new import_better_sqlite3.default(options.path ?? "./instafix.db");
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(SCHEMA_SQL);
    this.migrate();
    this.screenshotStorage = options.screenshotStorage;
    this.caseInsensitiveSearch = options.caseInsensitiveSearch ?? true;
  }
  /**
   * Additive column migrations for databases created by an older version.
   *
   * `CREATE TABLE IF NOT EXISTS` leaves an existing table exactly as it was,
   * so a column added to SCHEMA_SQL never reaches a database that already
   * exists — reads would be fine, but the INSERT naming the new column would
   * fail with "no such column". There is no migration command by design (see
   * the class doc), so the check runs on every construction: read the table's
   * actual columns and add whatever is missing. Adding a nullable column is
   * instant and lossless in SQLite regardless of table size.
   */
  migrate() {
    const info = this.db.pragma("table_info(instafix_annotation)");
    const columns = new Set(info.map((row) => row.name));
    if (!columns.has("inspect")) {
      this.db.exec("ALTER TABLE instafix_annotation ADD COLUMN inspect TEXT");
    }
  }
  generateId() {
    this.idCounter += 1;
    return `sqlite-${Date.now().toString(36)}-${this.idCounter}-${Math.random().toString(36).slice(2, 8)}`;
  }
  hydrate(row) {
    const annotationRows = this.db.prepare("SELECT * FROM instafix_annotation WHERE feedbackId = ? ORDER BY createdAt ASC, rowid ASC").all(row.id);
    return rowToFeedback(row, annotationRows.map(rowToAnnotation));
  }
  async persistScreenshot(dataUrl, clientId) {
    if (!dataUrl) return null;
    if (this.screenshotStorage) {
      try {
        const { url } = await this.screenshotStorage.upload(dataUrl, {
          feedbackId: clientId,
          mimeType: "image/jpeg"
        });
        return url;
      } catch (err) {
        console.warn(
          "[instafix] screenshotStorage.upload failed \u2014 feedback will be saved without a screenshot. Wrap your storage's upload to handle this differently:",
          err
        );
        return null;
      }
    }
    if (!this.inlineFallbackWarned) {
      this.inlineFallbackWarned = true;
      console.warn(
        "[instafix] enableScreenshot is on but no `screenshotStorage` is configured \u2014 base64 data URLs will be persisted inline in SQLite. Configure a ScreenshotStorage (S3/R2/\u2026) for production."
      );
    }
    return dataUrl;
  }
  insertAnnotation(annotation) {
    this.db.prepare(
      `INSERT INTO instafix_annotation
          (id, feedbackId, cssSelector, xpath, textSnippet, elementTag, elementId, textPrefix, textSuffix,
           fingerprint, neighborText, anchorKey, xPct, yPct, wPct, hPct, scrollX, scrollY, viewportW,
           viewportH, devicePixelRatio, createdAt, target, inspect)
         VALUES
          (@id, @feedbackId, @cssSelector, @xpath, @textSnippet, @elementTag, @elementId, @textPrefix, @textSuffix,
           @fingerprint, @neighborText, @anchorKey, @xPct, @yPct, @wPct, @hPct, @scrollX, @scrollY, @viewportW,
           @viewportH, @devicePixelRatio, @createdAt, @target, @inspect)`
    ).run({
      ...annotation,
      createdAt: annotation.createdAt.toISOString(),
      target: annotation.target ? JSON.stringify(annotation.target) : null,
      inspect: annotation.inspect ? JSON.stringify(annotation.inspect) : null
    });
  }
  async createFeedback(data) {
    const screenshotUrl = await this.persistScreenshot(data.screenshotDataUrl, data.clientId);
    const record = buildFeedbackRecord(data, { id: this.generateId(), annotationId: () => this.generateId() });
    record.screenshotUrl = screenshotUrl;
    const insert = this.db.transaction((rec) => {
      this.db.prepare(
        `INSERT INTO instafix_feedback
            (id, projectName, type, message, status, url, urlPattern, screenshotUrl, screenshotRegion,
             diagnostics, viewport, userAgent, authorName, authorEmail, clientId, resolvedAt, createdAt, updatedAt)
           VALUES
            (@id, @projectName, @type, @message, @status, @url, @urlPattern, @screenshotUrl, @screenshotRegion,
             @diagnostics, @viewport, @userAgent, @authorName, @authorEmail, @clientId, @resolvedAt, @createdAt, @updatedAt)`
      ).run({
        id: rec.id,
        projectName: rec.projectName,
        type: rec.type,
        message: rec.message,
        status: rec.status,
        url: rec.url,
        urlPattern: rec.urlPattern,
        screenshotUrl: rec.screenshotUrl,
        screenshotRegion: rec.screenshotRegion ? JSON.stringify(rec.screenshotRegion) : null,
        diagnostics: rec.diagnostics ? JSON.stringify(rec.diagnostics) : null,
        viewport: rec.viewport,
        userAgent: rec.userAgent,
        authorName: rec.authorName,
        authorEmail: rec.authorEmail,
        clientId: rec.clientId,
        resolvedAt: rec.resolvedAt ? rec.resolvedAt.toISOString() : null,
        createdAt: rec.createdAt.toISOString(),
        updatedAt: rec.updatedAt.toISOString()
      });
      for (const annotation of rec.annotations) {
        this.insertAnnotation(annotation);
      }
    });
    try {
      insert(record);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new StoreDuplicateError();
      }
      throw new StorePersistenceError("Failed to persist feedback", { cause: error });
    }
    return record;
  }
  async getFeedbacks(query) {
    const { projectName, type, status, statuses, search, url, urlPattern } = query;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(query.limit ?? 50, 100));
    const clauses = ["projectName = @projectName"];
    const params = { projectName };
    if (type) {
      clauses.push("type = @type");
      params.type = type;
    }
    if (statuses && statuses.length > 0) {
      const placeholders = statuses.map((_, i) => `@status${i}`).join(", ");
      clauses.push(`status IN (${placeholders})`);
      statuses.forEach((s, i) => {
        params[`status${i}`] = s;
      });
    } else if (status) {
      clauses.push("status = @status");
      params.status = status;
    }
    if (url) {
      clauses.push("url = @url");
      params.url = url;
    }
    if (urlPattern) {
      clauses.push("urlPattern = @urlPattern");
      params.urlPattern = urlPattern;
    }
    if (search) {
      if (this.caseInsensitiveSearch) {
        clauses.push("message LIKE @search ESCAPE '\\'");
        params.search = `%${escapeLikePattern(search)}%`;
      } else {
        clauses.push("message GLOB @search");
        params.search = `*${escapeGlobPattern(search)}*`;
      }
    }
    const where = clauses.join(" AND ");
    const total = this.db.prepare(`SELECT COUNT(*) as count FROM instafix_feedback WHERE ${where}`).get(params).count;
    const rows = this.db.prepare(
      `SELECT * FROM instafix_feedback WHERE ${where} ORDER BY createdAt DESC, rowid DESC LIMIT @limit OFFSET @offset`
    ).all({ ...params, limit, offset: (page - 1) * limit });
    return { feedbacks: rows.map((row) => this.hydrate(row)), total };
  }
  async findByClientId(clientId) {
    const row = this.db.prepare("SELECT * FROM instafix_feedback WHERE clientId = ?").get(clientId);
    return row ? this.hydrate(row) : null;
  }
  async updateFeedback(id, data) {
    const now = /* @__PURE__ */ new Date();
    const update = this.db.transaction(() => {
      const sets = ["status = @status", "resolvedAt = @resolvedAt", "updatedAt = @updatedAt"];
      const params = {
        id,
        status: data.status,
        resolvedAt: data.resolvedAt ? data.resolvedAt.toISOString() : null,
        updatedAt: now.toISOString()
      };
      if (data.message !== void 0) {
        sets.push("message = @message");
        params.message = data.message;
      }
      const result = this.db.prepare(`UPDATE instafix_feedback SET ${sets.join(", ")} WHERE id = @id`).run(params);
      if (result.changes === 0) {
        throw new StoreNotFoundError(`Feedback ${id} not found`);
      }
      if (data.annotations !== void 0) {
        this.db.prepare("DELETE FROM instafix_annotation WHERE feedbackId = ?").run(id);
        for (const input of data.annotations) {
          this.insertAnnotation(buildAnnotationRecord(input, { id: this.generateId(), feedbackId: id, now }));
        }
      }
    });
    try {
      update();
    } catch (error) {
      if (error instanceof StoreNotFoundError) throw error;
      throw new StorePersistenceError("Failed to update feedback", { cause: error });
    }
    const row = this.db.prepare("SELECT * FROM instafix_feedback WHERE id = ?").get(id);
    if (!row) throw new StoreNotFoundError(`Feedback ${id} not found`);
    return this.hydrate(row);
  }
  async deleteFeedback(id) {
    let result;
    try {
      result = this.db.prepare("DELETE FROM instafix_feedback WHERE id = ?").run(id);
    } catch (error) {
      throw new StorePersistenceError("Failed to delete feedback", { cause: error });
    }
    if (result.changes === 0) {
      throw new StoreNotFoundError(`Feedback ${id} not found`);
    }
  }
  async deleteAllFeedbacks(projectName) {
    try {
      this.db.prepare("DELETE FROM instafix_feedback WHERE projectName = ?").run(projectName);
    } catch (error) {
      throw new StorePersistenceError("Failed to delete feedbacks", { cause: error });
    }
  }
  async verifyProjectOwnership(id, projectName) {
    const row = this.db.prepare("SELECT projectName FROM instafix_feedback WHERE id = ?").get(id);
    return row !== void 0 && row.projectName === projectName;
  }
  /** Close the underlying database connection. */
  close() {
    this.db.close();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SqliteStore,
  StoreDuplicateError,
  StoreNotFoundError,
  StorePersistenceError,
  createInstaFixHandler,
  isStoreDuplicate,
  isStoreNotFound,
  isStorePersistence
});
//# sourceMappingURL=index.cjs.map