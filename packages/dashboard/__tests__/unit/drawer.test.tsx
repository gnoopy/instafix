// @vitest-environment jsdom

import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "../../src/components/drawer.js";
import { makeDiagnostics, makeRecord } from "../helpers.js";
import { renderWithUi } from "../render.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderDrawer(recordOverrides = {}, props: Partial<Parameters<typeof Drawer>[0]> = {}) {
  const record = makeRecord(recordOverrides);
  const onClose = vi.fn();
  const onChangeStatus = vi.fn();
  const onDelete = vi.fn();
  const { container } = renderWithUi(
    <Drawer
      record={record}
      overlay={false}
      deepLinkParam="instafix"
      onClose={onClose}
      onChangeStatus={onChangeStatus}
      onDelete={onDelete}
      {...props}
    />,
  );
  return {
    record,
    container,
    onClose,
    onChangeStatus,
    onDelete,
    panel: container.querySelector(".ifd-drawer") as HTMLElement,
  };
}

describe("Drawer — author line", () => {
  it("renders the author email in angle brackets when present", () => {
    const { container } = renderDrawer({ authorName: "Alex Client", authorEmail: "alex@client.example" });
    const author = container.querySelector(".ifd-meta-value");
    expect(author?.textContent).toContain("Alex Client");
    expect(author?.textContent).toContain("<alex@client.example>");
  });

  it("renders no empty '<>' shell when authorEmail is redacted to an empty string", () => {
    const { container } = renderDrawer({ authorName: "Alex Client", authorEmail: "" });
    const author = container.querySelector(".ifd-meta-value");
    expect(author?.textContent).toContain("Alex Client");
    expect(author?.textContent).not.toContain("<>");
  });
});

describe("Drawer — role and focus management", () => {
  it("side-by-side mode renders a non-modal region, no backdrop", () => {
    const { container, panel } = renderDrawer({}, { overlay: false });
    expect(panel.getAttribute("role")).toBe("region");
    expect(panel.hasAttribute("aria-modal")).toBe(false);
    expect(container.querySelector(".ifd-drawer-backdrop")).toBeNull();
  });

  it("overlay mode renders a modal dialog with a backdrop that closes on click", () => {
    const { container, panel, onClose } = renderDrawer({}, { overlay: true });
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    const backdrop = container.querySelector(".ifd-drawer-backdrop") as HTMLElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("overlay mode focuses the panel on mount and restores focus on unmount", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { panel, unmount } = (() => {
      const record = makeRecord();
      const { container, unmount } = renderWithUi(
        <Drawer
          record={record}
          overlay={true}
          deepLinkParam="instafix"
          onClose={vi.fn()}
          onChangeStatus={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      return { panel: container.querySelector(".ifd-drawer") as HTMLElement, unmount };
    })();

    expect(document.activeElement).toBe(panel);
    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("side-by-side mode does not steal focus on mount", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    renderDrawer({}, { overlay: false });
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("Tab is a no-op outside overlay mode", () => {
    const { panel } = renderDrawer({}, { overlay: false });
    const closeBtn = panel.querySelector(".ifd-drawer-close") as HTMLElement;
    closeBtn.focus();
    fireEvent.keyDown(panel, { key: "Tab" });
    // No trap installed — focus is left exactly where it was.
    expect(document.activeElement).toBe(closeBtn);
  });

  it("overlay mode wraps Shift+Tab from the first focusable to the last", () => {
    const { panel } = renderDrawer({}, { overlay: true });
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0] as HTMLElement;
    const last = focusables[focusables.length - 1] as HTMLElement;
    first.focus();
    fireEvent.keyDown(panel, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("overlay mode wraps Tab from the last focusable back to the first", () => {
    const { panel } = renderDrawer({}, { overlay: true });
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0] as HTMLElement;
    const last = focusables[focusables.length - 1] as HTMLElement;
    last.focus();
    fireEvent.keyDown(panel, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });
});

describe("Drawer — status, close, page link, and deep link", () => {
  it("changing status via StatusMenu calls onChangeStatus with the record id", () => {
    const { panel, onChangeStatus, record } = renderDrawer({ status: "open" });
    fireEvent.click(panel.querySelector(".ifd-status-menu-trigger") as HTMLElement);
    fireEvent.click(panel.querySelector('[role="option"][data-status="resolved"]') as HTMLElement);
    expect(onChangeStatus).toHaveBeenCalledWith(record.id, "resolved");
  });

  it("the close button calls onClose", () => {
    const { panel, onClose } = renderDrawer();
    fireEvent.click(panel.querySelector(".ifd-drawer-close") as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a real link for an http(s) page URL, and a deep-link footer", () => {
    const { panel } = renderDrawer({ url: "https://demo.instafix.realstory.blog/pricing" });
    const link = panel.querySelector(".ifd-meta-value[data-mono] a") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://demo.instafix.realstory.blog/pricing");
    const footer = panel.querySelector(".ifd-drawer-foot a") as HTMLAnchorElement;
    expect(footer.getAttribute("href")).toContain("instafix=");
  });

  it("renders plain text (no link, no footer) for a non-http(s) URL", () => {
    const { panel } = renderDrawer({ url: "chrome://settings/privacy" });
    const value = panel.querySelectorAll(".ifd-meta-value[data-mono]")[0] as HTMLElement;
    expect(value.querySelector("a")).toBeNull();
    expect(value.textContent).toBe("chrome://settings/privacy");
    expect(panel.querySelector(".ifd-drawer-foot")).toBeNull();
  });

  it("renders Diagnostics only when console or network entries exist", () => {
    const withDiag = renderDrawer({ diagnostics: makeDiagnostics() });
    expect(withDiag.panel.querySelector(".ifd-diagnostics")).not.toBeNull();

    const withoutDiag = renderDrawer({ diagnostics: null });
    expect(withoutDiag.panel.querySelector(".ifd-diagnostics")).toBeNull();

    const emptyDiag = renderDrawer({ diagnostics: makeDiagnostics({ console: [], network: [] }) });
    expect(emptyDiag.panel.querySelector(".ifd-diagnostics")).toBeNull();
  });
});

describe("Drawer — delete confirmation", () => {
  it("shows a confirm step before deleting, and cancel backs out without deleting", () => {
    const { panel, onDelete } = renderDrawer();
    fireEvent.click(panel.querySelector(".ifd-btn-danger-ghost") as HTMLElement);
    expect(panel.querySelector(".ifd-confirm")).not.toBeNull();

    fireEvent.click(panel.querySelector(".ifd-btn-ghost") as HTMLElement);
    expect(panel.querySelector(".ifd-confirm")).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("confirming delete calls onDelete with the record id", () => {
    const { panel, onDelete, record } = renderDrawer();
    fireEvent.click(panel.querySelector(".ifd-btn-danger-ghost") as HTMLElement);
    fireEvent.click(panel.querySelector(".ifd-btn-danger") as HTMLElement);
    expect(onDelete).toHaveBeenCalledWith(record.id);
  });
});
