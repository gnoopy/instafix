[![npm version](https://img.shields.io/npm/v/@instafix/cli)](https://www.npmjs.com/package/@instafix/cli)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/cli

Set up and check [InstaFix](https://github.com/gnoopy/instafix) from the command line. Single self-contained binary, zero runtime dependencies, Node ≥ 20.

**[Documentation](https://instafix.realstory.blog/docs/cli)**

## Usage

```bash
npx @instafix/cli init
```

> Always `npx @instafix/cli …` — there is no `instafix` package on npm, so `npx instafix` only works once `@instafix/cli` is installed locally.

## Commands

| Command | What it does |
|---------|--------------|
| `init` | Interactive setup: adds the Prisma models and generates the Next.js App Router API route |
| `sync [--schema <path>]` | Non-interactive, CI-friendly schema merge — creates/updates the InstaFix models, never touches your own fields |
| `status [--schema <path>]` | Health report: schema, API route, package, and widget integration (exits 1 when something's missing) |
| `doctor --url <url> --endpoint <path>` | One HTTP request against your running server to confirm a InstaFix handler answers |

Commit before `sync` — it re-prints the whole schema file, so formatting normalizes across your own models too.

## Documentation

Flags, exit codes, non-TTY behavior, and what each command writes: **[instafix.realstory.blog/docs/cli](https://instafix.realstory.blog/docs/cli)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
