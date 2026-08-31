import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoSite } from "@/components/demo/demo-site";
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

export default function DemoPage() {
  return (
    <>
      {/* useSearchParams in Playground requires a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <Playground />
      </Suspense>
      <DemoSite />
    </>
  );
}
