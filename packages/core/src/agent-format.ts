/**
 * Deterministic Markdown formatter — turns feedbacks into text any coding
 * agent (Claude Code, Cursor, Copilot, ...) can act on directly. Pure and
 * framework-agnostic: no DOM, no clipboard, no UI. `AgentExporter` is the
 * seam for adding other agent-specific formats later without touching call
 * sites.
 */

import { isGeneratedElementId } from "./generated-id.js";
import type { AnnotationResponse, FeedbackResponse } from "./types.js";
import { resolveAnnotationTarget } from "./types.js";

/**
 * Every human-language word the formatter prints. The defaults are the
 * English document; a host passes its own locale so the agent reads one
 * language (and the user sees one in a preview). Labels are host-authored
 * text, never user content — user content still goes through the escaping
 * helpers below. `{count}` is replaced with a number.
 */
export interface AgentMarkdownLabels {
  title: string;
  instructions: string[];
  page: string;
  viewport: string;
  request: string;
  noAnchor: string;
  target: string;
  targets: string;
  element: string;
  textIn: string;
  area: string;
  quote: string;
  selectors: string;
  context: string;
  nearbyText: string;
  surroundingText: string;
  component: string;
  domPath: string;
  computed: string;
  bounds: string;
  relativeToViewport: string;
  relativeToElement: string;
  screenshot: string;
  moreSuffix: string;
  moreTargets: string;
  moreItems: string;
  consoleDiagnostics: string;
  networkDiagnostics: string;
  networkError: string;
  resolveProtocol: string;
  resolveFallback: string;
}

export const DEFAULT_AGENT_LABELS: AgentMarkdownLabels = {
  title: "UI change requests",
  instructions: [
    "Review each request against the current code before making any change.",
    "If a target is ambiguous or you can't find it in the code, report that instead of guessing.",
    "Run the relevant tests after implementing each change.",
  ],
  page: "Page",
  viewport: "Viewport",
  request: "Request (verbatim):",
  noAnchor: "(no anchor captured)",
  target: "Target",
  targets: "Targets",
  element: "element",
  textIn: "text in",
  area: "area (no element — page region)",
  quote: "Quote",
  selectors: "Selectors:",
  context: "Context",
  nearbyText: "nearby text",
  surroundingText: "surrounding text",
  component: "Component",
  domPath: "DOM path",
  computed: "Computed",
  bounds: "Bounds",
  relativeToViewport: "relative to viewport",
  relativeToElement: "relative to target element",
  screenshot: "Screenshot",
  moreSuffix: "+{count} more",
  moreTargets: "{count} more target(s) omitted",
  moreItems: "{count} more item(s) omitted — copy a smaller selection",
  consoleDiagnostics: "Console errors/warnings (most recent last):",
  networkDiagnostics: "Failed network requests:",
  networkError: "network error",
  resolveProtocol: "When a request is FIXED and verified, close it by its ID:",
  resolveFallback: '(or PATCH the feedback API for that ID with {"status":"resolved"})',
};

function withCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

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

function targetKindLabel(ann: AnnotationResponse, l: AgentMarkdownLabels): string {
  const target = resolveAnnotationTarget(ann);
  const tag = ann.elementTag.toLowerCase();
  switch (target.kind) {
    case "text":
      return `${l.textIn} ${inlineCode(tag)}`;
    case "area":
      return l.area;
    default: {
      const stableId = ann.elementId && !isGeneratedElementId(ann.elementId) ? `#${ann.elementId}` : "";
      const label = ann.textSnippet.trim() || stableId;
      return label ? `${l.element} ${inlineCode(tag)} "${quotedLabel(label)}"` : `${l.element} ${inlineCode(tag)}`;
    }
  }
}

function quoteLine(ann: AnnotationResponse, l: AgentMarkdownLabels): string | null {
  const target = resolveAnnotationTarget(ann);
  if (target.kind !== "text") return null;
  const quote = truncate(target.quote.trim(), MAX_FIELD_LEN);
  if (!quote) return null;
  const prefix = quotedLabel(target.quotePrefix, 32);
  const suffix = quotedLabel(target.quoteSuffix, 32);
  return `${l.quote}: "${prefix}[${quotedLabel(quote, 200)}]${suffix}"`;
}

/** `#id` tokens of a selector/xpath that a framework generated for one render. */
function namesGeneratedId(selector: string): boolean {
  for (const match of selector.matchAll(/#((?:\\.|[^\s.#>+~[\](),'"])+)|@id=['"]([^'"]+)['"]/g)) {
    const id = match[1] === undefined ? match[2] : match[1].replace(/\\(.)/g, "$1");
    if (isGeneratedElementId(id)) return true;
  }
  return false;
}

function selectorLines(ann: AnnotationResponse): string[] {
  const target = resolveAnnotationTarget(ann);
  if (target.kind === "area") return [];
  const lines: string[] = [];
  if (ann.anchorKey) lines.push(`semantic: ${inlineCode(ann.anchorKey)}`);
  // Generated ids change every render: a selector built on one misleads more than it helps.
  if (ann.elementId && !isGeneratedElementId(ann.elementId)) lines.push(`id: ${inlineCode(`#${ann.elementId}`)}`);
  if (ann.cssSelector && !namesGeneratedId(ann.cssSelector)) lines.push(`css: ${inlineCode(ann.cssSelector)}`);
  if (ann.xpath && !namesGeneratedId(ann.xpath)) lines.push(`xpath: ${inlineCode(ann.xpath)}`);
  return lines;
}

/** Content only (no leading "Context: " label) — callers own the label/casing. */
function contextContent(ann: AnnotationResponse, l: AgentMarkdownLabels): string | null {
  const parts: string[] = [];
  if (ann.neighborText.trim()) parts.push(`${l.nearbyText}: "${quotedLabel(ann.neighborText, MAX_FIELD_LEN)}"`);
  const prefix = ann.textPrefix.trim();
  const suffix = ann.textSuffix.trim();
  if (prefix || suffix) {
    parts.push(`${l.surroundingText}: "${quotedLabel(prefix, 80)}[…]${quotedLabel(suffix, 80)}"`);
  }
  return parts.length > 0 ? parts.join("; ") : null;
}

/** Content only (no leading "Bounds: " label) — callers own the label/casing. */
function boundsContent(ann: AnnotationResponse, l: AgentMarkdownLabels): string {
  const target = resolveAnnotationTarget(ann);
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const relativeTo = target.kind === "area" ? l.relativeToViewport : l.relativeToElement;
  return `x=${pct(ann.xPct)} y=${pct(ann.yPct)} w=${pct(ann.wPct)} h=${pct(ann.hPct)} (${relativeTo})`;
}

/**
 * Render the DOM/CSSOM snapshot: where the element sits, and how it is
 * actually styled right now. Both lines are omitted when the widget that
 * created the feedback predates the field, so an older record simply reads
 * the way it always did.
 *
 * Styles are emitted as a `prop: value;` run rather than a list — an agent
 * pastes them straight into a rule, and it costs a fraction of the lines.
 */
function inspectLines(ann: AnnotationResponse, l: AgentMarkdownLabels): string[] {
  const inspect = ann.inspect;
  if (!inspect) return [];
  const out: string[] = [];
  if (inspect.component) out.push(`${l.component}: ${inspect.component}`);
  if (inspect.domPath.length > 0) out.push(`${l.domPath}: ${inspect.domPath.join(" > ")}`);
  const styles = Object.entries(inspect.styles);
  if (styles.length > 0) {
    out.push(`${l.computed}: ${styles.map(([k, v]) => `${k}: ${v};`).join(" ")}`);
  }
  return out;
}

/** Render one target as flat top-level lines (used when a feedback has exactly one). */
function renderSingleTarget(lines: string[], ann: AnnotationResponse, l: AgentMarkdownLabels): void {
  lines.push(`${l.target}: ${targetKindLabel(ann, l)}`);
  const quote = quoteLine(ann, l);
  if (quote) lines.push(quote);
  const selLines = selectorLines(ann);
  if (selLines.length > 0) {
    lines.push(l.selectors);
    for (const line of selLines) lines.push(`- ${line}`);
  }
  const ctx = contextContent(ann, l);
  if (ctx) lines.push(`${l.context}: ${ctx}`);
  for (const line of inspectLines(ann, l)) lines.push(line);
  lines.push(`${l.bounds}: ${boundsContent(ann, l)}`);
}

/** Render N>1 targets as a nested list under one feedback item (multi-select, G3). */
function renderMultipleTargets(lines: string[], annotations: AnnotationResponse[], l: AgentMarkdownLabels): void {
  const shown = annotations.slice(0, MAX_TARGETS_PER_ITEM);
  lines.push(`${l.targets} (${annotations.length}):`);
  shown.forEach((ann, i) => {
    lines.push(`${i + 1}. ${targetKindLabel(ann, l)}`);
    const quote = quoteLine(ann, l);
    if (quote) lines.push(`   ${quote}`);
    const selLines = selectorLines(ann);
    for (const line of selLines) lines.push(`   - ${line}`);
    const ctx = contextContent(ann, l);
    if (ctx) lines.push(`   ${l.context}: ${ctx}`);
    for (const line of inspectLines(ann, l)) lines.push(`   ${line}`);
    lines.push(`   ${l.bounds}: ${boundsContent(ann, l)}`);
  });
  if (annotations.length > shown.length) {
    lines.push(`(${withCount(l.moreTargets, annotations.length - shown.length)})`);
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
 *
 * A path relative to the project folder that starts with `.instafix/` (a
 * host that stores images next to `history.jsonl`, e.g. `.instafix/img/<id>.jpg`)
 * is accepted explicitly: the agent works in that folder and opens it as is.
 * A `..` segment disqualifies it, so a record cannot point the agent outside.
 */
function screenshotLine(fb: FeedbackResponse, l: AgentMarkdownLabels): string | null {
  if (!fb.screenshotUrl) return null;
  if (fb.screenshotUrl.startsWith("data:")) return null; // inline data URLs are too long to be useful as text
  const localMatch = /^\/api\/instafix\/screenshots\/(.+)$/.exec(fb.screenshotUrl);
  const projectRelative = isProjectRelativeInstafixPath(fb.screenshotUrl);
  const shown = localMatch
    ? `.instafix/screenshots/${localMatch[1]}`
    : projectRelative
      ? fb.screenshotUrl
      : truncate(fb.screenshotUrl, MAX_FIELD_LEN);
  return `${l.screenshot}: ${inlineCode(shown)}`;
}

/** `.instafix/<dir>/<file>` with no empty, `.` or `..` segment and no whitespace. */
export function isProjectRelativeInstafixPath(value: string): boolean {
  if (value.length > MAX_FIELD_LEN || !value.startsWith(".instafix/") || /\s/.test(value)) return false;
  const segments = value.split("/").slice(1);
  return segments.length > 0 && segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

/** Render captured console errors/warnings and failed network requests, if any were captured. */
function diagnosticsLines(fb: FeedbackResponse, l: AgentMarkdownLabels): string[] {
  const diagnostics = fb.diagnostics;
  if (!diagnostics) return [];
  const lines: string[] = [];

  const notable = diagnostics.console.filter((entry) => entry.level === "error" || entry.level === "warn");
  if (notable.length > 0) {
    const shown = notable.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push(l.consoleDiagnostics);
    lines.push("```");
    for (const entry of shown) lines.push(`[${entry.level}] ${truncate(entry.message, MAX_FIELD_LEN)}`);
    lines.push("```");
  }

  if (diagnostics.network.length > 0) {
    const shown = diagnostics.network.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push(l.networkDiagnostics);
    for (const entry of shown) {
      const status = entry.status === 0 ? l.networkError : `HTTP ${entry.status}`;
      lines.push(`- ${entry.method} ${inlineCode(entry.url)} — ${status} (${entry.durationMs}ms)`);
    }
  }

  return lines;
}

function itemHeading(fb: FeedbackResponse, index: number, includeIds: boolean, l: AgentMarkdownLabels): string {
  const ann = fb.annotations[0];
  const snippet = ann?.textSnippet.trim();
  const short = snippet ? truncate(snippet, 40) : (ann?.elementTag.toLowerCase() ?? fb.type);
  const suffix = fb.annotations.length > 1 ? ` (${withCount(l.moreSuffix, fb.annotations.length - 1)})` : "";
  const idTag = includeIds ? `  (ID: ${quotedLabel(fb.id, 60)})` : "";
  return `${index}. ${short}${suffix}${idTag}`;
}

/** Instructions rendered at the top of the document, before any item. */
export interface AgentMarkdownOptions {
  /** Document title — defaults to `labels.title` (`"UI change requests"`). */
  title?: string;
  /** Bullet list of instructions for the agent — defaults to `labels.instructions`. */
  instructions?: string[];
  /**
   * Whether each item heading carries its feedback ID and the document ends
   * with close-the-loop instructions (how the agent marks items resolved).
   * Default `true` — the whole point of handing IDs to an agent is that it
   * can close its own inbox. Set `false` for drafts that have no real ID
   * yet (the composer's in-flight copy).
   */
  includeResolveProtocol?: boolean;
  /** The words of the document, merged over `DEFAULT_AGENT_LABELS`. */
  labels?: Partial<AgentMarkdownLabels>;
}

function labelsOf(partial: Partial<AgentMarkdownLabels> | undefined): AgentMarkdownLabels {
  return partial ? { ...DEFAULT_AGENT_LABELS, ...partial } : DEFAULT_AGENT_LABELS;
}

/**
 * The target, selector, context, style, bounds, screenshot and diagnostics
 * lines of ONE feedback — the body `formatFeedbacksForAgent` prints under an
 * item heading, without the document title, the page lines or the request
 * quote. For a host that writes its own heading and quotes the request once.
 */
export function formatFeedbackContext(
  feedback: FeedbackResponse,
  options: { labels?: Partial<AgentMarkdownLabels> } = {},
): string {
  const l = labelsOf(options.labels);
  const lines: string[] = [];
  if (feedback.annotations.length === 0) {
    lines.push(`${l.target}: ${l.noAnchor}`);
  } else if (feedback.annotations.length === 1) {
    renderSingleTarget(lines, feedback.annotations[0] as AnnotationResponse, l);
  } else {
    renderMultipleTargets(lines, feedback.annotations, l);
  }
  const shot = screenshotLine(feedback, l);
  if (shot) lines.push(shot);
  lines.push(...diagnosticsLines(feedback, l));
  return lines.join("\n");
}

/**
 * Format feedbacks as deterministic Markdown for a coding agent. Same input
 * (in the same order) always produces the same output string. Caller
 * chooses ordering and filtering (single item, selection, "open on this
 * page") — this function only renders what it's given, capped to
 * `MAX_ITEMS` so a runaway selection can't produce an unbounded document.
 */
export function formatFeedbacksForAgent(feedbacks: FeedbackResponse[], options: AgentMarkdownOptions = {}): string {
  const l = labelsOf(options.labels);
  const title = options.title ?? l.title;
  const instructions = options.instructions ?? l.instructions;
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
    lines.push(`${l.page}: ${pageUrl(items[0] as FeedbackResponse)}`);
    const vp = viewportLabel(items[0] as FeedbackResponse);
    if (vp) lines.push(`${l.viewport}: ${vp}`);
    lines.push("");
  }

  items.forEach((fb, i) => {
    lines.push(`## ${itemHeading(fb, i + 1, includeResolveProtocol, l)}`);
    if (!sharedPage) {
      lines.push(`${l.page}: ${pageUrl(fb)}`);
      const vp = viewportLabel(fb);
      if (vp) lines.push(`${l.viewport}: ${vp}`);
    }
    lines.push(l.request);
    lines.push(blockquote(fb.message));
    lines.push(formatFeedbackContext(fb, { labels: l }));
    lines.push("");
  });

  if (feedbacks.length > MAX_ITEMS) {
    lines.push(`(${withCount(l.moreItems, feedbacks.length - MAX_ITEMS)})`);
    lines.push("");
  }

  // Close the loop: an agent that fixed an item can mark it resolved itself,
  // so the human's inbox empties without manual bookkeeping.
  if (includeResolveProtocol && items.length > 0) {
    lines.push("---");
    lines.push(l.resolveProtocol);
    // Indented code block, not a fenced one — the escaping invariant of this
    // document is "no bare fence lines ever appear in the output", which is
    // what keeps hostile message content from faking document structure.
    lines.push("");
    lines.push("    npx @instafix/cli resolve <ID>");
    lines.push("");
    lines.push(l.resolveFallback);
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
