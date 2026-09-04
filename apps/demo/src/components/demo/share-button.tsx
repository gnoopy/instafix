"use client";

import { useCallback, useState } from "react";

/**
 * Copies the current page URL — not a passed-in string, unlike
 * components/landing/copy-button.tsx — so it always shares whatever the
 * visitor is actually looking at (including query params like ?theme=dark).
 * Two visual variants so the same behavior reads right in a solid hero, a
 * light card, and a dark footer without three separate components.
 */
interface ShareButtonProps {
  label: string;
  copiedLabel: string;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ShareButtonProps["variant"]>, string> = {
  solid: "bg-accent text-white shadow-sm hover:bg-accent-dark",
  outline: "border border-gray-300 text-gray-700 hover:border-accent hover:text-accent",
  ghost: "border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white",
};

export function ShareButton({ label, copiedLabel, variant = "solid", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {copied ? (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {copiedLabel}
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342a3 3 0 100 2.316m0-2.316a3 3 0 000 2.316m0-2.316l6.632-3.316m-6.632 5.632l6.632 3.316m0-9.264a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 0l-6.632 3.316m6.632 2.684a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
