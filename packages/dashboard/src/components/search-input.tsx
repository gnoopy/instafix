import type { ReactElement, RefObject } from "react";
import { useInboxUi } from "./context.js";
import { CloseIcon, SearchIcon } from "./icons.js";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Forwarded so the root "/" shortcut can focus the field. */
  inputRef: RefObject<HTMLInputElement | null>;
}

/** Toolbar search field — updates state synchronously; the hook debounces the refetch. */
export function SearchInput({ value, onChange, inputRef }: SearchInputProps): ReactElement {
  const { t } = useInboxUi();
  return (
    <div className="ifd-search">
      <SearchIcon />
      <input
        ref={inputRef}
        className="ifd-search-input"
        type="search"
        placeholder={t("inbox.searchPlaceholder")}
        aria-label={t("inbox.searchAria")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="ifd-search-clear"
          aria-label={t("inbox.clearSearch")}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <CloseIcon />
        </button>
      ) : (
        <kbd className="ifd-kbd">/</kbd>
      )}
    </div>
  );
}
