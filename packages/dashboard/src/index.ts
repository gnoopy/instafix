// Re-export commonly needed core types so consumers don't have to depend on @instafix/core directly.
export type { FeedbackRecord, FeedbackStatus, FeedbackType, InstaFixStore } from "@instafix/core";
export { FEEDBACK_STATUSES, FEEDBACK_TYPES, isClosedStatus } from "@instafix/core";
export { InstaFixInbox } from "./components/inbox.js";
export { registerLocale } from "./i18n/index.js";
export { createEndpointSource, createStoreSource } from "./source.js";
export type { InboxTheme, ResolvedTheme } from "./theme.js";
export type {
  EndpointSourceOptions,
  InboxCustomSourceOptions,
  InboxEndpointOptions,
  InboxSharedOptions,
  InboxSource,
  InboxState,
  InboxStatusFilter,
  InboxStoreOptions,
  InboxTypeFilter,
  InstaFixInboxPresentationProps,
  InstaFixInboxProps,
  UseInstaFixInboxOptions,
} from "./types.js";
export { useInstaFixInbox } from "./use-inbox.js";
