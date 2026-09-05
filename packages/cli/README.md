[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/cli

Set up and check [InstaFix](https://github.com/gnoopy/instafix) from the command line. Single self-contained binary, zero runtime dependencies, Node ≥ 22.

**[Documentation](https://instafix.realstory.blog/docs/cli)**

## Usage

```bash
npx @instafix/cli@latest init
```

> The package is `@instafix/cli`; there is no bare `instafix` package on npm, so always run `npx @instafix/cli <command>`.

## Commands

| Command | What it does |
|---------|--------------|
| `init` | Interactive setup: asks how to store fix notes (SQLite, a plain `.instafix/` folder, or wire it yourself), generates the Next.js App Router API route and a ready-to-use widget component, installs the `/instafix` agent command, and finishes by listing every `@instafix/*` package in the project with the version actually on disk |
| `sync [--schema <path>]` | Non-interactive, CI-friendly Prisma schema merge — creates/updates the InstaFix models, never touches your own fields |
| `status [--schema <path>]` | Health report: schema, API route, package, and widget integration (exits 1 when something's missing) |
| `doctor --url <url> --endpoint <path>` | One HTTP request against your running server to confirm a InstaFix handler answers |

Commit before `sync` — it re-prints the whole schema file, so formatting normalizes across your own models too.

## Documentation

Flags, exit codes, non-TTY behavior, and what each command writes: **[instafix.realstory.blog/docs/cli](https://instafix.realstory.blog/docs/cli)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
