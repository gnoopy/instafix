/**
 * Settings view for the feedback panel — gear icon in the header opens this
 * panel-in-panel (same slide-in pattern as `DetailView`) so visitors can
 * adjust theme, locale, position, accent color, and feature toggles without
 * the host writing any code. Every change calls back into
 * `InstaFixInstance.updateConfig()`, which tears the widget down and
 * remounts it with the merged config — there's no cheaper way to apply a
 * new theme/locale/accentColor, all baked in at mount time.
 *
 * Deliberately compact: one row per setting, segmented controls / a native
 * `<select>` / small swatch buttons rather than a full form — this has to
 * fit above an already-dense feedback list, not become its own page.
 */

import type { InstaFixConfig, InstaFixPosition, InstaFixTheme } from "@instafix/core";
import { SegmentedControl } from "./components/segmented-control.js";
import { el, parseSvg, setText } from "./dom-utils.js";
import type { TFunction } from "./i18n/index.js";
import { ICON_ARROW_LEFT } from "./panel-detail.js";

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
  .sp-settings-btn {
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .sp-settings-btn:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
    border-color: var(--sp-text-tertiary);
  }

  .sp-settings-btn svg {
    width: 14px;
    height: 14px;
  }

  .sp-settings {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--sp-glass-bg);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    z-index: 20;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
    overflow: hidden;
    pointer-events: none;
  }

  .sp-settings--visible {
    transform: translateX(0);
    pointer-events: auto;
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .sp-settings { background: var(--sp-bg); }
  }
  @supports (-webkit-backdrop-filter: blur(1px)) and (not (backdrop-filter: blur(1px))) {
    .sp-settings { background: var(--sp-bg); }
  }

  .sp-settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 20px 20px;
  }

  .sp-settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--sp-border);
  }

  .sp-settings-row:last-child {
    border-bottom: none;
  }

  .sp-settings-row-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--sp-text);
    flex-shrink: 0;
  }

  .sp-settings-select {
    font-size: 13px;
    font-family: inherit;
    color: var(--sp-text);
    background: var(--sp-bg-hover);
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius);
    padding: 5px 8px;
    cursor: pointer;
    max-width: 140px;
  }

  .sp-settings-swatches {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-settings-swatch {
    width: 20px;
    height: 20px;
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
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: var(--sp-radius);
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
  }

  .sp-settings-toggle {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: var(--sp-radius-full);
    border: none;
    background: var(--sp-border);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .sp-settings-toggle::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .sp-settings-toggle--on {
    background: var(--sp-accent);
  }

  .sp-settings-toggle--on::after {
    transform: translateX(16px);
  }
`;

export class SettingsView {
  readonly element: HTMLElement;
  private _isVisible = false;
  private colorDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly t: TFunction,
    initialConfig: InstaFixConfig,
    private readonly onChange: (patch: SettingsPatch) => void,
    private readonly onBack: () => void,
  ) {
    this.element = el("div", { class: "sp-settings" });
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-label", this.t("settings.title"));
    this.element.setAttribute("aria-hidden", "true");

    // Header — same look as DetailView's, sharing its CSS classes.
    const header = el("div", { class: "sp-detail-header" });
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "sp-detail-back";
    backBtn.setAttribute("aria-label", this.t("detail.back"));
    backBtn.appendChild(parseSvg(ICON_ARROW_LEFT));
    backBtn.addEventListener("click", () => {
      this.hide();
      this.onBack();
    });
    header.appendChild(backBtn);
    const title = el("span", { class: "sp-detail-title" });
    setText(title, this.t("settings.title"));
    header.appendChild(title);
    this.element.appendChild(header);

    const content = el("div", { class: "sp-settings-content" });

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
    content.appendChild(this.buildRow(this.t("settings.theme"), themeControl.element));

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
    content.appendChild(this.buildRow(this.t("settings.position"), positionControl.element));

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
    content.appendChild(this.buildRow(this.t("settings.locale"), localeSelect));

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
    content.appendChild(this.buildRow(this.t("settings.accentColor"), accentRow));

    content.appendChild(
      this.buildToggleRow(this.t("settings.screenshots"), initialConfig.enableScreenshot ?? false, (checked) =>
        this.onChange({ enableScreenshot: checked }),
      ),
    );
    content.appendChild(
      this.buildToggleRow(this.t("settings.diagnostics"), !!initialConfig.captureDiagnostics, (checked) =>
        this.onChange({ captureDiagnostics: checked }),
      ),
    );
    content.appendChild(
      this.buildToggleRow(
        this.t("settings.rightClickComments"),
        initialConfig.enableRightClickComment ?? false,
        (checked) => this.onChange({ enableRightClickComment: checked }),
      ),
    );

    this.element.appendChild(content);
  }

  private buildRow(label: string, control: HTMLElement): HTMLElement {
    const row = el("div", { class: "sp-settings-row" });
    const labelEl = el("span", { class: "sp-settings-row-label" });
    setText(labelEl, label);
    row.appendChild(labelEl);
    row.appendChild(control);
    return row;
  }

  private buildToggleRow(label: string, initial: boolean, onChange: (checked: boolean) => void): HTMLElement {
    const row = el("div", { class: "sp-settings-row" });
    const labelEl = el("span", { class: "sp-settings-row-label" });
    setText(labelEl, label);
    row.appendChild(labelEl);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = `sp-settings-toggle${initial ? " sp-settings-toggle--on" : ""}`;
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", String(initial));
    toggle.setAttribute("aria-label", label);
    toggle.addEventListener("click", () => {
      const next = toggle.getAttribute("aria-checked") !== "true";
      toggle.setAttribute("aria-checked", String(next));
      toggle.classList.toggle("sp-settings-toggle--on", next);
      onChange(next);
    });
    row.appendChild(toggle);
    return row;
  }

  show(): void {
    if (this._isVisible) return;
    this._isVisible = true;
    this.element.classList.add("sp-settings--visible");
    this.element.setAttribute("aria-hidden", "false");
  }

  hide(): void {
    if (!this._isVisible) return;
    this._isVisible = false;
    this.element.classList.remove("sp-settings--visible");
    this.element.setAttribute("aria-hidden", "true");
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  destroy(): void {
    if (this.colorDebounce) clearTimeout(this.colorDebounce);
    this.hide();
    this.element.remove();
  }
}
