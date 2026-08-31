# @instafix/adapter-kit

Everything needed to build — and conformance-test — a custom [InstaFix](https://instafix.realstory.blog) store adapter.

Not on the npm registry — installs straight from this repo's build output:

```bash
npm install github:gnoopy/instafix#adapter-kit-dist
```

```ts
import { createCollectionStore, type InstaFixStore } from "@instafix/adapter-kit";

// A complete adapter over any snapshot backend, in ~15 lines:
export function createMyStore(): InstaFixStore {
  let records = load();
  return createCollectionStore({
    load: () => records,
    persist: (next) => save((records = next)),
    generateId: () => crypto.randomUUID(),
  });
}
```

Verify it with the shared conformance suite (vitest):

```ts
import { testInstaFixStore } from "@instafix/adapter-kit/testing";
import { createMyStore } from "../src/index.js";

testInstaFixStore(() => createMyStore());
```

**[Full guide → instafix.realstory.blog/docs/adapters/writing-an-adapter](https://instafix.realstory.blog/docs/adapters/writing-an-adapter)**

## License

MIT
