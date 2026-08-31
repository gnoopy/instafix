import type { SiteLocale } from "../locale";

export interface PlaygroundContent {
  panelAriaLabel: string;
  panelTitle: string;
  collapseAriaLabel: string;
  modeLegend: string;
  modeServerLabel: string;
  modeLocalLabel: string;
  modeServerCaption: string;
  modeLocalCaption: string;
  themeLegend: string;
  themeLightLabel: string;
  themeDarkLabel: string;
  themeAutoLabel: string;
  localeLabel: string;
  positionLegend: string;
  positionRightLabel: string;
  positionLeftLabel: string;
  accentLegend: string;
  /** Accessible names for the accent swatches, keyed by hex code. */
  swatchAriaLabels: Record<string, string>;
  customLabel: string;
  customColorAriaLabel: string;
  optionsLegend: string;
  screenshotsLabel: string;
  diagnosticsLabel: string;
  diagnosticsCaption: string;
  rightClickLabel: string;
  identityLabel: string;
  identityCaption: string;
  resetButtonLabel: string;
  codeSectionAriaLabel: string;
  codeHeaderLabel: string;
  collapsedTabLabel: string;
}

export const playgroundContent: Record<SiteLocale, PlaygroundContent> = {
  ko: {
    panelAriaLabel: "위젯 플레이그라운드",
    panelTitle: "위젯 플레이그라운드",
    collapseAriaLabel: "플레이그라운드 접기",
    modeLegend: "모드",
    modeServerLabel: "서버 API",
    modeLocalLabel: "로컬 (이 브라우저)",
    modeServerCaption: "피드백이 데모 API로 전송됩니다 (10분마다 초기화)",
    modeLocalCaption: "피드백이 이 브라우저에만 저장됩니다 — 서버를 사용하지 않습니다",
    themeLegend: "테마",
    themeLightLabel: "라이트",
    themeDarkLabel: "다크",
    themeAutoLabel: "자동",
    localeLabel: "언어",
    positionLegend: "위치",
    positionRightLabel: "오른쪽 아래",
    positionLeftLabel: "왼쪽 아래",
    accentLegend: "강조 색상",
    swatchAriaLabels: {
      "#173CFF": "강조 색상 프로덕트 블루",
      "#7C3AED": "강조 색상 바이올렛",
      "#059669": "강조 색상 에메랄드",
      "#E11D48": "강조 색상 로즈",
      "#EA580C": "강조 색상 오렌지",
    },
    customLabel: "직접 선택",
    customColorAriaLabel: "사용자 지정 강조 색상",
    optionsLegend: "옵션",
    screenshotsLabel: "스크린샷",
    diagnosticsLabel: "진단 정보 캡처",
    diagnosticsCaption: "가짜 이벤트를 발생시킨 후 피드백을 제출하면 캡처된 내용을 확인할 수 있습니다.",
    rightClickLabel: "우클릭으로 댓글 남기기",
    identityLabel: "신원 정보 미리 채우기",
    identityCaption: "SSO 연동처럼 이름/이메일 입력 과정을 건너뜁니다",
    resetButtonLabel: "기본값으로 재설정",
    codeSectionAriaLabel: "생성된 위젯 코드",
    codeHeaderLabel: "실제로 사용할 코드",
    collapsedTabLabel: "플레이그라운드",
  },
  en: {
    panelAriaLabel: "Widget playground",
    panelTitle: "Widget playground",
    collapseAriaLabel: "Collapse the playground",
    modeLegend: "Mode",
    modeServerLabel: "Server API",
    modeLocalLabel: "Local (this browser)",
    modeServerCaption: "Feedbacks go to the demo API (resets every 10 minutes)",
    modeLocalCaption: "Feedbacks stay in this browser — no server involved",
    themeLegend: "Theme",
    themeLightLabel: "Light",
    themeDarkLabel: "Dark",
    themeAutoLabel: "Auto",
    localeLabel: "Locale",
    positionLegend: "Position",
    positionRightLabel: "Bottom right",
    positionLeftLabel: "Bottom left",
    accentLegend: "Accent color",
    swatchAriaLabels: {
      "#173CFF": "Accent product blue",
      "#7C3AED": "Accent violet",
      "#059669": "Accent emerald",
      "#E11D48": "Accent rose",
      "#EA580C": "Accent orange",
    },
    customLabel: "Custom",
    customColorAriaLabel: "Custom accent color",
    optionsLegend: "Options",
    screenshotsLabel: "Screenshots",
    diagnosticsLabel: "Capture diagnostics",
    diagnosticsCaption: "Fire fake events, then submit a feedback to see them captured.",
    rightClickLabel: "Right-click to comment",
    identityLabel: "Prefilled identity",
    identityCaption: "Skips the name/email prompt, like an SSO integration would",
    resetButtonLabel: "Reset to defaults",
    codeSectionAriaLabel: "Generated widget code",
    codeHeaderLabel: "The code you'd ship",
    collapsedTabLabel: "Playground",
  },
  fr: {
    panelAriaLabel: "Bac à sable du widget",
    panelTitle: "Bac à sable du widget",
    collapseAriaLabel: "Réduire le panneau",
    modeLegend: "Mode",
    modeServerLabel: "API serveur",
    modeLocalLabel: "Local (ce navigateur)",
    modeServerCaption: "Les retours sont envoyés à l'API de démo (réinitialisée toutes les 10 minutes)",
    modeLocalCaption: "Les retours restent dans ce navigateur — aucun serveur utilisé",
    themeLegend: "Thème",
    themeLightLabel: "Clair",
    themeDarkLabel: "Sombre",
    themeAutoLabel: "Automatique",
    localeLabel: "Langue",
    positionLegend: "Position",
    positionRightLabel: "Bas droite",
    positionLeftLabel: "Bas gauche",
    accentLegend: "Couleur d'accent",
    swatchAriaLabels: {
      "#173CFF": "Accent bleu produit",
      "#7C3AED": "Accent violet",
      "#059669": "Accent émeraude",
      "#E11D48": "Accent rose",
      "#EA580C": "Accent orange",
    },
    customLabel: "Personnalisée",
    customColorAriaLabel: "Couleur d'accent personnalisée",
    optionsLegend: "Options",
    screenshotsLabel: "Captures d'écran",
    diagnosticsLabel: "Capturer les diagnostics",
    diagnosticsCaption: "Déclenchez de faux événements, puis envoyez un retour pour voir ce qui a été capturé.",
    rightClickLabel: "Clic droit pour commenter",
    identityLabel: "Identité prérenseignée",
    identityCaption: "Évite la saisie du nom/e-mail, comme le ferait une connexion SSO",
    resetButtonLabel: "Réinitialiser",
    codeSectionAriaLabel: "Code du widget généré",
    codeHeaderLabel: "Le code à utiliser",
    collapsedTabLabel: "Bac à sable",
  },
};
