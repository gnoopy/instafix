import { describe, expect, it } from "vitest";
import "../../src/utils/object-group-by-polyfill.js";

// `lib` doesn't target ES2024, so `Object.groupBy` isn't declared even though
// the polyfill installs it at runtime — same cast the polyfill itself uses.
const groupBy = (
  Object as typeof Object & {
    groupBy: <T, K extends PropertyKey>(
      items: Iterable<T>,
      keySelector: (item: T, index: number) => K,
    ) => Partial<Record<K, T[]>>;
  }
).groupBy;

describe("Object.groupBy polyfill", () => {
  it("groups items sharing a key into the same bucket, in insertion order", () => {
    const items = [
      { id: 1, kind: "a" },
      { id: 2, kind: "b" },
      { id: 3, kind: "a" },
    ];
    const groups = groupBy(items, (item) => item.kind);
    expect(groups.a).toEqual([items[0], items[2]]);
    expect(groups.b).toEqual([items[1]]);
  });

  it("returns an empty object for an empty iterable", () => {
    expect(groupBy([], () => "x")).toEqual({});
  });
});
