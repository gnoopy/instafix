import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoSite } from "@/components/demo/demo-site";
import { getSiteLocale } from "@/lib/site-i18n/locale";
import { Playground } from "./playground";

// The parent layout's title template already appends "— InstaFix" — this
// stays free of that word so the rendered <title> doesn't repeat the brand
// three times ("InstaFixPlayground" already carries it once).
const TITLE = "InstaFixPlayground — Try It Live on Real Components";
const DESCRIPTION =
  "Draw a box around any button, form, table, or pricing card on this page and InstaFix hands you an agent-ready prompt — exact DOM selector, screenshot, and console errors — ready to paste into Claude Code, Cursor, or Windsurf. Framework-agnostic, local-first, open source.";
const KEYWORDS = [
  "InstaFix",
  "InstaFixPlayground",
  "visual feedback tool",
  "AI coding agent",
  "Claude Code",
  "Cursor",
  "Windsurf",
  "click to annotate",
  "DOM selector",
  "screenshot bug report",
  "developer feedback widget",
  "framework agnostic widget",
  "local-first feedback",
  "agent-ready prompt",
  "UI annotation",
  "bug report tool",
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: "InstaFixPlayground",
  category: "Developer Tools",
  authors: [{ name: "InstaFix", url: "https://github.com/gnoopy/instafix" }],
  alternates: {
    canonical: "https://instafix.realstory.blog/demo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://instafix.realstory.blog/demo",
    siteName: "InstaFixPlayground",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * JSON-LD structured data — the "GEO" half of the ask: search engines and
 * LLM-based answer engines both parse this directly, so it's written to be
 * correct on its own rather than mirroring on-page copy word for word. The
 * FAQ entries intentionally match demo-site.tsx's DemoAccordion content so a
 * crawler never sees two different answers to the same question.
 */
function StructuredData() {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "InstaFix",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (browser-based)",
    description: DESCRIPTION,
    url: "https://instafix.realstory.blog",
    downloadUrl: "https://www.npmjs.com/package/@instafix/widget",
    codeRepository: "https://github.com/gnoopy/instafix",
    license: "https://opensource.org/licenses/MIT",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does InstaFix require React?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No — the widget is vanilla JavaScript behind a Shadow DOM boundary, so it works on any framework or none at all.",
        },
      },
      {
        "@type": "Question",
        name: "Where does feedback get stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wherever you point it: a local SQLite file, a filesystem folder, or your own store via the adapter-kit contract. Nothing goes through InstaFix's own servers.",
        },
      },
      {
        "@type": "Question",
        name: "Can an AI agent pick up feedback automatically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — the CLI's agent-loop commands (prompt / resolve / watch) let a running Claude Code session pull queued feedback without a human pasting anything.",
        },
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "InstaFix", item: "https://instafix.realstory.blog" },
      { "@type": "ListItem", position: 2, name: "Playground", item: "https://instafix.realstory.blog/demo" },
    ],
  };

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user-controlled JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user-controlled JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user-controlled JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default async function DemoPage() {
  const siteLocale = await getSiteLocale();

  return (
    <>
      <StructuredData />
      {/* useSearchParams in Playground requires a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <Playground siteLocale={siteLocale} />
      </Suspense>
      <DemoSite locale={siteLocale} />
    </>
  );
}
