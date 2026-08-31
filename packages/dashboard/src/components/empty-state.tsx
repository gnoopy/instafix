import type { ReactElement, ReactNode } from "react";
import type { InboxState } from "../types.js";
import { useInboxUi } from "./context.js";
import { CheckIcon, SearchIcon, StatusOpenIcon } from "./icons.js";

interface EmptyStateProps {
  state: InboxState;
  /** Host-provided replacement for the default "no feedback yet" state. */
  custom?: ReactNode | undefined;
}

/**
 * Empty list states, most specific first:
 * - inbox zero — the "open" tab is empty while the project has feedback: the good news state;
 * - filtered empty — an active filter matches nothing, with a one-click way out;
 * - project empty — no feedback at all (replaceable via the `emptyState` prop).
 */
export function EmptyState({ state, custom }: EmptyStateProps): ReactElement {
  const { t } = useInboxUi();
  const filtered = state.status !== "all" || state.type !== "all" || state.search !== "";
  const projectHasFeedback = (state.counts.all ?? 0) > 0;
  const inboxZero = state.status === "open" && state.type === "all" && state.search === "" && projectHasFeedback;

  if (inboxZero) {
    return (
      <div className="ifd-empty">
        <span className="ifd-empty-glyph" aria-hidden="true">
          <CheckIcon />
        </span>
        <div className="ifd-empty-title">{t("inbox.inboxZeroTitle")}</div>
        <div className="ifd-empty-sub">{t("inbox.inboxZeroSub")}</div>
      </div>
    );
  }

  if (filtered) {
    return (
      <div className="ifd-empty">
        <span className="ifd-empty-glyph" aria-hidden="true">
          <SearchIcon />
        </span>
        <div className="ifd-empty-title">{t("inbox.emptyFilteredTitle")}</div>
        <div className="ifd-empty-sub">{t("inbox.emptyFilteredSub")}</div>
        <button
          type="button"
          className="ifd-btn-ghost"
          onClick={() => {
            state.setStatus("all");
            state.setType("all");
            state.setSearch("");
          }}
        >
          {t("inbox.viewAll")}
        </button>
      </div>
    );
  }

  if (custom !== undefined) return <>{custom}</>;

  return (
    <div className="ifd-empty">
      <span className="ifd-empty-glyph" aria-hidden="true">
        <StatusOpenIcon />
      </span>
      <div className="ifd-empty-title">{t("inbox.emptyTitle")}</div>
      <div className="ifd-empty-sub">{t("inbox.emptySub")}</div>
    </div>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

/** Load failure — `.ifd-empty` layout with a retry action. */
export function ErrorState({ error, onRetry }: ErrorStateProps): ReactElement {
  const { t } = useInboxUi();
  return (
    <div className="ifd-empty ifd-error">
      <div className="ifd-empty-title">{t("inbox.loadError")}</div>
      <div className="ifd-empty-sub">{error.message}</div>
      <button type="button" className="ifd-btn" onClick={onRetry}>
        {t("inbox.retry")}
      </button>
    </div>
  );
}
