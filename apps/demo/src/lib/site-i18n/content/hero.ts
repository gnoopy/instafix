import type { SiteLocale } from "../locale";

export interface HeroContent {
  badge: string;
  iconLabel: string;
  headlineLine1: string;
  headlineLine2: string;
  subheadline: string;
  tryDemo: string;
  readDocs: string;
  frictionRemovers: string;
  priceAnchoring: string;
  badges: {
    typescript: string;
    tests: string;
    bundleSize: string;
    shadowDom: string;
  };
  dogfoodCallout: string;
}

export const heroContent: Record<SiteLocale, HeroContent> = {
  ko: {
    badge: "무료 오픈소스",
    iconLabel: "오픈소스",
    headlineLine1: "클라이언트 피드백,",
    headlineLine2: "픽셀 단위로 정확하게 고정하세요.",
    subheadline:
      "슬랙, 이메일, 노션을 오가며 피드백을 쫓아다니지 마세요. 클라이언트가 사이트에 직접 주석을 남길 수 있습니다 — 셀프 호스팅, DOM 기반 앵커링, SaaS 비용 없음.",
    tryDemo: "데모 체험하기",
    readDocs: "문서 보기",
    frictionRemovers: "평생 무료 · MIT 라이선스 · 셀프 호스팅 · 3분 설치",
    priceAnchoring: "Marker.io ($39/월) · BugHerd ($42/월) · Userback ($79/월)을 대체합니다",
    badges: {
      typescript: "TypeScript",
      tests: "테스트 1,800개 이상",
      bundleSize: "~49KB(gzip), 패널은 지연 로드",
      shadowDom: "Shadow DOM",
    },
    dogfoodCallout: "모서리의 파란 버튼 보이시나요? 바로 이 페이지에서 실행 중인 InstaFix입니다. 직접 사용해 보세요.",
  },
  en: {
    badge: "Free & Open Source",
    iconLabel: "Open source",
    headlineLine1: "Client feedback,",
    headlineLine2: "pinned to the pixel.",
    subheadline:
      "Stop chasing feedback across Slack, email, and Notion. Let your clients annotate your site directly — self-hosted, DOM-anchored, zero SaaS fees.",
    tryDemo: "Try the Demo",
    readDocs: "Read the Docs",
    frictionRemovers: "Free forever · MIT Licensed · Self-hosted · 3 min setup",
    priceAnchoring: "Replaces Marker.io ($39/mo) · BugHerd ($42/mo) · Userback ($79/mo)",
    badges: {
      typescript: "TypeScript",
      tests: "1,800+ tests",
      bundleSize: "~49 kB gz, panel lazy",
      shadowDom: "Shadow DOM",
    },
    dogfoodCallout: "See the blue button in the corner? That's InstaFix running on this page. Try it.",
  },
  fr: {
    badge: "Gratuit et open source",
    iconLabel: "Open source",
    headlineLine1: "Les retours clients,",
    headlineLine2: "épinglés au pixel près.",
    subheadline:
      "Arrêtez de courir après les retours entre Slack, l'e-mail et Notion. Laissez vos clients annoter votre site directement — auto-hébergé, ancré au DOM, sans frais SaaS.",
    tryDemo: "Essayer la démo",
    readDocs: "Consulter la doc",
    frictionRemovers: "Gratuit pour toujours · Licence MIT · Auto-hébergé · Installation en 3 min",
    priceAnchoring: "Remplace Marker.io (39 $/mois) · BugHerd (42 $/mois) · Userback (79 $/mois)",
    badges: {
      typescript: "TypeScript",
      tests: "Plus de 1 800 tests",
      bundleSize: "~49 Ko gzippé, panneau chargé à la demande",
      shadowDom: "Shadow DOM",
    },
    dogfoodCallout: "Vous voyez le bouton bleu dans le coin ? C'est InstaFix, en action sur cette page. Essayez-le.",
  },
};
