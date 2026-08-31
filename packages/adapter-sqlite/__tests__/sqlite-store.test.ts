import { testInstaFixStore } from "@instafix/core/testing";
import { SqliteStore } from "../src/index.js";

// `:memory:` gives every test a fresh, isolated, on-disk-free database — no
// file cleanup needed between the ~44 conformance tests.
//
// createFeedback doesn't self-resolve a duplicate clientId (it throws
// StoreDuplicateError, mirroring PrismaStore's raw-constraint-error
// propagation — the HTTP handler does the catch + refetch dance for both).
testInstaFixStore(() => new SqliteStore({ path: ":memory:" }), {
  duplicateBehavior: "throw",
  caseInsensitiveSearch: true,
});
