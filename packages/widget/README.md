[![Live Demo](https://img.shields.io/badge/demo-try%20it%20live-22c55e)](https://instafix.realstory.blog/demo)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/widget)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/widget

**Point at the UI while a coding agent builds it — get a ready-made prompt.**

Mark a UI problem directly on the running page: draw a rectangle, or click the toolbar's target button and click the element. Type a short note. It's saved as a **fix note**, pinned to the exact DOM element, with a stable selector, a screenshot, and the element's DOM path and computed styles — and it's agent-ready Markdown from the moment it's saved.

Part of [InstaFix](https://github.com/gnoopy/instafix) — **[live demo](https://instafix.realstory.blog/demo)** · **[documentation](https://instafix.realstory.blog/docs/widget)**.

## Install

```bash
npm install @instafix/widget
```

Or let the CLI scaffold the API route, the widget component, and the `/instafix` agent command for you:

```bash
npx @instafix/cli@latest init
```

Requires Node 22+ for the tooling; the widget itself runs in the browser.

## Quick start

React (the hook survives StrictMode double-mounts and tears down on unmount):

```tsx
"use client";
import { useInstaFix } from "@instafix/widget/react";

export function InstaFixWidget() {
  useInstaFix({ endpoint: "/api/instafix", projectName: "my-app" });
  return null;
}
```

Any other framework, or none:

```ts
import { initInstaFix } from "@instafix/widget";

const instafix = initInstaFix({ endpoint: "/api/instafix", projectName: "my-app" });
// instafix.open() / .close() / .refresh() / .focusFeedback(id) / .on(...) / .destroy()
```

That's the whole setup. It's dev-only by default, so nothing ships to real visitors.

## Handing notes to an agent

The panel's **Copy Prompt** button puts every open note on the current page (or across pages) on the clipboard as Markdown — paste it into Claude Code, Cursor, Copilot, anything. Already have a session running? `npx @instafix/cli prompt --status open | claude -p` pipes them in instead, and the prompt tells the agent how to close each note by ID once it's fixed. See [Agent workflow](https://instafix.realstory.blog/docs/agent-workflow).

## Highlights

- **DOM-anchored** — CSS selector + XPath + text fallbacks, so a note survives deploys and the agent reshuffling your layout
- **Context an agent can act on** — the annotated element's DOM path and computed styles travel with the note, plus an optional screenshot of the marked area (with `data-instafix-ignore="true"` privacy masking) and console/network diagnostics
- **Freeze the page** — pause animations and pin the hovered subtree so you can annotate a dropdown, a toast, or a mid-transition state that won't hold still
- **Batch across pages** — mark several things, on several pages, then hand them over as one prompt
- **No sign-in** — notes are anonymous by default; set `identity` from your app, or `requireIdentity: true` to ask once and remember
- **Dev-only by default** — hides when `process.env.NODE_ENV === "production"` and under 768 px; `forceShow: true` for staging
- **Isolated & light** — closed Shadow DOM, ~45 KB gzip (ESM entry); panel, screenshot engine, and non-English locales load on demand
- **8 built-in locales** — en, ko (default), fr, de, es, it, pt (Brazilian), ru (BCP-47 tags like `fr-CA` resolve automatically)

## Documentation

Every option with its real default and behavior: **[instafix.realstory.blog/docs/widget/configuration](https://instafix.realstory.blog/docs/widget/configuration)** — plus [screenshots & masking](https://instafix.realstory.blog/docs/widget/screenshots), [copy for your agent](https://instafix.realstory.blog/docs/widget/copy-for-claude-code), and [how anchoring works](https://instafix.realstory.blog/docs/widget/anchoring).

Running the whole loop in the browser with no API route at all is possible too — pass a `store` instead of an `endpoint`. It's meant for prototypes and for working on InstaFix itself; see [adapters](https://instafix.realstory.blog/docs/adapters/localstorage).

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
