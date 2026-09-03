import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteLocale } from "@/lib/site-i18n/locale";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://instafix.realstory.blog"),
  title: {
    default: "InstaFix — From Web UI to Agent-Ready Prompt",
    template: "%s — InstaFix",
  },
  description:
    "Point at what's wrong in the browser and get a ready-made prompt for Claude Code, Cursor, or any coding agent — exact DOM target, screenshot, and console errors included.",
  openGraph: {
    title: "InstaFix — From Web UI to Agent-Ready Prompt",
    description:
      "Point at what's wrong in the browser and get a ready-made prompt for Claude Code, Cursor, or any coding agent — exact DOM target, screenshot, and console errors included.",
    url: "https://instafix.realstory.blog",
    siteName: "InstaFix",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaFix — From Web UI to Agent-Ready Prompt",
    description: "Point at what's wrong in the browser and get a ready-made prompt for your coding agent.",
  },
  other: {
    "theme-color": "#030712",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getSiteLocale();
  return (
    <html lang={locale} className={inter.variable}>
      <body className="bg-gray-950 font-sans text-gray-100">{children}</body>
    </html>
  );
}
