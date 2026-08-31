/**
 * Everything needed to build a custom InstaFix store adapter, published —
 * `@instafix/core` is an internal (unpublished) package, so this kit is the
 * supported dependency for third-party adapters.
 *
 * Two ways to implement a store:
 *
 * 1. **Snapshot backends** (KV, flat file, IndexedDB, …): hand
 *    {@link createCollectionStore} a `load`/`persist`/`generateId` trio and
 *    every store semantic (clientId dedup, filtering, pagination, error
 *    contract) comes built-in — an adapter is ~20 lines plus its storage
 *    specifics.
 * 2. **Query backends** (SQL, ORMs): implement {@link InstaFixStore}
 *    directly; {@link buildFeedbackRecord} / {@link buildAnnotationRecord}
 *    handle input→record construction, and the JSDoc on `InstaFixStore`
 *    documents the exact error contract.
 *
 * Either way, verify with the conformance suite from
 * `@instafix/adapter-kit/testing`:
 *
 * @example
 * ```ts
 * import { testInstaFixStore } from "@instafix/adapter-kit/testing";
 * import { MyStore } from "../src/index.js";
 *
 * testInstaFixStore(() => new MyStore());
 * ```
 */

// The store contract and its data model
// Building blocks — record construction, the shared filter pipeline, and
// the full collection-store engine
export type {
  AnchorData,
  AnnotationCreateInput,
  AnnotationPayload,
  AnnotationRecord,
  AnnotationResponse,
  ClosedFeedbackStatus,
  CollectionStore,
  CollectionStoreBackend,
  ConsoleDiagnosticEntry,
  ConsoleDiagnosticLevel,
  DiagnosticsSnapshot,
  FeedbackCreateInput,
  FeedbackPage,
  FeedbackPayload,
  FeedbackQuery,
  FeedbackRecord,
  FeedbackResponse,
  FeedbackResponseList,
  FeedbackStatus,
  FeedbackType,
  FeedbackUpdateInput,
  FilterResult,
  InstaFixStore,
  NetworkDiagnosticEntry,
  OpenFeedbackStatus,
  RectData,
  ScreenshotRegion,
  ScreenshotStorage,
  Serialized,
} from "@instafix/core";
// Status/type constants + helpers
// Store errors — throw these from adapter implementations
export {
  applyFeedbackFilters,
  buildAnnotationRecord,
  buildFeedbackRecord,
  CLOSED_FEEDBACK_STATUSES,
  CONSOLE_DIAGNOSTIC_LEVELS,
  createCollectionStore,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  flattenAnnotation,
  isClosedStatus,
  isStoreDuplicate,
  isStoreNotFound,
  isStorePersistence,
  OPEN_FEEDBACK_STATUSES,
  StoreDuplicateError,
  StoreNotFoundError,
  StorePersistenceError,
  toFeedbackUpdate,
} from "@instafix/core";
