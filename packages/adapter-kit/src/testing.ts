/**
 * The `InstaFixStore` conformance suite, published for third-party adapter
 * authors (requires `vitest` — an optional peer dependency of this
 * package).
 *
 * @example
 * ```ts
 * import { testInstaFixStore } from "@instafix/adapter-kit/testing";
 * import { DrizzleStore } from "../src/index.js";
 *
 * testInstaFixStore(() => new DrizzleStore(db));
 * ```
 */

export type { StoreConformanceOptions } from "@instafix/core/testing";
export { testInstaFixStore } from "@instafix/core/testing";
