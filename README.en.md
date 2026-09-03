[한국어](./README.md) · **English**

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/brand/logo-horizontal-dark.png">
  <img src="./assets/brand/logo-horizontal.png" alt="InstaFix" height="64">
</picture>

**Debugging with a coding agent? Point at the UI, get a ready-made prompt.**

A lightweight browser widget for developers working with AI coding agents (Claude Code, Cursor, and the like).
While an agent is building your page, click or draw a rectangle on whatever's wrong and leave a short note —
InstaFix turns it into a prompt with the exact DOM target, a screenshot, and any console errors, copied straight
to your clipboard. Paste it into your agent's chat and you're done.
Every note you leave this way is recorded as a **fix note**.

![Demo](./demo.en.gif)

[![npm](https://img.shields.io/npm/v/%40instafix%2Fwidget?style=flat&colorA=000000&colorB=000000&label=npm)](https://www.npmjs.com/package/@instafix/widget)
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

> **[See InstaFix in action →](https://instafix.realstory.blog/demo)** — Click to annotate the UI and watch it turn into a prompt ready for your agent.

> [!NOTE]
> InstaFix is a fork of **[SitePing](https://github.com/NeosiaNexus/SitePing)** by [NeosiaNexus](https://github.com/NeosiaNexus), continued here under a new name. See [Provenance](#provenance) for what changed and how attribution/licensing works.

---

## Features

- **Point at it instead of describing it** — no more "the second card from the left" or "the gap under that button." Hover over an element and click to auto-select it, or drag a rectangle to grab several at once. InstaFix records an exact CSS/XPath/text-based DOM selector for whatever you picked. On a dev server it also records the **name of the React component that rendered the element**, so the agent can find the right file in one grep
- **Copy Prompt** — bundles your note, the exact DOM selectors, a screenshot path, and any console errors into one Markdown prompt, copied to your clipboard. Paste it into Claude Code, Cursor, or any coding agent. Each item (a "fix note") carries its own ID plus instructions on how to mark it done, so **the agent can resolve the ones it actually fixed, on its own**
- **Send it straight to the terminal, no copy/paste** (`instafix prompt` · `/instafix` · "To agent") — dispatch your open fix notes wholesale into a fresh agent session with one command (`npx @instafix/cli prompt | claude -p`), pull them into the Claude Code session you're already in by typing `/instafix`, or click the panel's "To agent" button to hand one off to a session running `instafix watch`
- **DOM-anchored persistence** — annotations tie to elements, not pixels; they survive the agent reshuffling the layout
- **Screenshots + diagnostics** — opt-in JPEG of the annotated area (with privacy masking), plus console/network capture — hand the agent the actual console log instead of just saying "it's erroring". Want to show a design reference instead? Paste an image straight into the note box with ⌘V
- **A widget color your app can never be mistaken for** — InstaFix reads your page's own brand colors and dresses its toolbar, popover, panel, and markers in one tone chosen to stand clearly apart from them (`autoSelectionColor: false` falls back to your `accentColor`)
- **Local history (`.instafix/` folder)** — no database — a plain-text record of your session (and its screenshots) at your project root, searchable any time (`@instafix/adapter-fs`)
- **A screen for managing fix notes as a team (triage inbox)** — `<InstaFixInbox />` (`@instafix/dashboard`): for when several people need to review and organize fix notes together — Linear-style, keyboard-first, light/dark, 8 locales
- **Reliability built in** — retry with backoff plus a localStorage queue; a flaky network never loses a comment
- **Shadow DOM isolation + doesn't collide with other floating widgets** — widget CSS never leaks into your site, and your site CSS never breaks the widget. Uses the maximum CSS z-index so nothing else covers it, and if something's already anchored in the corner it would use — a deploy-preview toolbar (Vercel Toolbar, etc.), a chat bubble — it automatically moves to the other bottom corner instead (`avoidOverlays: false` to disable)
- **Dev-only by default** — auto-hides in production builds unless `forceShow: true`
- **Lightweight** — ~30 KB gzipped (ESM); the panel, screenshot engine, and non-English locales load on demand

## Quickstart

### Hand this to your coding agent

The fastest path — paste this into Claude Code / Cursor / Copilot / etc. and let it do the rest:

```text
Install and set up InstaFix (a self-hosted widget for leaving fix notes) in this project:

1. Run npx @instafix/cli@latest init and accept the defaults it suggests at each prompt.
2. npm install whichever @instafix/* package(s) it told you to install.
3. It generates components/instafix-widget.tsx, exporting a component named InstaFixWidget — add <InstaFixWidget /> once inside <body> in this app's root layout (app/layout.tsx for Next.js App Router, or the equivalent root layout/root component for whatever framework this project uses), importing from @/components/instafix-widget (adjust the import path if this project doesn't use the @/ alias). It renders nothing itself, so exact placement doesn't matter — don't wrap it in a conditional, it already no-ops outside development unless forceShow is set.
```

That's it — draw a rectangle on the page, leave a note, and copy it as a prompt for your agent.

Hand the accumulated fix notes to an agent whichever way suits the moment:

```bash
# Dispatch everything open (or just --id picks) to a fresh agent session
npx @instafix/cli prompt --status open | claude -p

# Agents close what they fixed themselves (the prompt tells them how)
npx @instafix/cli resolve <ID>
```

To continue in the Claude Code session you're already working in, type `/instafix` there (`init` installs the slash command). Don't want to leave the browser? The **"To agent"** button on a fix note card or its detail view hands it to any session running `instafix watch` in the background.

### Prefer to do it by hand?

```bash
# 1. Scaffold the API route + a ready-to-use widget component, interactively.
#    InstaFix's own storage is independent of whatever DB your project already
#    uses — SQLite (better-sqlite3, zero external services) is the default
#    suggestion, or pick the database-free ".instafix/ folder" option if
#    you're working solo.
npx @instafix/cli@latest init

# 2. Install whichever packages init referenced — for the SQLite path:
npm install @instafix/widget @instafix/adapter-sqlite
# Solo/local history instead? swap in: @instafix/adapter-fs
```

`init` generates `components/instafix-widget.tsx`, but doesn't touch your layout — editing an arbitrary layout file safely needs a human (or an agent) in the loop. Paste this to Claude Code / Cursor / Copilot / etc. once install is done:

```text
npx @instafix/cli@latest init generated components/instafix-widget.tsx, which exports a component named InstaFixWidget. Add <InstaFixWidget /> to my app's root layout — app/layout.tsx for Next.js App Router, or the equivalent root layout/root component for whatever framework this project uses. Import it from @/components/instafix-widget (adjust the import path if this project doesn't use the @/ alias). Place the tag once, inside <body>, alongside any other global providers — it renders nothing itself (return null), so exact position doesn't matter. Don't wrap it in a conditional: it already no-ops outside development unless forceShow is set.
```

Drop in this one component and your team can review and organize fix notes on a single screen:

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox projects="my-app" endpoint="/api/instafix" theme="auto" />
```

(install it: `npm install @instafix/dashboard`)

**To remove InstaFix**: revert your lockfile and `package.json` (`git checkout -- package.json package-lock.json`, or your lockfile), delete `app/api/instafix/` and `components/instafix-widget.tsx`, then reinstall.

### Want unreleased features before they hit npm? (Nightly)

npm only ever gets versions release-please has actually tagged from Conventional Commits. A set of `<package>-dist` GitHub branches also track the tip of `main`, so if you want to try something before it's released, install from a GitHub URL instead of a package name — same install experience either way:

```bash
npx github:gnoopy/instafix#cli-dist init
npm install github:gnoopy/instafix#widget-dist github:gnoopy/instafix#adapter-sqlite-dist
```

Use the npm install above for normal use — the nightly branches move on every push and carry no version guarantees or backward compatibility.

## Documentation

The full documentation lives at **[instafix.realstory.blog/docs](https://instafix.realstory.blog/docs)** (English, French, and Korean) — every option, default, and behavior on these pages is verified against the source code.

| Package | | Docs |
|---|---|---|
| [`@instafix/widget`](./packages/widget) | The fix note widget (framework-agnostic + React hook) | [Widget](https://instafix.realstory.blog/docs/widget) · [Configuration](https://instafix.realstory.blog/docs/widget/configuration) · [Screenshots](https://instafix.realstory.blog/docs/widget/screenshots) |
| [`@instafix/dashboard`](./packages/dashboard) | Triage inbox component + headless hook | [Dashboard](https://instafix.realstory.blog/docs/dashboard) · [Theming](https://instafix.realstory.blog/docs/dashboard/theming) |
| [`@instafix/adapter-sqlite`](./packages/adapter-sqlite) | Production server adapter, zero external services | [SQLite adapter](https://instafix.realstory.blog/docs/adapters/sqlite) |
| [`@instafix/adapter-fs`](./packages/adapter-fs) | No database — plain files under `.instafix/`, for a single developer working locally | [Filesystem adapter](https://instafix.realstory.blog/docs/adapters/fs) |
| [`@instafix/cli`](./packages/cli) | `init` / `prompt` / `resolve` / `watch` / `sync` / `status` / `doctor` | [CLI](https://instafix.realstory.blog/docs/cli) |

## Contributing

Bug reports, locale translations, docs fixes, features — everything counts, and locale additions are the friendliest first PR. Start with [CONTRIBUTING.md](./CONTRIBUTING.md).

Semantic anchors, screenshot storage backends, and positioning fixes have all come from forks so far. Maintaining a fork with extra features like that? An upstream PR — or even just an issue describing what you built — lets everyone benefit.

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
