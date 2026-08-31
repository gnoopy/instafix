import type { SiteLocale } from "../locale";

export type FaqId =
  | "databases"
  | "frameworks"
  | "layoutChanges"
  | "dashboard"
  | "bundleSize"
  | "gdpr"
  | "customize"
  | "accessible"
  | "reviewerData"
  | "account";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  heading: string;
  items: Record<FaqId, FaqItem>;
  /** Link appended after the `dashboard` item's answer. */
  dashboardLinkText: string;
}

export const faqContent: Record<SiteLocale, FaqContent> = {
  ko: {
    heading: "자주 묻는 질문",
    items: {
      databases: {
        question: "어떤 데이터베이스를 지원하나요?",
        answer:
          "Prisma가 지원하는 모든 데이터베이스와 호환됩니다 — PostgreSQL, MySQL, SQLite, MongoDB, CockroachDB 등. Drizzle 어댑터도 로드맵에 포함되어 있습니다.",
      },
      frameworks: {
        question: "Next.js 외의 프레임워크에서도 작동하나요?",
        answer:
          "위젯은 프레임워크에 구애받지 않습니다 — React, Vue, Svelte, Astro, 순수 JavaScript 어디서든 동작합니다. CLI는 현재 Next.js API 라우트를 자동 생성하지만, 어댑터 자체는 표준 Request/Response를 처리하는 모든 서버와 호환됩니다.",
      },
      layoutChanges: {
        question: "페이지 레이아웃이 바뀌면 어떻게 되나요?",
        answer:
          "주석은 다중 셀렉터 앵커링 방식을 사용합니다 — CSS 셀렉터, XPath, 텍스트 스니펫, 구조적 지문까지 활용하죠. 하나의 셀렉터가 깨지면 다음 방식으로 자동 전환됩니다. 위치는 앵커 요소 기준 백분율로 저장되므로 반응형 레이아웃에도 그대로 적응합니다.",
      },
      dashboard: {
        question: "피드백을 확인할 대시보드가 있나요?",
        answer:
          "네 — @instafix/dashboard를 설치하고 관리자 페이지에 <InstaFixInbox /> React 컴포넌트를 넣기만 하면 됩니다. j/k 단축키, 네 가지 상태 값, 스크린샷 위에 다시 그려지는 클라이언트 주석까지 갖춘 Linear 스타일의 트리아지 인박스입니다.",
      },
      bundleSize: {
        question: "위젯 번들 크기는 어느 정도인가요?",
        answer:
          "네트워크 전송 기준 gzip 압축 약 49kB입니다. 피드백 패널, 스크린샷 캡처, 영어 외 로케일은 필요할 때 추가로 로드됩니다. 위젯은 비동기로 로드되므로 페이지 렌더링을 절대 막지 않습니다.",
      },
      gdpr: {
        question: "GDPR을 준수하나요?",
        answer:
          "완벽하게 준수합니다. InstaFix는 셀프 호스팅 방식이므로 모든 데이터가 여러분의 인프라에 남습니다. 어떤 데이터도 제3자 서버로 전송되지 않으며, 저장·보관·삭제를 모두 직접 제어할 수 있습니다.",
      },
      customize: {
        question: "위젯의 외관을 커스터마이징할 수 있나요?",
        answer:
          "네 — 강조 색상, 위치(오른쪽 하단 또는 왼쪽 하단), 테마(라이트·다크·자동), 그리고 기본 제공되는 7개 로케일(영어, 프랑스어, 독일어, 스페인어, 이탈리아어, 포르투갈어, 러시아어)에 registerLocale로 나만의 언어까지 추가할 수 있습니다. 데모에서 모든 옵션을 직접 체험해보세요.",
      },
      accessible: {
        question: "접근성을 준수하나요?",
        answer:
          "네 — 위젯과 인박스 모두 WCAG 2.1 AA 기준으로 검수되었습니다. 주석을 그리는 과정을 포함한 전체 흐름을 키보드만으로 조작할 수 있습니다: Tab으로 요소를 선택하고 Enter를 누르면 됩니다. 모든 동작은 스크린 리더에도 안내됩니다.",
      },
      reviewerData: {
        question: "리뷰어의 데이터는 어떻게 처리되나요?",
        answer:
          '피드백은 여러분의 데이터베이스에 저장됩니다 — InstaFix는 셀프 호스팅이니까요. 인증되지 않은 조회에서는 기본적으로 리뷰어 이메일이 가려지며, data-instafix-ignore="true" 속성이 지정된 요소는 스크린샷에서 자동으로 마스킹됩니다.',
      },
      account: {
        question: "계정을 만들어야 하나요?",
        answer:
          "아니요. InstaFix는 설치해서 설정하는 npm 패키지일 뿐입니다. 계정도, API 키도, 가입 절차도 필요 없습니다. 모든 것이 여러분의 인프라 안에서 동작합니다.",
      },
    },
    dashboardLinkText: "데모 인박스에서 직접 확인해보세요",
  },
  en: {
    heading: "Frequently asked questions",
    items: {
      databases: {
        question: "What databases are supported?",
        answer:
          "Any database supported by Prisma — PostgreSQL, MySQL, SQLite, MongoDB, CockroachDB, and more. A Drizzle adapter is on the roadmap.",
      },
      frameworks: {
        question: "Does it work with frameworks other than Next.js?",
        answer:
          "The widget is framework-agnostic — it works with React, Vue, Svelte, Astro, or vanilla JavaScript. The CLI currently scaffolds Next.js API routes, but the adapter works with any server that handles standard Request/Response.",
      },
      layoutChanges: {
        question: "What happens when the page layout changes?",
        answer:
          "Annotations use multi-selector anchoring — CSS selectors, XPath, text snippets, and structural fingerprints. If one selector breaks, the system falls back to the next. Positions are stored as percentages relative to the anchor element, so they adapt to responsive layouts.",
      },
      dashboard: {
        question: "Is there a dashboard to view feedback?",
        answer:
          "Yes — install @instafix/dashboard and drop the <InstaFixInbox /> React component into your admin page. It is a Linear-style triage inbox with j/k keyboard shortcuts, four statuses, and the client's annotation re-drawn on the screenshot.",
      },
      bundleSize: {
        question: "How big is the widget bundle?",
        answer:
          "About 49 kB gzipped on the wire; the feedback panel, screenshot capture, and non-English locales load on demand on top of that. The widget loads asynchronously and never blocks your page rendering.",
      },
      gdpr: {
        question: "Is it GDPR compliant?",
        answer:
          "Fully. Since InstaFix is self-hosted, all data stays on your infrastructure. No data is ever sent to third-party servers. You control storage, retention, and deletion.",
      },
      customize: {
        question: "Can I customize the widget appearance?",
        answer:
          "Yes — accent color, position (bottom-right or bottom-left), theme (light, dark, auto), and 7 built-in locales (English, French, German, Spanish, Italian, Portuguese, Russian) plus registerLocale for your own. Try every option live on the demo.",
      },
      accessible: {
        question: "Is it accessible?",
        answer:
          "Yes — the widget and the inbox are audited against WCAG 2.1 AA. The full flow works from the keyboard, including drawing an annotation: Tab to the element, press Enter. Actions are announced to screen readers.",
      },
      reviewerData: {
        question: "How is reviewers' data handled?",
        answer:
          'Feedback lives in your own database — InstaFix is self-hosted. The API blanks reviewer emails on unauthenticated reads by default, and elements marked data-instafix-ignore="true" are masked out of screenshots.',
      },
      account: {
        question: "Do I need to create an account?",
        answer:
          "No. InstaFix is an npm package you install and configure. No account, no API key, no signup. It runs entirely on your infrastructure.",
      },
    },
    dashboardLinkText: "See it working in the demo inbox",
  },
  fr: {
    heading: "Questions fréquentes",
    items: {
      databases: {
        question: "Quelles bases de données sont prises en charge ?",
        answer:
          "Toutes celles que Prisma prend en charge — PostgreSQL, MySQL, SQLite, MongoDB, CockroachDB, et plus encore. Un adaptateur Drizzle est sur la feuille de route.",
      },
      frameworks: {
        question: "Est-ce compatible avec d'autres frameworks que Next.js ?",
        answer:
          "Le widget est agnostique vis-à-vis du framework — il fonctionne avec React, Vue, Svelte, Astro ou du JavaScript pur. Le CLI génère aujourd'hui des routes API Next.js, mais l'adaptateur fonctionne avec tout serveur gérant les objets Request/Response standard.",
      },
      layoutChanges: {
        question: "Que se passe-t-il si la mise en page du site change ?",
        answer:
          "Les annotations reposent sur un ancrage multi-sélecteurs — sélecteurs CSS, XPath, extraits de texte et empreintes structurelles. Si un sélecteur ne fonctionne plus, le système bascule automatiquement sur le suivant. Les positions sont stockées en pourcentage par rapport à l'élément ancré, elles s'adaptent donc aux mises en page responsives.",
      },
      dashboard: {
        question: "Existe-t-il un tableau de bord pour consulter les retours ?",
        answer:
          "Oui — installez @instafix/dashboard et placez le composant React <InstaFixInbox /> dans votre page d'administration. C'est une boîte de triage façon Linear, avec raccourcis clavier j/k, quatre statuts, et l'annotation du client redessinée directement sur la capture d'écran.",
      },
      bundleSize: {
        question: "Quelle est la taille du widget ?",
        answer:
          "Environ 49 ko gzippés sur le réseau ; le panneau de retours, la capture d'écran et les langues autres que l'anglais se chargent ensuite à la demande. Le widget se charge de manière asynchrone et ne bloque jamais le rendu de votre page.",
      },
      gdpr: {
        question: "Est-ce conforme au RGPD ?",
        answer:
          "Totalement. InstaFix étant auto-hébergé, toutes les données restent sur votre propre infrastructure. Aucune donnée n'est jamais envoyée à un serveur tiers. Vous gardez le contrôle total du stockage, de la conservation et de la suppression.",
      },
      customize: {
        question: "Peut-on personnaliser l'apparence du widget ?",
        answer:
          "Oui — couleur d'accent, position (en bas à droite ou à gauche), thème (clair, sombre, automatique), et 7 langues intégrées (anglais, français, allemand, espagnol, italien, portugais, russe), plus registerLocale pour ajouter la vôtre. Testez toutes les options en direct sur la démo.",
      },
      accessible: {
        question: "Le widget est-il accessible ?",
        answer:
          "Oui — le widget et la boîte de réception sont audités selon les critères WCAG 2.1 AA. Tout le parcours fonctionne au clavier, y compris le dessin d'une annotation : Tab pour sélectionner l'élément, Entrée pour valider. Les actions sont annoncées aux lecteurs d'écran.",
      },
      reviewerData: {
        question: "Comment les données des évaluateurs sont-elles traitées ?",
        answer:
          "Les retours vivent dans votre propre base de données — InstaFix est auto-hébergé. L'API masque par défaut les e-mails des évaluateurs lors des lectures non authentifiées, et les éléments marqués data-instafix-ignore=\"true\" sont masqués sur les captures d'écran.",
      },
      account: {
        question: "Faut-il créer un compte ?",
        answer:
          "Non. InstaFix est un simple package npm à installer et configurer. Pas de compte, pas de clé API, pas d'inscription. Tout fonctionne entièrement sur votre propre infrastructure.",
      },
    },
    dashboardLinkText: "Voir la démo de la boîte de réception",
  },
};
