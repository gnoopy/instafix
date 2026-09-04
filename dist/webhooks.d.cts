/**
 * Outgoing webhook notifications for newly-created feedbacks.
 *
 * Plug a Slack, Discord, or generic HTTP endpoint into `createInstaFixHandler`
 * to receive a payload whenever a feedback is successfully persisted. Webhooks
 * are dispatched as fire-and-forget (`void Promise.all(...)`) so a slow or
 * down receiver never blocks the client response — the feedback is already in
 * the DB by the time we dial out.
 *
 * - **Type-specific formatting**: Slack uses `{ text, blocks }`, Discord uses
 *   `{ content, embeds }`, generic uses the raw `FeedbackRecord` JSON.
 * - **Timeout**: 5s by default (overridable per webhook).
 * - **Error handling**: `config.onError(err, feedback.id)` is invoked when
 *   present; otherwise we log a one-liner to `console.warn` so the issue is
 *   surfaced without crashing the request.
 */
import type { FeedbackRecord } from "./types.cjs";
/** Supported webhook integrations — drives the JSON body shape. */
export type WebhookType = "slack" | "discord" | "generic";
/**
 * Outgoing webhook configuration.
 *
 * - `url` — required, the HTTPS endpoint to POST to.
 * - `type` — payload format. Defaults to `"generic"` (raw JSON).
 * - `headers` — extra headers merged on top of `Content-Type: application/json`.
 *   Useful for signed-payload schemes (`X-Signature`, bearer tokens, …).
 * - `timeoutMs` — abort the fetch after this many ms. Defaults to 5000.
 * - `onError` — invoked with the underlying error and the feedback id when
 *   the dispatch fails (network error, non-2xx, timeout). The webhook is
 *   fire-and-forget, so this is your only chance to observe failures.
 */
export interface WebhookConfig {
    url: string;
    type?: WebhookType;
    headers?: Record<string, string>;
    timeoutMs?: number;
    onError?: (err: Error, feedbackId: string) => void;
}
/** Block Kit envelope used by Slack incoming webhooks. */
export interface SlackWebhookPayload {
    text: string;
    blocks: ReadonlyArray<SlackHeaderBlock | SlackSectionBlock | SlackContextBlock>;
}
interface SlackHeaderBlock {
    type: "header";
    text: {
        type: "plain_text";
        text: string;
        emoji: true;
    };
}
interface SlackSectionBlock {
    type: "section";
    text: {
        type: "mrkdwn";
        text: string;
    };
}
interface SlackContextBlock {
    type: "context";
    elements: ReadonlyArray<{
        type: "mrkdwn";
        text: string;
    }>;
}
/** Embed envelope used by Discord incoming webhooks. */
export interface DiscordWebhookPayload {
    content: string;
    embeds: ReadonlyArray<{
        title: string;
        description: string;
        color: number;
        fields: ReadonlyArray<{
            name: string;
            value: string;
            inline: boolean;
        }>;
        timestamp: string;
    }>;
}
/** Mapping from webhook type to its concrete body shape. */
export interface WebhookPayloadMap {
    slack: SlackWebhookPayload;
    discord: DiscordWebhookPayload;
    generic: FeedbackRecord;
}
/**
 * Build the JSON body for a single webhook based on its `type`.
 * Exported for tests; not part of the public API.
 *
 * @internal
 */
export declare function buildWebhookPayload<T extends WebhookType | undefined>(type: T, feedback: FeedbackRecord): T extends "slack" ? SlackWebhookPayload : T extends "discord" ? DiscordWebhookPayload : FeedbackRecord;
/**
 * Dispatch a single webhook. Fire-and-forget: never throws, never rejects.
 *
 * - Builds the type-specific payload.
 * - POSTs with an `AbortSignal` timeout.
 * - On any error (network, non-2xx, timeout, exception), invokes
 *   `config.onError(err, feedbackId)` if provided; otherwise logs a one-liner.
 */
export declare function dispatchWebhook(config: WebhookConfig, feedback: FeedbackRecord): Promise<void>;
/**
 * Dispatch every configured webhook in parallel. Awaiting the returned promise
 * lets tests synchronize on completion, but production callers should drop the
 * promise on the floor (`void dispatchWebhooks(...)`) so the HTTP response
 * isn't held back on slow receivers.
 */
export declare function dispatchWebhooks(configs: readonly WebhookConfig[], feedback: FeedbackRecord): Promise<void>;
export {};
