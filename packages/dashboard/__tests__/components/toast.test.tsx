// @vitest-environment jsdom

import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast, type ToastData } from "../../src/components/toast.js";
import { renderWithUi } from "../render.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function renderToast(toast: ToastData | null) {
  const onUndo = vi.fn();
  const onDismiss = vi.fn();
  const focusList = vi.fn();
  const { container } = renderWithUi(<Toast toast={toast} onUndo={onUndo} onDismiss={onDismiss} />, { focusList });
  return { onUndo, onDismiss, focusList, region: container.querySelector('[role="status"]') as HTMLElement };
}

describe("Toast", () => {
  it("renders an empty live region when there is no toast", () => {
    const { region } = renderToast(null);
    expect(region.querySelector(".ifd-toast")).toBeNull();
  });

  it("shows the message and an undo button when undoable", () => {
    const { region } = renderToast({ id: 1, message: "Deleted", undoable: true });
    expect(region.querySelector(".ifd-toast-msg")?.textContent).toBe("Deleted");
    expect(region.querySelector(".ifd-btn-ghost")).not.toBeNull();
  });

  it("hides the undo button when not undoable", () => {
    const { region } = renderToast({ id: 1, message: "Saved", undoable: false });
    expect(region.querySelector(".ifd-btn-ghost")).toBeNull();
  });

  it("clicking undo calls onUndo and returns focus to the list", () => {
    const { region, onUndo, focusList } = renderToast({ id: 1, message: "Deleted", undoable: true });
    fireEvent.click(region.querySelector(".ifd-btn-ghost") as HTMLElement);
    expect(onUndo).toHaveBeenCalledOnce();
    expect(focusList).toHaveBeenCalledOnce();
  });

  it("auto-dismisses after 5 seconds", () => {
    const { onDismiss } = renderToast({ id: 1, message: "Saved", undoable: false });
    vi.advanceTimersByTime(4999);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("pauses the dismiss timer on hover and resumes on mouse leave", () => {
    const { region, onDismiss } = renderToast({ id: 1, message: "Saved", undoable: false });
    const toastEl = region.querySelector(".ifd-toast") as HTMLElement;
    vi.advanceTimersByTime(3000);
    fireEvent.mouseEnter(toastEl);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toastEl);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("pauses the dismiss timer on focus and resumes on blur", () => {
    const { region, onDismiss } = renderToast({ id: 1, message: "Saved", undoable: false });
    const toastEl = region.querySelector(".ifd-toast") as HTMLElement;
    fireEvent.focus(toastEl);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.blur(toastEl);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
