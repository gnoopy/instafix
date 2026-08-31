import type { SiteLocale } from "../locale";

export interface FooterContent {
  tagline: string;
  contactLabel: string;
  builtBy: string;
}

export const footerContent: Record<SiteLocale, FooterContent> = {
  ko: {
    tagline: "오픈소스 피드백 위젯",
    contactLabel: "문의하기",
    builtBy: "만든 사람",
  },
  en: {
    tagline: "Open-source feedback widget",
    contactLabel: "Contact",
    builtBy: "Built by",
  },
  fr: {
    tagline: "Widget de retours open source",
    contactLabel: "Contact",
    builtBy: "Créé par",
  },
};
