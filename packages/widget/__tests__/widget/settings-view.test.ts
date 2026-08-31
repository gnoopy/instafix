// @vitest-environment jsdom

import type { InstaFixConfig } from "@instafix/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createT } from "../../src/i18n/index.js";
import { type SettingsPatch, SettingsView } from "../../src/settings-view.js";

const t = createT("en");

function baseConfig(overrides: Partial<InstaFixConfig> = {}): InstaFixConfig {
  return { projectName: "test-project", endpoint: "/api/instafix", ...overrides } as InstaFixConfig;
}

describe("SettingsView", () => {
  let onChange: ReturnType<typeof vi.fn<(patch: SettingsPatch) => void>>;
  let onBack: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onChange = vi.fn();
    onBack = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts hidden", () => {
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    expect(view.isVisible).toBe(false);
    expect(view.element.classList.contains("sp-settings--visible")).toBe(false);
    view.destroy();
  });

  it("show()/hide() toggle visibility and are each idempotent", () => {
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    view.show();
    expect(view.isVisible).toBe(true);
    view.show(); // no-op, no throw
    expect(view.isVisible).toBe(true);

    view.hide();
    expect(view.isVisible).toBe(false);
    view.hide(); // no-op, no throw
    expect(view.isVisible).toBe(false);
    view.destroy();
  });

  it("the back button hides the view and calls onBack", () => {
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    view.show();

    view.element.querySelector<HTMLButtonElement>(".sp-detail-back")!.click();

    expect(view.isVisible).toBe(false);
    expect(onBack).toHaveBeenCalledOnce();
    view.destroy();
  });

  it("reflects the initial config in each control's starting state", () => {
    const view = new SettingsView(
      t,
      baseConfig({
        theme: "dark",
        position: "bottom-left",
        locale: "fr",
        accentColor: "#173CFF",
        enableScreenshot: true,
        captureDiagnostics: true,
        enableRightClickComment: false,
      }),
      onChange,
      onBack,
    );

    expect(view.element.querySelector('[data-theme="dark"]')?.getAttribute("aria-checked")).toBe("true");
    expect(view.element.querySelector('[data-position="bottom-left"]')?.getAttribute("aria-checked")).toBe("true");
    expect(view.element.querySelector<HTMLSelectElement>(".sp-settings-select")!.value).toBe("fr");
    expect(view.element.querySelector<HTMLInputElement>(".sp-settings-color-input")!.value).toBe("#173cff");

    const toggles = view.element.querySelectorAll<HTMLButtonElement>(".sp-settings-toggle");
    // Order: screenshots, diagnostics, right-click comments.
    expect(toggles[0]?.getAttribute("aria-checked")).toBe("true");
    expect(toggles[1]?.getAttribute("aria-checked")).toBe("true");
    expect(toggles[2]?.getAttribute("aria-checked")).toBe("false");

    view.destroy();
  });

  it("clicking the theme segmented control calls onChange with { theme }", () => {
    const view = new SettingsView(t, baseConfig({ theme: "light" }), onChange, onBack);
    view.element.querySelector<HTMLButtonElement>('[data-theme="auto"]')!.click();
    expect(onChange).toHaveBeenCalledWith({ theme: "auto" });
    view.destroy();
  });

  it("clicking the position segmented control calls onChange with { position }", () => {
    const view = new SettingsView(t, baseConfig({ position: "bottom-right" }), onChange, onBack);
    view.element.querySelector<HTMLButtonElement>('[data-position="bottom-left"]')!.click();
    expect(onChange).toHaveBeenCalledWith({ position: "bottom-left" });
    view.destroy();
  });

  it("changing the locale select calls onChange with { locale }", () => {
    const view = new SettingsView(t, baseConfig({ locale: "en" }), onChange, onBack);
    const select = view.element.querySelector<HTMLSelectElement>(".sp-settings-select")!;
    select.value = "de";
    select.dispatchEvent(new Event("change"));
    expect(onChange).toHaveBeenCalledWith({ locale: "de" });
    view.destroy();
  });

  it("clicking an accent swatch calls onChange with { accentColor } immediately (no debounce)", () => {
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    const swatch = view.element.querySelector<HTMLButtonElement>(".sp-settings-swatch")!;
    swatch.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].accentColor).toBeTruthy();
    view.destroy();
  });

  it("dragging the native color input debounces onChange to a single call", () => {
    vi.useFakeTimers();
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    const colorInput = view.element.querySelector<HTMLInputElement>(".sp-settings-color-input")!;

    for (const hex of ["#111111", "#222222", "#333333"]) {
      colorInput.value = hex;
      colorInput.dispatchEvent(new Event("input"));
    }
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ accentColor: "#333333" });

    view.destroy();
  });

  it("destroy() cancels a pending debounced color change", () => {
    vi.useFakeTimers();
    const view = new SettingsView(t, baseConfig(), onChange, onBack);
    const colorInput = view.element.querySelector<HTMLInputElement>(".sp-settings-color-input")!;
    colorInput.value = "#444444";
    colorInput.dispatchEvent(new Event("input"));

    view.destroy();
    vi.advanceTimersByTime(150);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("each toggle flips its aria-checked state and calls onChange with the matching key", () => {
    const view = new SettingsView(
      t,
      baseConfig({ enableScreenshot: false, captureDiagnostics: false, enableRightClickComment: false }),
      onChange,
      onBack,
    );
    const [screenshotToggle, diagnosticsToggle, rightClickToggle] = Array.from(
      view.element.querySelectorAll<HTMLButtonElement>(".sp-settings-toggle"),
    );

    screenshotToggle!.click();
    expect(screenshotToggle!.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith({ enableScreenshot: true });

    diagnosticsToggle!.click();
    expect(diagnosticsToggle!.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith({ captureDiagnostics: true });

    rightClickToggle!.click();
    expect(rightClickToggle!.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith({ enableRightClickComment: true });

    // Clicking again flips it back off.
    screenshotToggle!.click();
    expect(screenshotToggle!.getAttribute("aria-checked")).toBe("false");
    expect(onChange).toHaveBeenLastCalledWith({ enableScreenshot: false });
    view.destroy();
  });
});
