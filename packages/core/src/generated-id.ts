/**
 * Element ids a UI framework generates per render (`useId` and friends). They
 * change between mounts, so a selector or an agent hint built on one points at
 * nothing — or at a different element — the next time the page renders.
 * Capture skips them when building selectors, and the agent formatter omits
 * them from records that were captured before this rule existed.
 */
const GENERATED_ID_PATTERNS: readonly RegExp[] = [
  // React 18 `useId`: ":r0:", ":R1a:"
  /^:[rR][0-9a-zA-Z]*:$/,
  // React 19.0/19.1 `useId`: "«r0»"
  /^«[rR][0-9a-zA-Z]*»$/,
  // React 19.2 `useId` ("_r_7_"), also behind a library prefix ("base-ui-_r_7_")
  /(?:^|[-_:])_[rR]_[0-9a-zA-Z]*_$/,
  // Library prefixes around a React id: "radix-:r1:", "headlessui-menu-button-:r3:"
  /^radix-/,
  /^headlessui-/,
  /^base-ui-/,
  /^react-aria[0-9]*-/,
  /^(?:mui|mantine)-[0-9a-zA-Z]*[0-9]/,
];

export function isGeneratedElementId(id: string | null | undefined): boolean {
  if (!id) return false;
  return GENERATED_ID_PATTERNS.some((pattern) => pattern.test(id));
}
