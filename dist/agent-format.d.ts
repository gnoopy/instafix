/**
 * Deterministic Markdown formatter — turns feedbacks into text any coding
 * agent (Claude Code, Cursor, Copilot, ...) can act on directly. Pure and
 * framework-agnostic: no DOM, no clipboard, no UI. `AgentExporter` is the
 * seam for adding other agent-specific formats later without touching call
 * sites.
 */
import type { FeedbackResponse } from "./types.js";
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
/**
 * Format feedbacks as deterministic Markdown for a coding agent. Same input
 * (in the same order) always produces the same output string. Caller
 * chooses ordering and filtering (single item, selection, "open on this
 * page") — this function only renders what it's given, capped to
 * `MAX_ITEMS` so a runaway selection can't produce an unbounded document.
 */
export declare function formatFeedbacksForAgent(feedbacks: FeedbackResponse[], options?: AgentMarkdownOptions): string;
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
export declare const PROMPT_EXPORTER: AgentExporter;
