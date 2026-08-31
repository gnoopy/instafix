[![npm version](https://img.shields.io/npm/v/@instafix/adapter-localstorage)](https://www.npmjs.com/package/@instafix/adapter-localstorage)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/adapters/localstorage)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/adapter-localstorage

Client-side store for [InstaFix](https://github.com/gnoopy/InstaFix) — the whole feedback loop in the browser, no server required. Ideal for demos, prototypes, and docs sites.

**[Documentation](https://instafix.realstory.blog/docs/adapters/localstorage)**

## Install

```bash
npm install @instafix/adapter-localstorage
```

## Usage

```ts
import { initInstaFix } from "@instafix/widget";
import { LocalStorageStore } from "@instafix/adapter-localstorage";

initInstaFix({
  store: new LocalStorageStore(),   // options: { key?: string } — default "instafix_feedbacks"
  projectName: "my-demo",
});
```

Each visitor sees only their own feedback — data never leaves their browser. Corrupted stored data degrades to an empty list instead of crashing, quota pressure drops the screenshot before ever dropping the comment, and dates come back as real `Date` objects.

## License

[MIT](https://github.com/gnoopy/InstaFix/blob/main/LICENSE)
