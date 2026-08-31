[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog-0066ff)](https://instafix.realstory.blog/docs/adapters/localstorage)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

# @instafix/adapter-localstorage

Client-side store for [InstaFix](https://github.com/gnoopy/instafix) — the whole feedback loop in the browser, no server required. Ideal for demos, prototypes, and docs sites.

**[Documentation](https://instafix.realstory.blog/docs/adapters/localstorage)**

## Install

Not on the npm registry — installs straight from this repo's build output:

```bash
npm install github:gnoopy/instafix#adapter-localstorage-dist
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

[MIT](https://github.com/gnoopy/instafix/blob/main/LICENSE)
