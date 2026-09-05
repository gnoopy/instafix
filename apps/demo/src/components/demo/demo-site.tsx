import type { ReactNode } from "react";
import type { SiteLocale } from "@/lib/site-i18n/constants";
import { DemoAccordion } from "./demo-accordion";
import { DemoPopovers } from "./demo-popover";
import { DemoTabs } from "./demo-tabs";
import { InstallCommand } from "./install-command";
import { ShareButton } from "./share-button";

/**
 * InstaFixPlayground — the page this widget is demonstrated on. Renamed
 * 2026-09 from the fictional "HorizonStudio" agency: this used to be a fake
 * client site the widget happened to sit on top of, deliberately unrelated
 * to InstaFix itself. That split confused visitors ("is this HorizonStudio's
 * product or InstaFix's?") and wasted the page's own SEO value on generic
 * agency filler. The page is now openly an InstaFix surface — content
 * promotes InstaFix directly, and the "portfolio" section became a real
 * component gallery so there's more variety to draw annotations around.
 *
 * Copy follows the site locale (the `instafix_locale` cookie set by the
 * landing header's language switcher) for section copy — headlines,
 * descriptions, testimonials. Generic UI-atom labels inside the component
 * gallery (button/badge/table text like "Primary", "New", "Status") stay in
 * English across all locales, the same way a component-library kitchen sink
 * page would: they're annotation targets, not product surface.
 */

interface DemoCopy {
  nav: { playground: string; features: string; gallery: string; contact: string; github: string };
  guide: { text: string; share: string; shareCopied: string };
  hero: {
    eyebrow: string;
    titleTop: string;
    titleAccent: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  features: { eyebrow: string; title: string; sub: string; items: { title: string; description: string }[] };
  gallery: { eyebrow: string; title: string; sub: string; shareLabel: string };
  testimonials: { eyebrow: string; title: string; items: { quote: string; name: string; title: string }[] };
  cta: { eyebrow: string; title: string; sub: string; primary: string; secondary: string };
  footer: { tagline: string; rights: string; shareLabel: string; shareCopied: string };
}

const COPY: Record<SiteLocale, DemoCopy> = {
  en: {
    nav: {
      playground: "Playground",
      features: "Features",
      gallery: "Component gallery",
      contact: "Get started",
      github: "GitHub",
    },
    guide: {
      text: "Open the InstaFix panel in the corner, pick “Select area,” and draw a box around anything on this page — you'll get a ready-made prompt for Claude Code, Cursor, or any coding agent.",
      share: "Share this playground",
      shareCopied: "Link copied — send it over",
    },
    hero: {
      eyebrow: "The InstaFix playground",
      titleTop: "Stop describing bugs.",
      titleAccent: "Start pointing at them.",
      sub: "InstaFix turns a click on a running page into an agent-ready prompt — exact DOM selector, a screenshot, and console errors, all in one paste. Framework-agnostic, works on any site, and every component below is fair game to try it on.",
      ctaPrimary: "Try it on the components",
      ctaSecondary: "Star on GitHub",
    },
    features: {
      eyebrow: "Why InstaFix",
      title: "Built for handing off to an agent",
      sub: "Not another screenshot tool — structured context an AI coding agent can act on immediately.",
      items: [
        {
          title: "Click, don't describe",
          description:
            "Draw a box around the broken thing. InstaFix resolves the exact element and its DOM selector for you.",
        },
        {
          title: "Any framework",
          description:
            "Shadow DOM under the hood — React, Vue, Svelte, or plain HTML, InstaFix drops in without a rebuild.",
        },
        {
          title: "Agent-ready output",
          description:
            "Screenshot, console errors, and a structured prompt — paste straight into Claude Code, Cursor, or Windsurf.",
        },
        {
          title: "Private by default",
          description:
            "Ship with a local SQLite or filesystem store — no cloud, no account, feedback never leaves your machine.",
        },
      ],
    },
    gallery: {
      eyebrow: "Component gallery",
      title: "Annotate anything below",
      sub: "Buttons, forms, tables, tabs, pricing — a deliberately varied surface, so you can see how InstaFix handles the components you'll actually be fixing.",
      shareLabel: "Found a component you needed? Share this playground",
    },
    testimonials: {
      eyebrow: "From teams using it",
      title: "What changes once you stop typing bug reports",
      items: [
        {
          quote:
            "We used to burn ten minutes per bug just describing where it was. Now someone draws a box, and Claude Code has the exact selector before we've finished the sentence.",
          name: "Priya Nair",
          title: "Frontend lead, a Series B fintech",
        },
        {
          quote:
            "The fact that it's framework-agnostic mattered more than I expected — half our internal tools are still jQuery, and InstaFix doesn't care.",
          name: "Marcus Webb",
          title: "Platform engineer",
        },
        {
          quote:
            "Local-first was the deciding factor. Client feedback never has to touch a third-party server, and the dashboard still gives us a real triage queue.",
          name: "Elena Voss",
          title: "Agency owner, 6-person dev shop",
        },
      ],
    },
    cta: {
      eyebrow: "Get started",
      title: "Add it to your own project",
      sub: "One install, one line in your layout — InstaFix is annotating your real app in under two minutes.",
      primary: "Read the docs",
      secondary: "View on GitHub",
    },
    footer: {
      tagline: "From web UI to agent-ready prompt.",
      rights: "Open source, MIT licensed.",
      shareLabel: "Know someone still screenshotting bugs into Slack?",
      shareCopied: "Copied — paste it anywhere",
    },
  },
  ko: {
    nav: {
      playground: "플레이그라운드",
      features: "기능",
      gallery: "컴포넌트 갤러리",
      contact: "시작하기",
      github: "GitHub",
    },
    guide: {
      text: "모서리의 InstaFix 패널을 열고 '영역 선택'을 고른 뒤 이 페이지의 아무 요소나 사각형으로 그려보세요 — Claude Code, Cursor 등 코딩 에이전트에 바로 붙여넣을 프롬프트가 만들어집니다.",
      share: "이 플레이그라운드 공유하기",
      shareCopied: "링크가 복사됐어요 — 동료에게 보내보세요",
    },
    hero: {
      eyebrow: "InstaFix 플레이그라운드",
      titleTop: "버그를 설명하지 마세요.",
      titleAccent: "그냥 가리키세요.",
      sub: "InstaFix는 실행 중인 화면에서의 클릭 한 번을 에이전트가 바로 쓸 수 있는 프롬프트로 바꿔줍니다 — 정확한 DOM 셀렉터, 스크린샷, 콘솔 에러까지 한 번에 붙여넣기. 프레임워크에 상관없이 어떤 사이트에도 붙일 수 있고, 아래 컴포넌트 어디에든 시험해봐도 좋습니다.",
      ctaPrimary: "컴포넌트에 직접 시도해보기",
      ctaSecondary: "GitHub에서 Star 하기",
    },
    features: {
      eyebrow: "왜 InstaFix인가",
      title: "에이전트에게 바로 넘길 수 있도록 설계",
      sub: "또 하나의 스크린샷 도구가 아니라, AI 코딩 에이전트가 바로 실행할 수 있는 구조화된 컨텍스트입니다.",
      items: [
        {
          title: "설명 대신 클릭",
          description: "문제가 있는 곳에 사각형만 그리세요. 정확한 요소와 DOM 셀렉터는 InstaFix가 찾아줍니다.",
        },
        {
          title: "프레임워크 무관",
          description: "내부는 Shadow DOM — React, Vue, Svelte, 순수 HTML 어디든 재빌드 없이 붙습니다.",
        },
        {
          title: "에이전트 준비 완료 출력",
          description:
            "스크린샷, 콘솔 에러, 구조화된 프롬프트까지 — Claude Code, Cursor, Windsurf에 그대로 붙여넣으세요.",
        },
        {
          title: "기본값부터 비공개",
          description:
            "로컬 SQLite나 파일 저장소로 동작 — 클라우드도, 계정도 없이 피드백은 내 컴퓨터를 벗어나지 않습니다.",
        },
      ],
    },
    gallery: {
      eyebrow: "컴포넌트 갤러리",
      title: "아래 무엇이든 픽스노트를 남겨보세요",
      sub: "버튼, 폼, 테이블, 탭, 가격표까지 — 실제로 고치게 될 컴포넌트들에서 InstaFix가 어떻게 동작하는지 보여드리기 위해 일부러 다양하게 구성했습니다.",
      shareLabel: "필요했던 컴포넌트를 찾으셨나요? 이 플레이그라운드를 공유해보세요",
    },
    testimonials: {
      eyebrow: "실제로 사용하는 팀들",
      title: "버그 리포트를 타이핑하지 않게 되면 달라지는 것들",
      items: [
        {
          quote:
            "버그 하나 위치 설명하는 데만 10분씩 썼어요. 이제는 사각형 하나 그리면 문장을 다 쓰기도 전에 Claude Code가 정확한 셀렉터를 갖고 있습니다.",
          name: "박지현",
          title: "시리즈 B 핀테크, 프론트엔드 리드",
        },
        {
          quote:
            "프레임워크를 안 가린다는 게 생각보다 훨씬 중요했어요. 사내 도구 절반이 아직 jQuery인데 InstaFix는 상관하지 않더라고요.",
          name: "Marcus Webb",
          title: "플랫폼 엔지니어",
        },
        {
          quote:
            "로컬 우선이라는 점이 결정적이었습니다. 고객 피드백이 외부 서버를 거칠 필요가 없고, 대시보드가 실제 트리아지 큐 역할까지 해줍니다.",
          name: "Elena Voss",
          title: "6인 개발 에이전시 대표",
        },
      ],
    },
    cta: {
      eyebrow: "시작하기",
      title: "내 프로젝트에 붙여보세요",
      sub: "설치 한 번, 레이아웃에 한 줄 — 2분 안에 실제 앱에서 InstaFix로 픽스노트를 남길 수 있습니다.",
      primary: "문서 보기",
      secondary: "GitHub에서 보기",
    },
    footer: {
      tagline: "웹 화면에서 에이전트 프롬프트까지.",
      rights: "오픈소스, MIT 라이선스.",
      shareLabel: "아직 Slack에 버그 스크린샷 올리는 동료가 있나요?",
      shareCopied: "복사됐어요 — 어디든 붙여넣으세요",
    },
  },
  fr: {
    nav: {
      playground: "Bac à sable",
      features: "Fonctionnalités",
      gallery: "Galerie de composants",
      contact: "Commencer",
      github: "GitHub",
    },
    guide: {
      text: "Ouvrez le panneau InstaFix dans le coin, choisissez « Sélectionner une zone », puis dessinez un cadre autour de n'importe quel élément de cette page — vous obtenez aussitôt un prompt prêt pour Claude Code, Cursor ou tout autre agent de code.",
      share: "Partager ce bac à sable",
      shareCopied: "Lien copié — envoyez-le",
    },
    hero: {
      eyebrow: "Le bac à sable InstaFix",
      titleTop: "Arrêtez de décrire les bugs.",
      titleAccent: "Montrez-les du doigt.",
      sub: "InstaFix transforme un clic sur une page en cours d'exécution en prompt prêt pour un agent — sélecteur DOM exact, capture d'écran et erreurs console, le tout en un seul copier-coller. Indépendant du framework, compatible avec n'importe quel site, et chaque composant ci-dessous se prête au jeu.",
      ctaPrimary: "Essayer sur les composants",
      ctaSecondary: "Star sur GitHub",
    },
    features: {
      eyebrow: "Pourquoi InstaFix",
      title: "Pensé pour être transmis à un agent",
      sub: "Pas un énième outil de capture d'écran — un contexte structuré qu'un agent de code IA peut exploiter immédiatement.",
      items: [
        {
          title: "Cliquez, ne décrivez plus",
          description:
            "Dessinez un cadre autour du problème. InstaFix retrouve l'élément exact et son sélecteur DOM pour vous.",
        },
        {
          title: "Indépendant du framework",
          description:
            "Shadow DOM en interne — React, Vue, Svelte ou HTML pur, InstaFix s'intègre sans reconstruction.",
        },
        {
          title: "Sortie prête pour l'agent",
          description:
            "Capture d'écran, erreurs console et prompt structuré — à coller directement dans Claude Code, Cursor ou Windsurf.",
        },
        {
          title: "Privé par défaut",
          description:
            "Fonctionne avec un stockage SQLite ou fichier local — pas de cloud, pas de compte, les retours ne quittent jamais votre machine.",
        },
      ],
    },
    gallery: {
      eyebrow: "Galerie de composants",
      title: "Annotez tout ce qui suit",
      sub: "Boutons, formulaires, tableaux, onglets, tarifs — une surface volontairement variée pour voir comment InstaFix se comporte sur les composants que vous corrigerez vraiment.",
      shareLabel: "Vous avez trouvé le composant qu'il vous fallait ? Partagez ce bac à sable",
    },
    testimonials: {
      eyebrow: "Retours d'équipes",
      title: "Ce qui change quand on arrête de taper des rapports de bug",
      items: [
        {
          quote:
            "On perdait dix minutes par bug rien qu'à décrire où il se trouvait. Maintenant quelqu'un dessine un cadre, et Claude Code a le sélecteur exact avant même la fin de la phrase.",
          name: "Priya Nair",
          title: "Lead frontend, fintech en Série B",
        },
        {
          quote:
            "L'indépendance vis-à-vis du framework a compté plus que prévu — la moitié de nos outils internes tournent encore en jQuery, et InstaFix s'en moque.",
          name: "Marcus Webb",
          title: "Ingénieur plateforme",
        },
        {
          quote:
            "Le local-first a été décisif. Les retours clients ne passent jamais par un serveur tiers, et le tableau de bord fait office de vraie file de triage.",
          name: "Elena Voss",
          title: "Fondatrice d'une agence de 6 personnes",
        },
      ],
    },
    cta: {
      eyebrow: "Commencer",
      title: "Ajoutez-le à votre projet",
      sub: "Une installation, une ligne dans votre layout — InstaFix annote votre vraie application en moins de deux minutes.",
      primary: "Voir la documentation",
      secondary: "Voir sur GitHub",
    },
    footer: {
      tagline: "De l'interface web au prompt prêt pour l'agent.",
      rights: "Open source, licence MIT.",
      shareLabel: "Un collègue capture encore ses bugs en écran pour Slack ?",
      shareCopied: "Copié — collez-le où vous voulez",
    },
  },
};

const GITHUB_URL = "https://github.com/gnoopy/instafix";

const SERVICE_ICONS: ReactNode[] = [
  <svg
    key="click"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243L6.166 4.666"
    />
  </svg>,
  <svg
    key="framework"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
    />
  </svg>,
  <svg
    key="agent"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
    />
  </svg>,
  <svg
    key="private"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>,
];

function GitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component gallery data — deliberately generic UI-atom copy (kept in
// English across locales, see file header) so the section reads as a real
// component kit, not translated placeholder text.
// ---------------------------------------------------------------------------

const PRICING_TIERS = [
  {
    name: "Solo",
    price: "$0",
    period: "forever",
    cta: "Start free",
    features: ["1 project", "Local storage", "Community support"],
    highlighted: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    cta: "Start trial",
    features: ["Unlimited projects", "Shared dashboard", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    cta: "Contact us",
    features: ["SSO", "Audit log", "Dedicated support"],
    highlighted: false,
  },
];

const TABLE_ROWS = [
  { id: "FN-1042", title: "Submit button stays disabled after validation", status: "Open", assignee: "J. Kim" },
  { id: "FN-1041", title: "Avatar image 404s on Safari", status: "In progress", assignee: "A. Ruiz" },
  { id: "FN-1039", title: "Tooltip clipped inside modal", status: "Resolved", assignee: "M. Webb" },
  { id: "FN-1035", title: "Dark mode contrast on badges", status: "Won't fix", assignee: "P. Nair" },
];

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700",
  "In progress": "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  "Won't fix": "bg-gray-100 text-gray-500",
};

export function DemoSite({ locale = "en" }: { locale?: SiteLocale }) {
  const c = COPY[locale] ?? COPY.en;

  const tabsContent = [
    {
      label: "Overview",
      content:
        "InstaFix ships as a single script tag or npm package — no backend rewrite required to start collecting feedback.",
    },
    {
      label: "Selectors",
      content:
        "Every annotation carries a stable CSS selector plus an XPath fallback, so agents can find the exact element even after a re-render.",
    },
    {
      label: "Diagnostics",
      content:
        "Console errors and warnings logged in the seconds before a fix note is submitted are attached automatically.",
    },
  ];

  const faqItems = [
    {
      question: "Does InstaFix require React?",
      answer:
        "No — the widget is vanilla JavaScript behind a Shadow DOM boundary, so it works on any framework or none at all.",
    },
    {
      question: "Where does feedback get stored?",
      answer:
        "Wherever you point it: a local SQLite file, a filesystem folder, or your own store via the adapter-kit contract. Nothing goes through InstaFix's own servers.",
    },
    {
      question: "Can an AI agent pick up feedback automatically?",
      answer:
        "Yes — the CLI's agent-loop commands (prompt / resolve / watch) let a running Claude Code session pull queued feedback without a human pasting anything.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            InstaFix<span className="text-accent">Playground</span>
          </span>
          <ul className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <li>
              <a href="#gallery" className="transition-colors hover:text-gray-900">
                {c.nav.gallery}
              </a>
            </li>
            <li>
              <a href="#features" className="transition-colors hover:text-gray-900">
                {c.nav.features}
              </a>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-gray-900"
              >
                <GitHubIcon className="h-4 w-4" />
                {c.nav.github}
              </a>
            </li>
            <li>
              <a
                href="#cta"
                className="rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-dark"
              >
                {c.nav.contact}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Guide banner ────────────────────────────────────────── */}
      <div className="border-b border-accent/20 bg-accent/5 px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            <span aria-hidden="true">🎯</span> {c.guide.text}
          </p>
          <ShareButton
            label={c.guide.share}
            copiedLabel={c.guide.shareCopied}
            variant="outline"
            className="shrink-0 !px-4 !py-1.5 text-xs"
          />
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 px-6 py-28 sm:py-36">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #173CFF 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">{c.hero.eyebrow}</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {c.hero.titleTop}
            <br />
            <span className="text-accent">{c.hero.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">{c.hero.sub}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#gallery"
              className="rounded-lg bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              {c.hero.ctaPrimary}
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              <GitHubIcon className="h-5 w-5" />
              {c.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">{c.features.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{c.features.title}</h2>
            <p className="mt-4 text-lg text-gray-600">{c.features.sub}</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {c.features.items.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-200 p-8 transition-all hover:border-accent/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  {SERVICE_ICONS[i]}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Component gallery ──────────────────────────────────── */}
      <section id="gallery" className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">{c.gallery.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{c.gallery.title}</h2>
            <p className="mt-4 text-lg text-gray-600">{c.gallery.sub}</p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {/* Buttons */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Buttons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
                >
                  Primary
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
                >
                  Secondary
                </button>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10"
                >
                  Ghost
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Destructive
                </button>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* Badges & alerts */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Badges &amp; alerts</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">New</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Stable
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Beta</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">v0.10</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  ✓ Fix note submitted successfully.
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  ⚠ 3 console errors captured with this note.
                </div>
              </div>
            </div>

            {/* Form controls */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Form controls</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Project name"
                  readOnly
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      defaultChecked
                      readOnly
                      className="h-4 w-4 rounded border-gray-300 text-accent"
                    />
                    Screenshots
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="demo-radio"
                      defaultChecked
                      readOnly
                      className="h-4 w-4 border-gray-300 text-accent"
                    />
                    SQLite
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="demo-radio" readOnly className="h-4 w-4 border-gray-300 text-accent" />
                    Filesystem
                  </label>
                </div>
                <input type="range" defaultValue={60} readOnly className="w-full accent-accent" />
              </div>
            </div>

            {/* Dismiss-on-outside popovers — the annotate-a-transient-menu case */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">Dismissable popovers</h3>
              <p className="mb-4 text-xs text-gray-500">
                Open one, then annotate it — these close on outside interaction, the way real menus do.
              </p>
              <DemoPopovers />
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                  <p className="text-xs text-gray-500">Packages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-xs text-gray-500">Locales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">MIT</p>
                  <p className="text-xs text-gray-500">License</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-4/5 rounded-full bg-accent" />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-2/5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Tabs</h3>
              <DemoTabs tabs={tabsContent} />
            </div>

            {/* Avatars, rating, pagination */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Avatars, rating &amp; pagination
              </h3>
              <div className="mb-4 flex items-center -space-x-2">
                {["JK", "AR", "MW", "PN"].map((initials) => (
                  <div
                    key={initials}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent/10 text-xs font-bold text-accent"
                  >
                    {initials}
                  </div>
                ))}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                  +12
                </div>
              </div>
              <div role="img" aria-label="4.5 out of 5 stars" className="mb-4 flex items-center gap-1 text-amber-400">
                {"★★★★".split("").map((star, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative glyphs, order never changes
                  <span key={i}>{star}</span>
                ))}
                <span className="text-gray-300">★</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <button type="button" className="rounded px-2 py-1 text-gray-400 hover:bg-gray-50" disabled>
                  ‹
                </button>
                <button type="button" className="rounded bg-accent px-2.5 py-1 text-white">
                  1
                </button>
                <button type="button" className="rounded px-2.5 py-1 text-gray-600 hover:bg-gray-50">
                  2
                </button>
                <button type="button" className="rounded px-2.5 py-1 text-gray-600 hover:bg-gray-50">
                  3
                </button>
                <button type="button" className="rounded px-2 py-1 text-gray-600 hover:bg-gray-50">
                  ›
                </button>
              </div>
            </div>

            {/* Table — spans full width */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Feedback table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                      <th className="py-2 pr-4 font-medium">ID</th>
                      <th className="py-2 pr-4 font-medium">Title</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 font-medium">Assignee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_ROWS.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{row.id}</td>
                        <td className="py-3 pr-4 text-gray-800">{row.title}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{row.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ accordion */}
            <div className="lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">FAQ accordion</h3>
              <DemoAccordion items={faqItems} />
            </div>

            {/* Pricing — a generic UI pattern, not InstaFix's own pricing (InstaFix is
                free and open source, see the "Get started" section below), so it's
                labeled explicitly to avoid reading as a real claim about InstaFix's cost. */}
            <div className="lg:col-span-2">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">Pricing cards</h3>
              <p className="mb-4 text-xs italic text-gray-400">
                Example UI pattern — InstaFix itself is free and open source.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={`rounded-xl border p-6 ${
                      tier.highlighted ? "border-accent bg-accent/5 shadow-md" : "border-gray-200 bg-white"
                    }`}
                  >
                    {tier.highlighted && (
                      <span className="mb-3 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                        Popular
                      </span>
                    )}
                    <h4 className="text-base font-semibold text-gray-900">{tier.name}</h4>
                    <p className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-sm text-gray-500"> {tier.period}</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="text-accent">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                        tier.highlighted
                          ? "bg-accent text-white hover:bg-accent-dark"
                          : "border border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <ShareButton label={c.gallery.shareLabel} copiedLabel={c.guide.shareCopied} variant="outline" />
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">{c.testimonials.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{c.testimonials.title}</h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {c.testimonials.items.map((testimonial) => (
              <blockquote key={testimonial.name} className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <svg className="mb-4 h-8 w-8 text-accent/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.68 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.252 0-2.41-.61-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.68 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.252 0-2.41-.61-2.917-1.179z" />
                </svg>
                <p className="text-gray-700 leading-relaxed">{testimonial.quote}</p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get started ─────────────────────────────────────────── */}
      <section id="cta" className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">{c.cta.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{c.cta.title}</h2>
          <p className="mt-4 text-lg text-gray-600">{c.cta.sub}</p>
          <div className="mt-8 flex justify-center">
            <InstallCommand command="npm install @instafix/widget" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/docs"
              className="rounded-lg bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              {c.cta.primary}
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              <GitHubIcon className="h-5 w-5" />
              {c.cta.secondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                InstaFix<span className="text-accent">Playground</span>
              </span>
              <p className="mt-1 text-sm text-gray-500">{c.footer.tagline}</p>
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} InstaFix. {c.footer.rights}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://www.npmjs.com/package/@instafix/widget"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="npm"
              >
                <span className="sr-only">npm</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-1.336v.999H10.666zm11.999 0h-1.335v-4h-1.333v4h-1.335v-4h-1.333v4h-2.667V8.667h8.003v5.331z" />
                </svg>
              </a>
              <a href="/docs" className="text-gray-400 transition-colors hover:text-gray-600" aria-label="Docs">
                <span className="sr-only">Docs</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex justify-center border-t border-gray-100 pt-8">
            <ShareButton label={c.footer.shareLabel} copiedLabel={c.footer.shareCopied} variant="outline" />
          </div>
        </div>
      </footer>
    </div>
  );
}
