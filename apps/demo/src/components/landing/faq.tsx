import Link from "next/link";
import type { ReactNode } from "react";
import { type FaqId, faqContent } from "@/lib/site-i18n/content/faq";
import { getSiteLocale } from "@/lib/site-i18n/locale";

const faqIds: FaqId[] = [
  "databases",
  "frameworks",
  "layoutChanges",
  "dashboard",
  "bundleSize",
  "gdpr",
  "customize",
  "accessible",
  "reviewerData",
  "account",
];

export async function Faq() {
  const locale = await getSiteLocale();
  const t = faqContent[locale];

  return (
    <section id="faq" className="bg-gray-950 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section title */}
        <div data-gsap="section-title" className="text-center">
          <div className="mx-auto mb-4 h-px w-8 bg-accent/50" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.heading}</h2>
        </div>

        {/* FAQ grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
          {faqIds.map((id) => {
            const item = t.items[id];
            let answer: ReactNode = item.answer;
            if (id === "dashboard") {
              answer = (
                <>
                  {item.answer}{" "}
                  <Link
                    href="/demo/inbox"
                    className="text-accent-light underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light"
                  >
                    {t.dashboardLinkText}
                  </Link>
                  .
                </>
              );
            }
            return (
              <div key={id} data-gsap="faq-item">
                <h3 className="font-medium text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{answer}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
