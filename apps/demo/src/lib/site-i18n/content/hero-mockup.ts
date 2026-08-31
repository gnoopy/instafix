import type { SiteLocale } from "../locale";

export interface HeroMockupContent {
  bugLabel: string;
  comment: string;
}

export const heroMockupContent: Record<SiteLocale, HeroMockupContent> = {
  ko: {
    bugLabel: "버그",
    comment: "모바일에서 CTA 버튼이 너무 작아요",
  },
  en: {
    bugLabel: "Bug",
    comment: "The CTA button is too small on mobile",
  },
  fr: {
    bugLabel: "Bug",
    comment: "Le bouton CTA est trop petit sur mobile",
  },
};
