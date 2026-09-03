// @vitest-environment jsdom

import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusTabs } from "../../src/components/status-tabs.js";
import type { InboxState, InboxStatusFilter } from "../../src/types.js";
import { renderWithUi } from "../render.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderTabs(status: InboxStatusFilter = "all", counts: InboxState["counts"] = {}) {
  const onChange = vi.fn();
  const { container } = renderWithUi(<StatusTabs status={status} counts={counts} onChange={onChange} />);
  return { onChange, group: container.querySelector('[role="radiogroup"]') as HTMLElement };
}

function tab(group: HTMLElement, status: InboxStatusFilter): HTMLButtonElement {
  return group.querySelector(`[data-status="${status}"]`) as HTMLButtonElement;
}

describe("StatusTabs", () => {
  it("marks the active status checked and gives it the only tabbable tab", () => {
    const { group } = renderTabs("open");
    expect(tab(group, "open").getAttribute("aria-checked")).toBe("true");
    expect(tab(group, "open").tabIndex).toBe(0);
    expect(tab(group, "all").getAttribute("aria-checked")).toBe("false");
    expect(tab(group, "all").tabIndex).toBe(-1);
  });

  it("shows an em dash when a count is not loaded yet, and the number once it is", () => {
    const { group } = renderTabs("all", { open: 3 });
    expect(tab(group, "open").querySelector(".ifd-tab-count")?.textContent).toBe("3");
    expect(tab(group, "in_progress").querySelector(".ifd-tab-count")?.textContent).toBe("—");
  });

  it("calls onChange when a tab is clicked", () => {
    const { group, onChange } = renderTabs("all");
    fireEvent.click(tab(group, "resolved"));
    expect(onChange).toHaveBeenCalledWith("resolved");
  });

  it("ArrowRight/ArrowLeft move selection and focus by one, clamped at the ends", () => {
    const { group, onChange } = renderTabs("all");
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("open");

    onChange.mockClear();
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    // Still rendered with status="all" (onChange doesn't re-render this test's
    // fixed props), so ArrowLeft from index 0 clamps and fires no change.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Home and End jump to the first and last tab", () => {
    const { group, onChange } = renderTabs("in_progress");
    fireEvent.keyDown(group, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith("wont_fix");

    onChange.mockClear();
    fireEvent.keyDown(group, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith("all");
  });

  it("ignores unrelated keys", () => {
    const { group, onChange } = renderTabs("all");
    fireEvent.keyDown(group, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
