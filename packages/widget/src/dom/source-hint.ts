/**
 * DEV-ONLY source hint — map a clicked DOM element back to the component
 * that rendered it, so an agent prompt can say
 * `Component: <PasswordField> (in AccountKeyBootstrap) — components/…tsx:38`
 * instead of making the agent reverse-engineer a CSS selector.
 *
 * Two signals, best-effort in this order:
 * 1. `fiber._debugSource` (`{fileName, lineNumber}`) — present in React
 *    dev builds that still ship it (≤18 with the classic JSX dev
 *    transform). React 19 removed it, so this is a bonus, not the basis.
 * 2. The `_debugOwner` chain's COMPONENT NAMES — present in every React
 *    dev build (verified live against Next 14 / React 19 canary): the
 *    innermost few authored components ("PasswordField ‹
 *    AccountKeyBootstrap") pinpoint the file with a single grep.
 *
 * Production builds strip the fiber debug fields entirely — every caller
 * degrades silently (the selector-based Target block remains the
 * fallback), matching the widget's fail-closed discipline.
 */

export interface SourceHint {
  /** "components/ContactForm.tsx:38" — only when the renderer still exposes `_debugSource`; null on React 19+. */
  location: string | null;
  /** Owner-chain component names, innermost first ("PasswordField ‹ AccountKeyBootstrap") — never empty. */
  componentPath: string;
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

/** Framework-internal wrappers that would only add noise to the path. */
const FRAMEWORK_NAME_RE =
  /^(Inner|Outer)?(LayoutRouter|RenderFromTemplateContext|ScrollAndFocusHandler|Router|Head)|ErrorBoundary$|^(Loading|Template|Segment)Boundary/;
const MAX_PATH_NAMES = 2;

/**
 * Extract a source hint for `el`, or null when unavailable (production
 * build, non-React host, or any unexpected shape — never throws).
 */
export function getSourceHint(el: Element): SourceHint | null {
  try {
    const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
    if (!key) return null;
    let fiber = (el as unknown as Record<string, FiberLike | undefined>)[key];

    let source: { fileName: string; lineNumber: number } | null = null;
    const names: string[] = [];
    let hops = 0;
    while (fiber && hops < 25) {
      const ds = fiber._debugSource;
      if (!source && ds && typeof ds.fileName === "string" && typeof ds.lineNumber === "number") {
        source = { fileName: ds.fileName, lineNumber: ds.lineNumber };
      }
      if (names.length < MAX_PATH_NAMES) {
        const name = componentNameOf(fiber);
        // Authored components only: capitalized, not a host tag, not a
        // framework wrapper, no duplicates.
        if (name && /^[A-Z]/.test(name) && !FRAMEWORK_NAME_RE.test(name) && !names.includes(name)) {
          names.push(name);
        }
      }
      if (source && names.length >= MAX_PATH_NAMES) break;
      fiber = fiber._debugOwner ?? fiber.return ?? undefined;
      hops++;
    }

    if (names.length === 0 && !source) return null;
    return {
      location: source ? `${trimFileName(source.fileName)}:${source.lineNumber}` : null,
      componentPath: names.length > 0 ? names.join(" ‹ ") : "",
    };
  } catch {
    return null;
  }
}
