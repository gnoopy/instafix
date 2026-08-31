<div align="center">

<h1>InstaFix</h1>

**Client feedback, pinned to the pixel.**

A lightweight feedback widget that lets your clients annotate websites during development.
Draw rectangles, leave comments, track bugs — directly on the live site.

![Demo](./demo.gif)

[![Website](https://img.shields.io/badge/website-instafix.realstory.blog-000000?style=flat&colorA=000000&colorB=000000)](https://instafix.realstory.blog)
[![Live Demo](https://img.shields.io/badge/demo-try%20it%20live-22c55e?style=flat&colorA=000000)](https://instafix.realstory.blog/demo)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog%2Fdocs-0066ff?style=flat&colorA=000000)](https://instafix.realstory.blog/docs)
[![npm version](https://img.shields.io/npm/v/@instafix/widget?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@instafix/widget)
[![npm downloads](https://img.shields.io/npm/dm/@instafix/widget?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@instafix/widget)
[![license](https://img.shields.io/npm/l/@instafix/widget?style=flat&colorA=000000&colorB=000000)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/gnoopy/InstaFix/ci.yml?style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/InstaFix/actions)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/gnoopy/InstaFix/codeql.yml?label=CodeQL&style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/InstaFix/security/code-scanning)
[![coverage](https://img.shields.io/codecov/c/github/gnoopy/InstaFix?style=flat&colorA=000000&colorB=000000)](https://app.codecov.io/gh/gnoopy/InstaFix)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/gnoopy/InstaFix?label=scorecard&style=flat&colorA=000000&colorB=000000)](https://scorecard.dev/viewer/?uri=github.com/gnoopy/InstaFix)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/widget-~30%20KB%20gzip%20(ESM)-blue)](./packages/widget/.size-limit.json)

[**Documentation**](https://instafix.realstory.blog/docs) &middot; [Quickstart](https://instafix.realstory.blog/docs/quickstart) &middot; [Live Demo](https://instafix.realstory.blog/demo) &middot; [Contributing](./CONTRIBUTING.md)

</div>

> **[See InstaFix in action →](https://instafix.realstory.blog/demo)** — Draw annotations, leave feedback, track bugs directly on the live site.

---

## Why InstaFix?

Stop chasing client feedback across Slack threads, email chains, and Notion docs. InstaFix gives your clients a **contextual** way to leave feedback — anchored to the exact element they're looking at.

| | InstaFix | Marker.io | BugHerd |
|---|---|---|---|
| **Self-hosted** | Yes — your DB, your data | No (SaaS) | No (SaaS) |
| **npm package** | `npm install` and go | npm + script tag | Script tag only |
| **Framework-native** | First-class Next.js support | Framework-agnostic | Framework-agnostic |
| **Pricing** | Free & open source | From $39/mo | From $42/mo |
| **DOM-anchored annotations** | Multi-selector (CSS + XPath + text) | Screenshot-based | Pin-based |
| **Annotations survive layout changes** | Yes (percentage-relative rects) | No (pixel coordinates) | Partially |

## Features

- **Rectangle annotations** — clients draw directly on the page, with category + message
- **DOM-anchored persistence** — annotations tie to elements, not pixels; they survive layout changes
- **Instant right-click comments** — opt-in, and it never hijacks keyboard or modifier-key context menus
- **Screenshots + diagnostics** — opt-in JPEG of the annotated area (with privacy masking) and console/network capture
- **Triage inbox** — `<InstaFixInbox />` (`@instafix/dashboard`): Linear-style, keyboard-first, light/dark, 7 locales
- **Reliability built in** — retry with backoff plus a localStorage queue; a flaky network never loses a comment
- **Shadow DOM isolation** — widget CSS never leaks into your site, and your site CSS never breaks the widget
- **Dev-only by default** — auto-hides in production builds unless `forceShow: true`
- **Lightweight** — ~30 KB gzipped (ESM); the panel, screenshot engine, and non-English locales load on demand

## Quickstart

```bash
npm i @instafix/widget @instafix/adapter-prisma
npx @instafix/cli init   # adds the Prisma models + generates the API route
npx prisma db push
```

```tsx
"use client";
import { useInstaFix } from "@instafix/widget/react";

export function Feedback() {
  useInstaFix({ endpoint: "/api/instafix", projectName: "my-app" });
  return null;
}
```

Your clients can now draw rectangles on the site and leave feedback. Triage it with one component:

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox projects="my-app" endpoint="/api/instafix" theme="auto" />
```

No server? The widget also runs fully client-side with `store: new LocalStorageStore()` — the [three-minute quickstart](https://instafix.realstory.blog/docs/quickstart) covers both paths, prerequisites included.

## Documentation

The full documentation lives at **[instafix.realstory.blog/docs](https://instafix.realstory.blog/docs)** (English and French) — every option, default, and behavior on these pages is verified against the source code.

| Package | | Docs |
|---|---|---|
| [`@instafix/widget`](./packages/widget) | The feedback widget (framework-agnostic + React hook) | [Widget](https://instafix.realstory.blog/docs/widget) · [Configuration](https://instafix.realstory.blog/docs/widget/configuration) · [Screenshots](https://instafix.realstory.blog/docs/widget/screenshots) |
| [`@instafix/dashboard`](./packages/dashboard) | Triage inbox component + headless hook | [Dashboard](https://instafix.realstory.blog/docs/dashboard) · [Theming](https://instafix.realstory.blog/docs/dashboard/theming) |
| [`@instafix/adapter-prisma`](./packages/adapter-prisma) | Production server adapter (auth, CORS, webhooks) | [Prisma adapter](https://instafix.realstory.blog/docs/adapters/prisma) |
| [`@instafix/adapter-memory`](./packages/adapter-memory) | In-memory store (tests, demos) | [Memory adapter](https://instafix.realstory.blog/docs/adapters/memory) |
| [`@instafix/adapter-localstorage`](./packages/adapter-localstorage) | Client-side store (zero server) | [localStorage adapter](https://instafix.realstory.blog/docs/adapters/localstorage) |
| [`@instafix/cli`](./packages/cli) | `init` / `sync` / `status` / `doctor` | [CLI](https://instafix.realstory.blog/docs/cli) |

## Contributing

Bug reports, locale translations, docs fixes, features — everything counts, and locale additions are the friendliest first PR. Start with [CONTRIBUTING.md](./CONTRIBUTING.md).

Maintaining a fork with extra features (semantic anchors, screenshot storage backends, positioning fixes have all come from forks)? An upstream PR — or even an issue describing what you built — lets everyone benefit.

## Contributors

Every line of code, locale, doc fix, and bug report makes InstaFix better. Huge thanks to everyone who has shown up — first-time contributors especially.

This project follows the [all-contributors](https://allcontributors.org) specification — every kind of contribution counts ([emoji key](https://allcontributors.org/docs/en/emoji-key)).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gnoopy"><img src="https://avatars.githubusercontent.com/u/63867369?v=4?s=100" width="100px;" alt="Olsen Matheo"/><br /><sub><b>Olsen Matheo</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=gnoopy" title="Code">💻</a> <a href="#maintenance-gnoopy" title="Maintenance">🚧</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=gnoopy" title="Documentation">📖</a> <a href="#design-gnoopy" title="Design">🎨</a> <a href="#infra-gnoopy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-gnoopy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/gnoopy/InstaFix/pulls?q=is%3Apr+reviewed-by%3Agnoopy" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=gnoopy" title="Tests">⚠️</a> <a href="#projectManagement-gnoopy" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alceops"><img src="https://avatars.githubusercontent.com/u/278831803?v=4?s=100" width="100px;" alt="Alce"/><br /><sub><b>Alce</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=alceops" title="Code">💻</a> <a href="#translation-alceops" title="Translation">🌍</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=alceops" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/reikjarloekl"><img src="https://avatars.githubusercontent.com/u/839540?v=4?s=100" width="100px;" alt="Jörn Bungartz"/><br /><sub><b>Jörn Bungartz</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/issues?q=author%3Areikjarloekl" title="Bug reports">🐛</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=reikjarloekl" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://innovation-agents.de"><img src="https://avatars.githubusercontent.com/u/915773?v=4?s=100" width="100px;" alt="Andi Keßler"/><br /><sub><b>Andi Keßler</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=andinger" title="Code">💻</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=andinger" title="Tests">⚠️</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=andinger" title="Documentation">📖</a> <a href="#ideas-andinger" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/gnoopy/InstaFix/issues?q=author%3Aandinger" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/grizodubov"><img src="https://avatars.githubusercontent.com/u/55758039?v=4?s=100" width="100px;" alt="Valerii"/><br /><sub><b>Valerii</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=grizodubov" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sjh9714"><img src="https://avatars.githubusercontent.com/u/163989462?v=4?s=100" width="100px;" alt="JinHyuk Sung"/><br /><sub><b>JinHyuk Sung</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=sjh9714" title="Code">💻</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=sjh9714" title="Tests">⚠️</a> <a href="https://github.com/gnoopy/InstaFix/issues?q=author%3Asjh9714" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.sendung.de/"><img src="https://avatars.githubusercontent.com/u/273727?v=4?s=100" width="100px;" alt="Marian Steinbach"/><br /><sub><b>Marian Steinbach</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/issues?q=author%3Amarians" title="Bug reports">🐛</a> <a href="#ideas-marians" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://humen.lmm.best/mcp/"><img src="https://avatars.githubusercontent.com/u/106986785?v=4?s=100" width="100px;" alt="LIghtJUNction"/><br /><sub><b>LIghtJUNction</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=LIghtJUNction" title="Code">💻</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=LIghtJUNction" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://rehansanjay-portfolio.vercel.app/"><img src="https://avatars.githubusercontent.com/u/179024758?v=4?s=100" width="100px;" alt="Rehuz"/><br /><sub><b>Rehuz</b></sub></a><br /><a href="https://github.com/gnoopy/InstaFix/commits?author=Rehansanjay" title="Code">💻</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=Rehansanjay" title="Tests">⚠️</a> <a href="https://github.com/gnoopy/InstaFix/commits?author=Rehansanjay" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vongohren.me/"><img src="https://avatars.githubusercontent.com/u/1012055?v=4?s=100" width="100px;" alt="Snorre Lothar von Gohren Edwin"/><br /><sub><b>Snorre Lothar von Gohren Edwin</b></sub></a><br /><a href="#ideas-vongohren" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

> Want to be in this list? Code, docs, translations, bug reports, design ideas — all count. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started. The [@all-contributors](https://allcontributors.org/docs/en/bot/usage) bot can add you automatically when a maintainer comments `@all-contributors please add @your-username for code, doc`.

### Activity

![InstaFix activity](https://repobeats.axiom.co/api/embed/9ac0c24e3801b4397a9ed90af984dfec23323d1c.svg "Repobeats analytics image")

<sub>Activity graph powered by <a href="https://repobeats.axiom.co">Repobeats</a>.</sub>

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=gnoopy/InstaFix&type=Date)](https://star-history.com/#gnoopy/InstaFix&Date)

---

## License

[MIT](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/gnoopy">@gnoopy</a></sub>
</div>
