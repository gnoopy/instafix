// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { createFocusTracker, type FocusTracker } from "../../src/focus-tracker.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Elements appended during a test, removed in afterEach. */
const appended: Element[] = [];

function append<T extends HTMLElement>(el: T): T {
  document.body.appendChild(el);
  appended.push(el);
  return el;
}

/** jsdom only focuses elements attached to the document. */
function pageButton(): HTMLButtonElement {
  return append(document.createElement("button"));
}

function makeHost(): HTMLElement {
  return append(document.createElement("instafix-widget"));
}

describe("createFocusTracker", () => {
  let tracker: FocusTracker | null = null;

  afterEach(() => {
    tracker?.destroy();
    tracker = null;
    for (const el of appended.splice(0)) el.remove();
  });

  it("tracks focus on a page element", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();

    btn.focus();

    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("ignores widget chrome carrying data-instafix-ignore (previous target retained)", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();

    const chrome = append(document.createElement("div"));
    chrome.setAttribute("data-instafix-ignore", "true");
    chrome.setAttribute("tabindex", "0");
    chrome.focus();

    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("ignores markers inside the #instafix-markers container (previous target retained)", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();

    // Markers are focusable (tabindex=0) and do NOT carry
    // data-instafix-ignore — only the container id identifies them.
    const container = append(document.createElement("div"));
    container.id = "instafix-markers";
    const marker = document.createElement("div");
    marker.setAttribute("tabindex", "0");
    container.appendChild(marker);
    marker.focus();

    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("ignores focus inside a <instafix-widget> element (previous target retained)", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();

    const widget = append(document.createElement("instafix-widget"));
    const inner = document.createElement("button");
    widget.appendChild(inner);
    inner.focus();

    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("ignores focus inside the #sp-tooltip element (previous target retained)", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();

    const tooltip = append(document.createElement("div"));
    tooltip.id = "sp-tooltip";
    tooltip.setAttribute("tabindex", "0");
    tooltip.focus();

    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("ignores focus landing on <body> or <html> (blur/overlay-teardown side effect)", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();

    document.body.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(tracker.getLastPageFocus()).toBe(btn);

    document.documentElement.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(tracker.getLastPageFocus()).toBe(btn);
  });

  it("returns null once the tracked element leaves the DOM", () => {
    tracker = createFocusTracker(makeHost());
    const btn = pageButton();
    btn.focus();
    expect(tracker.getLastPageFocus()).toBe(btn);

    btn.remove();

    expect(tracker.getLastPageFocus()).toBeNull();
  });

  it("destroy() removes the focusin listener — later focus is not tracked", () => {
    tracker = createFocusTracker(makeHost());
    const before = pageButton();
    before.focus();

    tracker.destroy();

    const after = pageButton();
    after.focus();

    expect(tracker.getLastPageFocus()).toBeNull();
    tracker = null;
  });
});
