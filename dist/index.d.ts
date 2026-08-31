import { FeedbackRecord, FeedbackStatus, FeedbackQuery, FeedbackPage, FeedbackType, InstaFixStore, InstaFixLocale } from './instafix-core.js';
export { FEEDBACK_STATUSES, FEEDBACK_TYPES, FeedbackRecord, FeedbackStatus, FeedbackType, InstaFixStore, isClosedStatus } from './instafix-core.js';
import { ReactNode, ReactElement } from 'react';

/** Theme requested by the host — `auto` follows the system preference live. */
type InboxTheme = "light" | "dark" | "auto";
/** Concrete theme applied to the root element's `data-theme` attribute. */
type ResolvedTheme = "light" | "dark";

/**
 * Abstract data source consumed by `useInstaFixInbox`.
 *
 * Two built-in factories exist — `createEndpointSource` (HTTP, talks to the
 * adapter request handlers) and `createStoreSource` (direct `InstaFixStore`,
 * client-side mode) — but consumers can hand-roll one to plug the inbox into
 * any backend (tRPC, GraphQL, server actions, …).
 */
interface InboxSource {
    /** Paginated, filtered feedback query. Must resolve real `Date` objects on records. */
    list(query: FeedbackQuery): Promise<FeedbackPage>;
    /**
     * Persist a status change. Closure semantics (`resolvedAt`) are derived at
     * this edge — callers only pass the target status.
     */
    setStatus(id: string, projectName: string, status: FeedbackStatus): Promise<FeedbackRecord>;
    /** Permanently delete a feedback. */
    remove(id: string, projectName: string): Promise<void>;
}
/** Options accepted by `createEndpointSource`. */
interface EndpointSourceOptions {
    /** HTTP endpoint exposing the InstaFix request handlers (e.g. `/api/instafix`). */
    endpoint: string;
    /** Convenience auth — sent as `Authorization: Bearer <apiKey>` on every request. */
    apiKey?: string | undefined;
    /**
     * Extra request headers, static or lazily computed (sync or async) per
     * request — e.g. a fresh session token. An explicit `Authorization` entry
     * here takes precedence over `apiKey`.
     */
    headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>) | undefined;
    /** Test seam — defaults to `globalThis.fetch`. */
    fetchFn?: typeof fetch | undefined;
}
/** Status filter — a concrete status, or `"all"`. */
type InboxStatusFilter = FeedbackStatus | "all";
/** Type filter — a concrete feedback type, or `"all"`. */
type InboxTypeFilter = FeedbackType | "all";
/** Options shared by every `useInstaFixInbox` source mode. */
interface InboxSharedOptions {
    /** Project name(s) to triage. The first entry is selected initially. */
    projects: string | readonly string[];
    /** Page size for list queries. Defaults to 50, clamped to 1..100. */
    pageSize?: number | undefined;
    /** Called after a status change is persisted, with the saved record and the status it had before. */
    onStatusChange?: ((feedback: FeedbackRecord, previous: FeedbackStatus) => void) | undefined;
    /** Called after a feedback is permanently deleted. */
    onDelete?: ((feedback: FeedbackRecord) => void) | undefined;
    /** Called on every load or mutation failure, with a typed `InstaFixError` where available. */
    onError?: ((error: Error) => void) | undefined;
}
/** Custom-source mode — bring your own `InboxSource` (tRPC, GraphQL, …). */
interface InboxCustomSourceOptions extends InboxSharedOptions {
    /** Custom data source. */
    source: InboxSource;
    /** Use exactly one of `source`, `store`, `endpoint`. */
    store?: never;
    /** Use exactly one of `source`, `store`, `endpoint`. */
    endpoint?: never;
    /** Endpoint mode only. */
    apiKey?: never;
    /** Endpoint mode only. */
    headers?: never;
}
/** Store mode — direct `InstaFixStore` access, no server round-trip. */
interface InboxStoreOptions extends InboxSharedOptions {
    /** Direct store for client-side mode. */
    store: InstaFixStore;
    /** Use exactly one of `source`, `store`, `endpoint`. */
    source?: never;
    /** Use exactly one of `source`, `store`, `endpoint`. */
    endpoint?: never;
    /** Endpoint mode only. */
    apiKey?: never;
    /** Endpoint mode only. */
    headers?: never;
}
/** Endpoint mode — HTTP against the InstaFix request handlers. */
interface InboxEndpointOptions extends InboxSharedOptions {
    /** HTTP endpoint exposing the InstaFix request handlers. */
    endpoint: string;
    /** Sent as `Authorization: Bearer <apiKey>`. */
    apiKey?: string | undefined;
    /** Extra request headers — see `EndpointSourceOptions.headers`. */
    headers?: EndpointSourceOptions["headers"];
    /** Use exactly one of `source`, `store`, `endpoint`. */
    source?: never;
    /** Use exactly one of `source`, `store`, `endpoint`. */
    store?: never;
}
/**
 * Options accepted by `useInstaFixInbox` (and, by extension,
 * `<InstaFixInbox />`) — a union over the three source modes. Supplying no
 * source, several sources, or endpoint-only options (`apiKey`/`headers`)
 * alongside `store`/`source` is a compile error instead of a runtime throw
 * or a silently ignored option.
 */
type UseInstaFixInboxOptions = InboxCustomSourceOptions | InboxStoreOptions | InboxEndpointOptions;
/**
 * Full state + actions returned by `useInstaFixInbox` — everything needed to
 * render a triage inbox. Mutations are optimistic: state updates immediately,
 * rolls back on failure (the rejected promise carries the error so UIs can
 * surface a toast on top of the `onError` callback).
 */
interface InboxState {
    /** Currently selected project. */
    project: string;
    /** All configured projects (normalized to an array). */
    projects: readonly string[];
    /** Switch project — resets focus, drawer and pending undo. */
    setProject(p: string): void;
    /** Active status tab. */
    status: InboxStatusFilter;
    setStatus(s: InboxStatusFilter): void;
    /** Active type filter. */
    type: InboxTypeFilter;
    setType(t: InboxTypeFilter): void;
    /** Raw search input — updates synchronously; the refetch is debounced 250ms. */
    search: string;
    setSearch(s: string): void;
    /** Currently loaded rows (page 1..n concatenated). */
    items: FeedbackRecord[];
    /** Total matching the current filters — `null` until the first page resolves. */
    total: number | null;
    /** Per-status tab counts — refreshed with the list; adjusted locally on mutations. */
    counts: Partial<Record<"all" | FeedbackStatus, number>>;
    /** True while page 1 is (re)loading. */
    loading: boolean;
    /** True while an additional page is loading. */
    loadingMore: boolean;
    /** Last load failure for the current filters — cleared on refetch. */
    error: Error | null;
    /** Whether more pages exist beyond the loaded rows. */
    hasMore: boolean;
    /**
     * High-level view resolution — the exact algebra the shipped
     * `<InstaFixInbox />` uses to pick between skeleton, error state, empty
     * state and the list, exposed so headless consumers don't have to
     * re-derive it from the flags:
     * - `"loading"` — first page is loading and nothing is displayable.
     * - `"error"` — the load failed and nothing is displayable.
     * - `"empty"` — loaded fine, zero rows for the current filters.
     * - `"ready"` — rows are displayable (stale rows stay visible during a
     *   refetch — check `loading` for granular spinners).
     */
    view: "loading" | "error" | "empty" | "ready";
    /** Fetch the next page and append it. */
    loadMore(): Promise<void>;
    /** Re-fetch page 1 + counts for the current filters. */
    refresh(): Promise<void>;
    /** Keyboard-focused row id (aria-activedescendant target). */
    focusedId: string | null;
    focus(id: string): void;
    focusNext(): void;
    focusPrev(): void;
    /** Id of the feedback opened in the drawer, or `null`. */
    openedId: string | null;
    /** The opened record — survives leaving the filtered list while the drawer stays open. */
    opened: FeedbackRecord | null;
    openFeedback(id: string): void;
    closeFeedback(): void;
    /** Optimistic status change with rollback on error. Rejects after rolling back. */
    changeStatus(id: string, status: FeedbackStatus): Promise<void>;
    /** Optimistic delete (no undo — confirm in the UI) with rollback on error. Rejects after rolling back. */
    deleteFeedback(id: string): Promise<void>;
    /** Last status change eligible for undo, or `null`. */
    pendingUndo: {
        id: string;
        previousStatus: FeedbackStatus;
    } | null;
    /** Revert the pending status change. Clears `pendingUndo` without creating a new one. */
    undo(): Promise<void>;
}
/** Presentation props specific to the shipped `<InstaFixInbox />` component. */
interface InstaFixInboxPresentationProps {
    /** Accent color (any `#RGB`/`#RRGGBB`/`#RRGGBBAA` hex) — defaults to `"#0066ff"`. */
    accentColor?: string | undefined;
    /** Color theme — defaults to `"auto"`, which tracks the system preference live. */
    theme?: InboxTheme | undefined;
    /** Row density — defaults to `"comfortable"`. */
    density?: "comfortable" | "compact" | undefined;
    /** UI locale — defaults to `"ko"`; non-English, non-Korean built-ins are lazy-loaded. */
    locale?: InstaFixLocale | undefined;
    /** Extra class name(s) appended to the root element. */
    className?: string | undefined;
    /** Query parameter used by "Open on page" deep links — defaults to `"instafix"`. */
    deepLinkParam?: string | undefined;
    /** Replaces the default empty state shown when the project has no feedback at all. */
    emptyState?: ReactNode | undefined;
}
/** Props accepted by `<InstaFixInbox />` — source-mode options plus presentation. */
type InstaFixInboxProps = UseInstaFixInboxOptions & InstaFixInboxPresentationProps;

/**
 * Linear-style triage inbox for InstaFix feedback.
 *
 * Renders in plain DOM (no Shadow DOM) with all styles scoped under
 * `.ifd-root`. Keyboard-first: j/k navigate, Enter opens, e/p/x change
 * status, u undoes, "?" shows the full cheat sheet.
 */
declare function InstaFixInbox(props: InstaFixInboxProps): ReactElement;

/** All translatable string keys used by the dashboard inbox. */
interface Translations {
    "inbox.regionLabel": string;
    "inbox.listLabel": string;
    "inbox.statusFilter": string;
    "inbox.searchPlaceholder": string;
    "inbox.searchAria": string;
    "inbox.clearSearch": string;
    /** Screen-reader announcement of the visible result count. */
    "inbox.resultsCount": string;
    "inbox.typeFilter": string;
    "inbox.typeAll": string;
    "inbox.project": string;
    "inbox.refresh": string;
    "inbox.loadMore": string;
    "inbox.emptyTitle": string;
    "inbox.emptySub": string;
    "inbox.emptyFilteredTitle": string;
    "inbox.emptyFilteredSub": string;
    "inbox.viewAll": string;
    "inbox.inboxZeroTitle": string;
    "inbox.inboxZeroSub": string;
    "inbox.loadError": string;
    "inbox.retry": string;
    "inbox.cancel": string;
    "inbox.undo": string;
    "inbox.actionFailed": string;
    "inbox.copied": string;
    "inbox.markedAs": string;
    "inbox.deleted": string;
    "status.all": string;
    "status.open": string;
    "status.in_progress": string;
    "status.resolved": string;
    "status.wont_fix": string;
    "type.question": string;
    "type.change": string;
    "type.bug": string;
    "type.other": string;
    "drawer.title": string;
    "drawer.close": string;
    "drawer.openOnPage": string;
    "drawer.status": string;
    "drawer.author": string;
    "drawer.page": string;
    "drawer.viewport": string;
    "drawer.submitted": string;
    "drawer.browser": string;
    "drawer.anchor": string;
    "drawer.diagnostics": string;
    "drawer.showAllDiagnostics": string;
    "drawer.hideAnnotation": string;
    "drawer.showAnnotation": string;
    "drawer.screenshotAlt": string;
    "drawer.zoomScreenshot": string;
    "drawer.noScreenshot": string;
    "drawer.delete": string;
    "drawer.deleteConfirm": string;
    "drawer.deleteYes": string;
    "hints.navigate": string;
    "hints.open": string;
    "hints.resolve": string;
    "hints.inProgress": string;
    "hints.wontFix": string;
    "hints.help": string;
    "shortcuts.title": string;
    "shortcuts.close": string;
    "time.now": string;
    "time.minutes": string;
    "time.hours": string;
    "time.days": string;
    "time.weeks": string;
    "time.month": string;
    "time.months": string;
    "time.year": string;
    "time.years": string;
}

/**
 * Register a custom locale at runtime. Partial dictionaries are welcome —
 * missing keys fall back to English per key, so overriding a single string
 * never requires copying the whole catalog.
 */
declare const registerLocale: (code: string, translations: Partial<Translations>) => void;

/**
 * Build an `InboxSource` talking HTTP to a InstaFix endpoint (e.g. the
 * `@instafix/adapter-prisma` request handlers mounted at `/api/instafix`).
 *
 * Auth: `apiKey` becomes `Authorization: Bearer <apiKey>`; `headers` (static
 * or per-request function, sync or async) are merged on top, so an explicit
 * `Authorization` header wins over `apiKey`.
 */
declare function createEndpointSource(options: EndpointSourceOptions): InboxSource;
/**
 * Build an `InboxSource` over a `InstaFixStore` directly (client-side mode).
 *
 * Closure semantics live at this edge: `resolvedAt` is set when a feedback
 * enters a closed status and cleared otherwise — the store persists what it
 * is given.
 */
declare function createStoreSource(store: InstaFixStore): InboxSource;

/**
 * Headless triage-inbox hook — full state + actions behind `<InstaFixInbox />`.
 *
 * - Fetches on mount and whenever project / status / type / debounced search
 *   change; stale responses are discarded via a request token (latest wins).
 * - Tab counts are refreshed alongside page 1 (limit-1 queries, best-effort)
 *   and adjusted locally on mutations.
 * - `changeStatus` / `deleteFeedback` are optimistic with rollback on error;
 *   the rejected promise carries the error so UIs can toast on top of the
 *   `onError` callback.
 */
declare function useInstaFixInbox(options: UseInstaFixInboxOptions): InboxState;

export { type EndpointSourceOptions, type InboxCustomSourceOptions, type InboxEndpointOptions, type InboxSharedOptions, type InboxSource, type InboxState, type InboxStatusFilter, type InboxStoreOptions, type InboxTheme, type InboxTypeFilter, InstaFixInbox, type InstaFixInboxPresentationProps, type InstaFixInboxProps, type ResolvedTheme, type UseInstaFixInboxOptions, createEndpointSource, createStoreSource, registerLocale, useInstaFixInbox };
