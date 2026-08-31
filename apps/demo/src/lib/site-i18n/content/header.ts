import type { SiteLocale } from "../locale";

export interface HeaderContent {
  navLinks: { label: string; href: string }[];
  github: string;
  tryDemo: string;
  openMenu: string;
  closeMenu: string;
}

export const headerContent: Record<SiteLocale, HeaderContent> = {
  ko: {
    navLinks: [
      { label: "기능", href: "#features" },
      { label: "작동 방식", href: "#how-it-works" },
      { label: "요금제", href: "#comparison" },
    ],
    github: "GitHub",
    tryDemo: "데모 체험",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
  },
  en: {
    navLinks: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#comparison" },
    ],
    github: "GitHub",
    tryDemo: "Try Demo",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  fr: {
    navLinks: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Fonctionnement", href: "#how-it-works" },
      { label: "Tarifs", href: "#comparison" },
    ],
    github: "GitHub",
    tryDemo: "Essayer la démo",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
};
