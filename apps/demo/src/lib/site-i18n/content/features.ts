import type { SiteLocale } from "../locale";

export interface FeatureCardContent {
  title: string;
  description: string;
}

export interface TriageInboxItemContent {
  text: string;
  status: string;
}

export interface FeaturesContent {
  sectionTitle: string;
  sectionSubtitle: string;
  marqueeCaption: string;

  selfHosted: FeatureCardContent;
  selfHostedVisual: {
    dataStaysOnServer: string;
  };

  domAnchored: FeatureCardContent;
  domAnchoredVisual: {
    anchoredBadge: string;
    caption: string;
  };

  annotatedScreenshots: FeatureCardContent;
  diagnosticsVisual: {
    attachedToFeedback: string;
  };

  triageInbox: {
    title: string;
    descBeforeComponent: string;
    descBetweenComponentAndKeys: string;
    descAfterKeys: string;
    linkText: string;
  };
  triageInboxVisual: {
    header: string;
    moveHint: string;
    items: TriageInboxItemContent[];
  };

  languages: FeatureCardContent;
  accessibility: FeatureCardContent;
  authPrivacy: FeatureCardContent;
  npmInstall: FeatureCardContent;
  openSource: FeatureCardContent;
  cliScaffold: FeatureCardContent;

  shadowDom: FeatureCardContent;
  shadowDomVisual: {
    yourSiteCss: string;
    widgetCss: string;
  };
}

export const featuresContent: Record<SiteLocale, FeaturesContent> = {
  ko: {
    sectionTitle: "다르게 만들었습니다",
    sectionSubtitle: "필요한 것만, 딱 그만큼.",
    marqueeCaption: "어떤 스택이든 잘 어울립니다",

    selfHosted: {
      title: "셀프 호스팅",
      description:
        "데이터베이스도, 데이터도 모두 당신 것입니다. 벤더 종속도, 월 사용료도 없습니다. Node.js가 돌아가는 곳이라면 어디든 배포하세요.",
    },
    selfHostedVisual: {
      dataStaysOnServer: "데이터는 당신의 서버에만 저장됩니다",
    },

    domAnchored: {
      title: "DOM 앵커링",
      description:
        "레이아웃이 바뀌어도 주석은 그대로 남습니다. CSS 선택자, XPath, 텍스트 폴백까지 이어지는 다중 앵커링 방식입니다.",
    },
    domAnchoredVisual: {
      anchoredBadge: "앵커링됨",
      caption: "CSS + XPath + 텍스트 폴백",
    },

    annotatedScreenshots: {
      title: "주석이 달린 스크린샷",
      description:
        '클라이언트가 표시한 영역의 캡처와 함께 최근 콘솔 에러, 실패한 요청까지 함께 첨부됩니다 — "그냥 안 돼요"라는 말에도 근거가 따라옵니다.',
    },
    diagnosticsVisual: {
      attachedToFeedback: "피드백에 자동 첨부됨",
    },

    triageInbox: {
      title: "트리아지 인박스",
      descBeforeComponent: "",
      descBetweenComponentAndKeys: "를 관리자 페이지에 추가하고 ",
      descAfterKeys:
        " 키로 리포트를 빠르게 처리하세요 — 상태는 4단계이며, 클라이언트가 그린 주석이 스크린샷 위에 그대로 재현됩니다. Slack, Discord, 범용 웹훅으로 피드백이 도착하는 즉시 팀에 알립니다.",
      linkText: "데모 인박스에서 직접 확인하기 →",
    },
    triageInboxVisual: {
      header: "인박스 · 미해결 2건",
      moveHint: "로 이동",
      items: [
        { text: "히어로 이미지가 레티나에서 흐릿하게 보여요", status: "미해결" },
        { text: "히어로 버튼 두 개의 위치를 바꿔주세요", status: "진행 중" },
        { text: "푸터 링크가 같은 탭에서 열려요", status: "해결됨" },
      ],
    },

    languages: {
      title: "7개 언어 기본 지원",
      description:
        "영어, 프랑스어, 독일어, 스페인어, 이탈리아어, 포르투갈어, 러시아어 — 위젯과 인박스 모두 지원합니다.",
    },
    accessibility: {
      title: "키보드 우선 접근성",
      description:
        "WCAG 2.1 AA 기준으로 감사를 마쳤습니다. 클라이언트는 마우스 없이도 Tab으로 요소를 선택하고 Enter로 주석을 남길 수 있습니다. 유럽 접근성법(EAA) 대응도 준비되어 있습니다.",
    },
    authPrivacy: {
      title: "인증 & 개인정보 보호",
      description:
        "API 키를 설정하면 관리자 라우트에 Bearer 토큰이 필요해집니다. 키 없이 조회할 경우 기본적으로 리뷰어의 이메일은 가려집니다.",
    },
    npmInstall: {
      title: "설치 한 줄이면 끝",
      description: "코드 세 줄이면 충분합니다. Next.js, 어떤 프레임워크든, 순수 자바스크립트든 모두 지원합니다.",
    },
    openSource: {
      title: "오픈소스",
      description: "완전히 투명하고, 완전히 통제 가능합니다. 기여하거나, 포크하거나, 자유롭게 커스터마이즈하세요.",
    },
    cliScaffold: {
      title: "CLI 스캐폴드",
      description: "Prisma 또는 SQLite 저장소와 API 라우트를 몇 초 만에 구성합니다.",
    },

    shadowDom: {
      title: "Shadow DOM 격리",
      description:
        "위젯 CSS는 절대 당신의 사이트로 새어나가지 않습니다. 당신의 사이트 CSS도 위젯을 절대 망가뜨리지 않습니다.",
    },
    shadowDomVisual: {
      yourSiteCss: "당신의 사이트 CSS",
      widgetCss: "위젯 CSS",
    },
  },

  en: {
    sectionTitle: "Built different",
    sectionSubtitle: "Everything you need, nothing you don't.",
    marqueeCaption: "Works with your stack",

    selfHosted: {
      title: "Self-Hosted",
      description: "Your database, your data. No vendor lock-in, no monthly fees. Deploy anywhere you run Node.js.",
    },
    selfHostedVisual: {
      dataStaysOnServer: "Your data stays on your server",
    },

    domAnchored: {
      title: "DOM-Anchored",
      description: "Annotations survive layout changes. Multi-selector anchoring with CSS, XPath, and text fallback.",
    },
    domAnchoredVisual: {
      anchoredBadge: "Anchored",
      caption: "CSS + XPath + text fallback",
    },

    annotatedScreenshots: {
      title: "Annotated screenshots",
      description:
        'Each report can attach a capture of the exact area the client circled, plus the last console errors and failed requests — "it just doesn\'t work" arrives with evidence.',
    },
    diagnosticsVisual: {
      attachedToFeedback: "Attached to the feedback",
    },

    triageInbox: {
      title: "Triage inbox",
      descBeforeComponent: "Drop ",
      descBetweenComponentAndKeys: " into your admin page and work through reports with ",
      descAfterKeys:
        " — four statuses, the client's annotation re-drawn on the screenshot. Slack, Discord, and generic webhooks ping your team the moment feedback lands.",
      linkText: "See it live in the demo inbox →",
    },
    triageInboxVisual: {
      header: "Inbox · 2 open",
      moveHint: "to move",
      items: [
        { text: "The hero image is blurry on retina", status: "Open" },
        { text: "Swap the two hero buttons", status: "In progress" },
        { text: "Footer links open in the same tab", status: "Resolved" },
      ],
    },

    languages: {
      title: "7 languages built in",
      description: "English, French, German, Spanish, Italian, Portuguese, and Russian — in the widget and the inbox.",
    },
    accessibility: {
      title: "Keyboard-first accessibility",
      description:
        "Audited against WCAG 2.1 AA. Clients can annotate without a mouse — Tab to the element, press Enter. Ready for the European Accessibility Act.",
    },
    authPrivacy: {
      title: "Auth & privacy",
      description:
        "Set an API key and admin routes require a Bearer token. Reads without one get reviewer emails blanked by default.",
    },
    npmInstall: {
      title: "One-Command Install",
      description: "Three lines of code. Works with Next.js, any framework, or vanilla JavaScript.",
    },
    openSource: {
      title: "Open Source",
      description: "Full transparency, full control. Contribute, fork, or customize.",
    },
    cliScaffold: {
      title: "CLI Scaffold",
      description: "Prisma or SQLite storage and the API route, set up in seconds.",
    },

    shadowDom: {
      title: "Shadow DOM Isolated",
      description: "Widget CSS never leaks into your site. Your site CSS never breaks the widget.",
    },
    shadowDomVisual: {
      yourSiteCss: "Your site CSS",
      widgetCss: "Widget CSS",
    },
  },

  fr: {
    sectionTitle: "Pensé autrement",
    sectionSubtitle: "Tout ce qu'il faut, rien de superflu.",
    marqueeCaption: "Compatible avec votre stack",

    selfHosted: {
      title: "Auto-hébergé",
      description:
        "Votre base de données, vos données. Aucune dépendance à un fournisseur, aucun abonnement mensuel. Déployez partout où Node.js tourne.",
    },
    selfHostedVisual: {
      dataStaysOnServer: "Vos données restent sur votre serveur",
    },

    domAnchored: {
      title: "Ancrage DOM",
      description:
        "Les annotations résistent aux changements de mise en page. Ancrage multi-sélecteurs avec repli CSS, XPath, puis texte.",
    },
    domAnchoredVisual: {
      anchoredBadge: "Ancré",
      caption: "CSS + XPath + repli texte",
    },

    annotatedScreenshots: {
      title: "Captures annotées",
      description:
        "Chaque rapport peut inclure une capture de la zone exacte entourée par le client, ainsi que les dernières erreurs console et requêtes échouées — un « ça marche pas » qui arrive enfin avec des preuves.",
    },
    diagnosticsVisual: {
      attachedToFeedback: "Joint automatiquement au retour",
    },

    triageInbox: {
      title: "Boîte de triage",
      descBeforeComponent: "Ajoutez ",
      descBetweenComponentAndKeys: " à votre page d'administration et traitez les rapports avec ",
      descAfterKeys:
        " — quatre statuts, l'annotation du client redessinée directement sur la capture d'écran. Slack, Discord et les webhooks génériques préviennent votre équipe dès qu'un retour arrive.",
      linkText: "Voir la démo de la boîte de triage →",
    },
    triageInboxVisual: {
      header: "Boîte de réception · 2 ouverts",
      moveHint: "pour naviguer",
      items: [
        { text: "L'image du hero est floue sur écran Retina", status: "Ouvert" },
        { text: "Inverser les deux boutons du hero", status: "En cours" },
        { text: "Les liens du footer s'ouvrent dans le même onglet", status: "Résolu" },
      ],
    },

    languages: {
      title: "7 langues intégrées",
      description:
        "Anglais, français, allemand, espagnol, italien, portugais et russe — dans le widget et la boîte de triage.",
    },
    accessibility: {
      title: "Accessibilité clavier d'abord",
      description:
        "Audité selon WCAG 2.1 AA. Les clients peuvent annoter sans souris — Tab pour atteindre l'élément, Entrée pour valider. Prêt pour l'European Accessibility Act.",
    },
    authPrivacy: {
      title: "Authentification & confidentialité",
      description:
        "Définissez une clé API et les routes d'administration exigeront un jeton Bearer. Sans clé, les e-mails des relecteurs sont masqués par défaut en lecture.",
    },
    npmInstall: {
      title: "Installez et c'est parti",
      description:
        "Trois lignes de code suffisent. Compatible avec Next.js, n'importe quel framework, ou du JavaScript pur.",
    },
    openSource: {
      title: "Open source",
      description: "Transparence totale, contrôle total. Contribuez, forkez, ou personnalisez à votre guise.",
    },
    cliScaffold: {
      title: "Génération CLI",
      description: "Stockage Prisma ou SQLite et route API prêts en quelques secondes.",
    },

    shadowDom: {
      title: "Isolation Shadow DOM",
      description: "Le CSS du widget ne déborde jamais sur votre site. Le CSS de votre site ne casse jamais le widget.",
    },
    shadowDomVisual: {
      yourSiteCss: "CSS de votre site",
      widgetCss: "CSS du widget",
    },
  },
};
