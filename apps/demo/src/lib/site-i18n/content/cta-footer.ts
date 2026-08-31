import type { SiteLocale } from "../locale";

export interface CtaFooterContent {
  heading: string;
  subheading: string;
  getStarted: string;
  tryDemo: string;
}

export const ctaFooterContent: Record<SiteLocale, CtaFooterContent> = {
  ko: {
    heading: "스크린샷 이메일은 이제 그만",
    subheading: "몇 분 만에 시작하세요. 평생 무료입니다.",
    getStarted: "시작하기",
    tryDemo: "데모 체험하기",
  },
  en: {
    heading: "Ready to ditch screenshot emails?",
    subheading: "Get started in minutes. Free forever.",
    getStarted: "Get Started",
    tryDemo: "Try the Demo",
  },
  fr: {
    heading: "Prêt à abandonner les captures d'écran par e-mail ?",
    subheading: "Démarrez en quelques minutes. Gratuit pour toujours.",
    getStarted: "Commencer",
    tryDemo: "Essayer la démo",
  },
};
