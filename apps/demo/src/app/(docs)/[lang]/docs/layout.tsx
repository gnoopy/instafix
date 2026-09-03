import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import Image from "next/image";
import type { ReactNode } from "react";
import { source } from "@/lib/docs/source";
import { DocsWidget } from "./docs-widget";

export default async function Layout({ params, children }: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const { lang } = await params;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <>
            <Image src="/brand/icon.png" alt="" width={20} height={20} className="h-5 w-5" />
            InstaFix
          </>
        ),
        mode: "top",
      }}
      githubUrl="https://github.com/gnoopy/instafix"
    >
      {children}
      <DocsWidget locale={lang} />
    </DocsLayout>
  );
}
