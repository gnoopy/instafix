[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/adapters/sqlite)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/adapter-sqlite

The zero-external-services server adapter for [InstaFix](https://github.com/gnoopy/instafix) — a local SQLite file via `better-sqlite3`, no ORM and no database server to run.

**[Documentation](https://instafix.realstory.blog/docs/adapters/sqlite)**

## Install

```bash
npm install @instafix/adapter-sqlite
```

Requires Node 22+ — better-sqlite3 v13 runs on the N-API and drops Node 20, which reached EOL on 2026-04-30.

## Quick start

```ts
// app/api/instafix/route.ts — Next.js App Router
import { createInstaFixHandler, SqliteStore } from "@instafix/adapter-sqlite";

const store = new SqliteStore({ path: "./instafix.db" });

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({ store });
```

The two tables are created automatically the first time `SqliteStore` is constructed against a given file — no separate migration step. `createInstaFixHandler` is the same generic handler (auth, CORS, validation, webhooks) every InstaFix adapter shares.

## Documentation

Options, behavior notes, and the native-dependency caveat: **[instafix.realstory.blog/docs/adapters/sqlite](https://instafix.realstory.blog/docs/adapters/sqlite)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
