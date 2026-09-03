import { createInstaFixHandler } from "@instafix/adapter-sqlite";
import { memoryStore } from "@/lib/memory-store";

// Webhook notifications — uncomment to ping Slack/Discord on each new feedback.
// (Self-hosted demos: drop your incoming webhook URL into the env and you're done.)
//
// const SLACK_WEBHOOK = process.env.INSTAFIX_SLACK_WEBHOOK;
// const DISCORD_WEBHOOK = process.env.INSTAFIX_DISCORD_WEBHOOK;

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({
  store: memoryStore,
  // Demo only: everyone can wipe the in-memory store. Never do this on a
  // real deployment — set `apiKey` instead.
  requireAuthForDestructive: false,
  // webhooks: [
  //   ...(SLACK_WEBHOOK ? [{ url: SLACK_WEBHOOK, type: "slack" as const }] : []),
  //   ...(DISCORD_WEBHOOK ? [{ url: DISCORD_WEBHOOK, type: "discord" as const }] : []),
  // ],
});
