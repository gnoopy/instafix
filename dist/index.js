import {a}from'./chunk-7FTXKGNX.js';import {createContext,useMemo,useRef,useState,useEffect,useCallback,useInsertionEffect,useId,Fragment as Fragment$1,useContext}from'react';import {jsx,jsxs,Fragment}from'react/jsx-runtime';var yt=["en","ko","fr","de","es","it","pt","ru"],nt=["question","change","bug","other"],te=["open","in_progress","resolved","wont_fix"],Yt=["resolved","wont_fix"];function He(e){return Yt.includes(e)}function wt(e,t=new Date,n,a){return He(e)?{status:e,resolvedAt:t,message:n,annotations:a}:{status:e,resolvedAt:null,message:n,annotations:a}}var Fe=class extends Error{code;retryable;constructor(t,n,a){super(t),this.code=n,this.retryable=a,this.name="InstaFixError";}},$e=class extends Fe{constructor(t){super(t,"NETWORK",true),this.name="InstaFixNetworkError";}},rt=class extends Fe{constructor(t){super(t,"VALIDATION",false),this.name="InstaFixValidationError";}},ot=class extends Fe{constructor(t){super(t,"AUTH",false),this.name="InstaFixAuthError";}};function kt(e){return (e.split("-")[0]??e).toLowerCase()}function St(e,t){let n={en:e};function a(s){return s!=="en"&&yt.includes(s)}return {registerLocale(s,c){n[kt(s)]=c;},async loadLocale(s){let c=kt(s),o=n[c];if(o)return o;if(!a(c))return null;let p=await t[c]();return n[c]=p,p},createT(s){let c=kt(s);return c!=="en"&&!n[c]&&!a(c)&&console.warn(`[instafix] Unknown locale "${s}", falling back to "en"`),o=>n[c]?.[o]??e[o]??o}}}function Et(e,t){return e.replace(/\{(\w+)\}/g,(n,a)=>{let s=t[a];return s===void 0?n:String(s)})}function It(e,t,n){return Et(e(t),n)}function Ft(e){let t=new URLSearchParams({projectName:e.projectName});return e.page&&t.set("page",String(e.page)),e.limit&&t.set("limit",String(e.limit)),e.type&&t.set("type",e.type),e.status&&t.set("status",e.status),e.statuses?.length&&t.set("statuses",e.statuses.join(",")),e.search&&t.set("search",e.search),e.url&&t.set("url",e.url),e.urlPattern&&t.set("urlPattern",e.urlPattern),t}async function Tt(e,t){let n=await e.text().catch(()=>"Unknown error"),a=n?`${e.status} ${n}`:`${e.status}`,s=`${t}: ${a}`;return e.status===401||e.status===403?new ot(s):e.status>=400&&e.status<500?new rt(s):new Fe(s,"SERVER",false)}function Rt(e,t){if(e instanceof $e)return e;let n=e instanceof Error?e.message:String(e);return new $e(`${t}: ${n}`)}var Qt={"inbox.regionLabel":"Feedback inbox","inbox.listLabel":"Feedback list","inbox.statusFilter":"Filter by status","inbox.searchPlaceholder":"Search messages\u2026","inbox.searchAria":"Search feedbacks","inbox.clearSearch":"Clear search","inbox.resultsCount":"{count} feedbacks","inbox.typeFilter":"Filter by type","inbox.typeAll":"All types","inbox.project":"Project","inbox.refresh":"Refresh","inbox.loadMore":"Load more ({count})","inbox.emptyTitle":"No feedback yet","inbox.emptySub":"Feedback sent from the widget lands here.","inbox.emptyFilteredTitle":"Nothing here","inbox.emptyFilteredSub":"No feedback matches this filter.","inbox.viewAll":"View all","inbox.inboxZeroTitle":"All clear","inbox.inboxZeroSub":"Every open feedback has been handled.","inbox.loadError":"Failed to load feedbacks","inbox.retry":"Retry","inbox.cancel":"Cancel","inbox.undo":"Undo","inbox.actionFailed":"Something went wrong. Change reverted.","inbox.copied":"Copied","inbox.markedAs":"Marked as {status}","inbox.deleted":"Feedback deleted","status.all":"All","status.open":"Open","status.in_progress":"In progress","status.resolved":"Resolved","status.wont_fix":"Won't fix","type.question":"Question","type.change":"Change","type.bug":"Bug","type.other":"Other","drawer.title":"Feedback details","drawer.close":"Close details","drawer.openOnPage":"Open on page","drawer.status":"Status","drawer.author":"Author","drawer.page":"Page","drawer.viewport":"Viewport","drawer.submitted":"Submitted","drawer.browser":"Browser","drawer.anchor":"Anchor","drawer.diagnostics":"Diagnostics","drawer.showAllDiagnostics":"Show all ({count})","drawer.hideAnnotation":"Hide annotation","drawer.showAnnotation":"Show annotation","drawer.screenshotAlt":"Screenshot of the annotated area","drawer.zoomScreenshot":"Zoom screenshot","drawer.noScreenshot":"No screenshot for this feedback","drawer.delete":"Delete feedback","drawer.deleteConfirm":"Delete permanently? This cannot be undone.","drawer.deleteYes":"Delete","hints.navigate":"navigate","hints.open":"open","hints.resolve":"resolve","hints.inProgress":"in progress","hints.wontFix":"won't fix","hints.help":"shortcuts","shortcuts.title":"Keyboard shortcuts","shortcuts.close":"Close","time.now":"now","time.minutes":"{n} min","time.hours":"{n} h","time.days":"{n} d","time.weeks":"{n} w","time.month":"{n} mo","time.months":"{n} mo","time.year":"{n} y","time.years":"{n} y"};var it=St(Qt,{de:()=>import('./de-2ZMR7EUK.js').then(e=>e.de),es:()=>import('./es-V4MA22JH.js').then(e=>e.es),fr:()=>import('./fr-64VJYPE5.js').then(e=>e.fr),it:()=>import('./it-DGRJRWTM.js').then(e=>e.it),ko:()=>import('./ko-UT5T4BSX.js').then(e=>e.ko),pt:()=>import('./pt-KXYFIR2H.js').then(e=>e.pt),ru:()=>import('./ru-ERVA3KHQ.js').then(e=>e.ru)});it.registerLocale("ko",a);var hr=it.registerLocale,Xt=it.loadLocale,Zt=it.createT,Y=It;function Te(e,t){switch(e){case "question":return t("type.question");case "change":return t("type.change");case "bug":return t("type.bug");case "other":return t("type.other");default:return e}}function ue(e,t){switch(e){case "all":return t("status.all");case "open":return t("status.open");case "in_progress":return t("status.in_progress");case "resolved":return t("status.resolved");case "wont_fix":return t("status.wont_fix");default:return e}}var Pt=60,Nt=60*Pt,We=24*Nt,Jt=7*We,en=30*We,tn=365*We;function at(e,t){let n=Math.floor((Date.now()-e.getTime())/1e3);if(n<Pt)return t("time.now");if(n<Nt)return Y(t,"time.minutes",{n:Math.floor(n/Pt)});if(n<We)return Y(t,"time.hours",{n:Math.floor(n/Nt)});if(n<Jt)return Y(t,"time.days",{n:Math.floor(n/We)});if(n<en)return Y(t,"time.weeks",{n:Math.floor(n/Jt)});if(n<tn){let s=Math.floor(n/en);return Y(t,s===1?"time.month":"time.months",{n:s})}let a=Math.floor(n/tn);return Y(t,a===1?"time.year":"time.years",{n:a})}function st(e,t){try{return new Intl.DateTimeFormat(t,{dateStyle:"medium",timeStyle:"short"}).format(e)}catch{return new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(e)}}function dt(e){try{let t=new URL(e,"http://x");return `${t.pathname}${t.hash}`}catch{return e}}function vr(){return typeof window<"u"?window.location.href:"http://localhost"}function nn(e){try{let t=new URL(e,vr());return t.protocol==="http:"||t.protocol==="https:"?t:null}catch{return null}}function rn(e){return nn(e)?.toString()??null}function ct(e,t){let n=nn(e.url);return n?(n.searchParams.set(t,e.id),n.toString()):null}function Ct(e){return e.slice(0,8)}var on=`
/* ---------------------------------------------------------------- tokens */
.ifd-root {
  --ifd-accent: #0066ff; /* overridden inline via style="--ifd-accent: ..." */
  --ifd-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --ifd-mono: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --ifd-fs-body: 13px;
  --ifd-radius: 10px;
  --ifd-radius-sm: 6px;
  --ifd-radius-xs: 4px;
  --ifd-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ifd-row-h: 44px;

  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  height: 100%;
  container-type: inline-size;
  container-name: spd;
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius);
  background: var(--ifd-bg);
  color: var(--ifd-text);
  font-family: var(--ifd-font);
  font-size: var(--ifd-fs-body);
  font-weight: 400;
  line-height: 1.45;
  text-align: left;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.ifd-root[data-theme="dark"] {
  color-scheme: dark;
  --ifd-bg: #0b1120;
  --ifd-surface: #0f172a;
  --ifd-raised: #1e293b;
  --ifd-border: #1e293b;
  --ifd-border-strong: #334155;
  --ifd-text: #f1f5f9;
  --ifd-text-2: #a5b3c7;
  --ifd-text-3: #8a99b0; /* >=4.5:1 on every dark surface incl. raised */
  --ifd-accent-bright: color-mix(in srgb, var(--ifd-accent) 65%, #ffffff);
  --ifd-st-open: var(--ifd-accent-bright);
  --ifd-st-progress: #fbbf24;
  --ifd-st-resolved: #34d399;
  --ifd-st-wontfix: #94a3b8;
  --ifd-ty-question: #60a5fa;
  --ifd-ty-change: #fbbf24;
  --ifd-ty-bug: #f87171;
  --ifd-ty-other: #94a3b8;
  --ifd-danger: #f87171;
  --ifd-danger-strong: #ef4444;
  --ifd-dim: rgb(2 6 23 / 0.42);
}

.ifd-root[data-theme="light"] {
  color-scheme: light;
  --ifd-bg: #f8fafc;
  --ifd-surface: #ffffff;
  --ifd-raised: #f1f5f9;
  --ifd-border: #e2e8f0;
  --ifd-border-strong: #cbd5e1;
  --ifd-text: #0f172a;
  --ifd-text-2: #475569;
  --ifd-text-3: #56657b; /* >=4.5:1 on white AND raised #f1f5f9 */
  --ifd-accent-bright: var(--ifd-accent);
  --ifd-st-open: var(--ifd-accent);
  --ifd-st-progress: #b45309;
  --ifd-st-resolved: #047857;
  --ifd-st-wontfix: #64748b;
  --ifd-ty-question: #3b82f6;
  --ifd-ty-change: #b45309;
  --ifd-ty-bug: #ef4444;
  --ifd-ty-other: #64748b;
  --ifd-danger: #dc2626;
  --ifd-danger-strong: #b91c1c;
  --ifd-dim: rgb(2 6 23 / 0.42);
}

.ifd-root[data-density="comfortable"] { --ifd-row-h: 44px; }
.ifd-root[data-density="compact"] { --ifd-row-h: 36px; }

/* ----------------------------------------------------------------- reset */
.ifd-root *,
.ifd-root *::before,
.ifd-root *::after { box-sizing: border-box; }

.ifd-root :is(h1, h2, h3, h4, p, ul, ol, figure, blockquote) { margin: 0; padding: 0; }
.ifd-root :is(ul, ol) { list-style: none; }
.ifd-root :where(a) { color: inherit; text-decoration: none; }
.ifd-root svg { display: block; flex: none; }

/* :where() keeps this reset at zero specificity so every component rule
   below wins by source order \u2014 :is(button) would weigh 0-1-1 and silently
   defeat single-class rules like .ifd-tab. */
.ifd-root :where(button, input, select) {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
}
.ifd-root :where(button) { cursor: pointer; }
.ifd-root :where(button):disabled { opacity: 0.55; cursor: default; }
.ifd-root :where(button):not(:disabled):active { transform: translateY(0.5px); }
.ifd-root :where(h2, h3, p, dl, dt, dd, ul, li, figure) { margin: 0; padding: 0; font: inherit; list-style: none; }

/* visually hidden, exposed to assistive tech */
.ifd-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.ifd-root :focus-visible {
  outline: 2px solid var(--ifd-accent-bright);
  outline-offset: 2px;
}

.ifd-root :is(.ifd-list-pane, .ifd-drawer-scroll, .ifd-shortcuts-card, .ifd-evidence-stage) {
  scrollbar-width: thin;
  scrollbar-color: var(--ifd-border-strong) transparent;
}

/* --------------------------------------------------------------- toolbar */
.ifd-toolbar {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 8px 10px;
  background: var(--ifd-surface);
  border-bottom: 1px solid var(--ifd-border);
}

.ifd-project,
.ifd-type-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: none;
}

.ifd-root :is(.ifd-project-select, .ifd-type-filter select, select.ifd-type-filter) {
  appearance: none;
  height: 28px;
  padding: 0 22px 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text);
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  background: transparent;
  cursor: pointer;
  max-width: 160px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifd-root :is(.ifd-project-select, .ifd-type-filter select, select.ifd-type-filter):hover {
  background: var(--ifd-raised);
  border-color: var(--ifd-border-strong);
}
.ifd-root :is(.ifd-project, .ifd-type-filter) > svg {
  position: absolute;
  right: 6px;
  width: 12px;
  height: 12px;
  color: var(--ifd-text-3);
  pointer-events: none;
}

/* tabs */
/* Segmented control: inset track one step below the toolbar surface, the
   active tab lifted back up as a bordered pill \u2014 each tab owns a clear zone
   so a count never visually attaches to the next tab's glyph. */
/* Each tab is a standalone bordered chip with real air between them; the
   active one is tinted with the accent so the current filter is unmissable. */
.ifd-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.ifd-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text-2);
  background: color-mix(in srgb, var(--ifd-raised) 55%, transparent);
  box-shadow: inset 0 0 0 1px var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
}
.ifd-tab:hover {
  color: var(--ifd-text);
  background: color-mix(in srgb, var(--ifd-raised) 90%, transparent);
  box-shadow: inset 0 0 0 1px var(--ifd-border-strong);
}
.ifd-tab[aria-checked="true"] {
  color: var(--ifd-text);
  background: color-mix(in srgb, var(--ifd-accent) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ifd-accent) 42%, transparent);
}
.ifd-tab-glyph { display: inline-flex; }
.ifd-tab-glyph svg { width: 13px; height: 13px; }
.ifd-tab-count {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ifd-text-3) 16%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-2);
}
/* count chips take their status hue \u2014 each label reads as its own object */
.ifd-tab[data-status="open"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-open) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-open) 75%, var(--ifd-text));
}
.ifd-tab[data-status="in_progress"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-progress) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-progress) 75%, var(--ifd-text));
}
.ifd-tab[data-status="resolved"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-resolved) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-resolved) 75%, var(--ifd-text));
}
.ifd-tab[data-status="wont_fix"] .ifd-tab-count {
  background: color-mix(in srgb, var(--ifd-st-wontfix) 20%, transparent);
  color: color-mix(in srgb, var(--ifd-st-wontfix) 75%, var(--ifd-text));
}
.ifd-tab[aria-checked="true"] .ifd-tab-count { font-weight: 600; }

.ifd-toolbar-spacer { flex: 1 1 0; min-width: 0; }

/* search */
.ifd-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  width: 200px;
  padding: 0 8px;
  background: var(--ifd-raised);
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  flex: none;
}
.ifd-search:focus-within { border-color: var(--ifd-accent); }
.ifd-search > svg { width: 14px; height: 14px; color: var(--ifd-text-3); }
.ifd-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  font-size: 12px;
  color: var(--ifd-text);
}
.ifd-search-input::placeholder { color: var(--ifd-text-3); }
.ifd-search-clear {
  display: inline-flex;
  flex: none;
  color: var(--ifd-text-3);
  border-radius: var(--ifd-radius-xs);
}
.ifd-search-clear:hover { color: var(--ifd-text); }
.ifd-search-clear svg { width: 12px; height: 12px; }
.ifd-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
.ifd-search-input:focus-visible { outline: none; }

/* kbd chips */
.ifd-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-family: var(--ifd-mono);
  font-size: 10.5px;
  line-height: 1;
  color: var(--ifd-text-3);
  background: var(--ifd-raised);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-xs);
  white-space: nowrap;
}

/* icon buttons */
.ifd-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-sm);
}
.ifd-icon-btn:hover { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-spin svg { animation: ifd-spin 0.8s linear infinite; }
@keyframes ifd-spin { to { transform: rotate(360deg); } }

/* ------------------------------------------------------------------ body */
.ifd-body {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
}
.ifd-list-pane {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.ifd-list { outline: none; transition: opacity 120ms var(--ifd-ease); }
.ifd-list[aria-busy="true"] { opacity: 0.6; pointer-events: none; }
.ifd-list:focus-visible { outline: none; }

/* ------------------------------------------------------------------ rows */
.ifd-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--ifd-row-h);
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
  cursor: pointer;
  transition: opacity 160ms var(--ifd-ease), height 160ms var(--ifd-ease);
}
.ifd-row:hover { background: var(--ifd-raised); }
.ifd-row-focused,
.ifd-row[aria-selected="true"] {
  background: var(--ifd-raised);
  box-shadow: inset 2px 0 0 0 var(--ifd-accent-bright);
}
.ifd-list:focus-visible .ifd-row-focused {
  outline: 2px solid var(--ifd-accent-bright);
  outline-offset: -2px;
}
/* Transient exit after a status change removes the row from the filter.
   A @keyframes animation, NOT a transition \u2014 ghost rows are inserted fresh
   into the DOM and transitions never fire on newly inserted elements. */
.ifd-row-leaving {
  overflow: hidden;
  pointer-events: none;
  animation: ifd-row-leave 160ms var(--ifd-ease) forwards;
}
@keyframes ifd-row-leave {
  from {
    opacity: 1;
    height: var(--ifd-row-h);
  }
  to {
    opacity: 0;
    height: 0;
    min-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    border-bottom-width: 0;
  }
}

.ifd-row-status { display: inline-flex; flex: none; }
.ifd-row[data-status="open"] .ifd-row-status { color: var(--ifd-st-open); }
.ifd-row[data-status="in_progress"] .ifd-row-status { color: var(--ifd-st-progress); }
.ifd-row[data-status="resolved"] .ifd-row-status { color: var(--ifd-st-resolved); }
.ifd-row[data-status="wont_fix"] .ifd-row-status { color: var(--ifd-st-wontfix); }

/* Closed items (resolved / wont_fix) fade the whole row so an open backlog
   stands out at a glance; hover/focus/selection lift it back to full opacity
   since the row is still actionable (e.g. reopening it). */
.ifd-row[data-status="resolved"],
.ifd-row[data-status="wont_fix"] {
  opacity: 0.55;
}
.ifd-row[data-status="resolved"]:hover,
.ifd-row[data-status="wont_fix"]:hover,
.ifd-row[data-status="resolved"].ifd-row-focused,
.ifd-row[data-status="wont_fix"].ifd-row-focused,
.ifd-row[data-status="resolved"][aria-selected="true"],
.ifd-row[data-status="wont_fix"][aria-selected="true"] {
  opacity: 0.85;
}

/* status glyph coloring contract: data-status on the glyph's direct parent
   (first svg only \u2014 trailing chevrons/checks keep the text color) */
.ifd-root [data-status="open"] > svg:first-of-type { color: var(--ifd-st-open); }
.ifd-root [data-status="in_progress"] > svg:first-of-type { color: var(--ifd-st-progress); }
.ifd-root [data-status="resolved"] > svg:first-of-type { color: var(--ifd-st-resolved); }
.ifd-root [data-status="wont_fix"] > svg:first-of-type { color: var(--ifd-st-wontfix); }
.ifd-tab[data-status="open"] .ifd-tab-glyph { color: var(--ifd-st-open); }
.ifd-tab[data-status="in_progress"] .ifd-tab-glyph { color: var(--ifd-st-progress); }
.ifd-tab[data-status="resolved"] .ifd-tab-glyph { color: var(--ifd-st-resolved); }
.ifd-tab[data-status="wont_fix"] .ifd-tab-glyph { color: var(--ifd-st-wontfix); }

/* type marker: 6\xD76 filled rounded square \u2014 square = type, circle = status */
.ifd-type-square {
  width: 6px;
  height: 6px;
  border-radius: 1.5px;
  flex: none;
  background: currentColor;
}
.ifd-type-square[data-type="question"] { background: var(--ifd-ty-question); }
.ifd-type-square[data-type="change"] { background: var(--ifd-ty-change); }
.ifd-type-square[data-type="bug"] { background: var(--ifd-ty-bug); }
.ifd-type-square[data-type="other"] { background: var(--ifd-ty-other); }

.ifd-row-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-row-type .ifd-type-label { display: none; }

.ifd-row-message {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 450;
}
.ifd-row[data-status="resolved"] .ifd-row-message,
.ifd-row[data-status="wont_fix"] .ifd-row-message { color: var(--ifd-text-2); }

.ifd-row-path {
  display: none;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-3);
}
.ifd-row-author {
  display: none;
  flex: none;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-row-camera { display: inline-flex; flex: none; color: var(--ifd-text-3); }
.ifd-row-camera svg { width: 13px; height: 13px; }
.ifd-row-time {
  flex: none;
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-3);
}

.ifd-loadmore {
  display: flex;
  justify-content: center;
  padding: 8px 12px;
}

/* -------------------------------------------------------------- buttons */
.ifd-root :is(.ifd-btn, .ifd-btn-ghost, .ifd-btn-primary, .ifd-btn-danger, .ifd-btn-danger-ghost) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
  cursor: pointer;
}
.ifd-btn {
  color: var(--ifd-text);
  background: var(--ifd-raised);
  border-color: var(--ifd-border-strong);
}
.ifd-btn:hover { border-color: var(--ifd-text-3); }
.ifd-btn-ghost { color: var(--ifd-text-2); }
.ifd-btn-ghost:hover { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-btn-primary { color: #ffffff; background: var(--ifd-accent); }
.ifd-btn-primary:hover { background: color-mix(in srgb, var(--ifd-accent) 88%, #ffffff); }
.ifd-btn-primary svg { width: 13px; height: 13px; }
.ifd-btn-danger { color: #ffffff; background: var(--ifd-danger-strong); }
.ifd-btn-danger:hover { background: color-mix(in srgb, var(--ifd-danger-strong) 85%, #ffffff); }
.ifd-btn-danger-ghost { color: var(--ifd-danger); }
.ifd-btn-danger-ghost:hover { background: color-mix(in srgb, var(--ifd-danger) 12%, transparent); }

/* -------------------------------------------------------------- skeleton */
.ifd-skel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--ifd-row-h);
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
}
.ifd-skel-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--ifd-raised);
  animation: ifd-pulse 1.6s linear infinite;
}
.ifd-skel-bar:nth-child(1) { width: 16px; height: 16px; border-radius: 8px; }
.ifd-skel-bar:nth-child(2) { width: 45%; }
.ifd-skel-bar:nth-child(3) { width: 90px; margin-left: auto; }
.ifd-skel-row:nth-child(2) .ifd-skel-bar { animation-delay: 0.15s; }
.ifd-skel-row:nth-child(3) .ifd-skel-bar { animation-delay: 0.3s; }
.ifd-skel-row:nth-child(4) .ifd-skel-bar { animation-delay: 0.45s; }
.ifd-skel-row:nth-child(5) .ifd-skel-bar { animation-delay: 0.6s; }
@keyframes ifd-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* --------------------------------------------------------- empty / error */
.ifd-empty,
.ifd-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 280px;
  padding: 48px 24px;
  text-align: center;
}
.ifd-empty-glyph {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--ifd-text-3);
}
.ifd-empty-glyph > svg { width: 20px; height: 20px; }
.ifd-empty-title { font-size: 13px; font-weight: 600; color: var(--ifd-text); }
.ifd-empty-sub { font-size: 12px; color: var(--ifd-text-2); }
.ifd-root :is(.ifd-empty, .ifd-error) :is(.ifd-btn, .ifd-btn-ghost) { margin-top: 10px; }

/* ---------------------------------------------------------------- drawer */
.ifd-drawer-backdrop {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--ifd-dim);
  animation: ifd-fade-in 180ms var(--ifd-ease);
}
@keyframes ifd-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ifd-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--ifd-surface);
  border-left: 1px solid var(--ifd-border);
  box-shadow: 0 0 0 1px var(--ifd-border), -24px 0 48px -24px rgb(0 0 0 / 0.5);
  animation: ifd-drawer-in 180ms var(--ifd-ease);
}
@keyframes ifd-drawer-in {
  from { transform: translateX(16px); opacity: 0; }
  to { transform: none; opacity: 1; }
}

.ifd-drawer-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid var(--ifd-border);
}
.ifd-drawer-titles {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ifd-drawer-type {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ifd-text);
  white-space: nowrap;
}
.ifd-drawer-id {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ifd-drawer-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px 14px 18px;
}

.ifd-drawer-foot {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--ifd-border);
}
.ifd-drawer-foot .ifd-btn-primary { flex: 1 1 auto; }

/* ----------------------------------------------------------- status menu */
.ifd-status-menu { position: relative; flex: none; }
.ifd-status-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 9px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
  white-space: nowrap;
}
.ifd-status-menu-trigger:hover { background: var(--ifd-raised); }
.ifd-status-menu-trigger > svg { width: 13px; height: 13px; }
.ifd-status-menu-pop {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 7;
  min-width: 160px;
  padding: 4px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
}
.ifd-status-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-xs);
  text-align: left;
}
.ifd-status-menu-item:hover,
.ifd-status-menu-item-active { color: var(--ifd-text); background: var(--ifd-raised); }
.ifd-status-menu-item[aria-selected="true"] { color: var(--ifd-text); }
.ifd-status-menu-item > svg:last-child { margin-left: auto; color: var(--ifd-text-2); }

/* expandable console entries render as real buttons; inherit the mono look.
   No display here \u2014 the base .ifd-diag-msg -webkit-box clamp must keep
   applying while collapsed (data-expanded flips it to block). */
.ifd-root :where(button).ifd-diag-msg { width: 100%; text-align: left; }
.ifd-root :where(button).ifd-diag-msg:hover { color: var(--ifd-text); }

/* --------------------------------------------- evidence card (signature) */
.ifd-evidence {
  flex: none;
  border: 1px solid var(--ifd-border);
  border-radius: var(--ifd-radius-sm);
  overflow: hidden;
  background: var(--ifd-surface);
}
.ifd-evidence-stage {
  position: relative;
  overflow: hidden;
  background: #000000;
}
.ifd-root[data-theme="light"] .ifd-evidence-stage { background: #f1f5f9; }
.ifd-evidence-img {
  display: block;
  width: 100%;
  height: auto;
  cursor: zoom-in;
}
.ifd-evidence-zoomed { overflow: auto; max-height: 420px; }
.ifd-evidence-zoomed .ifd-evidence-img {
  width: auto;
  max-width: none;
  cursor: zoom-out;
}
/* the region overlay only maps onto the fitted (non-zoomed) image */
.ifd-evidence-zoomed :is(.ifd-evidence-dim, .ifd-evidence-rect) { display: none; }

.ifd-evidence-dim {
  position: absolute;
  background: rgb(2 6 23 / 0.42);
  pointer-events: none;
}
.ifd-evidence-rect {
  position: absolute;
  border: 1.5px solid var(--ifd-accent-bright);
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 20px color-mix(in srgb, var(--ifd-accent) 45%, transparent);
  pointer-events: none;
}
/* viewfinder corner brackets \u2014 8 gradient strips, one element, always shown */
.ifd-evidence-corners {
  position: absolute;
  inset: 5px;
  pointer-events: none;
  background-image:
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent)),
    linear-gradient(var(--ifd-accent), var(--ifd-accent));
  background-repeat: no-repeat;
  background-size: 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px, 12px 1.5px, 1.5px 12px;
  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;
}

.ifd-evidence-caption {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 6px 10px;
  border-top: 1px solid var(--ifd-border);
  font-family: var(--ifd-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--ifd-text-3);
}
.ifd-evidence-caption > * { white-space: nowrap; }
.ifd-evidence-caption > :first-child {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ifd-evidence-toggle {
  margin-left: auto;
  padding: 2px 5px;
  font-family: var(--ifd-font);
  font-size: 11px;
  font-weight: 500;
  color: var(--ifd-text-2);
  border-radius: var(--ifd-radius-xs);
  white-space: nowrap;
}
.ifd-evidence-toggle:hover { color: var(--ifd-text); background: var(--ifd-raised); }

/* no-screenshot fallback \u2014 same bracket framing around the anchor data */
.ifd-evidence-fallback {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 18px;
}
.ifd-anchor-selector {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  color: var(--ifd-text-2);
  background: var(--ifd-raised);
  padding: 4px 8px;
  border-radius: var(--ifd-radius-xs);
  overflow-wrap: anywhere;
  cursor: copy;
}
.ifd-anchor-selector:hover { color: var(--ifd-text); }
.ifd-anchor-snippet {
  padding: 2px 0 2px 10px;
  border-left: 2px solid var(--ifd-border-strong);
  font-size: 12px;
  font-style: italic;
  line-height: 1.5;
  color: var(--ifd-text-2);
  overflow-wrap: anywhere;
}

/* --------------------------------------------------------- drawer content */
.ifd-message {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--ifd-text);
}

.ifd-micro,
.ifd-meta-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ifd-text-3);
}
.ifd-mono {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
}
.ifd-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ifd-meta-grid {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 7px 12px;
  align-items: baseline;
}
.ifd-meta-value {
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ifd-text);
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.ifd-meta-value a { color: var(--ifd-accent-bright); }
.ifd-meta-value a:hover { text-decoration: underline; }
/* technical values (URL, viewport, email) get the mono treatment */
.ifd-meta-value[data-mono],
.ifd-meta-value [data-mono] {
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  overflow-wrap: anywhere;
}

/* ------------------------------------------------------------ diagnostics */
.ifd-diagnostics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ifd-diag-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ifd-diag-entry {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 8px 4px 10px;
  border-left: 2px solid var(--ifd-border-strong);
  font-family: var(--ifd-mono);
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--ifd-text-2);
}
.ifd-diag-entry[data-level="error"] { border-left-color: var(--ifd-danger); }
.ifd-diag-entry[data-level="warn"] { border-left-color: var(--ifd-st-progress); }
.ifd-diag-time {
  flex: none;
  color: var(--ifd-text-3);
  font-variant-numeric: tabular-nums;
}
.ifd-diag-level {
  flex: none;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ifd-diag-entry[data-level="error"] :is(.ifd-diag-level, .ifd-diag-status) { color: var(--ifd-danger); }
.ifd-diag-entry[data-level="warn"] .ifd-diag-level { color: var(--ifd-st-progress); }
.ifd-diag-msg {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}
.ifd-diag-entry[data-expanded="true"] .ifd-diag-msg { display: block; }
.ifd-diag-method { flex: none; font-weight: 600; }
.ifd-diag-status { flex: none; font-variant-numeric: tabular-nums; }
.ifd-diag-url {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifd-diag-dur {
  flex: none;
  color: var(--ifd-text-3);
  font-variant-numeric: tabular-nums;
}

/* ------------------------------------------------------------ danger zone */
.ifd-danger-zone {
  display: flex;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--ifd-border);
}
.ifd-confirm {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--ifd-text-2);
}

/* ----------------------------------------------------------------- hints */
.ifd-hints {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  height: 32px;
  padding: 0 12px;
  border-top: 1px solid var(--ifd-border);
  background: var(--ifd-surface);
  font-size: 11px;
  color: var(--ifd-text-3);
  overflow: hidden;
  white-space: nowrap;
}
.ifd-hints > * {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
}

/* ----------------------------------------------------------------- toast */
.ifd-toast {
  position: absolute;
  left: 50%;
  bottom: 44px;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px 5px 12px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius-sm);
  box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.4);
  font-size: 12px;
  color: var(--ifd-text);
  white-space: nowrap;
  animation: ifd-toast-in 160ms var(--ifd-ease);
}
@keyframes ifd-toast-in {
  from { transform: translate(-50%, 8px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.ifd-toast-msg { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

/* ------------------------------------------------------ shortcuts overlay */
.ifd-shortcuts {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--ifd-dim);
  animation: ifd-fade-in 160ms var(--ifd-ease);
}
.ifd-shortcuts-card {
  min-width: 260px;
  max-width: 340px;
  max-height: 100%;
  overflow-y: auto;
  padding: 18px 20px;
  background: var(--ifd-surface);
  border: 1px solid var(--ifd-border-strong);
  border-radius: var(--ifd-radius);
  font-size: 12px;
  color: var(--ifd-text-2);
}
.ifd-shortcuts-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 14px;
  align-items: center;
  margin-top: 12px;
}
.ifd-shortcut-keys {
  display: inline-flex;
  gap: 4px;
  justify-self: start;
}
.ifd-shortcut-label::first-letter { text-transform: uppercase; }

/* ---------------------------------------------------- container queries */
@container spd (min-width: 560px) {
  .ifd-row-path { display: block; }
}
@container spd (min-width: 640px) {
  .ifd-row-author { display: block; }
}
@container spd (min-width: 720px) {
  .ifd-row-type .ifd-type-label { display: inline; }
}
@container spd (min-width: 960px) {
  .ifd-drawer {
    position: static;
    flex: none;
    width: 400px;
    box-shadow: none;
    z-index: auto;
    animation: none;
  }
  .ifd-drawer-backdrop { display: none; }
}
/* narrow containers: keep the toolbar on one line */
@container spd (max-width: 719.98px) {
  .ifd-search { width: 150px; }
  .ifd-search .ifd-kbd { display: none; }
}
@container spd (max-width: 619.98px) {
  .ifd-tab .ifd-tab-label { display: none; }
  .ifd-tab[data-status="all"] .ifd-tab-label,
  .ifd-tab[aria-checked="true"] .ifd-tab-label { display: inline; }
}
@container spd (max-width: 479.98px) {
  /* Keep the type filter reachable (WCAG 1.4.10 reflow) \u2014 the wrapping
     toolbar absorbs the width; just tighten it. */
  .ifd-type-filter select { max-width: 110px; }
  .ifd-search { width: 120px; }
}

/* ---------------------------------------------------------------- motion */
@media (prefers-reduced-motion: reduce) {
  /* !important is deliberate: this kill-switch must beat every specificity,
     including compound rules like .ifd-spin svg. */
  .ifd-root *,
  .ifd-root *::before,
  .ifd-root *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* ---------------------------------------------------------- forced colors */
@media (forced-colors: active) {
  .ifd-root,
  .ifd-root * { border-color: CanvasText; }
  .ifd-row-focused,
  .ifd-row[aria-selected="true"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
`;var an="instafix-inbox-styles";function sn(){if(typeof document>"u"||document.getElementById(an))return;let e=document.createElement("style");e.id=an,e.textContent=on,document.head.appendChild(e);}var yr="#0066ff",wr=/^#[0-9a-fA-F]{6}$/,dn=/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,kr=/^#[0-9a-fA-F]{8}$/;function cn(e){if(wr.test(e))return e;let t=dn.test(e)?e.match(dn):null;return t?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:kr.test(e)?e.slice(0,7):(console.warn(`[instafix] Invalid accentColor "${e}" \u2014 only hex colors (#RGB, #RRGGBB, #RRGGBBAA) are supported. Using default.`),yr)}function Sr(){return typeof window>"u"||typeof window.matchMedia!="function"?false:window.matchMedia("(prefers-color-scheme: dark)").matches}function At(e){return e==="dark"||e==="auto"&&Sr()?"dark":"light"}function ln(e){if(typeof window>"u"||typeof window.matchMedia!="function")return ()=>{};let t=window.matchMedia("(prefers-color-scheme: dark)"),n=a=>{e(a.matches?"dark":"light");};return t.addEventListener("change",n),()=>t.removeEventListener("change",n)}function fn(e){return {...e,clientId:"",resolvedAt:e.resolvedAt===null?null:new Date(e.resolvedAt),createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),annotations:e.annotations.map(t=>({...t,createdAt:new Date(t.createdAt)}))}}async function un(e){return await e.json()}function Dt(e){let{endpoint:t,apiKey:n,headers:a,fetchFn:s}=e,c=s??((l,u)=>globalThis.fetch(l,u));async function o(l){let u={};l&&(u["Content-Type"]="application/json"),n&&(u.Authorization=`Bearer ${n}`);let v=typeof a=="function"?await a():a;return v&&Object.assign(u,v),u}async function p(l,u,v){let r;try{r=await c(u,v);}catch(f){throw Rt(f,l)}if(!r.ok)throw await Tt(r,l);return r}return {async list(l){let u=Ft(l),v=await p("Failed to fetch feedbacks",`${t}?${u.toString()}`,{method:"GET",cache:"no-store",headers:await o(false)}),r=await un(v);return {feedbacks:r.feedbacks.map(fn),total:r.total}},async setStatus(l,u,v){let r=await p("Failed to update feedback",t,{method:"PATCH",headers:await o(true),body:JSON.stringify({id:l,projectName:u,status:v})});return fn(await un(r))},async remove(l,u){await p("Failed to delete feedback",t,{method:"DELETE",headers:await o(true),body:JSON.stringify({id:l,projectName:u})});}}}function Lt(e){return {list(t){return e.getFeedbacks(t)},setStatus(t,n,a){return e.updateFeedback(t,wt(a))},async remove(t,n){await e.deleteFeedback(t);}}}var Er=50,Ir=250,pn=["all",...te];function Fr(e){return e===void 0||Number.isNaN(e)?Er:Math.min(100,Math.max(1,Math.floor(e)))}function ft(e){return e instanceof Error?e:new Error(String(e))}function mn(e,t){let n={...e};for(let[a,s]of t){let c=n[a];typeof c=="number"&&(n[a]=Math.max(0,c+s));}return n}function Tr(e,t){let n=e.findIndex(a=>a.createdAt.getTime()<t.createdAt.getTime());return n===-1?[...e,t]:[...e.slice(0,n),t,...e.slice(n)]}function Ot(e){let{source:t,store:n,endpoint:a,apiKey:s,onStatusChange:c,onDelete:o,onError:p}=e,l=useMemo(()=>typeof e.projects=="string"?[e.projects]:[...e.projects],[e.projects]),u=l[0];if(u===void 0)throw new Error("[instafix] useInstaFixInbox: `projects` must contain at least one project name.");let v=Fr(e.pageSize),r=useRef(e.headers);r.current=e.headers;let f=useRef({onStatusChange:c,onDelete:o,onError:p});f.current={onStatusChange:c,onDelete:o,onError:p};let m=useMemo(()=>{if(t)return t;if(n)return Lt(n);if(a)return Dt({endpoint:a,apiKey:s,headers:()=>{let i=r.current;return typeof i=="function"?i():i??{}}});throw new Error("[instafix] useInstaFixInbox requires one of `source`, `store` or `endpoint`.")},[t,n,a,s]),[q,P]=useState(u),[F,A]=useState("open"),[g,I]=useState("all"),[Z,d]=useState(""),[ie,_e]=useState(""),[ce,he]=useState([]),[ve,Ne]=useState(null),[Ke,Qe]=useState({}),[me,ye]=useState(true),[je,be]=useState(false),[Xe,ze]=useState(null),[Ce,H]=useState(null),[J,ae]=useState(null),[ge,Ae]=useState(null),T=useRef(ce);T.current=ce;let le=useRef(Ke);le.current=Ke;let _=useRef(ve);_.current=ve;let xe=useRef(Ce);xe.current=Ce;let we=useRef(J);we.current=J;let b=useRef(ge);b.current=ge;let k=useRef(F);k.current=F;let $=useRef(q);$.current=q;let W=useRef(m);W.current=m;let M=useRef(0),ke=useRef(0),[Ze,Je]=useState(false),D=useRef(null),G=useRef(null);useEffect(()=>{l.includes($.current)||(P(u),H(null),ae(null),Ae(null),G.current=null,D.current=null);},[l,u]),useEffect(()=>{let i=setTimeout(()=>_e(Z),Ir);return ()=>clearTimeout(i)},[Z]);let Be=useMemo(()=>({projectName:q,type:g==="all"?void 0:g,search:ie.trim()===""?void 0:ie.trim().slice(0,200)}),[q,g,ie]),Wt=useRef(Be);Wt.current=Be;let ht=useCallback(async()=>{let i=++M.current,x=++ke.current;ye(true),ze(null);let h={...Be,status:F==="all"?void 0:F,page:1,limit:v};try{let R=await m.list(h);if(i!==M.current)return;Je(!1),T.current=R.feedbacks,_.current=R.total,he(R.feedbacks),Ne(R.total),ye(!1);}catch(R){if(i!==M.current)return;let Q=ft(R);ye(false),ze(Q),f.current.onError?.(Q);return}let L=await Promise.all(pn.map(R=>m.list({...Be,status:R==="all"?void 0:R,page:1,limit:1}).then(Q=>Q.total).catch(()=>{})));if(x!==ke.current)return;let w={};pn.forEach((R,Q)=>{let ee=L[Q];typeof ee=="number"&&(w[R]=ee);}),le.current=w,Qe(w);},[m,Be,F,v]);useEffect(()=>{ht();},[ht]);let nr=useCallback(async()=>{if(me||je||_.current===null||T.current.length>=_.current)return;let i=++M.current;be(true);try{let x=Math.floor(T.current.length/v)+1,h=k.current,L=await W.current.list({...Wt.current,status:h==="all"?void 0:h,page:x,limit:v});if(i!==M.current)return;let w=new Set(T.current.map(ee=>ee.id)),R=L.feedbacks.filter(ee=>!w.has(ee.id));R.length===0&&Je(!0);let Q=[...T.current,...R];T.current=Q,_.current=L.total,he(Q),Ne(L.total);}catch(x){if(i!==M.current)return;let h=ft(x);ze(h),f.current.onError?.(h);}finally{be(false);}},[me,je,v]),rr=useCallback(i=>H(i),[]),or=useCallback(()=>{H(i=>{let x=T.current;if(x.length===0)return i;let h=x.findIndex(w=>w.id===i),L=h===-1?x[0]:x[Math.min(h+1,x.length-1)];return L?L.id:i});},[]),ir=useCallback(()=>{H(i=>{let x=T.current;if(x.length===0)return i;let h=x.findIndex(w=>w.id===i),L=h===-1?x[0]:x[Math.max(h-1,0)];return L?L.id:i});},[]),ar=useCallback(i=>{let x=T.current.find(h=>h.id===i)??null;x&&(D.current=x),ae(i),H(i);},[]),sr=useCallback(()=>ae(null),[]),dr=useMemo(()=>{if(J===null)return null;let i=ce.find(x=>x.id===J);return i||(D.current?.id===J?D.current:null)},[ce,J]),et=useCallback((i,x)=>{let h=x===-1?null:i[Math.min(x,i.length-1)]??null;xe.current=h?h.id:null,H(h?h.id:null);},[]),fe=useCallback(i=>{T.current=i,he(i);},[]),De=useCallback(i=>{le.current=i,Qe(i);},[]),Se=useCallback(i=>{_.current=i,Ne(i);},[]),Ee=useCallback(i=>{b.current=i,Ae(i);},[]),tt=useCallback(async(i,x,h)=>{let L=T.current.find(K=>K.id===i)??(G.current?.id===i?G.current:null)??(D.current?.id===i?D.current:null);if(!L||L.status===x){h&&Ae(null);return}let w={items:T.current,counts:le.current,total:_.current,focusedId:xe.current,pendingUndo:b.current,undoRecord:G.current,openedCache:D.current,token:M.current},R=L.status,Q=new Date,ee={...L,status:x,resolvedAt:He(x)?Q:null,updatedAt:Q},Vt=k.current,qt=Vt==="all"||Vt===x,vt=T.current.findIndex(K=>K.id===i);if(vt!==-1&&!qt){let K=T.current.filter(Ie=>Ie.id!==i);fe(K),Se(_.current===null?null:Math.max(0,_.current-1)),w.focusedId===i&&et(K,vt);}else vt!==-1?fe(T.current.map(K=>K.id===i?ee:K)):qt&&(fe(Tr(T.current,ee)),Se(_.current===null?null:_.current+1));D.current?.id===i&&(D.current=ee),De(mn(le.current,[[R,-1],[x,1]])),h?(Ee(null),G.current=null):(Ee({id:i,previousStatus:R}),G.current=ee);try{let K=await W.current.setStatus(i,$.current,x);fe(T.current.map(Ie=>Ie.id===i?K:Ie)),D.current?.id===i&&(D.current=K),G.current?.id===i&&(G.current=K),f.current.onStatusChange?.(K,R);}catch(K){M.current===w.token&&(fe(w.items),De(w.counts),Se(w.total),xe.current=w.focusedId,H(w.focusedId),D.current=w.openedCache),Ee(w.pendingUndo),G.current=w.undoRecord;let Ie=ft(K);throw f.current.onError?.(Ie),Ie}},[et,fe,De,Se,Ee]),cr=useCallback((i,x)=>tt(i,x,false),[tt]),lr=useCallback(async()=>{let i=b.current;i&&await tt(i.id,i.previousStatus,true);},[tt]),fr=useCallback(async i=>{let x=T.current.find(w=>w.id===i)??(D.current?.id===i?D.current:null);if(!x)return;let h={items:T.current,counts:le.current,total:_.current,focusedId:xe.current,openedId:we.current,pendingUndo:b.current,undoRecord:G.current,openedCache:D.current,token:M.current},L=T.current.findIndex(w=>w.id===i);if(L!==-1){let w=T.current.filter(R=>R.id!==i);fe(w),Se(_.current===null?null:Math.max(0,_.current-1)),h.focusedId===i&&et(w,L);}De(mn(le.current,[[x.status,-1],["all",-1]])),we.current===i&&(we.current=null,ae(null)),D.current?.id===i&&(D.current=null),b.current?.id===i&&(Ee(null),G.current=null);try{await W.current.remove(i,$.current),f.current.onDelete?.(x);}catch(w){M.current===h.token&&(fe(h.items),De(h.counts),Se(h.total),xe.current=h.focusedId,H(h.focusedId),we.current=h.openedId,ae(h.openedId),D.current=h.openedCache),Ee(h.pendingUndo),G.current=h.undoRecord;let R=ft(w);throw f.current.onError?.(R),R}},[et,fe,De,Se,Ee]),ur=useCallback(i=>{P(i),H(null),ae(null),Ae(null),G.current=null,D.current=null;},[]),pr=useCallback(i=>A(i),[]),mr=useCallback(i=>I(i),[]),br=useCallback(i=>d(i),[]),gr=!Ze&&ve!==null&&ce.length<ve,xr=ce.length>0?"ready":me?"loading":Xe!==null?"error":"empty";return {project:q,projects:l,setProject:ur,status:F,setStatus:pr,type:g,setType:mr,search:Z,setSearch:br,items:ce,total:ve,counts:Ke,loading:me,loadingMore:je,error:Xe,hasMore:gr,view:xr,loadMore:nr,refresh:ht,focusedId:Ce,focus:rr,focusNext:or,focusPrev:ir,openedId:J,opened:dr,openFeedback:ar,closeFeedback:sr,changeStatus:cr,deleteFeedback:fr,pendingUndo:ge,undo:lr}}var X={width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"};function ut({className:e}){return jsx("svg",{...X,"aria-hidden":"true",className:e,children:jsx("circle",{cx:"8",cy:"8",r:"6"})})}function bn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("circle",{cx:"8",cy:"8",r:"6"}),jsx("path",{d:"M8 2.5a5.5 5.5 0 0 1 0 11Z",fill:"currentColor",stroke:"none"})]})}function gn({className:e}){let t=`ifd-resolved-${useId().replace(/[^a-zA-Z0-9_-]/g,"")}`;return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsxs("mask",{id:t,children:[jsx("rect",{width:"16",height:"16",fill:"#fff"}),jsx("path",{d:"M5.1 8.4l2 2 3.8-4.4",stroke:"#000",strokeWidth:"1.7",fill:"none"})]}),jsx("circle",{cx:"8",cy:"8",r:"6.75",fill:"currentColor",stroke:"none",mask:`url(#${t})`})]})}function xn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("circle",{cx:"8",cy:"8",r:"6"}),jsx("path",{d:"M4.3 11.7 11.7 4.3"})]})}function pt({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("circle",{cx:"7.25",cy:"7.25",r:"4.75"}),jsx("path",{d:"m10.75 10.75 3 3"})]})}function hn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("path",{d:"M14 8a6 6 0 1 1-6-6c1.68 0 3.29.67 4.49 1.83L14 5.33"}),jsx("path",{d:"M14 2v3.33h-3.33"})]})}function mt({className:e}){return jsx("svg",{...X,"aria-hidden":"true",className:e,children:jsx("path",{d:"M4 4l8 8M12 4l-8 8"})})}function bt({className:e}){return jsx("svg",{...X,"aria-hidden":"true",className:e,children:jsx("path",{d:"m4 6.5 4 4 4-4"})})}function vn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("path",{d:"M12.5 8.5V12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 12V5A1.5 1.5 0 0 1 4 3.5h3.5"}),jsx("path",{d:"M9.5 2.5h4v4"}),jsx("path",{d:"M13.5 2.5 8 8"})]})}function yn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("path",{d:"M2.5 5.5A1.5 1.5 0 0 1 4 4h1.3l1-1.5h3.4l1 1.5H12a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 13H4a1.5 1.5 0 0 1-1.5-1.5v-6Z"}),jsx("circle",{cx:"8",cy:"8.25",r:"2.25"})]})}function wn({className:e}){return jsxs("svg",{...X,"aria-hidden":"true",className:e,children:[jsx("path",{d:"M2.5 4.5h11"}),jsx("path",{d:"M5.5 4.5V3.25A1.25 1.25 0 0 1 6.75 2h2.5a1.25 1.25 0 0 1 1.25 1.25V4.5"}),jsx("path",{d:"M4 4.5l.6 8.11A1.5 1.5 0 0 0 6.1 14h3.8a1.5 1.5 0 0 0 1.5-1.39L12 4.5"})]})}function kn({className:e}){return jsx("svg",{...X,"aria-hidden":"true",className:e,children:jsx("path",{d:"m3.5 8.5 3 3 6-6.5"})})}var Sn=createContext(null),En=Sn.Provider;function y(){let e=useContext(Sn);if(!e)throw new Error("[instafix] Inbox components must render inside <InstaFixInbox />");return e}var Re={open:ut,in_progress:bn,resolved:gn,wont_fix:xn};var Fn=6;function Ar(e){return e.length>90||e.includes(`
`)}function Tn({diagnostics:e}){let{t,locale:n}=y(),[a,s]=useState(false),[c,o]=useState(new Set),p=useMemo(()=>[...e.console.map((f,m)=>({kind:"console",key:`console-${m}`,timestamp:f.timestamp,console:f})),...e.network.map((f,m)=>({kind:"network",key:`network-${m}`,timestamp:f.timestamp,network:f}))].sort((f,m)=>Date.parse(f.timestamp)-Date.parse(m.timestamp)),[e]),l=a?p:p.slice(0,Fn),u=r=>{let f=new Date(r);return Number.isNaN(f.getTime())?r:f.toLocaleTimeString(n,{hour12:false})},v=r=>{o(f=>{let m=new Set(f);return m.has(r)?m.delete(r):m.add(r),m});};return jsxs("section",{className:"ifd-diagnostics",children:[jsxs("div",{className:"ifd-meta-label",children:[t("drawer.diagnostics")," \xB7 ",p.length]}),jsx("ul",{className:"ifd-diag-list",children:l.map(r=>{if(r.kind==="console"){let f=Ar(r.console.message),m=c.has(r.key);return jsxs("li",{className:"ifd-diag-entry","data-level":r.console.level,"data-expanded":f&&m?"true":void 0,children:[jsx("time",{className:"ifd-diag-time",dateTime:r.timestamp,children:u(r.timestamp)}),jsx("span",{className:"ifd-diag-level",children:r.console.level}),f?jsx("button",{type:"button",className:"ifd-diag-msg","aria-expanded":m,onClick:()=>v(r.key),children:r.console.message}):jsx("span",{className:"ifd-diag-msg",style:{cursor:"auto"},children:r.console.message})]},r.key)}return jsxs("li",{className:"ifd-diag-entry","data-level":r.network.status>=400||r.network.status===0?"error":"info",children:[jsx("time",{className:"ifd-diag-time",dateTime:r.timestamp,children:u(r.timestamp)}),jsx("span",{className:"ifd-diag-method",children:r.network.method}),jsx("span",{className:"ifd-diag-status","data-failed":r.network.status>=400||r.network.status===0||void 0,children:r.network.status}),jsx("span",{className:"ifd-diag-url",title:r.network.url,children:r.network.url}),jsxs("span",{className:"ifd-diag-dur",children:[Math.round(r.network.durationMs),"ms"]})]},r.key)})}),!a&&p.length>Fn?jsx("button",{type:"button",className:"ifd-btn-ghost",onClick:()=>s(true),children:Y(t,"drawer.showAllDiagnostics",{count:p.length})}):null]})}var Lr=e=>Math.min(1,Math.max(0,e)),V=e=>`${(Lr(e)*100).toFixed(3)}%`;function Mr(e){let t={position:"absolute",pointerEvents:"none"};return [{...t,left:0,top:0,width:"100%",height:V(e.yPct)},{...t,left:0,top:V(e.yPct),width:V(e.xPct),height:V(e.hPct)},{...t,left:V(e.xPct+e.wPct),top:V(e.yPct),width:V(1-e.xPct-e.wPct),height:V(e.hPct)},{...t,left:0,top:V(e.yPct+e.hPct),width:"100%",height:V(1-e.yPct-e.hPct)}]}function Or(e){return {position:"absolute",pointerEvents:"none",left:V(e.xPct),top:V(e.yPct),width:V(e.wPct),height:V(e.hPct)}}function Rn({annotation:e,withCorners:t}){let{t:n,notify:a}=y(),s=useRef(null),c=typeof navigator<"u"&&!!navigator.clipboard,o=async()=>{try{await navigator.clipboard.writeText(e.cssSelector),a(n("inbox.copied"));}catch{let p=s.current,l=typeof window<"u"?window.getSelection():null;if(p&&l){let u=document.createRange();u.selectNodeContents(p),l.removeAllRanges(),l.addRange(u);}}};return jsxs("div",{className:"ifd-evidence-fallback",children:[t?jsxs("div",{className:"ifd-evidence-corners","aria-hidden":"true",children:[jsx("i",{}),jsx("i",{})]}):null,jsx("div",{className:"ifd-meta-label",children:n("drawer.anchor")}),c?jsx("button",{ref:s,type:"button",className:"ifd-anchor-selector",title:e.cssSelector,onClick:()=>{o();},children:e.cssSelector}):jsx("div",{className:"ifd-anchor-selector",title:e.cssSelector,children:e.cssSelector}),e.textSnippet?jsxs("blockquote",{className:"ifd-anchor-snippet",children:["\xAB ",e.textSnippet," \xBB"]}):null]})}function Nn({record:e}){let{t}=y(),[n,a]=useState(false),[s,c]=useState(true),[o,p]=useState(null),l=e.screenshotRegion,u=e.annotations[0],v=e.annotations.slice(1),r=[dt(e.url),e.viewport];return u&&r.push(`@${u.devicePixelRatio}x`),l&&o&&r.push(`${Math.round(l.wPct*o.w)}\xD7${Math.round(l.hPct*o.h)}px`),jsxs("div",{className:"ifd-evidence",children:[e.screenshotUrl?jsxs(Fragment,{children:[jsxs("div",{className:`ifd-evidence-stage${n?" ifd-evidence-zoomed":""}`,children:[jsx("button",{type:"button",className:"ifd-evidence-zoom","aria-pressed":n,"aria-label":t("drawer.zoomScreenshot"),style:{display:"block",width:"100%",cursor:n?"zoom-out":"zoom-in"},onClick:()=>a(f=>!f),onKeyDown:f=>{f.key==="Escape"&&n&&(f.stopPropagation(),a(false));},children:jsx("img",{className:"ifd-evidence-img",src:e.screenshotUrl,alt:t("drawer.screenshotAlt"),onLoad:f=>{let m=f.currentTarget;m.naturalWidth>0&&m.naturalHeight>0&&p({w:m.naturalWidth,h:m.naturalHeight});}})}),l&&s?jsxs(Fragment,{children:[Mr(l).map((f,m)=>jsx("div",{className:"ifd-evidence-dim",style:f},m)),jsx("div",{className:"ifd-evidence-rect",style:Or(l)})]}):null,jsxs("div",{className:"ifd-evidence-corners","aria-hidden":"true",children:[jsx("i",{}),jsx("i",{})]})]}),jsxs("div",{className:"ifd-evidence-caption",children:[jsx("span",{children:r.join(" \xB7 ")}),l?jsx("button",{type:"button",className:"ifd-evidence-toggle",onClick:()=>c(f=>!f),children:t(s?"drawer.hideAnnotation":"drawer.showAnnotation")}):null]})]}):u?jsx(Rn,{annotation:u,withCorners:true}):jsxs("div",{className:"ifd-evidence-fallback",children:[jsxs("div",{className:"ifd-evidence-corners","aria-hidden":"true",children:[jsx("i",{}),jsx("i",{})]}),jsx("div",{className:"ifd-empty-sub",children:t("drawer.noScreenshot")})]}),v.map(f=>jsx(Rn,{annotation:f,withCorners:false},f.id))]})}function Dn({status:e,onSelect:t}){let{t:n}=y(),[a,s]=useState(false),[c,o]=useState(0),p=useRef(null),l=useRef(null),u=useRef(null),v=useId();useEffect(()=>{if(!a)return;let g=I=>{p.current&&I.target instanceof Node&&!p.current.contains(I.target)&&s(false);};return document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[a]),useEffect(()=>{a&&u.current?.focus();},[a]);let r=()=>{o(Math.max(0,te.indexOf(e))),s(true);},f=()=>{s(false),l.current?.focus();},m=g=>{f(),g!==e&&t(g);},q=g=>{switch(g.stopPropagation(),g.key){case "ArrowDown":o(I=>Math.min(I+1,te.length-1));break;case "ArrowUp":o(I=>Math.max(I-1,0));break;case "Home":o(0);break;case "End":o(te.length-1);break;case "Enter":case " ":{let I=te[c];I&&m(I);break}case "Escape":case "Tab":f();break;default:return}g.preventDefault();},P=g=>{if(g.key==="Enter"||g.key===" "){g.stopPropagation();return}(g.key==="ArrowDown"||g.key==="ArrowUp")&&(g.preventDefault(),g.stopPropagation(),r());},F=Re[e],A=te[c]??"open";return jsxs("div",{ref:p,className:"ifd-status-menu",children:[jsxs("button",{ref:l,type:"button",className:"ifd-status-menu-trigger","data-status":e,"aria-haspopup":"listbox","aria-expanded":a,onClick:()=>a?s(false):r(),onKeyDown:P,children:[jsx(F,{}),jsx("span",{children:ue(e,n)}),jsx(bt,{})]}),a?jsx("div",{ref:u,className:"ifd-status-menu-pop",role:"listbox",tabIndex:-1,"aria-label":n("drawer.status"),"aria-activedescendant":`${v}-${A}`,onKeyDown:q,children:te.map((g,I)=>{let Z=Re[g];return jsxs("div",{id:`${v}-${g}`,role:"option",tabIndex:-1,"aria-selected":g===e,"data-status":g,className:`ifd-status-menu-item${I===c?" ifd-status-menu-item-active":""}`,onClick:()=>m(g),onMouseEnter:()=>o(I),children:[jsx(Z,{}),jsx("span",{children:ue(g,n)})]},g)})}):null]})}var jr='a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';function On({record:e,overlay:t,deepLinkParam:n,onClose:a,onChangeStatus:s,onDelete:c}){let{t:o,locale:p}=y(),l=useRef(null),u=useRef(null),[v,r]=useState(false);useEffect(()=>{if(!t)return;let A=document.activeElement instanceof HTMLElement?document.activeElement:null;return l.current?.focus(),()=>{let g=document.activeElement;(g===null||g===document.body||l.current?.contains(g)===true)&&A?.isConnected&&A.focus();}},[t]);let f=A=>{if(!t||A.key!=="Tab")return;let g=l.current;if(!g)return;let I=g.querySelectorAll(jr),Z=I[0],d=I[I.length-1];!Z||!d||(A.shiftKey&&(document.activeElement===Z||document.activeElement===g)?(A.preventDefault(),d.focus()):!A.shiftKey&&document.activeElement===d&&(A.preventDefault(),Z.focus()));},m=e.diagnostics,q=m!==null&&m.console.length+m.network.length>0,P=rn(e.url),F=ct(e,n);return jsxs(Fragment,{children:[t?jsx("div",{className:"ifd-drawer-backdrop",role:"presentation",onClick:a}):null,jsxs("div",{ref:l,className:"ifd-drawer",role:t?"dialog":"region","aria-modal":t||void 0,"aria-label":`${o("drawer.title")} \u2014 ${Te(e.type,o)} #${Ct(e.id)}`,tabIndex:-1,onKeyDown:f,children:[jsx("h2",{className:"ifd-sr-only",children:o("drawer.title")}),jsxs("div",{className:"ifd-drawer-head",children:[jsxs("div",{className:"ifd-drawer-titles",children:[jsxs("span",{className:"ifd-drawer-type",children:[jsx("i",{className:"ifd-type-square","data-type":e.type,"aria-hidden":"true"}),Te(e.type,o)]}),jsxs("span",{className:"ifd-drawer-id",title:e.id,children:["#",Ct(e.id)]})]}),jsx(Dn,{status:e.status,onSelect:A=>s(e.id,A)}),jsx("button",{ref:u,type:"button",className:"ifd-icon-btn ifd-drawer-close","aria-label":o("drawer.close"),onClick:a,children:jsx(mt,{})})]}),jsxs("div",{className:"ifd-drawer-scroll",children:[jsx(Nn,{record:e}),jsx("p",{className:"ifd-message",children:e.message}),jsxs("dl",{className:"ifd-meta-grid",children:[jsx("dt",{className:"ifd-meta-label",children:o("drawer.author")}),jsx("dd",{className:"ifd-meta-value",children:e.authorEmail?jsxs(Fragment,{children:[e.authorName," ",jsxs("span",{"data-mono":true,children:["<",e.authorEmail,">"]})]}):e.authorName}),jsx("dt",{className:"ifd-meta-label",children:o("drawer.page")}),jsx("dd",{className:"ifd-meta-value","data-mono":true,children:P?jsx("a",{href:P,target:"_blank",rel:"noreferrer",children:e.url}):e.url}),jsx("dt",{className:"ifd-meta-label",children:o("drawer.viewport")}),jsx("dd",{className:"ifd-meta-value","data-mono":true,children:e.viewport}),jsx("dt",{className:"ifd-meta-label",children:o("drawer.submitted")}),jsxs("dd",{className:"ifd-meta-value",children:[jsx("time",{dateTime:e.createdAt.toISOString(),children:st(e.createdAt,p)})," \xB7 ",at(e.createdAt,o)]}),jsx("dt",{className:"ifd-meta-label",children:o("drawer.browser")}),jsx("dd",{className:"ifd-meta-value ifd-clamp-2",title:e.userAgent,children:e.userAgent})]}),q&&m?jsx(Tn,{diagnostics:m}):null,jsx("div",{className:"ifd-danger-zone",children:v?jsxs("div",{className:"ifd-confirm",children:[jsx("span",{children:o("drawer.deleteConfirm")}),jsx("button",{type:"button",className:"ifd-btn-danger",onClick:()=>c(e.id),children:o("drawer.deleteYes")}),jsx("button",{type:"button",className:"ifd-btn-ghost",onClick:()=>r(false),children:o("inbox.cancel")})]}):jsxs("button",{type:"button",className:"ifd-btn-danger-ghost",onClick:()=>r(true),children:[jsx(wn,{}),o("drawer.delete")]})})]}),F?jsxs("div",{className:"ifd-drawer-foot",children:[jsxs("a",{className:"ifd-btn-primary",href:F,target:"_blank",rel:"noreferrer",children:[o("drawer.openOnPage"),jsx(vn,{})]}),jsx("kbd",{className:"ifd-kbd",children:"\u23CE"})]}):null]})]})}function Un({state:e,custom:t}){let{t:n}=y(),a=e.status!=="all"||e.type!=="all"||e.search!=="",s=(e.counts.all??0)>0;return e.status==="open"&&e.type==="all"&&e.search===""&&s?jsxs("div",{className:"ifd-empty",children:[jsx("span",{className:"ifd-empty-glyph","aria-hidden":"true",children:jsx(kn,{})}),jsx("div",{className:"ifd-empty-title",children:n("inbox.inboxZeroTitle")}),jsx("div",{className:"ifd-empty-sub",children:n("inbox.inboxZeroSub")})]}):a?jsxs("div",{className:"ifd-empty",children:[jsx("span",{className:"ifd-empty-glyph","aria-hidden":"true",children:jsx(pt,{})}),jsx("div",{className:"ifd-empty-title",children:n("inbox.emptyFilteredTitle")}),jsx("div",{className:"ifd-empty-sub",children:n("inbox.emptyFilteredSub")}),jsx("button",{type:"button",className:"ifd-btn-ghost",onClick:()=>{e.setStatus("all"),e.setType("all"),e.setSearch("");},children:n("inbox.viewAll")})]}):t!==void 0?jsx(Fragment,{children:t}):jsxs("div",{className:"ifd-empty",children:[jsx("span",{className:"ifd-empty-glyph","aria-hidden":"true",children:jsx(ut,{})}),jsx("div",{className:"ifd-empty-title",children:n("inbox.emptyTitle")}),jsx("div",{className:"ifd-empty-sub",children:n("inbox.emptySub")})]})}function _n({error:e,onRetry:t}){let{t:n}=y();return jsxs("div",{className:"ifd-empty ifd-error",children:[jsx("div",{className:"ifd-empty-title",children:n("inbox.loadError")}),jsx("div",{className:"ifd-empty-sub",children:e.message}),jsx("button",{type:"button",className:"ifd-btn",onClick:t,children:n("inbox.retry")})]})}function jn({record:e,domId:t,focused:n,selected:a,leaving:s,onSelect:c,refCallback:o}){let{t:p,locale:l}=y(),u=Re[e.status],v=Te(e.type,p),r=dt(e.url),f=`ifd-row${n?" ifd-row-focused":""}${s?" ifd-row-leaving":""}`,m=()=>{window.getSelection()?.toString()||c();};return jsxs("div",{id:t,ref:o,role:"option",tabIndex:-1,"aria-selected":a,"aria-hidden":s||void 0,"data-status":e.status,className:f,onClick:s?void 0:m,children:[jsx("span",{className:"ifd-row-status",role:"img","aria-label":ue(e.status,p),children:jsx(u,{})}),jsxs("span",{className:"ifd-row-type",title:v,children:[jsx("i",{className:"ifd-type-square","data-type":e.type,"aria-hidden":"true"}),jsx("span",{className:"ifd-sr-only",children:v}),jsx("span",{className:"ifd-type-label","aria-hidden":"true",children:v})]}),jsx("span",{className:"ifd-row-message",title:e.message,children:e.message}),jsx("span",{className:"ifd-row-path",title:r,children:r}),jsx("span",{className:"ifd-row-author",title:e.authorName,children:e.authorName}),e.screenshotUrl?jsx("span",{className:"ifd-row-camera",role:"img","aria-label":p("drawer.screenshotAlt"),children:jsx(yn,{})}):null,jsx("time",{className:"ifd-row-time",dateTime:e.createdAt.toISOString(),title:st(e.createdAt,l),children:at(e.createdAt,p)})]})}var $r=200;function Hn({state:e}){let{t}=y(),n=useId(),a=useRef(null),s=useRef(new Map),c=r=>`${n}${r}`;useEffect(()=>{e.focusedId&&s.current.get(e.focusedId)?.scrollIntoView({block:"nearest"});},[e.focusedId]);let o=useRef(e.items),[p,l]=useState([]);useEffect(()=>{let r=o.current;o.current=e.items;let f=new Set(e.items.map(F=>F.id)),m=r.filter(F=>!f.has(F.id));if(!(m.length>0&&m.length<=2&&r.length-m.length===e.items.length)){l(F=>F.length>0?[]:F);return}l(m.map(F=>({record:F,index:r.findIndex(A=>A.id===F.id)})));let P=setTimeout(()=>l([]),$r);return ()=>clearTimeout(P)},[e.items]);let u=e.items.map(r=>({record:r,ghost:false})),v=new Set(e.items.map(r=>r.id));for(let r of p)v.has(r.record.id)||u.splice(Math.min(Math.max(r.index,0),u.length),0,{record:r.record,ghost:true});return jsx("div",{ref:a,className:"ifd-list",role:"listbox",tabIndex:0,"aria-label":t("inbox.listLabel"),"aria-activedescendant":e.focusedId?c(e.focusedId):void 0,"aria-busy":e.loading||void 0,children:u.map(({record:r,ghost:f})=>jsx(jn,{record:r,domId:c(r.id),focused:!f&&e.focusedId===r.id,selected:!f&&e.openedId===r.id,leaving:f,onSelect:()=>{e.focus(r.id),e.openFeedback(r.id),a.current?.focus();},refCallback:m=>{m?s.current.set(r.id,m):s.current.delete(r.id);}},r.id))})}var Gr='a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';function Wn({onClose:e}){let{t}=y(),n=useRef(null);useEffect(()=>{let c=document.activeElement instanceof HTMLElement?document.activeElement:null;return n.current?.focus(),()=>{c?.isConnected&&c.focus();}},[]);let a=c=>{if(c.key==="Escape"){c.preventDefault(),c.stopPropagation(),e();return}if(c.key!=="Tab")return;let o=n.current;if(!o)return;let p=o.querySelectorAll(Gr),l=p[0],u=p[p.length-1];if(!l||!u){c.preventDefault();return}c.shiftKey&&(document.activeElement===l||document.activeElement===o)?(c.preventDefault(),u.focus()):!c.shiftKey&&document.activeElement===u&&(c.preventDefault(),l.focus());},s=[{keys:["j","k"],label:t("hints.navigate")},{keys:["\u23CE"],label:t("hints.open")},{keys:["e"],label:t("hints.resolve")},{keys:["p"],label:t("hints.inProgress")},{keys:["x"],label:t("hints.wontFix")},{keys:["u"],label:t("inbox.undo")},{keys:["r"],label:t("inbox.refresh")},{keys:["/"],label:t("inbox.searchAria")},{keys:["1\u20135"],label:t("inbox.statusFilter")},{keys:["?"],label:t("hints.help")},{keys:["Esc"],label:t("shortcuts.close")}];return jsx("div",{ref:n,className:"ifd-shortcuts",role:"dialog","aria-modal":"true","aria-label":t("shortcuts.title"),tabIndex:-1,onClick:c=>{c.target===c.currentTarget&&e();},onKeyDown:a,children:jsxs("div",{className:"ifd-shortcuts-card",children:[jsx("div",{className:"ifd-meta-label",children:t("shortcuts.title")}),jsx("div",{className:"ifd-shortcuts-grid",children:s.map(c=>jsxs(Fragment$1,{children:[jsx("span",{className:"ifd-shortcut-keys",children:c.keys.map(o=>jsx("kbd",{className:"ifd-kbd",children:o},o))}),jsx("span",{className:"ifd-shortcut-label",children:c.label})]},c.label+c.keys.join()))})]})})}var Yr=[0,1,2,3,4],Qr=[0,1,2];function Vn(){return jsx("div",{className:"ifd-skeleton","aria-hidden":"true",children:Yr.map(e=>jsx("div",{className:"ifd-skel-row",children:Qr.map(t=>jsx("div",{className:"ifd-skel-bar"},t))},e))})}var Zr=5e3;function Yn({toast:e,onUndo:t,onDismiss:n}){let{t:a,focusList:s}=y(),[c,o]=useState(false),p=e?.id;return useEffect(()=>{o(false);},[p]),useEffect(()=>{if(!e||c)return;let l=setTimeout(n,Zr);return ()=>clearTimeout(l)},[e,c,n]),jsx("div",{className:"ifd-toast-region",role:"status","aria-live":"polite",children:e?jsxs("div",{className:"ifd-toast",onMouseEnter:()=>o(true),onMouseLeave:()=>o(false),onFocus:()=>o(true),onBlur:()=>o(false),children:[jsx("span",{className:"ifd-toast-msg",children:e.message}),e.undoable?jsxs("button",{type:"button",className:"ifd-btn-ghost",onClick:()=>{t(),s();},children:[a("inbox.undo")," ",jsx("kbd",{className:"ifd-kbd",children:"u"})]}):null]}):null})}function Qn({projects:e,project:t,onChange:n}){let{t:a}=y();return jsxs("div",{className:"ifd-project",children:[jsx("select",{className:"ifd-project-select","aria-label":a("inbox.project"),value:t,onChange:s=>n(s.target.value),children:e.map(s=>jsx("option",{value:s,children:s},s))}),jsx(bt,{})]})}function Xn({value:e,onChange:t,inputRef:n}){let{t:a}=y();return jsxs("div",{className:"ifd-search",children:[jsx(pt,{}),jsx("input",{ref:n,className:"ifd-search-input",type:"search",placeholder:a("inbox.searchPlaceholder"),"aria-label":a("inbox.searchAria"),value:e,onChange:s=>t(s.target.value)}),e?jsx("button",{type:"button",className:"ifd-search-clear","aria-label":a("inbox.clearSearch"),onClick:()=>{t(""),n.current?.focus();},children:jsx(mt,{})}):jsx("kbd",{className:"ifd-kbd",children:"/"})]})}var Ge=["all","open","in_progress","resolved","wont_fix"];function Zn({status:e,counts:t,onChange:n}){let{t:a}=y(),s=useRef([]),c=o=>{let p=Ge.indexOf(e),l=null;if(o.key==="ArrowRight"?l=Math.min(p+1,Ge.length-1):o.key==="ArrowLeft"?l=Math.max(p-1,0):o.key==="Home"?l=0:o.key==="End"&&(l=Ge.length-1),l===null||l===p)return;o.preventDefault(),o.stopPropagation();let u=Ge[l];u&&(n(u),s.current[l]?.focus());};return jsx("div",{className:"ifd-tabs",role:"radiogroup","aria-label":a("inbox.statusFilter"),onKeyDown:c,children:Ge.map((o,p)=>{let l=o===e,u=t[o],v=ue(o,a),r=o==="all"?null:Re[o];return jsxs("button",{ref:f=>{s.current[p]=f;},type:"button",role:"radio",className:"ifd-tab","data-status":o,"aria-checked":l,"aria-label":u===void 0?v:`${v} (${u})`,tabIndex:l?0:-1,onClick:()=>n(o),children:[r?jsx("span",{className:"ifd-tab-glyph",children:jsx(r,{})}):null,jsx("span",{className:"ifd-tab-label",children:v}),jsx("span",{className:"ifd-tab-count",children:u??"\u2014"})]},o)})})}function er({type:e,onChange:t}){let{t:n}=y();return jsxs("select",{className:"ifd-type-filter","aria-label":n("inbox.typeFilter"),value:e,onChange:a=>t(a.target.value),children:[jsx("option",{value:"all",children:n("inbox.typeAll")}),nt.map(a=>jsx("option",{value:a,children:Te(a,n)},a))]})}function tr({state:e,searchRef:t}){let{t:n}=y();return jsxs("div",{className:"ifd-toolbar",children:[e.projects.length>1?jsx(Qn,{projects:e.projects,project:e.project,onChange:e.setProject}):null,jsx(Zn,{status:e.status,counts:e.counts,onChange:e.setStatus}),jsx("div",{className:"ifd-toolbar-spacer"}),jsx(er,{type:e.type,onChange:e.setType}),jsx(Xn,{value:e.search,onChange:e.setSearch,inputRef:t}),jsx("button",{type:"button",className:`ifd-icon-btn ifd-refresh${e.loading?" ifd-spin":""}`,"aria-label":n("inbox.refresh"),onClick:()=>{e.refresh();},children:jsx(hn,{})})]})}var ao=960;function so(e,t){return t.toLowerCase().startsWith("de")?e:e.toLocaleLowerCase(t)}function co(e){let{accentColor:t,theme:n="auto",density:a="comfortable",locale:s="ko",className:c,deepLinkParam:o="instafix",emptyState:p,onError:l}=e,[u,v]=useState(0);useEffect(()=>{if(s.toLowerCase().startsWith("en")||s.toLowerCase().startsWith("ko"))return;let b=false;return Xt(s).then(k=>{!b&&k&&v($=>$+1);}).catch(()=>{}),()=>{b=true;}},[s]);let r=useMemo(()=>Zt(s),[s,u]),f=useRef(0),[m,q]=useState(null),P=useCallback((b,k)=>{f.current+=1,q({id:f.current,message:b,undoable:k});},[]),F=useCallback(()=>q(null),[]),A=useCallback(b=>P(b,false),[P]),g=useRef(false),I=useRef(false),Z=useCallback(b=>{g.current&&!I.current&&(I.current=true,P(r("inbox.actionFailed"),false)),l?.(b);},[l,P,r]),d=Ot({...e,onError:Z}),ie=useCallback(async b=>{g.current=true,I.current=false;try{await b();}catch{I.current||P(r("inbox.actionFailed"),false),I.current=true;}finally{g.current=false;}return !I.current},[P,r]),_e=useCallback(async(b,k)=>{if(await ie(()=>d.changeStatus(b,k))){let W=so(ue(k,r),s);P(Y(r,"inbox.markedAs",{status:W}),true);}},[ie,d,P,r,s]),ce=useCallback(async b=>{d.closeFeedback(),await ie(()=>d.deleteFeedback(b))&&P(r("inbox.deleted"),false);},[ie,d,P,r]),he=useCallback(async()=>{F(),await ie(()=>d.undo());},[F,ie,d]);useInsertionEffect(()=>{sn();},[]);let[ve,Ne]=useState(()=>At(n));useEffect(()=>{if(n==="auto")return Ne(At("auto")),ln(Ne)},[n]);let Ke=n==="auto"?ve:n,Qe=useMemo(()=>({"--ifd-accent":cn(t??"#0066ff")}),[t]),me=useRef(null),[ye,je]=useState(false);useEffect(()=>{let b=me.current;if(!b||typeof ResizeObserver>"u")return;let k=new ResizeObserver($=>{let W=$[0]?.contentRect.width??b.clientWidth;je(W>=ao);});return k.observe(b),()=>k.disconnect()},[]);let be=useCallback(()=>{me.current?.querySelector(".ifd-list")?.focus();},[]),[Xe,ze]=useState(""),Ce=useRef(d.loading);useEffect(()=>{Ce.current&&!d.loading&&ze(Y(r,"inbox.resultsCount",{count:d.total??d.items.length})),Ce.current=d.loading;},[d.loading,d.total,d.items.length,r]);let H=useRef(null),[J,ae]=useState(false),ge=useCallback((b,k)=>{if(!k)return;let $=d.items.find(W=>W.id===k)??(d.opened?.id===k?d.opened:null);$&&_e(k,$.status===b?"open":b);},[d,_e]),Ae=useCallback(b=>{if(b.ctrlKey||b.metaKey||b.altKey)return;let k=b.target instanceof HTMLElement?b.target:null,$=k instanceof HTMLInputElement||k instanceof HTMLTextAreaElement||k instanceof HTMLSelectElement;if(b.key==="Escape"){if(k&&k===H.current){d.search?d.setSearch(""):(H.current?.blur(),be()),b.preventDefault();return}if(d.openedId)d.closeFeedback(),be();else if(J)ae(false);else return;b.preventDefault();return}if($)return;let W=d.openedId!==null&&!ye,M=W?d.openedId:d.focusedId??d.openedId;switch(b.key){case "j":case "ArrowDown":if(W)return;d.focusNext();break;case "k":case "ArrowUp":if(W)return;d.focusPrev();break;case "Enter":{if(k?.closest("button, a, [role='button'], summary")||!M)return;if(d.openedId===M){let ke=d.items.find(Je=>Je.id===M)??d.opened,Ze=ke?ct(ke,o):null;Ze&&window.open(Ze,"_blank","noopener");}else d.openFeedback(M);break}case "o":if(!d.focusedId)return;d.openFeedback(d.focusedId);break;case "e":ge("resolved",M);break;case "p":ge("in_progress",M);break;case "x":ge("wont_fix",M);break;case "r":d.refresh();break;case "u":if(!d.pendingUndo)return;he();break;case "/":H.current?.focus();break;case "?":ae(ke=>!ke);break;case "1":d.setStatus("all");break;case "2":d.setStatus("open");break;case "3":d.setStatus("in_progress");break;case "4":d.setStatus("resolved");break;case "5":d.setStatus("wont_fix");break;default:return}b.preventDefault();},[d,J,ge,he,o,ye,be]),T=useMemo(()=>({t:r,locale:s,notify:A,focusList:be}),[r,s,A,be]),le=d.view==="loading",_=d.view==="error",xe=d.view==="empty",we=d.total!==null?Math.max(0,d.total-d.items.length):0;return jsx(En,{value:T,children:jsxs("section",{ref:me,className:c?`ifd-root ${c}`:"ifd-root",style:Qe,"data-theme":Ke,"data-density":a,lang:s,"aria-label":r("inbox.regionLabel"),onKeyDown:Ae,children:[jsx(tr,{state:d,searchRef:H}),jsxs("div",{className:"ifd-body",children:[jsx("div",{className:"ifd-list-pane",children:le?jsx(Vn,{}):_&&d.error?jsx(_n,{error:d.error,onRetry:()=>{d.refresh();}}):xe?jsx(Un,{state:d,custom:p}):jsxs(Fragment,{children:[jsx(Hn,{state:d}),d.hasMore?jsx("div",{className:"ifd-loadmore",children:jsx("button",{type:"button",className:"ifd-btn-ghost",disabled:d.loadingMore,onClick:()=>{d.loadMore();},children:Y(r,"inbox.loadMore",{count:we})})}):null]})}),d.opened?jsx(On,{record:d.opened,overlay:!ye,deepLinkParam:o,onClose:d.closeFeedback,onChangeStatus:(b,k)=>{_e(b,k);},onDelete:b=>{ce(b);}},d.opened.id):null]}),jsxs("div",{className:"ifd-hints","aria-hidden":"true",children:[jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"j"}),jsx("kbd",{className:"ifd-kbd",children:"k"})," ",r("hints.navigate")]}),jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"\u23CE"})," ",r("hints.open")]}),jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"e"})," ",r("hints.resolve")]}),jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"p"})," ",r("hints.inProgress")]}),jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"x"})," ",r("hints.wontFix")]}),jsxs("span",{className:"ifd-hint",children:[jsx("kbd",{className:"ifd-kbd",children:"?"})," ",r("hints.help")]})]}),jsx("div",{className:"ifd-sr-only",role:"status",children:Xe}),jsx(Yn,{toast:m,onUndo:()=>{he();},onDismiss:F}),J?jsx(Wn,{onClose:()=>ae(false)}):null]})})}export{te as FEEDBACK_STATUSES,nt as FEEDBACK_TYPES,co as InstaFixInbox,Dt as createEndpointSource,Lt as createStoreSource,He as isClosedStatus,hr as registerLocale,Ot as useInstaFixInbox};//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map