import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoSite } from "@/components/demo/demo-site";
import { getSiteLocale } from "@/lib/site-i18n/locale";
import { Playground } from "./playground";

export const metadata: Metadata = {
  title: "Live Demo",
  description: "Try InstaFix live — draw annotations, leave comments, directly on a demo website.",
  openGraph: {
    title: "InstaFix — Live Demo",
    description: "Try InstaFix live — draw annotations, leave comments, directly on a demo website.",
    url: "https://instafix.realstory.blog/demo",
  },
};

export default async function DemoPage() {
  const siteLocale = await getSiteLocale();

  return (
    <>
      {/* useSearchParams in Playground requires a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <Playground siteLocale={siteLocale} />
      </Suspense>
      <DemoSite locale={siteLocale} />
    </>
  );
}
