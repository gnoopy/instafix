[![npm version](https://img.shields.io/npm/v/@instafix/widget)](https://www.npmjs.com/package/@instafix/widget)
[![Live Demo](https://img.shields.io/badge/demo-try%20it%20live-22c55e)](https://instafix.realstory.blog/demo)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/widget)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/widget

**Client feedback, pinned to the pixel.**

A lightweight feedback widget that lets your clients annotate websites during development. Draw rectangles (or right-click), leave comments, track bugs — directly on the live site, anchored to the exact DOM element.

Part of [InstaFix](https://github.com/gnoopy/InstaFix) — **[live demo](https://instafix.realstory.blog/demo)** · **[documentation](https://instafix.realstory.blog/docs/widget)**.

## Install

```bash
npm install @instafix/widget
```

## Quick start

React (the hook survives StrictMode double-mounts and tears down on unmount):

```tsx
"use client";
import { useInstaFix } from "@instafix/widget/react";

export function Feedback() {
  useInstaFix({ endpoint: "/api/instafix", projectName: "my-app" });
  return null;
}
```

Any other framework, or none:

```ts
import { initInstaFix } from "@instafix/widget";

const widget = initInstaFix({ endpoint: "/api/instafix", projectName: "my-app" });
// widget.open() / .close() / .refresh() / .focusFeedback(id) / .on(...) / .destroy()
```

No server? Pass `store: new LocalStorageStore()` (from `@instafix/adapter-localstorage`) instead of `endpoint` and the whole loop runs in the browser.

## Highlights

- **DOM-anchored annotations** — CSS selector + XPath + text fallbacks; they survive deploys and layout changes
- **Dev-only by default** — hides in production builds (`NODE_ENV`) and under 768 px; `forceShow: true` for staging
- **Opt-in extras** — screenshots of the annotated area (with `data-instafix-ignore="true"` privacy masking), console/network diagnostics, instant right-click comments that never hijack keyboard or modifier-key menus
- **Reliable** — retry with backoff plus a localStorage queue; a flaky network never loses a comment
- **Isolated & light** — closed Shadow DOM, ~30 KB gzip (ESM); panel, screenshot engine, and non-English locales load on demand
- **7 built-in locales** — en, fr, de, es, it, pt, ru (BCP-47 tags like `fr-CA` resolve automatically)

## Documentation

Every option with its real default and behavior: **[instafix.realstory.blog/docs/widget/configuration](https://instafix.realstory.blog/docs/widget/configuration)** — plus [screenshots & masking](https://instafix.realstory.blog/docs/widget/screenshots), [right-click comments](https://instafix.realstory.blog/docs/widget/right-click), and [how anchoring works](https://instafix.realstory.blog/docs/widget/anchoring).

## License

[MIT](https://github.com/gnoopy/InstaFix/blob/main/LICENSE)
