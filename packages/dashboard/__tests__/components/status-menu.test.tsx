// @vitest-environment jsdom

import type { FeedbackStatus } from "@instafix/core";
import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusMenu } from "../../src/components/status-menu.js";
import { renderWithUi } from "../render.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderMenu(status: FeedbackStatus = "open") {
  const onSelect = vi.fn();
  const { container } = renderWithUi(<StatusMenu status={status} onSelect={onSelect} />);
  const trigger = container.querySelector(".ifd-status-menu-trigger") as HTMLButtonElement;
  return {
    onSelect,
    trigger,
    pop: () => container.querySelector('[role="listbox"]') as HTMLElement | null,
    option: (value: FeedbackStatus) =>
      container.querySelector(`[role="option"][data-status="${value}"]`) as HTMLElement,
  };
}

describe("StatusMenu", () => {
  it("is closed by default and opens the listbox on trigger click", () => {
    const { trigger, pop } = renderMenu();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(pop()).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(pop()).not.toBeNull();
  });

  it("clicking the trigger again closes it", () => {
    const { trigger, pop } = renderMenu();
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(pop()).toBeNull();
  });

  it("ArrowDown on the trigger opens the menu", () => {
    const { trigger, pop } = renderMenu();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(pop()).not.toBeNull();
  });

  it("closes when a pointerdown happens outside the menu", () => {
    const { trigger, pop } = renderMenu();
    fireEvent.click(trigger);
    expect(pop()).not.toBeNull();
    fireEvent.mouseDown(document.body);
    expect(pop()).toBeNull();
  });

  it("clicking an option selects it and closes the menu", () => {
    const { trigger, option, onSelect, pop } = renderMenu("open");
    fireEvent.click(trigger);
    fireEvent.click(option("resolved"));
    expect(onSelect).toHaveBeenCalledWith("resolved");
    expect(pop()).toBeNull();
  });

  it("selecting the already-current status does not call onSelect", () => {
    const { trigger, option, onSelect } = renderMenu("open");
    fireEvent.click(trigger);
    fireEvent.click(option("open"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Escape and Tab close the popup without selecting", () => {
    const { trigger, pop, onSelect } = renderMenu();
    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "Escape" });
    expect(pop()).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "Tab" });
    expect(pop()).toBeNull();
  });

  it("ArrowDown/ArrowUp/Home/End move the active option, Enter selects it", () => {
    const { trigger, pop, onSelect } = renderMenu("open");
    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "End" });
    fireEvent.keyDown(pop() as HTMLElement, { key: "Enter" });
    // FEEDBACK_STATUSES' last entry is selected via Enter.
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "Home" });
    fireEvent.keyDown(pop() as HTMLElement, { key: " " });
    // Home lands back on "open" (the current status) — selecting it via
    // Space closes the popup without a second onSelect call.
    expect(pop()).toBeNull();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("ArrowDown moves the active option forward by one", () => {
    const { trigger, pop, onSelect } = renderMenu("open"); // index 0
    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "ArrowDown" }); // -> in_progress (index 1)
    fireEvent.keyDown(pop() as HTMLElement, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("in_progress");
  });

  it("ArrowUp clamps at the first option instead of going negative", () => {
    const { trigger, pop, onSelect } = renderMenu("open"); // already index 0
    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "ArrowUp" }); // stays at 0
    fireEvent.keyDown(pop() as HTMLElement, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled(); // selecting "open" again is a no-op
  });

  it("an unrelated key inside the popup is a no-op", () => {
    const { trigger, pop } = renderMenu();
    fireEvent.click(trigger);
    fireEvent.keyDown(pop() as HTMLElement, { key: "a" });
    expect(pop()).not.toBeNull();
  });

  it("Enter/Space on the trigger stop propagation instead of reopening logic", () => {
    const { trigger, pop } = renderMenu();
    const rootHandler = vi.fn();
    document.addEventListener("keydown", rootHandler);
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(pop()).toBeNull(); // trigger's own onKeyDown never calls openMenu for Enter
    document.removeEventListener("keydown", rootHandler);
  });

  it("hovering an option updates the active option", () => {
    const { trigger, option } = renderMenu("open");
    fireEvent.click(trigger);
    fireEvent.mouseEnter(option("resolved"));
    expect(option("resolved").className).toContain("ifd-status-menu-item-active");
  });

  it("moves focus into the popup once it opens", () => {
    const { trigger, pop } = renderMenu();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(pop());
  });
});
