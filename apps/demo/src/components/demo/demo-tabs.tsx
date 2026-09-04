"use client";

import { useState } from "react";

/** A real, interactive tab strip — one of the component-gallery entries, deliberately stateful so a visitor can annotate a specific tab's content, not just a screenshot of the default one. */
export function DemoTabs({ tabs }: { tabs: { label: string; content: string }[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === active
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="px-1 py-4 text-sm text-gray-600" role="tabpanel">
        {tabs[active]?.content}
      </div>
    </div>
  );
}
