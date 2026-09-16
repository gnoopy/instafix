import { type FeedbackResponse, type PromptRegion, referencedRegionNumbers } from "@instafix/core";
import { Z_INDEX_MAX } from "./constants.js";
import type { AnnotatedScreenshot } from "./screenshot.js";

interface RegionEntry extends PromptRegion {
  draft: boolean;
  image?: string;
  capture?: Promise<void>;
  signature?: string;
  badge?: HTMLElement;
  bounds?: { top: number; left: number };
}

/** One namespace per project and page. Numbers survive sorting, filtering and widget rebuilds. */
export class RegionContext {
  private entries: RegionEntry[] = [];
  private counters = new Map<string, number>();
  private readonly key: string;

  constructor(
    projectName: string,
    private readonly getUrl: () => string,
  ) {
    this.key = `instafix:regions:v1:${projectName}`;
    try {
      const stored = JSON.parse(sessionStorage.getItem(this.key) ?? "null");
      if (stored && Array.isArray(stored.entries) && Array.isArray(stored.counters)) {
        this.counters = new Map(stored.counters);
        this.entries = stored.entries.filter(
          (entry: RegionEntry) =>
            Number.isSafeInteger(entry.number) &&
            entry.number > 0 &&
            typeof entry.feedback?.id === "string" &&
            typeof entry.feedback.url === "string" &&
            Array.isArray(entry.feedback.annotations),
        );
      }
    } catch {
      /* Storage is optional; numbers remain stable in memory. */
    }
    for (const entry of this.entries) {
      this.counters.set(entry.feedback.url, Math.max(this.counters.get(entry.feedback.url) ?? 0, entry.number));
    }
  }

  private persist(): void {
    try {
      sessionStorage.setItem(
        this.key,
        JSON.stringify({
          counters: [...this.counters],
          entries: this.entries.map(({ number, feedback, draft, screenshotFilename, bounds }) => ({
            number,
            feedback: feedback.screenshotUrl?.startsWith("data:") ? { ...feedback, screenshotUrl: null } : feedback,
            draft,
            screenshotFilename,
            bounds,
          })),
        }),
      );
    } catch {
      /* Quota/private browsing: keep the live session functional. */
    }
  }

  remember(feedback: FeedbackResponse): number {
    const existing = this.entries.find(
      (entry) => entry.feedback.id === feedback.id && entry.feedback.url === feedback.url,
    );
    if (existing) {
      if (existing.feedback.screenshotUrl !== feedback.screenshotUrl) {
        delete existing.screenshotFilename;
        delete existing.image;
      }
      if (feedback.screenshotUrl?.startsWith("data:image/")) existing.image = feedback.screenshotUrl;
      existing.feedback = feedback;
      this.persist();
      return existing.number;
    }
    const number = (this.counters.get(feedback.url) ?? 0) + 1;
    this.counters.set(feedback.url, number);
    const entry: RegionEntry = { number, feedback, draft: false };
    if (feedback.screenshotUrl?.startsWith("data:image/")) entry.image = feedback.screenshotUrl;
    this.entries.push(entry);
    this.persist();
    return number;
  }

  begin(feedback: FeedbackResponse): string {
    const id = `selection-${typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    feedback = { ...feedback, id, url: this.getUrl() };
    this.remember(feedback);
    const entry = this.entries.find((item) => item.feedback.id === id);
    if (entry) entry.draft = true;
    this.persist();
    return id;
  }

  update(
    id: string,
    feedback: FeedbackResponse,
    rect: DOMRect,
    capture: () => Promise<AnnotatedScreenshot | null>,
    captureKey = "",
  ): void {
    const entry = this.entries.find((item) => item.feedback.id === id && item.draft);
    if (!entry) return;
    entry.feedback = { ...feedback, id, url: entry.feedback.url, screenshotRegion: entry.feedback.screenshotRegion };
    entry.bounds = { top: rect.top + window.scrollY, left: rect.right + window.scrollX };
    this.showDrafts();
    const signature = JSON.stringify([
      captureKey,
      feedback.annotations.map(
        ({ id: _id, createdAt: _createdAt, feedbackId: _feedbackId, ...annotation }) => annotation,
      ),
      rect.x,
      rect.y,
      rect.width,
      rect.height,
    ]);
    if (entry.signature !== signature) {
      entry.signature = signature;
      delete entry.image;
      delete entry.screenshotFilename;
      entry.feedback.screenshotRegion = null;
      entry.capture = Promise.resolve()
        .then(capture)
        .then((shot) => {
          if (entry.signature !== signature || !entry.draft) return;
          if (shot) {
            entry.image = shot.dataUrl;
            entry.feedback.screenshotRegion = shot.region;
            this.persist();
          }
        })
        .catch(() => {
          /* Missing images are explicitly reported in the prompt. */
        });
    }
    this.persist();
  }

  /** Submission keeps the selection's number instead of allocating a second one. */
  commit(id: string, feedback: FeedbackResponse): void {
    const entry = this.entries.find((item) => item.feedback.id === id);
    if (!entry) {
      this.remember(feedback);
      return;
    }
    this.entries = this.entries.filter((item) => item === entry || item.feedback.id !== feedback.id);
    entry.feedback = feedback;
    entry.draft = false;
    entry.badge?.remove();
    delete entry.badge;
    delete entry.image;
    if (feedback.screenshotUrl?.startsWith("data:image/")) entry.image = feedback.screenshotUrl;
    delete entry.screenshotFilename;
    this.persist();
  }

  remove(id: string): void {
    for (const entry of this.entries.filter((item) => item.feedback.id === id)) entry.badge?.remove();
    this.entries = this.entries.filter((entry) => entry.feedback.id !== id);
    // The counter deliberately never decrements: deleted numbers are not reused.
    this.persist();
  }

  regions(): PromptRegion[] {
    return this.entries.map(({ number, feedback, screenshotFilename }) => ({ number, feedback, screenshotFilename }));
  }

  feedback(id: string): FeedbackResponse | undefined {
    return this.entries.find((entry) => entry.feedback.id === id)?.feedback;
  }

  /** Export only the current selections and explicitly referenced same-page images. */
  async prepare(feedbacks: FeedbackResponse[]): Promise<void> {
    const needed = new Set<RegionEntry>();
    for (const feedback of feedbacks) {
      this.remember(feedback);
      const references = referencedRegionNumbers(feedback.message);
      for (const entry of this.entries) {
        if (
          entry.feedback.url === feedback.url &&
          (entry.feedback.id === feedback.id || references.includes(entry.number))
        )
          needed.add(entry);
      }
    }
    await Promise.all([...needed].map((entry) => entry.capture));
    for (const entry of needed) {
      if (!entry.image || entry.screenshotFilename) continue;
      const mime = /^data:image\/([a-zA-Z0-9.+-]+);/.exec(entry.image)?.[1] ?? "jpeg";
      const extension = mime === "jpeg" ? "jpg" : mime === "svg+xml" ? "svg" : mime.replace(/[^a-zA-Z0-9]/g, "");
      const revision = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const filename = `instafix-region-${entry.number}-${entry.feedback.id.replace(/[^A-Za-z0-9._-]/g, "_")}-${revision}.${extension}`;
      const link = document.createElement("a");
      link.href = entry.image;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      entry.screenshotFilename = filename;
    }
    this.persist();
  }

  showDrafts(): void {
    for (const entry of this.entries) {
      if (!entry.draft || !entry.bounds) continue;
      if (!entry.badge) {
        const badge = document.createElement("span");
        badge.dataset.instafixIgnore = "true";
        badge.dataset.instafixRegion = String(entry.number);
        badge.textContent = `#${entry.number}`;
        badge.style.cssText = `position:absolute;z-index:${Z_INDEX_MAX};padding:3px 7px;border-radius:6px;background:#172554;color:white;font:600 12px/1.5 sans-serif;pointer-events:none;`;
        document.body.appendChild(badge);
        entry.badge = badge;
      }
      entry.badge.style.top = `${entry.bounds.top - 26}px`;
      entry.badge.style.left = `${entry.bounds.left - 30}px`;
      entry.badge.hidden = entry.feedback.url !== this.getUrl();
    }
  }

  destroy(): void {
    for (const entry of this.entries) entry.badge?.remove();
  }
}
