/**
 * Deterministic Markdown formatter — turns feedbacks into text any coding
 * agent (Claude Code, Cursor, Copilot, ...) can act on directly. Pure and
 * framework-agnostic: no DOM, no clipboard, no UI. `AgentExporter` is the
 * seam for adding other agent-specific formats later without touching call
 * sites.
 */

import { createPromptT, type PromptT } from "./agent-format-i18n.js";
import { isGeneratedElementId } from "./generated-id.js";
import type { AnnotationResponse, FeedbackResponse } from "./types.js";
import { resolveAnnotationTarget } from "./types.js";

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

function targetKindLabel(ann: AnnotationResponse, t: PromptT): string {
  const target = resolveAnnotationTarget(ann);
  const tag = ann.elementTag.toLowerCase();
  switch (target.kind) {
    case "text":
      return `${t("text in")} ${inlineCode(tag)}`;
    case "area":
      return t("area (no element — page region)");
    default: {
      const label =
        ann.textSnippet.trim() || (ann.elementId && !isGeneratedElementId(ann.elementId) ? `#${ann.elementId}` : "");
      return label
        ? `${t("element")} ${inlineCode(tag)} "${quotedLabel(label)}"`
        : `${t("element")} ${inlineCode(tag)}`;
    }
  }
}

function quoteLine(ann: AnnotationResponse, t: PromptT): string | null {
  const target = resolveAnnotationTarget(ann);
  if (target.kind !== "text") return null;
  const quote = truncate(target.quote.trim(), MAX_FIELD_LEN);
  if (!quote) return null;
  const prefix = quotedLabel(target.quotePrefix, 32);
  const suffix = quotedLabel(target.quoteSuffix, 32);
  return `${t("Quote")}: "${prefix}[${quotedLabel(quote, 200)}]${suffix}"`;
}

function namesGeneratedId(selector: string): boolean {
  for (const match of selector.matchAll(/#((?:\\.|[^\s.#>+~[\](),'"])+)|@id=['"]([^'"]+)['"]/g)) {
    const id = match[1] === undefined ? match[2] : match[1].replace(/\\(.)/g, "$1");
    if (isGeneratedElementId(id)) return true;
  }
  return false;
}

function selectorLines(ann: AnnotationResponse, t: PromptT): string[] {
  const target = resolveAnnotationTarget(ann);
  if (target.kind === "area") return [];
  const lines: string[] = [];
  if (ann.anchorKey) lines.push(`${t("semantic")}: ${inlineCode(ann.anchorKey)}`);
  if (ann.elementId && !isGeneratedElementId(ann.elementId)) lines.push(`id: ${inlineCode(`#${ann.elementId}`)}`);
  if (ann.cssSelector && !namesGeneratedId(ann.cssSelector)) lines.push(`css: ${inlineCode(ann.cssSelector)}`);
  if (ann.xpath && !namesGeneratedId(ann.xpath)) lines.push(`xpath: ${inlineCode(ann.xpath)}`);
  return lines;
}

/** Content only (no leading "Context: " label) — callers own the label/casing. */
function contextContent(ann: AnnotationResponse, t: PromptT): string | null {
  const parts: string[] = [];
  if (ann.neighborText.trim()) parts.push(`${t("nearby text")}: "${quotedLabel(ann.neighborText, MAX_FIELD_LEN)}"`);
  const prefix = ann.textPrefix.trim();
  const suffix = ann.textSuffix.trim();
  if (prefix || suffix) {
    parts.push(`${t("surrounding text")}: "${quotedLabel(prefix, 80)}[…]${quotedLabel(suffix, 80)}"`);
  }
  return parts.length > 0 ? parts.join("; ") : null;
}

/** Content only (no leading "Bounds: " label) — callers own the label/casing. */
function boundsContent(ann: AnnotationResponse, t: PromptT): string {
  const target = resolveAnnotationTarget(ann);
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const relativeTo = target.kind === "area" ? t("relative to viewport") : t("relative to target element");
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
function inspectLines(ann: AnnotationResponse, t: PromptT): string[] {
  const inspect = ann.inspect;
  if (!inspect) return [];
  const out: string[] = [];
  if (inspect.component) out.push(`${t("Component")}: ${inspect.component}`);
  if (inspect.domPath.length > 0) out.push(`${t("DOM path")}: ${inspect.domPath.join(" > ")}`);
  const styles = Object.entries(inspect.styles);
  if (styles.length > 0) {
    out.push(`${t("Computed")}: ${styles.map(([k, v]) => `${k}: ${v};`).join(" ")}`);
  }
  return out;
}

/** Render one target as flat top-level lines (used when a feedback has exactly one). */
function renderSingleTarget(lines: string[], ann: AnnotationResponse, t: PromptT): void {
  lines.push(
    t(
      "Only target 1 is captured for this request. If the request refers to other target numbers, ask for clarification instead of guessing.",
    ),
  );
  lines.push(`${t("Target")}: ${targetKindLabel(ann, t)}`);
  const quote = quoteLine(ann, t);
  if (quote) lines.push(quote);
  const selLines = selectorLines(ann, t);
  if (selLines.length > 0) {
    lines.push(`${t("Selectors")}:`);
    for (const l of selLines) lines.push(`- ${l}`);
  }
  const ctx = contextContent(ann, t);
  if (ctx) lines.push(`${t("Context")}: ${ctx}`);
  for (const line of inspectLines(ann, t)) lines.push(line);
  lines.push(`${t("Bounds")}: ${boundsContent(ann, t)}`);
}

/** Render N>1 targets as a nested list under one feedback item (multi-select, G3). */
function renderMultipleTargets(lines: string[], annotations: AnnotationResponse[], t: PromptT): void {
  const shown = annotations.slice(0, MAX_TARGETS_PER_ITEM);
  lines.push(
    t(
      'Component numbers are local to this region and match its inner selection badges. References such as "1", "①", or "1번" mean component 1 below. #1 refers to outer region #1, never component 1. Use selectors and context; do not renumber components or infer them from visual position.',
    ),
  );
  lines.push(`${t("Targets")} (${annotations.length}):`);
  shown.forEach((ann, i) => {
    lines.push(`${i + 1}. ${targetKindLabel(ann, t)}`);
    const quote = quoteLine(ann, t);
    if (quote) lines.push(`   ${quote}`);
    const selLines = selectorLines(ann, t);
    for (const l of selLines) lines.push(`   - ${l}`);
    const ctx = contextContent(ann, t);
    if (ctx) lines.push(`   ${t("Context")}: ${ctx}`);
    for (const line of inspectLines(ann, t)) lines.push(`   ${line}`);
    lines.push(`   ${t("Bounds")}: ${boundsContent(ann, t)}`);
  });
  if (annotations.length > shown.length) {
    lines.push(t("({count} more target(s) omitted)", { count: annotations.length - shown.length }));
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
export function isProjectRelativeInstafixPath(value: string): boolean {
  if (value.length > MAX_FIELD_LEN || !value.startsWith(".instafix/") || /\s/.test(value)) return false;
  const segments = value.split("/").slice(1);
  return segments.length > 0 && segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

function screenshotLine(fb: FeedbackResponse, t: PromptT): string | null {
  if (!fb.screenshotUrl) return null;
  if (fb.screenshotUrl.startsWith("data:")) return null; // inline data URLs are too long to be useful as text
  const localMatch = /^\/api\/instafix\/screenshots\/(.+)$/.exec(fb.screenshotUrl);
  const shown = localMatch ? `.instafix/screenshots/${localMatch[1]}` : truncate(fb.screenshotUrl, MAX_FIELD_LEN);
  return `${t("Screenshot")}: ${inlineCode(shown)}`;
}

/** Render captured console errors/warnings and failed network requests, if any were captured. */
function diagnosticsLines(fb: FeedbackResponse, t: PromptT): string[] {
  const diagnostics = fb.diagnostics;
  if (!diagnostics) return [];
  const lines: string[] = [];

  const notable = diagnostics.console.filter((entry) => entry.level === "error" || entry.level === "warn");
  if (notable.length > 0) {
    const shown = notable.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push(t("Console errors/warnings (most recent last):"));
    lines.push("```");
    for (const entry of shown) lines.push(`[${entry.level}] ${truncate(entry.message, MAX_FIELD_LEN)}`);
    lines.push("```");
  }

  if (diagnostics.network.length > 0) {
    const shown = diagnostics.network.slice(-MAX_DIAGNOSTIC_ENTRIES);
    lines.push(t("Failed network requests:"));
    for (const entry of shown) {
      const status = entry.status === 0 ? t("network error") : `HTTP ${entry.status}`;
      lines.push(`- ${entry.method} ${inlineCode(entry.url)} — ${status} (${entry.durationMs}ms)`);
    }
  }

  return lines;
}

function itemHeading(fb: FeedbackResponse, index: number, includeIds: boolean, t: PromptT, isRegion = false): string {
  const ann = fb.annotations[0];
  const snippet = ann?.textSnippet.trim();
  const short = snippet ? truncate(snippet, 40) : (ann?.elementTag.toLowerCase() ?? fb.type);
  const suffix = fb.annotations.length > 1 ? t(" (+{count} more)", { count: fb.annotations.length - 1 }) : "";
  const idTag = includeIds ? `  (ID: ${quotedLabel(fb.id, 60)})` : "";
  return `${isRegion ? "#" : ""}${index}. ${short}${suffix}${idTag}`;
}

/** Instructions rendered at the top of the document, before any item. */
export interface PromptRegion {
  /** Page-scoped, stable outer selection number (displayed as #N). */
  number: number;
  feedback: FeedbackResponse;
  /** Actual exported image attachment name for a local draft. */
  screenshotFilename?: string | undefined;
}

/** Explicit region references only; bare numbers are local component numbers. */
export function referencedRegionNumbers(message: string): number[] {
  return [
    ...new Set(
      [...message.matchAll(/(?<![A-Za-z0-9_/#])#([1-9]\d*)(?![\dA-Za-z_-])/gu)].map((match) => Number(match[1])),
    ),
  ];
}

export interface AgentMarkdownOptions {
  labels?: Partial<AgentMarkdownLabels>;
  /** Known selections, including context outside the items being copied. */
  regions?: readonly PromptRegion[] | undefined;
  /** Prompt language: Korean or English; other locales fall back to English. */
  locale?: string | undefined;
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

function promptTranslator(options: AgentMarkdownOptions): PromptT {
  const base = createPromptT(options.locale);
  const overrides = new Map<string, string>();
  for (const [name, value] of Object.entries(options.labels ?? {})) {
    const key = DEFAULT_AGENT_LABELS[name as keyof AgentMarkdownLabels];
    if (typeof key === "string" && typeof value === "string") overrides.set(key, value);
  }
  if (options.labels?.selectors) overrides.set("Selectors", options.labels.selectors.replace(/:$/, ""));
  if (options.labels?.moreSuffix) overrides.set(" (+{count} more)", ` (${options.labels.moreSuffix})`);
  if (options.labels?.moreTargets) overrides.set("({count} more target(s) omitted)", `(${options.labels.moreTargets})`);
  if (options.labels?.moreItems)
    overrides.set("({count} more item(s) omitted — copy a smaller selection)", `(${options.labels.moreItems})`);
  if (options.labels?.target || options.labels?.noAnchor)
    overrides.set(
      "Target: (no anchor captured)",
      `${options.labels.target ?? base("Target")}: ${options.labels.noAnchor ?? "(no anchor captured)"}`,
    );
  return (key, params = {}) => {
    const override = overrides.get(key);
    return override === undefined
      ? base(key, params)
      : override.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
  };
}

/** Target context for host-authored headings and request text. */
export function formatFeedbackContext(feedback: FeedbackResponse, options: AgentMarkdownOptions = {}): string {
  const t = promptTranslator(options);
  const lines: string[] = [];
  if (feedback.annotations.length === 0) lines.push(t("Target: (no anchor captured)"));
  else if (feedback.annotations.length === 1) {
    renderSingleTarget(lines, feedback.annotations[0] as AnnotationResponse, t);
    lines.shift(); // Preserve the host API's Target-first body.
  } else renderMultipleTargets(lines, feedback.annotations, t);
  const shot = screenshotLine(feedback, t);
  if (shot) lines.push(shot);
  lines.push(...diagnosticsLines(feedback, t));
  return lines.join("\n");
}

const DEFAULT_INSTRUCTIONS = [
  "Review each request against the current code before making any change.",
  "If a target is ambiguous or you can't find it in the code, report that instead of guessing.",
  "Run the relevant tests after implementing each change.",
] as const;

/**
 * Format feedbacks as deterministic Markdown for a coding agent. Same input
 * (in the same order) always produces the same output string. Caller
 * chooses ordering and filtering (single item, selection, "open on this
 * page") — this function only renders what it's given, capped to
 * `MAX_ITEMS` so a runaway selection can't produce an unbounded document.
 */
export function formatFeedbacksForAgent(feedbacks: FeedbackResponse[], options: AgentMarkdownOptions = {}): string {
  const t = promptTranslator(options);
  const title = options.title ?? t("UI change requests");
  const instructions =
    options.instructions ?? options.labels?.instructions ?? DEFAULT_INSTRUCTIONS.map((instruction) => t(instruction));
  const includeResolveProtocol = options.includeResolveProtocol !== false;
  const items = feedbacks.slice(0, MAX_ITEMS);

  const lines: string[] = [`# ${title}`, ""];
  for (const instr of instructions) lines.push(`- ${instr}`);
  lines.push("");

  if (items.length === 0) {
    lines.push(t("(no items)"));
    return `${lines.join("\n")}\n`;
  }

  const urls = new Set(items.map((f) => f.url));
  const sharedPage = urls.size === 1;

  if (sharedPage) {
    lines.push(`${t("Page")}: ${pageUrl(items[0] as FeedbackResponse)}`);
    const vp = viewportLabel(items[0] as FeedbackResponse);
    if (vp) lines.push(`${t("Viewport")}: ${vp}`);
    lines.push("");
  }

  const regions: readonly PromptRegion[] = options.regions ?? [];
  if (regions.some((region) => region.screenshotFilename)) {
    lines.push(
      t(
        "Screenshot files are separate attachments. If a listed file is not accessible, ask the user to attach it; do not infer its contents.",
      ),
    );
  }
  const regionFor = (fb: FeedbackResponse) =>
    regions.find((region) => region.feedback.id === fb.id && region.feedback.url === fb.url);
  lines.push(
    t(
      "Region references use #N; bare numbers (1, 2, ①, 1번) identify components only inside the current region. For another region's component, write '#2 component 1'.",
    ),
  );
  lines.push("");
  items.forEach((fb, i) => {
    const ownRegion = regionFor(fb);
    lines.push(`## ${itemHeading(fb, ownRegion?.number ?? i + 1, includeResolveProtocol, t, !!ownRegion)}`);
    if (!sharedPage) {
      lines.push(`${t("Page")}: ${pageUrl(fb)}`);
      const vp = viewportLabel(fb);
      if (vp) lines.push(`${t("Viewport")}: ${vp}`);
    }
    lines.push(t("Request (verbatim):"));
    lines.push(blockquote(fb.message));

    if (fb.annotations.length === 0) {
      lines.push(t("Target: (no anchor captured)"));
    } else if (fb.annotations.length === 1) {
      renderSingleTarget(lines, fb.annotations[0] as AnnotationResponse, t);
    } else {
      renderMultipleTargets(lines, fb.annotations, t);
    }

    const shot = ownRegion?.screenshotFilename
      ? `${t("Screenshot file")}: ${inlineCode(ownRegion.screenshotFilename)}`
      : screenshotLine(fb, t);
    lines.push(shot ?? t("Screenshot: unavailable (no image was captured or stored)."));
    if (fb.screenshotRegion)
      lines.push(`${t("Selection bounds in screenshot")}: ${JSON.stringify(fb.screenshotRegion)}`);
    lines.push(...diagnosticsLines(fb, t));

    // References are context, not additional requests to implement or resolve.
    for (const number of referencedRegionNumbers(fb.message)) {
      if (number === ownRegion?.number) continue;
      const matches = regions.filter((region) => region.number === number && region.feedback.url === fb.url);
      lines.push("");
      if (matches.length !== 1) {
        lines.push(
          t("Region #{number}: unavailable or ambiguous. Ask the user; do not guess its components or screenshot.", {
            number,
          }),
        );
        continue;
      }
      const reference = matches[0] as PromptRegion;
      lines.push(`### ${t("Referenced region #{number} (context only)", { number })}`);
      lines.push(`${t("Page")}: ${pageUrl(reference.feedback)}`);
      if (reference.feedback.annotations.length === 1) {
        renderSingleTarget(lines, reference.feedback.annotations[0] as AnnotationResponse, t);
      } else if (reference.feedback.annotations.length > 1) {
        renderMultipleTargets(lines, reference.feedback.annotations, t);
      } else {
        lines.push(t("Target: (no anchor captured)"));
      }
      const referenceShot = reference.screenshotFilename
        ? `${t("Screenshot file")}: ${inlineCode(reference.screenshotFilename)}`
        : screenshotLine(reference.feedback, t);
      lines.push(referenceShot ?? t("Screenshot: unavailable (no image was captured or stored)."));
      if (reference.feedback.screenshotRegion) {
        lines.push(`${t("Selection bounds in screenshot")}: ${JSON.stringify(reference.feedback.screenshotRegion)}`);
      }
    }

    lines.push("");
  });

  if (feedbacks.length > MAX_ITEMS) {
    lines.push(t("({count} more item(s) omitted — copy a smaller selection)", { count: feedbacks.length - MAX_ITEMS }));
    lines.push("");
  }

  // Close the loop: an agent that fixed an item can mark it resolved itself,
  // so the human's inbox empties without manual bookkeeping.
  if (includeResolveProtocol && items.length > 0) {
    lines.push("---");
    lines.push(t("When a request is FIXED and verified, close it by its ID:"));
    // Indented code block, not a fenced one — the escaping invariant of this
    // document is "no bare fence lines ever appear in the output", which is
    // what keeps hostile message content from faking document structure.
    lines.push("");
    lines.push("    npx @instafix/cli resolve <ID>");
    lines.push("");
    lines.push(t('(or PATCH the feedback API for that ID with {"status":"resolved"})'));
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
