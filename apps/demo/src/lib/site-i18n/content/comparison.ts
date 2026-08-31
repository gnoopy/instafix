import type { SiteLocale } from "../locale";

export interface ComparisonContent {
  heading: string;
  subheading: string;
  recommendedBadge: string;
  features: {
    selfHosted: string;
    npmPackage: string;
    openSource: string;
    pricing: string;
    domAnchored: string;
    survivesLayout: string;
    triageInbox: string;
    customizable: string;
  };
  labels: {
    sdkOnly: string;
    freeBadge: string;
    screenshot: string;
    pinOnly: string;
    partial: string;
    saasOnly: string;
    reactComponent: string;
    fullControl: string;
    limited: string;
  };
  prices: {
    markerio: string;
    bugherd: string;
    userback: string;
  };
}

export const comparisonContent: Record<SiteLocale, ComparisonContent> = {
  ko: {
    heading: "InstaFix vs. 다른 대안들",
    subheading: "이미 무료로 셀프 호스팅할 수 있는 기능에 왜 매달 $39~79를 지불하시나요?",
    recommendedBadge: "추천",
    features: {
      selfHosted: "셀프 호스팅",
      npmPackage: "npm 패키지",
      openSource: "오픈소스",
      pricing: "요금",
      domAnchored: "DOM 기반 앵커링",
      survivesLayout: "레이아웃 변경에도 안정적",
      triageInbox: "트리아지 인박스",
      customizable: "커스터마이징",
    },
    labels: {
      sdkOnly: "SDK만 제공",
      freeBadge: "무료",
      screenshot: "스크린샷 방식",
      pinOnly: "핀 고정만",
      partial: "부분 지원",
      saasOnly: "SaaS 전용",
      reactComponent: "React 컴포넌트",
      fullControl: "완전한 제어",
      limited: "제한적",
    },
    prices: {
      markerio: "$39/월",
      bugherd: "$42/월",
      userback: "$79/월",
    },
  },
  en: {
    heading: "InstaFix vs. the alternatives",
    subheading: "Why pay $39-79/mo for features you can self-host for free?",
    recommendedBadge: "Recommended",
    features: {
      selfHosted: "Self-hosted",
      npmPackage: "npm package",
      openSource: "Open source",
      pricing: "Pricing",
      domAnchored: "DOM-anchored",
      survivesLayout: "Survives layout changes",
      triageInbox: "Triage inbox",
      customizable: "Customizable",
    },
    labels: {
      sdkOnly: "SDK only",
      freeBadge: "Free",
      screenshot: "Screenshot",
      pinOnly: "Pin only",
      partial: "Partial",
      saasOnly: "SaaS only",
      reactComponent: "React component",
      fullControl: "Full control",
      limited: "Limited",
    },
    prices: {
      markerio: "$39/mo",
      bugherd: "$42/mo",
      userback: "$79/mo",
    },
  },
  fr: {
    heading: "InstaFix face à la concurrence",
    subheading: "Pourquoi payer 39 à 79 $/mois pour des fonctionnalités que vous pouvez auto-héberger gratuitement ?",
    recommendedBadge: "Recommandé",
    features: {
      selfHosted: "Auto-hébergé",
      npmPackage: "Package npm",
      openSource: "Open source",
      pricing: "Tarif",
      domAnchored: "Ancrage DOM",
      survivesLayout: "Résiste aux changements de mise en page",
      triageInbox: "Boîte de triage",
      customizable: "Personnalisable",
    },
    labels: {
      sdkOnly: "SDK uniquement",
      freeBadge: "Gratuit",
      screenshot: "Capture d'écran",
      pinOnly: "Épingle uniquement",
      partial: "Partiel",
      saasOnly: "SaaS uniquement",
      reactComponent: "Composant React",
      fullControl: "Contrôle total",
      limited: "Limité",
    },
    prices: {
      markerio: "39 $/mois",
      bugherd: "42 $/mois",
      userback: "79 $/mois",
    },
  },
};
