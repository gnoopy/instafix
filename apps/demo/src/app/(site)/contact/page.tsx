import type { Metadata } from "next";
import { contactContent } from "@/lib/site-i18n/content/contact";
import { getSiteLocale } from "@/lib/site-i18n/locale";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "문의하기",
  description: "InstaFix에 대해 궁금한 점이나 제안하고 싶은 내용을 남겨주세요.",
};

export default async function ContactPage() {
  const siteLocale = await getSiteLocale();
  const t = contactContent[siteLocale];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 py-16">
      <div className="w-full max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">{t.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{t.description}</p>
        <div className="mt-8">
          <ContactForm siteLocale={siteLocale} />
        </div>
      </div>
    </main>
  );
}
