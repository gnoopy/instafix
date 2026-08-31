/**
 * Type-level locks for the widget's public API surface (vitest typecheck
 * mode — never executed).
 */

import type {
  FeedbackQuery,
  FeedbackResponse,
  InstaFixInstance,
  InstaFixPublicEvents,
  InstaFixStore,
} from "@instafix/core";
import { describe, expectTypeOf, it } from "vitest";
import type { GetFeedbacksOptions } from "../../src/api-client.js";
import { initInstaFix, registerLocale, type Translations } from "../../src/index.js";

declare const store: InstaFixStore;
declare const instance: InstaFixInstance;

describe("initInstaFix config modes", () => {
  it("accepts HTTP mode and store mode", () => {
    expectTypeOf(initInstaFix).toBeCallableWith({ projectName: "p", endpoint: "/api/instafix" });
    expectTypeOf(initInstaFix).toBeCallableWith({ projectName: "p", store });
  });

  it("rejects mixed modes", () => {
    // @ts-expect-error — endpoint and store are mutually exclusive
    initInstaFix({ projectName: "p", endpoint: "/api", store });
  });
});

describe("public events", () => {
  it("types each listener payload", () => {
    instance.on("feedback:sent", (fb) => {
      expectTypeOf(fb).toEqualTypeOf<FeedbackResponse>();
    });
    instance.on("feedback:error", (error) => {
      expectTypeOf(error).toEqualTypeOf<Error>();
    });
    instance.on("annotation:start", (...args) => {
      expectTypeOf(args).toEqualTypeOf<[]>();
    });
  });

  it("rejects unknown event names", () => {
    // @ts-expect-error — not a public event
    instance.on("submission:cancelled", () => {});
  });

  it("keeps the public map in sync with the instance signature", () => {
    expectTypeOf<Parameters<InstaFixInstance["on"]>[0]>().toEqualTypeOf<keyof InstaFixPublicEvents>();
  });
});

describe("GetFeedbacksOptions derivation", () => {
  it("is FeedbackQuery minus projectName", () => {
    expectTypeOf<keyof GetFeedbacksOptions>().toEqualTypeOf<Exclude<keyof FeedbackQuery, "projectName">>();
    expectTypeOf<GetFeedbacksOptions["statuses"]>().toEqualTypeOf<FeedbackQuery["statuses"]>();
  });
});

describe("custom locales", () => {
  it("accepts partial dictionaries", () => {
    expectTypeOf(registerLocale).toBeCallableWith("nl", { "panel.title": "Feedback" });
  });

  it("rejects unknown keys", () => {
    // @ts-expect-error — not a Translations key
    registerLocale("nl", { "panel.doesNotExist": "x" });
  });

  it("keeps values as strings", () => {
    expectTypeOf<Translations["panel.title"]>().toEqualTypeOf<string>();
  });
});
