import { InstaFixConfig, InstaFixInstance } from './instafix-core.cjs';

/**
 * React helper for `@instafix/widget`.
 *
 * `useInstaFix` initialises the widget once for the lifetime of the component
 * tree, even under React.StrictMode's double-invoke effect dance. Returns the
 * `InstaFixInstance` so consumers can drive `open()` / `close()` / `refresh()`
 * programmatically from anywhere in their tree.
 *
 * Why a dedicated entry instead of a snippet in the README:
 * - StrictMode mounts every effect twice in dev, which the obvious
 *   `useEffect(() => { const i = initInstaFix(...); return i.destroy }, [])`
 *   handles fine for *re-mount*, but not for the brief window where the
 *   second mount sees a still-alive widget (the widget's own singleton guard
 *   logs an info message and returns the existing instance — surprising
 *   noise for developers).
 * - The hook also captures the latest `config` in a ref so callbacks (e.g.
 *   `onFeedbackSent`) read closure values without re-initialising the widget.
 *
 * Peer dep on react ≥ 18 (declared as optional in package.json), so projects
 * that never import `@instafix/widget/react` don't need React installed.
 */

/**
 * Initialise the InstaFix widget for the lifetime of the calling component.
 *
 * Safe to call from a Server Component file as long as the component itself
 * is marked `"use client"` — the hook bails out cleanly on the server because
 * `useEffect` never runs there.
 *
 * @example Next.js App Router
 * ```tsx
 * "use client"
 * import { useInstaFix } from "@instafix/widget/react"
 *
 * export function FeedbackProvider({ children }: { children: React.ReactNode }) {
 *   useInstaFix({
 *     endpoint: "/api/instafix",
 *     projectName: "my-app",
 *   })
 *   return <>{children}</>
 * }
 * ```
 *
 * @example Driving the panel programmatically
 * ```tsx
 * "use client"
 * import { useInstaFix } from "@instafix/widget/react"
 *
 * export function HelpButton() {
 *   const widget = useInstaFix({ endpoint: "/api/instafix", projectName: "my-app" })
 *   return <button onClick={() => widget?.open()}>Need help?</button>
 * }
 * ```
 */
declare function useInstaFix(config: InstaFixConfig): InstaFixInstance | null;

export { useInstaFix };
