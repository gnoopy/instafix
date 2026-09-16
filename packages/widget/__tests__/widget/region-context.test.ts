// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildComposeFeedback } from "../../src/popup.js";
import { RegionContext } from "../../src/region-context.js";

const feedback = (id: string, url = "/page", message = "") => ({
  ...buildComposeFeedback([], "change", message),
  id,
  url,
});
const bounds = new DOMRect(10, 20, 100, 80);
const noImage = async () => null;
let regions: RegionContext;
beforeEach(() => {
  sessionStorage.clear();
  regions = new RegionContext("project", () => "/page");
});
afterEach(() => {
  regions.destroy();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("page-level region namespace", () => {
  it("does not renumber after filtering, sorting, deletion or widget recreation", () => {
    expect(regions.remember(feedback("a"))).toBe(1);
    expect(regions.remember(feedback("b"))).toBe(2);
    expect(regions.remember(feedback("b"))).toBe(2);
    regions.remove("a");
    expect(regions.remember(feedback("c"))).toBe(3);
    regions.destroy();
    regions = new RegionContext("project", () => "/page");
    expect(regions.remember(feedback("b"))).toBe(2);
    expect(regions.remember(feedback("d"))).toBe(4);
  });

  it("isolates page and project namespaces", () => {
    expect(regions.remember(feedback("a"))).toBe(1);
    expect(regions.remember(feedback("b", "/other"))).toBe(1);
    const other = new RegionContext("other-project", () => "/page");
    expect(other.regions()).toEqual([]);
    other.destroy();
  });

  it("retains prior selections and keeps their number on submission", () => {
    const id = regions.begin(feedback("draft"));
    regions.update(id, feedback("draft"), bounds, noImage);
    expect(document.querySelector("[data-instafix-region]")?.textContent).toBe("#1");
    regions.commit(id, feedback("saved"));
    expect(regions.remember(feedback("saved"))).toBe(1);
    expect(document.querySelector("[data-instafix-region]")).toBeNull();
    expect(regions.regions()).toHaveLength(1);
  });

  it("exports only explicitly referenced same-page images with the actual attachment name", async () => {
    const download = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const id = regions.begin(feedback("draft"));
    const capture = vi.fn(async () => ({
      dataUrl: "data:image/jpeg;base64,AA==",
      region: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
    }));
    regions.update(id, feedback("draft"), bounds, capture);
    regions.update(id, feedback("draft"), bounds, capture);
    await regions.prepare([feedback("other", "/elsewhere", "#1")]);
    expect(download).not.toHaveBeenCalled();
    await regions.prepare([feedback("current", "/page", "#1의 1번처럼 수정")]);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledOnce();
    const attachment = download.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(attachment.download).toMatch(new RegExp(`^instafix-region-1-${id}-.+\\.jpg$`));
    expect(regions.regions().find((region) => region.feedback.id === id)?.screenshotFilename).toBe(attachment.download);
  });

  it("exports inline stored screenshots with the correct extension and does not download unchanged images twice", async () => {
    const download = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const saved = { ...feedback("saved"), screenshotUrl: "data:image/png;base64,AA==" };
    regions.remember(saved);
    await regions.prepare([saved]);
    await regions.prepare([saved]);
    expect(download).toHaveBeenCalledOnce();
    expect(regions.regions()[0]?.screenshotFilename).toMatch(/\.png$/);
    expect(sessionStorage.getItem("instafix:regions:v1:project")).not.toContain("data:image/");
  });

  it("does not claim a screenshot filename when capture fails or is disabled", async () => {
    const id = regions.begin(feedback("draft"));
    regions.update(id, feedback("draft"), bounds, async () => {
      throw new Error("capture failed");
    });
    await regions.prepare([regions.feedback(id)!]);
    expect(regions.regions()[0]?.screenshotFilename).toBeUndefined();
  });

  it("ignores stale captures after the selection changes", async () => {
    let finish!: (shot: {
      dataUrl: string;
      region: { xPct: number; yPct: number; wPct: number; hPct: number };
    }) => void;
    const id = regions.begin(feedback("draft"));
    regions.update(
      id,
      feedback("draft"),
      bounds,
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await Promise.resolve();
    regions.update(id, feedback("draft"), new DOMRect(30, 40, 200, 100), noImage);
    finish({ dataUrl: "data:image/jpeg;base64,old", region: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 } });
    await regions.prepare([regions.feedback(id)!]);
    expect(regions.regions()[0]?.screenshotFilename).toBeUndefined();
  });
});
