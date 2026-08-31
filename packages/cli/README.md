[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/cli

Set up and check [InstaFix](https://github.com/gnoopy/instafix) from the command line. Single self-contained binary, zero runtime dependencies, Node ≥ 20.

**[Documentation](https://instafix.realstory.blog/docs/cli)**

## Usage

Not on the npm registry — run it straight from this repo's `cli-dist` branch:

```bash
npx github:gnoopy/instafix#cli-dist init
```

> Always run the full `npx github:gnoopy/instafix#cli-dist <command>` — there is no `instafix` package on npm to shorten it to.

## Commands

| Command | What it does |
|---------|--------------|
| `init` | Interactive setup: adds storage (Prisma if a schema is found, otherwise offers SQLite), generates the Next.js App Router API route, and generates a ready-to-use widget component |
| `sync [--schema <path>]` | Non-interactive, CI-friendly Prisma schema merge — creates/updates the InstaFix models, never touches your own fields |
| `status [--schema <path>]` | Health report: schema, API route, package, and widget integration (exits 1 when something's missing) |
| `doctor --url <url> --endpoint <path>` | One HTTP request against your running server to confirm a InstaFix handler answers |

Commit before `sync` — it re-prints the whole schema file, so formatting normalizes across your own models too.

## Documentation

Flags, exit codes, non-TTY behavior, and what each command writes: **[instafix.realstory.blog/docs/cli](https://instafix.realstory.blog/docs/cli)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
