/**
 * Type-level locks for the dashboard's public API surface (vitest typecheck
 * mode — never executed).
 */

import type { InstaFixStore } from "@instafix/core";
import { describe, expectTypeOf, it } from "vitest";
import type { InboxSource, InboxState, InstaFixInboxProps, UseInstaFixInboxOptions } from "../../src/types.js";
import { useInstaFixInbox } from "../../src/use-inbox.js";

declare const store: InstaFixStore;
declare const source: InboxSource;

describe("UseInstaFixInboxOptions XOR union", () => {
  it("accepts each source mode on its own", () => {
    expectTypeOf({ projects: "p", source }).toExtend<UseInstaFixInboxOptions>();
    expectTypeOf({ projects: "p", store }).toExtend<UseInstaFixInboxOptions>();
    expectTypeOf({ projects: "p", endpoint: "/api", apiKey: "k" }).toExtend<UseInstaFixInboxOptions>();
  });

  it("rejects no source and mixed sources", () => {
    // @ts-expect-error — one of source/store/endpoint is required
    useInstaFixInbox({ projects: "p" });

    // @ts-expect-error — store and endpoint are mutually exclusive
    useInstaFixInbox({ projects: "p", store, endpoint: "/api" });

    // @ts-expect-error — apiKey is endpoint-mode only
    useInstaFixInbox({ projects: "p", store, apiKey: "leaked" });
  });
});

describe("InboxState", () => {
  it("exposes the derived view discriminant", () => {
    expectTypeOf<InboxState["view"]>().toEqualTypeOf<"loading" | "error" | "empty" | "ready">();
  });
});

describe("InstaFixInboxProps", () => {
  it("combines source modes with presentation props", () => {
    expectTypeOf({ projects: "p", store, theme: "dark" as const }).toExtend<InstaFixInboxProps>();

    // @ts-expect-error — "sepia" is not an InboxTheme
    const badTheme: InstaFixInboxProps = { projects: "p", store, theme: "sepia" };
    void badTheme;
  });
});
