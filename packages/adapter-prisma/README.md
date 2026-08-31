[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/adapters/prisma)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/adapter-prisma

The production server adapter for [InstaFix](https://github.com/gnoopy/instafix) — one endpoint that validates, authenticates, and persists client feedback in your database.

**[Documentation](https://instafix.realstory.blog/docs/adapters/prisma)** · **[live demo](https://instafix.realstory.blog/demo)**

## Install

Not on the npm registry — installs straight from this repo's build output:

```bash
npm install github:gnoopy/instafix#adapter-prisma-dist
```

**Peer dependency:** `@prisma/client` ^5 || ^6 || ^7 · Node ≥ 20.

## Quick start

```ts
// app/api/instafix/route.ts — Next.js App Router
import { createInstaFixHandler } from "@instafix/adapter-prisma";
import { prisma } from "@/lib/prisma";

export const { GET, POST, PATCH, DELETE, OPTIONS } = createInstaFixHandler({
  prisma,
  apiKey: process.env.INSTAFIX_API_KEY,        // Bearer auth
  allowedOrigins: ["https://my-site.com"],     // exact-match CORS
});
```

The handlers are Web-standard `Request` → `Response` — mount them from any framework (Remix, SvelteKit, Hono, …). Generate the required Prisma models with `npx github:gnoopy/instafix#cli-dist sync`.

## Highlights

- **Safe by default** — status changes and deletes require the `apiKey`; in production the factory refuses to start without one. Author emails are redacted for unauthenticated readers and `clientId` never leaves the server
- **Screenshot storage hook** — upload images to S3/R2/GCS instead of inlining data URLs
- **Webhooks** — Slack, Discord, or generic POST on each new feedback (5 s timeout, never blocks the submission)
- **Any store behind the same HTTP surface** — pass `store` instead of `prisma` to mount an in-memory or custom store with identical validation and auth

## Documentation

All options with their real defaults, the full HTTP reference (bodies, query params, errors, validation limits), the exact Prisma schema, and the security model: **[instafix.realstory.blog/docs/adapters/prisma](https://instafix.realstory.blog/docs/adapters/prisma)**.

## License

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
