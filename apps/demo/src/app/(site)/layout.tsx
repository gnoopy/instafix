import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteLocale } from "@/lib/site-i18n/locale";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://instafix.realstory.blog"),
  title: {
    default: "InstaFix — Client feedback, pinned to the pixel",
    template: "%s — InstaFix",
  },
  description:
    "Open-source feedback widget for freelancers and agencies. DOM-anchored annotations, self-hosted, zero SaaS fees.",
  openGraph: {
    title: "InstaFix — Client feedback, pinned to the pixel",
    description:
      "Open-source feedback widget for freelancers and agencies. DOM-anchored annotations, self-hosted, zero SaaS fees.",
    url: "https://instafix.realstory.blog",
    siteName: "InstaFix",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaFix — Client feedback, pinned to the pixel",
    description: "Open-source feedback widget. Self-hosted, DOM-anchored, npm install and go.",
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
