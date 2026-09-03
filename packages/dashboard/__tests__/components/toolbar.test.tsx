// @vitest-environment jsdom

import { cleanup, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toolbar } from "../../src/components/toolbar.js";
import type { InboxState } from "../../src/types.js";
import { renderWithUi } from "../render.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeState(overrides: Partial<InboxState> = {}): InboxState {
  return {
    project: "demo",
    projects: ["demo"],
    setProject: vi.fn(),
    status: "all",
    setStatus: vi.fn(),
    type: "all",
    setType: vi.fn(),
    search: "",
    setSearch: vi.fn(),
    counts: {},
    loading: false,
    refresh: vi.fn(async () => {}),
    ...overrides,
  } as InboxState;
}

function renderToolbar(overrides: Partial<InboxState> = {}) {
  const state = makeState(overrides);
  const searchRef = createRef<HTMLInputElement>();
  const { container } = renderWithUi(<Toolbar state={state} searchRef={searchRef} />);
  return { state, container };
}

describe("Toolbar", () => {
  it("hides the project switcher for a single project", () => {
    const { container } = renderToolbar({ projects: ["demo"] });
    expect(container.querySelector(".ifd-project")).toBeNull();
  });

  it("shows the project switcher when there are multiple projects", () => {
    const { container } = renderToolbar({ projects: ["demo", "marketing"] });
    expect(container.querySelector(".ifd-project")).not.toBeNull();
  });

  it("spins the refresh icon while loading", () => {
    const { container } = renderToolbar({ loading: true });
    expect(container.querySelector(".ifd-refresh")?.className).toContain("ifd-spin");
  });

  it("does not spin the refresh icon when idle", () => {
    const { container } = renderToolbar({ loading: false });
    expect(container.querySelector(".ifd-refresh")?.className).not.toContain("ifd-spin");
  });

  it("clicking refresh calls state.refresh()", () => {
    const { container, state } = renderToolbar();
    fireEvent.click(container.querySelector(".ifd-refresh") as HTMLElement);
    expect(state.refresh).toHaveBeenCalledOnce();
  });
});
