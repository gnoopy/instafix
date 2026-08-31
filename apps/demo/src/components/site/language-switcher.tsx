"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { setSiteLocale } from "@/lib/site-i18n/actions";
import { SITE_LOCALE_LABELS, SITE_LOCALES, type SiteLocale } from "@/lib/site-i18n/constants";

export function LanguageSwitcher({ current, className }: { current: SiteLocale; className?: string }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label="Language / 언어 / Langue"
      value={current}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as SiteLocale;
        startTransition(() => {
          void setSiteLocale(next, pathname);
        });
      }}
      className={
        className ??
        "rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm text-gray-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
      }
    >
      {SITE_LOCALES.map((locale) => (
        <option key={locale} value={locale} className="bg-gray-900 text-gray-100">
          {SITE_LOCALE_LABELS[locale]}
        </option>
      ))}
    </select>
  );
}
