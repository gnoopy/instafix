/**
 * DEV-ONLY source hint — map a clicked DOM element back to the component
 * source file that rendered it, so an agent prompt can say
 * `Component: components/ContactForm.tsx:38 <EmailField>` instead of making
 * the agent reverse-engineer a CSS selector.
 *
 * Source: React's development builds attach a fiber to each host element
 * (`__reactFiber$<random>` key) whose `_debugSource` carries
 * `{fileName, lineNumber}` and whose owner chain carries component names.
 * Production builds strip all of this — `npm run build && start` yields no
 * hint, and every caller degrades silently (the selector-based Target block
 * remains the fallback), matching the widget's fail-closed discipline.
 */

export interface SourceHint {
  /** e.g. "components/ContactForm.tsx:38" — path trimmed to stay readable. */
  location: string;
  /** Nearest named component up the owner chain, e.g. "EmailField" — may be empty. */
  componentName: string;
}

interface DebugSource {
  fileName?: unknown;
  lineNumber?: unknown;
}

interface FiberLike {
  _debugSource?: DebugSource | null;
  _debugOwner?: FiberLike | null;
  return?: FiberLike | null;
  type?: unknown;
  elementType?: unknown;
}

/** Trim an absolute bundler path to the interesting project-relative tail. */
function trimFileName(fileName: string): string {
  // Common shapes: "/Users/x/app/components/Foo.tsx", "webpack-internal:///./components/Foo.tsx"
  const cleaned = fileName.replace(/^webpack-internal:\/\/\/(\.\/)?/, "").replace(/\\/g, "/");
  const parts = cleaned.split("/");
  // Keep at most the last 4 segments — enough to identify the file uniquely
  // in a repo without dragging the whole machine path into the prompt.
  return parts.slice(-4).join("/");
}

function componentNameOf(fiber: FiberLike): string {
  const t = fiber.type ?? fiber.elementType;
  if (typeof t === "function") return (t as { displayName?: string; name?: string }).displayName ?? t.name ?? "";
  if (t && typeof t === "object") {
    const named = t as { displayName?: string; render?: { name?: string } };
    return named.displayName ?? named.render?.name ?? "";
  }
  return "";
}

/**
 * Extract a source hint for `el`, or null when unavailable (production
 * build, non-React host, or any unexpected shape — never throws).
 */
export function getSourceHint(el: Element): SourceHint | null {
  try {
    const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
    if (!key) return null;
    let fiber = (el as unknown as Record<string, FiberLike | undefined>)[key];

    // Walk up (owner chain first, then parent chain) until a fiber carries a
    // _debugSource — the host element's own fiber often has it directly.
    let source: { fileName: string; lineNumber: number } | null = null;
    let componentName = "";
    let hops = 0;
    while (fiber && hops < 20) {
      const ds = fiber._debugSource;
      if (ds && typeof ds.fileName === "string" && typeof ds.lineNumber === "number" && !source) {
        source = { fileName: ds.fileName, lineNumber: ds.lineNumber };
      }
      if (!componentName) {
        const name = componentNameOf(fiber);
        // Skip host tags ("div") — we want the authored component's name.
        if (name && /^[A-Z]/.test(name)) componentName = name;
      }
      if (source && componentName) break;
      fiber = fiber._debugOwner ?? fiber.return ?? undefined;
      hops++;
    }

    if (!source) return null;
    return {
      location: `${trimFileName(source.fileName)}:${source.lineNumber}`,
      componentName,
    };
  } catch {
    return null;
  }
}
