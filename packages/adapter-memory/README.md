[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/adapters/memory)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/adapter-memory

In-memory store for [InstaFix](https://github.com/gnoopy/instafix) — zero dependencies, zero configuration. For tests, previews, and throwaway demos: restart the process and it's gone.

**[Documentation](https://instafix.realstory.blog/docs/adapters/memory)**

## Install

Not on the npm registry — installs straight from this repo's build output:

```bash
npm install github:gnoopy/instafix#adapter-memory-dist
```

## Usage

```ts
import { MemoryStore } from "@instafix/adapter-memory";

const store = new MemoryStore();

// Behind the HTTP handler (server):
createInstaFixHandler({ store });

// Or directly in the widget (client-side mode):
initInstaFix({ store, projectName: "preview" });
```

`clear()` resets it between test cases. Duplicate `clientId` submissions return the existing record (retry-safe), unknown IDs throw `StoreNotFoundError`, and records are returned **by reference** — clone before mutating.

Writing your own adapter? This store passes the shared 40-test conformance suite (`testInstaFixStore` from `@instafix/core/testing`) — yours should too.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
