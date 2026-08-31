import { FEEDBACK_TYPES } from "@instafix/core";
import type { ReactElement } from "react";
import { getTypeLabel } from "../i18n/index.js";
import type { InboxTypeFilter } from "../types.js";
import { useInboxUi } from "./context.js";

interface TypeFilterProps {
  type: InboxTypeFilter;
  onChange: (type: InboxTypeFilter) => void;
}

/** Native select filtering the list by feedback type. */
export function TypeFilter({ type, onChange }: TypeFilterProps): ReactElement {
  const { t } = useInboxUi();
  return (
    <select
      className="ifd-type-filter"
      aria-label={t("inbox.typeFilter")}
      value={type}
      onChange={(event) => onChange(event.target.value as InboxTypeFilter)}
    >
      <option value="all">{t("inbox.typeAll")}</option>
      {FEEDBACK_TYPES.map((value) => (
        <option key={value} value={value}>
          {getTypeLabel(value, t)}
        </option>
      ))}
    </select>
  );
}
