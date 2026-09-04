"use client";

import type { InstaFixInstance } from "@instafix/widget";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/landing/copy-button";
import type { SiteLocale } from "@/lib/site-i18n/constants";
import { playgroundContent } from "@/lib/site-i18n/content/playground";
import { DiagnosticsTriggers } from "./diagnostics-triggers";

// ---------------------------------------------------------------------------
// State model — the URL query is the single source of truth. The visible
// controls that used to write it are gone (everything they duplicated lives
// in the widget's own settings section now), but the params stay honored so
// shared links like /demo?theme=dark keep working, and the widget itself is
// the demo of those settings. Local mode left the demo entirely — it's a
// zero-server reference path, documented at the end of the quickstart.
// ---------------------------------------------------------------------------

const LOCALE_CODES = ["ko", "en", "fr", "de", "es", "it", "pt", "ru"] as const;

type LocaleCode = (typeof LOCALE_CODES)[number];

interface PlaygroundState {
  theme: "light" | "dark" | "auto";
  locale: LocaleCode;
  position: "bottom-right" | "bottom-left";
  accent: string;
  screenshot: boolean;
  diagnostics: boolean;
  identity: boolean;
}

const DEFAULTS: PlaygroundState = {
  theme: "light",
  locale: "ko",
  position: "bottom-right",
  accent: "#173CFF",
  screenshot: true,
  diagnostics: true,
  identity: true,
};

/** Hex forms the widget accepts: #RGB, #RRGGBB, #RRGGBBAA (stored without the #). */
const HEX_RE = /^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** The widget's own default accent — options matching widget defaults drop out of the snippet. */
const WIDGET_DEFAULT_ACCENT = "#0066ff";

const DEMO_IDENTITY = { name: "Alex Client", email: "alex@client.example" };

interface ParamsLike {
  get(name: string): string | null;
}

function parseState(params: ParamsLike): PlaygroundState {
  const theme = params.get("theme");
  const locale = params.get("locale");
  const accent = params.get("accent");
  return {
    theme: theme === "dark" || theme === "auto" ? theme : "light",
    locale: LOCALE_CODES.includes(locale as LocaleCode) ? (locale as LocaleCode) : DEFAULTS.locale,
    position: params.get("position") === "bottom-left" ? "bottom-left" : "bottom-right",
    accent: accent && HEX_RE.test(accent) ? `#${accent}` : DEFAULTS.accent,
    screenshot: params.get("screenshot") !== "off",
    diagnostics: params.get("diagnostics") !== "off",
    identity: params.get("identity") !== "off",
  };
}

// ---------------------------------------------------------------------------
// Live config snippet — the playground doubles as living documentation
// ---------------------------------------------------------------------------

interface Token {
  key: string;
  text: string;
  cls: string;
}

interface SnippetLine {
  key: string;
  tokens: readonly Token[];
}

const KEYWORD = "text-purple-400";
const IDENT = "text-yellow-300";
const PROP = "text-blue-300";
const STR = "text-green-400";
const PUNCT = "text-gray-500";

interface RawToken {
  text: string;
  cls: string;
}

const str = (s: string): RawToken => ({ text: `'${s}'`, cls: STR });
const on = (): RawToken => ({ text: "true", cls: KEYWORD });
const punct = (text: string): RawToken => ({ text, cls: PUNCT });

function importLine(name: string, pkg: string): RawToken[] {
  return [
    { text: "import", cls: KEYWORD },
    punct(" { "),
    { text: name, cls: IDENT },
    punct(" } "),
    { text: "from", cls: KEYWORD },
    { text: ` '${pkg}'`, cls: STR },
  ];
}

/**
 * Option lines beyond endpoint/projectName appear only when they differ from
 * the widget's own defaults — exactly the call a real integration would ship.
 * The demo-only `forceShow` is deliberately left out; `deepLink: true` stays
 * because it pairs with the inbox's "Open on page" links.
 */
function buildOptionLines(state: PlaygroundState): { key: string; tokens: RawToken[] }[] {
  const lines: { key: string; tokens: RawToken[] }[] = [];
  lines.push({ key: "endpoint", tokens: [str("/api/instafix")] });
  lines.push({ key: "projectName", tokens: [str("demo")] });
  if (state.theme !== "light") lines.push({ key: "theme", tokens: [str(state.theme)] });
  if (state.locale !== DEFAULTS.locale) lines.push({ key: "locale", tokens: [str(state.locale)] });
  if (state.position !== "bottom-right") lines.push({ key: "position", tokens: [str(state.position)] });
  if (state.accent.toLowerCase() !== WIDGET_DEFAULT_ACCENT) {
    lines.push({ key: "accentColor", tokens: [str(state.accent)] });
  }
  if (state.screenshot) lines.push({ key: "enableScreenshot", tokens: [on()] });
  if (state.diagnostics) lines.push({ key: "captureDiagnostics", tokens: [on()] });
  if (state.identity) {
    lines.push({
      key: "identity",
      tokens: [
        punct("{ "),
        { text: "name", cls: PROP },
        punct(": "),
        str(DEMO_IDENTITY.name),
        punct(", "),
        { text: "email", cls: PROP },
        punct(": "),
        str(DEMO_IDENTITY.email),
        punct(" }"),
      ],
    });
  }
  lines.push({ key: "deepLink", tokens: [on()] });
  return lines;
}

function buildSnippet(state: PlaygroundState): { lines: SnippetLine[]; text: string } {
  const raw: { key: string; tokens: RawToken[] }[] = [];
  raw.push({ key: "import-widget", tokens: importLine("initInstaFix", "@instafix/widget") });
  raw.push({ key: "blank", tokens: [] });
  raw.push({
    key: "open",
    tokens: [{ text: "initInstaFix", cls: IDENT }, punct("({")],
  });
  for (const option of buildOptionLines(state)) {
    raw.push({
      key: `opt-${option.key}`,
      tokens: [punct("  "), { text: option.key, cls: PROP }, punct(": "), ...option.tokens, punct(",")],
    });
  }
  raw.push({ key: "close", tokens: [punct("})")] });

  const lines: SnippetLine[] = [];
  for (const line of raw) {
    const tokens: Token[] = [];
    let position = 0;
    for (const token of line.tokens) {
      position += 1;
      tokens.push({ key: `${line.key}.${position}`, ...token });
    }
    lines.push({ key: line.key, tokens });
  }
  const text = lines.map((line) => line.tokens.map((token) => token.text).join("")).join("\n");
  return { lines, text };
}

// ---------------------------------------------------------------------------
// Playground panel — deliberately small: only what the widget can't demo
// itself (fake diagnostics events + the live config snippet). Collapsed by
// default so the demo site and the widget get the visitor's full attention.
// ---------------------------------------------------------------------------

const PANEL_ID = "instafix-playground";

export function Playground({ siteLocale }: { siteLocale: SiteLocale }) {
  const t = playgroundContent[siteLocale];
  const params = useSearchParams();
  const state = useMemo(() => parseState(params), [params]);
  const { theme, locale, position, accent, screenshot, diagnostics, identity } = state;

  const [open, setOpen] = useState(false);
  const tabRef = useRef<HTMLButtonElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const toggledRef = useRef(false);
  // Deep links (?instafix=<id>) focus their annotation on the FIRST init only —
  // playground rebuilds must not re-scroll the visitor back to it on every toggle.
  const firstInitRef = useRef(true);

  // Keep keyboard focus on the visible toggle after expanding/collapsing.
  useEffect(() => {
    if (!toggledRef.current) return;
    toggledRef.current = false;
    (open ? collapseRef : tabRef).current?.focus();
  }, [open]);

  // Any config change tears the widget down and rebuilds it — the singleton
  // guard requires destroy() before re-init.
  useEffect(() => {
    let cancelled = false;
    let instance: InstaFixInstance | null = null;

    (async () => {
      const { initInstaFix } = await import("@instafix/widget");
      if (cancelled) return;
      instance = initInstaFix({
        projectName: "demo",
        forceShow: true,
        // "Open on page" links from the inbox (?instafix=<id>) focus the annotation.
        deepLink: firstInitRef.current,
        theme,
        locale,
        position,
        accentColor: accent,
        enableScreenshot: screenshot,
        captureDiagnostics: diagnostics,
        ...(identity ? { identity: DEMO_IDENTITY } : {}),
        endpoint: "/api/instafix",
        // The panel's own "Open dashboard" button — same page the "Open the
        // inbox" link in the demo banner and /demo/inbox itself point at.
        // Relative URL: window.open() resolves it against the current
        // origin, no need to know the deployed domain.
        dashboardUrl: "/demo/inbox",
      });
      firstInitRef.current = false;
    })();

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [theme, locale, position, accent, screenshot, diagnostics, identity]);

  function toggleOpen(next: boolean) {
    toggledRef.current = true;
    setOpen(next);
  }

  const snippet = buildSnippet(state);

  return (
    // data-instafix-ignore keeps the panel out of widget screenshots.
    <aside
      data-instafix-ignore="true"
      aria-label={t.panelAriaLabel}
      className="fixed left-0 top-28 z-40 flex max-h-[calc(100vh-8.5rem)]"
    >
      {open ? (
        <div
          id={PANEL_ID}
          className="flex w-72 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-r-xl border border-l-0 border-gray-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 py-2 pl-4 pr-2">
            <h2 className="text-sm font-bold tracking-tight text-gray-900">{t.panelTitle}</h2>
            <button
              ref={collapseRef}
              type="button"
              onClick={() => toggleOpen(false)}
              aria-expanded="true"
              aria-controls={PANEL_ID}
              aria-label={t.collapseAriaLabel}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <p className="text-xs leading-snug text-gray-500">{t.modeServerCaption}</p>

            <p className="text-xs leading-snug text-gray-500">{t.settingsHint}</p>

            {diagnostics ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                <p className="mb-2 text-xs leading-snug text-gray-500">{t.diagnosticsCaption}</p>
                <DiagnosticsTriggers />
              </div>
            ) : null}

            <section aria-label={t.codeSectionAriaLabel}>
              <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
                <div className="flex items-center justify-between border-b border-gray-800 pl-3">
                  <span className="font-mono text-xs text-gray-500">{t.codeHeaderLabel}</span>
                  <CopyButton text={snippet.text} />
                </div>
                <pre className="overflow-x-auto px-3 py-3 font-mono text-xs leading-relaxed">
                  <code>
                    {snippet.lines.map((line) => (
                      <Fragment key={line.key}>
                        {line.tokens.map((token) => (
                          <span key={token.key} className={token.cls}>
                            {token.text}
                          </span>
                        ))}
                        {"\n"}
                      </Fragment>
                    ))}
                  </code>
                </pre>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <button
          ref={tabRef}
          type="button"
          onClick={() => toggleOpen(true)}
          aria-expanded="false"
          className="rounded-r-lg border border-l-0 border-gray-200 bg-white px-1.5 py-4 text-xs font-semibold tracking-wide text-gray-700 shadow-lg transition-colors [writing-mode:vertical-rl] hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none"
        >
          {t.collapsedTabLabel}
        </button>
      )}
    </aside>
  );
}
