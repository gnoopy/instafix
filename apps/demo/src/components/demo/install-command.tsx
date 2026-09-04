"use client";

import { useCallback, useState } from "react";

/** A copyable `npm install` line — concrete, pastable content for the "get started" section (also good SEO copy: real package names, not a screenshot of them). */
export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = command;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [command]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full max-w-md items-center justify-between gap-4 rounded-lg border border-gray-300 bg-gray-900 px-5 py-3.5 text-left font-mono text-sm text-gray-100 shadow-sm transition-colors hover:border-accent"
    >
      <span>
        <span className="text-gray-500">$</span> {command}
      </span>
      <span className="shrink-0 text-xs font-sans text-gray-400 group-hover:text-white">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
