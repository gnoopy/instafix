import { isGeneratedElementId } from "@instafix/core";

/** An id worth anchoring on — not one a framework generated for this render. */
function stableId(element: Element): string {
  return element.id && !isGeneratedElementId(element.id) ? element.id : "";
}

/**
 * Generate an optimized XPath for a DOM element.
 *
 * Strategy:
 * - If the element has a unique id → //tag[@id='value']
 * - Otherwise, walk up the tree building /tag[position] segments
 *   until we hit an ancestor with an id or reach <body>
 * - Cap depth at 6 levels to keep paths short
 */
export function generateXPath(element: Element): string {
  const ownId = stableId(element);
  if (ownId) {
    const safeId = ownId.includes("'") ? `concat('${ownId.replace(/'/g, "',\"'\",'")}')` : `'${ownId}'`;
    return `//${element.localName}[@id=${safeId}]`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && segments.length < 6) {
    const tag = current.localName;
    const parent: Element | null = current.parentElement;

    const currentId = stableId(current);
    if (currentId) {
      const safeId = currentId.includes("'") ? `concat('${currentId.replace(/'/g, "',\"'\",'")}')` : `'${currentId}'`;
      segments.unshift(`/${tag}[@id=${safeId}]`);
      return "/" + segments.join("");
    }

    // Compute position among same-tag siblings
    let position = 1;
    if (parent) {
      for (const sibling of parent.children) {
        if (sibling === current) break;
        if (sibling.localName === tag) position++;
      }
    }

    segments.unshift(`/${tag}[${position}]`);
    current = parent;
  }

  return "/html/body" + segments.join("");
}
