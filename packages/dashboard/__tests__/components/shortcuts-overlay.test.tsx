// @vitest-environment jsdom

import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShortcutsOverlay } from "../../src/components/shortcuts-overlay.js";
import { renderWithUi } from "../render.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderOverlay() {
  const onClose = vi.fn();
  const { container, unmount } = renderWithUi(<ShortcutsOverlay onClose={onClose} />);
  return { onClose, unmount, overlay: container.querySelector('[role="dialog"]') as HTMLElement };
}

describe("ShortcutsOverlay", () => {
  it("focuses itself on mount", () => {
    const { overlay } = renderOverlay();
    expect(document.activeElement).toBe(overlay);
  });

  it("restores focus to the previously focused element on unmount", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();

    const { unmount } = renderOverlay();
    unmount();

    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it("Escape calls onClose and does not bubble", () => {
    const { overlay, onClose } = renderOverlay();
    const rootHandler = vi.fn();
    document.addEventListener("keydown", rootHandler);
    fireEvent.keyDown(overlay, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    document.removeEventListener("keydown", rootHandler);
  });

  it("clicking the backdrop closes, clicking the card does not", () => {
    const { overlay, onClose } = renderOverlay();
    const card = overlay.querySelector(".ifd-shortcuts-card") as HTMLElement;
    fireEvent.click(card);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Tab is trapped on the overlay itself when the card has no focusable children", () => {
    const { overlay } = renderOverlay();
    fireEvent.keyDown(overlay, { key: "Tab" });
    expect(document.activeElement).toBe(overlay);
  });

  it("renders every shortcut row's keys and label", () => {
    const { overlay } = renderOverlay();
    const kbds = overlay.querySelectorAll(".ifd-kbd");
    expect(kbds.length).toBeGreaterThanOrEqual(11);
    expect(overlay.textContent).toContain("Esc");
  });
});
