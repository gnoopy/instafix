<div align="center">

<h1>InstaFix</h1>

**Client feedback, pinned to the pixel.**

A lightweight feedback widget that lets your clients annotate websites during development.
Draw rectangles, leave comments, track bugs — directly on the live site.

![Demo](./demo.gif)

[![Website](https://img.shields.io/badge/website-instafix.realstory.blog-000000?style=flat&colorA=000000&colorB=000000)](https://instafix.realstory.blog)
[![Live Demo](https://img.shields.io/badge/demo-try%20it%20live-22c55e?style=flat&colorA=000000)](https://instafix.realstory.blog/demo)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog%2Fdocs-0066ff?style=flat&colorA=000000)](https://instafix.realstory.blog/docs)
[![license](https://img.shields.io/github/license/gnoopy/instafix?style=flat&colorA=000000&colorB=000000)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/gnoopy/instafix/ci.yml?style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/instafix/actions)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/gnoopy/instafix/codeql.yml?label=CodeQL&style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/instafix/security/code-scanning)
[![coverage](https://img.shields.io/codecov/c/github/gnoopy/instafix?style=flat&colorA=000000&colorB=000000)](https://app.codecov.io/gh/gnoopy/instafix)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/gnoopy/instafix?label=scorecard&style=flat&colorA=000000&colorB=000000)](https://scorecard.dev/viewer/?uri=github.com/gnoopy/instafix)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/widget-~30%20KB%20gzip%20(ESM)-blue)](./packages/widget/.size-limit.json)

[**Documentation**](https://instafix.realstory.blog/docs) &middot; [Quickstart](https://instafix.realstory.blog/docs/quickstart) &middot; [Live Demo](https://instafix.realstory.blog/demo) &middot; [Contributing](./CONTRIBUTING.md)

</div>

> **[See InstaFix in action →](https://instafix.realstory.blog/demo)** — Draw annotations, leave feedback, track bugs directly on the live site.

> [!NOTE]
> InstaFix is a fork of **[SitePing](https://github.com/NeosiaNexus/SitePing)** by [NeosiaNexus](https://github.com/NeosiaNexus), continued here under a new name. See [Provenance](#provenance) for what changed and how attribution/licensing works.

---

## Why InstaFix?

Stop chasing client feedback across Slack threads, email chains, and Notion docs. InstaFix gives your clients a **contextual** way to leave feedback — anchored to the exact element they're looking at.

| | InstaFix | Marker.io | BugHerd |
|---|---|---|---|
| **Self-hosted** | Yes — your DB, your data | No (SaaS) | No (SaaS) |
| **Package install** | `npm install` from GitHub — no registry gatekeeping | npm + script tag | Script tag only |
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

InstaFix isn't published to the npm registry — that's a deliberate choice, not a "not yet." Every package installs straight from this repo's build output instead, via a disposable `<package>-dist` branch: same install experience, just a GitHub URL instead of a package name.

```bash
# 1. Scaffold the API route + a ready-to-use widget component, interactively.
#    No Prisma schema in your project? init offers SQLite (better-sqlite3,
#    zero external services) as the default instead of assuming Prisma.
npx github:gnoopy/instafix#cli-dist init

# 2. Install whichever packages init referenced — for the SQLite path:
npm install github:gnoopy/instafix#widget-dist github:gnoopy/instafix#adapter-sqlite-dist
# Already on Prisma? swap in: github:gnoopy/instafix#adapter-prisma-dist
```

`init` generates `components/instafix-widget.tsx`, but doesn't touch your layout — editing an arbitrary layout file safely needs a human (or an agent) in the loop. Paste this to Claude Code / Cursor / Copilot / etc. once install is done:

> `npx github:gnoopy/instafix#cli-dist init` generated `components/instafix-widget.tsx`, which exports a component named `InstaFixWidget`. Add `<InstaFixWidget />` to my app's root layout — `app/layout.tsx` for Next.js App Router, or the equivalent root layout/root component for whatever framework this project uses. Import it from `@/components/instafix-widget` (adjust the import path if this project doesn't use the `@/` alias). Place the tag once, inside `<body>`, alongside any other global providers — it renders nothing itself (`return null`), so exact position doesn't matter. Don't wrap it in a conditional: it already no-ops outside development unless `forceShow` is set.

Your clients can now draw rectangles on the site and leave feedback. Triage it with one component:

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox projects="my-app" endpoint="/api/instafix" theme="auto" />
```

(install it the same way: `npm install github:gnoopy/instafix#dashboard-dist`)

No server? The widget also runs fully client-side with `store: new LocalStorageStore()` (`github:gnoopy/instafix#adapter-localstorage-dist`).

**To remove InstaFix**: revert your lockfile and `package.json` (`git checkout -- package.json package-lock.json`, or your lockfile), delete `app/api/instafix/` and `components/instafix-widget.tsx`, then reinstall.

## Documentation

The full documentation lives at **[instafix.realstory.blog/docs](https://instafix.realstory.blog/docs)** (English and French) — every option, default, and behavior on these pages is verified against the source code.

| Package | | Docs |
|---|---|---|
| [`@instafix/widget`](./packages/widget) | The feedback widget (framework-agnostic + React hook) | [Widget](https://instafix.realstory.blog/docs/widget) · [Configuration](https://instafix.realstory.blog/docs/widget/configuration) · [Screenshots](https://instafix.realstory.blog/docs/widget/screenshots) |
| [`@instafix/dashboard`](./packages/dashboard) | Triage inbox component + headless hook | [Dashboard](https://instafix.realstory.blog/docs/dashboard) · [Theming](https://instafix.realstory.blog/docs/dashboard/theming) |
| [`@instafix/adapter-prisma`](./packages/adapter-prisma) | Production server adapter (auth, CORS, webhooks) | [Prisma adapter](https://instafix.realstory.blog/docs/adapters/prisma) |
| [`@instafix/adapter-sqlite`](./packages/adapter-sqlite) | Production server adapter, zero external services | [SQLite adapter](https://instafix.realstory.blog/docs/adapters/sqlite) |
| [`@instafix/adapter-fs`](./packages/adapter-fs) | No database — plain files under `.instafix/`, for a single developer working locally | [Filesystem adapter](https://instafix.realstory.blog/docs/adapters/fs) |
| [`@instafix/adapter-memory`](./packages/adapter-memory) | In-memory store (tests, demos) | [Memory adapter](https://instafix.realstory.blog/docs/adapters/memory) |
| [`@instafix/adapter-localstorage`](./packages/adapter-localstorage) | Client-side store (zero server) | [localStorage adapter](https://instafix.realstory.blog/docs/adapters/localstorage) |
| [`@instafix/cli`](./packages/cli) | `init` / `sync` / `status` / `doctor` | [CLI](https://instafix.realstory.blog/docs/cli) |

## Contributing

Bug reports, locale translations, docs fixes, features — everything counts, and locale additions are the friendliest first PR. Start with [CONTRIBUTING.md](./CONTRIBUTING.md).

Maintaining a fork with extra features (semantic anchors, screenshot storage backends, positioning fixes have all come from forks)? An upstream PR — or even an issue describing what you built — lets everyone benefit.

## Contributors

Every line of code, locale, doc fix, and bug report makes InstaFix better. Huge thanks to everyone who has shown up — first-time contributors especially.

_This list credits contributions to the InstaFix repository specifically — see [Provenance](#provenance) for how this project relates to SitePing, the project it was forked from._

This project follows the [all-contributors](https://allcontributors.org) specification — every kind of contribution counts ([emoji key](https://allcontributors.org/docs/en/emoji-key)).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gnoopy"><img src="https://avatars.githubusercontent.com/u/63867369?v=4?s=100" width="100px;" alt="Olsen Matheo"/><br /><sub><b>Olsen Matheo</b></sub></a><br /><a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Code">💻</a> <a href="#maintenance-gnoopy" title="Maintenance">🚧</a> <a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Documentation">📖</a> <a href="#design-gnoopy" title="Design">🎨</a> <a href="#infra-gnoopy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-gnoopy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/gnoopy/instafix/pulls?q=is%3Apr+reviewed-by%3Agnoopy" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Tests">⚠️</a> <a href="#projectManagement-gnoopy" title="Project Management">📆</a></td>
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

[![Star History Chart](https://api.star-history.com/svg?repos=gnoopy/instafix&type=Date)](https://star-history.com/#gnoopy/instafix&Date)

---

## Provenance

InstaFix began as a fork of **SitePing**, originally created and maintained by [NeosiaNexus](https://github.com/NeosiaNexus) ([NeosiaNexus/SitePing](https://github.com/NeosiaNexus/SitePing), MIT licensed). It was rebranded (new name, npm scope, and repository) and has continued to diverge since — new locales, a SQLite adapter, a CLI, and other features not present upstream.

- **License**: MIT, unchanged. [LICENSE](./LICENSE) carries both the original NeosiaNexus/SitePing copyright notice and the current one, per the license's own terms.
- **History**: this repository started from a clean checkout rather than a GitHub-native fork, so it doesn't carry SitePing's original commit history or issue/PR links — that history lives at [NeosiaNexus/SitePing](https://github.com/NeosiaNexus/SitePing).
- **Contributors**: the [list above](#contributors) credits people who contributed to *this* repository. It doesn't include SitePing's own contributors, since they didn't contribute to this codebase directly — see [SitePing's contributors](https://github.com/NeosiaNexus/SitePing/graphs/contributors) for that project's history.
- If you're evaluating InstaFix vs. SitePing: this project isn't affiliated with or endorsed by NeosiaNexus. Check both and use whichever fits.

## License

[MIT](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/gnoopy">@gnoopy</a></sub>
</div>
