import type { SiteLocale } from "../locale";

export interface HowItWorksContent {
  heading: string;
  subheading: string;
  resultTitle: string;
  mockup: {
    bugLabel: string;
    comment: string;
  };
  cardCaption: string;
  frictionPoints: {
    noAccount: string;
    noApiKey: string;
    noBill: string;
  };
}

export const howItWorksContent: Record<SiteLocale, HowItWorksContent> = {
  ko: {
    heading: "3개의 명령어로 완성되는 클라이언트 피드백",
    subheading: "설치하고, 세팅하고, 배포하세요. 클라이언트는 실제 운영 중인 사이트 위에서 바로 주석을 남깁니다.",
    resultTitle: "클라이언트에게는 이렇게 보입니다",
    mockup: {
      bugLabel: "버그",
      comment: "레티나 화면에서 히어로 이미지가 흐릿해요",
    },
    cardCaption: "로그인도, 계정도 필요 없습니다. 그저 떠 있는 버튼 하나로 픽셀 단위까지 정확한 주석을 남길 수 있어요.",
    frictionPoints: {
      noAccount: "계정 불필요",
      noApiKey: "API 키 불필요",
      noBill: "월 요금 없음",
    },
  },
  en: {
    heading: "From zero to client feedback in 3 commands",
    subheading: "Install, scaffold, and ship. Your clients annotate directly on the live site.",
    resultTitle: "Your clients see this",
    mockup: {
      bugLabel: "Bug",
      comment: "The hero image is blurry on retina",
    },
    cardCaption: "No login. No account. Just a floating button and pixel-perfect annotations.",
    frictionPoints: {
      noAccount: "No account required",
      noApiKey: "No API key",
      noBill: "No monthly bill",
    },
  },
  fr: {
    heading: "De zéro au retour client en 3 commandes",
    subheading: "Installez, configurez, déployez. Vos clients annotent directement sur le site en ligne.",
    resultTitle: "Voici ce que voient vos clients",
    mockup: {
      bugLabel: "Bug",
      comment: "L'image du héro est floue sur écran Retina",
    },
    cardCaption: "Pas de connexion, pas de compte. Juste un bouton flottant et des annotations au pixel près.",
    frictionPoints: {
      noAccount: "Aucun compte requis",
      noApiKey: "Aucune clé API",
      noBill: "Aucun abonnement mensuel",
    },
  },
};
