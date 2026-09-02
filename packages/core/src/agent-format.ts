/**
 * Deterministic Markdown formatter — turns feedbacks into text any coding
 * agent (Claude Code, Cursor, Copilot, ...) can act on directly. Pure and
 * framework-agnostic: no DOM, no clipboard, no UI. `AgentExporter` is the
 * seam for adding other agent-specific formats later without touching call
 * sites.
 */

import type { AnnotationResponse, FeedbackResponse } from "./types.js";
import { resolveAnnotationTarget } from "./types.js";

const MAX_FIELD_LEN = 300;
const MAX_MESSAGE_LEN = 4000;
const MAX_ITEMS = 200;
/** Hard cap on targets rendered per feedback — mirrors the widget's marquee cap. */
const MAX_TARGETS_PER_ITEM = 20;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

/**
 * Wrap a value in a Markdown inline code span, choosing a backtick fence
 * longer than the longest backtick run already inside the value (CommonMark
 * code-span rule) so arbitrary DOM-derived strings can never break out of
 * the span or merge with surrounding document structure.
 */
function inlineCode(value: string): string {
  const trimmed = truncate(value, MAX_FIELD_LEN);
  const runs = trimmed.match(/`+/g) ?? [];
  const longestRun = runs.reduce((max, run) => Math.max(max, run.length), 0);
  const fence = "`".repeat(longestRun + 1);
  const needsPad = trimmed.startsWith("`") || trimmed.endsWith("`") || trimmed.length === 0;
  const pad = needsPad ? " " : "";
  return `${fence}${pad}${trimmed}${pad}${fence}`;
}

/** Safe to interpolate inside a `"..."` label — no literal quotes or newlines. */
function quotedLabel(value: string, max = 60): string {
  return truncate(value, max)
    .replace(/"/g, "'")
    .replace(/[\r\n]+/g, " ");
}

/**
 * Render arbitrary (untrusted, possibly adversarial) user text as a
 * Markdown blockquote — every line, including blank ones, is prefixed with
 * `> ` so multi-line notes can never terminate the quote early and merge
 * back into document structure (headings, fences, etc. inside the note stay
 * inert quoted text).
 */
function blockquote(value: string): string {
  const capped = truncate(value, MAX_MESSAGE_LEN);
  const lines = capped.split(/\r\n|\r|\n/);
  return lines.map((line) => (line.length === 0 ? ">" : `> ${line}`)).join("\n");
}

// ---------------------------------------------------------------------------
// Per-target rendering — a feedback carries one or more targets
// (`annotations[]`); each is `element`, `text`, or `area` kind (G4).
// ---------------------------------------------------------------------------

function targetKindLabel(ann: AnnotationResponse): string {
  const target = resolveAnnotationTarget(ann);
  const tag = ann.elementTag.toLowerCase();
  switch (target.kind) {
    case "text":
      return `text in ${inlineCode(tag)}`;
    case "area":
      return "area (no element — page region)";
    default: {
      const label = ann.textSnippet.trim() || (ann.elementId ? `#${ann.elementId}` : "");
      return label ? `element ${inlineCode(tag)} "${quotedLabel(label)}"` : `element ${inlineCode(tag)}`;
    }
  }
}

function quoteLine(ann: AnnotationResponse): string | null {
  const target = resolveAnnotationTarget(ann);
  if (target.kind !== "text") return null;
  const quote = truncate(target.quote.trim(), MAX_FIELD_LEN);
  if (!quote) return null;
  const prefix = quotedLabel(target.quotePrefix, 32);
  const suffix = quotedLabel(target.quoteSuffix, 32);
  return `Quote: "${prefix}[${quotedLabel(quote, 200)}]${suffix}"`;
}

function selectorLines(ann: AnnotationResponse): string[] {
  const target = resolveAnnotationTarget(ann);
  if (target.kind === "area") return [];
  const lines: string[] = [];
  if (ann.anchorKey) lines.push(`semantic: ${inlineCode(ann.anchorKey)}`);
  if (ann.elementId) lines.push(`id: ${inlineCode(`#${ann.elementId}`)}`);
  if (ann.cssSelector) lines.push(`css: ${inlineCode(ann.cssSelector)}`);
  if (ann.xpath) lines.push(`xpath: ${inlineCode(ann.xpath)}`);
  return lines;
}

/** Content only (no leading "Context: " label) — callers own the label/casing. */
function contextContent(ann: AnnotationResponse): string | null {
  const parts: string[] = [];
  if (ann.neighborText.trim()) parts.push(`nearby text: "${quotedLabel(ann.neighborText, MAX_FIELD_LEN)}"`);
  const prefix = ann.textPrefix.trim();
  const suffix = ann.textSuffix.trim();
  if (prefix || suffix) {
    parts.push(`surrounding text: "${quotedLabel(prefix, 80)}[…]${quotedLabel(suffix, 80)}"`);
  }
  return parts.length > 0 ? parts.join("; ") : null;
}

/** Content only (no leading "Bounds: " label) — callers own the label/casing. */
function boundsContent(ann: AnnotationResponse): string {
  const target = resolveAnnotationTarget(ann);
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const relativeTo = target.kind === "area" ? "viewport" : "target element";
  return `x=${pct(ann.xPct)} y=${pct(ann.yPct)} w=${pct(ann.wPct)} h=${pct(ann.hPct)} (relative to ${relativeTo})`;
}

/** Render one target as flat top-level lines (used when a feedback has exactly one). */
function renderSingleTarget(lines: string[], ann: AnnotationResponse): void {
  lines.push(`Target: ${targetKindLabel(ann)}`);
  const quote = quoteLine(ann);
  if (quote) lines.push(quote);
  const selLines = selectorLines(ann);
  if (selLines.length > 0) {
    lines.push("Selectors:");
    for (const l of selLines) lines.push(`- ${l}`);
  }
  const ctx = contextContent(ann);
  if (ctx) lines.push(`Context: ${ctx}`);
  lines.push(`Bounds: ${boundsContent(ann)}`);
}

/** Render N>1 targets as a nested list under one feedback item (multi-select, G3). */
function renderMultipleTargets(lines: string[], annotations: AnnotationResponse[]): void {
  const shown = annotations.slice(0, MAX_TARGETS_PER_ITEM);
  lines.push(`Targets (${annotations.length}):`);
  shown.forEach((ann, i) => {
    lines.push(`${i + 1}. ${targetKindLabel(ann)}`);
    const quote = quoteLine(ann);
    if (quote) lines.push(`   ${quote}`);
    const selLines = selectorLines(ann);
    for (const l of selLines) lines.push(`   - ${l}`);
    const ctx = contextContent(ann);
    if (ctx) lines.push(`   Context: ${ctx}`);
    lines.push(`   Bounds: ${boundsContent(ann)}`);
  });
  if (annotations.length > shown.length) {
    lines.push(`(${annotations.length - shown.length} more target(s) omitted)`);
  }
}

function viewportLabel(fb: FeedbackResponse): string | null {
  if (!fb.viewport) return null;
  const viewport = truncate(fb.viewport, MAX_FIELD_LEN);
  const dpr = fb.annotations[0]?.devicePixelRatio;
  return dpr && dpr !== 1 ? `${viewport} @${dpr}x` : viewport;
}

function pageUrl(fb: FeedbackResponse): string {
  return truncate(fb.url, MAX_FIELD_LEN);
}

/** Cap on console/network entries rendered per feedback — keeps a noisy page from dominating the document. */
const MAX_DIAGNOSTIC_ENTRIES = 10;

/**
 * `screenshotUrl` as a local disk path when it looks like one of ours
 * (`/api/instafix/screenshots/<file>`, written by `@instafix/adapter-fs`) —
 * a coding agent with file access can open that path directly. Any other
 * URL (a real HTTP endpoint, an S3/CDN link from a configured
 * `ScreenshotStorage`) is shown as-is; it's still useful context for a
 * human even when an agent can't fetch it itself.
 */
function screenshotLine(fb: FeedbackResponse): string | null {
  if (!fb.screenshotUrl) return null;
  if (fb.screenshotUrl.startsWith("data:")) return null; // inline data URLs are too long to be useful as text
  const localMatch = /^\/api\/instafix\/screenshots\/(.+)$/.exec(fb.screenshotUrl);
  const shown = localMatch ? `.instafix/screenshots/${localMatch[1]}` : truncate(fb.screenshotUrl, MAX_FIELD_LEN);
  return `Screenshot: ${inlineCode(shown)}`;
}

/** Render captured console errors/warnings and failed network requests, if any were captured. */
function diagnosticsLines(fb: FeedbackResponse): string[] {
  const diagnostics = fb.diagnostics;
  if (!diagnostics) return [];
  const lines: string[] = [];

  const notable = diagnostics.console.filter((entry) => entry.level === "error" || entry.level === "warn");
  if (notable.length > 0) {
    const shown = notable.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push("Console errors/warnings (most recent last):");
    lines.push("```");
    for (const entry of shown) lines.push(`[${entry.level}] ${truncate(entry.message, MAX_FIELD_LEN)}`);
    lines.push("```");
  }

  if (diagnostics.network.length > 0) {
    const shown = diagnostics.network.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push("Failed network requests:");
    for (const entry of shown) {
      const status = entry.status === 0 ? "network error" : `HTTP ${entry.status}`;
      lines.push(`- ${entry.method} ${inlineCode(entry.url)} — ${status} (${entry.durationMs}ms)`);
    }
  }

  return lines;
}

function itemHeading(fb: FeedbackResponse, index: number, includeIds: boolean): string {
  const ann = fb.annotations[0];
  const snippet = ann?.textSnippet.trim();
  const short = snippet ? truncate(snippet, 40) : (ann?.elementTag.toLowerCase() ?? fb.type);
  const suffix = fb.annotations.length > 1 ? ` (+${fb.annotations.length - 1} more)` : "";
  const idTag = includeIds ? `  (ID: ${quotedLabel(fb.id, 60)})` : "";
  return `${index}. ${short}${suffix}${idTag}`;
}

/** Instructions rendered at the top of the document, before any item. */
export interface AgentMarkdownOptions {
  /** Document title — defaults to `"UI change requests"`. */
  title?: string;
  /** Bullet list of instructions for the agent — sensible default provided. */
  instructions?: string[];
  /**
   * Whether each item heading carries its feedback ID and the document ends
   * with close-the-loop instructions (how the agent marks items resolved).
   * Default `true` — the whole point of handing IDs to an agent is that it
   * can close its own inbox. Set `false` for drafts that have no real ID
   * yet (the composer's in-flight copy).
   */
  includeResolveProtocol?: boolean;
}

const DEFAULT_INSTRUCTIONS = [
  "Review each request against the current code before making any change.",
  "If a target is ambiguous or you can't find it in the code, report that instead of guessing.",
  "Run the relevant tests after implementing each change.",
];

/**
 * Format feedbacks as deterministic Markdown for a coding agent. Same input
 * (in the same order) always produces the same output string. Caller
 * chooses ordering and filtering (single item, selection, "open on this
 * page") — this function only renders what it's given, capped to
 * `MAX_ITEMS` so a runaway selection can't produce an unbounded document.
 */
export function formatFeedbacksForAgent(feedbacks: FeedbackResponse[], options: AgentMarkdownOptions = {}): string {
  const title = options.title ?? "UI change requests";
  const instructions = options.instructions ?? DEFAULT_INSTRUCTIONS;
  const includeResolveProtocol = options.includeResolveProtocol !== false;
  const items = feedbacks.slice(0, MAX_ITEMS);

  const lines: string[] = [`# ${title}`, ""];
  for (const instr of instructions) lines.push(`- ${instr}`);
  lines.push("");

  if (items.length === 0) {
    lines.push("(no items)");
    return `${lines.join("\n")}\n`;
  }

  const urls = new Set(items.map((f) => f.url));
  const sharedPage = urls.size === 1;

  if (sharedPage) {
    lines.push(`Page: ${pageUrl(items[0] as FeedbackResponse)}`);
    const vp = viewportLabel(items[0] as FeedbackResponse);
    if (vp) lines.push(`Viewport: ${vp}`);
    lines.push("");
  }

  items.forEach((fb, i) => {
    lines.push(`## ${itemHeading(fb, i + 1, includeResolveProtocol)}`);
    if (!sharedPage) {
      lines.push(`Page: ${pageUrl(fb)}`);
      const vp = viewportLabel(fb);
      if (vp) lines.push(`Viewport: ${vp}`);
    }
    lines.push("Request (verbatim):");
    lines.push(blockquote(fb.message));

    if (fb.annotations.length === 0) {
      lines.push("Target: (no anchor captured)");
    } else if (fb.annotations.length === 1) {
      renderSingleTarget(lines, fb.annotations[0] as AnnotationResponse);
    } else {
      renderMultipleTargets(lines, fb.annotations);
    }

    const shot = screenshotLine(fb);
    if (shot) lines.push(shot);
    lines.push(...diagnosticsLines(fb));

    lines.push("");
  });

  if (feedbacks.length > MAX_ITEMS) {
    lines.push(`(${feedbacks.length - MAX_ITEMS} more item(s) omitted — copy a smaller selection)`);
    lines.push("");
  }

  // Close the loop: an agent that fixed an item can mark it resolved itself,
  // so the human's inbox empties without manual bookkeeping.
  if (includeResolveProtocol && items.length > 0) {
    lines.push("---");
    lines.push("When a request is FIXED and verified, close it by its ID:");
    // Indented code block, not a fenced one — the escaping invariant of this
    // document is "no bare fence lines ever appear in the output", which is
    // what keeps hostile message content from faking document structure.
    lines.push("");
    lines.push("    npx @instafix/cli resolve <ID>");
    lines.push("");
    lines.push('(or PATCH the feedback API for that ID with {"status":"resolved"})');
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Exporter contract for agent-targeted formats. `formatFeedbacksForAgent`
 * is wrapped as the `"claude-code"` exporter below; other agent formats can
 * implement the same shape without changing call sites.
 */
export interface AgentExporter {
  id: string;
  label: string;
  format: (feedbacks: FeedbackResponse[], options?: AgentMarkdownOptions) => string;
}

export const PROMPT_EXPORTER: AgentExporter = {
  id: "prompt",
  label: "Prompt (Markdown)",
  format: formatFeedbacksForAgent,
};
