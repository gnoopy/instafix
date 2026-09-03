import type { SiteLocale } from "../locale";

/**
 * The playground was deliberately slimmed down (2026-09): every control that
 * duplicated the widget's own settings section (theme, locale, position,
 * accent, screenshot/diagnostics toggles) was removed — those live INSIDE
 * the widget now, which is also the better demo of them. What remains is
 * only what the widget cannot do itself: the fake diagnostics triggers and
 * the live "code you'd ship" snippet.
 */
export interface PlaygroundContent {
  panelAriaLabel: string;
  panelTitle: string;
  collapseAriaLabel: string;
  /** Standing caption under the title — which store this demo talks to. */
  modeServerCaption: string;
  modeLocalCaption: string;
  /** Points visitors at the widget's own settings section. */
  settingsHint: string;
  diagnosticsCaption: string;
  codeSectionAriaLabel: string;
  codeHeaderLabel: string;
  collapsedTabLabel: string;
}

export const playgroundContent: Record<SiteLocale, PlaygroundContent> = {
  ko: {
    panelAriaLabel: "위젯 플레이그라운드",
    panelTitle: "위젯 플레이그라운드",
    collapseAriaLabel: "플레이그라운드 접기",
    modeServerCaption: "픽스노트가 데모 API로 전송됩니다 (10분마다 초기화)",
    modeLocalCaption: "픽스노트가 이 브라우저에만 저장됩니다 — 서버를 사용하지 않습니다",
    settingsHint: "테마·언어·위치·강조색 등은 위젯 패널의 설정 섹션에서 직접 바꿀 수 있습니다.",
    diagnosticsCaption: "가짜 이벤트를 발생시킨 후 픽스노트를 제출하면 캡처된 내용을 확인할 수 있습니다.",
    codeSectionAriaLabel: "위젯 설정 코드",
    codeHeaderLabel: "실제로 사용할 코드",
    collapsedTabLabel: "플레이그라운드",
  },
  en: {
    panelAriaLabel: "Widget playground",
    panelTitle: "Widget playground",
    collapseAriaLabel: "Collapse the playground",
    modeServerCaption: "Fix notes go to the demo API (resets every 10 minutes)",
    modeLocalCaption: "Fix notes stay in this browser — no server involved",
    settingsHint:
      "Theme, language, position, and accent color are all adjustable in the widget panel's own Settings section.",
    diagnosticsCaption: "Fire fake events, then submit a fix note to see them captured.",
    codeSectionAriaLabel: "Generated widget code",
    codeHeaderLabel: "The code you'd ship",
    collapsedTabLabel: "Playground",
  },
  fr: {
    panelAriaLabel: "Bac à sable du widget",
    panelTitle: "Bac à sable du widget",
    collapseAriaLabel: "Réduire le panneau",
    modeServerCaption: "Les fix notes sont envoyées à l'API de démo (réinitialisée toutes les 10 minutes)",
    modeLocalCaption: "Les fix notes restent dans ce navigateur — aucun serveur utilisé",
    settingsHint:
      "Thème, langue, position et couleur d'accent se règlent directement dans la section Réglages du widget.",
    diagnosticsCaption: "Déclenchez de faux événements, puis envoyez une fix note pour voir ce qui a été capturé.",
    codeSectionAriaLabel: "Code du widget généré",
    codeHeaderLabel: "Le code à utiliser",
    collapsedTabLabel: "Bac à sable",
  },
};
