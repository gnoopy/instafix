// ../core/src/type-utils.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function hasOwn(value, key) {
  return isRecord(value) && key in value;
}

// ../core/src/types.ts
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
function isStorePersistence(error) {
  if (error instanceof StorePersistenceError) return true;
  return hasErrorCode(error, "STORE_PERSISTENCE");
}

// ../core/src/filters.ts
var DEFAULT_LIMIT = 50;
var MAX_LIMIT = 100;
function applyFeedbackFilters(items, query) {
  let results = items.filter((f) => f.projectName === query.projectName);
  if (query.type) results = results.filter((f) => f.type === query.type);
  if (query.statuses && query.statuses.length > 0) {
    const allowed = query.statuses;
    results = results.filter((f) => allowed.includes(f.status));
  } else if (query.status) {
    results = results.filter((f) => f.status === query.status);
  }
  if (query.url) results = results.filter((f) => f.url === query.url);
  if (query.urlPattern) results = results.filter((f) => f.urlPattern === query.urlPattern);
  if (query.search) {
    const s = query.search.toLowerCase();
    results = results.filter((f) => f.message.toLowerCase().includes(s));
  }
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = results.length;
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
  const start = (page - 1) * limit;
  return { feedbacks: results.slice(start, start + limit), total };
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
    target: input.target ?? null
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
function createCollectionStore(backend) {
  return {
    async createFeedback(data) {
      const feedbacks = await backend.load();
      const existing = feedbacks.find((f) => f.clientId === data.clientId);
      if (existing) return existing;
      const record = buildFeedbackRecord(data, {
        id: backend.generateId(),
        annotationId: () => backend.generateId()
      });
      feedbacks.unshift(record);
      try {
        await backend.persist(feedbacks);
      } catch (err) {
        if (!record.screenshotUrl) throw err;
        record.screenshotUrl = null;
        await backend.persist(feedbacks);
      }
      return record;
    },
    async getFeedbacks(query) {
      return applyFeedbackFilters(await backend.load(), query);
    },
    async findByClientId(clientId) {
      return (await backend.load()).find((f) => f.clientId === clientId) ?? null;
    },
    async updateFeedback(id, data) {
      const feedbacks = await backend.load();
      const fb = feedbacks.find((f) => f.id === id);
      if (!fb) throw new StoreNotFoundError();
      fb.status = data.status;
      fb.resolvedAt = data.resolvedAt;
      if (data.message !== void 0) fb.message = data.message;
      if (data.annotations !== void 0) {
        const now = /* @__PURE__ */ new Date();
        fb.annotations = data.annotations.map(
          (ann) => buildAnnotationRecord(ann, { id: backend.generateId(), feedbackId: fb.id, now })
        );
      }
      fb.updatedAt = /* @__PURE__ */ new Date();
      await backend.persist(feedbacks);
      return fb;
    },
    async deleteFeedback(id) {
      const feedbacks = await backend.load();
      const idx = feedbacks.findIndex((f) => f.id === id);
      if (idx === -1) throw new StoreNotFoundError();
      feedbacks.splice(idx, 1);
      await backend.persist(feedbacks);
    },
    async deleteAllFeedbacks(projectName) {
      const feedbacks = await backend.load();
      await backend.persist(feedbacks.filter((f) => f.projectName !== projectName));
    },
    async verifyProjectOwnership(id, projectName) {
      const fb = (await backend.load()).find((f) => f.id === id);
      return fb !== void 0 && fb.projectName === projectName;
    }
  };
}

// src/index.ts
var MemoryStore = class {
  feedbacks = [];
  idCounter = 1;
  engine = createCollectionStore({
    load: () => this.feedbacks,
    persist: (next) => {
      this.feedbacks = next;
    },
    generateId: () => `mem-${this.idCounter++}-${Date.now().toString(36)}`
  });
  createFeedback(data) {
    return this.engine.createFeedback(data);
  }
  getFeedbacks(query) {
    return this.engine.getFeedbacks(query);
  }
  findByClientId(clientId) {
    return this.engine.findByClientId(clientId);
  }
  updateFeedback(id, data) {
    return this.engine.updateFeedback(id, data);
  }
  deleteFeedback(id) {
    return this.engine.deleteFeedback(id);
  }
  deleteAllFeedbacks(projectName) {
    return this.engine.deleteAllFeedbacks(projectName);
  }
  verifyProjectOwnership(id, projectName) {
    return this.engine.verifyProjectOwnership(id, projectName);
  }
  /** Remove all data from this store instance. */
  clear() {
    this.feedbacks = [];
    this.idCounter = 1;
  }
};
export {
  MemoryStore,
  StoreDuplicateError,
  StoreNotFoundError,
  StorePersistenceError,
  isStorePersistence
};
//# sourceMappingURL=index.js.map