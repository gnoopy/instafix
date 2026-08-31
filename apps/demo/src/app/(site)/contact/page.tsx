import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "문의하기",
  description: "InstaFix에 대해 궁금한 점이나 제안하고 싶은 내용을 남겨주세요.",
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 py-16">
      <div className="w-full max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">Contact</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">문의하기</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          InstaFix에 대한 질문, 제안, 버그 제보 등 무엇이든 남겨주세요. 확인 후 이메일로 답변드리겠습니다.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
