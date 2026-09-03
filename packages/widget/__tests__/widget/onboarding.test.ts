// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createT } from "../../src/i18n/index.js";
import { hasSeenOnboarding, ONBOARDING_CSS, Onboarding } from "../../src/onboarding.js";
import { createShadowRoot } from "../helpers.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function makeKeydown(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...options, key });
}

function stubLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  });
  return store;
}

// ---------------------------------------------------------------------------
// hasSeenOnboarding()
// ---------------------------------------------------------------------------

describe("hasSeenOnboarding", () => {
  beforeEach(() => {
    stubLocalStorage();
  });

  it("returns false when nothing has been stored", () => {
    expect(hasSeenOnboarding()).toBe(false);
  });

  it("returns true once the tour has been marked seen", () => {
    localStorage.setItem("instafix_onboarding_seen", "1");
    expect(hasSeenOnboarding()).toBe(true);
  });

  it("fails closed (returns true) when localStorage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new DOMException("blocked");
      }),
    });
    expect(hasSeenOnboarding()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

describe("Onboarding", () => {
  const t = createT("en");
  let shadow: ShadowRoot;
  let anchor: HTMLButtonElement;
  let store: Record<string, string>;

  beforeEach(() => {
    store = stubLocalStorage();
    shadow = createShadowRoot();
    anchor = document.createElement("button");
    shadow.appendChild(anchor);
  });

  afterEach(() => {
    shadow.host.remove();
  });

  it("exports a non-empty CSS string", () => {
    expect(ONBOARDING_CSS).toContain(".sp-onboarding");
  });

  it("positions the card above the anchor when there is enough room", async () => {
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      top: 500,
      bottom: 530,
      left: 0,
      right: 0,
      width: 0,
      height: 30,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    // Above the anchor: card top < anchor top, not anchor.bottom + gap.
    expect(Number.parseFloat(tour.element.style.top)).toBeLessThan(500);
  });

  it("renders step 1 with role=dialog and the step-1 title as aria-label", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();

    expect(tour.element.getAttribute("role")).toBe("dialog");
    expect(tour.element.getAttribute("aria-label")).toBe(t("onboarding.step1Title"));
    expect(tour.element.textContent).toContain(t("onboarding.step1Body"));
    expect(tour.element.querySelector(".sp-onboarding-progress")!.textContent).toBe("1/3");
    expect(tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!.textContent).toBe(
      t("onboarding.next"),
    );

    tour.destroy();
  });

  it("becomes visible and focuses the Next button after the first frame", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    const nextBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!;
    const focusSpy = vi.spyOn(nextBtn, "focus");

    await nextFrame();

    expect(tour.element.classList.contains("sp-onboarding--visible")).toBe(true);
    expect(focusSpy).toHaveBeenCalled();

    tour.destroy();
  });

  it("advances through all 3 steps and labels the last step's button 'Got it'", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    const nextBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!;

    nextBtn.click();
    expect(tour.element.querySelector(".sp-onboarding-progress")!.textContent).toBe("2/3");
    expect(tour.element.textContent).toContain(t("onboarding.step2Body"));

    nextBtn.click();
    expect(tour.element.querySelector(".sp-onboarding-progress")!.textContent).toBe("3/3");
    expect(tour.element.textContent).toContain(t("onboarding.step3Body"));
    expect(nextBtn.textContent).toBe(t("onboarding.done"));

    tour.destroy();
  });

  it("finishes and marks the tour seen when 'Got it' is clicked on the last step", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    const nextBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!;

    nextBtn.click(); // step 2
    nextBtn.click(); // step 3
    nextBtn.click(); // finish

    expect(tour.element.isConnected).toBe(false);
    expect(store.instafix_onboarding_seen).toBe("1");
  });

  it("Skip finishes immediately from step 1 and marks the tour seen", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    const skipBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-skip")!;

    skipBtn.click();

    expect(tour.element.isConnected).toBe(false);
    expect(store.instafix_onboarding_seen).toBe("1");
  });

  it("the close (X) button finishes the tour and marks it seen", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    const closeBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-close")!;

    closeBtn.click();

    expect(tour.element.isConnected).toBe(false);
    expect(store.instafix_onboarding_seen).toBe("1");
  });

  it("Escape finishes the tour and marks it seen", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();

    document.dispatchEvent(makeKeydown("Escape"));

    expect(tour.element.isConnected).toBe(false);
    expect(store.instafix_onboarding_seen).toBe("1");
  });

  it("finish() restores focus to the anchor (FAB)", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    const focusSpy = vi.spyOn(anchor, "focus");

    tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-skip")!.click();

    expect(focusSpy).toHaveBeenCalled();
  });

  it("destroy() removes the element WITHOUT marking the tour seen", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();

    tour.destroy();

    expect(tour.element.isConnected).toBe(false);
    expect(store.instafix_onboarding_seen).toBeUndefined();
    expect(hasSeenOnboarding()).toBe(false);
  });

  it("a second Escape after destroy() is a no-op (no double-marking / no throw)", async () => {
    const tour = new Onboarding(shadow, t, anchor, true);
    await nextFrame();
    tour.destroy();

    expect(() => document.dispatchEvent(makeKeydown("Escape"))).not.toThrow();
    expect(store.instafix_onboarding_seen).toBeUndefined();
  });

  describe("Tab focus trap", () => {
    it("Tab on the last focusable (Next) wraps to the first (close)", async () => {
      const tour = new Onboarding(shadow, t, anchor, true);
      await nextFrame();
      const closeBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-close")!;
      const nextBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!;
      Object.defineProperty(shadow, "activeElement", { value: nextBtn, configurable: true });

      const event = makeKeydown("Tab");
      const prevent = vi.spyOn(event, "preventDefault");
      const focusSpy = vi.spyOn(closeBtn, "focus");
      document.dispatchEvent(event);

      expect(prevent).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      tour.destroy();
    });

    it("Shift+Tab on the first focusable (close) wraps to the last (Next)", async () => {
      const tour = new Onboarding(shadow, t, anchor, true);
      await nextFrame();
      const closeBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-close")!;
      const nextBtn = tour.element.querySelector<HTMLButtonElement>(".sp-onboarding-next")!;
      Object.defineProperty(shadow, "activeElement", { value: closeBtn, configurable: true });

      const event = makeKeydown("Tab", { shiftKey: true });
      const prevent = vi.spyOn(event, "preventDefault");
      const focusSpy = vi.spyOn(nextBtn, "focus");
      document.dispatchEvent(event);

      expect(prevent).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      tour.destroy();
    });

    it("does not trap Tab when focus is outside the card", async () => {
      const tour = new Onboarding(shadow, t, anchor, true);
      await nextFrame();
      const outside = document.createElement("input");
      shadow.appendChild(outside);
      Object.defineProperty(shadow, "activeElement", { value: outside, configurable: true });

      const event = makeKeydown("Tab");
      const prevent = vi.spyOn(event, "preventDefault");
      document.dispatchEvent(event);

      expect(prevent).not.toHaveBeenCalled();
      tour.destroy();
      outside.remove();
    });
  });
});
