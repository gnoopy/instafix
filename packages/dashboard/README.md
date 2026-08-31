[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/dashboard)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/dashboard

**A Linear-style triage inbox for your InstaFix feedback.**

`<InstaFixInbox />` is a keyboard-first React component that lists every feedback your clients sent through [`@instafix/widget`](https://instafix.realstory.blog/docs/widget) — annotated screenshots re-rendered as the client framed them, status triage (open / in progress / resolved / won't fix) with undo, search, and deep links back to the live page.

Part of [InstaFix](https://github.com/gnoopy/instafix) — **[documentation](https://instafix.realstory.blog/docs/dashboard)**.

## Install

Not on the npm registry — installs straight from this repo's build output:

```bash
npm install github:gnoopy/instafix#dashboard-dist
```

React 18 or 19 (peer dependency). Ships ESM **and** CJS, zero runtime dependencies besides React.

## Quick start

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox
  projects="my-app"
  endpoint="/api/instafix"
  apiKey={KEY}
  theme="auto"
/>
```

Give it a container with a height — it fills its parent (min 480 px) and adapts to the container's width, not the viewport.

Prefer your own UI? All the logic — fetching, filters, optimistic mutations, undo, pagination — is exposed as a headless hook:

```tsx
const inbox = useInstaFixInbox({ projects: "my-app", endpoint: "/api/instafix" });
```

## Highlights

- **Keyboard-first** — `j`/`k` navigate, `e`/`p`/`x` toggle statuses, `u` undo, `/` search, `?` shows the cheat sheet
- **Three data modes** — HTTP `endpoint`, in-process `store`, or a fully custom 3-method `source` (tRPC/GraphQL/server actions)
- **Themeable without Shadow DOM** — scoped `ifd-` classes and `--ifd-*` CSS variables; light/dark/auto with live system-theme tracking
- **8 built-in locales** (Korean is the default) plus runtime custom locales via `registerLocale`

## Documentation

Props, headless API, theming variables with the correct override selectors, custom sources: **[instafix.realstory.blog/docs/dashboard](https://instafix.realstory.blog/docs/dashboard)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
