"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SITE_LOCALE_COOKIE, type SiteLocale } from "./constants";

/** Persist the visitor's chosen site locale and re-render the current page in it. */
export async function setSiteLocale(locale: SiteLocale, pathname: string): Promise<void> {
  const store = await cookies();
  store.set(SITE_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath(pathname);
}
