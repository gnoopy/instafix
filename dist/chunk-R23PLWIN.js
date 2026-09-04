import {a}from'./chunk-QV2WRJKK.js';var Ne='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';function j(t){return t.tagName==="INSTAFIX-WIDGET"||t.closest("instafix-widget")!==null||t.closest('[data-instafix-ignore="true"]')!==null||t.closest("#instafix-markers")!==null||t.closest("#sp-tooltip")!==null}function Ns(t){let e=null,n=s=>{let r=s.target;r instanceof HTMLElement&&(r===document.body||r===document.documentElement||r===t||j(r)||(e=r));};return document.addEventListener("focusin",n),{getLastPageFocus(){return e&&!e.isConnected&&(e=null),e},destroy(){document.removeEventListener("focusin",n),e=null;}}}function b(t){let s=document.createRange().createContextualFragment(t).firstElementChild;if(s?.nodeName.toLowerCase()!=="svg")throw new Error("[instafix] Invalid SVG string");for(let r of [...s.attributes])r.name.startsWith("on")&&s.removeAttribute(r.name);for(let r of s.querySelectorAll("*"))for(let o of [...r.attributes])o.name.startsWith("on")&&r.removeAttribute(o.name);return s}function l(t,e){let n=document.createElement(t);if(e)for(let[s,r]of Object.entries(e))s==="class"?n.className=r:s==="style"?n.style.cssText=r:n.setAttribute(s,r);return n}function d(t,e){t.textContent=e;}function ie(t){let e=Array.from(t.childNodes).map(n=>n.cloneNode(true));return t.disabled=true,t.replaceChildren(l("div",{class:"sp-spinner sp-spinner--sm"})),()=>{t.replaceChildren(...e),t.disabled=false;}}function _s(t,e="en"){let n=Date.now()-new Date(t).getTime(),s=Math.floor(n/1e3);if(s<60)return new Intl.RelativeTimeFormat(e,{numeric:"auto"}).format(0,"second");let r=new Intl.RelativeTimeFormat(e,{numeric:"always",style:"narrow"}),o=Math.floor(s/60);if(o<60)return r.format(-o,"minute");let i=Math.floor(o/60);if(i<24)return r.format(-i,"hour");let a=Math.floor(i/24);return a<7?r.format(-a,"day"):new Date(t).toLocaleDateString(e)}function Oe(t){return typeof t=="object"&&t!==null}function Dt(t,e){return Oe(t)&&e in t}var ae=["en","ko","fr","de","es","it","pt","ru"],le="instafix_settings";var Ht=["open","in_progress","resolved","wont_fix"],_e=["resolved","wont_fix"];function T(t){return _e.includes(t)}function $t(t,e=new Date,n,s){return T(t)?{status:t,resolvedAt:e,message:n,annotations:s}:{status:t,resolvedAt:null,message:n,annotations:s}}function jt(t){return {cssSelector:t.anchor.cssSelector,xpath:t.anchor.xpath,textSnippet:t.anchor.textSnippet,elementTag:t.anchor.elementTag,elementId:t.anchor.elementId,textPrefix:t.anchor.textPrefix,textSuffix:t.anchor.textSuffix,fingerprint:t.anchor.fingerprint,neighborText:t.anchor.neighborText,anchorKey:t.anchor.anchorKey??null,xPct:t.rect.xPct,yPct:t.rect.yPct,wPct:t.rect.wPct,hPct:t.rect.hPct,scrollX:t.scrollX,scrollY:t.scrollY,viewportW:t.viewportW,viewportH:t.viewportH,devicePixelRatio:t.devicePixelRatio,target:t.target??null,inspect:t.inspect??null}}function O(t){return t.target??{kind:"element"}}var I=300,Kt=4e3,ce=200,zt=20;function L(t,e){return t.length<=e?t:`${t.slice(0,e)}\u2026`}function F(t){let e=L(t,I),s=(e.match(/`+/g)??[]).reduce((a,c)=>Math.max(a,c.length),0),r="`".repeat(s+1),i=e.startsWith("`")||e.endsWith("`")||e.length===0?" ":"";return `${r}${i}${e}${i}${r}`}function R(t,e=60){return L(t,e).replace(/"/g,"'").replace(/[\r\n]+/g," ")}function Ut(t){return L(t,Kt).split(/\r\n|\r|\n/).map(s=>s.length===0?">":`> ${s}`).join(`
`)}function je(t){let e=O(t),n=t.elementTag.toLowerCase();switch(e.kind){case "text":return `text in ${F(n)}`;case "area":return "area (no element \u2014 page region)";default:{let s=t.textSnippet.trim()||(t.elementId?`#${t.elementId}`:"");return s?`element ${F(n)} "${R(s)}"`:`element ${F(n)}`}}}function Ke(t){let e=O(t);if(e.kind!=="text")return null;let n=L(e.quote.trim(),I);if(!n)return null;let s=R(e.quotePrefix,32),r=R(e.quoteSuffix,32);return `Quote: "${s}[${R(n,200)}]${r}"`}function ze(t){if(O(t).kind==="area")return [];let n=[];return t.anchorKey&&n.push(`semantic: ${F(t.anchorKey)}`),t.elementId&&n.push(`id: ${F(`#${t.elementId}`)}`),t.cssSelector&&n.push(`css: ${F(t.cssSelector)}`),t.xpath&&n.push(`xpath: ${F(t.xpath)}`),n}function Ue(t){let e=[];t.neighborText.trim()&&e.push(`nearby text: "${R(t.neighborText,I)}"`);let n=t.textPrefix.trim(),s=t.textSuffix.trim();return (n||s)&&e.push(`surrounding text: "${R(n,80)}[\u2026]${R(s,80)}"`),e.length>0?e.join("; "):null}function Ge(t){let e=O(t),n=r=>`${Math.round(r*100)}%`,s=e.kind==="area"?"viewport":"target element";return `x=${n(t.xPct)} y=${n(t.yPct)} w=${n(t.wPct)} h=${n(t.hPct)} (relative to ${s})`}function We(t){let e=t.inspect;if(!e)return [];let n=[];e.component&&n.push(`Component: ${e.component}`),e.domPath.length>0&&n.push(`DOM path: ${e.domPath.join(" > ")}`);let s=Object.entries(e.styles);return s.length>0&&n.push(`Computed: ${s.map(([r,o])=>`${r}: ${o};`).join(" ")}`),n}function Gt(t,e){t.push(`Target: ${je(e)}`);let n=Ke(e);n&&t.push(n);let s=ze(e);if(s.length>0){t.push("Selectors:");for(let o of s)t.push(`- ${o}`);}let r=Ue(e);r&&t.push(`Context: ${r}`);for(let o of We(e))t.push(o);t.push(`Bounds: ${Ge(e)}`);}function Wt(t,e){let n=e.slice(0,zt);t.push(`Targets (${e.length}):`),n.forEach((s,r)=>{t.push(`${r+1}. ${je(s)}`);let o=Ke(s);o&&t.push(`   ${o}`);let i=ze(s);for(let c of i)t.push(`   - ${c}`);let a=Ue(s);a&&t.push(`   Context: ${a}`);for(let c of We(s))t.push(`   ${c}`);t.push(`   Bounds: ${Ge(s)}`);}),e.length>n.length&&t.push(`(${e.length-n.length} more target(s) omitted)`);}function De(t){if(!t.viewport)return null;let e=L(t.viewport,I),n=t.annotations[0]?.devicePixelRatio;return n&&n!==1?`${e} @${n}x`:e}function He(t){return L(t.url,I)}function Vt(t){if(!t.screenshotUrl||t.screenshotUrl.startsWith("data:"))return null;let e=/^\/api\/instafix\/screenshots\/(.+)$/.exec(t.screenshotUrl),n=e?`.instafix/screenshots/${e[1]}`:L(t.screenshotUrl,I);return `Screenshot: ${F(n)}`}function Yt(t){let e=t.diagnostics;if(!e)return [];let n=[],s=e.console.filter(r=>r.level==="error"||r.level==="warn");if(s.length>0){let r=s.slice(-10);n.push("Console errors/warnings (most recent last):"),n.push("```");for(let o of r)n.push(`[${o.level}] ${L(o.message,I)}`);n.push("```");}if(e.network.length>0){let r=e.network.slice(-10);n.push("Failed network requests:");for(let o of r){let i=o.status===0?"network error":`HTTP ${o.status}`;n.push(`- ${o.method} ${F(o.url)} \u2014 ${i} (${o.durationMs}ms)`);}}return n}function Xt(t,e,n){let s=t.annotations[0],r=s?.textSnippet.trim(),o=r?L(r,40):s?.elementTag.toLowerCase()??t.type,i=t.annotations.length>1?` (+${t.annotations.length-1} more)`:"",a=n?`  (ID: ${R(t.id,60)})`:"";return `${e}. ${o}${i}${a}`}var qt=["Review each request against the current code before making any change.","If a target is ambiguous or you can't find it in the code, report that instead of guessing.","Run the relevant tests after implementing each change."];function de(t,e={}){let n=e.title??"UI change requests",s=e.instructions??qt,r=e.includeResolveProtocol!==false,o=t.slice(0,ce),i=[`# ${n}`,""];for(let p of s)i.push(`- ${p}`);if(i.push(""),o.length===0)return i.push("(no items)"),`${i.join(`
`)}
`;let c=new Set(o.map(p=>p.url)).size===1;if(c){i.push(`Page: ${He(o[0])}`);let p=De(o[0]);p&&i.push(`Viewport: ${p}`),i.push("");}return o.forEach((p,u)=>{if(i.push(`## ${Xt(p,u+1,r)}`),!c){i.push(`Page: ${He(p)}`);let h=De(p);h&&i.push(`Viewport: ${h}`);}i.push("Request (verbatim):"),i.push(Ut(p.message)),p.annotations.length===0?i.push("Target: (no anchor captured)"):p.annotations.length===1?Gt(i,p.annotations[0]):Wt(i,p.annotations);let g=Vt(p);g&&i.push(g),i.push(...Yt(p)),i.push("");}),t.length>ce&&(i.push(`(${t.length-ce} more item(s) omitted \u2014 copy a smaller selection)`),i.push("")),r&&o.length>0&&(i.push("---"),i.push("When a request is FIXED and verified, close it by its ID:"),i.push(""),i.push("    npx @instafix/cli resolve <ID>"),i.push(""),i.push('(or PATCH the feedback API for that ID with {"status":"resolved"})'),i.push("")),`${i.join(`
`).trimEnd()}
`}var P=class extends Error{code;retryable;constructor(e,n,s){super(e),this.code=n,this.retryable=s,this.name="InstaFixError";}},K=class extends P{constructor(e){super(e,"NETWORK",true),this.name="InstaFixNetworkError";}},Y=class extends P{constructor(e){super(e,"VALIDATION",false),this.name="InstaFixValidationError";}},X=class extends P{constructor(e){super(e,"AUTH",false),this.name="InstaFixAuthError";}};function pe(t){return (t.split("-")[0]??t).toLowerCase()}function ue(t,e){let n={en:t};function s(r){return r!=="en"&&ae.includes(r)}return {registerLocale(r,o){n[pe(r)]=o;},async loadLocale(r){let o=pe(r),i=n[o];if(i)return i;if(!s(o))return null;let a=await e[o]();return n[o]=a,a},createT(r){let o=pe(r);return o!=="en"&&!n[o]&&!s(o)&&console.warn(`[instafix] Unknown locale "${r}", falling back to "en"`),i=>n[o]?.[i]??t[i]??i}}}function ge(t,e){return t.replace(/\{(\w+)\}/g,(n,s)=>{let r=e[s];return r===void 0?n:String(r)})}function he(t,e,n){return ge(t(e),n)}function Qt(t){let e=new URLSearchParams({projectName:t.projectName});return t.page&&e.set("page",String(t.page)),t.limit&&e.set("limit",String(t.limit)),t.type&&e.set("type",t.type),t.status&&e.set("status",t.status),t.statuses?.length&&e.set("statuses",t.statuses.join(",")),t.search&&e.set("search",t.search),t.url&&e.set("url",t.url),t.urlPattern&&e.set("urlPattern",t.urlPattern),e}async function Zt(t,e){let n=await t.text().catch(()=>"Unknown error"),s=n?`${t.status} ${n}`:`${t.status}`,r=`${e}: ${s}`;return t.status===401||t.status===403?new X(r):t.status>=400&&t.status<500?new Y(r):new P(r,"SERVER",false)}function Jt(t,e){if(t instanceof K)return t;let n=t instanceof Error?t.message:String(t);return new K(`${e}: ${n}`)}var Ve={"panel.title":"Fix notes","panel.ariaLabel":"InstaFix fix note panel","panel.feedbackList":"Fix note list","panel.loading":"Loading fix notes","panel.close":"Close panel","panel.deleteAll":"Delete all","panel.deleteAllConfirmTitle":"Delete all","panel.deleteAllConfirmMessage":"Delete all fix notes for this project? This action cannot be undone.","panel.deleteConfirmTitle":"Delete fix note","panel.deleteConfirmMessage":"Delete this fix note? This action cannot be undone.","panel.deleteConfirmBulkMessage":"Delete {count} fix note(s)? This action cannot be undone.","panel.search":"Search...","panel.searchAria":"Search fix notes","panel.filterAll":"All","panel.loadError":"Failed to load","panel.retry":"Retry","panel.empty":"No fix notes yet","panel.showMore":"Show more","panel.showLess":"Show less","panel.resolve":"Resolve","panel.reopen":"Reopen","panel.delete":"Delete","panel.cancel":"Cancel","panel.confirmDelete":"Delete","panel.loadMore":"Load more ({remaining} remaining)","panel.openDashboard":"Open dashboard","panel.statusAll":"All","panel.statusOpen":"Open","panel.statusResolved":"Resolved","panel.statusInProgress":"In progress","panel.statusWontFix":"Won't fix","type.label":"Type","type.question":"Question","type.change":"Change","type.bug":"Bug","type.other":"Other","status.label":"Status","scope.label":"Scope","scope.thisPage":"This page","scope.thisType":"This type","scope.all":"All pages","fab.hideTools":"Hide tools","fab.showTools":"Show tools","fab.messages":"Show sidebar","fab.annotate":"Select area","fab.targeting":"Auto-target an element","fab.annotations":"Show or hide markers","fab.freeze":"Freeze the page","fab.unfreeze":"Unfreeze the page","fab.moveLeft":"Move toolbar to the left","fab.moveRight":"Move toolbar to the right","annotator.instruction":"Draw a rectangle on the area to comment \u2014 or press Enter to comment on the last focused element","annotator.instantInstruction":"Comment on the clicked spot","annotator.cancel":"Cancel","annotator.selectionCount":"{count} selected \u2014 drag again to add, or release without Shift to finish","popup.ariaLabel":"Fix note form","popup.placeholder":"Describe your fix note...","popup.textareaAria":"Fix note message","popup.submitHintMac":"\u2318+Enter to send","popup.submitHintOther":"Ctrl+Enter to send","popup.cancel":"Cancel","popup.submit":"Send","popup.draftRestored":"Draft restored","popup.discardDraft":"Discard","popup.clearMessage":"Clear note","popup.undoClear":"Undo clear","popup.redoClear":"Redo clear","popup.copyContext":"Copy prompt","popup.copyContextCopied":"Copied","popup.copyContextFailed":"Copy failed","identity.title":"Identify yourself","identity.nameLabel":"Name","identity.namePlaceholder":"Your name","identity.emailLabel":"Email","identity.emailPlaceholder":"your@email.com","identity.cancel":"Cancel","identity.submit":"Continue","marker.approximate":"Approximate position (confidence: {confidence}%)","marker.aria":"Fix note #{number}: {type} \u2014 {message}","marker.count":"{count} fix note markers displayed","fab.badge":"{count} unresolved fix notes","feedback.sent.confirmation":"Fix note sent successfully","feedback.error.message":"Failed to send fix note","feedback.deleted.confirmation":"Fix note deleted","badge.count":"{count} unresolved fix notes","bulk.selectAll":"Select all","bulk.selected":"{count} selected","bulk.resolve":"Resolve","bulk.delete":"Delete","bulk.deselect":"Deselect","sort.newest":"Newest first","sort.oldest":"Oldest first","sort.byType":"By type","sort.openFirst":"Open first","sort.label":"Sort","group.byPage":"By page","group.feedbacks":"{count} fix notes","stats.open":"Open","stats.resolved":"Resolved","stats.bugs":"Bugs","stats.progress":"{percent}% resolved","detail.back":"Back","detail.title":"Fix note #{number}","detail.status":"Status","detail.message":"Message","detail.editMessage":"Edit message","detail.saveMessage":"Save","detail.screenshot":"Screenshot","detail.screenshotAlt":"Screenshot of the annotated area","detail.metadata":"Details","detail.annotation":"Annotation","detail.page":"Page","detail.author":"Author","detail.date":"Created","detail.viewport":"Viewport","detail.browser":"Browser","detail.resolvedAt":"Resolved at","detail.closedAt":"Closed at","detail.goToAnnotation":"Go to annotation","detail.element":"Element","detail.selector":"Selector","detail.position":"Position","detail.targetFound":"Target found","detail.targetApproximate":"Approximate match ({confidence}% confidence)","detail.targetNotFound":"Target not found \u2014 reconnect below","detail.reconnect":"Reconnect","detail.reconnectPicking":"Click the element on the page\u2026","detail.reconnectCancel":"Cancel","detail.resolve":"Resolve","detail.reopen":"Reopen","detail.delete":"Delete","detail.diagnostics":"Diagnostics","detail.diagnostics.console":"Console","detail.diagnostics.network":"Failed network","detail.diagnostics.expand":"Show diagnostics","detail.diagnostics.collapse":"Hide diagnostics","detail.diagnostics.noEntries":"No entries","shortcuts.title":"Keyboard shortcuts","shortcuts.navigate":"Navigate fix notes","shortcuts.resolve":"Resolve / Reopen","shortcuts.delete":"Delete","shortcuts.search":"Focus search","shortcuts.select":"Toggle selection","shortcuts.help":"Show shortcuts","shortcuts.close":"Close","shortcuts.hint":"Keyboard shortcuts","export.label":"Export","export.xlsx":"Export Excel","export.json":"Export JSON","export.failedHint":"Export failed \u2014 please try again","agent.copyButton":"Copy Prompt","agent.scopeSelected":"Selected {count} item(s)","agent.scopeOpenPage":"All open items on this page","agent.scopeOpenTemplate":"All open items on this type of page","agent.scopeOpenAll":"All open items across every page (batch)","agent.handedOff":"Handed off","agent.handedOffTitle":"This item's prompt was already handed to an agent","agent.sendToAgent":"To agent","agent.sendToAgentFailed":"Handoff failed \u2014 the server doesn't support it","panel.deletedToast":"Deleted","panel.deleteUndo":"Undo","detail.verifyFix":"Verify fix","detail.verifyThen":"As captured","detail.verifyNow":"Go to live view","detail.verifyKeepResolved":"Looks fixed","detail.verifyReopen":"Reopen","shortcuts.globalSection":"Global (anywhere on the page)","shortcuts.globalPanel":"Open fix note panel","shortcuts.globalAnnotate":"Draw annotation","shortcuts.globalTargeting":"Auto-select element","shortcuts.globalMarkers":"Toggle markers","agent.previewTitle":"Copy {count} item(s) as a prompt","agent.previewEmpty":"Nothing to copy yet","agent.copyAction":"Copy","agent.cancel":"Cancel","agent.copiedToast":"Copied {count} item(s) to clipboard","agent.copyFailedHint":"Automatic copy failed \u2014 select the text below and copy it manually","agent.previewAria":"Markdown preview for the coding agent","detail.copyForAgent":"Copy Prompt","voice.micLabel":"Use voice input","voice.micLabelListening":"Stop voice input","voice.state.requestingPermission":"Requesting microphone access\u2026","voice.state.listening":"Listening\u2026","voice.state.processing":"Processing\u2026","voice.state.unsupported":"Voice input isn't supported in this browser","voice.error.permissionDenied":"Microphone access denied","voice.error.noSpeech":"No speech detected","voice.error.audioCapture":"Microphone unavailable","voice.error.network":"Network error \u2014 try again","voice.error.aborted":"Voice input stopped","voice.error.unknown":"Voice input failed","voice.consent":"Voice uses your browser's speech recognition \u2014 audio may be processed by your browser or OS.","onboarding.step1Title":"Your tools are ready","onboarding.step1Body":"The icons next to the InstaFix button are always there \u2014 no need to click it first.","onboarding.step2Title":"Select anything","onboarding.step2Body":"Choose Annotate, then click or drag on the page to mark what you want to talk about.","onboarding.step3Title":"Copy for your AI","onboarding.step3Body":'Write or dictate a note, then use "Copy Prompt" to paste ready-made context into your coding assistant.',"onboarding.next":"Next","onboarding.done":"Got it","onboarding.skip":"Skip","onboarding.progress":"{current}/{total}","popup.targetLabel":"Commenting on","popup.targetElement":"Element","popup.targetContainer":"Container","popup.legendLabel":"Numbered targets","annotator.targetBadgeAria":"Target {number}","annotator.targetPreviewAlwaysShow":"Always show outlines","annotator.resolutionLabel":"Showing","annotator.resolutionSummary":"Summary","annotator.resolutionDetail":"Detail","settings.title":"Settings","settings.theme":"Theme","settings.themeLight":"Light","settings.themeDark":"Dark","settings.themeAuto":"Auto","settings.locale":"Language","settings.position":"Position","settings.positionRight":"Right","settings.positionLeft":"Left","settings.accentColor":"Accent color","settings.screenshots":"Screenshots","settings.diagnostics":"Diagnostics"};var q=ue(Ve,{de:()=>import('./de-M6JRZA5S.js').then(t=>t.de),es:()=>import('./es-CVDIYJGB.js').then(t=>t.es),fr:()=>import('./fr-OCQIKSWY.js').then(t=>t.fr),it:()=>import('./it-SMGOXHYT.js').then(t=>t.it),ko:()=>import('./ko-F4E6AAJL.js').then(t=>t.ko),pt:()=>import('./pt-BFDMOEFO.js').then(t=>t.pt),ru:()=>import('./ru-VNT7NHUI.js').then(t=>t.ru)});q.registerLocale("ko",a);var br=q.loadLocale,mr=q.createT,A=he;function xr(t,e){switch(t){case "question":return e("type.question");case "change":return e("type.change");case "bug":return e("type.bug");case "other":return e("type.other");default:return t}}function Ye(t,e){switch(t){case "open":return e("panel.statusOpen");case "in_progress":return e("panel.statusInProgress");case "resolved":return e("panel.statusResolved");case "wont_fix":return e("panel.statusWontFix");default:return t}}var yr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/></svg>',Xe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',kr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',wr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',Cr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',Er='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',qe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',Sr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',Tr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',Ar='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M19 9h2"/><path d="M3 9h2"/><path d="M19 13h2"/><path d="M3 13h2"/><path d="M19 17h2"/><path d="M3 17h2"/><path d="M10 2h4"/></svg>',Fr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',Lr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',Rr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>',Qe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',Br='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',Ir='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',Pr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',Mr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';var Nr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.13 1 6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13 16 6a2 2 0 0 1 2 2v15"/></svg>',Or='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',_r='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',Dr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',Hr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>',$r='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',jr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';var en='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',Yr=`
  .sp-agent-btn {
    height: 30px;
    padding: 0 14px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-accent);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .sp-agent-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .sp-agent-btn:hover {
    background: var(--sp-accent-fill, var(--sp-accent));
    color: var(--sp-accent-fg, #fff);
    box-shadow: 0 2px 12px var(--sp-accent-glow);
  }

  .sp-agent-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sp-agent-btn--detail {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    justify-content: center;
    border-radius: var(--sp-radius);
  }

  .sp-agent-modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--sp-backdrop, rgba(15, 23, 42, 0.2));
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${2147483647};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .sp-agent-modal {
    width: min(560px, 92vw);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-radius: 20px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    font-family: var(--sp-font);
    transform: translateY(8px) scale(0.97);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-agent-modal-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sp-text);
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .sp-agent-modal-textarea {
    flex: 1;
    min-height: 220px;
    resize: vertical;
    padding: 12px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg);
    color: var(--sp-text);
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre;
    overflow: auto;
  }

  .sp-agent-modal-hint {
    margin-top: 10px;
    font-size: 12px;
    color: var(--sp-text-tertiary);
    line-height: 1.4;
  }

  .sp-agent-modal-hint--error {
    color: #ef4444;
  }

  .sp-agent-modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .sp-agent-modal-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 0;
  }

  .sp-agent-modal-success-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.14);
    color: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sp-agent-modal-success-icon svg {
    width: 24px;
    height: 24px;
  }

  .sp-agent-modal-success-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--sp-text);
  }

  @media (forced-colors: active) {
    .sp-agent-btn,
    .sp-agent-modal,
    .sp-agent-modal-textarea {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-agent-btn:focus-visible {
      outline: 3px solid Highlight !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sp-agent-modal-backdrop,
    .sp-agent-modal {
      transition-duration: 0.01ms !important;
    }
  }
`;async function tn(t){if(typeof window<"u"&&window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{}try{let e=document.createElement("textarea");e.value=t,e.setAttribute("readonly",""),e.style.cssText="position:fixed;top:-9999px;left:-9999px;opacity:0;",document.body.appendChild(e),e.select(),e.setSelectionRange(0,t.length);let n=document.execCommand("copy");return e.remove(),n}catch{return  false}}var Q=class{constructor(e,n,s){this.options=n;this.t=s;let r=n.variant??"panel";this.element=document.createElement("button"),this.element.type="button",this.element.className=r==="detail"?"sp-agent-btn sp-agent-btn--detail":"sp-agent-btn",this.element.appendChild(b(en));let o=document.createElement("span");d(o,this.t("agent.copyButton")),this.element.appendChild(o),this.element.addEventListener("click",()=>this.open());}options;t;element;modal=null;destroy(){this.modal?.remove(),this.modal=null;}async open(){this.element.disabled=true;let e;try{e=await this.options.getFeedbacks();}finally{this.element.disabled=false;}let n=de(e,this.options.instructions?{instructions:this.options.instructions}:void 0);this.showModal(e.length,n,e.map(s=>s.id));}showModal(e,n,s){this.modal?.remove();let r=l("div",{class:"sp-agent-modal-backdrop"}),o=l("div",{class:"sp-agent-modal"});o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true");let i=`sp-agent-title-${Date.now()}`;o.setAttribute("aria-labelledby",i);let a=l("div",{class:"sp-agent-modal-title"});a.id=i,d(a,e>0?A(this.t,"agent.previewTitle",{count:e}):this.t("agent.previewEmpty")),o.appendChild(a);let c=this.options.getScopeLabel?.();if(c){let y=l("div",{style:"font-size:12px;color:var(--sp-text-tertiary);font-family:var(--sp-font);margin:-6px 0 10px;letter-spacing:0.01em;"});d(y,c),o.appendChild(y);}let p=document.createElement("textarea");p.className="sp-agent-modal-textarea",p.readOnly=true,p.value=n,p.setAttribute("aria-label",this.t("agent.previewAria")),o.appendChild(p);let u=l("div",{class:"sp-agent-modal-hint"});u.setAttribute("role","status"),u.setAttribute("aria-live","polite"),o.appendChild(u);let g=l("div",{class:"sp-agent-modal-actions"}),h=document.createElement("button");h.type="button",h.className="sp-btn-ghost",d(h,this.t("agent.cancel"));let f=document.createElement("button");f.type="button",f.className="sp-btn-danger",f.style.background="var(--sp-accent)",f.style.boxShadow="0 2px 8px var(--sp-accent-glow)",d(f,this.t("agent.copyAction")),f.disabled=e===0;let x=false,m=()=>{x||(x=true,r.removeEventListener("keydown",v),r.style.opacity="0",o.style.transform="translateY(8px) scale(0.97)",setTimeout(()=>r.remove(),200),this.modal===r&&(this.modal=null));};f.addEventListener("click",async()=>{f.disabled=true,await tn(n)?(this.options.onCopied?.(s),this.showSuccess(o,e,m)):(f.disabled=false,d(u,this.t("agent.copyFailedHint")),u.classList.add("sp-agent-modal-hint--error"),p.focus(),p.select());}),h.addEventListener("click",m),r.addEventListener("click",y=>{y.target===r&&m();});let v=y=>{let k=y;if(k.key==="Escape"){m();return}if(k.key==="Tab"){let w=[p,h,f].filter(B=>!("disabled"in B&&B.disabled)),C=w[0],E=w[w.length-1];if(!C||!E)return;let S=r.getRootNode().activeElement;k.shiftKey&&S===C?(k.preventDefault(),E.focus()):!k.shiftKey&&S===E&&(k.preventDefault(),C.focus());}};r.addEventListener("keydown",v),g.appendChild(h),g.appendChild(f),o.appendChild(g),r.appendChild(o),this.options.getContainer().appendChild(r),this.modal=r,requestAnimationFrame(()=>{r.style.opacity="1",o.style.transform="translateY(0) scale(1)",(e>0?f:h).focus();});}showSuccess(e,n,s){e.replaceChildren();let r=l("div",{class:"sp-agent-modal-success"});r.setAttribute("role","status"),r.setAttribute("aria-live","polite");let o=l("div",{class:"sp-agent-modal-success-icon"});o.appendChild(b(qe));let i=l("div",{class:"sp-agent-modal-success-text"});d(i,A(this.t,"agent.copiedToast",{count:n})),r.appendChild(o),r.appendChild(i),e.appendChild(r),setTimeout(s,1400);}};function fe(t,e,n){let s=r=>{let o=r/255;return o<=.03928?o/12.92:((o+.055)/1.055)**2.4};return .2126*s(t)+.7152*s(e)+.0722*s(n)}function nn(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);if(!e)return null;let[,n,s,r,o]=e;return n===void 0||s===void 0||r===void 0?null:{r:Number(n),g:Number(s),b:Number(r),a:o===void 0?1:Number(o)}}var sn=.5;function qr(t,e,n){if(typeof document.elementFromPoint!="function")return null;try{let s=n.style.visibility;n.style.visibility="hidden";let r;try{r=document.elementFromPoint(t,e);}finally{n.style.visibility=s;}if(!r)return null;let o=r;for(;o;){let i=nn(getComputedStyle(o).backgroundColor);if(i&&i.a>.5)return fe(i.r,i.g,i.b)>sn;o=o.parentElement;}return !0}catch{return null}}var Je="#0066ff",rn=/^#[0-9a-fA-F]{6}$/,Ze=/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,on=/^#[0-9a-fA-F]{8}$/;function an(t){if(rn.test(t))return t;let e=Ze.test(t)?t.match(Ze):null;return e?`#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}`:on.test(t)?t.slice(0,7):(console.warn(`[instafix] Invalid accentColor "${t}" \u2014 only hex colors (#RGB, #RRGGBB, #RRGGBBAA) are supported. Using default.`),Je)}function ln(t,e,n){let s=(o,i)=>parseInt(o.slice(i,i+2),16),r=(o,i)=>Math.round(o*(1-n)+i*n);return {r:r(s(t,1),s(e,1)),g:r(s(t,3),s(e,3)),b:r(s(t,5),s(e,5))}}function M(t,e){let n=Math.max(0,Math.round(parseInt(t.slice(1,3),16)*(1-e))),s=Math.max(0,Math.round(parseInt(t.slice(3,5),16)*(1-e))),r=Math.max(0,Math.round(parseInt(t.slice(5,7),16)*(1-e)));return `#${n.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}${r.toString(16).padStart(2,"0")}`}function cn(t,e){let n=i=>{let a=parseInt(t.slice(i,i+2),16);return Math.min(255,Math.round(a+(255-a)*e))},[s,r,o]=[n(1),n(3),n(5)];return `#${s.toString(16).padStart(2,"0")}${r.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}`}function be(t){return fe(parseInt(t.slice(1,3),16),parseInt(t.slice(3,5),16),parseInt(t.slice(5,7),16))}function me(t,e){let n=be(t),s=be(e),[r,o]=n>s?[n,s]:[s,n];return (r+.05)/(o+.05)}var Z="#ffffff",et=4.5;function tt(t){let e=t;for(let n=0;n<24&&me(Z,e)<et;n++)e=M(e,.06);return e}function xe(t,e,n=et){if(me(t,e)>=n)return t;let s=be(e)>.4,r=t;for(let o=0;o<24&&(r=s?M(r,.06):cn(r,.06),!(me(r,e)>=n));o++);return r}function dn(){return typeof window>"u"?false:window.matchMedia("(prefers-color-scheme: dark)").matches}function nt(t){return t==="dark"||t==="auto"&&dn()?"dark":"light"}function eo(t=Je,e){let n=an(t),s=M(n,.15),r=tt(n);return nt(e)==="dark"?{accent:n,accentLight:n+"22",accentDark:s,accentGlow:n+"44",accentGradient:`linear-gradient(135deg, ${n}, ${s})`,accentFill:r,accentFillGradient:`linear-gradient(135deg, ${r}, ${M(r,.15)})`,accentForeground:Z,accentInk:xe(n,"#0f172a"),selection:n,selectionLight:n+"22",selectionGlow:n+"44",bg:"#0f172a",bgHover:"#1e293b",text:"#f1f5f9",textSecondary:"#94a3b8",textTertiary:"#64748b",border:"#334155",shadow:"rgba(0, 0, 0, 0.3)",glassBg:"rgba(15, 23, 42, 0.78)",glassBgHeavy:"rgba(15, 23, 42, 0.88)",glassBorder:"rgba(51, 65, 85, 0.5)",glassBorderSubtle:"rgba(51, 65, 85, 0.3)",layerBg:"rgba(15, 23, 42, 0.88)",layerBgHeavy:"rgba(15, 23, 42, 0.94)",layerBorder:"rgba(51, 65, 85, 0.5)",typeQuestion:"#60a5fa",typeChange:"#fbbf24",typeBug:"#f87171",typeOther:"#94a3b8",typeQuestionBg:"rgba(59, 130, 246, 0.15)",typeChangeBg:"rgba(245, 158, 11, 0.15)",typeBugBg:"rgba(239, 68, 68, 0.15)",typeOtherBg:"rgba(100, 116, 139, 0.15)",statusOpen:"#4ade80",statusOpenBg:"rgba(74, 222, 128, 0.15)",statusResolved:"#94a3b8",statusResolvedBg:"rgba(148, 163, 184, 0.15)",statusInProgress:"#fbbf24",statusInProgressBg:"rgba(245, 158, 11, 0.15)",statusWontFix:"#94a3b8",statusWontFixBg:"rgba(148, 163, 184, 0.15)"}:{accent:n,accentLight:n+"14",accentDark:s,accentGlow:n+"33",accentGradient:`linear-gradient(135deg, ${n}, ${s})`,accentFill:r,accentFillGradient:`linear-gradient(135deg, ${r}, ${M(r,.15)})`,accentForeground:Z,accentInk:xe(n,"#ffffff"),selection:n,selectionLight:n+"14",selectionGlow:n+"33",bg:"#ffffff",bgHover:"#f8f9fb",text:"#0f172a",textSecondary:"#475569",textTertiary:"#64748b",border:"#e2e8f0",shadow:"rgba(0, 0, 0, 0.06)",glassBg:"rgba(255, 255, 255, 0.72)",glassBgHeavy:"rgba(255, 255, 255, 0.85)",glassBorder:"rgba(255, 255, 255, 0.35)",glassBorderSubtle:"rgba(255, 255, 255, 0.18)",layerBg:"rgba(255, 255, 255, 0.9)",layerBgHeavy:"rgba(255, 255, 255, 0.96)",layerBorder:"#e2e8f0",typeQuestion:"#3b82f6",typeChange:"#b45309",typeBug:"#ef4444",typeOther:"#64748b",typeQuestionBg:"#eff6ff",typeChangeBg:"#fffbeb",typeBugBg:"#fef2f2",typeOtherBg:"#f8fafc",statusOpen:"#16a34a",statusOpenBg:"#f0fdf4",statusResolved:"#64748b",statusResolvedBg:"#f1f5f9",statusInProgress:"#d97706",statusInProgressBg:"#fffbeb",statusWontFix:"#64748b",statusWontFixBg:"#f1f5f9"}}function to(t,e,n){let s=nt(n),r=M(e,.15),o=s==="dark"?"22":"14",i=s==="dark"?"44":"33";t.accent=e,t.accentLight=e+o,t.accentDark=r,t.accentGlow=e+i,t.accentGradient=`linear-gradient(135deg, ${e}, ${r})`;let a=tt(e);t.accentFill=a,t.accentFillGradient=`linear-gradient(135deg, ${a}, ${M(a,.15)})`,t.accentForeground=Z,t.accentInk=xe(e,s==="dark"?"#0f172a":"#ffffff"),t.selection=e,t.selectionLight=e+o,t.selectionGlow=e+i;let u=ln(s==="dark"?"#0f172a":"#ffffff",e,s==="dark"?.14:.07),g=.9,h=s==="dark"?.95:.96;t.layerBg=`rgba(${u.r}, ${u.g}, ${u.b}, ${g})`,t.layerBgHeavy=`rgba(${u.r}, ${u.g}, ${u.b}, ${h})`,t.layerBorder=`${e}73`;}function ve(t,e){switch(t){case "question":return e.typeQuestion;case "change":return e.typeChange;case "bug":return e.typeBug;default:return e.typeOther}}function no(t,e){switch(t){case "in_progress":return e.statusInProgress;case "resolved":return e.statusResolved;case "wont_fix":return e.statusWontFix;default:return e.statusOpen}}function so(t,e){switch(t){case "in_progress":return e.statusInProgressBg;case "resolved":return e.statusResolvedBg;case "wont_fix":return e.statusWontFixBg;default:return e.statusOpenBg}}function st(t,e){switch(t){case "question":return e.typeQuestionBg;case "change":return e.typeChangeBg;case "bug":return e.typeBugBg;default:return e.typeOtherBg}}function ro(t){return `
    --sp-accent: ${t.accent};
    --sp-accent-light: ${t.accentLight};
    --sp-accent-dark: ${t.accentDark};
    --sp-accent-glow: ${t.accentGlow};
    --sp-accent-gradient: ${t.accentGradient};
    --sp-accent-fill: ${t.accentFill};
    --sp-accent-fill-gradient: ${t.accentFillGradient};
    --sp-accent-fg: ${t.accentForeground};
    --sp-accent-ink: ${t.accentInk};
    --sp-bg: ${t.bg};
    --sp-bg-hover: ${t.bgHover};
    --sp-text: ${t.text};
    --sp-text-secondary: ${t.textSecondary};
    --sp-text-tertiary: ${t.textTertiary};
    --sp-border: ${t.border};
    --sp-shadow: ${t.shadow};
    --sp-glass-bg: ${t.glassBg};
    --sp-glass-bg-heavy: ${t.glassBgHeavy};
    --sp-glass-border: ${t.glassBorder};
    --sp-glass-border-subtle: ${t.glassBorderSubtle};
    --sp-layer-bg: ${t.layerBg};
    --sp-layer-bg-heavy: ${t.layerBgHeavy};
    --sp-layer-border: ${t.layerBorder};
    --sp-type-question: ${t.typeQuestion};
    --sp-type-change: ${t.typeChange};
    --sp-type-bug: ${t.typeBug};
    --sp-type-other: ${t.typeOther};
    --sp-type-question-bg: ${t.typeQuestionBg};
    --sp-type-change-bg: ${t.typeChangeBg};
    --sp-type-bug-bg: ${t.typeBugBg};
    --sp-type-other-bg: ${t.typeOtherBg};
    --sp-radius: 12px;
    --sp-radius-lg: 16px;
    --sp-radius-xl: 20px;
    --sp-radius-full: 9999px;
    --sp-blur: 20px;
    --sp-blur-heavy: 32px;
    --sp-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
    --sp-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04);
    --sp-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
    --sp-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04);
    --sp-shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
    --sp-font: ${Ne};
  `}var J=le,pn=new Set(["light","dark","auto"]),un=new Set(["bottom-right","bottom-left"]);function gn(t){if(typeof t!="object"||t===null)return {};let e=t,n={};return typeof e.theme=="string"&&pn.has(e.theme)&&(n.theme=e.theme),typeof e.locale=="string"&&e.locale.length>0&&(n.locale=e.locale),typeof e.position=="string"&&un.has(e.position)&&(n.position=e.position),typeof e.accentColor=="string"&&e.accentColor.length>0&&(n.accentColor=e.accentColor),typeof e.enableScreenshot=="boolean"&&(n.enableScreenshot=e.enableScreenshot),typeof e.captureDiagnostics=="boolean"&&(n.captureDiagnostics=e.captureDiagnostics),n}function hn(){try{let t=localStorage.getItem(J);return t?gn(JSON.parse(t)):{}}catch{return {}}}function ao(t){try{let e={...hn(),...t};localStorage.setItem(J,JSON.stringify(e));}catch{}}function lo(t){let e={};try{let s=localStorage.getItem(J);if(s){let r=JSON.parse(s);typeof r=="object"&&r!==null&&(e=r);}}catch{}let n={};t.accentColor!==void 0&&(n.syncedAccentColor=t.accentColor),t.theme!==void 0&&(n.syncedTheme=t.theme),t.locale!==void 0&&(n.syncedLocale=t.locale);try{localStorage.setItem(J,JSON.stringify({...e,...n}));}catch{}}var fn='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',bn='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',mn='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"/><path d="M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/></svg>',uo=`
  /* ============================
     Export Button & Menu
     ============================ */

  .sp-export-btn {
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    /* Ghost until hover \u2014 one accented button (Copy Prompt) per row is
       enough; a wall of outlined pills reads as noise. */
    border: 1px solid transparent;
    background: transparent;
    color: var(--sp-text-tertiary);
    font-family: var(--sp-font);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
    position: relative;
  }

  .sp-export-btn svg {
    width: 13px;
    height: 13px;
  }

  .sp-export-btn:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sp-export-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    padding: 4px;
    border-radius: var(--sp-radius);
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-lg);
    z-index: 10;
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }

  .sp-export-menu--open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .sp-export-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .sp-export-option:hover,
  .sp-export-option:focus-visible {
    background: var(--sp-accent-light);
    color: var(--sp-accent);
  }

  .sp-export-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sp-export-option-icon svg {
    width: 16px;
    height: 16px;
  }

  .sp-export-option-label {
    flex: 1;
  }

  .sp-export-error {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    max-width: 220px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-lg);
    color: #ef4444;
    font-family: var(--sp-font);
    font-size: 11px;
    line-height: 1.4;
    z-index: 11;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }

  .sp-export-error--visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (forced-colors: active) {
    .sp-export-btn,
    .sp-export-option,
    .sp-export-menu {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-export-btn:focus-visible,
    .sp-export-option:focus-visible {
      outline: 3px solid Highlight !important;
    }
  }
`,we=[{key:"type",header:"Type",width:12},{key:"status",header:"Status",width:14},{key:"message",header:"Message",width:50},{key:"url",header:"URL",width:40},{key:"authorName",header:"Author",width:20},{key:"authorEmail",header:"Email",width:26},{key:"createdAt",header:"Created At",width:22},{key:"resolvedAt",header:"Resolved At",width:22},{key:"viewport",header:"Viewport",width:14}],rt="screenshot",xn=24,vn=we.length,ot=160,ye=20;function yn(t){return /^[=+\-@\t\r]/.test(t)?`'${t}`:t}function kn(t){return JSON.stringify(t,null,2)}function wn(t){return t==="image/jpeg"||t==="image/jpg"?"jpeg":t==="image/png"?"png":t==="image/gif"?"gif":null}function ke(t){let e=/\.(jpe?g|png|gif)(?:[?#]|$)/i.exec(t);if(!e)return null;let n=e[1]?.toLowerCase();return n==="jpg"?"jpeg":n??null}function Cn(t,e){let n=new Uint8Array(t),s="",r=32768;for(let o=0;o<n.length;o+=r)s+=String.fromCharCode(...n.subarray(o,o+r));return `data:${e};base64,${btoa(s)}`}function En(t){return new Promise(e=>{let n=new Image;n.onload=()=>e({width:n.naturalWidth||1,height:n.naturalHeight||1}),n.onerror=()=>e(null),n.src=t;})}async function Sn(t){if(!t)return null;try{let e,n;if(t.startsWith("data:"))n=/^data:([^;,]+)/.exec(t)?.[1]??"image/jpeg",e=t;else {let o=await fetch(t);if(!o.ok)return null;let i=o.headers.get("content-type")?.split(";")[0]?.trim(),a=await o.arrayBuffer();n=i||(ke(t)?`image/${ke(t)}`:""),n||(n="image/jpeg"),e=Cn(a,n);}let s=wn(n)??ke(t);if(!s)return null;let r=await En(e);return {dataUrl:e,extension:s,width:r?.width??1,height:r?.height??1}}catch(e){return console.warn("[instafix] Failed to embed screenshot in XLSX export:",e),null}}function Tn(t,e){let n=Math.min(ot/t,ot/e,1);return {width:Math.max(1,Math.round(t*n)),height:Math.max(1,Math.round(e*n))}}function An(t){return Math.round(t*.75)+16}async function Fn(t){let e=await import('exceljs'),n=e.default??e,s=new n.Workbook;s.creator="instafix",s.created=new Date;let r=s.addWorksheet("Feedback",{views:[{state:"frozen",ySplit:1}]});r.columns=[...we.map(c=>({header:c.header,key:c.key,width:c.width})),{header:"Screenshot",key:rt,width:xn}];let o=r.getRow(1);o.font={bold:true},o.alignment={vertical:"middle"},o.height=ye;for(let c of t){let p={};for(let h of we){let f=c[h.key];p[h.key]=yn(f==null?"":String(f));}p[rt]="";let u=r.addRow(p);u.alignment={vertical:"middle",wrapText:true},u.height=ye;let g=await Sn(c.screenshotUrl);if(g){let h=Tn(g.width,g.height),f=s.addImage({base64:g.dataUrl,extension:g.extension});r.addImage(f,{tl:{col:vn,row:u.number-1},ext:h}),u.height=Math.max(ye,An(h.height));}}let i=await s.xlsx.writeBuffer(),a=i instanceof Uint8Array?i:new Uint8Array(i);return a.buffer.slice(a.byteOffset,a.byteOffset+a.byteLength)}function Ln(t){return typeof t=="string"||t instanceof ArrayBuffer?t:t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength)}function it(t,e,n){let s=new Blob([Ln(t)],{type:n}),r=URL.createObjectURL(s),o=document.createElement("a");o.href=r,o.download=e,o.style.display="none",document.body.appendChild(o),o.click(),requestAnimationFrame(()=>{URL.revokeObjectURL(r),o.remove();});}var at=class{constructor(e,n,s){this.getFeedbacks=n;this.t=s;this.element=l("div",{style:"position: relative; display: inline-flex;"});let r=document.createElement("button");r.className="sp-export-btn",r.setAttribute("aria-haspopup","true"),r.setAttribute("aria-expanded","false"),r.appendChild(b(fn));let o=document.createElement("span");d(o,s("export.label")),r.appendChild(o),r.addEventListener("click",c=>{c.stopPropagation(),this.toggle();}),this.menu=l("div",{class:"sp-export-menu"}),this.menu.setAttribute("role","menu");let i=this.createOption(bn,s("export.xlsx"),()=>{this.exportAs("xlsx");}),a=this.createOption(mn,s("export.json"),()=>{this.exportAs("json");});this.menu.appendChild(i),this.menu.appendChild(a),this.errorHint=l("div",{class:"sp-export-error"}),this.errorHint.setAttribute("role","status"),this.errorHint.setAttribute("aria-live","polite"),this.element.appendChild(r),this.element.appendChild(this.menu),this.element.appendChild(this.errorHint),this.onDocumentClick=c=>{this.isOpen&&!this.element.contains(c.target)&&this.close();},document.addEventListener("click",this.onDocumentClick,true);}getFeedbacks;t;element;menu;errorHint;isOpen=false;errorHideTimer;onDocumentClick;createOption(e,n,s){let r=document.createElement("button");r.className="sp-export-option",r.setAttribute("role","menuitem");let o=l("span",{class:"sp-export-option-icon"});o.appendChild(b(e));let i=l("span",{class:"sp-export-option-label"});return d(i,n),r.appendChild(o),r.appendChild(i),r.addEventListener("click",a=>{a.stopPropagation(),s(),this.close();}),r}toggle(){this.isOpen?this.close():this.open();}open(){this.isOpen=true,this.menu.classList.add("sp-export-menu--open"),this.element.querySelector(".sp-export-btn")?.setAttribute("aria-expanded","true");}close(){this.isOpen=false,this.menu.classList.remove("sp-export-menu--open"),this.element.querySelector(".sp-export-btn")?.setAttribute("aria-expanded","false");}showError(){d(this.errorHint,this.t("export.failedHint")),this.errorHint.classList.add("sp-export-error--visible"),this.errorHideTimer&&clearTimeout(this.errorHideTimer),this.errorHideTimer=setTimeout(()=>{this.errorHint.classList.remove("sp-export-error--visible");},4e3);}exportAs(e){let n=this.getFeedbacks();if(n.length===0)return;let s=n[0]?.projectName??"feedbacks",r=new Date().toISOString().slice(0,10),o=s.replace(/[^a-zA-Z0-9_-]/g,"_");if(e==="json"){let i=kn(n);it(i,`feedbacks-${o}-${r}.json`,"application/json;charset=utf-8");return}this.exportXlsx(n,o,r);}async exportXlsx(e,n,s){let r=this.element.querySelector(".sp-export-btn");r?.setAttribute("disabled","true");try{let o=await Fn(e);it(o,`feedbacks-${n}-${s}.xlsx`,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");}catch(o){console.error("[instafix] XLSX export failed:",o),this.showError();}finally{r?.removeAttribute("disabled");}}destroy(){document.removeEventListener("click",this.onDocumentClick,true),this.errorHideTimer&&clearTimeout(this.errorHideTimer),this.element.remove();}};var ee='<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" stroke-width="2"/></svg>',lt='<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1" y="1" width="16" height="16" rx="4" fill="url(#sp-cb-grad)" stroke="none"/><polyline points="5 9 8 12 13 6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="sp-cb-grad" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--sp-accent)"/><stop offset="100%" stop-color="var(--sp-accent-dark)"/></linearGradient></defs></svg>',bo=`
  /* ============================
     Bulk Checkbox
     ============================ */

  /* Visible at rest (subdued), darker on card hover, accent on direct
     hover \u2014 selectability shouldn't be a secret you discover by mousing. */
  .sp-bulk-checkbox {
    position: relative;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 4px;
    color: var(--sp-text-tertiary);
    opacity: 0.55;
    transition: opacity 0.15s ease, color 0.15s ease, transform 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .sp-bulk-checkbox svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .sp-bulk-checkbox:hover {
    color: var(--sp-accent);
    transform: scale(1.1);
  }

  .sp-bulk-checkbox--checked {
    color: var(--sp-accent);
    opacity: 1 !important;
    filter: drop-shadow(0 0 4px var(--sp-accent-glow));
  }

  /* Darken when hovering the card */
  .sp-card:hover .sp-bulk-checkbox {
    opacity: 1;
    color: var(--sp-text-secondary);
  }

  /* When any card has selection, show ALL checkboxes */
  .sp-list--has-selection .sp-bulk-checkbox {
    opacity: 1;
  }

  /* ============================
     Card Selected State
     ============================ */

  .sp-card--selected {
    border-left: 3px solid var(--sp-accent) !important;
    background: var(--sp-accent-light) !important;
  }

  .sp-card--selected:hover {
    background: var(--sp-accent-light) !important;
  }

  /* ============================
     Select All Bar
     ============================ */

  /* Always visible \u2014 lives in the list toolbar next to the search field. */
  .sp-bulk-select-all {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 8px 0 4px;
    flex-shrink: 0;
    border-radius: var(--sp-radius);
    background: transparent;
    cursor: pointer;
    transition: background 0.2s ease;
    user-select: none;
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    color: var(--sp-text-secondary);
    white-space: nowrap;
  }

  .sp-bulk-select-all:hover {
    background: var(--sp-bg-hover);
  }

  .sp-bulk-select-all .sp-bulk-checkbox {
    opacity: 1;
  }

  /* ============================
     Floating Action Bar
     ============================ */

  @keyframes sp-bulk-bar-in {
    from {
      transform: translateY(100%) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes sp-bulk-bar-out {
    from {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateY(100%) scale(0.95);
      opacity: 0;
    }
  }

  .sp-bulk-bar {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 16px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    transform: translateY(100%) scale(0.95);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.25s ease;
    font-family: var(--sp-font);
  }

  .sp-bulk-bar--visible {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .sp-bulk-bar-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--sp-text);
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .sp-bulk-bar-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-bulk-btn-resolve,
  .sp-bulk-btn-delete {
    padding: 7px 14px;
    border-radius: var(--sp-radius-full);
    border: 1.5px solid transparent;
    background: transparent;
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .sp-bulk-btn-resolve {
    color: #22c55e;
    border-color: #22c55e;
  }

  .sp-bulk-btn-resolve:hover {
    background: rgba(34, 197, 94, 0.1);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.15);
  }

  .sp-bulk-btn-resolve:active {
    transform: scale(0.96);
    transition-duration: 0.1s;
  }

  .sp-bulk-btn-delete {
    color: #ef4444;
    border-color: #ef4444;
  }

  .sp-bulk-btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
  }

  .sp-bulk-btn-delete:active {
    transform: scale(0.96);
    transition-duration: 0.1s;
  }

  .sp-bulk-btn-resolve:disabled,
  .sp-bulk-btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sp-bulk-btn-deselect {
    width: 28px;
    height: 28px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;
  }

  .sp-bulk-btn-deselect:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
    border-color: var(--sp-text-tertiary);
  }

  .sp-bulk-btn-deselect:active {
    transform: scale(0.92);
    transition-duration: 0.1s;
  }

  .sp-bulk-btn-deselect svg {
    width: 12px;
    height: 12px;
  }

  /* Spinner inside bulk bar buttons */
  .sp-bulk-btn-resolve .sp-spinner,
  .sp-bulk-btn-delete .sp-spinner {
    width: 14px;
    height: 14px;
  }

  /* ============================
     Forced Colors / High Contrast
     ============================ */

  @media (forced-colors: active) {
    .sp-bulk-checkbox,
    .sp-bulk-btn-resolve,
    .sp-bulk-btn-delete,
    .sp-bulk-btn-deselect,
    .sp-bulk-bar {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-bulk-checkbox--checked {
      background: Highlight !important;
      color: HighlightText !important;
    }

    .sp-card--selected {
      border-left: 4px solid Highlight !important;
    }
  }

  /* ============================
     Reduced Motion
     ============================ */

  @media (prefers-reduced-motion: reduce) {
    .sp-bulk-bar {
      transition-duration: 0.01ms !important;
    }

    .sp-bulk-checkbox {
      transition-duration: 0.01ms !important;
    }
  }
`,ct=class{constructor(e,n,s){this.callbacks=n;this.t=s,this.barElement=l("div",{class:"sp-bulk-bar"}),this.barElement.setAttribute("role","toolbar"),this.barElement.setAttribute("aria-label","Bulk actions"),this.countLabel=l("span",{class:"sp-bulk-bar-count"}),d(this.countLabel,A(this.t,"bulk.selected",{count:0}));let r=l("div",{class:"sp-bulk-bar-actions"});this.resolveBtn=document.createElement("button"),this.resolveBtn.className="sp-bulk-btn-resolve",this.resolveBtn.type="button",this.resolveBtn.addEventListener("click",()=>this.handleResolve()),this.deleteBtn=document.createElement("button"),this.deleteBtn.className="sp-bulk-btn-delete",this.deleteBtn.type="button",this.deleteBtn.addEventListener("click",()=>this.handleDelete());let o=document.createElement("button");o.className="sp-bulk-btn-deselect",o.type="button",o.setAttribute("aria-label",this.t("bulk.deselect")),o.appendChild(b('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>')),o.addEventListener("click",()=>this.deselectAll()),r.appendChild(this.resolveBtn),r.appendChild(this.deleteBtn),r.appendChild(o),this.barElement.appendChild(this.countLabel),this.barElement.appendChild(r),this.updateButtonLabels();}callbacks;barElement;selected=new Set;checkboxMap=new Map;countLabel;resolveBtn;deleteBtn;selectAllCheckbox=null;listContainer=null;isProcessing=false;t;createCheckbox(e){let n=l("div",{class:"sp-bulk-checkbox"});return n.setAttribute("role","checkbox"),n.setAttribute("aria-checked","false"),n.setAttribute("tabindex","0"),n.setAttribute("aria-label",`Select feedback ${e}`),n.appendChild(b(ee)),n.addEventListener("click",s=>{s.stopPropagation(),this.toggle(e);}),n.addEventListener("keydown",s=>{(s.key===" "||s.key==="Enter")&&(s.preventDefault(),s.stopPropagation(),this.toggle(e));}),this.checkboxMap.set(e,n),n}createSelectAllBar(e,n){let s=l("div",{class:"sp-bulk-select-all"}),r=l("div",{class:"sp-bulk-checkbox"});r.appendChild(b(ee)),this.selectAllCheckbox=r;let o=l("span");return d(o,n),s.appendChild(r),s.appendChild(o),s.addEventListener("click",()=>{let i=e();this.selected.size===i.length&&i.length>0?this.deselectAll():this.selectAll(i);}),s}setListContainer(e){this.listContainer=e;}toggle(e){this.isProcessing||(this.selected.has(e)?this.selected.delete(e):this.selected.add(e),this.updateCheckbox(e),this.updateBar(),this.updateSelectAllCheckbox(),this.updateListSelectionClass(),this.updateCardSelectedState(e));}selectAll(e){if(!this.isProcessing){for(let n of e)this.selected.add(n),this.updateCheckbox(n),this.updateCardSelectedState(n);this.updateBar(),this.updateSelectAllCheckbox(),this.updateListSelectionClass();}}deselectAll(){let e=[...this.selected];this.selected.clear();for(let n of e)this.updateCheckbox(n),this.updateCardSelectedState(n);this.updateBar(),this.updateSelectAllCheckbox(),this.updateListSelectionClass();}get selectedIds(){return [...this.selected]}get count(){return this.selected.size}get hasSelection(){return this.selected.size>0}reset(){this.selected.clear(),this.checkboxMap.clear(),this.isProcessing=false,this.updateBar(),this.updateListSelectionClass(),this.updateSelectAllCheckbox();}destroy(){this.selected.clear(),this.checkboxMap.clear(),this.selectAllCheckbox=null,this.listContainer=null,this.barElement.remove();}updateBar(){let e=this.selected.size,n=e>0;this.barElement.classList.toggle("sp-bulk-bar--visible",n),d(this.countLabel,A(this.t,"bulk.selected",{count:e})),this.updateButtonLabels();}updateButtonLabels(){let e=this.selected.size,n=this.t("bulk.resolve"),s=this.t("bulk.delete");this.resolveBtn.replaceChildren();let r=document.createElement("span");d(r,e>0?`${n} ${e}`:n),this.resolveBtn.appendChild(r),this.deleteBtn.replaceChildren();let o=document.createElement("span");d(o,e>0?`${s} ${e}`:s),this.deleteBtn.appendChild(o);}updateCheckbox(e){let n=this.checkboxMap.get(e);if(!n)return;let s=this.selected.has(e);n.classList.toggle("sp-bulk-checkbox--checked",s),n.setAttribute("aria-checked",String(s)),n.replaceChildren(),n.appendChild(b(s?lt:ee));}updateSelectAllCheckbox(){if(!this.selectAllCheckbox)return;let e=this.selected.size>0&&this.selected.size===this.checkboxMap.size;this.selectAllCheckbox.classList.toggle("sp-bulk-checkbox--checked",e),this.selectAllCheckbox.setAttribute("aria-checked",String(e)),this.selectAllCheckbox.replaceChildren(),this.selectAllCheckbox.appendChild(b(e?lt:ee));}updateListSelectionClass(){this.listContainer&&this.listContainer.classList.toggle("sp-list--has-selection",this.selected.size>0);}updateCardSelectedState(e){if(!this.listContainer)return;let n=CSS.escape(e),s=this.listContainer.querySelector(`[data-feedback-id="${n}"]`);s&&s.classList.toggle("sp-card--selected",this.selected.has(e));}async handleResolve(){if(this.isProcessing||this.selected.size===0)return;this.isProcessing=true;let e=[...this.selected],n=ie(this.resolveBtn);this.deleteBtn.disabled=true;try{await this.callbacks.onResolve(e),this.reset();}catch{n(),this.deleteBtn.disabled=false;}finally{this.isProcessing=false;}}async handleDelete(){if(this.isProcessing||this.selected.size===0)return;this.isProcessing=true;let e=[...this.selected],n=ie(this.deleteBtn);this.resolveBtn.disabled=true;try{await this.callbacks.onDelete(e),this.reset();}catch{n(),this.resolveBtn.disabled=false;}finally{this.isProcessing=false;}}};var Rn=new Set(["role","name","aria-label","rel","href"]);function Bn(t,e){let n=Rn.has(t);n||=t.startsWith("data-")&&z(t);let s=z(e)&&e.length<100;return s||=e.startsWith("#")&&z(e.slice(1)),n&&s}function In(t){return z(t)}function Pn(t){return z(t)}function Mn(t){return  true}function pt(t,e){if(t.nodeType!==Node.ELEMENT_NODE)throw new Error("Can't generate CSS selector for non-element node type.");if(t.tagName.toLowerCase()==="html")return "html";let n={root:document.body,idName:In,className:Pn,tagName:Mn,attr:Bn,timeoutMs:1e3,seedMinLength:3,optimizedMinLength:2,maxNumberOfPathChecks:1/0},s=new Date,r={...n,...e},o=Hn(r.root,n),i,a=0;for(let p of Nn(t,r,o)){if(new Date().getTime()-s.getTime()>r.timeoutMs||a>=r.maxNumberOfPathChecks){let g=_n(t,o);if(!g)throw new Error(`Timeout: Can't find a unique selector after ${r.timeoutMs}ms`);return U(g)}if(a++,Se(p,o)){i=p;break}}if(!i)throw new Error("Selector was not found.");let c=[...ht(i,t,r,o,s)];return c.sort(Ce),c.length>0?U(c[0]):U(i)}function*Nn(t,e,n){let s=[],r=[],o=t,i=0;for(;o&&o!==n;){let a=On(o,e);for(let c of a)c.level=i;if(s.push(a),o=o.parentElement,i++,r.push(...gt(s)),i>=e.seedMinLength){r.sort(Ce);for(let c of r)yield c;r=[];}}r.sort(Ce);for(let a of r)yield a;}function z(t){if(/^[a-z\-]{3,}$/i.test(t)){let e=t.split(/-|[A-Z]/);for(let n of e)if(n.length<=2||/[^aeiou]{4,}/i.test(n))return  false;return  true}return  false}function On(t,e){let n=[],s=t.getAttribute("id");s&&e.idName(s)&&n.push({name:"#"+CSS.escape(s),penalty:0});for(let i=0;i<t.classList.length;i++){let a=t.classList[i];e.className(a)&&n.push({name:"."+CSS.escape(a),penalty:1});}for(let i=0;i<t.attributes.length;i++){let a=t.attributes[i];e.attr(a.name,a.value)&&n.push({name:`[${CSS.escape(a.name)}="${CSS.escape(a.value)}"]`,penalty:2});}let r=t.tagName.toLowerCase();if(e.tagName(r)){n.push({name:r,penalty:5});let i=Ee(t,r);i!==void 0&&n.push({name:ut(r,i),penalty:10});}let o=Ee(t);return o!==void 0&&n.push({name:Dn(r,o),penalty:50}),n}function U(t){let e=t[0],n=e.name;for(let s=1;s<t.length;s++){let r=t[s].level||0;e.level===r-1?n=`${t[s].name} > ${n}`:n=`${t[s].name} ${n}`,e=t[s];}return n}function dt(t){return t.map(e=>e.penalty).reduce((e,n)=>e+n,0)}function Ce(t,e){return dt(t)-dt(e)}function Ee(t,e){let n=t.parentNode;if(!n)return;let s=n.firstChild;if(!s)return;let r=0;for(;s&&(s.nodeType===Node.ELEMENT_NODE&&(e===void 0||s.tagName.toLowerCase()===e)&&r++,s!==t);)s=s.nextSibling;return r}function _n(t,e){let n=0,s=t,r=[];for(;s&&s!==e;){let o=s.tagName.toLowerCase(),i=Ee(s,o);if(i===void 0)return;r.push({name:ut(o,i),penalty:NaN,level:n}),s=s.parentElement,n++;}if(Se(r,e))return r}function Dn(t,e){return t==="html"?"html":`${t}:nth-child(${e})`}function ut(t,e){return t==="html"?"html":`${t}:nth-of-type(${e})`}function*gt(t,e=[]){if(t.length>0)for(let n of t[0])yield*gt(t.slice(1,t.length),e.concat(n));else yield e;}function Hn(t,e){return t.nodeType===Node.DOCUMENT_NODE?t:t===e.root?t.ownerDocument:t}function Se(t,e){let n=U(t);switch(e.querySelectorAll(n).length){case 0:throw new Error(`Can't select any node with this selector: ${n}`);case 1:return  true;default:return  false}}function*ht(t,e,n,s,r){if(t.length>2&&t.length>n.optimizedMinLength)for(let o=1;o<t.length-1;o++){if(new Date().getTime()-r.getTime()>n.timeoutMs)return;let a=[...t];a.splice(o,1),Se(a,s)&&s.querySelector(U(a))===e&&(yield a,yield*ht(a,e,n,s,r));}}var $n=["role","aria-label","type","name","href","src","data-testid","data-id"];function jn(t){let e=5381;for(let n=0;n<t.length;n++)e=(e<<5)+e+t.charCodeAt(n)|0;return (e>>>0).toString(36)}function Te(t){let e=t.children.length,n=0,s=t.parentElement;if(s)for(let r of s.children){if(r===t)break;r.tagName===t.tagName&&n++;}return `${e}:${n}:${Ae(t)}`}function Ae(t){let e=[];for(let n of $n){let s=t.getAttribute(n);s&&e.push(`${n}=${s}`);}return e.length>0?jn(e.join(",")):"0"}function ft(t,e){let n=e.split(":");if(n.length!==3)return 0;let[s,r,o]=n,i=Number(s),a=Number(r);if(Number.isNaN(i)||Number.isNaN(a))return 0;let c=Te(t),[p,u,g]=c.split(":"),h=0,f=Math.abs(Number(p)-i);f===0?h+=.2:f<=2?h+=.1:f<=5&&(h+=.03);let x=Math.abs(Number(u)-a);return x===0?h+=.4:x===1?h+=.2:x<=3&&(h+=.08),g===o&&(h+=.4),h}function D(t,e){let n=e==="before"?"previousElementSibling":"nextElementSibling",s=t[n],r=3;for(;s&&r>0;){let o=e==="before"?Kn(s,256).trim():_(s,256).trim();if(o)return e==="before"?o.slice(-32):o.slice(0,32);s=s[n],r--;}return ""}function te(t){let e=t.previousElementSibling,n=t.nextElementSibling,s=e?_(e,256).trim().slice(0,40):"",r=n?_(n,256).trim().slice(0,40):"";return [s,r].filter(Boolean).join(" | ")}function _(t,e){let n="";if(t.firstElementChild===null){for(let r of t.childNodes)if(r.nodeType===3&&(n+=r.data,n.length>=e))break;return n.length>e?n.slice(0,e):n}let s=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT);for(;n.length<e;){let r=s.nextNode();if(!r)break;n+=r.data;}return n.length>e?n.slice(0,e):n}function Kn(t,e){let n="",s=r=>{for(let o=r.lastChild;o;o=o.previousSibling)if(o.nodeType===3){if(n=o.data+n,n.length>=e)return  true}else if(o.nodeType===1&&s(o))return  true;return  false};return s(t),n.length>e?n.slice(-e):n}function bt(t){if(t.id){let s=t.id.includes("'")?`concat('${t.id.replace(/'/g,`',"'",'`)}')`:`'${t.id}'`;return `//${t.localName}[@id=${s}]`}let e=[],n=t;for(;n&&n!==document.body&&e.length<6;){let s=n.localName,r=n.parentElement;if(n.id){let i=n.id.includes("'")?`concat('${n.id.replace(/'/g,`',"'",'`)}')`:`'${n.id}'`;return e.unshift(`/${s}[@id=${i}]`),"/"+e.join("")}let o=1;if(r)for(let i of r.children){if(i===n)break;i.localName===s&&o++;}e.unshift(`/${s}[${o}]`),n=r;}return "/html/body"+e.join("")}var G="data-feedback-anchor";function xt(t){let e=pt(t,{className:g=>!/^(css|sc|emotion|styled)-/.test(g)&&!/^[a-z]{1,3}[A-Za-z0-9]{4,8}$/.test(g),attr:g=>["data-testid","data-id","role","aria-label"].includes(g),idName:g=>!g.startsWith("radix-")&&!/^:r[0-9]+:$/.test(g),seedMinLength:3,optimizedMinLength:2}),n=bt(t),r=(t.textContent?.trim()??"").slice(0,120),o=D(t,"before"),i=D(t,"after"),a=Te(t),c=te(t),u=t.closest(`[${G}]`)?.getAttribute(G)??null;return {cssSelector:e,xpath:n,textSnippet:r,textPrefix:o,textSuffix:i,fingerprint:a,neighborText:c,elementTag:t.tagName,elementId:t.id||void 0,anchorKey:u}}function mt(t,e){let n=t.getBoundingClientRect();return n.left<=e.x&&n.top<=e.y&&n.right>=e.x+e.width&&n.bottom>=e.y+e.height}function Ao(t,e=document.documentElement){let n=t.x+t.width/2,s=t.y+t.height/2,r=document.elementFromPoint(n,s);if(!r||r===e)return document.body;let o=r;for(;o&&o!==document.body;){if(o.hasAttribute(G)&&mt(o,t))return o;o=o.parentElement;}for(o=r;o&&o!==document.body;){if(mt(o,t))return o;o=o.parentElement;}return document.body}var zn=.6;function Fo(t){let e=window.innerWidth*window.innerHeight,n=t;for(;;){let s=n.parentElement;if(!s||s===document.body||s===document.documentElement||j(s))break;let r=s.getBoundingClientRect();if(r.width<=0||r.height<=0||r.width*r.height>e*zn)break;n=s;}return n}function Lo(t,e){return e.width<=0||e.height<=0?{xPct:0,yPct:0,wPct:1,hPct:1}:{xPct:(t.x-e.x)/e.width,yPct:(t.y-e.y)/e.height,wPct:t.width/e.width,hPct:t.height/e.height}}function H(t){return t.normalize("NFC").replace(/\s+/g," ").trim()}function vt(t){return t.replace(/\s+/g," ").trim()}function Un(t,e){if(t===e)return 0;if(t.length===0)return e.length;if(e.length===0)return t.length;if(t.length>e.length){let i=t;t=e,e=i;}let n=t.length,s=e.length,r=new Array(n+1);for(let i=0;i<=n;i++)r[i]=i;let o=new Array(n+1);for(let i=1;i<=s;i++){o[0]=i;for(let c=1;c<=n;c++){let p=r[c-1];o[c]=t[c-1]===e[i-1]?p:1+Math.min(p,r[c],o[c-1]);}let a=r;r=o,o=a;}return r[n]}function W(t,e){if(t===e)return 1;let n=Math.max(t.length,e.length);return n===0?1:1-Un(t,e)/n}function Gn(t,e){let n=e.length,s=new Int32Array(n+1),r=new Int32Array(n+1);for(let i=0;i<=n;i++)s[i]=i;let o=n;for(let i=1;i<=t.length;i++){r[0]=0;let a=t.charCodeAt(i-1);for(let u=1;u<=n;u++){let g=s[u-1]+(e.charCodeAt(u-1)===a?0:1),h=s[u]+1,f=r[u-1]+1;r[u]=Math.min(g,h,f);}let c=r[n];c<o&&(o=c);let p=s;s=r,r=p;}return o}function yt(t,e,n=.6){if(!e||!t)return 0;if(t.includes(e))return 1;let s=t.length>500?t.slice(0,500):t;if(e.length>s.length){let o=W(s,e);return o>=n?o:0}if(e.length<8&&s.length>64)return 0;let r=1-Gn(s,e)/e.length;return r>=n?r:0}function kt(t){let e=new Map;for(let n=0;n<t.length-1;n++){let s=t.charCodeAt(n)<<16|t.charCodeAt(n+1);e.set(s,(e.get(s)??0)+1);}return e}function wt(t,e,n){let s=n.length-1;if(e<=0||s<=0)return 0;let r=0,o=new Map;for(let i=0;i<n.length-1;i++){let a=n.charCodeAt(i)<<16|n.charCodeAt(i+1),c=t.get(a);if(c===void 0)continue;let p=o.get(a)??0;p<c&&(o.set(a,p+1),r++);}return 2*r/(e+s)}function Ct(t){let e=new Map,n=t.split(" ");for(let s=0;s<n.length-1;s++){let r=`${n[s]} ${n[s+1]}`;e.set(r,(e.get(r)??0)+1);}return e}function Et(t,e,n){if(e<=0)return 0;let s=n.split(" "),r=s.length-1;if(r<=0)return 0;let o=0,i=new Map;for(let a=0;a<s.length-1;a++){let c=`${s[a]} ${s[a+1]}`,p=t.get(c);if(p===void 0)continue;let u=i.get(c)??0;u<p&&(i.set(c,u+1),o++);}return 2*o/(e+r)}var Wn={checkOpacity:true,opacityProperty:true,checkVisibilityCSS:true,visibilityProperty:true};function St(t){if(!t.isConnected)return "hidden";if(typeof t.checkVisibility=="function")return t.checkVisibility(Wn)?"visible":t.checkVisibility()?"soft-hidden":"hidden";if(t.getClientRects().length>0)try{return getComputedStyle(t).visibility==="visible"?"visible":"soft-hidden"}catch{return "visible"}let e=t.firstElementChild;return e&&e.getClientRects().length>0?"visible":t.ownerDocument.documentElement.getClientRects().length===0?"unknown":"hidden"}function Tt(t){switch(t){case "hidden":return .3;case "soft-hidden":return .6;default:return 1}}var $={anchorKey:1,id:1,css:.95,xpath:.9,scan:.85},ne=16,Vn=24,Yn=1e4,Be=500,Xn=.5,Fe=.6,qn=.4,Qn=2e3,Re=.8,Le=.6,Zn=.05;function se(t,e){return H((t??"").slice(0,Qn)).slice(0,e)}function Jn(t){let e=se(t.textSnippet,Be),n=Ct(e),s=0;for(let r of n.values())s+=r;return {snippet:e,snippetBigrams:kt(e),snippetBigramTotal:Math.max(0,e.length-1),snippetWordPairs:n,snippetWordPairTotal:s,prefix:se(t.textPrefix,128),suffix:se(t.textSuffix,128),neighbor:se(t.neighborText,128),fingerprint:(t.fingerprint??"").slice(0,64),tag:typeof t.elementTag=="string"?t.elementTag:""}}function Ie(t,e){let n=Jn(t),s=es(t),r=[];for(let[g,h]of s){let f=At(g,h,n);f&&r.push(f);}let o=0,i=false;for(let g of r)g.final>o&&(o=g.final),(g.strategy==="id"||g.strategy==="anchorKey")&&g.visibility===1&&(g.signals?.text??0)>=Re&&(g.signals?.fingerprint===void 0||g.signals.fingerprint>=Re)&&(i=true);let a=!!(n.snippet||n.fingerprint||n.prefix||n.suffix||n.neighbor),c=e?.scanBudget;if(a&&o<$.scan&&!i)if(c&&c.remaining<=0)c.starved=true;else {c&&c.remaining--;for(let g of ts(n,s)){let h=At(g,"scan",n);h&&r.push(h);}}let p=r.filter(ns);if(p.length===0)return null;p.sort((g,h)=>h.final-g.final);let u=rs(p);return {element:u.element,confidence:os(u),strategy:u.strategy}}function es(t){let e=new Map,n=(s,r,o)=>{!s||e.has(s)||o&&s.tagName!==t.elementTag||e.set(s,r);};if(t.anchorKey){let s=t.anchorKey.replace(/\\/g,"\\\\").replace(/"/g,'\\"');try{let r=document.querySelectorAll(`[${G}="${s}"]`);for(let o=0;o<Math.min(r.length,ne);o++)n(r[o]??null,"anchorKey",!1);}catch{}}if(t.elementId){let s=t.elementId.replace(/\\/g,"\\\\").replace(/"/g,'\\"');try{let r=document.querySelectorAll(`[id="${s}"]`);for(let o=0;o<Math.min(r.length,ne);o++)n(r[o]??null,"id",!0);}catch{n(document.getElementById(t.elementId),"id",true);}}try{let s=document.querySelectorAll(t.cssSelector);for(let r=0;r<Math.min(s.length,ne);r++)n(s[r]??null,"css",!0);}catch{}try{let s=document.evaluate(t.xpath,document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null),r=Math.min(s.snapshotLength,ne);for(let o=0;o<r;o++){let i=s.snapshotItem(o);i instanceof Element&&n(i,"xpath",!0);}}catch{}return e}function ts(t,e){let n=t.tag.toLowerCase();if(!n)return [];let s;try{s=document.querySelectorAll(n);}catch{return []}let r=t.fingerprint.split(":"),o=r.length===3?Number(r[0]):Number.NaN,i=r.length===3?r[2]??"":"",a=Math.min(s.length,Yn),c=[];for(let p=0;p<a;p++){let u=s[p];if(!u||e.has(u))continue;let g=0;if(t.snippetBigramTotal>0){let h=vt(_(u,Be)),f=wt(t.snippetBigrams,t.snippetBigramTotal,h);if(t.snippetWordPairTotal>0){let x=f>0?Et(t.snippetWordPairs,t.snippetWordPairTotal,h):0;g+=.6*(.5*f+.5*x);}else g+=.6*f;}if(i&&Ae(u)===i&&(g+=.25),!Number.isNaN(o)){let h=Math.abs(u.children.length-o);h===0?g+=.15:h<=2&&(g+=.07);}c.push({element:u,cheap:g});}return c.sort((p,u)=>u.cheap-p.cheap),c.slice(0,Vn).map(p=>p.element)}function At(t,e,n){let s=ss(t,n),r=Tt(St(t));return s===null?e==="scan"?null:{element:t,strategy:e,verification:Le,strongest:Le,visibility:r,final:$[e]*Le*r,unverified:true}:{element:t,strategy:e,verification:s.blend,strongest:s.strongest,signals:s,visibility:r,final:$[e]*s.blend*r}}function ns(t){if(t.strategy==="scan")return t.verification>=qn;if(t.unverified||!t.signals)return  true;let e=t.signals;return e.text===void 0||e.text>=Xn?true:(e.fingerprint??0)>=Fe||(e.context??0)>=Fe||(e.neighbor??0)>=Fe}function ss(t,e){let n=0,s=0,r={blend:0,strongest:0};if(e.snippet){s+=40;let o=H(_(t,Be));r.text=yt(o,e.snippet,.5),n+=r.text*40;}if(e.fingerprint&&(s+=20,r.fingerprint=ft(t,e.fingerprint),n+=r.fingerprint*20),e.prefix||e.suffix){s+=20;let o=0,i=0;if(e.prefix){let a=H(D(t,"before"));o+=a?W(a,e.prefix):0,i++;}if(e.suffix){let a=H(D(t,"after"));o+=a?W(a,e.suffix):0,i++;}i>0&&(r.context=o/i,n+=r.context*20);}if(e.neighbor){s+=20;let o=H(te(t));r.neighbor=o?W(o,e.neighbor):0,n+=r.neighbor*20;}return s===0?null:(r.blend=n/s,r.strongest=Math.max(r.text??0,r.fingerprint??0,r.context??0,r.neighbor??0),r)}function rs(t){let e=t[0],n=t.filter(r=>e.final-r.final<=Zn&&(r===e||e.element.contains(r.element))),s=e;for(let r of n)r!==s&&s.element.contains(r.element)&&(s=r);return s}function os(t){return t.strategy==="scan"?Math.min(t.verification,$.scan):t.unverified?$[t.strategy]:$[t.strategy]*Math.min(1,t.strongest/Re)}function Do(t,e,n){let s=Ie(t,n);if(!s)return null;let r=s.element.getBoundingClientRect(),o=new DOMRect(r.x+e.xPct*r.width,r.y+e.yPct*r.height,e.wPct*r.width,e.hPct*r.height);return {element:s.element,rect:o,confidence:s.confidence,strategy:s.strategy}}var is='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',Pe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',as='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',ls='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',cs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',ds='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',re='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',Ft='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',Lt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',ps='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',us='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>',gs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',hs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',fs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',bs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',ms='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',Yo=`
  /* ============================
     Detail View \u2014 Panel-in-Panel
     ============================ */

  .sp-detail {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--sp-glass-bg);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    z-index: 20;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
    overflow: hidden;
    /* Slid out of view via the transform above \u2014 belt-and-suspenders against
       it ever intercepting clicks meant for what's behind it (the list, the
       panel header) while hidden, regardless of how the transform/clipping
       interacts with a given engine. */
    pointer-events: none;
  }

  .sp-detail--visible {
    transform: translateX(0);
    pointer-events: auto;
  }

  /* Fallback for browsers that cannot deliver a readable "frosted glass":
     drop the translucent background to a solid one so the underlying list
     does not bleed through. Two disjoint cohorts:

       1. No backdrop-filter at all (Firefox <=102, legacy Edge / IE,
          older Chromium on Linux).
       2. Safari / iOS Safari where backdrop-filter is detectable only
          via the -webkit- prefix. Empirically this still includes recent
          Safari (observed on macOS Safari 18.6 in 2026, where
          CSS.supports('backdrop-filter', 'blur(...)') returns false even
          though the unprefixed property has shipped). On these builds the
          long-standing nested-backdrop + transform compositing bug
          silently no-ops the blur on .sp-detail (which is transformed and
          lives inside another backdrop-filter ancestor, .sp-panel), so
          the translucent default is unreadable. Detection is a pure
          feature query: prefixed supported AND unprefixed not. No
          user-agent sniffing.

     Browsers where the glass effect renders correctly (most Chromium,
     modern Firefox, any engine that advertises both property names via
     CSS.supports) are unaffected. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .sp-detail {
      background: var(--sp-bg);
    }
  }

  @supports (-webkit-backdrop-filter: blur(1px)) and (not (backdrop-filter: blur(1px))) {
    .sp-detail {
      background: var(--sp-bg);
    }
  }

  /* ---- Header ---- */

  .sp-detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--sp-border);
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    flex-shrink: 0;
    min-height: 64px;
  }

  .sp-detail-back {
    width: 40px;
    height: 40px;
    border-radius: var(--sp-radius);
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sp-text-tertiary);
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;
  }

  .sp-detail-back:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-detail-back:active {
    transform: scale(0.92);
    transition-duration: 0.1s;
  }

  .sp-detail-back svg {
    width: 18px;
    height: 18px;
  }

  .sp-detail-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sp-text);
    letter-spacing: -0.02em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sp-detail-header .sp-badge {
    flex-shrink: 0;
  }

  /* ---- Content ---- */

  .sp-detail-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
  }

  .sp-detail-content::-webkit-scrollbar {
    width: 6px;
  }

  .sp-detail-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .sp-detail-content::-webkit-scrollbar-thumb {
    background: var(--sp-border);
    border-radius: var(--sp-radius-full);
  }

  .sp-detail-content::-webkit-scrollbar-thumb:hover {
    background: var(--sp-text-tertiary);
  }

  /* ---- Section ---- */

  .sp-detail-section {
    padding: 12px 16px;
    border-bottom: 1px solid var(--sp-border);
    opacity: 0;
    transform: translateY(8px);
    animation: sp-detail-section-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes sp-detail-section-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sp-detail-section:last-child {
    border-bottom: none;
  }

  .sp-detail-section-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-detail-section-title svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }

  /* ---- Status + Actions Section ---- */

  .sp-detail-status {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 0;
  }

  /* Copy Prompt / Agent\uC5D0\uAC8C render inline in the command row \u2014 undo the
     full-width detail variant. Sizes are shaved so all four commands fit
     the panel width on one line (ko labels; wordier locales may wrap). */
  .sp-detail-status .sp-agent-btn--detail {
    width: auto;
    height: 28px;
    margin-top: 0;
    padding: 0 8px;
    font-size: 11px;
    gap: 4px;
    border-radius: var(--sp-radius);
  }

  .sp-detail-status .sp-agent-btn--detail svg {
    width: 13px;
    height: 13px;
  }

  .sp-detail-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: var(--sp-radius-full);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .sp-detail-status-pill--open {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .sp-detail-status-pill--resolved {
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.2);
  }

  .sp-detail-status-pill--in-progress {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .sp-detail-status-pill--wont-fix {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .sp-detail-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sp-detail-actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  .sp-detail-actions button {
    height: 28px;
    padding: 0 8px;
    border-radius: var(--sp-radius);
    font-family: var(--sp-font);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .sp-detail-actions button svg {
    width: 13px;
    height: 13px;
  }

  .sp-detail-btn-resolve {
    border: 1.5px solid #22c55e;
    background: rgba(34, 197, 94, 0.06);
    color: #22c55e;
  }

  .sp-detail-btn-resolve:hover {
    background: rgba(34, 197, 94, 0.14);
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.12);
    transform: translateY(-1px);
  }

  .sp-detail-btn-resolve:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-btn-reopen {
    border: 1.5px solid var(--sp-accent);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
  }

  .sp-detail-btn-reopen:hover {
    background: rgba(var(--sp-accent), 0.14);
    box-shadow: 0 0 16px var(--sp-accent-glow);
    transform: translateY(-1px);
  }

  .sp-detail-btn-reopen:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-btn-delete {
    border: 1.5px solid #ef4444;
    background: rgba(239, 68, 68, 0.06);
    color: #ef4444;
  }

  .sp-detail-btn-delete:hover {
    background: rgba(239, 68, 68, 0.14);
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.12);
    transform: translateY(-1px);
  }

  .sp-detail-btn-delete:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .sp-detail-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    transform: none;
    box-shadow: none;
  }


  /* ---- Message Section ---- */

  .sp-detail-message {
    font-size: 13px;
    line-height: 1.5;
    color: var(--sp-text);
    padding: 10px 12px;
    border-left: 3px solid var(--sp-accent);
    border-radius: 0 var(--sp-radius) var(--sp-radius) 0;
    background: var(--sp-glass-bg-heavy);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .sp-detail-message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  /* The title inside the message header supplies the section label \u2014 kill
     its own bottom margin so the header row stays one line high. */
  .sp-detail-message-header .sp-detail-section-title {
    margin-bottom: 0;
  }

  .sp-detail-message-edit-btn {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s ease;
  }

  .sp-detail-message-edit-btn:hover {
    color: var(--sp-accent);
    border-color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-detail-message-edit-btn svg {
    width: 13px;
    height: 13px;
  }

  .sp-detail-message-textarea {
    width: 100%;
    min-height: 90px;
    padding: 12px 14px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-accent);
    background: var(--sp-glass-bg-heavy);
    color: var(--sp-text);
    font-family: var(--sp-font);
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }

  .sp-detail-message-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .sp-detail-btn-save {
    height: 34px;
    padding: 0 18px;
    border-radius: var(--sp-radius-full);
    border: 1.5px solid #22c55e;
    background: rgba(34, 197, 94, 0.06);
    color: #22c55e;
    font-family: var(--sp-font);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sp-detail-btn-save:hover {
    background: rgba(34, 197, 94, 0.14);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.12);
  }

  .sp-detail-btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ---- Screenshot Section ---- */

  .sp-detail-screenshot {
    display: block;
    width: 100%;
    height: auto;
    max-height: 180px;
    object-fit: contain;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border);
    background: var(--sp-glass-bg-heavy);
  }

  /* ---- \uC218\uC815 \uAC80\uC99D (verify-fix) row under a closed feedback's screenshot ---- */

  .sp-detail-verify-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .sp-detail-verify-label {
    font-size: 11px;
    color: var(--sp-text-tertiary);
    margin-right: auto;
  }

  .sp-detail-verify-btn {
    height: 28px;
    padding: 0 12px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: var(--sp-glass-bg);
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .sp-detail-verify-btn:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
  }

  .sp-detail-verify-btn--keep {
    border-color: rgba(46, 125, 70, 0.4);
    color: #2e7d46;
  }

  .sp-detail-verify-btn--reopen {
    border-color: rgba(179, 38, 30, 0.35);
    color: #b3261e;
  }

  .sp-detail-verify-btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* ---- Metadata Section ---- */

  .sp-detail-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .sp-detail-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sp-detail-meta-row svg {
    width: 13px;
    height: 13px;
    color: var(--sp-text-tertiary);
    flex-shrink: 0;
  }

  /* Label and value share one line \u2014 the stacked two-line rows doubled the
     section's height for five short facts. */
  .sp-detail-meta-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .sp-detail-meta-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    flex-shrink: 0;
    min-width: 40px;
  }

  .sp-detail-meta-value {
    font-size: 12px;
    line-height: 1.4;
    color: var(--sp-text);
    word-break: break-all;
    min-width: 0;
  }

  .sp-detail-meta-value--mono {
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    background: var(--sp-glass-bg-heavy);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--sp-glass-border-subtle);
  }

  .sp-detail-meta-value--secondary {
    color: var(--sp-text-secondary);
    font-size: 12px;
  }

  /* ---- Annotation Section ---- */

  .sp-detail-annotation {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sp-detail-resolution-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    font-size: 12px;
    font-weight: 600;
  }

  .sp-detail-resolution-badge svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .sp-detail-resolution-badge--found {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .sp-detail-resolution-badge--approximate {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .sp-detail-resolution-badge--unresolved {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .sp-detail-reconnect-btn {
    width: auto;
    height: 34px;
    padding: 0 14px;
    font-size: 13px;
  }

  /* Annotation section header \u2014 title left, resolution badge right, one line. */
  .sp-detail-ann-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .sp-detail-ann-header .sp-detail-section-title {
    margin-bottom: 0;
  }

  .sp-detail-ann-header .sp-detail-resolution-badge {
    align-self: center;
    padding: 3px 10px;
    font-size: 11px;
  }

  /* Go-to + reconnect side by side. */
  .sp-detail-ann-actions {
    display: flex;
    gap: 8px;
  }

  .sp-detail-ann-actions .sp-detail-btn-goto {
    flex: 1.4;
    width: auto;
    height: 34px;
    padding: 0 12px;
    font-size: 13px;
  }

  .sp-detail-ann-actions .sp-detail-reconnect-btn,
  .sp-detail-ann-actions .sp-detail-reconnect-picking {
    flex: 1;
  }

  .sp-detail-reconnect-picking {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--sp-radius);
    background: var(--sp-accent-light);
    color: var(--sp-accent);
    font-size: 12px;
    font-weight: 600;
  }

  .sp-detail-annotation-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: var(--sp-radius);
    background: var(--sp-glass-bg-heavy);
    border: 1px solid var(--sp-glass-border-subtle);
  }

  .sp-detail-annotation-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .sp-detail-annotation-row svg {
    width: 13px;
    height: 13px;
    color: var(--sp-text-tertiary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .sp-detail-annotation-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    margin-bottom: 3px;
  }

  .sp-detail-annotation-value {
    font-size: 12px;
    line-height: 1.4;
    color: var(--sp-text);
    word-break: break-all;
  }

  .sp-detail-annotation-value--mono {
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 11px;
    background: var(--sp-bg-hover);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sp-detail-btn-goto {
    width: 100%;
    height: 44px;
    padding: 0 20px;
    border-radius: var(--sp-radius);
    border: none;
    background: var(--sp-accent-fill-gradient, var(--sp-accent-gradient));
    color: var(--sp-accent-fg, #fff);
    font-family: var(--sp-font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 2px 12px var(--sp-accent-glow);
  }

  .sp-detail-btn-goto svg {
    width: 16px;
    height: 16px;
  }

  .sp-detail-btn-goto:hover {
    box-shadow: 0 4px 20px var(--sp-accent-glow);
    transform: translateY(-2px);
  }

  .sp-detail-btn-goto:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  /* ---- Forced Colors / High Contrast ---- */

  @media (forced-colors: active) {
    .sp-detail {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
    }

    .sp-detail-back,
    .sp-detail-btn-goto,
    .sp-detail-btn-resolve,
    .sp-detail-btn-reopen,
    .sp-detail-btn-delete,
    .sp-detail-btn-save,
    .sp-detail-message-edit-btn,
    .sp-detail-message-textarea,
    .sp-detail-resolution-badge,
    .sp-detail-reconnect-picking {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-detail-back:focus-visible,
    .sp-detail-btn-goto:focus-visible,
    .sp-detail-btn-resolve:focus-visible,
    .sp-detail-btn-reopen:focus-visible,
    .sp-detail-btn-delete:focus-visible {
      outline: 3px solid Highlight !important;
    }

    .sp-detail-status-pill {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-detail-message {
      border-left: 3px solid ButtonText !important;
    }
  }

  /* ---- Diagnostics Section ---- */

  .sp-detail-diag {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sp-detail-diag-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg-heavy);
    color: var(--sp-text);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .sp-detail-diag-toggle:hover {
    background: var(--sp-bg-hover);
  }

  .sp-detail-diag-toggle svg {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
  }

  .sp-detail-diag-toggle[aria-expanded="true"] svg {
    transform: rotate(90deg);
  }

  .sp-detail-diag-counts {
    display: inline-flex;
    gap: 6px;
    font-weight: 500;
    color: var(--sp-text-tertiary);
  }

  .sp-detail-diag-count {
    padding: 1px 7px;
    border-radius: var(--sp-radius-full);
    background: var(--sp-bg-hover);
    font-variant-numeric: tabular-nums;
  }

  .sp-detail-diag-count--errors {
    background: rgba(239, 68, 68, 0.14);
    color: #ef4444;
  }

  .sp-detail-diag-body {
    display: none;
    flex-direction: column;
    gap: 14px;
  }

  .sp-detail-diag-body--open {
    display: flex;
  }

  .sp-detail-diag-group-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .sp-detail-diag-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-radius: var(--sp-radius);
    border: 1px solid var(--sp-glass-border-subtle);
    background: var(--sp-glass-bg-heavy);
    max-height: 240px;
    overflow-y: auto;
  }

  .sp-detail-diag-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--sp-glass-border-subtle);
    font-family: "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace;
    font-size: 11px;
    line-height: 1.45;
    color: var(--sp-text);
  }

  .sp-detail-diag-list li:last-child {
    border-bottom: none;
  }

  .sp-detail-diag-level {
    flex-shrink: 0;
    font-weight: 700;
    width: 44px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10px;
  }

  .sp-detail-diag-level--log {
    color: var(--sp-text-tertiary);
  }
  .sp-detail-diag-level--info {
    color: #3b82f6;
  }
  .sp-detail-diag-level--warn {
    color: #f59e0b;
  }
  .sp-detail-diag-level--error {
    color: #ef4444;
  }

  .sp-detail-diag-message {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .sp-detail-diag-net {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .sp-detail-diag-net-status {
    flex-shrink: 0;
    font-weight: 700;
    color: #ef4444;
    min-width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .sp-detail-diag-net-method {
    flex-shrink: 0;
    font-weight: 600;
    color: var(--sp-text-tertiary);
    min-width: 44px;
  }

  .sp-detail-diag-net-url {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--sp-text);
  }

  .sp-detail-diag-empty {
    padding: 12px;
    font-style: italic;
    font-size: 11px;
    color: var(--sp-text-tertiary);
    text-align: center;
  }

  /* ---- Reduced Motion ---- */

  @media (prefers-reduced-motion: reduce) {
    .sp-detail {
      transition-duration: 0.01ms !important;
    }

    .sp-detail-section {
      animation-duration: 0.01ms !important;
    }
  }
`;function xs(t){if(/Edg\//i.test(t)){let e=t.match(/Edg\/([\d.]+)/);return e?`Edge ${e[1]}`:"Edge"}if(/OPR\//i.test(t)||/Opera/i.test(t)){let e=t.match(/OPR\/([\d.]+)/);return e?`Opera ${e[1]}`:"Opera"}if(/Firefox\//i.test(t)){let e=t.match(/Firefox\/([\d.]+)/);return e?`Firefox ${e[1]}`:"Firefox"}if(/Chrome\//i.test(t)&&!/Chromium/i.test(t)){let e=t.match(/Chrome\/([\d.]+)/);return e?`Chrome ${e[1]}`:"Chrome"}if(/Safari\//i.test(t)&&!/Chrome/i.test(t)){let e=t.match(/Version\/([\d.]+)/);return e?`Safari ${e[1]}`:"Safari"}return "Unknown"}function Rt(t,e){try{return new Date(t).toLocaleString(e,{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return t}}function vs(t){try{return new URL(t).pathname}catch{return t}}function ys(t){return !!(/^data:image\/(jpeg|png|webp);/i.test(t)||/^https:\/\//i.test(t))}function oe(t,e){return t.length<=e?t:t.slice(0,e-1)+"\u2026"}function ks(t){if(!t)return  false;let e=Array.isArray(t.console)?t.console.length:0,n=Array.isArray(t.network)?t.network.length:0;return e>0||n>0}function ws(t){return !Number.isFinite(t)||t<0?"\u2014":t<1e3?`${Math.round(t)} ms`:`${(t/1e3).toFixed(1)} s`}var Bt=class{constructor(e,n,s,r,o){this.colors=e;this.callbacks=n;this.t=s,this.locale=r,this.agentCopyBtn=new Q(e,{getFeedbacks:()=>this.currentFeedback?[this.currentFeedback]:[],getContainer:o,variant:"detail"},s),this.element=l("div",{class:"sp-detail"}),this.element.setAttribute("role","dialog"),this.element.setAttribute("aria-label","Feedback detail"),this.element.setAttribute("aria-hidden","true");let i=l("div",{class:"sp-detail-header"}),a=document.createElement("button");a.type="button",a.className="sp-detail-back",a.setAttribute("aria-label",this.t("detail.back")),a.appendChild(b(is)),a.addEventListener("click",()=>{this.hide(),this.callbacks.onBack();}),this.element.appendChild(i),i.appendChild(a),this.content=l("div",{class:"sp-detail-content"}),this.element.appendChild(this.content);}colors;callbacks;element;_isVisible=false;currentFeedback=null;content;t;locale;resolveBtn=null;deleteBtn=null;isProcessing=false;agentCopyBtn;messageSectionEl=null;editingMessage=false;savingMessage=false;annotationSectionEl=null;reconnecting=false;cleanupReconnectPick=null;show(e,n){this.currentFeedback=e,this.isProcessing=false;let s=this.element.querySelector(".sp-detail-header");if(!s)return;let r=s.querySelector(".sp-detail-back");if(!r)return;s.replaceChildren(r);let o=l("span",{class:"sp-detail-title"});d(o,A(this.t,"detail.title",{number:n})),s.appendChild(o);let i=l("span",{class:"sp-badge"});i.style.background=st(e.type,this.colors),i.style.color=ve(e.type,this.colors),d(i,e.type),s.appendChild(i);let a=e.status.replace(/_/g,"-"),c={open:"#22c55e",in_progress:"#f59e0b",resolved:"#9ca3af",wont_fix:"#94a3b8"},p=l("span",{class:`sp-detail-status-pill sp-detail-status-pill--${a}`}),u=l("span",{class:"sp-detail-status-dot"});u.style.background=c[e.status]??c.open,p.appendChild(u);let g=l("span");d(g,Ye(e.status,this.t)),p.appendChild(g),s.appendChild(p),this.content.replaceChildren();let h=0,f=this.buildSection(h++);this.buildStatusActions(f,e),this.content.appendChild(f);let x=this.buildSection(h++);if(this.messageSectionEl=x,this.editingMessage=false,this.savingMessage=false,this.renderMessageSection(e),this.content.appendChild(x),e.screenshotUrl&&ys(e.screenshotUrl)){let y=this.buildSection(h++),k=l("div",{class:"sp-detail-section-title"});d(k,this.t("detail.screenshot")),y.appendChild(k);let w=document.createElement("img");if(w.className="sp-detail-screenshot",w.src=e.screenshotUrl,w.alt=this.t("detail.screenshotAlt"),w.loading="lazy",w.referrerPolicy="no-referrer",y.appendChild(w),T(e.status)){let C=l("div",{class:"sp-detail-verify-row"}),E=l("span",{class:"sp-detail-verify-label"});d(E,this.t("detail.verifyThen")),C.appendChild(E);let S=document.createElement("button");S.className="sp-detail-verify-btn",d(S,this.t("detail.verifyNow")),S.addEventListener("click",()=>this.callbacks.onGoToAnnotation(e)),C.appendChild(S);let B=document.createElement("button");B.className="sp-detail-verify-btn sp-detail-verify-btn--keep",d(B,this.t("detail.verifyKeepResolved")),B.addEventListener("click",()=>{C.remove();}),C.appendChild(B);let N=document.createElement("button");N.className="sp-detail-verify-btn sp-detail-verify-btn--reopen",d(N,this.t("detail.verifyReopen")),N.addEventListener("click",()=>{N.disabled=true,this.callbacks.onResolve(e).catch(()=>{N.disabled=false;});}),C.appendChild(N),y.appendChild(C);}this.content.appendChild(y);}let m=this.buildSection(h++),v=l("div",{class:"sp-detail-section-title"});if(d(v,this.t("detail.metadata")),m.appendChild(v),this.buildMetadata(m,e),this.content.appendChild(m),e.annotations.length>0){let y=this.buildSection(h++);this.annotationSectionEl=y,this.reconnecting=false,this.cleanupReconnectPick?.(),this.cleanupReconnectPick=null,this.renderAnnotationSection(e),this.content.appendChild(y);}else this.annotationSectionEl=null;if(ks(e.diagnostics)){let y=this.buildSection(h++),k=l("div",{class:"sp-detail-section-title"});k.appendChild(b(hs));let w=l("span");d(w,this.t("detail.diagnostics")),k.appendChild(w),y.appendChild(k),this.buildDiagnostics(y,e),this.content.appendChild(y);}this._isVisible=true,this.element.setAttribute("aria-hidden","false"),this.element.offsetHeight,this.element.classList.add("sp-detail--visible"),requestAnimationFrame(()=>{r.focus();});}hide(){this._isVisible&&(this._isVisible=false,this.element.classList.remove("sp-detail--visible"),this.element.setAttribute("aria-hidden","true"),this.currentFeedback=null,this.resolveBtn=null,this.deleteBtn=null,this.cleanupReconnectPick?.(),this.cleanupReconnectPick=null,this.reconnecting=false);}get isVisible(){return this._isVisible}destroy(){this.hide(),this.agentCopyBtn.destroy(),this.element.remove();}buildSection(e){let n=l("div",{class:"sp-detail-section"});return n.style.animationDelay=`${e*40}ms`,n}buildStatusActions(e,n){let s=T(n.status),r=l("div",{class:"sp-detail-status"});e.appendChild(r);let o=l("div",{class:"sp-detail-actions"});if(this.resolveBtn=document.createElement("button"),this.resolveBtn.type="button",s){this.resolveBtn.className="sp-detail-btn-reopen",this.resolveBtn.appendChild(b(Ft));let a=document.createElement("span");d(a,this.t("detail.reopen")),this.resolveBtn.appendChild(a);}else {this.resolveBtn.className="sp-detail-btn-resolve",this.resolveBtn.appendChild(b(re));let a=document.createElement("span");d(a,this.t("detail.resolve")),this.resolveBtn.appendChild(a);}this.resolveBtn.addEventListener("click",()=>this.handleResolve()),this.deleteBtn=document.createElement("button"),this.deleteBtn.type="button",this.deleteBtn.className="sp-detail-btn-delete",this.deleteBtn.appendChild(b(Lt));let i=document.createElement("span");if(d(i,this.t("detail.delete")),this.deleteBtn.appendChild(i),this.deleteBtn.addEventListener("click",()=>this.handleDelete()),o.appendChild(this.resolveBtn),o.appendChild(this.deleteBtn),r.appendChild(this.agentCopyBtn.element),this.callbacks.onHandoff){let a=document.createElement("button");a.type="button",a.className="sp-agent-btn sp-agent-btn--detail";let c=document.createElement("span");d(c,`\u21E5 ${this.t("agent.sendToAgent")}`),a.appendChild(c),a.addEventListener("click",async()=>{a.disabled=true;let p=await this.callbacks.onHandoff?.(n);a.disabled=false,p&&(d(c,`\u2713 ${this.t("agent.handedOff")}`),setTimeout(()=>d(c,`\u21E5 ${this.t("agent.sendToAgent")}`),2e3));}),r.appendChild(a);}r.appendChild(o);}renderMessageSection(e){let n=this.messageSectionEl;if(!n)return;n.replaceChildren();let s=l("div",{class:"sp-detail-message-header"}),r=l("div",{class:"sp-detail-section-title"});if(d(r,this.t("detail.message")),s.appendChild(r),!this.editingMessage){let p=document.createElement("button");p.type="button",p.className="sp-detail-message-edit-btn",p.setAttribute("aria-label",this.t("detail.editMessage")),p.appendChild(b(fs)),p.addEventListener("click",()=>{this.editingMessage=true,this.renderMessageSection(e);}),s.appendChild(p),n.appendChild(s);let u=l("div",{class:"sp-detail-message"});u.style.borderLeftColor=ve(e.type,this.colors),d(u,e.message),n.appendChild(u);return}n.appendChild(s);let o=document.createElement("textarea");o.className="sp-detail-message-textarea",o.value=e.message,o.setAttribute("aria-label",this.t("detail.editMessage")),o.disabled=this.savingMessage,n.appendChild(o);let i=l("div",{class:"sp-detail-message-actions"}),a=document.createElement("button");a.type="button",a.className="sp-btn-ghost",d(a,this.t("panel.cancel")),a.disabled=this.savingMessage,a.addEventListener("click",()=>{this.editingMessage=false,this.renderMessageSection(e);});let c=document.createElement("button");c.type="button",c.className="sp-detail-btn-save",d(c,this.t("detail.saveMessage")),c.addEventListener("click",()=>{let p=o.value.trim();!p||this.savingMessage||(this.savingMessage=true,o.disabled=true,c.disabled=true,a.disabled=true,this.callbacks.onEditMessage(e,p).then(()=>{}).catch(()=>{this.savingMessage=false,o.disabled=false,c.disabled=false,a.disabled=false,o.focus();}));}),i.appendChild(a),i.appendChild(c),n.appendChild(i),requestAnimationFrame(()=>o.focus());}buildMetadata(e,n){let s=l("div",{class:"sp-detail-meta"});if(this.addMetaRow(s,as,this.t("detail.page"),()=>{let r=l("div",{class:"sp-detail-meta-value"}),o=vs(n.url);return d(r,oe(o,60)),r.title=n.url,r}),this.addMetaRow(s,ls,this.t("detail.author"),()=>{let r=l("div",{class:"sp-detail-meta-value"}),o=n.authorName||"Anonymous",i=n.authorEmail;return d(r,i?`${o} (${i})`:o),r}),this.addMetaRow(s,cs,this.t("detail.date"),()=>{let r=l("div",{class:"sp-detail-meta-value"});return d(r,Rt(n.createdAt,this.locale.startsWith("fr")?"fr":"en")),r}),this.addMetaRow(s,ds,this.t("detail.browser"),()=>{let r=l("div",{class:"sp-detail-meta-value"}),o=n.viewport?` \xB7 ${n.viewport}`:"";return d(r,`${xs(n.userAgent)}${o}`),r}),n.resolvedAt){let r=n.resolvedAt,o=n.status==="wont_fix"?this.t("detail.closedAt"):this.t("detail.resolvedAt");this.addMetaRow(s,re,o,()=>{let i=l("div",{class:"sp-detail-meta-value sp-detail-meta-value--secondary"});return d(i,Rt(r,this.locale.startsWith("fr")?"fr":"en")),i});}e.appendChild(s);}addMetaRow(e,n,s,r){let o=l("div",{class:"sp-detail-meta-row"});o.appendChild(b(n));let i=l("div",{class:"sp-detail-meta-content"}),a=l("div",{class:"sp-detail-meta-label"});d(a,s),i.appendChild(a),i.appendChild(r()),o.appendChild(i),e.appendChild(o);}renderAnnotationSection(e){let n=this.annotationSectionEl,s=e.annotations[0];if(!n||!s)return;n.replaceChildren();let r=l("div",{class:"sp-detail-section-title"});r.appendChild(b(Pe));let o=l("span");d(o,this.t("detail.annotation")),r.appendChild(o);let a=(s.target?.kind??"element")!=="area",c=l("div",{class:"sp-detail-ann-header"});c.appendChild(r),a&&c.appendChild(this.buildResolutionStatus(s)),n.appendChild(c);let p=l("div",{class:"sp-detail-annotation"}),u=l("div",{class:"sp-detail-annotation-info"});this.addAnnotationRow(u,ps,this.t("detail.element"),()=>{let x=l("span",{class:"sp-detail-annotation-value sp-detail-annotation-value--mono"}),m=s.elementId?`<${s.elementTag}#${s.elementId}>`:`<${s.elementTag}>`;return d(x,m),x}),this.addAnnotationRow(u,us,this.t("detail.selector"),()=>{let x=l("span",{class:"sp-detail-annotation-value sp-detail-annotation-value--mono"});return d(x,oe(s.cssSelector,60)),x.title=s.cssSelector,x}),this.addAnnotationRow(u,Pe,this.t("detail.position"),()=>{let x=l("span",{class:"sp-detail-annotation-value"});return d(x,`${s.xPct.toFixed(1)}%, ${s.yPct.toFixed(1)}%`+(s.wPct>0||s.hPct>0?` (${s.wPct.toFixed(1)}% \xD7 ${s.hPct.toFixed(1)}%)`:"")),x}),p.appendChild(u);let g=document.createElement("button");g.type="button",g.className="sp-detail-btn-goto",g.appendChild(b(Pe));let h=document.createElement("span");d(h,this.t("detail.goToAnnotation")),g.appendChild(h),g.addEventListener("click",()=>{this.currentFeedback&&this.callbacks.onGoToAnnotation(this.currentFeedback);});let f=l("div",{class:"sp-detail-ann-actions"});f.appendChild(g),a&&f.appendChild(this.buildReconnectButton(e)),p.appendChild(f),n.appendChild(p);}buildResolutionStatus(e){let n=typeof document<"u"?Ie({cssSelector:e.cssSelector,xpath:e.xpath,textSnippet:e.textSnippet,elementTag:e.elementTag,elementId:e.elementId??void 0,textPrefix:e.textPrefix,textSuffix:e.textSuffix,fingerprint:e.fingerprint,neighborText:e.neighborText,anchorKey:e.anchorKey??null}):null,s=l("div",{class:"sp-detail-resolution-badge"});if(n)if(n.confidence<.7){s.classList.add("sp-detail-resolution-badge--approximate"),s.appendChild(b(bs));let r=l("span");d(r,A(this.t,"detail.targetApproximate",{confidence:Math.round(n.confidence*100)})),s.appendChild(r);}else {s.classList.add("sp-detail-resolution-badge--found"),s.appendChild(b(re));let r=l("span");d(r,this.t("detail.targetFound")),s.appendChild(r);}else {s.classList.add("sp-detail-resolution-badge--unresolved"),s.appendChild(b(ms));let r=l("span");d(r,this.t("detail.targetNotFound")),s.appendChild(r);}return s}buildReconnectButton(e){if(this.reconnecting){let s=l("div",{class:"sp-detail-reconnect-picking"}),r=l("span");d(r,this.t("detail.reconnectPicking"));let o=document.createElement("button");return o.type="button",o.className="sp-btn-ghost",d(o,this.t("detail.reconnectCancel")),o.addEventListener("click",()=>this.stopReconnectPick(e)),s.appendChild(r),s.appendChild(o),s}let n=document.createElement("button");return n.type="button",n.className="sp-btn-ghost sp-detail-reconnect-btn",d(n,this.t("detail.reconnect")),n.addEventListener("click",()=>this.startReconnectPick(e)),n}startReconnectPick(e){if(this.reconnecting)return;this.reconnecting=true,this.renderAnnotationSection(e);let n=o=>{let i=o.target;!(i instanceof HTMLElement)||j(i)||(o.preventDefault(),o.stopPropagation(),this.finishReconnectPick(e,i));},s=o=>{o.key==="Escape"&&this.stopReconnectPick(e);};document.addEventListener("click",n,true),document.addEventListener("keydown",s,true);let r=document.body.style.cursor;document.body.style.cursor="crosshair",this.cleanupReconnectPick=()=>{document.removeEventListener("click",n,true),document.removeEventListener("keydown",s,true),document.body.style.cursor=r;};}stopReconnectPick(e){this.cleanupReconnectPick?.(),this.cleanupReconnectPick=null,this.reconnecting=false,this.renderAnnotationSection(e);}finishReconnectPick(e,n){this.cleanupReconnectPick?.(),this.cleanupReconnectPick=null,this.reconnecting=false;let s={anchor:xt(n),rect:{xPct:0,yPct:0,wPct:1,hPct:1},scrollX:window.scrollX,scrollY:window.scrollY,viewportW:window.innerWidth,viewportH:window.innerHeight,devicePixelRatio:window.devicePixelRatio,target:{kind:"element"}};this.callbacks.onReconnect(e,[s]).catch(()=>{this.renderAnnotationSection(e);}),this.renderAnnotationSection(e);}buildDiagnostics(e,n){let s=n.diagnostics;if(!s)return;let r=Array.isArray(s.console)?s.console:[],o=Array.isArray(s.network)?s.network:[],i=r.filter(m=>m.level==="error").length,a=l("div",{class:"sp-detail-diag"}),c=document.createElement("button");c.type="button",c.className="sp-detail-diag-toggle",c.setAttribute("aria-expanded","false"),c.setAttribute("aria-label",this.t("detail.diagnostics.expand"));let p=document.createElement("span"),u=document.createElement("span");u.style.display="inline-flex",u.style.alignItems="center",u.style.gap="8px",u.appendChild(b(gs)),d(p,this.t("detail.diagnostics")),u.appendChild(p),c.appendChild(u);let g=l("span",{class:"sp-detail-diag-counts"}),h=l("span",{class:`sp-detail-diag-count${i>0?" sp-detail-diag-count--errors":""}`});d(h,`${r.length} console`);let f=l("span",{class:`sp-detail-diag-count${o.length>0?" sp-detail-diag-count--errors":""}`});d(f,`${o.length} net`),g.appendChild(h),g.appendChild(f),c.appendChild(g);let x=l("div",{class:"sp-detail-diag-body"});if(r.length>0){let m=document.createElement("div"),v=l("div",{class:"sp-detail-diag-group-title"});d(v,this.t("detail.diagnostics.console")),m.appendChild(v);let y=document.createElement("ul");y.className="sp-detail-diag-list";for(let k of r){let w=document.createElement("li"),C=l("span",{class:`sp-detail-diag-level sp-detail-diag-level--${k.level}`});d(C,k.level);let E=l("span",{class:"sp-detail-diag-message"});d(E,oe(k.message,240)),E.title=k.message,w.appendChild(C),w.appendChild(E),y.appendChild(w);}m.appendChild(y),x.appendChild(m);}if(o.length>0){let m=document.createElement("div"),v=l("div",{class:"sp-detail-diag-group-title"});d(v,this.t("detail.diagnostics.network")),m.appendChild(v);let y=document.createElement("ul");y.className="sp-detail-diag-list";for(let k of o){let w=document.createElement("li");w.classList.add("sp-detail-diag-net");let C=l("span",{class:"sp-detail-diag-net-status"});d(C,k.status===0?"ERR":String(k.status));let E=l("span",{class:"sp-detail-diag-net-method"});d(E,k.method);let S=l("span",{class:"sp-detail-diag-net-url"});d(S,oe(k.url,120)),S.title=`${k.url} \u2014 ${ws(k.durationMs)}`,w.appendChild(C),w.appendChild(E),w.appendChild(S),y.appendChild(w);}m.appendChild(y),x.appendChild(m);}c.addEventListener("click",()=>{let v=!(c.getAttribute("aria-expanded")==="true");c.setAttribute("aria-expanded",String(v)),c.setAttribute("aria-label",v?this.t("detail.diagnostics.collapse"):this.t("detail.diagnostics.expand")),x.classList.toggle("sp-detail-diag-body--open",v);}),a.appendChild(c),a.appendChild(x),e.appendChild(a);}addAnnotationRow(e,n,s,r){let o=l("div",{class:"sp-detail-annotation-row"});o.appendChild(b(n));let i=l("div",{class:"sp-detail-meta-content"}),a=l("div",{class:"sp-detail-annotation-label"});d(a,s),i.appendChild(a),i.appendChild(r()),o.appendChild(i),e.appendChild(o);}async handleResolve(){if(!(this.isProcessing||!this.currentFeedback)){this.isProcessing=true,this.resolveBtn&&this.setButtonLoading(this.resolveBtn),this.deleteBtn&&(this.deleteBtn.disabled=true);try{await this.callbacks.onResolve(this.currentFeedback);}catch{this.isProcessing=false,this.resolveBtn&&this.restoreResolveBtn(this.currentFeedback),this.deleteBtn&&(this.deleteBtn.disabled=false);}}}async handleDelete(){if(!(this.isProcessing||!this.currentFeedback)){this.isProcessing=true,this.deleteBtn&&this.setButtonLoading(this.deleteBtn),this.resolveBtn&&(this.resolveBtn.disabled=true);try{await this.callbacks.onDelete(this.currentFeedback);}catch{this.isProcessing=false,this.deleteBtn&&this.restoreDeleteBtn(),this.resolveBtn&&(this.resolveBtn.disabled=false);}}}setButtonLoading(e){e.disabled=true,e.replaceChildren(l("div",{class:"sp-spinner sp-spinner--sm"}));}restoreResolveBtn(e){if(!this.resolveBtn)return;this.resolveBtn.disabled=false,this.resolveBtn.replaceChildren();let n=T(e.status);this.resolveBtn.appendChild(b(n?Ft:re));let s=document.createElement("span");d(s,n?this.t("detail.reopen"):this.t("detail.resolve")),this.resolveBtn.appendChild(s);}restoreDeleteBtn(){if(!this.deleteBtn)return;this.deleteBtn.disabled=false,this.deleteBtn.replaceChildren(),this.deleteBtn.appendChild(b(Lt));let e=document.createElement("span");d(e,this.t("detail.delete")),this.deleteBtn.appendChild(e);}};var Cs='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/></svg>',Mt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',Es='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',It={question:0,change:1,bug:2,other:3};function Zo(t,e){let n=[...t];switch(e){case "newest":n.sort((s,r)=>new Date(r.createdAt).getTime()-new Date(s.createdAt).getTime());break;case "oldest":n.sort((s,r)=>new Date(s.createdAt).getTime()-new Date(r.createdAt).getTime());break;case "by-type":n.sort((s,r)=>{let o=It[s.type]??99,i=It[r.type]??99;return o!==i?o-i:new Date(r.createdAt).getTime()-new Date(s.createdAt).getTime()});break;case "open-first":n.sort((s,r)=>{let o=T(s.status)?1:0,i=T(r.status)?1:0;return o!==i?o-i:new Date(r.createdAt).getTime()-new Date(s.createdAt).getTime()});break}return n}function Ss(t){try{return new URL(t).pathname}catch{return t}}function Ts(t,e){if(t.length<=e)return t;let n="\u2026",s=Math.floor((e-1)/2);return t.slice(0,s)+n+t.slice(-s)}function Jo(t){let e=new Map;for(let s of t){let r=Ss(s.url),o=e.get(r);o?o.push(s):e.set(r,[s]);}return new Map([...e.entries()].sort((s,r)=>r[1].length-s[1].length))}function ei(t,e,n){let s=l("div",{class:"sp-group-header"});s.setAttribute("role","button"),s.setAttribute("tabindex","0"),s.setAttribute("aria-expanded","true"),s.style.borderBottomColor=n.border;let r=l("span",{class:"sp-group-header-chevron"});r.appendChild(b(Es)),s.appendChild(r);let o=l("span",{class:"sp-group-header-icon"});o.appendChild(b(Mt)),s.appendChild(o);let i=l("span",{class:"sp-group-header-path"}),a=Ts(t,40);d(i,a),t.length>40&&(i.title=t),s.appendChild(i);let c=l("span",{class:"sp-group-header-count"});c.style.background=n.accentLight,c.style.color=n.accent,d(c,String(e)),s.appendChild(c);let p=()=>{let u=s.getAttribute("aria-expanded")==="true";s.setAttribute("aria-expanded",String(!u)),s.classList.toggle("sp-group-header--collapsed",u);let g=s.nextElementSibling;g?.classList.contains("sp-group-content")&&g.classList.toggle("sp-group-content--collapsed",u);};return s.addEventListener("click",p),s.addEventListener("keydown",u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),p());}),s}var Pt=class{element;_sortMode="newest";_groupByPage=false;menuEl=null;sortBtn;groupToggle;t;colors;onChange;outsideClickHandler=null;constructor(e,n,s){this.colors=e,this.onChange=n,this.t=s,this.element=l("div",{class:"sp-sort-controls"}),this.sortBtn=document.createElement("button"),this.sortBtn.className="sp-sort-btn",this.sortBtn.setAttribute("aria-haspopup","listbox"),this.sortBtn.setAttribute("aria-expanded","false"),this.sortBtn.setAttribute("aria-label",this.t("sort.label"));let r=b(Cs);this.sortBtn.appendChild(r);let o=l("span",{class:"sp-sort-btn-label"});d(o,this.t("sort.newest")),this.sortBtn.appendChild(o),this.sortBtn.addEventListener("click",c=>{c.stopPropagation(),this.toggleMenu();}),this.groupToggle=document.createElement("button"),this.groupToggle.className="sp-group-toggle",this.groupToggle.setAttribute("aria-pressed","false");let i=b(Mt);this.groupToggle.appendChild(i);let a=l("span",{class:"sp-group-toggle-label"});d(a,this.t("group.byPage")),this.groupToggle.appendChild(a),this.groupToggle.addEventListener("click",()=>{this._groupByPage=!this._groupByPage,this.groupToggle.classList.toggle("sp-group-toggle--active",this._groupByPage),this.groupToggle.setAttribute("aria-pressed",String(this._groupByPage)),this.onChange();}),this.element.appendChild(this.sortBtn),this.element.appendChild(this.groupToggle);}get sortMode(){return this._sortMode}get groupByPage(){return this._groupByPage}toggleMenu(){if(this.menuEl){this.closeMenu();return}this.openMenu();}openMenu(){this.menuEl=l("div",{class:"sp-sort-menu"}),this.menuEl.setAttribute("role","listbox"),this.menuEl.setAttribute("aria-label",this.t("sort.label")),this.sortBtn.setAttribute("aria-expanded","true");let e=[{mode:"newest",label:this.t("sort.newest")},{mode:"oldest",label:this.t("sort.oldest")},{mode:"by-type",label:this.t("sort.byType")},{mode:"open-first",label:this.t("sort.openFirst")}];for(let n of e){let s=document.createElement("button");s.className=`sp-sort-option${n.mode===this._sortMode?" sp-sort-option--active":""}`,s.setAttribute("role","option"),s.setAttribute("aria-selected",String(n.mode===this._sortMode)),n.mode===this._sortMode&&(s.style.background=this.colors.accentLight,s.style.color=this.colors.accent),d(s,n.label),s.addEventListener("click",r=>{r.stopPropagation(),this._sortMode=n.mode,this.updateSortLabel(),this.closeMenu(),this.onChange();}),this.menuEl.appendChild(s);}this.element.appendChild(this.menuEl),requestAnimationFrame(()=>{this.outsideClickHandler=n=>{this.menuEl&&!this.element.contains(n.target)&&this.closeMenu();},document.addEventListener("click",this.outsideClickHandler,true);}),this.menuEl.addEventListener("keydown",n=>{n.key==="Escape"&&(this.closeMenu(),this.sortBtn.focus());});}closeMenu(){this.menuEl&&(this.menuEl.remove(),this.menuEl=null),this.sortBtn.setAttribute("aria-expanded","false"),this.outsideClickHandler&&(document.removeEventListener("click",this.outsideClickHandler,true),this.outsideClickHandler=null);}updateSortLabel(){let e={newest:this.t("sort.newest"),oldest:this.t("sort.oldest"),"by-type":this.t("sort.byType"),"open-first":this.t("sort.openFirst")},n=this.sortBtn.querySelector(".sp-sort-btn-label");n&&d(n,e[this._sortMode]);}destroy(){this.closeMenu();}},ti=`
  /* ============================
     Sort Controls Container
     ============================ */

  .sp-sort-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--sp-border);
  }

  /* Inline variant \u2014 sitting in the header action bar's spare space
     (panel.ts) instead of its own bordered row under the filters. */
  .sp-sort-controls--inline {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    margin-left: auto;
  }

  /* Near the panel's right edge, a left-aligned 170px menu would overflow \u2014
     hang it from the button's right edge instead. */
  .sp-sort-controls--inline .sp-sort-menu {
    left: auto;
    right: 0;
  }

  /* ============================
     Sort Dropdown Button
     ============================ */

  .sp-sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    border: 1px solid transparent;
    background: transparent;
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    position: relative;
  }

  .sp-sort-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .sp-sort-btn:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-sort-btn[aria-expanded="true"] {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  /* ============================
     Sort Floating Menu
     ============================ */

  .sp-sort-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 170px;
    padding: 4px;
    border-radius: var(--sp-radius);
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-md);
    z-index: 10;
    animation: sp-sort-menu-in 0.15s ease-out both;
  }

  @keyframes sp-sort-menu-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ============================
     Sort Menu Option
     ============================ */

  .sp-sort-option {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .sp-sort-option:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-sort-option--active {
    font-weight: 600;
  }

  .sp-sort-option--active:hover {
    background: var(--sp-accent-light);
    color: var(--sp-accent);
  }

  /* ============================
     Group by Page Toggle
     ============================ */

  .sp-group-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: var(--sp-radius-full);
    border: 1px solid transparent;
    background: transparent;
    color: var(--sp-text-secondary);
    font-family: var(--sp-font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .sp-group-toggle svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .sp-group-toggle:hover {
    border-color: var(--sp-accent);
    color: var(--sp-accent);
    background: var(--sp-accent-light);
  }

  .sp-group-toggle--active {
    background: var(--sp-accent-fill-gradient, var(--sp-accent-gradient));
    border-color: transparent;
    color: var(--sp-accent-fg, #fff);
    box-shadow: 0 2px 8px var(--sp-accent-glow);
  }

  .sp-group-toggle--active:hover {
    background: var(--sp-accent-fill-gradient, var(--sp-accent-gradient));
    border-color: transparent;
    color: var(--sp-accent-fg, #fff);
  }

  /* ============================
     Page Group Header
     ============================ */

  .sp-group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--sp-accent-light);
    border-bottom: 1px solid var(--sp-border);
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 2;
    transition: background 0.2s ease;
  }

  .sp-group-header:hover {
    background: var(--sp-bg-hover);
  }

  .sp-group-header:focus-visible {
    outline: 2px solid var(--sp-accent);
    outline-offset: -2px;
  }

  .sp-group-header-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    transform: rotate(90deg);
  }

  .sp-group-header-chevron svg {
    width: 12px;
    height: 12px;
    color: var(--sp-text-tertiary);
  }

  .sp-group-header--collapsed .sp-group-header-chevron {
    transform: rotate(0deg);
  }

  .sp-group-header-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .sp-group-header-icon svg {
    width: 14px;
    height: 14px;
    color: var(--sp-text-tertiary);
  }

  .sp-group-header-path {
    font-size: 12px;
    font-weight: 600;
    color: var(--sp-text-secondary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sp-group-header-count {
    font-size: 11px;
    font-weight: 700;
    padding: 1px 8px;
    border-radius: var(--sp-radius-full);
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  /* ============================
     Page Group Content
     ============================ */

  .sp-group-content {
    overflow: hidden;
    transition: max-height 0.25s ease, opacity 0.2s ease;
    max-height: 5000px;
    opacity: 1;
  }

  .sp-group-content--collapsed {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }

  /* ============================
     Forced Colors / High Contrast
     ============================ */

  @media (forced-colors: active) {
    .sp-sort-btn,
    .sp-group-toggle,
    .sp-sort-option,
    .sp-group-header {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: ButtonText !important;
    }

    .sp-sort-btn:focus-visible,
    .sp-group-toggle:focus-visible,
    .sp-sort-option:focus-visible,
    .sp-group-header:focus-visible {
      outline: 3px solid Highlight !important;
    }

    .sp-sort-menu {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
    }
  }

  /* ============================
     Reduced Motion
     ============================ */

  @media (prefers-reduced-motion: reduce) {
    .sp-sort-menu {
      animation: none;
    }
    .sp-group-header-chevron {
      transition: none;
    }
    .sp-group-content {
      transition: none;
    }
  }
`;var ii=`
  .sp-stats-bar {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--sp-border);
    user-select: none;
  }

  .sp-stats-bar[hidden] {
    display: none;
  }

  .sp-stats-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .sp-stats-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-stats-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sp-stats-value {
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
    color: var(--sp-text);
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    transition: opacity 0.3s ease;
  }

  .sp-stats-label {
    font-size: 11px;
    line-height: 1;
    color: var(--sp-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .sp-stats-progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sp-stats-progress-track {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--sp-border);
    overflow: hidden;
  }

  .sp-stats-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--sp-accent), #22c55e);
    width: 0%;
    transition: width 0.5s ease;
  }

  .sp-stats-progress-label {
    font-size: 10px;
    line-height: 1;
    color: var(--sp-text-tertiary);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    min-width: 64px;
    text-align: right;
  }
`,Nt=class{constructor(e,n){this.colors=e;this.t=n,this.element=l("div",{class:"sp-stats-bar"}),this.element.setAttribute("aria-label","Feedback statistics"),this.element.hidden=true;let s=l("div",{class:"sp-stats-row"}),r=l("div",{class:"sp-stats-item"}),o=l("span",{class:"sp-stats-dot"});o.style.background="#22c55e",this.valueOpen=l("span",{class:"sp-stats-value"}),d(this.valueOpen,"0");let i=l("span",{class:"sp-stats-label"});d(i,this.t("stats.open")),r.appendChild(o),r.appendChild(this.valueOpen),r.appendChild(i);let a=l("div",{class:"sp-stats-item"}),c=l("span",{class:"sp-stats-dot"});c.style.background="#9ca3af",this.valueResolved=l("span",{class:"sp-stats-value"}),d(this.valueResolved,"0");let p=l("span",{class:"sp-stats-label"});d(p,this.t("stats.resolved")),a.appendChild(c),a.appendChild(this.valueResolved),a.appendChild(p);let u=l("div",{class:"sp-stats-item"}),g=l("span",{class:"sp-stats-dot"});g.style.background=this.colors.typeBug,this.valueBugs=l("span",{class:"sp-stats-value"}),d(this.valueBugs,"0");let h=l("span",{class:"sp-stats-label"});d(h,this.t("stats.bugs")),u.appendChild(g),u.appendChild(this.valueBugs),u.appendChild(h),s.appendChild(r),s.appendChild(a),s.appendChild(u);let f=l("div",{class:"sp-stats-progress"}),x=l("div",{class:"sp-stats-progress-track"});this.progressFill=l("div",{class:"sp-stats-progress-fill"}),x.appendChild(this.progressFill),this.progressLabel=l("span",{class:"sp-stats-progress-label"}),d(this.progressLabel,""),f.appendChild(x),f.appendChild(this.progressLabel),this.element.appendChild(s),this.element.appendChild(f);}colors;element;valueOpen;valueResolved;valueBugs;progressFill;progressLabel;t;update(e,n){if(n===0){this.element.hidden=true;return}this.element.hidden=false;let s=0,r=0,o=0;for(let p of e)T(p.status)?r++:s++,p.type==="bug"&&o++;d(this.valueOpen,String(s)),d(this.valueResolved,String(r)),d(this.valueBugs,String(o));let i=e.length,a=i>0?Math.round(r/i*100):0;requestAnimationFrame(()=>{this.progressFill.style.width=`${a}%`;});let c=A(this.t,"stats.progress",{percent:a});d(this.progressLabel,c);}};var V=class{element;current;opts;onChange;datasetKey;constructor(e){this.opts=e.options,this.current=e.value,this.onChange=e.onChange,this.datasetKey=e.datasetKey,this.element=l("div",{class:`sp-segmented${e.extraClass?` ${e.extraClass}`:""}`,role:"radiogroup"}),this.element.setAttribute("aria-label",e.ariaLabel);for(let n of this.opts){let s=document.createElement("button");s.type="button",s.className=e.modifierPrefix!==void 0?`sp-segmented__btn ${e.modifierPrefix}${n.value}`:"sp-segmented__btn",s.dataset[this.datasetKey]=n.value,s.setAttribute("role","radio");let r=this.current===n.value;if(s.setAttribute("aria-checked",String(r)),s.tabIndex=r?0:-1,r&&s.classList.add("sp-segmented__btn--active"),n.color&&s.style.setProperty("--sp-chip-color",n.color),n.bg&&s.style.setProperty("--sp-chip-bg",n.bg),n.icon){let i=l("span",{class:"sp-segmented__icon"});i.appendChild(b(n.icon)),s.appendChild(i);}let o=l("span",{class:"sp-segmented__label"});d(o,n.label),s.appendChild(o),s.addEventListener("click",()=>this.select(n.value)),s.addEventListener("keydown",i=>this.handleKey(i,n.value)),this.element.appendChild(s);}}select(e){this.current=e,this.syncSelection(),this.onChange(e);}syncSelection(){let e=this.element.querySelectorAll(".sp-segmented__btn");for(let n of e){let s=n.dataset[this.datasetKey]===this.current;n.classList.toggle("sp-segmented__btn--active",s),n.setAttribute("aria-checked",String(s)),n.tabIndex=s?0:-1;}}setOptionVisible(e,n){let s=this.element.querySelector(`[data-${this.kebabKey()}="${e}"]`);return s?(s.style.display=n?"":"none",true):false}get value(){return this.current}focusOption(e){this.element.querySelector(`[data-${this.kebabKey()}="${e}"]`)?.focus();}handleKey(e,n){let s=this.opts.map(a=>a.value).filter(a=>{let c=this.element.querySelector(`[data-${this.kebabKey()}="${a}"]`);return c!==null&&c.style.display!=="none"}),r=s.indexOf(n);if(r<0)return;let o;switch(e.key){case "ArrowLeft":o=(r-1+s.length)%s.length;break;case "ArrowRight":o=(r+1)%s.length;break;case "Home":o=0;break;case "End":o=s.length-1;break;default:return}e.preventDefault();let i=s[o];i!==void 0&&(this.select(i),this.focusOption(i));}kebabKey(){return this.datasetKey.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}};var As=[{code:"ko",label:"\uD55C\uAD6D\uC5B4"},{code:"en",label:"English"},{code:"fr",label:"Fran\xE7ais"},{code:"de",label:"Deutsch"},{code:"es",label:"Espa\xF1ol"},{code:"it",label:"Italiano"},{code:"pt",label:"Portugu\xEAs"},{code:"ru",label:"\u0420\u0443\u0441\u0441\u043A\u0438\u0439"}],Fs=["#0066ff","#173CFF","#7C3AED","#059669","#E11D48","#EA580C"],gi=`
  .sp-settings {
    flex-shrink: 0;
    border-bottom: 1px solid var(--sp-border);
  }

  .sp-settings-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .sp-settings-toggle:hover {
    color: var(--sp-text);
  }

  .sp-settings-toggle svg:first-child {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .sp-settings-toggle-chevron {
    width: 13px;
    height: 13px;
    margin-left: auto;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .sp-settings-toggle--open .sp-settings-toggle-chevron {
    transform: rotate(180deg);
  }

  /* Height-animatable collapse without measuring scrollHeight in JS. */
  .sp-settings-region {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-settings-region--open {
    grid-template-rows: 1fr;
  }

  .sp-settings-region-inner {
    overflow: hidden;
    min-height: 0;
  }

  .sp-settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 10px;
    padding: 2px 20px 12px;
  }

  .sp-settings-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  /* The column's default align-items:stretch widens the segmented pill to
     the full cell, but its buttons stay content-sized \u2014 leaving a dead gap
     on the right. Inside settings, the buttons split the pill EVENLY
     instead (scoped here so filter-bar segments elsewhere keep fitting
     their content). */
  .sp-settings-field .sp-segmented {
    display: flex;
  }

  .sp-settings-field .sp-segmented .sp-segmented__btn {
    flex: 1 1 0;
    justify-content: center;
    padding: 0 6px;
    min-width: 0;
  }

  .sp-settings-field--wide {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sp-settings-field-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--sp-text-tertiary);
  }

  .sp-settings-field--wide .sp-settings-field-label {
    flex-shrink: 0;
  }

  .sp-settings-select {
    font-size: 12px;
    font-family: inherit;
    color: var(--sp-text);
    background: var(--sp-bg-hover);
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius);
    padding: 4px 6px;
    cursor: pointer;
    width: 100%;
  }

  .sp-settings-swatches {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .sp-settings-swatch {
    width: 17px;
    height: 17px;
    border-radius: var(--sp-radius-full);
    border: 2px solid var(--sp-bg);
    box-shadow: 0 0 0 1px var(--sp-border);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .sp-settings-swatch:hover {
    transform: scale(1.15);
  }

  .sp-settings-color-input {
    width: 19px;
    height: 19px;
    padding: 0;
    border: none;
    border-radius: var(--sp-radius);
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
  }

  .sp-settings-chips {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sp-settings-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 10px;
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius-full);
    background: var(--sp-bg-hover);
    color: var(--sp-text);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .sp-settings-switch {
    position: relative;
    width: 26px;
    height: 15px;
    border-radius: var(--sp-radius-full);
    background: var(--sp-border);
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .sp-settings-switch::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .sp-settings-chip--on .sp-settings-switch {
    background: var(--sp-accent-fill, var(--sp-accent));
  }

  .sp-settings-chip--on .sp-settings-switch::after {
    transform: translateX(11px);
  }
`,Ot=class{constructor(e,n,s){this.t=e;this.onChange=s;this.element=l("div",{class:"sp-settings"}),this.toggleBtn=document.createElement("button"),this.toggleBtn.type="button",this.toggleBtn.className="sp-settings-toggle",this.toggleBtn.setAttribute("aria-expanded","false"),this.toggleBtn.appendChild(b(Xe));let r=l("span",{});d(r,this.t("settings.title")),this.toggleBtn.appendChild(r);let o=b(Qe);o.setAttribute("class","sp-settings-toggle-chevron"),this.toggleBtn.appendChild(o),this.toggleBtn.addEventListener("click",()=>this.toggle()),this.element.appendChild(this.toggleBtn),this.region=l("div",{class:"sp-settings-region"});let i=l("div",{class:"sp-settings-region-inner"}),a=l("div",{class:"sp-settings-grid"}),c=new V({options:[{value:"light",label:this.t("settings.themeLight")},{value:"dark",label:this.t("settings.themeDark")},{value:"auto",label:this.t("settings.themeAuto")}],value:n.theme??"light",onChange:m=>this.onChange({theme:m}),ariaLabel:this.t("settings.theme"),datasetKey:"theme"});a.appendChild(this.buildField(this.t("settings.theme"),c.element));let p=new V({options:[{value:"bottom-left",label:this.t("settings.positionLeft")},{value:"bottom-right",label:this.t("settings.positionRight")}],value:n.position??"bottom-right",onChange:m=>this.onChange({position:m}),ariaLabel:this.t("settings.position"),datasetKey:"position"});a.appendChild(this.buildField(this.t("settings.position"),p.element));let u=document.createElement("select");u.className="sp-settings-select",u.setAttribute("aria-label",this.t("settings.locale"));let g=n.locale??"ko";for(let m of As){let v=document.createElement("option");v.value=m.code,v.textContent=m.label,m.code===g&&(v.selected=true),u.appendChild(v);}u.addEventListener("change",()=>this.onChange({locale:u.value})),a.appendChild(this.buildField(this.t("settings.locale"),u));let h=l("div",{class:"sp-settings-swatches"});for(let m of Fs){let v=document.createElement("button");v.type="button",v.className="sp-settings-swatch",v.style.background=m,v.setAttribute("aria-label",m),v.addEventListener("click",()=>this.onChange({accentColor:m})),h.appendChild(v);}let f=document.createElement("input");f.type="color",f.className="sp-settings-color-input",f.value=n.accentColor??"#0066ff",f.setAttribute("aria-label",this.t("settings.accentColor")),f.addEventListener("input",()=>{this.colorDebounce&&clearTimeout(this.colorDebounce),this.colorDebounce=setTimeout(()=>this.onChange({accentColor:f.value}),150);}),h.appendChild(f),a.appendChild(this.buildField(this.t("settings.accentColor"),h,true));let x=l("div",{class:"sp-settings-chips"});x.appendChild(this.buildChip(this.t("settings.screenshots"),n.enableScreenshot??false,m=>this.onChange({enableScreenshot:m}))),x.appendChild(this.buildChip(this.t("settings.diagnostics"),!!n.captureDiagnostics,m=>this.onChange({captureDiagnostics:m}))),a.appendChild(x),i.appendChild(a),this.region.appendChild(i),this.element.appendChild(this.region);}t;onChange;element;_isExpanded=false;colorDebounce=null;toggleBtn;region;buildField(e,n,s=false){let r=l("div",{class:s?"sp-settings-field sp-settings-field--wide":"sp-settings-field"}),o=l("span",{class:"sp-settings-field-label"});return d(o,e),r.appendChild(o),r.appendChild(n),r}buildChip(e,n,s){let r=document.createElement("button");r.type="button",r.className=`sp-settings-chip${n?" sp-settings-chip--on":""}`,r.setAttribute("role","switch"),r.setAttribute("aria-checked",String(n));let o=l("span",{});d(o,e),r.appendChild(o);let i=l("span",{class:"sp-settings-switch"});return i.setAttribute("aria-hidden","true"),r.appendChild(i),r.addEventListener("click",()=>{let a=r.getAttribute("aria-checked")!=="true";r.setAttribute("aria-checked",String(a)),r.classList.toggle("sp-settings-chip--on",a),s(a);}),r}toggle(){this._isExpanded?this.collapse():this.expand();}expand(){this._isExpanded||(this._isExpanded=true,this.region.classList.add("sp-settings-region--open"),this.toggleBtn.classList.add("sp-settings-toggle--open"),this.toggleBtn.setAttribute("aria-expanded","true"));}collapse(){this._isExpanded&&(this._isExpanded=false,this.region.classList.remove("sp-settings-region--open"),this.toggleBtn.classList.remove("sp-settings-toggle--open"),this.toggleBtn.setAttribute("aria-expanded","false"));}get isExpanded(){return this._isExpanded}destroy(){this.colorDebounce&&clearTimeout(this.colorDebounce),this.element.remove();}};var Ls='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M6 12h.01"/><path d="M18 12h.01"/><path d="M8 16h8"/></svg>';function bi(t){let e=t.querySelectorAll(".sp-card");for(let n=0;n<e.length;n++)if(e[n]?.classList.contains("sp-card--focused"))return n;return  -1}function mi(t,e){let n=t.querySelectorAll(".sp-card");if(n.length===0)return;for(let o of n)o.classList.remove("sp-card--focused");let s=Math.max(0,Math.min(e,n.length-1)),r=n[s];r&&(r.classList.add("sp-card--focused"),r.scrollIntoView({block:"nearest",behavior:"smooth"}),r.focus({preventScroll:true}));}var Rs=[{keys:["J","K"],label:"shortcuts.navigate"},{keys:["R"],label:"shortcuts.resolve"},{keys:["D"],label:"shortcuts.delete"},{keys:["F","/"],label:"shortcuts.search"},{keys:["X"],label:"shortcuts.select"},{keys:["?"],label:"shortcuts.help"},{keys:["Esc"],label:"shortcuts.close"}],Bs=[{keys:["S"],label:"shortcuts.globalPanel"},{keys:["A"],label:"shortcuts.globalAnnotate"},{keys:["T"],label:"shortcuts.globalTargeting"},{keys:["V"],label:"shortcuts.globalMarkers"}];function Is(t){return typeof navigator<"u"&&/Mac|iP(hone|ad|od)/.test(navigator.platform||navigator.userAgent)?`\u2325\u21E7${t}`:`Alt+Shift+${t}`}var xi=`
  /* ---- Help overlay backdrop ---- */

  .sp-shortcuts-overlay {
    position: fixed;
    inset: 0;
    background: var(--sp-backdrop, rgba(15, 23, 42, 0.2));
    backdrop-filter: blur(var(--sp-blur));
    -webkit-backdrop-filter: blur(var(--sp-blur));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .sp-shortcuts-overlay--visible {
    opacity: 1;
    pointer-events: auto;
  }

  /* ---- Glassmorphism card ---- */

  .sp-shortcuts-card {
    width: 380px;
    max-width: calc(100vw - 32px);
    padding: 24px 28px 20px;
    border-radius: 20px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    font-family: var(--sp-font);
    position: relative;
    transform: scale(0.92) translateY(8px);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-shortcuts-overlay--visible .sp-shortcuts-card {
    transform: scale(1) translateY(0);
  }

  /* ---- Title row ---- */

  .sp-shortcuts-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--sp-text);
    margin-bottom: 18px;
  }

  .sp-shortcuts-title svg {
    width: 18px;
    height: 18px;
    color: var(--sp-text-secondary);
    flex-shrink: 0;
  }

  /* ---- Close button ---- */

  .sp-shortcuts-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .sp-shortcuts-close:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-shortcuts-close svg {
    width: 14px;
    height: 14px;
  }

  /* ---- Two-column grid ---- */

  .sp-shortcuts-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sp-shortcuts-section {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--sp-border);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--sp-text-tertiary);
  }

  .sp-shortcuts-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sp-shortcuts-keys {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 80px;
    justify-content: flex-end;
  }

  .sp-shortcuts-separator {
    font-size: 11px;
    color: var(--sp-text-tertiary);
    user-select: none;
  }

  /* ---- Key badge (<kbd> styling) ---- */

  .sp-kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 26px;
    padding: 0 7px;
    border-radius: 6px;
    background: var(--sp-bg-hover);
    border: 1px solid var(--sp-border);
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.04);
    font-family: ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", Menlo, monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--sp-text);
    text-align: center;
    line-height: 1;
    user-select: none;
  }

  /* ---- Description text ---- */

  .sp-shortcuts-desc {
    font-size: 13px;
    color: var(--sp-text-secondary);
    line-height: 1.3;
  }

  /* ---- Hint button (bottom-right of panel) ---- */

  .sp-shortcuts-hint {
    width: 24px;
    height: 24px;
    border-radius: var(--sp-radius-full);
    border: 1px solid var(--sp-border);
    background: var(--sp-bg-hover);
    color: var(--sp-text-tertiary);
    font-family: ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    position: absolute;
    bottom: 12px;
    right: 12px;
  }

  .sp-shortcuts-hint:hover {
    background: var(--sp-accent-light);
    color: var(--sp-accent);
    border-color: var(--sp-accent);
  }

  .sp-shortcuts-hint::after {
    content: attr(aria-label);
    position: absolute;
    bottom: calc(100% + 6px);
    right: 0;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--sp-glass-bg-heavy);
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-sm);
    font-family: var(--sp-font);
    font-size: 11px;
    font-weight: 500;
    color: var(--sp-text-secondary);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .sp-shortcuts-hint:hover::after {
    opacity: 1;
    transform: translateY(0);
  }

  /* ---- Card focus highlight (navigation) ---- */

  .sp-card--focused {
    outline: 2px solid var(--sp-accent);
    outline-offset: -2px;
    border-radius: inherit;
  }

  /* ---- Reduced motion ---- */

  @media (prefers-reduced-motion: reduce) {
    .sp-shortcuts-overlay,
    .sp-shortcuts-card,
    .sp-shortcuts-close,
    .sp-shortcuts-hint,
    .sp-shortcuts-hint::after {
      transition-duration: 0.01ms !important;
    }
  }
`,Ps='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',_t=class{constructor(e,n,s){this.t=s;this.keyMap=new Map([["j",()=>n.onNavigate("down")],["k",()=>n.onNavigate("up")],["r",()=>n.onResolve()],["d",()=>n.onDelete()],["f",()=>n.onFocusSearch()],["/",()=>n.onFocusSearch()],["x",()=>n.onToggleSelect()],["?",()=>this.toggleHelp()]]),this.helpOverlay=this.buildOverlay(),this.hintButton=this.buildHintButton(),this.boundHandler=r=>this.handleKeydown(r);}t;helpOverlay;hintButton;keyMap;boundHandler;shadowRoot=null;enabled=false;helpVisible=false;destroyed=false;enable(e){if(this.destroyed||this.enabled)return;e&&(this.shadowRoot=e),(this.shadowRoot??document).addEventListener("keydown",this.boundHandler),this.enabled=true;}disable(){if(!this.enabled)return;(this.shadowRoot??document).removeEventListener("keydown",this.boundHandler),this.enabled=false,this.helpVisible&&this.hideHelp();}toggleHelp(){this.helpVisible?this.hideHelp():this.showHelp();}destroy(){this.destroyed||(this.disable(),this.helpOverlay.remove(),this.hintButton.remove(),this.destroyed=true);}handleKeydown(e){if(e.key==="Escape"){this.helpVisible&&(e.preventDefault(),e.stopPropagation(),this.hideHelp());return}if(this.helpVisible){e.key==="Tab"&&this.trapHelpFocus(e);return}let n=e.composedPath()[0];if(n){let r=n.tagName?.toLowerCase();if(r==="input"||r==="textarea"||r==="select"||n.isContentEditable)return}if(e.ctrlKey||e.altKey||e.metaKey)return;let s=this.keyMap.get(e.key);s&&(e.preventDefault(),e.stopPropagation(),s());}trapHelpFocus(e){let n=Array.from(this.helpOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));if(n.length===0)return;let s=n[0],r=n[n.length-1];if(!s||!r)return;let i=this.helpOverlay.getRootNode().activeElement;e.shiftKey&&i===s?(e.preventDefault(),r.focus()):!e.shiftKey&&i===r&&(e.preventDefault(),s.focus());}showHelp(){this.helpVisible=true,this.helpOverlay.classList.add("sp-shortcuts-overlay--visible"),this.helpOverlay.querySelector(".sp-shortcuts-close")?.focus();}hideHelp(){this.helpVisible=false,this.helpOverlay.classList.remove("sp-shortcuts-overlay--visible");}buildOverlay(){let e=l("div",{class:"sp-shortcuts-overlay"});e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label",this.t("shortcuts.title")),e.addEventListener("click",c=>{c.target===e&&this.hideHelp();});let n=l("div",{class:"sp-shortcuts-card"}),s=l("div",{class:"sp-shortcuts-title"});s.appendChild(b(Ls));let r=l("span");d(r,this.t("shortcuts.title")),s.appendChild(r),n.appendChild(s);let o=document.createElement("button");o.className="sp-shortcuts-close",o.setAttribute("aria-label",this.t("shortcuts.close")),o.appendChild(b(Ps)),o.addEventListener("click",()=>this.hideHelp()),n.appendChild(o);let i=l("div",{class:"sp-shortcuts-grid"});for(let c of Rs){let p=l("div",{class:"sp-shortcuts-row"}),u=l("div",{class:"sp-shortcuts-keys"});c.keys.forEach((h,f)=>{if(f>0){let m=l("span",{class:"sp-shortcuts-separator"});d(m,"/"),u.appendChild(m);}let x=l("span",{class:"sp-kbd"});d(x,h),u.appendChild(x);});let g=l("span",{class:"sp-shortcuts-desc"});d(g,this.t(c.label)),p.appendChild(u),p.appendChild(g),i.appendChild(p);}let a=l("div",{class:"sp-shortcuts-section"});d(a,this.t("shortcuts.globalSection")),i.appendChild(a);for(let c of Bs){let p=l("div",{class:"sp-shortcuts-row"}),u=l("div",{class:"sp-shortcuts-keys"}),g=l("span",{class:"sp-kbd"});d(g,Is(c.keys[0])),u.appendChild(g);let h=l("span",{class:"sp-shortcuts-desc"});d(h,this.t(c.label)),p.appendChild(u),p.appendChild(h),i.appendChild(p);}return n.appendChild(i),e.appendChild(n),e}buildHintButton(){let e=document.createElement("button");return e.className="sp-shortcuts-hint",e.setAttribute("aria-label",this.t("shortcuts.hint")),d(e,"?"),e.addEventListener("click",n=>{n.stopPropagation(),this.toggleHelp();}),e}};export{en as $,A,Pt as Aa,xr as B,ti as Ba,Ye as C,ii as Ca,yr as D,Nt as Da,kr as E,V as Ea,wr as F,gi as Fa,Cr as G,Ot as Ga,Er as H,bi as Ha,qe as I,mi as Ia,Sr as J,xi as Ja,Tr as K,_t as Ka,Ar as L,Fr as M,Lr as N,Rr as O,Qe as P,Br as Q,Ir as R,Pr as S,Mr as T,Nr as U,Or as V,_r as W,Dr as X,Hr as Y,$r as Z,jr as _,Ne as a,Yr as aa,j as b,tn as ba,Ns as c,Q as ca,xt as d,fe as da,Ao as e,nn as ea,Fo as f,qr as fa,Lo as g,eo as ga,St as h,to as ha,b as i,ve as ia,l as j,no as ja,d as k,so as ka,ie as l,st as la,_s as m,ro as ma,Dt as n,Do as na,Ht as o,hn as oa,_e as p,ao as pa,T as q,lo as qa,$t as r,uo as ra,jt as s,at as sa,O as t,bo as ta,de as u,ct as ua,Qt as v,Yo as va,Zt as w,Bt as wa,Jt as x,Zo as xa,br as y,Jo as ya,mr as z,ei as za};//# sourceMappingURL=chunk-R23PLWIN.js.map
//# sourceMappingURL=chunk-R23PLWIN.js.map