// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { generateAnchor } from "../../src/dom/anchor.js";
import { inspectElement } from "../../src/dom/inspect.js";
import { generateXPath } from "../../src/dom/xpath.js";

// jsdom lacks CSS.escape (same polyfill as anchor-generate.test.ts).
if (typeof CSS === "undefined") {
  (globalThis as Record<string, unknown>).CSS = { escape: (s: string) => s };
} else if (!CSS.escape) {
  CSS.escape = (s: string) => s;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("generated element ids are not anchors", () => {
  it("never uses a React/Base UI generated id in the selector, element id or xpath", () => {
    document.body.innerHTML = `<main><div id="base-ui-_r_7_"><button id=":r2:" class="save">Save</button></div></main>`;
    const button = document.querySelector("button") as Element;
    const anchor = generateAnchor(button);
    expect(anchor.elementId).toBeUndefined();
    expect(anchor.cssSelector).not.toContain("_r_7_");
    expect(anchor.cssSelector).not.toContain("r2");
    expect(anchor.xpath).not.toContain("@id");
    expect(generateXPath(button)).toBe("/html/body/main[1]/div[1]/button[1]");
    expect(inspectElement(button)?.domPath).toEqual(["main", "div", "button.save"]);
  });

  it("still anchors on an authored id", () => {
    document.body.innerHTML = `<div id="checkout"><button id="buy">Buy</button></div>`;
    const button = document.querySelector("#buy") as Element;
    expect(generateAnchor(button).elementId).toBe("buy");
    expect(generateXPath(button)).toBe("//button[@id='buy']");
  });
});
