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
var OPEN_FEEDBACK_STATUSES = ["open", "in_progress"];
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
  return hasErrorCode(error, "P2025");
}
function isStoreDuplicate(error) {
  if (error instanceof StoreDuplicateError) return true;
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
    target: ann.target ?? null
  };
}
var CONSOLE_DIAGNOSTIC_LEVELS = ["log", "info", "warn", "error"];

export {
  FEEDBACK_TYPES,
  FEEDBACK_STATUSES,
  CLOSED_FEEDBACK_STATUSES,
  OPEN_FEEDBACK_STATUSES,
  isClosedStatus,
  toFeedbackUpdate,
  StoreNotFoundError,
  StoreDuplicateError,
  StorePersistenceError,
  isStoreNotFound,
  isStoreDuplicate,
  isStorePersistence,
  flattenAnnotation,
  CONSOLE_DIAGNOSTIC_LEVELS
};
//# sourceMappingURL=chunk-XNS4LJMM.js.map