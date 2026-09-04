"use client";

import { InstaFixInbox } from "@instafix/dashboard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

/** In-copy link back to /demo. */
export function DemoSiteLink({ children }: { children: ReactNode }) {
  return (
    <Link href="/demo" className="text-gray-200 underline underline-offset-2 hover:text-white">
      {children}
    </Link>
  );
}

const LOCALES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["pt", "Português"],
  ["ru", "Русский"],
] as const;

type LocaleCode = (typeof LOCALES)[number][0];

/** Write one query param via history.replaceState (no navigation) — defaults drop out of the URL. */
function setQueryParam(key: string, value: string, defaultValue: string): void {
  const next = new URLSearchParams(window.location.search);
  if (value === defaultValue) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

interface SelectControlProps {
  label: string;
  id: string;
  value: string;
  defaultValue: string;
  queryKey: string;
  options: ReadonlyArray<readonly [string, string]>;
}

function SelectControl({ label, id, value, defaultValue, queryKey, options }: SelectControlProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs font-medium text-gray-400">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => setQueryParam(queryKey, event.target.value, defaultValue)}
        className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DemoInbox() {
  // ?theme=, ?density= and ?locale= — the URL is the source of truth so any
  // configuration stays shareable as a link.
  const params = useSearchParams();
  const themeParam = params.get("theme");
  const explicitTheme = themeParam === "light" || themeParam === "dark" || themeParam === "auto" ? themeParam : null;
  const density = params.get("density") === "compact" ? "compact" : "comfortable";
  const localeParam = params.get("locale");
  const explicitLocale = LOCALES.some(([code]) => code === localeParam) ? (localeParam as LocaleCode) : null;
  // The <select>s below need a concrete value to show as selected even with
  // no query string; InstaFixInbox needs the opposite — `undefined` so its
  // own prop ?? shared-settings ?? default fallback actually gets a turn
  // (see readSharedSettings) instead of always masking it with a hardcoded
  // "dark"/"en", same reasoning as the deliberate accentColor omission below.
  const theme = explicitTheme ?? "dark";
  const locale = explicitLocale ?? "en";

  const shared = {
    theme: explicitTheme ?? undefined,
    density,
    // No explicit accentColor — falls back to whatever the widget on /demo
    // last synced (see @instafix/dashboard's readSharedAccentColor), so this
    // page actually demonstrates the widget→dashboard color hand-off instead
    // of masking it with a fixed brand hex.
    locale: explicitLocale ?? undefined,
    className: "h-full",
  } as const;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <SelectControl
          label="Theme"
          id="inbox-theme"
          value={theme}
          defaultValue="dark"
          queryKey="theme"
          options={[
            ["light", "Light"],
            ["dark", "Dark"],
            ["auto", "Auto"],
          ]}
        />
        <SelectControl
          label="Density"
          id="inbox-density"
          value={density}
          defaultValue="comfortable"
          queryKey="density"
          options={[
            ["comfortable", "Comfortable"],
            ["compact", "Compact"],
          ]}
        />
        <SelectControl
          label="Locale"
          id="inbox-locale"
          value={locale}
          defaultValue="en"
          queryKey="locale"
          options={LOCALES}
        />
      </div>
      <div className="min-h-0 flex-1">
        <InstaFixInbox endpoint="/api/instafix" projects={["demo", "landing"]} {...shared} />
      </div>
    </div>
  );
}
