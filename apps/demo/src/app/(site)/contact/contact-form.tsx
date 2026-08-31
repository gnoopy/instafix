"use client";

import { type FormEvent, useState } from "react";
import type { SiteLocale } from "@/lib/site-i18n/constants";
import { contactContent } from "@/lib/site-i18n/content/contact";

type Status = "idle" | "submitting" | "success" | "error";

const INPUT_CLASSNAME =
  "w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-accent focus:outline-none disabled:opacity-60";

export function ContactForm({ siteLocale }: { siteLocale: SiteLocale }) {
  const t = contactContent[siteLocale];
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : t.genericErrorMessage;
        setErrorMessage(message);
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setErrorMessage(t.genericErrorMessage);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 text-center">
        <p className="text-lg font-semibold text-white">{t.successTitle}</p>
        <p className="mt-2 text-sm text-gray-400">{t.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
          {t.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={status === "submitting"}
          className={INPUT_CLASSNAME}
          placeholder={t.namePlaceholder}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
          {t.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={status === "submitting"}
          className={INPUT_CLASSNAME}
          placeholder={t.emailPlaceholder}
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-300">
          {t.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={status === "submitting"}
          className={`${INPUT_CLASSNAME} resize-none`}
          placeholder={t.messagePlaceholder}
        />
      </div>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t.submittingLabel : t.submitLabel}
      </button>
    </form>
  );
}
