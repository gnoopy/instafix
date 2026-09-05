"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dismiss-on-outside-interaction popovers — the pattern that made InstaFix
 * unusable on some hosts: you open a menu, reach for "Select area", and the
 * menu is gone before you can draw on it.
 *
 * Three variants because real component libraries do not agree on which event
 * dismisses, and the difference decides whether a fix works:
 *
 * - `pointerdown` on document — Radix UI's DismissableLayer.
 * - `mousedown` on document — Headless UI and most hand-rolled menus.
 * - `focusout` on the container — focus-driven menus, common in a11y-first kits.
 *
 * All three treat "the event's target is not inside me" as "dismiss", and the
 * widget's toolbar lives outside them by construction, so all three used to
 * close on the way to the annotate button.
 */

type DismissOn = "pointerdown" | "mousedown" | "focusout";

const VARIANTS: ReadonlyArray<{ id: DismissOn; label: string; note: string }> = [
  { id: "pointerdown", label: "pointerdown", note: "Radix UI" },
  { id: "mousedown", label: "mousedown", note: "Headless UI" },
  { id: "focusout", label: "focusout", note: "focus-driven menus" },
];

function DismissablePopover({ dismissOn, note }: { dismissOn: DismissOn; note: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    if (dismissOn === "focusout") {
      const onFocusOut = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (next instanceof Node && container.contains(next)) return;
        setOpen(false);
      };
      container.addEventListener("focusout", onFocusOut);
      return () => container.removeEventListener("focusout", onFocusOut);
    }

    // `event.target` is what these libraries test, and for anything inside a
    // shadow root the browser retargets it to the shadow HOST — so a click on
    // an InstaFix toolbar button arrives as `<instafix-widget>`, which is
    // genuinely not inside this popover. Hence the dismiss.
    const onOutside = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && container.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener(dismissOn, onOutside);
    return () => document.removeEventListener(dismissOn, onOutside);
  }, [open, dismissOn]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        data-testid={`popover-trigger-${dismissOn}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:border-gray-400"
      >
        {dismissOn}
        <span className="ml-2 text-xs font-normal text-gray-400">{note}</span>
      </button>

      {open ? (
        <div
          data-testid={`popover-panel-${dismissOn}`}
          className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          <p className="px-2 py-1 text-xs text-gray-400">Try drawing a box on this menu</p>
          {["Rename", "Duplicate", "Move to…", "Delete"].map((item) => (
            <button
              key={item}
              type="button"
              className="block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Gallery entry: three popovers, one per dismissal mechanism. */
export function DemoPopovers() {
  return (
    <div className="space-y-3">
      {VARIANTS.map((variant) => (
        <DismissablePopover key={variant.id} dismissOn={variant.id} note={variant.note} />
      ))}
    </div>
  );
}
