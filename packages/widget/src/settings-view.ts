/**
 * Inline settings accordion for the feedback panel — a "설정" row pinned to
 * the top of the panel body (right below the header) that expands in place
 * to reveal theme/locale/position/accent/feature-toggle controls, then
 * collapses again. Deliberately NOT a separate slide-in sub-panel: visitors
 * asked for the whole option set without a second sidebar competing for
 * space, so everything lives inside the one panel that's already open.
 *
 * Every change calls back into `InstaFixInstance.updateConfig()`, which
 * tears the widget down and remounts it with the merged config — there's no
 * cheaper way to apply a new theme/locale/accentColor, all baked in at mount
 * time. The launcher restores the panel-open + accordion-expanded state
 * right after that remount, so from the visitor's side a setting change
 * reads as "the panel stays put" even though the whole widget was rebuilt
 * underneath it.
 */

import type { InstaFixConfig, InstaFixPosition, InstaFixTheme } from "@instafix/core";
import { SegmentedControl } from "./components/segmented-control.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import type { TFunction } from "./i18n/index.js";
import { ICON_CHEVRON_DOWN, ICON_SETTINGS } from "./icons.js";

/** The subset of `InstaFixConfig` the settings view can change. */
export interface SettingsPatch {
  theme?: InstaFixTheme;
  locale?: string;
  position?: InstaFixPosition;
  accentColor?: string;
  enableScreenshot?: boolean;
  captureDiagnostics?: boolean;
  enableRightClickComment?: boolean;
}

/** Native names — a language picker shows each option in its own language, not translated into the current locale. */
const LOCALES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
];

/** First swatch is the widget's own default accent. */
const SWATCHES: ReadonlyArray<string> = ["#0066ff", "#173CFF", "#7C3AED", "#059669", "#E11D48", "#EA580C"];

export const SETTINGS_CSS = /* css */ `
  .sp-settings {
    flex-shrink: 0;
    border-bottom: 1px solid var(--sp-border);
  }

  .sp-settings-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .sp-settings-toggle:hover {
    color: var(--sp-text);
  }

  .sp-settings-toggle svg:first-child {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .sp-settings-toggle-chevron {
    width: 13px;
    height: 13px;
    margin-left: auto;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .sp-settings-toggle--open .sp-settings-toggle-chevron {
    transform: rotate(180deg);
  }

  /* Height-animatable collapse without measuring scrollHeight in JS. */
  .sp-settings-region {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-settings-region--open {
    grid-template-rows: 1fr;
  }

  .sp-settings-region-inner {
    overflow: hidden;
    min-height: 0;
  }

  .sp-settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 10px;
    padding: 2px 20px 12px;
  }

  .sp-settings-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .sp-settings-field--wide {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sp-settings-field-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--sp-text-tertiary);
  }

  .sp-settings-field--wide .sp-settings-field-label {
    flex-shrink: 0;
  }

  .sp-settings-select {
    font-size: 12px;
    font-family: inherit;
    color: var(--sp-text);
    background: var(--sp-bg-hover);
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius);
    padding: 4px 6px;
    cursor: pointer;
    width: 100%;
  }

  .sp-settings-swatches {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .sp-settings-swatch {
    width: 17px;
    height: 17px;
    border-radius: var(--sp-radius-full);
    border: 2px solid var(--sp-bg);
    box-shadow: 0 0 0 1px var(--sp-border);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .sp-settings-swatch:hover {
    transform: scale(1.15);
  }

  .sp-settings-color-input {
    width: 19px;
    height: 19px;
    padding: 0;
    border: none;
    border-radius: var(--sp-radius);
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
  }

  .sp-settings-chips {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sp-settings-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 10px;
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius-full);
    background: var(--sp-bg-hover);
    color: var(--sp-text);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .sp-settings-switch {
    position: relative;
    width: 26px;
    height: 15px;
    border-radius: var(--sp-radius-full);
    background: var(--sp-border);
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .sp-settings-switch::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .sp-settings-chip--on .sp-settings-switch {
    background: var(--sp-accent);
  }

  .sp-settings-chip--on .sp-settings-switch::after {
    transform: translateX(11px);
  }
`;

export class SettingsView {
  readonly element: HTMLElement;
  private _isExpanded = false;
  private colorDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly toggleBtn: HTMLButtonElement;
  private readonly region: HTMLElement;

  constructor(
    private readonly t: TFunction,
    initialConfig: InstaFixConfig,
    private readonly onChange: (patch: SettingsPatch) => void,
  ) {
    this.element = el("div", { class: "sp-settings" });

    this.toggleBtn = document.createElement("button");
    this.toggleBtn.type = "button";
    this.toggleBtn.className = "sp-settings-toggle";
    this.toggleBtn.setAttribute("aria-expanded", "false");
    this.toggleBtn.appendChild(parseSvg(ICON_SETTINGS));
    const label = el("span", {});
    setText(label, this.t("settings.title"));
    this.toggleBtn.appendChild(label);
    const chevron = parseSvg(ICON_CHEVRON_DOWN);
    chevron.setAttribute("class", "sp-settings-toggle-chevron");
    this.toggleBtn.appendChild(chevron);
    this.toggleBtn.addEventListener("click", () => this.toggle());
    this.element.appendChild(this.toggleBtn);

    this.region = el("div", { class: "sp-settings-region" });
    const regionInner = el("div", { class: "sp-settings-region-inner" });
    const grid = el("div", { class: "sp-settings-grid" });

    const themeControl = new SegmentedControl<InstaFixTheme>({
      options: [
        { value: "light", label: this.t("settings.themeLight") },
        { value: "dark", label: this.t("settings.themeDark") },
        { value: "auto", label: this.t("settings.themeAuto") },
      ],
      value: initialConfig.theme ?? "light",
      onChange: (value) => this.onChange({ theme: value }),
      ariaLabel: this.t("settings.theme"),
      datasetKey: "theme",
    });
    grid.appendChild(this.buildField(this.t("settings.theme"), themeControl.element));

    const positionControl = new SegmentedControl<InstaFixPosition>({
      options: [
        { value: "bottom-right", label: this.t("settings.positionRight") },
        { value: "bottom-left", label: this.t("settings.positionLeft") },
      ],
      value: initialConfig.position ?? "bottom-right",
      onChange: (value) => this.onChange({ position: value }),
      ariaLabel: this.t("settings.position"),
      datasetKey: "position",
    });
    grid.appendChild(this.buildField(this.t("settings.position"), positionControl.element));

    const localeSelect = document.createElement("select");
    localeSelect.className = "sp-settings-select";
    localeSelect.setAttribute("aria-label", this.t("settings.locale"));
    const currentLocale = initialConfig.locale ?? "ko";
    for (const loc of LOCALES) {
      const opt = document.createElement("option");
      opt.value = loc.code;
      opt.textContent = loc.label;
      if (loc.code === currentLocale) opt.selected = true;
      localeSelect.appendChild(opt);
    }
    localeSelect.addEventListener("change", () => this.onChange({ locale: localeSelect.value }));
    grid.appendChild(this.buildField(this.t("settings.locale"), localeSelect));

    const accentRow = el("div", { class: "sp-settings-swatches" });
    for (const hex of SWATCHES) {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "sp-settings-swatch";
      swatch.style.background = hex;
      swatch.setAttribute("aria-label", hex);
      swatch.addEventListener("click", () => this.onChange({ accentColor: hex }));
      accentRow.appendChild(swatch);
    }
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "sp-settings-color-input";
    colorInput.value = initialConfig.accentColor ?? "#0066ff";
    colorInput.setAttribute("aria-label", this.t("settings.accentColor"));
    colorInput.addEventListener("input", () => {
      if (this.colorDebounce) clearTimeout(this.colorDebounce);
      // Debounced — a native color picker fires `input` continuously while
      // dragging, and every change here tears the widget down and remounts.
      this.colorDebounce = setTimeout(() => this.onChange({ accentColor: colorInput.value }), 150);
    });
    accentRow.appendChild(colorInput);
    grid.appendChild(this.buildField(this.t("settings.accentColor"), accentRow, true));

    const chips = el("div", { class: "sp-settings-chips" });
    chips.appendChild(
      this.buildChip(this.t("settings.screenshots"), initialConfig.enableScreenshot ?? false, (checked) =>
        this.onChange({ enableScreenshot: checked }),
      ),
    );
    chips.appendChild(
      this.buildChip(this.t("settings.diagnostics"), !!initialConfig.captureDiagnostics, (checked) =>
        this.onChange({ captureDiagnostics: checked }),
      ),
    );
    chips.appendChild(
      this.buildChip(this.t("settings.rightClickComments"), initialConfig.enableRightClickComment ?? false, (checked) =>
        this.onChange({ enableRightClickComment: checked }),
      ),
    );
    grid.appendChild(chips);

    regionInner.appendChild(grid);
    this.region.appendChild(regionInner);
    this.element.appendChild(this.region);
  }

  private buildField(label: string, control: HTMLElement, wide = false): HTMLElement {
    const field = el("div", { class: wide ? "sp-settings-field sp-settings-field--wide" : "sp-settings-field" });
    const labelEl = el("span", { class: "sp-settings-field-label" });
    setText(labelEl, label);
    field.appendChild(labelEl);
    field.appendChild(control);
    return field;
  }

  private buildChip(label: string, initial: boolean, onChange: (checked: boolean) => void): HTMLElement {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `sp-settings-chip${initial ? " sp-settings-chip--on" : ""}`;
    chip.setAttribute("role", "switch");
    chip.setAttribute("aria-checked", String(initial));

    const labelEl = el("span", {});
    setText(labelEl, label);
    chip.appendChild(labelEl);

    const switchEl = el("span", { class: "sp-settings-switch" });
    switchEl.setAttribute("aria-hidden", "true");
    chip.appendChild(switchEl);

    chip.addEventListener("click", () => {
      const next = chip.getAttribute("aria-checked") !== "true";
      chip.setAttribute("aria-checked", String(next));
      chip.classList.toggle("sp-settings-chip--on", next);
      onChange(next);
    });
    return chip;
  }

  toggle(): void {
    this._isExpanded ? this.collapse() : this.expand();
  }

  expand(): void {
    if (this._isExpanded) return;
    this._isExpanded = true;
    this.region.classList.add("sp-settings-region--open");
    this.toggleBtn.classList.add("sp-settings-toggle--open");
    this.toggleBtn.setAttribute("aria-expanded", "true");
  }

  collapse(): void {
    if (!this._isExpanded) return;
    this._isExpanded = false;
    this.region.classList.remove("sp-settings-region--open");
    this.toggleBtn.classList.remove("sp-settings-toggle--open");
    this.toggleBtn.setAttribute("aria-expanded", "false");
  }

  get isExpanded(): boolean {
    return this._isExpanded;
  }

  destroy(): void {
    if (this.colorDebounce) clearTimeout(this.colorDebounce);
    this.element.remove();
  }
}
