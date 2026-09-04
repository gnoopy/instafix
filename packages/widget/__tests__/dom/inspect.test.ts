// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { inspectElement } from "../../src/dom/inspect.js";

describe("inspectElement", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("builds an ancestor chain, outermost first, ending at the element", () => {
    document.body.innerHTML = `<div id="app"><nav class="site-header"><button class="btn btn-primary">Go</button></nav></div>`;
    const button = document.querySelector("button")!;
    const result = inspectElement(button);
    expect(result?.domPath).toEqual(["div#app", "nav.site-header", "button.btn.btn-primary"]);
  });

  it("stops at body — the chain above it is identical on every page", () => {
    document.body.innerHTML = `<section><p>text</p></section>`;
    const result = inspectElement(document.querySelector("p")!);
    expect(result?.domPath.some((entry) => entry.startsWith("body") || entry.startsWith("html"))).toBe(false);
  });

  it("caps the class list so a utility-CSS element stays readable", () => {
    document.body.innerHTML = `<div class="a b c d e f g"></div>`;
    const result = inspectElement(document.querySelector("div")!);
    expect(result?.domPath.at(-1)).toBe("div.a.b.c");
  });

  it("keeps authored styles and drops CSS defaults", () => {
    document.body.innerHTML = `<div style="display:flex;color:rgb(1, 2, 3)"></div>`;
    const result = inspectElement(document.querySelector("div")!);
    expect(result?.styles.display).toBe("flex");
    expect(result?.styles.color).toBe("rgb(1, 2, 3)");
    // `position: static` is the initial value — noise, not information.
    expect(result?.styles.position).toBeUndefined();
  });

  it("carries a component name only when one was discovered", () => {
    document.body.innerHTML = `<div></div>`;
    const el = document.querySelector("div")!;
    expect(inspectElement(el)?.component).toBeUndefined();
    expect(inspectElement(el, "Header ‹ Layout")?.component).toBe("Header ‹ Layout");
  });

  it("never throws — context is not worth losing a feedback over", () => {
    const hostile = { tagName: "X" } as unknown as Element;
    expect(() => inspectElement(hostile)).not.toThrow();
  });
});
