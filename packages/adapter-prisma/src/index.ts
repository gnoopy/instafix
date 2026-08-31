import {
  createStoreHandler,
  type FeedbackCreateInput,
  type FeedbackPage,
  type FeedbackPayload,
  type FeedbackQuery,
  type FeedbackRecord,
  type FeedbackStatus,
  type FeedbackType,
  type FeedbackUpdateInput,
  hasOwn,
  type InstaFixHandler,
  type InstaFixStore,
  type ScreenshotStorage,
  type StoreHandlerOptions,
} from "@instafix/core";

export type {
  FeedbackDeleteInput,
  FeedbackPatchInput,
  GetQueryInput,
  InstaFixHandler,
  InstaFixHttpMethod,
  InstaFixStore,
  ScreenshotStorage,
} from "@instafix/core";
export {
  flattenAnnotation,
  isStorePersistence,
  StoreDuplicateError,
  StoreNotFoundError,
  StorePersistenceError,
} from "@instafix/core";

/**
 * @deprecated The create wire shape is core's `FeedbackPayload` — import
 * that instead. This alias is kept for one release cycle.
 */
export type FeedbackCreateSchemaInput = FeedbackPayload;
export type {
  DiscordWebhookPayload,
  SlackWebhookPayload,
  WebhookConfig,
  WebhookPayloadMap,
  WebhookType,
} from "@instafix/core";
export { dispatchWebhook, dispatchWebhooks } from "@instafix/core";

// ---------------------------------------------------------------------------
// Minimal PrismaClient shape expected by this adapter
// ---------------------------------------------------------------------------

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
export interface PrismaModelDelegate {
  create(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  deleteMany(args: unknown): Promise<unknown>;
  count(args: unknown): Promise<number>;
}

/**
 * Compile-time regression guard for #99 — intentionally in `src/` because the
 * package's `check` script (`tsc --noEmit`) only type-checks `src/`, and
 * vitest transpiles tests without type-checking.
 *
 * `GeneratedDelegateProbe` mirrors a real generated client: every method
 * declares args NARROWER than `unknown`. With method syntax the conditional
 * below resolves to `true`; if `PrismaModelDelegate` ever regresses to
 * function-property syntax (contravariant under `strictFunctionTypes`), it
 * resolves to `false` and the `AssertTrue` constraint fails the build.
 */
type AssertTrue<T extends true> = T;
interface GeneratedDelegateProbe {
  create(args: { data: unknown; include?: unknown }): Promise<{ id: string }>;
  findMany(args: { where?: unknown; include?: unknown }): Promise<{ id: string }[]>;
  findUnique(args: { where: unknown }): Promise<{ id: string } | null>;
  update(args: { where: unknown; data: unknown }): Promise<{ id: string }>;
  delete(args: { where: unknown }): Promise<{ id: string }>;
  deleteMany(args: { where?: unknown }): Promise<{ count: number }>;
  count(args: { where?: unknown }): Promise<number>;
}
type _AssertDelegateBivariance = AssertTrue<GeneratedDelegateProbe extends PrismaModelDelegate ? true : false>;

/**
 * Minimal Prisma client shape expected by this adapter.
 * Consumers pass their own `PrismaClient` instance at runtime — this interface
 * defines the subset of methods the adapter actually uses, so it can be
 * referenced in handler option types without importing `@prisma/client`.
 */
export interface InstaFixPrismaClient {
  instafixFeedback: PrismaModelDelegate;
}

// ---------------------------------------------------------------------------
// PrismaStore — InstaFixStore implementation backed by Prisma
// ---------------------------------------------------------------------------

const INCLUDE_ANNOTATIONS = { annotations: true } as const;

/**
 * Prisma datasource providers whose generated client exposes `mode?: QueryMode`
 * on string filters. Verified against Prisma 6.x by inspecting the generated
 * `StringFilter` type per provider:
 *   - postgresql, mongodb, cockroachdb → emit `mode?: QueryMode`
 *   - mysql, sqlite, sqlserver → no `mode` field; passing it raises
 *     `PrismaClientValidationError: Unknown argument 'mode'` at runtime.
 * `postgres` is kept as a defensive alias in case `_activeProvider` ever
 * surfaces the legacy spelling.
 */
const PROVIDERS_SUPPORTING_INSENSITIVE_MODE: ReadonlySet<string> = new Set([
  "postgresql",
  "postgres",
  "mongodb",
  "cockroachdb",
]);

/** Internal shape used to probe `PrismaClient` for the active provider. */
interface PrismaClientProbe {
  _activeProvider?: unknown;
  _engineConfig?: { activeProvider?: unknown };
  _engine?: { config?: { activeProvider?: unknown } };
}

/**
 * Best-effort detection of the active Prisma provider for a runtime client.
 *
 * The provider is not part of any public API on `PrismaClient`. We probe a
 * few known internal locations across Prisma 5.x and 6.x and fall back to
 * `null` (treated as "unknown — assume default Postgres-style behaviour")
 * when none match.
 */
function detectActiveProvider(prisma: unknown): string | null {
  try {
    const candidate = prisma as PrismaClientProbe | null | undefined;
    const fromActive = candidate?._activeProvider;
    if (typeof fromActive === "string") return fromActive;
    const fromEngineConfig = candidate?._engineConfig?.activeProvider;
    if (typeof fromEngineConfig === "string") return fromEngineConfig;
    const fromEngine = candidate?._engine?.config?.activeProvider;
    if (typeof fromEngine === "string") return fromEngine;
    return null;
  } catch {
    return null;
  }
}

/**
 * Options accepted by `PrismaStore`.
 */
export interface PrismaStoreOptions {
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

/** `where` filter shape passed to `findMany` / `count`. Each field maps to a typed Prisma filter. */
interface FeedbackWhereInput {
  projectName: string;
  type?: FeedbackType;
  // Exact match (`status`) or bucket match (`{ in: [...] }` from `statuses`).
  status?: FeedbackStatus | { in: FeedbackStatus[] };
  url?: string;
  urlPattern?: string;
  message?: { contains: string; mode?: "insensitive" };
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
export class PrismaStore implements InstaFixStore {
  /** @internal */
  private prisma: InstaFixPrismaClient;
  private readonly screenshotStorage: ScreenshotStorage | undefined;
  /** Module-level flag would leak across PrismaStore instances in tests; use per-instance. */
  private inlineFallbackWarned = false;
  /** @internal */
  private caseInsensitiveSearch: boolean;

  constructor(prisma: InstaFixPrismaClient, options: PrismaStoreOptions = {}) {
    this.prisma = prisma;
    this.screenshotStorage = options.screenshotStorage;
    if (typeof options.caseInsensitiveSearch === "boolean") {
      this.caseInsensitiveSearch = options.caseInsensitiveSearch;
    } else {
      const provider = detectActiveProvider(prisma);
      // When the provider can't be detected, default to `false`: `contains`
      // without `mode` works on every Prisma provider; `mode: "insensitive"`
      // throws on MySQL/SQLite/SQL Server. Trades non-ASCII case-insensitivity
      // on undetectable Postgres clients (rare — _activeProvider is set on
      // every real Prisma 5/6 client) for not crashing on the others.
      this.caseInsensitiveSearch = provider !== null && PROVIDERS_SUPPORTING_INSENSITIVE_MODE.has(provider);
    }
  }

  async createFeedback(data: FeedbackCreateInput): Promise<FeedbackRecord> {
    const screenshotUrl = await this.persistScreenshot(data.screenshotDataUrl, data.clientId);

    return (await this.prisma.instafixFeedback.create({
      data: {
        projectName: data.projectName,
        type: data.type,
        message: data.message,
        status: data.status,
        url: data.url,
        urlPattern: data.urlPattern ?? null,
        screenshotUrl,
        // Persisted as JSON when the model has a `screenshotRegion Json?`
        // column — same omit-when-null contract as `diagnostics` below, so
        // hosts that haven't run `npx instafix sync` keep working.
        ...(data.screenshotRegion ? { screenshotRegion: data.screenshotRegion } : {}),
        // Persisted as JSON when the model has a `diagnostics Json?` column.
        // Hosts that haven't run `npx instafix sync` keep their schema as-is
        // and Prisma will throw if we pass an unknown column, so omit the
        // key entirely when diagnostics is null.
        ...(data.diagnostics ? { diagnostics: data.diagnostics } : {}),
        viewport: data.viewport,
        userAgent: data.userAgent,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        clientId: data.clientId,
        annotations: {
          create: data.annotations.map((ann) => ({
            cssSelector: ann.cssSelector,
            xpath: ann.xpath,
            textSnippet: ann.textSnippet,
            elementTag: ann.elementTag,
            elementId: ann.elementId,
            textPrefix: ann.textPrefix,
            textSuffix: ann.textSuffix,
            fingerprint: ann.fingerprint,
            neighborText: ann.neighborText,
            anchorKey: ann.anchorKey ?? null,
            xPct: ann.xPct,
            yPct: ann.yPct,
            wPct: ann.wPct,
            hPct: ann.hPct,
            scrollX: ann.scrollX,
            scrollY: ann.scrollY,
            viewportW: ann.viewportW,
            viewportH: ann.viewportH,
            devicePixelRatio: ann.devicePixelRatio,
            // Persisted as JSON when the model has a `target Json?` column —
            // same omit-when-null contract as `screenshotRegion`/`diagnostics`
            // above, so hosts that haven't run `npx instafix sync` keep working.
            ...(ann.target ? { target: ann.target } : {}),
          })),
        },
      },
      include: INCLUDE_ANNOTATIONS,
    })) as FeedbackRecord;
  }

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
  private async persistScreenshot(dataUrl: string | null | undefined, clientId: string): Promise<string | null> {
    if (!dataUrl) return null;

    if (this.screenshotStorage) {
      try {
        // Use clientId as the upload-time identifier — the feedback row's
        // own id isn't created yet and clientId is unique + stable.
        // NOTE: clientId is client-supplied; storage implementations that
        // map it to a filesystem path MUST sanitize against path traversal.
        const { url } = await this.screenshotStorage.upload(dataUrl, {
          feedbackId: clientId,
          mimeType: "image/jpeg",
        });
        return url;
      } catch (err) {
        console.warn(
          "[instafix] screenshotStorage.upload failed — feedback will be saved without a screenshot. Wrap your storage's upload to handle this differently:",
          err,
        );
        return null;
      }
    }

    if (!this.inlineFallbackWarned) {
      this.inlineFallbackWarned = true;
      console.warn(
        "[instafix] enableScreenshot is on but no `screenshotStorage` is configured — base64 data URLs will be persisted inline on Feedback.screenshotUrl. Configure a ScreenshotStorage (S3/R2/…) for production.",
      );
    }
    return dataUrl;
  }

  async findByClientId(clientId: string): Promise<FeedbackRecord | null> {
    return (await this.prisma.instafixFeedback.findUnique({
      where: { clientId },
      include: INCLUDE_ANNOTATIONS,
    })) as FeedbackRecord | null;
  }

  async getFeedbacks(query: FeedbackQuery): Promise<FeedbackPage> {
    const { projectName, type, status, statuses, search, url, urlPattern, page = 1, limit = 50 } = query;

    const where: FeedbackWhereInput = { projectName };
    if (type) where.type = type;
    // Bucket filter (`statuses`) wins over the exact `status` filter; an empty
    // array is treated as absent so no status constraint is applied.
    if (statuses && statuses.length > 0) {
      where.status = { in: [...statuses] };
    } else if (status) {
      where.status = status;
    }
    if (url) where.url = url;
    if (urlPattern) where.urlPattern = urlPattern;
    if (search) {
      where.message = this.caseInsensitiveSearch ? { contains: search, mode: "insensitive" } : { contains: search };
    }

    const [feedbacks, total] = await Promise.all([
      this.prisma.instafixFeedback.findMany({
        where,
        include: INCLUDE_ANNOTATIONS,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.instafixFeedback.count({ where }),
    ]);

    return { feedbacks: feedbacks as FeedbackRecord[], total };
  }

  async updateFeedback(id: string, data: FeedbackUpdateInput): Promise<FeedbackRecord> {
    return (await this.prisma.instafixFeedback.update({
      where: { id },
      data: {
        status: data.status,
        resolvedAt: data.resolvedAt,
        ...(data.message !== undefined ? { message: data.message } : {}),
        // Reconnect (G7): replace the whole annotation set in the same
        // transaction Prisma builds for this nested write — delete every
        // existing row for this feedback, then create the new one(s).
        ...(data.annotations !== undefined
          ? {
              annotations: {
                deleteMany: {},
                create: data.annotations.map((ann) => ({
                  cssSelector: ann.cssSelector,
                  xpath: ann.xpath,
                  textSnippet: ann.textSnippet,
                  elementTag: ann.elementTag,
                  elementId: ann.elementId,
                  textPrefix: ann.textPrefix,
                  textSuffix: ann.textSuffix,
                  fingerprint: ann.fingerprint,
                  neighborText: ann.neighborText,
                  anchorKey: ann.anchorKey ?? null,
                  xPct: ann.xPct,
                  yPct: ann.yPct,
                  wPct: ann.wPct,
                  hPct: ann.hPct,
                  scrollX: ann.scrollX,
                  scrollY: ann.scrollY,
                  viewportW: ann.viewportW,
                  viewportH: ann.viewportH,
                  devicePixelRatio: ann.devicePixelRatio,
                  ...(ann.target ? { target: ann.target } : {}),
                })),
              },
            }
          : {}),
      },
      include: INCLUDE_ANNOTATIONS,
    })) as FeedbackRecord;
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.prisma.instafixFeedback.delete({ where: { id } });
  }

  async deleteAllFeedbacks(projectName: string): Promise<void> {
    await this.prisma.instafixFeedback.deleteMany({ where: { projectName } });
  }

  /**
   * Verify that a feedback record with `id` belongs to `projectName`.
   * Returns `true` when the record exists and matches, `false` otherwise.
   */
  async verifyProjectOwnership(id: string, projectName: string): Promise<boolean> {
    const record = (await this.prisma.instafixFeedback.findUnique({
      where: { id },
      // Only need projectName for the check — skip annotations
    })) as { projectName: string } | null;
    return record !== null && record.projectName === projectName;
  }
}

// ---------------------------------------------------------------------------
// Handler options — backwards compatible
// ---------------------------------------------------------------------------

export interface HandlerOptions extends Omit<StoreHandlerOptions, "store" | "mapUnknownError"> {
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
   * Override case-insensitive search behaviour for the built-in `PrismaStore`.
   *
   * Only applied when `prisma` is provided (not when a custom `store` is
   * passed). See `PrismaStoreOptions.caseInsensitiveSearch` for details on
   * auto-detection and per-provider semantics.
   */
  caseInsensitiveSearch?: boolean;
}

function isTableNotFoundError(error: unknown): error is { code: "P2021" } {
  return hasOwn(error, "code") && (error as { code: unknown }).code === "P2021";
}

/**
 * Return an actionable error message for known Prisma error codes.
 * Falls back to a generic message for unknown errors.
 */
function actionableErrorMessage(error: unknown): string {
  if (isTableNotFoundError(error)) {
    return "Table 'InstaFixFeedback' not found. Run 'npx prisma db push' to create it.";
  }
  return "Internal server error";
}

/**
 * Create request handlers for the InstaFix API endpoint.
 *
 * Accepts either a `store` (abstract) or a `prisma` client (backwards compatible).
 * When `prisma` is provided without `store`, it is wrapped in a `PrismaStore`.
 * All request handling (auth, CORS, validation, webhooks) is generic —
 * this wraps the shared `createStoreHandler` factory from core.
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
export function createInstaFixHandler({
  prisma,
  store: providedStore,
  screenshotStorage,
  caseInsensitiveSearch,
  ...rest
}: HandlerOptions): InstaFixHandler {
  if (!providedStore && !prisma) {
    throw new Error("[instafix] createInstaFixHandler requires either `store` or `prisma`.");
  }

  // Safe: the throw above guarantees at least one is defined
  const store: InstaFixStore =
    providedStore ??
    new PrismaStore(prisma as NonNullable<typeof prisma>, {
      screenshotStorage,
      ...(typeof caseInsensitiveSearch === "boolean" ? { caseInsensitiveSearch } : {}),
    });

  return createStoreHandler({ store, mapUnknownError: actionableErrorMessage, ...rest });
}
