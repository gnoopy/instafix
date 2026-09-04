import {oa,y,z,ga,qa,ha,c,pa,b,ea,s,r,x,w,v,Ca,Ba,ta,ra,Ja,va,Fa,aa,ma,j,a,ia,la,B,k,m,q,t,h,na,A,T,U,Z,Y,X,F,E,V as V$1,W as W$1,i,G,D,fa,f,e,d,g,da,J,K as K$1,L,M,$,ba,Q,R,u,n}from'./chunk-R23PLWIN.js';import'./chunk-QV2WRJKK.js';import {useRef,useState,useEffect}from'react';function Qe(n,t,e,o){if(n<e){let i=Math.min(1,(e-n)/e);return -Math.ceil(i*o)}if(n>t-e){let i=Math.min(1,(n-(t-e))/e);return Math.ceil(i*o)}return 0}function tn(n,t,e,o,i={}){let s=i.edgeMargin??48,r=i.maxSpeed??18;return {dx:Qe(n,e,s,r),dy:Qe(t,o,s,r)}}var io=["display","position","width","height","padding","margin","gap","flex-direction","align-items","justify-content","grid-template-columns","color","background-color","border","border-radius","box-shadow","opacity","font-family","font-size","font-weight","line-height","text-align","overflow","z-index","visibility"],so=new Set(["none","normal","auto","0px","0px 0px","rgba(0, 0, 0, 0)","visible","static","1"]);function ro(n){let t=n.tagName.toLowerCase(),e=n.id?`#${n.id}`:"",o=Array.from(n.classList).slice(0,3).map(i=>`.${i}`).join("");return `${t}${e}${o}`}function ao(n){let t=[],e=n;for(;e&&e!==document.body&&e!==document.documentElement&&t.length<8;)t.unshift(ro(e)),e=e.parentElement;return t}function Et(n,t){try{if(typeof getComputedStyle!="function")return null;let e=getComputedStyle(n),o={};for(let s of io){let r=e.getPropertyValue(s).trim();!r||so.has(r)||(o[s]=r);}let i=ao(n);return i.length===0&&Object.keys(o).length===0?null:{domPath:i,styles:o,...t?{component:t}:{}}}catch{return null}}var lo=20,co=12,po=6,ho=4;function uo(n,t){let e=[];for(let o=0;o<t;o++)for(let i=0;i<t;i++)e.push({x:n.left+n.width*(o+.5)/t,y:n.top+n.height*(i+.5)/t});return e}function fo(n,t){return n.left>=t.left-1&&n.top>=t.top-1&&n.right<=t.right+1&&n.bottom<=t.bottom+1}function oe(n){let t=n.getBoundingClientRect();return t.width*t.height}function en(n,t){return Math.abs(Math.log(oe(n)/t))}function mo(n,t){let e=[...n].sort((i,s)=>oe(s)-oe(i)),o=new Set;for(let i of e){if(o.has(i))continue;let s=e.filter(l=>l!==i&&!o.has(l)&&i.contains(l));if(s.length===0)continue;let r=[i,...s],a=r[0],c=en(a,t);for(let l=1;l<r.length;l++){let d=r[l],h=en(d,t);h<c&&(a=d,c=h);}for(let l of r)l!==a&&o.add(l);}return e.filter(i=>!o.has(i))}function nn(n){return [...n].sort((t,e)=>{let o=t.compareDocumentPosition(e);return o&Node.DOCUMENT_POSITION_FOLLOWING?-1:o&Node.DOCUMENT_POSITION_PRECEDING?1:0})}function on(n,t){let e=t.gridSize??po,o=t.elementFromPoint??(typeof document.elementFromPoint=="function"?document.elementFromPoint.bind(document):()=>null);if(n.width<=0||n.height<=0)return {list:[],marqueeArea:0};let i=new Set;for(let{x:a,y:c}of uo(n,e)){if(a<0||c<0||a>window.innerWidth||c>window.innerHeight)continue;let l=o(a,c);l&&(l===document.documentElement||l===document.body||b(l)||i.add(l));}let s=n.width*n.height;return {list:[...i].filter(a=>{if(h(a)==="hidden")return  false;let c=a.getBoundingClientRect();if(c.width<=0||c.height<=0)return  false;let l=c.width*c.height;return !(!fo(c,n)&&l>s*ho)}),marqueeArea:s}}function sn(n,t={}){let{list:e,marqueeArea:o}=on(n,t),i=mo(e,o);return nn(i).slice(0,t.maxElements??lo)}function rn(n,t={}){let{list:e}=on(n,t);return nn(e).slice(0,t.maxElements??co)}function go(n){return n&&typeof n=="object"&&"target"in n?n.target:null}function bo(n){return n instanceof Element&&b(n)}var yo={restore(){}};function an(){let n=false,e=typeof document.getAnimations=="function"?document.getAnimations().filter(i=>i.playState==="running"&&!bo(go(i.effect))):[];for(let i of e)i.pause();let o=Array.from(document.querySelectorAll("video, audio")).filter(i=>!i.paused&&!i.ended&&!b(i));for(let i of o)i.pause();return e.length===0&&o.length===0?yo:{restore(){if(!n){n=true;for(let i of e)try{i.play();}catch{}for(let i of o)i.isConnected&&i.play().catch(()=>{});}}}}function vo(n){return n.replace(/^webpack-internal:\/\/\/(\.\/)?/,"").replace(/\\/g,"/").split("/").slice(-4).join("/")}function xo(n){let t=n.type??n.elementType;if(typeof t=="function")return t.displayName??t.name??"";if(t&&typeof t=="object"){let e=t;return e.displayName??e.render?.name??""}return ""}var wo=/^(Inner|Outer)?(LayoutRouter|RenderFromTemplateContext|ScrollAndFocusHandler|Router|Head)|ErrorBoundary$|^(Loading|Template|Segment)Boundary/,ln=2;function W(n){try{let t=Object.keys(n).find(r=>r.startsWith("__reactFiber$"));if(!t)return null;let e=n[t],o=null,i=[],s=0;for(;e&&s<25;){let r=e._debugSource;if(!o&&r&&typeof r.fileName=="string"&&typeof r.lineNumber=="number"&&(o={fileName:r.fileName,lineNumber:r.lineNumber}),i.length<ln){let a=xo(e);a&&/^[A-Z]/.test(a)&&!wo.test(a)&&!i.includes(a)&&i.push(a);}if(o&&i.length>=ln)break;e=e._debugOwner??e.return??void 0,s++;}return i.length===0&&!o?null:{location:o?`${vo(o.fileName)}:${o.lineNumber}`:null,componentPath:i.length>0?i.join(" \u2039 "):""}}catch{return null}}var Eo='button, a, input, textarea, select, [role="button"], [role="link"], svg';function So(n){return n?n.closest(Eo)!==null:false}function cn(n,t,e,o){let i=n.createRange();return i.setStart(t,0),i.setEnd(e,o),i.toString().length}function dn(n,t,e,o,i={}){let s=i.doc??document,r=i.caretRangeFromPoint??((A,L)=>s.caretRangeFromPoint?.(A,L)??null),a=r(n,t),c=r(e,o);if(!a||!c)return null;let l=s.createRange();a.compareBoundaryPoints(Range.START_TO_START,c)<=0?(l.setStart(a.startContainer,a.startOffset),l.setEnd(c.startContainer,c.startOffset)):(l.setStart(c.startContainer,c.startOffset),l.setEnd(a.startContainer,a.startOffset));let d=l.toString().trim();if(!d)return null;let h=l.commonAncestorContainer,p=h.nodeType===Node.ELEMENT_NODE?h:h.parentElement;if(!p||So(p))return null;let m=p.textContent??"",f=cn(s,p,l.startContainer,l.startOffset),y=cn(s,p,l.endContainer,l.endOffset),E=m.slice(Math.max(0,f-32),f),k=m.slice(y,y+32),b=i.getRangeRect??(A=>A.getBoundingClientRect()),B;try{B=b(l);}catch{return null}return !B||B.width===0&&B.height===0?null:{container:p,quote:d.slice(0,500),quotePrefix:E,quoteSuffix:k,rect:B}}var ie="instafix_target_preview_always_show";function ko(){try{return localStorage.getItem(ie)==="1"}catch{return  false}}function To(n){try{n?localStorage.setItem(ie,"1"):localStorage.removeItem(ie);}catch{}}var St=22,kt=class{constructor(t,e,o,i,s){this.colors=t;this.resolutionSets=e;this.t=o;this.onResolutionChange=s;this.alwaysShow=ko(),this.container=j("div",{style:`position:absolute; inset:0; pointer-events:none; z-index:${2147483647};`}),document.body.appendChild(this.container);let r=this.buildAlwaysShowToggle(i),[a,c,l]=this.buildResolutionToggle(i);this.resolutionSummaryBtn=c,this.resolutionDetailBtn=l,this.container.appendChild(r),(this.resolutionSets.detail.length>1||this.resolutionSets.summary.length>1)&&this.container.appendChild(a),this.rebuildBadges();}colors;resolutionSets;t;onResolutionChange;container;badges=[];outlines=[];alwaysShow;resolution="summary";resolutionSummaryBtn;resolutionDetailBtn;get elements(){return this.resolutionSets[this.resolution]}rebuildBadges(){for(let t of this.badges)t.remove();this.badges=[];for(let t of this.outlines)t?.remove();this.outlines=this.elements.map(()=>null),this.elements.forEach((t,e)=>{let o=this.buildBadge(t,e);this.badges.push(o),this.container.appendChild(o);}),this.alwaysShow&&this.showAll();}buildBadge(t,e){let o=t.getBoundingClientRect(),i=document.createElement("button");return i.type="button",i.style.cssText=`
      position:absolute;
      top:${o.top+window.scrollY-St/2}px;
      left:${o.left+window.scrollX-St/2}px;
      width:${St}px;height:${St}px;
      border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${this.colors.accentFill};color:${this.colors.accentForeground};
      font-family:${a};
      font-size:11px;font-weight:700;
      border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      pointer-events:auto;cursor:default;
    `,k(i,String(e+1)),i.setAttribute("aria-label",A(this.t,"annotator.targetBadgeAria",{number:e+1})),i.addEventListener("mouseenter",()=>this.show(e)),i.addEventListener("mouseleave",()=>{this.alwaysShow||this.hide(e);}),i.addEventListener("focus",()=>this.show(e)),i.addEventListener("blur",()=>{this.alwaysShow||this.hide(e);}),i}buildAlwaysShowToggle(t){let e=document.createElement("button");return e.type="button",e.style.cssText=`
      position:absolute;
      top:${t.top+window.scrollY-34}px;
      left:${t.left+window.scrollX}px;
      display:flex;align-items:center;gap:6px;
      padding:4px 10px;border-radius:9999px;
      font-family:${a};
      font-size:11px;font-weight:600;
      border:1px solid ${this.colors.border};
      background:${this.colors.layerBgHeavy};color:${this.colors.textTertiary};
      pointer-events:auto;cursor:pointer;white-space:nowrap;
    `,k(e,this.t("annotator.targetPreviewAlwaysShow")),e.setAttribute("aria-pressed",String(this.alwaysShow)),this.applyAlwaysShowToggleState(e),e.addEventListener("click",()=>{this.setAlwaysShow(!this.alwaysShow),e.setAttribute("aria-pressed",String(this.alwaysShow)),this.applyAlwaysShowToggleState(e);}),e}applyAlwaysShowToggleState(t){t.style.color=this.alwaysShow?this.colors.selection:this.colors.textTertiary,t.style.borderColor=this.alwaysShow?this.colors.selection:this.colors.border,t.style.background=this.alwaysShow?this.colors.selectionLight:this.colors.layerBgHeavy;}buildResolutionToggle(t){let e=j("div",{style:`
        position:absolute;
        top:${t.top+window.scrollY-64}px;
        left:${t.left+window.scrollX}px;
        display:flex;border-radius:9999px;padding:2px;gap:2px;
        border:1px solid ${this.colors.border};
        background:${this.colors.layerBgHeavy};
        pointer-events:auto;
      `}),o=()=>{let r=document.createElement("button");return r.type="button",r.style.cssText=`
        border:none;border-radius:9999px;padding:3px 10px;cursor:pointer;
        font-family:${a};
        font-size:11px;font-weight:600;
        transition:background 0.15s ease,color 0.15s ease;
      `,r},i=o(),s=o();return k(i,this.t("annotator.resolutionSummary")),k(s,this.t("annotator.resolutionDetail")),i.setAttribute("aria-label",`${this.t("annotator.resolutionLabel")}: ${this.t("annotator.resolutionSummary")}`),s.setAttribute("aria-label",`${this.t("annotator.resolutionLabel")}: ${this.t("annotator.resolutionDetail")}`),i.addEventListener("click",()=>this.selectResolution("summary")),s.addEventListener("click",()=>this.selectResolution("detail")),e.appendChild(i),e.appendChild(s),this.renderResolutionButtons(i,s),[e,i,s]}selectResolution(t){this.resolution!==t&&(this.resolution=t,this.renderResolutionButtons(this.resolutionSummaryBtn,this.resolutionDetailBtn),this.rebuildBadges(),this.onResolutionChange(t,this.elements));}renderResolutionButtons(t,e){for(let[o,i]of [[t,"summary"],[e,"detail"]]){let s=this.resolution===i;o.style.background=s?this.colors.selectionLight:"transparent",o.style.color=s?this.colors.selection:this.colors.textTertiary,o.setAttribute("aria-pressed",String(s));}}show(t){if(this.outlines[t])return;let e=this.elements[t];if(!e)return;let o=e.getBoundingClientRect(),i=j("div",{style:`
        position:absolute;
        top:${o.top+window.scrollY}px; left:${o.left+window.scrollX}px;
        width:${o.width}px; height:${o.height}px;
        border:2px solid ${this.colors.selection};
        background:${this.colors.selection}14;
        border-radius:8px;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.85),
          inset 0 0 0 1px rgba(255,255,255,0.85),
          0 0 16px ${this.colors.selectionGlow};
        pointer-events:none;
      `});this.container.insertBefore(i,this.container.firstChild),this.outlines[t]=i;}hide(t){this.outlines[t]?.remove(),this.outlines[t]=null;}showAll(){this.elements.forEach((t,e)=>{this.show(e);});}hideAllOutlines(){this.elements.forEach((t,e)=>{this.hide(e);});}setAlwaysShow(t){this.alwaysShow=t,To(t),t?this.showAll():this.hideAllOutlines();}destroy(){this.container.remove();}};var se="instafix_draft_v1";function pn(n,t=sessionStorage){try{t.setItem(se,JSON.stringify(n));}catch{}}function hn(n,t=sessionStorage,e=Date.now()){let o;try{o=t.getItem(se);}catch{return null}if(!o)return null;let i;try{i=JSON.parse(o);}catch{return null}return typeof i.message!="string"||!i.message.trim()||i.url!==n||typeof i.savedAt!="number"||e-i.savedAt>18e5?null:i}function tt(n=sessionStorage){try{n.removeItem(se);}catch{}}function un(){if(typeof window>"u")return null;let n=window;return n.SpeechRecognition??n.webkitSpeechRecognition??null}function Co(n){switch(n){case "not-allowed":case "service-not-allowed":return "permission-denied";case "no-speech":return "no-speech";case "audio-capture":return "audio-capture";case "network":return "network";case "aborted":return "aborted";default:return "unknown"}}function fn(n=un()){return n!==null}var Tt=class{constructor(t={}){this.options=t;}options;state="idle";recognition=null;stateListeners=new Set;transcriptListeners=new Set;errorListeners=new Set;destroyed=false;sessionId=0;get currentState(){return this.state}onStateChange(t){return this.stateListeners.add(t),()=>this.stateListeners.delete(t)}onTranscript(t){return this.transcriptListeners.add(t),()=>this.transcriptListeners.delete(t)}onError(t){return this.errorListeners.add(t),()=>this.errorListeners.delete(t)}setState(t){this.state=t;for(let e of this.stateListeners)e(t);}start(){if(this.destroyed||this.state==="listening"||this.state==="requesting-permission"||this.state==="processing")return;let t=this.options.SpeechRecognitionCtor??un();if(!t){this.setState("unsupported");return}let e=++this.sessionId;this.setState("requesting-permission");let o=new t;o.lang=this.options.lang||(typeof document<"u"?document.documentElement.lang:"")||"en-US",o.continuous=true,o.interimResults=true,o.onstart=()=>{e===this.sessionId&&this.setState("listening");},o.onresult=i=>{if(e!==this.sessionId)return;let s="",r="";for(let a=i.resultIndex;a<i.results.length;a++){let c=i.results[a];if(!c)continue;let l=c[0]?.transcript??"";c.isFinal?r+=l:s+=l;}if(r||s)for(let a of this.transcriptListeners)a({interim:s,finalSegment:r});},o.onerror=i=>{if(e!==this.sessionId)return;let s=Co(i.error);this.setState("error");for(let r of this.errorListeners)r(s);},o.onend=()=>{e===this.sessionId&&(this.state==="listening"||this.state==="requesting-permission"||this.state==="processing")&&this.setState("idle");},this.recognition=o;try{o.start();}catch{if(e!==this.sessionId)return;this.setState("error");for(let i of this.errorListeners)i("unknown");}}stop(){if(this.state==="listening"){this.setState("processing");try{this.recognition?.stop();}catch{this.setState("idle");}}}destroy(){this.destroyed=true,this.sessionId++;try{this.recognition?.abort();}catch{}this.recognition=null,this.stateListeners.clear(),this.transcriptListeners.clear(),this.errorListeners.clear();}};var mn='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',Ao='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',Ro={"permission-denied":"voice.error.permissionDenied","no-speech":"voice.error.noSpeech","audio-capture":"voice.error.audioCapture",network:"voice.error.network",aborted:"voice.error.aborted",unknown:"voice.error.unknown"},Lo={question:"type.question",change:"type.change",bug:"type.bug",other:"type.other"};function Mo(n,t,e,o={}){let i=new Date().toISOString(),s$1={id:"draft",projectName:"",type:t,message:e,status:"open",url:typeof location<"u"?location.href:"",viewport:typeof window<"u"?`${window.innerWidth}x${window.innerHeight}`:"",userAgent:typeof navigator<"u"?navigator.userAgent:"",authorName:"",authorEmail:"",resolvedAt:null,createdAt:i,updatedAt:i,urlPattern:null,screenshotUrl:null,screenshotRegion:null,diagnostics:null,annotations:n.map((a,c)=>({...s(a),elementId:a.anchor.elementId??null,anchorKey:a.anchor.anchorKey??null,target:a.target??null,inspect:a.inspect??null,id:`draft-${c+1}`,feedbackId:"draft",createdAt:i}))},r=u([s$1],{title:"UI change request",includeResolveProtocol:false,...o.instructions?{instructions:o.instructions}:{}});return o.sourceHint&&(r+=`
Source hint (dev): ${o.sourceHint}
`),r}function Fo(){let n=navigator.userAgentData;return n?n.platform==="macOS":navigator.platform?.includes("Mac")??/Macintosh|Mac OS X/i.test(navigator.userAgent)}var Ct=class{constructor(t,e,o){this.colors=t;this.t=e;this.agentInstructions=o;this.root=j("div",{style:`
        position:fixed;
        z-index:${2147483647};
        width:390px;
        max-width:calc(100vw - 16px);
        box-sizing:border-box;
        padding:16px;
        border-radius:16px;
        background:${this.colors.layerBg};
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
        border:2px solid ${this.colors.layerBorder};
        box-shadow:0 8px 32px ${this.colors.shadow}, 0 2px 8px ${this.colors.shadow};
        font-family:${a};
        opacity:0;
        transform:translateY(8px) scale(0.98);
        transition:opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display:none;
        -webkit-font-smoothing:antialiased;
      `}),this.root.setAttribute("role","dialog"),this.root.setAttribute("aria-modal","true"),this.root.setAttribute("data-instafix-ignore","true"),this.sourceHintEl=j("div",{style:`
        display:none;align-items:center;gap:6px;
        margin-bottom:10px;padding:5px 9px;border-radius:7px;
        background:${this.colors.accentLight};color:${this.colors.accent};
        font-family:"IBM Plex Mono","SF Mono",Consolas,monospace;
        font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      `}),this.pastedImageRow=j("div",{style:"display:none;align-items:center;gap:8px;margin:8px 0 0;"}),this.pastedImageThumb=document.createElement("img"),this.pastedImageThumb.style.cssText=`
      height:40px;max-width:120px;border-radius:7px;object-fit:cover;
      border:1px solid ${this.colors.border};
    `;let i$1=j("span",{style:`font-size:11px;color:${this.colors.textTertiary};font-family:${a};`});k(i$1,"\u{1F4CE}");let s=document.createElement("button");s.type="button",s.style.cssText=`
      border:none;background:none;color:${this.colors.textTertiary};
      font-family:${a};font-size:11px;font-weight:600;
      text-decoration:underline;cursor:pointer;padding:0;
    `,k(s,"\xD7"),s.setAttribute("aria-label","remove pasted image"),s.addEventListener("click",()=>this.setPastedImage(null)),this.pastedImageRow.appendChild(this.pastedImageThumb),this.pastedImageRow.appendChild(i$1),this.pastedImageRow.appendChild(s),this.targetSizeRow=j("div",{style:"display:none;align-items:center;gap:6px;margin-bottom:10px;"}),this.targetLabelEl=j("span",{style:`font-size:11px;color:${this.colors.textTertiary};font-family:${a};flex-shrink:0;`});let r=j("div",{style:`display:flex;border-radius:9999px;border:1px solid ${this.colors.border};padding:2px;gap:2px;`}),a$1=()=>{let w=document.createElement("button");return w.type="button",w.style.cssText=`
        border:none;border-radius:9999px;padding:3px 10px;cursor:pointer;
        font-family:${a};
        font-size:11px;font-weight:600;
        transition:background 0.15s ease,color 0.15s ease;
      `,w};this.targetSmallestBtn=a$1(),this.targetSmallestBtn.addEventListener("click",()=>this.selectTargetSize("smallest")),this.targetLargestBtn=a$1(),this.targetLargestBtn.addEventListener("click",()=>this.selectTargetSize("largest")),r.appendChild(this.targetSmallestBtn),r.appendChild(this.targetLargestBtn),this.targetSizeRow.appendChild(this.targetLabelEl),this.targetSizeRow.appendChild(r),this.legendRow=j("div",{style:"display:none;flex-direction:column;gap:4px;margin-bottom:10px;"}),this.legendHeadingEl=j("span",{style:`font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.02em;color:${this.colors.textTertiary};`}),this.legendListEl=j("div",{style:"display:flex;flex-wrap:wrap;gap:4px 10px;"}),this.legendRow.appendChild(this.legendHeadingEl),this.legendRow.appendChild(this.legendListEl);let c=[{type:"question",icon:J},{type:"change",icon:K$1},{type:"bug",icon:L},{type:"other",icon:M}];this.typeRow=j("div",{style:"display:grid;grid-template-columns:repeat(4, 1fr);gap:5px;margin-bottom:12px;"});for(let w of c){let v=document.createElement("button");v.style.cssText=`
        height:36px;
        border-radius:9999px;border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:4px;
        font-family:${a};
        font-size:12px;font-weight:500;color:${this.colors.textTertiary};
        transition:all 0.2s ease;
        padding:0 4px;
        min-width:0;
      `;let C=i(w.icon);C.setAttribute("style","width:12px;height:12px;flex-shrink:0;"),v.appendChild(C);let H=document.createElement("span");H.style.cssText="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;",v.appendChild(H),v.dataset.type=w.type,v.setAttribute("aria-pressed","false"),v.addEventListener("click",()=>{this.submittingState||this.selectType(w.type,this.typeRow);}),v.addEventListener("mouseenter",()=>{if(!this.submittingState&&v.dataset.type!==this.selectedType){let R=la(v.dataset.type??"",this.colors);v.style.background=R,v.style.borderColor=ia(v.dataset.type??"",this.colors)+"40";}}),v.addEventListener("mouseleave",()=>{this.submittingState||v.dataset.type!==this.selectedType&&(v.style.background=this.colors.glassBg,v.style.borderColor=this.colors.border);}),this.typeRow.appendChild(v);}this.draftBanner=j("div",{style:`
        display:none;
        align-items:center;justify-content:space-between;gap:8px;
        margin-bottom:8px;padding:6px 10px;
        border-radius:8px;
        background:${this.colors.accentLight};
        color:${this.colors.accent};
        font-family:${a};
        font-size:11px;font-weight:500;
      `});let l=j("span"),d=document.createElement("button");d.type="button",d.style.cssText=`
      border:none;background:none;color:${this.colors.accent};
      font-family:${a};
      font-size:11px;font-weight:600;text-decoration:underline;
      cursor:pointer;padding:0;flex-shrink:0;
    `,d.addEventListener("click",()=>{this.textarea.value="",this.clearedMessage=null,this.setComposerActionEnabled(this.undoClearBtn,false),this.setComposerActionEnabled(this.redoClearBtn,false),tt(),this.hideDraftBanner(),this.updateSubmitState(),this.textarea.focus();}),this.draftBanner.appendChild(l),this.draftBanner.appendChild(d),this.draftLabelEl=l,this.draftDiscardBtn=d,this.textareaWrap=j("div",{style:"position:relative;"}),this.textarea=document.createElement("textarea"),this.textarea.style.cssText=`
      width:100%;min-height:100px;height:100px;
      padding:10px 12px;border-radius:12px;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBgHeavy};
      color:${this.colors.text};font-family:${a};
      font-size:13px;line-height:1.5;resize:none;overflow-y:auto;
      outline:none;transition:border-color 0.2s ease,box-shadow 0.2s ease,background 0.2s ease;
      box-sizing:border-box;
    `,this.textarea.maxLength=5e3;let h=j("div",{style:`
        position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:4px;
      `}),p=this.colors.bg==="#ffffff",m=this.colors.accent,f=`${m}${p?"26":"33"}`,y=`${m}${p?"45":"55"}`,E=`${m}${p?"80":"99"}`,k$1=w=>{let v=document.createElement("button");v.type="button",v.style.cssText=`
        width:22px;height:22px;border-radius:50%;
        border:1px solid ${E};
        background:${f};color:${this.colors.accentInk};
        display:flex;align-items:center;justify-content:center;cursor:pointer;
        transition:background 0.15s ease,color 0.15s ease,border-color 0.15s ease;
      `;let C=i(w);return C.setAttribute("style","width:12px;height:12px;flex-shrink:0;"),v.appendChild(C),v.addEventListener("mouseenter",()=>{v.disabled||(v.style.background=y,v.style.borderColor=this.colors.accent);}),v.addEventListener("mouseleave",()=>{v.style.background=f,v.style.borderColor=E;}),v};this.clearBtn=k$1(G),this.undoClearBtn=k$1(Q),this.redoClearBtn=k$1(R),this.setComposerActionEnabled(this.undoClearBtn,false),this.setComposerActionEnabled(this.redoClearBtn,false),this.clearBtn.addEventListener("click",()=>{this.submittingState||!this.textarea.value||(this.clearedMessage=this.textarea.value,this.textarea.value="",this.textarea.dispatchEvent(new Event("input")),this.textarea.focus(),this.setComposerActionEnabled(this.undoClearBtn,true),this.setComposerActionEnabled(this.redoClearBtn,false));}),this.undoClearBtn.addEventListener("click",()=>{this.clearedMessage!==null&&(this.textarea.value=this.clearedMessage,this.textarea.dispatchEvent(new Event("input")),this.textarea.focus(),this.setComposerActionEnabled(this.undoClearBtn,false),this.setComposerActionEnabled(this.redoClearBtn,true));}),this.redoClearBtn.addEventListener("click",()=>{this.clearedMessage!==null&&(this.textarea.value="",this.textarea.dispatchEvent(new Event("input")),this.textarea.focus(),this.setComposerActionEnabled(this.undoClearBtn,true),this.setComposerActionEnabled(this.redoClearBtn,false));}),h.appendChild(this.clearBtn),h.appendChild(this.undoClearBtn),h.appendChild(this.redoClearBtn),this.hint=j("div",{style:`
        font-size:11px;color:${this.colors.textTertiary};
        text-align:right;margin-top:4px;
        font-family:${a};
        letter-spacing:0.01em;
        word-break:keep-all;
      `});let b=j("div",{style:"display:flex;align-items:center;justify-content:space-between;gap:8px;"});if(fn()){let w=j("div",{style:"display:flex;align-items:center;gap:6px;min-width:0;"}),v=document.createElement("button");v.type="button",v.dataset.role="sp-mic-btn",v.style.cssText=`
        width:26px;height:26px;flex-shrink:0;border-radius:9999px;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};color:${this.colors.textTertiary};
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        padding:0;transition:all 0.2s ease;
      `,v.appendChild(i(mn)),v.addEventListener("click",()=>this.toggleVoice()),this.micBtn=v,this.voiceStatusEl=j("span",{style:`
          font-size:11px;color:${this.colors.textTertiary};
          font-family:${a};
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        `}),this.voiceStatusEl.dataset.role="sp-voice-status",this.voiceStatusEl.setAttribute("role","status"),this.voiceStatusEl.setAttribute("aria-live","polite"),w.appendChild(v),w.appendChild(this.voiceStatusEl),b.appendChild(w),this.applyVoiceState("idle");}else b.appendChild(j("span"));b.appendChild(this.hint),this.textarea.addEventListener("focus",()=>{this.submittingState||(this.textarea.style.borderColor=this.colors.accent,this.textarea.style.boxShadow=`0 0 0 3px ${this.colors.accent}14`,this.textarea.style.background=this.colors.bg);}),this.textarea.addEventListener("blur",()=>{this.submittingState||(this.textarea.style.borderColor=this.colors.border,this.textarea.style.boxShadow="none",this.textarea.style.background=this.colors.glassBgHeavy);}),this.textarea.addEventListener("input",()=>{this.updateSubmitState(),this.scheduleDraftSave(),!this.settingTextProgrammatically&&this.voiceController?.currentState==="listening"&&(this.voiceBaseText=this.textarea.value,this.voiceFinalSoFar="");}),this.textarea.addEventListener("keydown",w=>{this.submittingState||(w.key==="Enter"&&(w.ctrlKey||w.metaKey)&&(w.preventDefault(),this.submit()),w.key==="Escape"&&this.cancel());});let B=j("div",{style:"display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;"});this.copyContextBtn=document.createElement("button"),this.copyContextBtn.type="button",this.copyContextBtn.style.cssText=`
      height:34px;padding:0 12px;border-radius:9999px;
      border:1px solid ${this.colors.border};
      background:transparent;
      color:${this.colors.textTertiary};font-family:${a};
      font-size:12px;font-weight:500;cursor:pointer;
      display:none;align-items:center;gap:5px;
      transition:all 0.2s ease;white-space:nowrap;
    `;let A=i($);A.setAttribute("style","width:13px;height:13px;flex-shrink:0;"),this.copyContextBtn.appendChild(A),this.copyContextLabel=document.createElement("span"),this.copyContextBtn.appendChild(this.copyContextLabel),this.copyContextBtn.addEventListener("click",()=>{this.copyComposeContext();}),this.copyContextBtn.addEventListener("mouseenter",()=>{this.copyContextBtn.style.borderColor=this.colors.accent,this.copyContextBtn.style.color=this.colors.accent;}),this.copyContextBtn.addEventListener("mouseleave",()=>{this.copyContextBtn.style.borderColor=this.colors.border,this.copyContextBtn.style.color=this.colors.textTertiary;}),this.cancelBtn=document.createElement("button"),this.cancelBtn.style.cssText=`
      height:34px;padding:0 16px;border-radius:9999px;
      border:1px solid ${this.colors.border};
      background:${this.colors.glassBg};
      color:${this.colors.textTertiary};font-family:${a};
      font-size:13px;font-weight:500;cursor:pointer;
      transition:all 0.2s ease;
    `,this.cancelBtn.addEventListener("click",()=>this.cancel()),this.cancelBtn.addEventListener("mouseenter",()=>{this.submittingState||(this.cancelBtn.style.borderColor=this.colors.accent,this.cancelBtn.style.color=this.colors.accent);}),this.cancelBtn.addEventListener("mouseleave",()=>{this.submittingState||(this.cancelBtn.style.borderColor=this.colors.border,this.cancelBtn.style.color=this.colors.textTertiary);}),this.submitBtn=document.createElement("button"),this.submitBtn.style.cssText=`
      height:34px;padding:0 18px;border-radius:9999px;
      border:none;background:${this.colors.accentGradient};
      color:#fff;font-family:${a};
      font-size:13px;font-weight:600;cursor:pointer;
      opacity:0.35;pointer-events:none;
      transition:all 0.2s ease;
      box-shadow:0 2px 8px ${this.colors.accentGlow};
      display:inline-flex;align-items:center;justify-content:center;min-width:64px;
    `,this.submitLabel=document.createElement("span"),this.submitBtn.appendChild(this.submitLabel),this.submitBtn.addEventListener("click",()=>this.submit()),B.appendChild(this.copyContextBtn);let L$1=j("div",{style:"display:flex;gap:8px;margin-left:auto;"});L$1.appendChild(this.cancelBtn),L$1.appendChild(this.submitBtn),B.appendChild(L$1),this.root.appendChild(this.sourceHintEl),this.root.appendChild(this.targetSizeRow),this.root.appendChild(this.typeRow),this.root.appendChild(this.legendRow),this.draftBanner&&this.root.appendChild(this.draftBanner),this.textareaWrap.appendChild(this.textarea),this.textareaWrap.appendChild(h),this.root.appendChild(this.textareaWrap),this.root.appendChild(this.pastedImageRow),this.root.appendChild(b),this.root.appendChild(B),document.body.appendChild(this.root),this.textarea.addEventListener("paste",w=>{let v=w.clipboardData?.items;if(v)for(let C of v){if(!C.type.startsWith("image/"))continue;let H=C.getAsFile();if(!H)continue;w.preventDefault();let R=new FileReader;R.onload=()=>{typeof R.result=="string"&&this.setPastedImage(R.result);},R.readAsDataURL(H);return}}),this.applyLabels();}colors;t;agentInstructions;root;selectedType=null;textarea;textareaWrap;clearBtn;undoClearBtn;redoClearBtn;clearedMessage=null;submitBtn;cancelBtn;typeRow;submitLabel;hint;resolve=null;previouslyFocused=null;lastAnchorRect=null;lastAnchorScrollX=0;lastAnchorScrollY=0;onWindowChange=null;onKeydownTrap=null;onSubmit=null;submittingState=false;spinnerAnimation=null;voiceController=null;micBtn=null;voiceStatusEl=null;voiceUnsubs=[];voiceBaseText="";voiceFinalSoFar="";settingTextProgrammatically=false;draftSaveTimer=null;draftBanner=null;draftLabelEl=null;draftDiscardBtn=null;targetSizeRow;targetLabelEl;targetSmallestBtn;targetLargestBtn;targetSizeChoice="smallest";targetSizeOnChange=null;legendRow;legendHeadingEl;legendListEl;copyContextBtn;copyContextLabel;getPromptAnnotations=null;copyResetTimer=null;sourceHintEl;sourceHint=null;pastedImageRow;pastedImageThumb;pastedImage=null;get pastedScreenshotDataUrl(){return this.pastedImage}get isOpen(){return this.resolve!==null}refreshLabels(){this.applyLabels();}applyLabels(){this.root.setAttribute("aria-label",this.t("popup.ariaLabel"));let t=this.root.querySelectorAll("button[data-type]");for(let e of t){let o=e.dataset.type;if(!o)continue;let i=Lo[o];if(!i)continue;let s=e.querySelector("span");s&&k(s,this.t(i));}this.textarea.placeholder=this.t("popup.placeholder"),this.textarea.setAttribute("aria-label",this.t("popup.textareaAria")),this.clearBtn.setAttribute("aria-label",this.t("popup.clearMessage")),this.undoClearBtn.setAttribute("aria-label",this.t("popup.undoClear")),this.redoClearBtn.setAttribute("aria-label",this.t("popup.redoClear")),k(this.hint,Fo()?this.t("popup.submitHintMac"):this.t("popup.submitHintOther")),k(this.cancelBtn,this.t("popup.cancel")),k(this.submitLabel,this.t("popup.submit")),this.micBtn&&this.applyVoiceState(this.voiceController?.currentState??"idle"),this.draftLabelEl&&k(this.draftLabelEl,this.t("popup.draftRestored")),this.draftDiscardBtn&&k(this.draftDiscardBtn,this.t("popup.discardDraft")),k(this.targetLabelEl,this.t("popup.targetLabel")),k(this.targetSmallestBtn,this.t("popup.targetElement")),k(this.targetLargestBtn,this.t("popup.targetContainer")),this.targetSmallestBtn.setAttribute("aria-label",`${this.t("popup.targetLabel")}: ${this.t("popup.targetElement")}`),this.targetLargestBtn.setAttribute("aria-label",`${this.t("popup.targetLabel")}: ${this.t("popup.targetContainer")}`),k(this.legendHeadingEl,this.t("popup.legendLabel")),k(this.copyContextLabel,this.t("popup.copyContext")),this.copyContextBtn.setAttribute("aria-label",this.t("popup.copyContext"));}setPromptContext(t){this.getPromptAnnotations=t,this.copyContextBtn.style.display=t?"inline-flex":"none";}setSourceHint(t){if(!t){this.sourceHint=null,this.sourceHintEl.style.display="none";return}let e=[];t.componentPath&&e.push(`<${t.componentPath}>`),t.location&&e.push(`\`${t.location}\``),this.sourceHint=e.join(" \u2014 ");let o=[t.componentPath,t.location].filter(Boolean).join(" \xB7 ");k(this.sourceHintEl,`\u2316 ${o}`),this.sourceHintEl.title=o,this.sourceHintEl.style.display="flex";}setPastedImage(t){this.pastedImage=t,t?(this.pastedImageThumb.src=t,this.pastedImageRow.style.display="flex"):(this.pastedImageThumb.removeAttribute("src"),this.pastedImageRow.style.display="none");}cancelOpen(){this.isOpen&&this.cancel();}async copyComposeContext(){let t=this.getPromptAnnotations;if(!t||this.copyResetTimer)return;let e=Mo(t(),this.selectedType??"other",this.textarea.value.trim(),{instructions:this.agentInstructions,sourceHint:this.sourceHint??void 0}),o=await ba(e);k(this.copyContextLabel,this.t(o?"popup.copyContextCopied":"popup.copyContextFailed")),this.copyContextBtn.style.borderColor=o?"#22c55e":"#ef4444",this.copyContextBtn.style.color=o?"#22c55e":"#ef4444",this.copyResetTimer=setTimeout(()=>{this.copyResetTimer=null,k(this.copyContextLabel,this.t("popup.copyContext")),this.copyContextBtn.style.borderColor=this.colors.border,this.copyContextBtn.style.color=this.colors.textTertiary;},1600);}autogrowTextarea(){let t=this.textarea;t.style.height="auto",t.style.height=`${Math.min(Math.max(t.scrollHeight,100),220)}px`;}setComposerActionEnabled(t,e){t.disabled=!e,t.style.cursor=e?"pointer":"default",t.style.color=e?this.colors.accentInk:this.colors.textTertiary;}setLegend(t){if(this.legendListEl.replaceChildren(),t.length===0){this.legendRow.style.display="none";return}for(let e of t){let o=j("span",{style:`font-size:11px;color:${this.colors.textTertiary};font-family:${a};white-space:nowrap;`});k(o,`${e.number}. ${e.label}`),this.legendListEl.appendChild(o);}this.legendRow.style.display="flex",this.isOpen&&this.root.style.display==="block"&&this.positionPopup();}positionPopup(){let t=this.lastAnchorRect;if(!t)return;let e=window.scrollX-this.lastAnchorScrollX,o=window.scrollY-this.lastAnchorScrollY,i={top:t.top-o,bottom:t.bottom-o,left:t.left-e,right:t.right-e},s=this.root.offsetHeight||220,r=this.root.offsetWidth||300,a=i.bottom+8,c=i.left;if(a+s>window.innerHeight-8){let l=i.top-s-8;l>=8?a=l:a=window.innerHeight-s-8;}c+r>window.innerWidth-8&&(c=i.right-r),c=Math.max(8,c),c=Math.min(c,window.innerWidth-r-8),a=Math.max(8,a),this.root.style.top=`${a}px`,this.root.style.left=`${c}px`;}selectTargetSize(t){this.submittingState||(this.targetSizeChoice=t,this.renderTargetSizeButtons(),this.targetSizeOnChange?.(t));}renderTargetSizeButtons(){let t=this.colors.accent,e=this.colors.accentLight;for(let[o,i]of [[this.targetSmallestBtn,"smallest"],[this.targetLargestBtn,"largest"]]){let s=this.targetSizeChoice===i;o.style.background=s?e:"transparent",o.style.color=s?t:this.colors.textTertiary,o.setAttribute("aria-pressed",String(s));}}showDraftBanner(){this.draftBanner&&(this.draftBanner.style.display="flex");}hideDraftBanner(){this.draftBanner&&(this.draftBanner.style.display="none");}scheduleDraftSave(){this.draftSaveTimer&&clearTimeout(this.draftSaveTimer),this.draftSaveTimer=setTimeout(()=>{this.draftSaveTimer=null;let t=this.textarea.value;if(!t.trim()){tt();return}pn({type:this.selectedType,message:t,url:typeof window<"u"?window.location.pathname:"",savedAt:Date.now()});},500);}micAriaLabel(t){return t==="listening"?this.t("voice.micLabelListening"):this.t("voice.micLabel")}voiceStatusText(t,e){switch(t){case "requesting-permission":return this.t("voice.state.requestingPermission");case "listening":return this.t("voice.state.listening");case "processing":return this.t("voice.state.processing");case "error":return this.t(e?Ro[e]:"voice.error.unknown");case "unsupported":return this.t("voice.state.unsupported");default:return this.t("voice.consent")}}applyVoiceState(t,e){if(!this.micBtn||!this.voiceStatusEl)return;if(t==="unsupported"){this.micBtn.style.display="none",k(this.voiceStatusEl,"");return}this.micBtn.setAttribute("aria-label",this.micAriaLabel(t)),this.micBtn.setAttribute("aria-pressed",String(t==="listening")),k(this.voiceStatusEl,this.voiceStatusText(t,e));let o=t==="listening",i$1=t==="error",s=t==="requesting-permission"||t==="processing";this.micBtn.disabled=s||this.submittingState,this.micBtn.style.cursor=this.micBtn.disabled?"wait":"pointer",this.micBtn.style.color=o||i$1?"#ef4444":this.colors.textTertiary,this.micBtn.style.borderColor=o||i$1?"#ef4444":this.colors.border,this.micBtn.style.background=o?"rgba(239,68,68,0.12)":this.colors.glassBg,this.micBtn.replaceChildren(i(i$1?Ao:mn));}wireVoiceController(){let t=this.voiceController;t&&this.voiceUnsubs.push(t.onStateChange(e=>this.applyVoiceState(e)),t.onTranscript(e=>this.applyVoiceTranscript(e)),t.onError(e=>this.applyVoiceState("error",e)));}toggleVoice(){if(this.submittingState)return;this.voiceController||(this.voiceController=new Tt,this.wireVoiceController());let t=this.voiceController.currentState;t==="listening"?this.voiceController.stop():(t==="idle"||t==="error")&&(this.voiceBaseText=this.textarea.value,this.voiceFinalSoFar="",this.voiceController.start());}applyVoiceTranscript(t){t.finalSegment&&(this.voiceFinalSoFar=this.voiceFinalSoFar?`${this.voiceFinalSoFar} ${t.finalSegment}`:t.finalSegment);let e=this.voiceBaseText,o=this.voiceFinalSoFar?`${e}${e.length>0&&!/\s$/.test(e)?" ":""}${this.voiceFinalSoFar}`:e,i=t.interim?`${o}${o.length>0&&!/\s$/.test(o)?" ":""}${t.interim}`:o;this.settingTextProgrammatically=true,this.textarea.value=i,this.settingTextProgrammatically=false,this.updateSubmitState(),this.scheduleDraftSave();}show(t,e,o){return new Promise(i=>{this.resolve=i,this.onSubmit=e??null,this.selectedType=null,this.textarea.value="",this.clearedMessage=null,this.setComposerActionEnabled(this.undoClearBtn,false),this.setComposerActionEnabled(this.redoClearBtn,false),this.submittingState=false,this.resetTypeButtons(),this.hideDraftBanner(),this.setLegend([]),this.setPromptContext(null),this.setSourceHint(null),this.setPastedImage(null),this.targetSizeOnChange=o?.onChange??null,this.targetSizeChoice=o?.initial??"smallest",this.targetSizeRow.style.display=o?"flex":"none",o&&this.renderTargetSizeButtons();let s=typeof window<"u"?hn(window.location.pathname):null;s&&(this.textarea.value=s.message,s.type&&this.selectType(s.type,this.typeRow),this.showDraftBanner()),this.selectedType||this.selectType("bug",this.typeRow),this.updateSubmitState(),this.voiceBaseText="",this.voiceFinalSoFar="",this.voiceController?.currentState==="listening"&&this.voiceController.stop(),this.applyVoiceState(this.voiceController?.currentState??"idle"),this.previouslyFocused=document.activeElement,this.lastAnchorRect=t,this.lastAnchorScrollX=window.scrollX,this.lastAnchorScrollY=window.scrollY,this.root.style.display="block",this.positionPopup(),this.onWindowChange=()=>this.positionPopup(),window.addEventListener("scroll",this.onWindowChange,{passive:true,capture:true}),window.addEventListener("resize",this.onWindowChange,{passive:true}),this.onKeydownTrap=a=>{if(a.key==="Tab"){let c=Array.from(this.root.querySelectorAll('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));if(c.length===0)return;let l=c[0],d=c[c.length-1];if(!l||!d)return;a.shiftKey?(document.activeElement===l||!this.root.contains(document.activeElement))&&(a.preventDefault(),d.focus()):(document.activeElement===d||!this.root.contains(document.activeElement))&&(a.preventDefault(),l.focus());}},this.root.addEventListener("keydown",this.onKeydownTrap);let r=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;this.root.style.transition=r?"none":"",requestAnimationFrame(()=>{this.root.style.opacity="1",this.root.style.transform="translateY(0) scale(1)",this.textarea.focus();});})}selectType(t,e){this.selectedType=t;let o=e.querySelectorAll("button");for(let i of o){let s=i.dataset.type===t,r=ia(i.dataset.type??"",this.colors),a=la(i.dataset.type??"",this.colors);i.style.background=s?a:this.colors.glassBg,i.style.borderColor=s?r+"60":this.colors.border,i.style.color=s?r:this.colors.textTertiary,i.style.fontWeight=s?"600":"500",i.setAttribute("aria-pressed",String(s));}this.updateSubmitState(),this.scheduleDraftSave();}resetTypeButtons(){let t=this.root.querySelectorAll("button[data-type]");for(let e of t)e.setAttribute("aria-pressed","false"),e.disabled=false,e.style.background=this.colors.glassBg,e.style.borderColor=this.colors.border,e.style.color=this.colors.textTertiary,e.style.fontWeight="500",e.style.cursor="pointer";}updateSubmitState(){if(this.autogrowTextarea(),this.submittingState)return;let t=this.selectedType!==null&&this.textarea.value.trim().length>0;this.submitBtn.disabled=!t,this.submitBtn.style.opacity=t?"1":"0.35",this.submitBtn.style.pointerEvents=t?"auto":"none";}submit(){if(this.submittingState||!this.selectedType||!this.textarea.value.trim())return;let t={type:this.selectedType,message:this.textarea.value.trim()};if(!this.onSubmit){tt(),this.resolve?.(t),this.resolve=null,this.hideElement();return}this.enterSubmittingState();let e=this.onSubmit;e(t).then(()=>{tt(),this.resolve?.(t),this.resolve=null,this.hideElement();}).catch(()=>{this.exitSubmittingState();});}cancel(){this.submittingState||(tt(),this.resolve?.(null),this.resolve=null,this.hideElement());}enterSubmittingState(){this.submittingState=true,this.submitLabel.style.display="none",this.submitBtn.disabled=true,this.submitBtn.style.cursor="wait",this.submitBtn.style.opacity="0.85",this.submitBtn.setAttribute("aria-busy","true"),this.submitBtn.appendChild(this.buildSpinner()),this.cancelBtn.disabled=true,this.cancelBtn.style.opacity="0.5",this.cancelBtn.style.cursor="not-allowed",this.cancelBtn.style.pointerEvents="none",this.textarea.disabled=true,this.textarea.style.opacity="0.6";let t=this.typeRow.querySelectorAll("button");for(let e of t)e.disabled=true,e.style.cursor="not-allowed",e.style.opacity="0.6";this.voiceController?.currentState==="listening"&&this.voiceController.stop(),this.micBtn&&(this.micBtn.disabled=true);}exitSubmittingState(){this.submittingState=false,this.spinnerAnimation?.cancel(),this.spinnerAnimation=null,this.submitBtn.querySelector('[data-role="sp-popup-spinner"]')?.remove(),this.submitLabel.style.display="",this.submitBtn.removeAttribute("aria-busy"),this.submitBtn.style.cursor="pointer",this.cancelBtn.disabled=false,this.cancelBtn.style.opacity="1",this.cancelBtn.style.cursor="pointer",this.cancelBtn.style.pointerEvents="auto",this.textarea.disabled=false,this.textarea.style.opacity="1";let e=this.typeRow.querySelectorAll("button");for(let o of e)o.disabled=false,o.style.cursor="pointer",o.style.opacity="1";this.updateSubmitState(),this.applyVoiceState(this.voiceController?.currentState??"idle");}buildSpinner(){let t=document.createElement("div");return t.dataset.role="sp-popup-spinner",t.style.cssText=`
      width:14px;height:14px;
      border:2px solid rgba(255,255,255,0.35);
      border-top-color:#fff;
      border-radius:50%;
      box-sizing:border-box;
    `,!(typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)&&typeof t.animate=="function"&&(this.spinnerAnimation=t.animate([{transform:"rotate(0deg)"},{transform:"rotate(360deg)"}],{duration:600,iterations:1/0,easing:"linear"})),t}hideElement(){this.draftSaveTimer&&(clearTimeout(this.draftSaveTimer),this.draftSaveTimer=null),this.onKeydownTrap&&(this.root.removeEventListener("keydown",this.onKeydownTrap),this.onKeydownTrap=null),this.onWindowChange&&(window.removeEventListener("scroll",this.onWindowChange,true),window.removeEventListener("resize",this.onWindowChange),this.onWindowChange=null),this.voiceController?.currentState==="listening"&&this.voiceController.stop(),this.submittingState&&this.exitSubmittingState(),this.onSubmit=null,this.root.style.opacity="0",this.root.style.transform="translateY(8px) scale(0.98)",this.previouslyFocused?.focus(),this.previouslyFocused=null,setTimeout(()=>{this.root.style.display="none";},250);}destroy(){this.draftSaveTimer&&(clearTimeout(this.draftSaveTimer),this.draftSaveTimer=null),this.copyResetTimer&&(clearTimeout(this.copyResetTimer),this.copyResetTimer=null),this.submittingState&&this.exitSubmittingState(),this.resolve?.(null),this.resolve=null,this.onSubmit=null,this.onKeydownTrap&&(this.root.removeEventListener("keydown",this.onKeydownTrap),this.onKeydownTrap=null);for(let t of this.voiceUnsubs)t();this.voiceUnsubs=[],this.voiceController?.destroy(),this.voiceController=null,this.root.remove();}};var rt,gn=false;async function Bo(){if(rt!==void 0)return rt;try{let n=await import('./html2canvas-pro.esm-J3QHZLLU.js');return rt=n.default??n,rt}catch(n){return rt=null,gn||(gn=true,console.warn("[instafix] html2canvas import failed unexpectedly. Capture is disabled for this session \u2014 feedbacks are still submitted, just without screenshots. Underlying error:",n)),null}}function re(n,t,e){return Math.min(e,Math.max(n,t))}function At(n){return re(0,Math.round(n*1e4)/1e4,1)}async function bn(n,t){let e=await Bo();if(!e)return null;let o=.85,i=1200,s=re(48,n.width*.6,280),r=re(48,n.height*.6,220),a=window.scrollX+n.x,c=window.scrollY+n.y,l=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),d=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight),h=Math.max(0,a-s),p=Math.max(0,c-r),m=Math.min(l,a+n.width+s)-h,f=Math.min(d,c+n.height+r)-p;if(m<=0||f<=0)return null;let y={xPct:At((a-h)/m),yPct:At((c-p)/f),wPct:At(n.width/m),hPct:At(n.height/f)};try{let E=await e(document.body,{x:h,y:p,width:m,height:f,scale:window.devicePixelRatio,useCORS:!0,allowTaint:!0,logging:!1,ignoreElements:w=>w.tagName==="INSTAFIX-WIDGET"||w.closest?.("instafix-widget")!==null||w.getAttribute?.("data-instafix-ignore")==="true"});if(E.width<=i)return {dataUrl:E.toDataURL("image/jpeg",o),region:y};let k=i/E.width,b=i,B=Math.round(E.height*k),A=document.createElement("canvas");A.width=b,A.height=B;let L=A.getContext("2d");return L?(L.drawImage(E,0,0,b,B),{dataUrl:A.toDataURL("image/jpeg",o),region:y}):null}catch(E){return console.warn("[instafix] Screenshot capture failed:",E),null}}var Rt=class{constructor(t,e,o,i=false,s,r){this.colors=t;this.bus=e;this.t=o;this.enableScreenshot=i;this.getFallbackTarget=s;this.popup=new Ct(t,o,r),this.bus.on("annotation:start",()=>this.activate()),this.bus.on("targeting:start",()=>this.activateTargeting()),this.bus.on("targeting:end",()=>this.deactivateTargeting());}colors;bus;t;enableScreenshot;getFallbackTarget;overlay=null;toolbar=null;drawingRect=null;startX=0;startY=0;startScrollX=0;startScrollY=0;isDrawing=false;isActive=false;instantMode=false;popup;savedOverflow="";preActiveFocusElement=null;keyboardTarget=null;rafId=null;pendingMoveEvent=null;rejectPendingSubmission=null;accumulated=[];motionPauseHandle=null;autoScrollTimer=null;lastPointerClient=null;instructionEl=null;targetingModeActive=false;targetingHighlight=null;targetingHoveredElement=null;targetingRafId=null;pendingTargetingMoveEvent=null;get isBusy(){return this.isActive}refreshLabels(){this.popup.refreshLabels();}async maybeCapture(t){return this.enableScreenshot?bn(t):null}activate(){if(this.isActive)return;this.targetingModeActive&&this.bus.emit("targeting:end"),this.isActive=true;let t=!this.instantMode;this.motionPauseHandle=an(),this.preActiveFocusElement=document.activeElement;let e=document.activeElement;if(this.keyboardTarget=e instanceof HTMLElement&&e!==document.body&&e!==document.documentElement&&!b(e)?e:this.getFallbackTarget?.()??null,this.savedOverflow=document.body.style.overflow,document.body.style.overflow="hidden",this.overlay=j("div",{style:`
        position:fixed;inset:0;
        z-index:${2147483646};
        background:rgba(15, 23, 42, 0.04);
        cursor:${t?"crosshair":"default"};
      `}),this.overlay.setAttribute("role","application"),this.overlay.setAttribute("aria-label",t?this.t("annotator.instruction"):this.t("annotator.instantInstruction")),this.overlay.setAttribute("data-instafix-ignore","true"),t){this.toolbar=j("div",{style:`
          position:fixed;top:0;left:0;right:0;
          z-index:${2147483647};
          height:52px;
          background:${this.colors.glassBg};
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid ${this.colors.glassBorder};
          display:flex;align-items:center;justify-content:center;gap:16px;
          font-family:${a};
          font-size:14px;color:${this.colors.text};
          box-shadow:0 4px 16px ${this.colors.shadow};
          -webkit-font-smoothing:antialiased;
        `}),this.toolbar.setAttribute("data-instafix-ignore","true");let o=j("span",{style:`
          width:8px;height:8px;border-radius:50%;
          background:${this.colors.accent};
          box-shadow:0 0 8px ${this.colors.accentGlow};
          animation:pulse 1.5s ease-in-out infinite;
        `}),i=document.createElement("style");i.textContent=["@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}","@media(prefers-reduced-motion:reduce){@keyframes pulse{from,to{opacity:1}}}"].join(""),this.toolbar.appendChild(i);let s=j("span",{style:"font-weight:500;letter-spacing:-0.01em;"});k(s,this.t("annotator.instruction")),this.instructionEl=s;let r=document.createElement("button");r.style.cssText=`
        height:34px;padding:0 18px;border-radius:9999px;
        border:1px solid ${this.colors.border};
        background:${this.colors.glassBg};
        color:${this.colors.textTertiary};font-family:${a};
        font-size:13px;font-weight:500;cursor:pointer;
        transition:all 0.2s ease;
      `,k(r,this.t("annotator.cancel")),r.addEventListener("click",()=>this.deactivate()),r.addEventListener("mouseenter",()=>{r.style.borderColor=this.colors.typeBug,r.style.color=this.colors.typeBug,r.style.background=this.colors.typeBugBg;}),r.addEventListener("mouseleave",()=>{r.style.borderColor=this.colors.border,r.style.color=this.colors.textTertiary,r.style.background=this.colors.glassBg;}),this.toolbar.appendChild(o),this.toolbar.appendChild(s),this.toolbar.appendChild(r);}t&&(this.overlay.addEventListener("mousedown",this.onMouseDown),this.overlay.addEventListener("mousemove",this.onMouseMove),this.overlay.addEventListener("mouseup",this.onMouseUp),this.overlay.addEventListener("touchstart",this.onTouchStart,{passive:false}),this.overlay.addEventListener("touchmove",this.onTouchMove,{passive:false}),this.overlay.addEventListener("touchend",this.onTouchEnd),this.overlay.addEventListener("keydown",this.onOverlayKeyDown)),this.overlay.setAttribute("tabindex","0"),document.addEventListener("keydown",this.onKeyDown,true),document.body.appendChild(this.overlay),this.toolbar&&document.body.appendChild(this.toolbar),this.overlay.focus({preventScroll:true});}deactivate(){if(!this.isActive)return;this.isActive=false,this.isDrawing=false,this.instantMode=false;let t=this.preActiveFocusElement;this.preActiveFocusElement=null,this.keyboardTarget=null,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.pendingMoveEvent=null,this.stopAutoScroll(),this.motionPauseHandle?.restore(),this.motionPauseHandle=null,this.accumulated=[],this.instructionEl=null,document.body.style.overflow=this.savedOverflow,document.removeEventListener("keydown",this.onKeyDown,true),this.overlay?.remove(),this.toolbar?.remove(),this.drawingRect?.remove(),this.overlay=null,this.toolbar=null,this.drawingRect=null,t instanceof HTMLElement&&t.isConnected&&t.focus({preventScroll:true}),this.bus.emit("annotation:end");}activateTargeting(){this.targetingModeActive||(this.isActive&&this.deactivate(),this.targetingModeActive=true,this.targetingHighlight=this.createDrawingRect(),this.targetingHighlight.setAttribute("data-instafix-targeting-highlight","true"),this.targetingHighlight.style.left="-9999px",this.targetingHighlight.style.top="-9999px",this.targetingHighlight.style.width="0px",this.targetingHighlight.style.height="0px",document.body.appendChild(this.targetingHighlight),document.addEventListener("mousemove",this.onTargetingMouseMove),document.addEventListener("click",this.onTargetingClick,true),document.addEventListener("keydown",this.onTargetingKeyDown,true),window.addEventListener("scroll",this.onTargetingScroll,{passive:true,capture:true}));}deactivateTargeting(){this.targetingModeActive&&(this.targetingModeActive=false,this.targetingRafId!==null&&(cancelAnimationFrame(this.targetingRafId),this.targetingRafId=null),this.pendingTargetingMoveEvent=null,this.targetingHoveredElement=null,document.removeEventListener("mousemove",this.onTargetingMouseMove),document.removeEventListener("click",this.onTargetingClick,true),document.removeEventListener("keydown",this.onTargetingKeyDown,true),window.removeEventListener("scroll",this.onTargetingScroll,true),this.targetingHighlight?.remove(),this.targetingHighlight=null);}renderTargetingHighlight(t){if(!this.targetingHighlight)return;let e=t.getBoundingClientRect();this.targetingHighlight.style.left=`${e.left}px`,this.targetingHighlight.style.top=`${e.top}px`,this.targetingHighlight.style.width=`${e.width}px`,this.targetingHighlight.style.height=`${e.height}px`;}onTargetingMouseMove=t=>{this.pendingTargetingMoveEvent=t,this.targetingRafId===null&&(this.targetingRafId=requestAnimationFrame(()=>{this.targetingRafId=null;let e=this.pendingTargetingMoveEvent;if(!e||!this.targetingHighlight)return;let o=document.elementFromPoint(e.clientX,e.clientY);if(!o||o===document.body||o===document.documentElement||b(o)){this.targetingHoveredElement=null,this.targetingHighlight.style.width="0px",this.targetingHighlight.style.height="0px";return}this.targetingHoveredElement=o,this.renderTargetingHighlight(o);}));};onTargetingScroll=()=>{this.targetingHoveredElement&&this.renderTargetingHighlight(this.targetingHoveredElement);};onTargetingClick=t=>{t.target instanceof Element&&b(t.target)||(t.preventDefault(),t.stopPropagation(),this.deactivateTargeting(),this.bus.emit("targeting:end"),this.startInstantAnnotation(t.clientX,t.clientY).catch(()=>{}));};onTargetingKeyDown=t=>{t.key==="Escape"&&(this.deactivateTargeting(),this.bus.emit("targeting:end"));};onKeyDown=t=>{if(t.key==="Escape"){if(this.popup.isOpen){this.popup.cancelOpen();return}this.deactivate();}};onOverlayKeyDown=async t=>{if(t.key!=="Enter"||(t.preventDefault(),this.popup.isOpen)||this.isDrawing)return;let e=this.keyboardTarget;if(!e||!(e instanceof HTMLElement))return;let o=e.getBoundingClientRect();if(o.width<=0||o.height<=0)return;let i=new DOMRect(o.x,o.y,o.width,o.height);this.drawingRect?.remove();let s=this.createDrawingRect();s.style.left=`${o.x}px`,s.style.top=`${o.y}px`,s.style.width=`${o.width}px`,s.style.height=`${o.height}px`,this.drawingRect=s,this.overlay?.appendChild(s);let r=e,{annotation:a,anchorBounds:c}=this.annotationForElement(r,i,{fullBounds:true}),l=i,d=f(e),h=d!==e,p={},m=this.popup.show(i,y=>this.runSubmission([a],y,l,p),h?{initial:"smallest",onChange:y=>{r=y==="smallest"?e:d;let E=this.annotationForElement(r,i,{fullBounds:true});a=E.annotation,c=E.anchorBounds,l=this.clampRectToViewport(c),delete p.value,this.drawingRect&&(this.drawingRect.style.left=`${c.left}px`,this.drawingRect.style.top=`${c.top}px`,this.drawingRect.style.width=`${c.width}px`,this.drawingRect.style.height=`${c.height}px`),this.popup.setSourceHint(W(r));}}:void 0);this.popup.setPromptContext(()=>[a]),this.popup.setSourceHint(W(e));let f$1=await m;this.drawingRect?.remove(),this.drawingRect=null,f$1&&this.deactivate();};onMouseDown=t=>{this.startDrawing(t.clientX,t.clientY);};onTouchStart=t=>{t.preventDefault();let e=t.touches[0];e&&this.startDrawing(e.clientX,e.clientY);};startDrawing(t,e){this.popup.isOpen||(this.isDrawing=true,this.startX=t,this.startY=e,this.startScrollX=window.scrollX,this.startScrollY=window.scrollY,this.lastPointerClient={x:t,y:e},this.startAutoScroll(),this.drawingRect?.remove(),this.drawingRect=this.createDrawingRect(),this.overlay?.appendChild(this.drawingRect));}effectiveDragStart(){return {x:this.startX-(window.scrollX-this.startScrollX),y:this.startY-(window.scrollY-this.startScrollY)}}renderDrawingRect(t,e){if(!this.drawingRect)return;let o=this.effectiveDragStart(),i=Math.min(t,o.x),s=Math.min(e,o.y),r=Math.abs(t-o.x),a=Math.abs(e-o.y);this.drawingRect.style.left=`${i}px`,this.drawingRect.style.top=`${s}px`,this.drawingRect.style.width=`${r}px`,this.drawingRect.style.height=`${a}px`;}startAutoScroll(){this.stopAutoScroll(),this.autoScrollTimer=setInterval(()=>{if(!this.isDrawing||!this.lastPointerClient)return;let{dx:t,dy:e}=tn(this.lastPointerClient.x,this.lastPointerClient.y,window.innerWidth,window.innerHeight);(t!==0||e!==0)&&window.scrollBy(t,e),this.renderDrawingRect(this.lastPointerClient.x,this.lastPointerClient.y);},16);}stopAutoScroll(){this.autoScrollTimer!==null&&(clearInterval(this.autoScrollTimer),this.autoScrollTimer=null);}applyDrawingRectBounds(t){this.drawingRect&&(this.drawingRect.style.left=`${t.left}px`,this.drawingRect.style.top=`${t.top}px`,this.drawingRect.style.width=`${t.width}px`,this.drawingRect.style.height=`${t.height}px`);}currentDrawingRectBounds(){let t=this.drawingRect;return t?{left:Number.parseFloat(t.style.left)||0,top:Number.parseFloat(t.style.top)||0,width:Number.parseFloat(t.style.width)||0,height:Number.parseFloat(t.style.height)||0}:null}createDrawingRect(){let t=j("div",{style:`
        position:fixed;
        z-index:${2147483647};
        border:2px solid ${this.colors.selection};
        background:${this.colors.selection}12;
        pointer-events:none;
        border-radius:8px;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.85),
          inset 0 0 0 1px rgba(255,255,255,0.85),
          0 0 16px ${this.colors.selectionGlow};
        transition:box-shadow 0.15s ease;
      `});return t.setAttribute("data-instafix-ignore","true"),t}onMouseMove=t=>{this.scheduleRectUpdate(t);};onTouchMove=t=>{t.preventDefault(),t.touches[0]&&this.scheduleRectUpdate(t.touches[0]);};scheduleRectUpdate(t){!this.isDrawing||!this.drawingRect||(this.pendingMoveEvent=t,this.rafId===null&&(this.rafId=requestAnimationFrame(()=>{this.rafId=null;let e=this.pendingMoveEvent;!e||!this.drawingRect||(this.lastPointerClient={x:e.clientX,y:e.clientY},this.renderDrawingRect(e.clientX,e.clientY));})));}onTouchEnd=async t=>{let e=t.changedTouches[0];e&&await this.finishDrawing(e.clientX,e.clientY,t.altKey,t.shiftKey);};onMouseUp=async t=>{await this.finishDrawing(t.clientX,t.clientY,t.altKey,t.shiftKey);};finishDrawing=async(t,e$1,o,i)=>{if(!this.isDrawing||!this.drawingRect)return;this.isDrawing=false,this.stopAutoScroll();let s=this.effectiveDragStart(),r=Math.min(t,s.x),a=Math.min(e$1,s.y),c=Math.abs(t-s.x),l=Math.abs(e$1-s.y);if(c<6&&l<6){let f$1=new DOMRect(t,e$1,1,1);this.overlay&&(this.overlay.style.pointerEvents="none");let y=e(f$1),E=f(y);this.overlay&&(this.overlay.style.pointerEvents="auto");let{annotation:k,anchorBounds:b}=this.annotationForElement(y,f$1,{fullBounds:true});this.applyDrawingRectBounds(b),await this.finalizeOrAccumulate([k],this.clampRectToViewport(b),i,void 0,{smallest:y,largest:E});return}let d=new DOMRect(r,a,c,l),h,p,m;if(o)h=[this.buildAreaAnnotation(d)];else {let f$1=this.tryBuildTextAnnotation(t,e$1);if(f$1)h=[f$1.annotation],m={smallest:f$1.detected.container,largest:f(f$1.detected.container)};else {let y=this.buildMarqueeAnnotations(d);h=y.annotations,p={elements:y.elements,detailElements:y.detailElements,detailAnnotations:y.detailAnnotations},y.singleAnchor&&(m={smallest:y.singleAnchor,largest:f(y.singleAnchor)});}}await this.finalizeOrAccumulate(h,d,i,p,m);};async finalizeOrAccumulate(t,e,o,i,s){if(o){this.accumulated.push(...t),this.updateAccumulationHint(),this.drawingRect?.remove(),this.drawingRect=null;return}let r=this.accumulated.length===0&&(i?.elements.length??0)>1,a=[...this.accumulated,...t];this.accumulated=[];let c=r&&i?new kt(this.colors,{summary:i.elements,detail:i.detailElements.length>0?i.detailElements:i.elements},this.t,e,y=>{a=y==="detail"&&i.detailAnnotations.length>0?i.detailAnnotations:t,this.popup.setLegend(this.legendEntriesFromAnnotations(a));}):null,l={},d=a,h=e,p=this.currentDrawingRectBounds()??e,m=this.popup.show(e,y=>this.runSubmission(a,y,e,l),s&&s.smallest!==s.largest?{initial:"smallest",onChange:y=>{if(y==="largest"){let E=this.annotationForElement(s.largest,e,{fullBounds:true});a=[E.annotation],e=this.clampRectToViewport(E.anchorBounds),this.applyDrawingRectBounds(E.anchorBounds),this.popup.setSourceHint(W(s.largest));}else a=d,e=h,this.applyDrawingRectBounds(p),this.popup.setSourceHint(W(s.smallest));delete l.value;}}:void 0);r&&this.popup.setLegend(this.legendEntriesFromAnnotations(a)),this.popup.setPromptContext(()=>a),s&&this.popup.setSourceHint(W(s.smallest));let f=await m;c?.destroy(),this.drawingRect?.remove(),this.drawingRect=null,f&&this.deactivate();}legendEntriesFromAnnotations(t){return t.map((e,o)=>{let i=e.anchor.textSnippet.trim()||e.anchor.elementTag.toLowerCase(),s=i.length>24?`${i.slice(0,24)}\u2026`:i;return {number:o+1,label:s}})}updateAccumulationHint(){if(!this.instructionEl)return;let t=this.accumulated.length;k(this.instructionEl,t>0?A(this.t,"annotator.selectionCount",{count:t}):this.t("annotator.instruction"));}tryBuildTextAnnotation(t,e){let o=this.effectiveDragStart(),i=dn(o.x,o.y,t,e);return i?{annotation:this.buildTextAnnotationFor(i,i.container),detected:i}:null}buildTextAnnotationFor(t,e){let o=d(e),i=e.getBoundingClientRect(),s=g(t.rect,i);return {anchor:o,rect:s,scrollX:window.scrollX,scrollY:window.scrollY,viewportW:window.innerWidth,viewportH:window.innerHeight,devicePixelRatio:window.devicePixelRatio,target:{kind:"text",quote:t.quote,quotePrefix:t.quotePrefix,quoteSuffix:t.quoteSuffix},inspect:Et(e)}}buildAreaAnnotation(t){let e=window.innerWidth,o=window.innerHeight;return {anchor:{cssSelector:"body",xpath:"/html/body",textSnippet:"",elementTag:"BODY",textPrefix:"",textSuffix:"",fingerprint:"",neighborText:""},rect:{xPct:t.x/e,yPct:t.y/o,wPct:t.width/e,hPct:t.height/o},scrollX:window.scrollX,scrollY:window.scrollY,viewportW:e,viewportH:o,devicePixelRatio:window.devicePixelRatio,target:{kind:"area"}}}buildMarqueeAnnotations(t){this.overlay&&(this.overlay.style.pointerEvents="none");let e=sn(t),o=e.length>1?rn(t):[];if(this.overlay&&(this.overlay.style.pointerEvents="auto"),e.length<=1){let{annotation:r,anchorElement:a}=this.buildAnnotation(t);return {annotations:[r],elements:[],detailElements:[],detailAnnotations:[],singleAnchor:a}}let i=this.annotationsForElements(e),s=o.length>0?this.annotationsForElements(o):[];return {annotations:i,elements:e,detailElements:o,detailAnnotations:s}}annotationsForElements(t){return t.map(e=>({anchor:d(e),rect:{xPct:0,yPct:0,wPct:1,hPct:1},scrollX:window.scrollX,scrollY:window.scrollY,viewportW:window.innerWidth,viewportH:window.innerHeight,devicePixelRatio:window.devicePixelRatio,target:{kind:"element"},inspect:Et(e)}))}async startInstantAnnotation(t,e$1){if(this.isActive)return;this.instantMode=true,this.bus.emit("annotation:start");let o=new DOMRect(t,e$1,1,1);this.overlay&&(this.overlay.style.pointerEvents="none");let i=e(o),s=f(i);this.overlay&&(this.overlay.style.pointerEvents="auto");let r=s!==i,a=i,{annotation:c,anchorBounds:l}=this.annotationForElement(a,o,{fullBounds:true}),d=this.clampRectToViewport(l);this.drawingRect?.remove(),this.drawingRect=this.createDrawingRect(),this.drawingRect.style.left=`${l.left}px`,this.drawingRect.style.top=`${l.top}px`,this.drawingRect.style.width=`${l.width}px`,this.drawingRect.style.height=`${l.height}px`,this.overlay?.appendChild(this.drawingRect);let h={},p=this.popup.show(o,m=>this.runSubmission([c],m,d,h),r?{initial:"smallest",onChange:m=>{a=m==="smallest"?i:s;let f=this.annotationForElement(a,o,{fullBounds:true});c=f.annotation,l=f.anchorBounds,d=this.clampRectToViewport(l),delete h.value,this.drawingRect&&(this.drawingRect.style.left=`${l.left}px`,this.drawingRect.style.top=`${l.top}px`,this.drawingRect.style.width=`${l.width}px`,this.drawingRect.style.height=`${l.height}px`),this.popup.setSourceHint(W(a));}}:void 0);this.popup.setPromptContext(()=>[c]),this.popup.setSourceHint(W(a)),await p,this.drawingRect?.remove(),this.drawingRect=null,this.deactivate();}async runSubmission(t,e,o,i){let s=this.popup.pastedScreenshotDataUrl;s?i.value={dataUrl:s,region:{xPct:0,yPct:0,wPct:1,hPct:1}}:i.value===void 0&&(i.value=await this.maybeCapture(o));let r=i.value;await new Promise((a,c)=>{let l=()=>{d(),h(),p(),this.rejectPendingSubmission=null;},d=this.bus.on("feedback:sent",()=>{l(),a();}),h=this.bus.on("feedback:error",m=>{l(),c(m);}),p=this.bus.on("submission:cancelled",()=>{l(),c(new Error("Feedback submission cancelled"));});this.rejectPendingSubmission=m=>{l(),c(m);},this.bus.emit("annotation:complete",{annotations:t,type:e.type,message:e.message,screenshotDataUrl:r?.dataUrl??null,screenshotRegion:r?.region??null});});}clampRectToViewport(t){let e=Math.max(0,t.left),o=Math.max(0,t.top);return new DOMRect(e,o,Math.max(0,Math.min(t.right,window.innerWidth)-e),Math.max(0,Math.min(t.bottom,window.innerHeight)-o))}annotationForElement(t,e,o){let i=d(t),s=t.getBoundingClientRect(),r=o?.fullBounds?{xPct:0,yPct:0,wPct:1,hPct:1}:g(e,s);return {annotation:{anchor:i,rect:r,scrollX:window.scrollX,scrollY:window.scrollY,viewportW:window.innerWidth,viewportH:window.innerHeight,devicePixelRatio:window.devicePixelRatio,target:{kind:"element"},inspect:Et(t)},anchorBounds:s}}buildAnnotation(t,e$1){this.overlay&&(this.overlay.style.pointerEvents="none");let o=e(t);return this.overlay&&(this.overlay.style.pointerEvents="auto"),{...this.annotationForElement(o,t,e$1),anchorElement:o}}destroy(){this.deactivate(),this.deactivateTargeting(),this.rejectPendingSubmission?.(new Error("Annotator destroyed during submission")),this.popup.destroy();}};async function K(n,t){let e={};t&&(e["Content-Type"]="application/json"),n.apiKey&&(e.Authorization=`Bearer ${n.apiKey}`);let o=typeof n.headers=="function"?await n.headers():n.headers;return o&&Object.assign(e,o),e}var Po=3,Io=1e4,Lt="instafix_retry_queue",Ho=20;async function V(n,t,e=Po){for(let o=0;o<=e;o++){let i=new AbortController,s=setTimeout(()=>i.abort(),Io);try{let c=await fetch(n,{...t,signal:i.signal});if(clearTimeout(s),c.ok||c.status>=400&&c.status<500||o===e)return c}catch(c){if(clearTimeout(s),o===e)throw c}let r=1e3*2**o,a=Math.random()*1e3-500;await new Promise(c=>setTimeout(c,r+a));}throw new Error("Max retries exceeded")}var Oo="instafix_retry_queue";async function wn(n){return typeof navigator<"u"&&navigator.locks?navigator.locks.request(Oo,()=>n()):n()}function _o(n$1){return n(n$1,"endpoint")&&typeof n$1.endpoint=="string"&&n(n$1,"payload")&&typeof n$1.payload=="object"&&n$1.payload!==null}function En(){let n=localStorage.getItem(Lt);if(!n)return [];let t=JSON.parse(n);return Array.isArray(t)?t.filter(_o):[]}function Do(n,t){wn(()=>{try{let e=En();e.length>=Ho&&e.shift(),e.push({endpoint:n,payload:t}),localStorage.setItem(Lt,JSON.stringify(e));}catch{}});}function vn(n){return n.trim()}function xn(n){return n.trim().toLowerCase()}async function Sn(n,t,e={}){await wn(async()=>{try{let o=En();if(o.length===0)return;let i=[],s=[],r=0;for(let l of o){if(l.endpoint!==n){s.push(l);continue}!t||vn(l.payload.authorName)===vn(t.name)&&xn(l.payload.authorEmail)===xn(t.email)?i.push(l):r+=1;}if(i.length===0&&r===0)return;r>0;let a=[];if(i.length>0){let l=await K(e,!0);for(let d of i)try{(await fetch(n,{method:"POST",headers:l,body:JSON.stringify(d.payload)})).ok||a.push(d);}catch{a.push(d);}}let c=s.concat(a);c.length>0?localStorage.setItem(Lt,JSON.stringify(c)):localStorage.removeItem(Lt);}catch{}});}async function at(n){return await n.json()}var Mt=class{constructor(t,e,o={}){this.endpoint=t;this.projectName=e;this.auth=o;}endpoint;projectName;auth;async sendFeedback(t){let{screenshotRegion:e,...o}=t,i=e?{...o,screenshotRegion:e}:o;try{let s;try{s=await V(this.endpoint,{method:"POST",headers:await K(this.auth,!0),body:JSON.stringify(i)});}catch(r){throw x(r,"Failed to send feedback")}if(!s.ok)throw await w(s,"Failed to send feedback");return at(s)}catch(s){throw Do(this.endpoint,i),s}}async getFeedbacks(t,e){let o=v({projectName:t,...e}),i;try{let s=await K(this.auth,!1);i=await V(`${this.endpoint}?${o.toString()}`,{method:"GET",cache:"no-store",...Object.keys(s).length>0?{headers:s}:{}});}catch(s){throw x(s,"Failed to fetch feedbacks")}if(!i.ok)throw await w(i,"Failed to fetch feedbacks");return at(i)}async resolveFeedback(t,e){let o;try{o=await V(this.endpoint,{method:"PATCH",headers:await K(this.auth,!0),body:JSON.stringify({id:t,projectName:this.projectName,status:e?"resolved":"open"})});}catch(i){throw x(i,"Failed to update feedback")}if(!o.ok)throw await w(o,"Failed to update feedback");return at(o)}async updateFeedbackMessage(t,e,o){let i;try{i=await V(this.endpoint,{method:"PATCH",headers:await K(this.auth,!0),body:JSON.stringify({id:t,projectName:this.projectName,status:e,message:o})});}catch(s){throw x(s,"Failed to update feedback")}if(!i.ok)throw await w(i,"Failed to update feedback");return at(i)}async updateFeedbackAnnotations(t,e,o){let i;try{i=await V(this.endpoint,{method:"PATCH",headers:await K(this.auth,!0),body:JSON.stringify({id:t,projectName:this.projectName,status:e,annotations:o})});}catch(s){throw x(s,"Failed to update feedback")}if(!i.ok)throw await w(i,"Failed to update feedback");return at(i)}async deleteFeedback(t){let e;try{e=await V(this.endpoint,{method:"DELETE",headers:await K(this.auth,!0),body:JSON.stringify({id:t,projectName:this.projectName})});}catch(o){throw x(o,"Failed to delete feedback")}if(!e.ok)throw await w(e,"Failed to delete feedback")}async handoffFeedback(t){try{return (await fetch(this.endpoint,{method:"POST",headers:await K(this.auth,!0),body:JSON.stringify({action:"handoff",id:t})})).ok}catch{return  false}}async deleteAllFeedbacks(t){let e;try{e=await V(this.endpoint,{method:"DELETE",headers:await K(this.auth,!0),body:JSON.stringify({projectName:t,deleteAll:!0})});}catch(o){throw x(o,"Failed to delete all feedbacks")}if(!e.ok)throw await w(e,"Failed to delete all feedbacks")}};var $o=["log","info","warn","error"];function No(n){if(n===null)return "null";if(n===void 0)return "undefined";if(typeof n=="string")return n;if(typeof n=="number"||typeof n=="boolean"||typeof n=="bigint")return String(n);if(n instanceof Error)return `${n.name}: ${n.message}${n.stack?`
${n.stack}`:""}`;try{let t=new WeakSet;return JSON.stringify(n,(e,o)=>{if(typeof o=="function")return "[Function]";if(typeof o=="symbol")return o.toString();if(typeof o=="object"&&o!==null){if(t.has(o))return "[Circular]";t.add(o);}return o})}catch{try{return String(n)}catch{return "[Unserializable]"}}}function zo(n){let t="";for(let e=0;e<n.length&&(e>0&&(t+=" "),t+=No(n[e]),!(t.length>=500));e++);return t.length>500&&(t=`${t.slice(0,499)}\u2026`),t}var Ft=class{maxEntries;entries=[];originals=new Map;disposed=false;constructor(t=50){if(this.maxEntries=Math.min(Math.max(Math.floor(t),0),1e3),!(typeof console>"u"))for(let e of $o){let o=console[e];if(typeof o!="function")continue;this.originals.set(e,o);let i=this,s=function(...r){try{i.push(e,r);}catch{}o.apply(this??console,r);};try{Object.defineProperty(s,"name",{value:e});}catch{}console[e]=s;}}push(t,e){this.maxEntries!==0&&(this.entries.length>=this.maxEntries&&this.entries.shift(),this.entries.push({level:t,timestamp:new Date().toISOString(),message:zo(e)}));}getEntries(){return this.entries.slice()}dispose(){if(!this.disposed&&(this.disposed=true,!(typeof console>"u"))){for(let[t,e]of this.originals)try{console[t]=e;}catch{}this.originals.clear();}}};function kn(n){return n.length<=2e3?n:`${n.slice(0,1999)}\u2026`}function Tn(n){if(typeof n=="string")return n;if(n instanceof URL)return n.href;if(typeof n=="object"&&n!==null&&"url"in n){let t=n.url;if(typeof t=="string")return t}try{return String(n)}catch{return "(unknown)"}}var Bt=class{maxEntries;entries=[];originalFetch=null;originalXhrOpen=null;originalXhrSend=null;disposed=false;constructor(t=20){this.maxEntries=Math.min(Math.max(Math.floor(t),0),500),this.installFetch(),this.installXhr();}push(t){this.maxEntries!==0&&(this.entries.length>=this.maxEntries&&this.entries.shift(),this.entries.push(t));}installFetch(){if(typeof globalThis.fetch!="function")return;let t=globalThis.fetch;this.originalFetch=t;let e=async(o,i)=>{let s=new Date,r=typeof performance<"u"?performance.now():Date.now(),a=kn(Tn(o)),c=(i?.method??(o instanceof Request?o.method:"GET")).toUpperCase();try{let l=await t(o,i);if(!l.ok){let d=typeof performance<"u"?performance.now():Date.now();this.push({url:a,method:c,status:l.status,durationMs:Math.round(d-r),timestamp:s.toISOString()});}return l}catch(l){let d=typeof performance<"u"?performance.now():Date.now();throw this.push({url:a,method:c,status:0,durationMs:Math.round(d-r),timestamp:s.toISOString()}),l}};globalThis.fetch=e;}installXhr(){if(typeof XMLHttpRequest>"u")return;let t=XMLHttpRequest.prototype,e=t.open,o=t.send;this.originalXhrOpen=e,this.originalXhrSend=o;let i=this,s=new WeakMap;t.open=function(r,a,...c){try{s.set(this,{method:r.toUpperCase(),url:kn(Tn(a)),startedAt:new Date,t0:typeof performance<"u"?performance.now():Date.now()});}catch{}return e.call(this,r,a,...c)},t.send=function(r){let a=s.get(this);if(a){let c=()=>{try{let l=typeof performance<"u"?performance.now():Date.now(),d=this.status;(d===0||d>=400)&&i.push({url:a.url,method:a.method,status:d,durationMs:Math.round(l-a.t0),timestamp:a.startedAt.toISOString()});}catch{}};try{this.addEventListener("loadend",c,{once:!0});}catch{try{this.addEventListener("loadend",c);}catch{}}}return o.call(this,r??null)};}getEntries(){return this.entries.slice()}dispose(){if(!this.disposed){if(this.disposed=true,this.originalFetch&&typeof globalThis.fetch=="function")try{globalThis.fetch=this.originalFetch;}catch{}if(typeof XMLHttpRequest<"u")try{this.originalXhrOpen&&(XMLHttpRequest.prototype.open=this.originalXhrOpen),this.originalXhrSend&&(XMLHttpRequest.prototype.send=this.originalXhrSend);}catch{}}}};function Cn(n,t){if(typeof document>"u"||typeof document.elementsFromPoint!="function")return  false;let e=n==="bottom-right"?window.innerWidth-24-52/2:24+52/2,o=window.innerHeight-24-52/2;return e<0||o<0?false:document.elementsFromPoint(e,o).some(i=>{if(i===t||t.contains(i)||i===document.documentElement||i===document.body)return  false;let s=getComputedStyle(i);if(s.position!=="fixed"&&s.position!=="sticky"||s.display==="none"||s.visibility==="hidden"||Number.parseFloat(s.opacity)===0)return  false;let r=i.getBoundingClientRect();return r.width>4&&r.height>4})}function ae(n,t){if(!Cn(n,t))return n;let e="bottom-left";return Cn(e,t)?n:e}var Ko='button, a[href], input[type="submit"], input[type="button"], [role="button"]',Xo=.2,jo=200,Wo=40,An=[{name:"coral",h:15,s:.8,l:.55},{name:"amber",h:45,s:.85,l:.5},{name:"lime",h:90,s:.6,l:.42},{name:"teal",h:175,s:.7,l:.42},{name:"violet",h:275,s:.65,l:.55},{name:"magenta",h:320,s:.7,l:.5}];function qo(n,t,e){let o=n/255,i=t/255,s=e/255,r=Math.max(o,i,s),a=Math.min(o,i,s),c=(r+a)/2;if(r===a)return {h:0,s:0,l:c};let l=r-a,d=c>.5?l/(2-r-a):l/(r+a),h;return r===o?h=(i-s)/l+(i<s?6:0):r===i?h=(s-o)/l+2:h=(o-i)/l+4,{h:h*60,s:d,l:c}}function Fn(n,t,e){let o=(1-Math.abs(2*e-1))*t,i=o*(1-Math.abs(n/60%2-1)),s=e-o/2,r=0,a=0,c=0;return n<60?[r,a,c]=[o,i,0]:n<120?[r,a,c]=[i,o,0]:n<180?[r,a,c]=[0,o,i]:n<240?[r,a,c]=[0,i,o]:n<300?[r,a,c]=[i,0,o]:[r,a,c]=[o,0,i],{r:Math.round((r+s)*255),g:Math.round((a+s)*255),b:Math.round((c+s)*255)}}function Uo(n,t,e){let{r:o,g:i,b:s}=Fn(n,t,e),r=a=>a.toString(16).padStart(2,"0");return `#${r(o)}${r(i)}${r(s)}`}function Vo(n,t){let e=Math.abs(n-t)%360;return e>180?360-e:e}var Yo=3,Rn=.03,Ln=.22,Mn=.78;function Go(n,t){let e=Math.max(n,t),o=Math.min(n,t);return (e+.05)/(o+.05)}function Jo(n,t,e,o){let i=o?1:0,s=o?-Rn:Rn,r=e;for(;r>=Ln&&r<=Mn;){let{r:a,g:c,b:l}=Fn(n,t,r);if(Go(da(a,c,l),i)>=Yo)return r;r+=s;}return o?Ln:Mn}function Zo(n){if(n){let t=fa(Math.round(window.innerWidth/2),Math.round(window.innerHeight/2),n);if(t!==null)return t}for(let t of [document.body,document.documentElement]){if(!t)continue;let e=ea(getComputedStyle(t).backgroundColor);if(e&&e.a>.5)return da(e.r,e.g,e.b)>.5}return  true}function le(n){if(typeof document>"u"||typeof document.querySelectorAll!="function")return null;try{let t=[],e=document.querySelectorAll(Ko),o=window.innerWidth,i=window.innerHeight;for(let l=0;l<e.length&&l<jo&&t.length<Wo;l++){let d=e[l];if(!d||b(d))continue;let h=d.getBoundingClientRect();if(h.width<=0||h.height<=0||h.right<0||h.bottom<0||h.left>o||h.top>i)continue;let p=getComputedStyle(d),m=ea(p.backgroundColor);if((!m||m.a<=.5)&&(m=ea(p.color)),!m||m.a<=.5)continue;let{h:f,s:y}=qo(m.r,m.g,m.b);y<Xo||t.push(f);}if(t.length===0)return null;let s=An[0],r=-1;for(let l of An){let d=Number.POSITIVE_INFINITY;for(let h of t){let p=Vo(l.h,h);p<d&&(d=p);}d>r&&(r=d,s=l);}let a=Zo(n),c=Jo(s.h,s.s,s.l,a);return {hex:Uo(s.h,s.s,c)}}catch{return null}}var lt=class{listeners=new Map;on(t,e){let o=this.listeners.get(t);return o||(o=new Set,this.listeners.set(t,o)),o.add(e),()=>{o?.delete(e);}}off(t,e){this.listeners.get(t)?.delete(e);}emit(t,...e){let o=this.listeners.get(t);if(o)for(let i of o)try{i(...e);}catch(s){console.error(`[instafix] Error in event listener for "${String(t)}":`,s);}}removeAll(){this.listeners.clear();}};var Bn="instafix-freeze-style",Qo=["display","visibility","opacity","transform","pointer-events","max-height","clip-path"];function ti(){return typeof document<"u"&&document.getElementById(Bn)!==null}function ei(){let n=document.createElement("style");return n.id=Bn,n.textContent=`
    *:not(instafix-widget):not(instafix-widget *):not([data-instafix-ignore]):not([data-instafix-ignore] *) {
      animation-play-state: paused !important;
      transition: none !important;
      caret-color: transparent !important;
    }
  `,document.head.appendChild(n),n}function ni(){let n=[],t=document.querySelectorAll("video, audio");for(let e of t)if(!(e.closest("instafix-widget")||e.closest("[data-instafix-ignore]"))&&!e.paused)try{e.pause(),n.push(e);}catch{}return n}function oi(){let n;try{n=document.querySelectorAll(":hover");}catch{return []}let t=n[n.length-1];if(!(t instanceof HTMLElement))return [];if(t===document.body||t===document.documentElement)return [];if(t.closest("instafix-widget")||t.closest("[data-instafix-ignore]"))return [];let e=[t];for(let i of t.querySelectorAll("*")){if(e.length>=300)break;e.push(i);}let o=[];for(let i of e){let s=getComputedStyle(i),r=[];for(let a of Qo){let c=i.style.getPropertyValue(a);r.push([a,c===""?null:c]),i.style.setProperty(a,s.getPropertyValue(a),"important");}o.push({element:i,previous:r});}return o}function Pn(){if(typeof document>"u"||ti())return {pinnedCount:0,pausedMediaCount:0,release:()=>{}};let n=oi(),t=ei(),e=ni(),o=false;return {pinnedCount:n.length,pausedMediaCount:e.length,release(){if(!o){o=true,t.remove();for(let i of e)i.play().catch(()=>{});for(let{element:i,previous:s}of n)for(let[r,a]of s)a===null?i.style.removeProperty(r):i.style.setProperty(r,a);}}}}var ii=200,si=[3e3,4e3,5e3],ri={chat:"fab.messages",annotate:"fab.annotate","target-picker":"fab.targeting",freeze:"fab.freeze","toggle-annotations":"fab.annotations","move-side":"fab.moveLeft"},In={chat:"KeyS",annotate:"KeyA","target-picker":"KeyT",freeze:"KeyP","toggle-annotations":"KeyV","move-side":"KeyM"};function ai(){return typeof navigator>"u"?false:/Mac|iP(hone|ad|od)/.test(navigator.platform||navigator.userAgent)}function li(n){let t=n.replace(/^Key/,"");return ai()?`\u2325\u21E7${t}`:`Alt+Shift+${t}`}var ce="instafix_toolbar_hidden";function ci(){try{return localStorage.getItem(ce)==="1"}catch{return  false}}function Hn(n){try{n?localStorage.setItem(ce,"1"):localStorage.removeItem(ce);}catch{}}var Pt=class{constructor(t,e,o,i$1){this.bus=o;this.t=i$1;let s=e.position??"bottom-right";this.host=t.host,this.shadowRootRef=t,this.items=[{id:"chat",icon:T},{id:"annotate",icon:U},{id:"target-picker",icon:Z},{id:"freeze",icon:X,iconAlt:Y}],e.showAnnotationsToggle!==false&&this.items.push({id:"toggle-annotations",icon:E,iconAlt:F});let r=s==="bottom-right",a={id:"move-side",icon:r?V$1:W$1,labelKey:r?"fab.moveLeft":"fab.moveRight"};r?this.items.unshift(a):this.items.push(a),this.unsubTargetingStart=this.bus.on("targeting:start",()=>this.setTargetingActive(true)),this.unsubTargetingEnd=this.bus.on("targeting:end",()=>this.setTargetingActive(false)),this.unsubAnnotationStart=this.bus.on("annotation:start",()=>this.setAnnotateActive(true)),this.unsubAnnotationEnd=this.bus.on("annotation:end",()=>this.setAnnotateActive(false)),this.unsubPanelOpen=this.bus.on("open",()=>{this.panelOpen=true,this.stopShineSchedule();}),this.unsubPanelClose=this.bus.on("close",()=>{this.panelOpen=false,this.scheduleShine();}),this.toolbarVisible=!ci(),this.fab=document.createElement("button"),this.fab.className=`sp-fab sp-fab--${s} sp-anim-fab-in`,this.fab.style.position="fixed",this.fab.appendChild(i(this.toolbarVisible?G:D)),this.fab.setAttribute("aria-expanded",String(this.toolbarVisible)),this.fab.addEventListener("click",()=>this.toggle()),this.toolbar=document.createElement("div"),this.toolbar.className=`sp-toolbar sp-toolbar--${s}${this.toolbarVisible?" sp-toolbar--visible":""}`,this.toolbar.setAttribute("role","toolbar");for(let l of this.items){let d=document.createElement("button");d.className="sp-toolbar-item",d.appendChild(i(l.icon)),d.setAttribute("aria-label",""),d.dataset.itemId=l.id,d.tabIndex=this.toolbarVisible?0:-1,d.addEventListener("click",f=>{f.stopPropagation(),this.handleItemClick(l.id);});let h=document.createElement("span");h.className="sp-toolbar-label";let p=document.createElement("span");p.className="sp-toolbar-label-text";let m=document.createElement("span");m.className="sp-toolbar-label-key",m.setAttribute("aria-hidden","true"),h.appendChild(p),h.appendChild(m),d.appendChild(h),this.toolbar.appendChild(d);}this.root=document.createElement("div"),this.root.appendChild(this.toolbar),this.root.appendChild(this.fab),t.appendChild(this.root),this.applyLabels(),this.setTargetingActive(false),this.setAnnotateActive(false),this.onGlobalKeydown=l=>{if(!l.altKey||!l.shiftKey||l.ctrlKey||l.metaKey)return;let d=Object.entries(In).find(([,m])=>m===l.code);if(!d||!this.toolbar.querySelector(`[data-item-id="${d[0]}"]`))return;let p=this.shadowRootRef.activeElement??document.activeElement;p instanceof HTMLElement&&(p.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(p.tagName))||(l.preventDefault(),l.stopPropagation(),this.handleItemClick(d[0]));},document.addEventListener("keydown",this.onGlobalKeydown);let c=l=>{l.key==="Escape"&&this.toolbarVisible&&(l.stopPropagation(),this.hide());};this.fab.addEventListener("keydown",c),this.toolbar.addEventListener("keydown",c),this.toolbar.addEventListener("keydown",l=>{let d=Array.from(this.toolbar.querySelectorAll(".sp-toolbar-item"));if(d.length===0||!this.toolbarVisible)return;let h=t.activeElement??document.activeElement,p=d.indexOf(h);switch(l.key){case "ArrowLeft":{l.preventDefault();let m=p<=0?d.length-1:p-1;d[m]?.focus();break}case "ArrowRight":{l.preventDefault();let m=p>=d.length-1?0:p+1;d[m]?.focus();break}case "Home":{l.preventDefault(),d[0]?.focus();break}case "End":{l.preventDefault(),d[d.length-1]?.focus();break}}}),requestAnimationFrame(()=>this.updateContrast()),this.onWindowChange=()=>{this.contrastDebounce&&clearTimeout(this.contrastDebounce),this.contrastDebounce=setTimeout(()=>this.updateContrast(),ii);},window.addEventListener("scroll",this.onWindowChange,{passive:true}),window.addEventListener("resize",this.onWindowChange),this.scheduleShine();}bus;t;root;fab;toolbar;badgeEl=null;toolbarVisible;annotationsVisible=true;targetingActive=false;unsubTargetingStart;unsubTargetingEnd;unsubAnnotationStart;unsubAnnotationEnd;panelOpen=false;unsubPanelOpen;unsubPanelClose;items;host;shadowRootRef;onGlobalKeydown;contrastDebounce=null;onWindowChange;shineTimer=null;frozen=null;activeShine=null;updateContrast(){let t=this.fab.getBoundingClientRect();if(t.width===0&&t.height===0)return;let e=fa(t.left+t.width/2,t.top+t.height/2,this.host);e!==null&&(this.root.classList.toggle("sp-fab-root--on-light",e),this.root.classList.toggle("sp-fab-root--on-dark",!e));}scheduleShine(){if(this.shineTimer&&clearTimeout(this.shineTimer),!this.toolbarVisible||this.panelOpen)return;let t=si,e=t[Math.floor(Math.random()*t.length)];this.shineTimer=setTimeout(()=>{this.playShine(),this.scheduleShine();},e);}stopShineSchedule(){this.shineTimer&&(clearTimeout(this.shineTimer),this.shineTimer=null),this.activeShine?.remove(),this.activeShine=null;}playShine(){requestAnimationFrame(()=>{if(!this.toolbarVisible||this.panelOpen)return;let t=this.toolbar.getBoundingClientRect(),e=this.fab.getBoundingClientRect();if(t.width===0||e.width===0)return;let o=Math.min(t.left,e.left),i=Math.max(t.right,e.right),s=Math.min(t.top,e.top),r=Math.max(t.bottom,e.bottom);this.activeShine?.remove();let a=document.createElement("div");a.className="sp-toolbar-shine",a.style.cssText=`left:${o}px; top:${s}px; width:${i-o}px; height:${r-s}px;`,a.setAttribute("aria-hidden","true"),a.addEventListener("animationend",()=>{a.remove(),this.activeShine===a&&(this.activeShine=null);},{once:true}),this.root.appendChild(a),this.activeShine=a;});}get buttonElement(){return this.fab}refreshLabels(){this.applyLabels();}applyLabels(){this.fab.setAttribute("aria-label",this.t(this.toolbarVisible?"fab.hideTools":"fab.showTools"));let t=this.toolbar.querySelectorAll(".sp-toolbar-item");for(let e of t){let o=e.dataset.itemId;if(!o)continue;let i=this.items.find(l=>l.id===o)?.labelKey??ri[o];if(!i)continue;let s=this.t(i);e.setAttribute("aria-label",s);let r=In[o];e.setAttribute("aria-keyshortcuts",`Alt+Shift+${r.replace(/^Key/,"")}`);let a=e.querySelector(".sp-toolbar-label-text");a&&k(a,s);let c=e.querySelector(".sp-toolbar-label-key");c&&k(c,li(r));}}updateBadge(t){if(t<=0){this.badgeEl?.remove(),this.badgeEl=null;return}this.badgeEl||(this.badgeEl=document.createElement("span"),this.badgeEl.className="sp-fab-badge",this.badgeEl.setAttribute("role","status"),this.badgeEl.setAttribute("aria-live","polite"),this.fab.appendChild(this.badgeEl));let e=t>99?"99+":String(t);k(this.badgeEl,e),this.badgeEl.setAttribute("aria-label",A(this.t,"fab.badge",{count:t}));}toggle(){this.toolbarVisible?this.hide():this.show();}show(){this.toolbarVisible=true,Hn(false),this.setFabIcon(G),this.fab.setAttribute("aria-expanded","true"),this.fab.setAttribute("aria-label",this.t("fab.hideTools")),this.toolbar.classList.add("sp-toolbar--visible");let t=this.toolbar.querySelectorAll(".sp-toolbar-item");for(let e of t)e.tabIndex=0;this.scheduleShine();}hide(){this.toolbarVisible=false,Hn(true),this.setFabIcon(D),this.fab.setAttribute("aria-expanded","false"),this.fab.setAttribute("aria-label",this.t("fab.showTools")),this.toolbar.classList.remove("sp-toolbar--visible");let t=this.toolbar.querySelectorAll(".sp-toolbar-item");for(let e of t)e.tabIndex=-1;this.fab.focus(),this.stopShineSchedule();}setFabIcon(t){let e=this.badgeEl;this.fab.replaceChildren(i(t)),e&&this.fab.appendChild(e);}toggleFreeze(){this.frozen?(this.frozen.release(),this.frozen=null):this.frozen=Pn();let t=this.frozen!==null,e=this.toolbar.querySelector('[data-item-id="freeze"]');if(e){e.classList.toggle("sp-toolbar-item--active",t),e.setAttribute("aria-pressed",String(t));let o=e.querySelector("svg");o&&o.replaceWith(i(t?Y:X));let i$1=e.querySelector(".sp-toolbar-label-text");i$1&&k(i$1,this.t(t?"fab.unfreeze":"fab.freeze")),e.setAttribute("aria-label",this.t(t?"fab.unfreeze":"fab.freeze"));}}handleItemClick(t){switch(t){case "chat":this.bus.emit("panel:toggle",true);break;case "freeze":this.toggleFreeze();break;case "move-side":this.bus.emit("position:toggle");break;case "annotate":{let e=this.bus.on("annotation:end",()=>{e(),this.fab.focus();});this.bus.emit("annotation:start");break}case "toggle-annotations":{this.annotationsVisible=!this.annotationsVisible,this.bus.emit("annotations:toggle",this.annotationsVisible);let o=this.toolbar.querySelector('[data-item-id="toggle-annotations"]')?.querySelector("svg");if(o){let i$1=i(this.annotationsVisible?E:F);o.replaceWith(i$1);}break}case "target-picker":this.bus.emit(this.targetingActive?"targeting:end":"targeting:start");break}}setTargetingActive(t){this.targetingActive=t;let e=this.toolbar.querySelector('[data-item-id="target-picker"]');e?.setAttribute("aria-pressed",String(t)),e?.classList.toggle("sp-toolbar-item--active",t);}setAnnotateActive(t){let e=this.toolbar.querySelector('[data-item-id="annotate"]');e?.setAttribute("aria-pressed",String(t)),e?.classList.toggle("sp-toolbar-item--active",t);}destroy(){this.frozen?.release(),this.frozen=null,window.removeEventListener("scroll",this.onWindowChange),window.removeEventListener("resize",this.onWindowChange),this.contrastDebounce&&clearTimeout(this.contrastDebounce),this.stopShineSchedule(),this.unsubTargetingStart(),this.unsubTargetingEnd(),this.unsubAnnotationStart(),this.unsubAnnotationEnd(),this.unsubPanelOpen(),this.unsubPanelClose(),document.removeEventListener("keydown",this.onGlobalKeydown),this.root.remove();}};var de="instafix_identity",It=null;function di(n$1){if(!n(n$1,"name")||!n(n$1,"email"))return  false;let{name:t,email:e}=n$1;return typeof t=="string"&&typeof e=="string"&&t.length>0&&e.length>0}function On(n){try{let t=n().getItem(de);if(!t)return null;let e=JSON.parse(t);return di(e)?e:null}catch{return null}}function pe(){if(It)return It;let n=On(()=>localStorage)??On(()=>sessionStorage);return n&&(It=n),n}function _n(n){It=n;let t=JSON.stringify(n);try{localStorage.setItem(de,t);}catch{}try{sessionStorage.setItem(de,t);}catch{}}function Kn(n){return {cssSelector:n.cssSelector,xpath:n.xpath,textSnippet:n.textSnippet,elementTag:n.elementTag,elementId:n.elementId??void 0,textPrefix:n.textPrefix,textSuffix:n.textSuffix,fingerprint:n.fingerprint,neighborText:n.neighborText,anchorKey:n.anchorKey??null}}function fe(n){return {xPct:n.xPct,yPct:n.yPct,wPct:n.wPct,hPct:n.hPct}}function he(n,t$1){if(t(n).kind==="area"){let o=new DOMRect(n.scrollX+n.xPct*n.viewportW-window.scrollX,n.scrollY+n.yPct*n.viewportH-window.scrollY,n.wPct*n.viewportW,n.hPct*n.viewportH);return {element:document.body,rect:o,confidence:1,strategy:"css"}}return na(Kn(n),fe(n),t$1)}var Dn=13;function ue(n){return {top:n.top+window.scrollY-Dn,left:n.right+window.scrollX-Dn}}function ct(n,t){let e=n.entries[t],o=n.elementIndices[t];if(!(!e||o===void 0))return e.elements[o]}var $n=300,Nn=200,pi=3e3,hi=.7,ui=28,zn=32,Ht=class{constructor(t,e,o,i,s=null){this.colors=t;this.tooltip=e;this.bus=o;this.t=i;this.liveRegion=s;this.container=j("div",{style:`position:absolute;top:0;left:0;pointer-events:none;z-index:${2147483646};`}),this.container.id="instafix-markers",document.body.appendChild(this.container),this.bus.on("annotations:toggle",r=>{this.container.style.display=r?"block":"none";}),this.resizeHandler=()=>this.scheduleReposition("resize"),window.addEventListener("resize",this.resizeHandler,{passive:true}),this.scrollHandler=()=>this.scheduleReposition("scroll"),window.addEventListener("scroll",this.scrollHandler,{passive:true,capture:true}),this.mutationObserver=new MutationObserver(r=>{let a=false;for(let c of r)if(!(this.container.contains(c.target)||this.tooltip.contains(c.target))){a=true;break}a&&this.scheduleReposition("mutation");}),this.mutationObserver.observe(document.body,{childList:true,subtree:true,attributes:false,characterData:false}),this.onDocumentClickForClusters=r=>{this.container.contains(r.target)||this.collapseAllClusters();},document.addEventListener("click",this.onDocumentClickForClusters);}colors;tooltip;bus;t;liveRegion;container;entries=[];highlightElements=[];pinnedFeedback=null;onDocumentClick=null;repositionTimer=null;mutationObserver=null;scrollHandler=null;resizeHandler=null;anchorCache=new Map;pendingLayoutChange=false;pendingResize=false;hiddenRecheckAt=new Map;clusters=[];onDocumentClickForClusters=null;lastOpenCount=-1;tooltipSuppressedUntil=0;get count(){return this.entries.length}get openCount(){let t=0;for(let e of this.entries)q(e.feedback.status)||t++;return t}scheduleReposition(t="mutation"){t!=="scroll"&&(this.pendingLayoutChange=true),t==="resize"&&(this.pendingResize=true),!this.repositionTimer&&("requestIdleCallback"in window?this.repositionTimer=window.requestIdleCallback(()=>{this.repositionTimer=null,this.repositionAll();},{timeout:Nn+100}):this.repositionTimer=+setTimeout(()=>{this.repositionTimer=null,this.repositionAll();},Nn));}repositionAll(){let t$1=this.pendingLayoutChange,e=this.pendingResize;this.pendingLayoutChange=false,this.pendingResize=false,e&&this.hiddenRecheckAt.clear();let o=Date.now(),i={remaining:2,starved:false},s=new Set;for(let r of this.entries)for(let a=0;a<r.feedback.annotations.length;a++){let c=r.elements[a];if(!c)continue;let l=r.feedback.annotations[a];if(!l)continue;let d=`${r.feedback.id}:${a}`;if(s.add(d),t(l).kind==="area"){let k=he(l);if(!k)continue;let b=ue(k.rect);r.baseTop=b.top,r.baseLeft=b.left,c.style.display="flex",this.applyConfidenceStyle(c,k.confidence,r.feedback);continue}let h$1,m=this.anchorCache.get(d)?.deref(),f=(this.hiddenRecheckAt.get(d)??0)>o,y=m?.isConnected&&(f||!(t$1&&h(m)==="hidden"));if(m&&y){let k=m.getBoundingClientRect(),b=fe(l);h$1={element:m,rect:new DOMRect(k.left+b.xPct*k.width,k.top+b.yPct*k.height,b.wPct*k.width,b.hPct*k.height),confidence:1,strategy:"css"};}else f?h$1=null:(i.starved=false,h$1=na(Kn(l),fe(l),{scanBudget:i}),i.starved||(h$1?.element&&this.anchorCache.set(d,new WeakRef(h$1.element)),!h$1||h(h$1.element)==="hidden"?this.hiddenRecheckAt.set(d,o+pi):this.hiddenRecheckAt.delete(d)));if(!h$1){c.style.display="none";continue}let E=ue(h$1.rect);r.baseTop=E.top,r.baseLeft=E.left,c.style.display="flex",this.applyConfidenceStyle(c,h$1.confidence,r.feedback);}for(let r of this.anchorCache.keys())s.has(r)||this.anchorCache.delete(r);for(let r of this.hiddenRecheckAt.keys())s.has(r)||this.hiddenRecheckAt.delete(r);this.applyClusterPositions(),this.pinnedFeedback&&this.showHighlight(this.pinnedFeedback);}applyClusterPositions(){for(let t of this.clusters)t.expanded?this.applyFanPositions(t):this.applyStackPositions(t);}emitMarkersChanged(){let t=this.openCount;t!==this.lastOpenCount&&(this.lastOpenCount=t,this.bus.emit("markers:changed",t));}render(t){this.clear(),t.forEach((e,o)=>{let i=this.buildEntry(e,o+1);this.entries.push(i);}),this.buildClusters(),this.liveRegion&&this.entries.length>0&&(this.liveRegion.textContent=A(this.t,"marker.count",{count:this.entries.length})),this.emitMarkersChanged();}addFeedback(t,e){let o=this.buildEntry(t,e);for(let i of o.elements)i.style.animation="sp-marker-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both";this.entries.push(o),this.buildClusters(),this.emitMarkersChanged();}buildEntry(t,e){let o={feedback:t,elements:[],baseTop:0,baseLeft:0};for(let i of t.annotations){let s=he(i);if(!s)continue;let r=ue(s.rect);o.baseTop=r.top,o.baseLeft=r.left;let a=this.createMarker(e,t,r);this.applyConfidenceStyle(a,s.confidence,t),this.container.appendChild(a),o.elements.push(a);}return o}buildClusters(){for(let o of this.container.querySelectorAll(".sp-cluster-badge"))o.remove();let t=[];for(let o of this.entries)for(let i=0;i<o.elements.length;i++)t.push({entry:o,elIdx:i});let e=new Set;this.clusters=[];for(let o=0;o<t.length;o++){if(e.has(o))continue;let i=t[o];if(!i)continue;let s={entries:[i.entry],elementIndices:[i.elIdx],expanded:false};e.add(o);for(let r=o+1;r<t.length;r++){if(e.has(r))continue;let a=i.entry,c=t[r];if(!c)continue;let l=c.entry;Math.sqrt((a.baseLeft-l.baseLeft)**2+(a.baseTop-l.baseTop)**2)<ui&&(s.entries.push(l),s.elementIndices.push(c.elIdx),e.add(r));}this.clusters.push(s);}for(let o of this.clusters)o.entries.length<=1||(this.applyStackPositions(o),this.addClusterBadge(o));}applyStackPositions(t){let e=t.entries[0];if(!e)return;let{baseTop:o,baseLeft:i}=e,s=t.entries.length<=1;for(let r=0;r<t.entries.length;r++){let a=ct(t,r);a&&(a.style.top=`${o+(s?0:r*3)}px`,a.style.left=`${i+(s?0:r*3)}px`,a.style.zIndex=String(r+1));}}applyFanPositions(t){let e=t.entries[0];if(!e)return;let{baseTop:o,baseLeft:i}=e,s=t.entries.length,r=(s-1)*zn,a=i-r/2;for(let c=0;c<s;c++){let l=ct(t,c);l&&(l.style.top=`${o}px`,l.style.left=`${a+c*zn}px`,l.style.zIndex=String(10+c));}}addClusterBadge(t){let e=ct(t,t.entries.length-1);if(!e)return;let o=j("div",{class:"sp-cluster-badge",style:`
        position:absolute;top:-6px;right:-6px;
        min-width:16px;height:16px;padding:0 4px;
        border-radius:9999px;
        background:#ffffff;color:${this.colors.accentInk};
        font-size:10px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        border:1.5px solid ${this.colors.selection};
        pointer-events:none;
        font-family:${a};
        line-height:1;
      `});k(o,String(t.entries.length)),e.appendChild(o);}setBadgesVisible(t,e){for(let o=0;o<t.entries.length;o++){let i=ct(t,o)?.querySelector(".sp-cluster-badge");i&&(i.style.display=e?"flex":"none");}}findCluster(t){for(let e of this.clusters)if(!(e.entries.length<=1)){for(let o=0;o<e.entries.length;o++)if(ct(e,o)===t)return e}return null}handleClusterClick(t,e){let o=this.findCluster(t);return o?o.expanded?false:(e.stopPropagation(),this.collapseAllClusters(),o.expanded=true,this.applyFanPositions(o),this.setBadgesVisible(o,false),this.tooltipSuppressedUntil=Date.now()+600,this.tooltip.hide(),true):false}collapseCluster(t){t.expanded&&(t.expanded=false,this.applyStackPositions(t),this.setBadgesVisible(t,true));}collapseAllClusters(){for(let t of this.clusters)this.collapseCluster(t);}applyConfidenceStyle(t,e,o){let i=q(o.status);e<hi&&!i?(t.style.borderStyle="dashed",t.style.opacity="0.7",t.title=A(this.t,"marker.approximate",{confidence:Math.round(e*100)})):(t.style.borderStyle="solid",t.style.opacity="1",t.title="");}createMarker(t,e,o){let i=this.colors.accentFill,s=q(e.status),r=j("div",{style:`
        position:absolute;
        top:${o.top}px;
        left:${o.left}px;
        width:26px;height:26px;
        border-radius:50%;
        background:${s?"rgba(241,245,249,0.9)":i};
        border:2px solid ${s?"#cbd5e1":"#ffffff"};
        display:flex;align-items:center;justify-content:center;
        font-family:${a};
        font-size:11px;font-weight:700;
        color:${s?"#94a3b8":this.colors.accentForeground};
        cursor:pointer;pointer-events:auto;
        box-shadow:${s?"0 2px 8px rgba(0,0,0,0.06)":`0 2px 12px ${i}40, 0 2px 6px rgba(0,0,0,0.15)`};
        transition:top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s ease, box-shadow 0.15s ease;
        user-select:none;
        -webkit-font-smoothing:antialiased;
      `});r.dataset.feedbackId=e.id,r.setAttribute("tabindex","0"),r.setAttribute("role","button");let a$1=e.message.length>60?`${e.message.slice(0,60)}...`:e.message,c=A(this.t,"marker.aria",{number:t,type:B(e.type,this.t),message:a$1});r.setAttribute("aria-label",c),r.setAttribute("aria-describedby",this.tooltip.tooltipId),k(r,s?"\u2713":String(t)),r.addEventListener("mouseenter",()=>{r.style.transform="scale(1.2)",r.style.boxShadow=s?"0 4px 16px rgba(0,0,0,0.1)":`0 4px 20px ${i}59, 0 4px 12px rgba(0,0,0,0.15)`,Date.now()>=this.tooltipSuppressedUntil&&this.tooltip.show(e,r.getBoundingClientRect()),this.previewHighlight(e);}),r.addEventListener("mouseleave",()=>{r.style.transform="scale(1)",r.style.boxShadow=s?"0 2px 8px rgba(0,0,0,0.06)":`0 2px 12px ${i}40, 0 2px 6px rgba(0,0,0,0.15)`,this.tooltip.scheduleHide(),this.previewHighlight(null);}),r.addEventListener("focus",()=>{Date.now()>=this.tooltipSuppressedUntil&&this.tooltip.show(e,r.getBoundingClientRect()),this.previewHighlight(e);}),r.addEventListener("blur",()=>{this.tooltip.scheduleHide(),this.previewHighlight(null);});let l=d=>{d instanceof MouseEvent&&this.handleClusterClick(r,d)||(this.pinHighlight(e),this.bus.emit("panel:toggle",true),r.dispatchEvent(new CustomEvent("sp-marker-click",{detail:{feedbackId:e.id},bubbles:true})));};return r.addEventListener("click",d=>l(d)),r.addEventListener("keydown",d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),l(d));}),r}focusFeedback(t){let e=this.entries.find(i=>i.feedback.id===t);if(!e)return  false;let o=e.elements[0];return o&&o.scrollIntoView({behavior:"smooth",block:"center"}),this.pinHighlight(e.feedback),this.highlight(t),true}highlight(t){for(let e of this.entries)if(e.feedback.id===t)for(let o of e.elements)o.style.animation="sp-pulse-ring 0.7s ease-out",o.addEventListener("animationend",()=>{o.style.animation="";},{once:true});}showHighlight(t){this.removeHighlightElements();for(let e of t.annotations){let o=he(e);if(!o)continue;let i=o.rect,s=j("div",{style:`
          position:absolute;
          top:${i.top+window.scrollY}px;
          left:${i.left+window.scrollX}px;
          width:${i.width}px;height:${i.height}px;
          border:2px solid ${this.colors.selection};
          background:${this.colors.selection}14;
          border-radius:8px;
          pointer-events:none;z-index:-1;
          opacity:0;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.85),
            inset 0 0 0 1px rgba(255,255,255,0.85),
            0 0 16px ${this.colors.selectionGlow};
          transition:opacity ${$n}ms ease;
        `});this.container.appendChild(s),this.highlightElements.push(s),s.offsetHeight,s.style.opacity="1";}}previewHighlight(t){this.pinnedFeedback||(t?this.showHighlight(t):this.clearHighlight());}pinHighlight(t){this.unpinHighlight(),this.showHighlight(t),this.pinnedFeedback=t,this.onDocumentClick=e=>{this.container.contains(e.target)||this.unpinHighlight();},document.addEventListener("click",this.onDocumentClick,{capture:true});}unpinHighlight(){this.onDocumentClick&&(document.removeEventListener("click",this.onDocumentClick,{capture:true}),this.onDocumentClick=null),this.pinnedFeedback=null,this.clearHighlight();}clearHighlight(){for(let t of this.highlightElements)t.style.opacity="0",setTimeout(()=>t.remove(),$n);this.highlightElements=[];}removeHighlightElements(){for(let t of this.highlightElements)t.remove();this.highlightElements=[];}clear(){this.unpinHighlight(),this.container.replaceChildren(),this.entries=[],this.clusters=[],this.anchorCache.clear();}destroy(){this.unpinHighlight(),this.repositionTimer&&("cancelIdleCallback"in window&&window.cancelIdleCallback(this.repositionTimer),clearTimeout(this.repositionTimer)),this.resizeHandler&&window.removeEventListener("resize",this.resizeHandler),this.scrollHandler&&window.removeEventListener("scroll",this.scrollHandler,{capture:true}),this.onDocumentClickForClusters&&document.removeEventListener("click",this.onDocumentClickForClusters),this.mutationObserver?.disconnect(),this.container.remove();}};var Xn="instafix_onboarding_seen";function jn(){try{return localStorage.getItem(Xn)==="1"}catch{return  true}}function fi(){try{localStorage.setItem(Xn,"1");}catch{}}var Ot=[{titleKey:"onboarding.step1Title",bodyKey:"onboarding.step1Body"},{titleKey:"onboarding.step2Title",bodyKey:"onboarding.step2Body"},{titleKey:"onboarding.step3Title",bodyKey:"onboarding.step3Body"}],Wn=`
  .sp-onboarding {
    position: fixed;
    z-index: ${2147483647};
    width: 260px;
    padding: 16px 18px 14px;
    border-radius: 16px;
    background: var(--sp-glass-bg-heavy);
    backdrop-filter: blur(var(--sp-blur-heavy));
    -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
    border: 1px solid var(--sp-glass-border);
    box-shadow: var(--sp-shadow-xl);
    font-family: var(--sp-font);
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sp-onboarding--visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .sp-onboarding-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sp-onboarding-close:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-onboarding-close svg {
    width: 12px;
    height: 12px;
  }

  .sp-onboarding-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--sp-text);
    margin: 0 20px 6px 0;
  }

  .sp-onboarding-body {
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--sp-text-secondary);
    margin-bottom: 14px;
  }

  .sp-onboarding-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .sp-onboarding-progress {
    font-size: 11px;
    color: var(--sp-text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .sp-onboarding-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sp-onboarding-skip {
    border: none;
    background: transparent;
    color: var(--sp-text-tertiary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
  }

  .sp-onboarding-skip:hover {
    background: var(--sp-bg-hover);
    color: var(--sp-text);
  }

  .sp-onboarding-next {
    border: none;
    background: var(--sp-accent-fill, var(--sp-accent));
    color: var(--sp-accent-fg, #fff);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 8px;
  }

  .sp-onboarding-next:hover {
    filter: brightness(1.05);
  }

  @media (prefers-reduced-motion: reduce) {
    .sp-onboarding {
      transition-duration: 0.01ms !important;
    }
  }

  @media (forced-colors: active) {
    .sp-onboarding {
      border: 2px solid ButtonText !important;
      background: Canvas !important;
      color: CanvasText !important;
    }
    .sp-onboarding-title,
    .sp-onboarding-body,
    .sp-onboarding-progress {
      color: CanvasText !important;
    }
    .sp-onboarding-next {
      border: 1px solid ButtonText !important;
      background: ButtonFace !important;
      color: ButtonText !important;
    }
    .sp-onboarding-skip,
    .sp-onboarding-close {
      border: 1px solid ButtonText !important;
    }
  }
`,_t=class{constructor(t,e,o,i$1){this.t=e;this.anchor=o;this.alignRight=i$1;this.element=j("div",{class:"sp-onboarding"}),this.element.setAttribute("role","dialog"),this.element.setAttribute("aria-label",this.t("onboarding.step1Title")),this.closeBtn=document.createElement("button"),this.closeBtn.type="button",this.closeBtn.className="sp-onboarding-close",this.closeBtn.setAttribute("aria-label",this.t("onboarding.skip")),this.closeBtn.appendChild(i(G)),this.closeBtn.addEventListener("click",()=>this.finish()),this.element.appendChild(this.closeBtn),this.titleEl=j("div",{class:"sp-onboarding-title"}),this.bodyEl=j("div",{class:"sp-onboarding-body"}),this.element.appendChild(this.titleEl),this.element.appendChild(this.bodyEl);let s=j("div",{class:"sp-onboarding-footer"});this.progressEl=j("span",{class:"sp-onboarding-progress"}),s.appendChild(this.progressEl);let r=j("div",{class:"sp-onboarding-actions"});this.skipBtn=document.createElement("button"),this.skipBtn.type="button",this.skipBtn.className="sp-onboarding-skip",k(this.skipBtn,this.t("onboarding.skip")),this.skipBtn.addEventListener("click",()=>this.finish()),this.nextBtn=document.createElement("button"),this.nextBtn.type="button",this.nextBtn.className="sp-onboarding-next",this.nextBtn.addEventListener("click",()=>this.advance()),r.appendChild(this.skipBtn),r.appendChild(this.nextBtn),s.appendChild(r),this.element.appendChild(s),t.appendChild(this.element),this.onKeydown=a=>this.handleKeydown(a),document.addEventListener("keydown",this.onKeydown,true),this.renderStep(),this.position(),requestAnimationFrame(()=>{this.element.classList.add("sp-onboarding--visible"),this.nextBtn.focus();});}t;anchor;alignRight;element;titleEl;bodyEl;progressEl;nextBtn;skipBtn;closeBtn;onKeydown;stepIndex=0;finished=false;renderStep(){let t=Ot[this.stepIndex];if(!t)return;k(this.titleEl,this.t(t.titleKey)),k(this.bodyEl,this.t(t.bodyKey)),k(this.progressEl,A(this.t,"onboarding.progress",{current:this.stepIndex+1,total:Ot.length}));let e=this.stepIndex===Ot.length-1;k(this.nextBtn,this.t(e?"onboarding.done":"onboarding.next"));}advance(){if(this.stepIndex>=Ot.length-1){this.finish();return}this.stepIndex+=1,this.renderStep(),this.position();}handleKeydown(t){if(this.finished)return;if(t.key==="Escape"){t.stopPropagation(),this.finish();return}if(t.key!=="Tab")return;let o=this.element.getRootNode().activeElement;if(!o||!this.element.contains(o))return;let i=[this.closeBtn,this.skipBtn,this.nextBtn],s=i[0],r=i[i.length-1];!s||!r||(t.shiftKey&&o===s?(t.preventDefault(),r.focus()):!t.shiftKey&&o===r&&(t.preventDefault(),s.focus()));}position(){let t=this.anchor.getBoundingClientRect(),e=this.element.getBoundingClientRect(),o=14,i=t.top-e.height-o;i<8&&(i=t.bottom+o);let s;this.alignRight?s=t.right-e.width:s=t.left,s=Math.max(8,Math.min(s,window.innerWidth-e.width-8)),this.element.style.top=`${i}px`,this.element.style.left=`${s}px`;}finish(){this.finished||(this.finished=true,fi(),document.removeEventListener("keydown",this.onKeydown,true),this.element.remove(),this.anchor.focus());}destroy(){this.finished||(this.finished=true,document.removeEventListener("keydown",this.onKeydown,true),this.element.remove());}};var Dt=class{constructor(t,e){this.store=t;this.projectName=e;}store;projectName;async sendFeedback(t){let e=await this.store.createFeedback({projectName:t.projectName,type:t.type,message:t.message,status:"open",url:t.url,urlPattern:t.urlPattern??null,viewport:t.viewport,userAgent:t.userAgent,authorName:t.authorName,authorEmail:t.authorEmail,clientId:t.clientId,annotations:t.annotations.map(s),screenshotDataUrl:t.screenshotDataUrl??null,screenshotRegion:t.screenshotRegion??null,diagnostics:t.diagnostics??null});return dt(e)}async getFeedbacks(t,e){let{feedbacks:o,total:i}=await this.store.getFeedbacks({projectName:t,page:e?.page,limit:e?.limit,type:e?.type,status:e?.status,statuses:e?.statuses,search:e?.search,url:e?.url,urlPattern:e?.urlPattern});return {feedbacks:o.map(dt),total:i}}async resolveFeedback(t,e){let o=await this.store.updateFeedback(t,r(e?"resolved":"open"));return dt(o)}async updateFeedbackMessage(t,e,o){let i=await this.store.updateFeedback(t,r(e,new Date,o));return dt(i)}async updateFeedbackAnnotations(t,e,o){let i=await this.store.updateFeedback(t,r(e,new Date,void 0,o.map(s)));return dt(i)}async deleteFeedback(t){await this.store.deleteFeedback(t);}async deleteAllFeedbacks(t){await this.store.deleteAllFeedbacks(t);}};function dt(n){return {id:n.id,projectName:n.projectName,type:n.type,message:n.message,status:n.status,url:n.url,urlPattern:n.urlPattern??null,viewport:n.viewport,userAgent:n.userAgent,authorName:n.authorName,authorEmail:n.authorEmail,resolvedAt:n.resolvedAt?.toISOString()??null,createdAt:n.createdAt.toISOString(),updatedAt:n.updatedAt.toISOString(),annotations:n.annotations.map(mi),screenshotUrl:n.screenshotUrl??null,screenshotRegion:n.screenshotRegion??null,diagnostics:n.diagnostics??null}}function mi(n){return {id:n.id,feedbackId:n.feedbackId,cssSelector:n.cssSelector,xpath:n.xpath,textSnippet:n.textSnippet,elementTag:n.elementTag,elementId:n.elementId,textPrefix:n.textPrefix,textSuffix:n.textSuffix,fingerprint:n.fingerprint,neighborText:n.neighborText,anchorKey:n.anchorKey??null,xPct:n.xPct,yPct:n.yPct,wPct:n.wPct,hPct:n.hPct,scrollX:n.scrollX,scrollY:n.scrollY,viewportW:n.viewportW,viewportH:n.viewportH,devicePixelRatio:n.devicePixelRatio,createdAt:n.createdAt.toISOString(),target:n.target??null,inspect:n.inspect??null}}var gi="linear(0, 0.006, 0.025, 0.06, 0.11, 0.17, 0.25, 0.34, 0.45, 0.56, 0.67, 0.78, 0.88, 0.95, 1.01, 1.04, 1.05, 1.04, 1.02, 1, 0.99, 1)",me="cubic-bezier(0.16, 1, 0.3, 1)",qn="cubic-bezier(0.34, 1.56, 0.64, 1)",bi="cubic-bezier(0.25, 1, 0.5, 1)",Un=`
  /* ---- Keyframes ---- */

  @keyframes sp-fab-in {
    from {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes sp-fab-glow {
    0%, 100% { box-shadow: 0 4px 20px var(--sp-accent-glow), 0 2px 8px rgba(0, 0, 0, 0.08); }
    50% { box-shadow: 0 4px 28px var(--sp-accent-glow), 0 2px 12px rgba(0, 0, 0, 0.1); }
  }

  @keyframes sp-marker-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes sp-pulse-ring {
    0% {
      box-shadow: 0 0 0 0 var(--sp-accent-glow);
    }
    70% {
      box-shadow: 0 0 0 8px transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  @keyframes sp-flash-bg {
    0% { background-color: var(--sp-accent-light); }
    100% { background-color: transparent; }
  }

  @keyframes sp-slide-up {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes sp-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes sp-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* ---- Animation classes ---- */

  .sp-anim-fab-in {
    animation: sp-fab-in 0.5s ${gi} both;
  }

  .sp-anim-marker-in {
    animation: sp-marker-in 0.35s ${qn} both;
  }

  .sp-anim-pulse {
    animation: sp-pulse-ring 0.7s ease-out;
  }

  .sp-anim-flash {
    animation: sp-flash-bg 0.5s ${bi};
  }

  .sp-anim-slide-up {
    animation: sp-slide-up 0.3s ${me} both;
  }

  .sp-anim-fade-in {
    animation: sp-fade-in 0.2s ease-out both;
  }

  /* ---- Transition utilities ---- */

  .sp-panel {
    transform: translateX(110%);
    transition: transform 0.4s ${me};
  }

  .sp-panel.sp-panel--open {
    transform: translateX(0);
  }

  /* ---- Card stagger animation ---- */

  @keyframes sp-card-in {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .sp-card {
    animation: sp-card-in 0.35s ${me} both;
    animation-delay: calc(var(--sp-card-i, 0) * 40ms);
  }

  /* ---- Loading spinner ---- */

  @keyframes sp-spin {
    to { transform: rotate(360deg); }
  }

  .sp-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--sp-border);
    border-top-color: var(--sp-accent);
    border-radius: 50%;
    animation: sp-spin 0.6s linear infinite;
  }

  /* ---- Badge bounce ---- */

  @keyframes sp-badge-in {
    0% { transform: scale(0); }
    60% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .sp-fab-badge {
    animation: sp-badge-in 0.4s ${qn} both;
  }

  /* ---- Reduced motion ---- */

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

`;function ge(n){return `
    :host {
      all: initial;
      position: fixed;
      z-index: ${2147483647};
      font-family: var(--sp-font);
      font-size: 14px;
      line-height: 1.5;
      color: var(--sp-text);
      /* Match native sub-controls (autofill, scrollbars, etc.) to the resolved theme */
      color-scheme: ${n.bg==="#ffffff"?"light":"dark"};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      ${ma(n)}

      /* Identity modal \u2014 theme-aware backdrop + panel */
      --sp-identity-bg: ${n.glassBgHeavy};
      --sp-identity-overlay: ${n.bg==="#ffffff"?"rgba(15, 23, 42, 0.2)":"rgba(0, 0, 0, 0.4)"};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ============================
       Focus visible (accessibility)
       ============================ */

    :focus-visible {
      outline: 2px solid var(--sp-accent);
      outline-offset: 2px;
      /* Double-ring against any background colour: the bg-coloured halo
         separates the accent ring from busy host-page surfaces. */
      box-shadow: 0 0 0 4px var(--sp-bg);
    }

    /* ============================
       FAB (Floating Action Button)
       ============================ */

    /* Wears the auto-detected selection color (host-distinct, see
       dom/selection-color.ts) once launcher.ts sets the --sp-selection-*
       inline properties on the host \u2014 until then (or with detection off)
       the fallbacks keep it on the configured accent. The point: the FAB
       and its toolbar must never look like the HOST app's own primary
       buttons. */
    .sp-fab {
      position: fixed;
      width: 52px;
      height: 52px;
      border-radius: var(--sp-radius-full);
      background: var(--sp-accent-fill-gradient, var(--sp-accent-gradient));
      color: var(--sp-accent-fg, #fff);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 4px 20px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 2px 8px rgba(0, 0, 0, 0.08);
      transition:
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;
      outline: none;
    }

    .sp-fab:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .sp-fab:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow:
        0 8px 28px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sp-fab:active {
      transform: translateY(0) scale(0.95);
      transition-duration: 0.1s;
    }

    .sp-fab--bottom-right {
      bottom: 24px;
      right: 24px;
    }

    .sp-fab--bottom-left {
      bottom: 24px;
      left: 24px;
    }

    .sp-fab svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ---- FAB Badge ---- */

    .sp-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: var(--sp-radius-full);
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      pointer-events: none;
      font-family: var(--sp-font);
      line-height: 1;
    }

    /* ============================
       Action Toolbar (next to the FAB)
       ============================ */

    /* Persistent horizontal row, not a menu \u2014 visible by default (the FAB
       only toggles it), positioned right next to the FAB so it reads as one
       unit. Width/height auto-size to content; only the anchored edge
       (right for bottom-right, left for bottom-left) is fixed, so the row
       grows away from the FAB as items are added. */
    .sp-toolbar {
      position: fixed;
      bottom: 24px;
      /* Same height as the FAB (52px at bottom:24px) so the row's items
         center against the FAB's center instead of sitting bottom-aligned \u2014
         which is what let the chips look low once they shrank. */
      height: 52px;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(6px);
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sp-toolbar--visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* 24px FAB offset + 52px FAB width + 12px gap */
    .sp-toolbar--bottom-right {
      right: 88px;
    }

    .sp-toolbar--bottom-left {
      left: 88px;
    }

    /* Filled with the same (auto-detected, host-distinct) color as the FAB \u2014
       not the neutral glass other surfaces use, and never the raw accent
       when detection has produced a selection color \u2014 so the row reads as
       one unit: "the FAB, and the buttons that belong to it", visibly NOT
       part of the host app's own palette. */
    .sp-toolbar-item {
      position: relative;
      flex-shrink: 0;
      /* 80% of the original 44px \u2014 the row reads as a companion to the FAB
         rather than a second set of primary buttons. */
      width: 35px;
      height: 35px;
      border-radius: var(--sp-radius-full);
      /* The FILL is what adapts, not the icon color: --sp-accent-fill is the
         layer tone darkened until white clears AA on it, so these chips are
         always white-on-color \u2014 the convention for a floating toolbar, and
         legible on every tone the detector can land on. */
      background: var(--sp-accent-fill, var(--sp-selection, var(--sp-accent)));
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: var(--sp-accent-fg, #fff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--sp-shadow-md), 0 2px 10px var(--sp-selection-glow, var(--sp-accent-glow));
      font-size: 12px;
      font-weight: 600;
      transition: filter 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    }

    .sp-toolbar-item:hover,
    .sp-toolbar-item:focus-visible {
      filter: brightness(1.08);
      box-shadow:
        var(--sp-shadow-md),
        0 0 0 3px var(--sp-selection-light, var(--sp-accent-light));
      outline: none;
    }

    .sp-toolbar-item svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      stroke: currentColor;
      fill: none;
    }

    /* Persistent "mode is on" state for the auto-target picker button \u2014
       distinct from :hover/:focus-visible, which only apply while the
       pointer/keyboard focus is actually on the button itself. INVERTED
       relative to the row's filled idle chips (white fill, colored icon,
       colored ring): a fill-swap or brightness tweak between two shades of
       the same color was not readable at a glance, and inversion stays
       readable even when selection === accent (detection off, or nothing
       chromatic on the host page to contrast against). */
    .sp-toolbar-item--active {
      background: #ffffff;
      /* Inverted chip \u2014 the tone is now the FOREGROUND on white, so it needs
         the contrast-adjusted ink, not the raw tone (raw amber on white is
         1.9:1). Ring included: it is this chip's only state cue. */
      border-color: var(--sp-accent-ink, var(--sp-selection, var(--sp-accent)));
      color: var(--sp-accent-ink, var(--sp-selection, var(--sp-accent)));
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.12),
        0 0 0 3px var(--sp-selection-glow, var(--sp-accent-glow));
    }

    /* ---- Auto-contrast against the host page's background (G8) ----
       Fab.updateContrast() samples the actual rendered background behind
       the FAB/toolbar and toggles one of these on the shared root wrapper.
       Unlike before, the toolbar items keep their accent fill on any host
       background (same branding logic as the FAB, which never swaps its own
       background either) \u2014 contrast is assisted with a light ring, exactly
       like the FAB's own on-light/on-dark rule below. */

    .sp-fab-root--on-light .sp-toolbar-item,
    .sp-fab-root--on-dark .sp-toolbar-item {
      box-shadow:
        var(--sp-shadow-md),
        0 2px 10px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 0 0 3px rgba(255, 255, 255, 0.9);
    }

    /* Active chip is white \u2014 a white contrast ring would vanish against it,
       so the on-light/on-dark assist ring stays the selection color here. */
    .sp-fab-root--on-light .sp-toolbar-item--active,
    .sp-fab-root--on-dark .sp-toolbar-item--active {
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.12),
        0 0 0 3px var(--sp-selection-glow, var(--sp-accent-glow));
    }

    /* A thin light ring around the FAB itself separates its (already
       saturated, generally-visible) accent color from either a very light
       or very dark page background sitting right up against it. */
    .sp-fab-root--on-light .sp-fab,
    .sp-fab-root--on-dark .sp-fab {
      box-shadow:
        0 4px 20px var(--sp-selection-glow, var(--sp-accent-glow)),
        0 0 0 3px rgba(255, 255, 255, 0.9),
        0 2px 10px rgba(0, 0, 0, 0.3);
    }

    /* ---- Discovery shine \u2014 a diagonal light sweep across the FAB + toolbar
       (G8) ---- a persistent-but-easy-to-miss toolbar needs some way to say
       "look here" the first time it appears. Plays once, right-to-left
       (matching the FAB \u2192 eye \u2192 target \u2192 pencil \u2192 list reading order), sized and
       positioned in JS to exactly span whatever's currently rendered
       (Fab.playShine()) rather than a fixed guess at the toolbar's width. */
    .sp-toolbar-shine {
      position: fixed;
      pointer-events: none;
      overflow: hidden;
      z-index: ${2147483647};
      border-radius: 9999px;
    }

    /* White/light-gray sweep \u2014 the buttons underneath wear the detected
       selection color, which can itself land in the yellow family; a yellow
       band over yellow buttons is invisible, while a white one reads on any
       detected hue. */
    .sp-toolbar-shine::before {
      content: "";
      position: absolute;
      top: -60%;
      left: 100%;
      width: 48px;
      height: 220%;
      background: linear-gradient(
        100deg,
        transparent,
        rgba(241, 245, 249, 0.75) 45%,
        rgba(255, 255, 255, 0.95) 50%,
        rgba(241, 245, 249, 0.75) 55%,
        transparent
      );
      transform: rotate(18deg);
      animation: sp-toolbar-shine-sweep 1.3s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes sp-toolbar-shine-sweep {
      from {
        left: 100%;
      }
      to {
        left: -80px;
      }
    }

    /* Hover/focus tooltip \u2014 appears above the item, matching a horizontal
       toolbar (the old vertical radial menu showed labels to the side). */
    .sp-toolbar-label {
      position: absolute;
      bottom: 52px;
      left: 50%;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 500;
      color: var(--sp-text);
      pointer-events: none;
      opacity: 0;
      padding: 4px 12px;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--sp-glass-border);
      box-shadow: var(--sp-shadow-sm);
      transform: translateX(-50%) translateY(4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    /* The item's global shortcut, at the tooltip's right end \u2014 a small kbd
       chip, visually secondary to the name. */
    .sp-toolbar-label-key {
      font-size: 10px;
      font-weight: 600;
      color: var(--sp-text-tertiary);
      border: 1px solid var(--sp-border);
      border-radius: 4px;
      padding: 1px 5px;
      line-height: 1.4;
    }

    .sp-toolbar-item:hover .sp-toolbar-label,
    .sp-toolbar-item:focus-visible .sp-toolbar-label {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ============================
       Panel (Side drawer)
       ============================ */

    /* Layer surface: tinted with the detected layer hue and edged with a
       layer-toned border, so the panel never dissolves into a host page of
       the same background color \u2014 the surface itself says "overlaid app". */
    .sp-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: var(--sp-layer-bg, var(--sp-glass-bg));
      backdrop-filter: blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
      border-left: 2px solid var(--sp-layer-border, var(--sp-glass-border));
      box-shadow: var(--sp-shadow-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 480px) {
      .sp-panel {
        width: 100vw;
        border-left: none;
      }
    }

    .sp-panel-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur));
      -webkit-backdrop-filter: blur(var(--sp-blur));
      position: relative;
      z-index: 2;
    }

    /* Title + a small fixed icon-button group only \u2014 never the unbounded
       action row below, so the close button can never be crowded out. */
    .sp-panel-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .sp-panel-header-icons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sp-panel-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Build version, next to the title \u2014 quiet enough to ignore, present
       enough to answer "which version is this?" at a glance. */
    .sp-panel-version {
      flex-shrink: 0;
      margin-right: auto;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--sp-text-tertiary);
      background: var(--sp-bg-hover);
      border-radius: var(--sp-radius-full);
      padding: 2px 7px;
      font-variant-numeric: tabular-nums;
    }

    .sp-panel-close {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: var(--sp-radius);
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sp-text-tertiary);
      transition: all 0.2s ease;
    }

    .sp-panel-close:hover {
      background: var(--sp-bg-hover);
      color: var(--sp-text);
    }

    .sp-panel-close svg {
      width: 16px;
      height: 16px;
    }

    /* ============================
       Filters & Search
       ============================ */

    .sp-filters {
      padding: 10px 16px;
      border-bottom: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur));
      -webkit-backdrop-filter: blur(var(--sp-blur));
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .sp-search-wrap {
      position: relative;
    }

    /* Select-all + search share one row directly above the cards. */
    .sp-list-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }

    .sp-list-toolbar .sp-search-wrap {
      flex: 1;
      min-width: 0;
    }

    /* Filled instead of outlined \u2014 the soft background says "input" without
       adding yet another border line to a stack of them; focus brings the
       accent outline back. */
    .sp-search {
      width: 100%;
      height: 32px;
      padding: 0 12px 0 34px;
      border-radius: var(--sp-radius);
      border: 1px solid transparent;
      background: var(--sp-bg-hover);
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }

    .sp-search::placeholder {
      color: var(--sp-text-tertiary);
    }

    .sp-search:focus {
      border-color: var(--sp-accent);
      box-shadow: 0 0 0 3px var(--sp-accent-light);
      background: var(--sp-bg);
    }

    .sp-search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--sp-text-tertiary);
      width: 16px;
      height: 16px;
      transition: color 0.2s ease;
    }

    .sp-search:focus ~ .sp-search-icon,
    .sp-search-wrap:focus-within .sp-search-icon {
      color: var(--sp-accent);
    }

    /* ============================
       Filter bar (type dropdown + status segmented)
       ============================ */

    .sp-filter-bar {
      display: flex;
      align-items: center;
      gap: 4px 6px;
      margin-bottom: 0;
      flex-wrap: wrap;
    }

    /* ============================
       Type filter dropdown
       ============================ */

    .sp-filter-dropdown {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
    }

    .sp-filter-dropdown-btn {
      --sp-chip-color: var(--sp-text-secondary);
      --sp-chip-bg: var(--sp-glass-bg-heavy);

      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      height: 28px;
      padding: 0 8px 0 10px;
      border-radius: var(--sp-radius-full);
      /* Ghost chip \u2014 border only appears with state (hover/open/filtered). */
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }

    .sp-filter-dropdown-btn:hover {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
    }

    .sp-filter-dropdown-btn[aria-expanded="true"] {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sp-chip-color) 14%, transparent);
    }

    .sp-filter-dropdown-btn--filtered {
      border-color: var(--sp-chip-color);
      background: var(--sp-chip-bg);
    }

    .sp-filter-dropdown-btn__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-btn__icon svg {
      width: 14px;
      height: 14px;
    }

    .sp-filter-dropdown-btn__label {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .sp-filter-dropdown-btn__prefix {
      color: var(--sp-text-tertiary);
      font-weight: 500;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .sp-filter-dropdown-btn__value {
      color: var(--sp-chip-color);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sp-filter-dropdown-btn__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--sp-text-tertiary);
      transition: transform 0.18s ease, color 0.18s ease;
    }

    .sp-filter-dropdown-btn__chevron svg {
      width: 12px;
      height: 12px;
    }

    .sp-filter-dropdown-btn[aria-expanded="true"] .sp-filter-dropdown-btn__chevron {
      transform: rotate(180deg);
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      min-width: 180px;
      padding: 4px;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      backdrop-filter: blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter: blur(var(--sp-blur-heavy));
      border: 1px solid var(--sp-glass-border);
      box-shadow: var(--sp-shadow-md);
      z-index: 10;
      animation: sp-filter-menu-in 0.15s ease-out both;
    }

    @keyframes sp-filter-menu-in {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sp-filter-dropdown-option {
      --sp-chip-color: var(--sp-text-secondary);
      --sp-chip-bg: transparent;

      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.12s ease, color 0.12s ease;
    }

    .sp-filter-dropdown-option__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      border-radius: 6px;
      background: var(--sp-chip-bg);
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-option__icon svg {
      width: 13px;
      height: 13px;
    }

    .sp-filter-dropdown-option__label {
      flex: 1;
      min-width: 0;
    }

    .sp-filter-dropdown-option__check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
    }

    .sp-filter-dropdown-option__check svg {
      width: 13px;
      height: 13px;
    }

    .sp-filter-dropdown-option:hover {
      background: var(--sp-bg-hover);
    }

    .sp-filter-dropdown-option--active {
      color: var(--sp-chip-color);
      font-weight: 600;
    }

    .sp-filter-dropdown-option--active:hover {
      background: var(--sp-chip-bg);
    }

    /* ============================
       Status segmented control
       ============================ */

    /* Borderless group \u2014 the active chip's tinted fill + inset ring carries
       the selection; the enclosing outline added a line without meaning. */
    .sp-segmented {
      display: inline-flex;
      align-items: stretch;
      padding: 0;
      gap: 2px;
      border-radius: var(--sp-radius-full);
      border: none;
      background: transparent;
      flex-shrink: 0;
    }

    .sp-segmented__btn {
      --sp-chip-color: var(--sp-text-tertiary);
      --sp-chip-bg: transparent;

      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 24px;
      padding: 0 8px;
      border: none;
      border-radius: var(--sp-radius-full);
      background: transparent;
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    }

    .sp-segmented__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      color: var(--sp-chip-color);
      transition: color 0.18s ease, transform 0.18s ease;
    }

    .sp-segmented__icon svg {
      width: 13px;
      height: 13px;
    }

    .sp-segmented__btn:hover {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn:hover .sp-segmented__icon {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn--active {
      background: var(--sp-chip-bg);
      color: var(--sp-chip-color);
      font-weight: 600;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--sp-chip-color) 35%, transparent),
        0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .sp-segmented__btn--active .sp-segmented__icon {
      color: var(--sp-chip-color);
    }

    .sp-segmented__btn--open.sp-segmented__btn--active .sp-segmented__icon {
      animation: sp-segmented-pulse 2.4s ease-in-out infinite;
    }

    @keyframes sp-segmented-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.85); }
    }

    @media (prefers-reduced-motion: reduce) {
      .sp-filter-dropdown-btn,
      .sp-filter-dropdown-btn__chevron,
      .sp-filter-dropdown-option,
      .sp-segmented__btn,
      .sp-segmented__icon {
        transition: none;
      }
      .sp-filter-dropdown-menu {
        animation: none;
      }
      .sp-segmented__btn--open.sp-segmented__btn--active .sp-segmented__icon {
        animation: none;
      }
    }

    /* ============================
       Feedback Cards
       ============================ */

    .sp-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 10px;
    }

    .sp-list::-webkit-scrollbar {
      width: 6px;
    }

    .sp-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .sp-list::-webkit-scrollbar-thumb {
      background: var(--sp-border);
      border-radius: var(--sp-radius-full);
    }

    .sp-list::-webkit-scrollbar-thumb:hover {
      background: var(--sp-text-tertiary);
    }

    /* Card separation comes from background + shadow + the left status bar
       \u2014 no resting border, so the list isn't a grid of outlines. */
    .sp-card {
      display: flex;
      padding: 9px 12px;
      margin-bottom: 5px;
      cursor: pointer;
      border-radius: var(--sp-radius);
      background: var(--sp-glass-bg-heavy);
      border: 1px solid transparent;
      box-shadow: var(--sp-shadow-xs);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sp-card:hover {
      background: var(--sp-bg);
      border-color: var(--sp-border);
      box-shadow: var(--sp-shadow-md);
      transform: translateY(-2px);
    }

    .sp-card:active {
      transform: translateY(0) scale(0.99);
      transition-duration: 0.1s;
    }

    /* The list's current selection \u2014 set by clicking a card or the card's
       on-page numbered marker. Selection-colored (host-distinct) ring, the
       same visual language as the on-page outline it corresponds to. */
    .sp-card--selected {
      background: var(--sp-bg);
      border-color: var(--sp-selection, var(--sp-accent));
      box-shadow:
        0 0 0 2px var(--sp-selection-light, var(--sp-accent-light)),
        var(--sp-shadow-sm);
    }

    .sp-card-bar {
      width: 3px;
      border-radius: var(--sp-radius-full);
      margin-right: 10px;
      flex-shrink: 0;
    }

    .sp-card-body {
      flex: 1;
      min-width: 0;
    }

    .sp-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }

    .sp-card-number {
      font-size: 12px;
      font-weight: 700;
      color: var(--sp-text-tertiary);
      font-variant-numeric: tabular-nums;
    }

    .sp-badge {
      padding: 2px 10px;
      border-radius: var(--sp-radius-full);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* "\uC774\uBBF8 \uC5D0\uC774\uC804\uD2B8\uC5D0 \uC804\uB2EC\uB428" \uBC30\uC9C0 \u2014 \uB808\uC774\uC5B4 \uD1A4, \uCE74\uB4DC \uD5E4\uB354\uC758 \uB0A0\uC9DC \uC67C\uCABD. */
    .sp-card-handed {
      font-size: 10px;
      font-weight: 600;
      color: var(--sp-selection, var(--sp-accent));
      background: var(--sp-selection-light, var(--sp-accent-light));
      border-radius: 5px;
      padding: 1px 6px;
      white-space: nowrap;
      margin-left: auto;
    }
    .sp-card-handed + .sp-card-date { margin-left: 8px; }

    .sp-card-date {
      font-size: 11px;
      color: var(--sp-text-tertiary);
      margin-left: auto;
    }

    .sp-card-message {
      font-size: 12.5px;
      line-height: 1.45;
      color: var(--sp-text);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sp-card-message--expanded {
      -webkit-line-clamp: unset;
    }

    .sp-card-expand {
      font-size: 12px;
      font-weight: 500;
      color: var(--sp-accent);
      cursor: pointer;
      background: none;
      border: none;
      padding: 4px 0;
      font-family: var(--sp-font);
      transition: opacity 0.15s ease;
    }

    .sp-card-expand:hover {
      opacity: 0.8;
    }

    .sp-card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      margin-top: 6px;
    }

    /* On pointer devices the footer floats over the card's top-right corner
       and only materializes on hover/focus/selection \u2014 cards stay two lines
       tall (that's what lets the list show twice the items) and hovering
       never shifts the layout. Touch devices (no hover) keep the inline,
       always-visible footer. */
    @media (hover: hover) and (pointer: fine) {
      .sp-card {
        position: relative;
      }

      .sp-card-footer {
        display: none;
        position: absolute;
        top: 5px;
        right: 8px;
        margin-top: 0;
        padding: 2px 4px;
        border-radius: var(--sp-radius-full);
        background: var(--sp-bg);
        box-shadow: var(--sp-shadow-sm);
        z-index: 1;
      }

      .sp-card:hover .sp-card-footer,
      .sp-card:focus-within .sp-card-footer,
      .sp-card--selected .sp-card-footer {
        display: flex;
      }
    }

    .sp-btn-resolve,
    .sp-btn-delete,
    .sp-btn-handoff {
      padding: 4px 10px;
      border-radius: var(--sp-radius-full);
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .sp-btn-resolve svg,
    .sp-btn-delete svg {
      width: 14px;
      height: 14px;
    }

    .sp-btn-resolve:hover {
      border-color: #22c55e;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.06);
    }

    .sp-btn-delete:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }

    /* Handoff sits apart on the left \u2014 send-to-agent is a different kind of
       act than the resolve/delete pair, and the gap keeps a mis-click from
       landing on delete. */
    .sp-btn-handoff {
      margin-right: auto;
    }

    .sp-btn-handoff:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    .sp-btn-resolve:disabled,
    .sp-btn-delete:disabled,
    .sp-btn-handoff:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .sp-spinner--sm {
      width: 14px;
      height: 14px;
    }

    /* ---- Delete All (header) ---- */

    /* Secondary actions row \u2014 free to wrap onto multiple lines as more
       buttons are added; never shares a row with the close button. */
    .sp-panel-header-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .sp-btn-delete-all {
      padding: 5px 12px;
      border-radius: var(--sp-radius-full);
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
    }

    .sp-btn-delete-all svg {
      width: 13px;
      height: 13px;
    }

    .sp-btn-delete-all:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }

    .sp-btn-delete-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Sized to match .sp-panel-close exactly (36x36, 16px icon) \u2014 they now
       sit side by side in the header-top icon group, so a mismatched size
       would read as a mistake rather than a second icon button. Ghost until
       hover, then picks up the widget's accent instead of a danger or
       brand-specific color (this is a plain navigation action, not export or
       a destructive one). */
    .sp-btn-open-dashboard {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: var(--sp-radius);
      border: 1px solid transparent;
      background: transparent;
      color: var(--sp-text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .sp-btn-open-dashboard svg {
      width: 16px;
      height: 16px;
    }

    .sp-btn-open-dashboard:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    /* ---- Confirm Dialog ---- */

    .sp-confirm-backdrop {
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

    .sp-confirm-dialog {
      width: 340px;
      padding: 28px;
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

    .sp-confirm-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .sp-confirm-message {
      font-size: 14px;
      color: var(--sp-text-secondary);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .sp-confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .sp-btn-danger {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: none;
      background: #ef4444;
      color: #fff;
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    }

    .sp-btn-danger:hover {
      background: #dc2626;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }

    .sp-btn-danger:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 0.1s;
    }

    .sp-card--resolved {
      opacity: 0.5;
    }

    .sp-card--resolved .sp-card-message {
      text-decoration: line-through;
      text-decoration-color: var(--sp-text-tertiary);
    }

    /* ============================
       Loading State
       ============================ */

    .sp-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }

    /* ============================
       Identity Form
       ============================ */

    .sp-identity-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--sp-text);
      letter-spacing: -0.02em;
    }

    .sp-input {
      width: 100%;
      height: 42px;
      padding: 0 14px;
      border-radius: var(--sp-radius);
      border: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      color: var(--sp-text);
      font-family: var(--sp-font);
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }

    .sp-input::placeholder {
      color: var(--sp-text-tertiary);
    }

    .sp-input:focus {
      border-color: var(--sp-accent);
      box-shadow: 0 0 0 3px var(--sp-accent-light);
      background: var(--sp-bg);
    }

    .sp-input-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--sp-text-secondary);
      margin-bottom: 6px;
      display: block;
    }

    /* ============================
       Buttons
       ============================ */

    .sp-btn-primary {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: none;
      background: var(--sp-accent-fill-gradient, var(--sp-accent-gradient));
      color: var(--sp-accent-fg, #fff);
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px var(--sp-accent-glow);
    }

    .sp-btn-primary:hover {
      box-shadow: 0 4px 16px var(--sp-accent-glow);
      transform: translateY(-1px);
    }

    .sp-btn-primary:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 0.1s;
    }

    .sp-btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .sp-btn-ghost {
      height: 40px;
      padding: 0 22px;
      border-radius: var(--sp-radius);
      border: 1px solid var(--sp-border);
      background: var(--sp-glass-bg-heavy);
      color: var(--sp-text-secondary);
      font-family: var(--sp-font);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sp-btn-ghost:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent);
      background: var(--sp-accent-light);
    }

    /* ============================
       Empty State
       ============================ */

    .sp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 24px;
      color: var(--sp-text-tertiary);
      text-align: center;
      gap: 8px;
      animation: sp-fade-in 0.3s ease-out both;
    }

    .sp-empty-text {
      font-size: 14px;
      font-weight: 500;
    }

    /* ============================
       Load More
       ============================ */

    .sp-load-more-wrap {
      display: flex;
      justify-content: center;
      padding: 12px 0 4px;
    }

    .sp-btn-load-more {
      width: 100%;
    }

    /* ---- Delete UNDO toast (single-card deletes, 5s grace) ---- */
    .sp-undo-toast {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--sp-radius);
      background: var(--sp-text);
      color: var(--sp-bg);
      font-size: 13px;
      box-shadow: var(--sp-shadow-lg);
      z-index: 5;
    }

    /* Transient notice variant (e.g. handoff failure) \u2014 same body as the
       undo toast, centered text, no action, removes itself. */
    .sp-notice-toast {
      justify-content: center;
      text-align: center;
      animation: sp-notice-toast-in 0.2s ease;
    }

    @keyframes sp-notice-toast-in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sp-undo-toast-btn {
      border: none;
      background: none;
      color: var(--sp-selection, var(--sp-accent));
      font-family: var(--sp-font);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 4px;
      letter-spacing: 0.01em;
    }

    /* ============================
       Forced Colors / High Contrast
       ============================ */

    @media (forced-colors: active) {
      .sp-fab,
      .sp-toolbar-item,
      .sp-filter-dropdown-btn,
      .sp-segmented,
      .sp-segmented__btn,
      .sp-card,
      .sp-panel-close,
      .sp-search,
      .sp-btn-resolve,
      .sp-btn-delete,
      .sp-btn-delete-all,
      .sp-btn-open-dashboard,
      .sp-btn-primary,
      .sp-btn-ghost,
      .sp-btn-danger,
      .sp-card-expand,
      .sp-input,
      .sp-confirm-dialog {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
        color: ButtonText !important;
      }

      .sp-segmented__btn--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-toolbar-item--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-filter-dropdown-menu {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
      }

      .sp-filter-dropdown-option--active {
        background: Highlight !important;
        color: HighlightText !important;
      }

      .sp-fab:focus-visible,
      .sp-toolbar-item:focus-visible,
      .sp-filter-dropdown-btn:focus-visible,
      .sp-segmented__btn:focus-visible,
      .sp-filter-dropdown-option:focus-visible,
      .sp-panel-close:focus-visible,
      .sp-btn-resolve:focus-visible,
      .sp-btn-delete:focus-visible,
      .sp-btn-delete-all:focus-visible,
      .sp-btn-open-dashboard:focus-visible,
      .sp-btn-primary:focus-visible,
      .sp-btn-ghost:focus-visible,
      .sp-btn-danger:focus-visible,
      .sp-card-expand:focus-visible,
      .sp-input:focus-visible,
      .sp-search:focus-visible {
        outline: 3px solid Highlight !important;
      }

      .sp-panel {
        border: 2px solid ButtonText !important;
      }

      .sp-fab-badge {
        border: 2px solid ButtonText !important;
        background: Canvas !important;
        color: ButtonText !important;
      }

      .sp-card-bar {
        background: ButtonText !important;
      }
    }

    ${Un}
    ${Ca}
    ${Ba}
    ${ta}
    ${ra}
    ${Ja}
    ${va}
    ${Fa}
    ${aa}
    ${Wn}
  `}var yi=120,vi=80,$t=class{constructor(t,e="en"){this.colors=t;this.locale=e;this.root=j("div",{style:`
        position: fixed;
        z-index: ${2147483647};
        max-width: 280px;
        padding: 12px 14px;
        border-radius: 14px;
        background: ${this.colors.layerBgHeavy};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid ${this.colors.layerBorder};
        box-shadow: 0 8px 32px ${this.colors.shadow}, 0 2px 8px ${this.colors.shadow};
        font-family: ${a};
        pointer-events: auto;
        opacity: 0;
        transform: translateY(6px) scale(0.97);
        transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        visibility: hidden;
        -webkit-font-smoothing: antialiased;
      `}),this.root.setAttribute("role","tooltip"),this.root.id=this.tooltipId,this.arrow=j("div",{style:`
        position: absolute;
        width: 12px;
        height: 12px;
        background: ${this.colors.layerBgHeavy};
        border: 1px solid ${this.colors.layerBorder};
        transform: rotate(45deg);
        pointer-events: none;
      `}),this.root.appendChild(this.arrow),this.root.addEventListener("mouseenter",()=>this.cancelHide()),this.root.addEventListener("mouseleave",()=>this.scheduleHide()),document.body.appendChild(this.root);}colors;locale;root;arrow;showTimer=null;hideTimer=null;currentFeedbackId=null;tooltipId="sp-tooltip";show(t,e){this.currentFeedbackId!==t.id&&(this.cancelHide(),this.cancelShow(),this.showTimer=setTimeout(()=>{this.currentFeedbackId=t.id,this.render(t),this.position(e);let o=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;this.root.style.transition=o?"none":"",this.root.style.visibility="visible",this.root.style.opacity="1",this.root.style.transform="translateY(0) scale(1)";},yi));}scheduleHide(){this.cancelHide(),this.hideTimer=setTimeout(()=>this.hide(),vi);}hide(){this.cancelShow(),this.currentFeedbackId=null,this.root.style.opacity="0",this.root.style.transform="translateY(6px) scale(0.97)",setTimeout(()=>{this.currentFeedbackId||(this.root.style.visibility="hidden");},200);}cancelShow(){this.showTimer&&(clearTimeout(this.showTimer),this.showTimer=null);}cancelHide(){this.hideTimer&&(clearTimeout(this.hideTimer),this.hideTimer=null);}render(t){let e=Array.from(this.root.children);for(let h of e)h!==this.arrow&&h.remove();let o=ia(t.type,this.colors),i=la(t.type,this.colors),s=z(this.locale),r=B(t.type,s),a=j("div",{style:"display:flex;align-items:center;gap:8px;margin-bottom:8px;"}),c=j("span",{style:`
        padding:3px 10px;border-radius:9999px;
        font-size:11px;font-weight:600;
        color:${o};background:${i};
        letter-spacing:0.02em;
      `});k(c,r);let l=j("span",{style:`font-size:11px;color:${this.colors.textSecondary};margin-left:auto;`});k(l,m(t.createdAt,this.locale)),a.appendChild(c),a.appendChild(l);let d=j("div",{style:`font-size:13px;line-height:1.55;color:${this.colors.text};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;`});k(d,t.message),this.root.insertBefore(a,this.arrow),this.root.insertBefore(d,this.arrow);}position(t){let e=this.root.getBoundingClientRect(),o=10,i=t.top-e.height-o,s=t.left+t.width/2-e.width/2,r=true;i<8&&(i=t.bottom+o,r=false),s=Math.max(8,Math.min(s,window.innerWidth-e.width-8)),this.root.style.top=`${i}px`,this.root.style.left=`${s}px`;let a=Math.max(16,Math.min(t.left+t.width/2-s-6,e.width-22));r?this.arrow.style.cssText=`
        position:absolute;
        width:12px;height:12px;
        background:${this.colors.glassBgHeavy};
        border-right:1px solid ${this.colors.glassBorder};
        border-bottom:1px solid ${this.colors.glassBorder};
        transform:rotate(45deg);
        pointer-events:none;
        bottom:-6px;
        left:${a}px;
      `:this.arrow.style.cssText=`
        position:absolute;
        width:12px;height:12px;
        background:${this.colors.glassBgHeavy};
        border-left:1px solid ${this.colors.glassBorder};
        border-top:1px solid ${this.colors.glassBorder};
        transform:rotate(45deg);
        pointer-events:none;
        top:-6px;
        left:${a}px;
      `;}contains(t){return this.root.contains(t)}destroy(){this.cancelShow(),this.cancelHide(),this.root.remove();}};var zt=null;function wi(n){return n===void 0||n===false?{console:false,network:false,maxConsoleEntries:50,maxNetworkEntries:20}:n===true?{console:true,network:true,maxConsoleEntries:50,maxNetworkEntries:20}:{console:n.console!==false,network:n.network!==false,maxConsoleEntries:typeof n.maxConsoleEntries=="number"?n.maxConsoleEntries:50,maxNetworkEntries:typeof n.maxNetworkEntries=="number"?n.maxNetworkEntries:20}}function Vn(n){let t=()=>{};return {destroy:t,open:t,close:t,refresh:t,focusFeedback:()=>false,on:()=>t,off:t,updateConfig:e=>{be({...n,...e});}}}function Ei(){let n=()=>{};return {destroy:n,open:n,close:n,refresh:n,focusFeedback:()=>false,on:()=>n,off:n,getUiState:()=>({open:false,settingsExpanded:false}),expandSettings:n}}function Yn(){try{return process.env.NODE_ENV}catch{return}}function Si(n){return n===void 0||n===false?{enabled:false,param:"instafix"}:n===true?{enabled:true,param:"instafix"}:{enabled:true,param:n.param??"instafix"}}function be(n){if(typeof window>"u"||typeof document>"u")return n.onSkip?.("ssr"),Vn(n);if(zt)return n.debug,zt.facade;let t=new Map,e={...n,...oa()};function o(a){let c=s.getUiState();s.destroy(),e={...e,...a},s=Gn(e,o)??Ei();for(let[l,d]of t)for(let h of d)s.on(l,h);c.open&&s.open(),c.settingsExpanded&&s.expandSettings();}let i=Gn(e,o);if(!i)return Vn(e);let s=i,r={destroy:()=>{s.destroy(),zt=null;},open:()=>s.open(),close:()=>s.close(),refresh:()=>s.refresh(),focusFeedback:a=>s.focusFeedback(a),on:(a,c)=>{let l=t.get(a);return l||(l=new Set,t.set(a,l)),l.add(c),s.on(a,c),()=>{l?.delete(c),s.off(a,c);}},off:(a,c)=>{t.get(a)?.delete(c),s.off(a,c);},updateConfig:o};return zt={facade:r},r}function Gn(n,t){let e=n.debug?(...u)=>console.debug("[instafix]",...u):()=>{};if(!n.forceShow&&Yn()==="production")return n.onSkip?.("production"),null;let o=typeof n.minViewportWidth=="number"&&Number.isFinite(n.minViewportWidth)?n.minViewportWidth:768;if(!n.forceShow&&window.innerWidth<o){let u="mobile";return n.onSkip?.(u),null}if(!n.store&&(!n.endpoint||typeof n.endpoint!="string"))return console.error("[instafix] Missing 'endpoint' or 'store' in config. Provide an endpoint like '/api/instafix' or a InstaFixStore instance."),null;if(!n.projectName||typeof n.projectName!="string")return console.error("[instafix] Missing or invalid 'projectName' in config. Expected a non-empty string."),null;let i=n.locale??"ko",s=i==="en"||i==="ko"?Promise.resolve():y(i).catch(()=>{}),r=z(i),a=n.scopeAnnotationsByUrl??true,c$1=()=>{try{let u=n.getPageScope?.();if(u)return u}catch(u){e("getPageScope() threw, falling back to pathname:",u);}return {url:window.location.pathname,urlPattern:null}};e("Initializing widget",{projectName:n.projectName,theme:n.theme??"light",locale:i,scopeAnnotationsByUrl:a});let l=wi(n.captureDiagnostics),d=l.console?new Ft(l.maxConsoleEntries):null,h=l.network?new Bt(l.maxNetworkEntries):null,p=ga(n.accentColor,n.theme);qa({accentColor:p.accent,theme:n.theme??"light",locale:i});let m=false;if(n.autoSelectionColor!==false){let u=le();u&&(ha(p,u.hex,n.theme),m=true,qa({accentColor:p.accent}));}let f=new lt,y$1=new lt,E=(()=>{if(n.store)return new Dt(n.store,n.projectName);let u=n.endpoint;if(typeof u!="string"||u.length===0)throw new Error("[instafix] internal invariant: endpoint must be a non-empty string in HTTP mode");return new Mt(u,n.projectName,{apiKey:n.apiKey,headers:n.headers})})();n.onOpen&&f.on("open",n.onOpen),n.onClose&&f.on("close",n.onClose),n.onFeedbackSent&&f.on("feedback:sent",n.onFeedbackSent),n.onError&&f.on("feedback:error",n.onError),n.onAnnotationStart&&f.on("annotation:start",n.onAnnotationStart),n.onAnnotationEnd&&f.on("annotation:end",n.onAnnotationEnd);let k={"feedback:sent":()=>f.on("feedback:sent",u=>y$1.emit("feedback:sent",u)),"feedback:deleted":()=>f.on("feedback:deleted",u=>y$1.emit("feedback:deleted",u)),"feedback:error":()=>f.on("feedback:error",u=>y$1.emit("feedback:error",u)),"panel:open":()=>f.on("open",()=>y$1.emit("panel:open")),"panel:close":()=>f.on("close",()=>y$1.emit("panel:close")),"annotation:start":()=>f.on("annotation:start",()=>y$1.emit("annotation:start")),"annotation:end":()=>f.on("annotation:end",()=>y$1.emit("annotation:end"))};for(let u of Object.values(k))u();f.on("open",()=>e("Panel opened")),f.on("close",()=>e("Panel closed")),f.on("feedback:sent",u=>e("Feedback sent",u.id)),f.on("feedback:error",u=>e("Feedback failed",u.message)),f.on("annotation:start",()=>e("Annotation started")),f.on("annotation:end",()=>e("Annotation ended"));let b=document.createElement("instafix-widget");b.style.cssText=`position:fixed;z-index:${2147483647};`;let B=Yn()==="test"?"open":"closed",A=b.attachShadow({mode:B});if("adoptedStyleSheets"in ShadowRoot.prototype){let u=new CSSStyleSheet;u.replaceSync(ge(p)),A.adoptedStyleSheets=[u];}else {let u=document.createElement("style");u.textContent=ge(p),A.appendChild(u);}if(document.body.appendChild(b),n.avoidOverlays!==false&&!n.position){let u=ae("bottom-right",b);u!=="bottom-right"&&(n={...n,position:u});}n.avoidOverlays!==false&&!n.position&&setTimeout(()=>{if(O)return;let u=ae("bottom-right",b);u!=="bottom-right"&&t({position:u});},1e3);let w=new MutationObserver(()=>{b.nextSibling&&document.body.appendChild(b);});w.observe(document.body,{childList:true}),n.autoSelectionColor!==false&&!m&&requestAnimationFrame(()=>{if(O)return;let u=le(b);u&&(ha(p,u.hex,n.theme),qa({accentColor:p.accent}),b.style.setProperty("--sp-accent",p.accent),b.style.setProperty("--sp-accent-light",p.accentLight),b.style.setProperty("--sp-accent-dark",p.accentDark),b.style.setProperty("--sp-accent-glow",p.accentGlow),b.style.setProperty("--sp-accent-gradient",p.accentGradient),b.style.setProperty("--sp-accent-fill",p.accentFill),b.style.setProperty("--sp-accent-fill-gradient",p.accentFillGradient),b.style.setProperty("--sp-accent-fg",p.accentForeground),b.style.setProperty("--sp-accent-ink",p.accentInk),b.style.setProperty("--sp-selection",p.selection),b.style.setProperty("--sp-selection-light",p.selectionLight),b.style.setProperty("--sp-selection-glow",p.selectionGlow),b.style.setProperty("--sp-selection-gradient",p.accentGradient),b.style.setProperty("--sp-layer-bg",p.layerBg),b.style.setProperty("--sp-layer-bg-heavy",p.layerBgHeavy),b.style.setProperty("--sp-layer-border",p.layerBorder));});let v=c(b),C=document.createElement("div");C.setAttribute("role","status"),C.setAttribute("aria-live","polite"),C.setAttribute("aria-atomic","true"),C.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;",document.body.appendChild(C);let H=new $t(p,i),R=new Ht(p,H,f,r,C),pt=new Pt(A,n,f,r);f.on("markers:changed",u=>pt.updateBadge(u));let ye=null;typeof window<"u"&&!jn()&&setTimeout(()=>{if(O)return;let u=(n.position??"bottom-right")==="bottom-right";ye=new _t(A,r,pt.buttonElement,u);},600);let P=null,Kt=null,O=false,ht=0;async function Xt(){return O?null:P||(Kt||(Kt=import('./panel-I5LDDJ2O.js').then(u=>O?null:(P=new u.Panel(A,p,f,E,n.projectName,R,r,i,{getScope:c$1,scopeAnnotationsByUrl:a},{config:n,onUpdateConfig:t}),P))),Kt)}if(typeof window<"u"){let u=()=>{O||Xt();},T=window.requestIdleCallback;typeof T=="function"?T(u):setTimeout(u,200);}let Y=false,Zn=f.on("panel:toggle",u=>{P||(u?(Y=true,Xt().then(T=>{T&&Y&&T.open(),Y=false;}).catch(T=>e("Failed to lazy-load panel:",T))):Y=false);}),Qn=f.on("position:toggle",()=>{let u=(n.position??"bottom-right")==="bottom-right"?"bottom-left":"bottom-right";pa({position:u}),t({position:u});}),ve=new Rt(p,f,r,n.enableScreenshot??false,()=>v.getLastPageFocus(),n.agentInstructions);i!=="en"&&i!=="ko"&&s.then(()=>{O||(pt.refreshLabels(),ve.refreshLabels());});let jt=false,to=f.on("annotation:complete",async u=>{if(jt){f.emit("submission:cancelled");return}jt=true;try{let{annotations:T,type:M,message:N,screenshotDataUrl:G,screenshotRegion:J}=u,z=n.identity??pe();if(!z){if(z=await ki(A,r),!z){f.emit("submission:cancelled");return}_n(z);}let _=(()=>{try{return crypto.randomUUID()}catch{return `${Date.now()}-${Math.random().toString(36).slice(2)}`}})(),et=c$1(),Ee=null;(d||h)&&(Ee={console:d?.getEntries()??[],network:h?.getEntries()??[]});let oo={projectName:n.projectName,type:M,message:N,url:et.url,urlPattern:et.urlPattern,viewport:`${window.innerWidth}x${window.innerHeight}`,userAgent:navigator.userAgent,authorName:z.name,authorEmail:z.email,annotations:T,clientId:_,screenshotDataUrl:G??null,screenshotRegion:J??null,diagnostics:Ee};try{let q=await E.sendFeedback(oo);f.emit("feedback:sent",q),(!a||q.url===et.url)&&R.addFeedback(q,R.count+1),C.textContent=r("feedback.sent.confirmation"),P&&await P.refresh();}catch(q){f.emit("feedback:error",q instanceof Error?q:new Error(String(q))),C.textContent=r("feedback.error.message");}}finally{jt=false;}}),Wt=c$1(),eo=a?{limit:20,url:Wt.url}:{limit:20},qt=Si(n.deepLink),no=++ht;Promise.all([E.getFeedbacks(n.projectName,eo),s]).then(([{feedbacks:u}])=>{if(O||ht!==no)return;let T=a?u.filter(M=>M.url===Wt.url):u;if(R.render(T),qt.enabled)try{let M=new URLSearchParams(window.location.search).get(qt.param);if(M){let N=R.focusFeedback(M);e(`deepLink ?${qt.param}=${M} ${N?"focused":"did not match a visible feedback"}`);}}catch(M){e("deepLink parsing failed:",M);}}).catch(u=>{e("Failed to load initial markers:",u);}),n.endpoint&&Sn(n.endpoint,n.identity??pe(),{apiKey:n.apiKey,headers:n.headers}).then(()=>e("Retry queue flushed")).catch(()=>{});let xe=()=>{let u=++ht;if(P?.isCurrentlyOpen)return P.refresh();let T=c$1(),M=a?{limit:20,url:T.url}:{limit:20};return E.getFeedbacks(n.projectName,M).then(({feedbacks:N})=>{if(O||u!==ht||P?.isCurrentlyOpen)return;let G=a?N.filter(J=>J.url===T.url):N;R.render(G);})},we=null;if(n.watchNavigation!==false&&typeof window<"u"&&typeof history<"u"){let u=_=>`${_.url}
${_.urlPattern??""}`,T=u(Wt),M=()=>{if(O)return;let _=u(c$1());if(_===T)return;let et=T;T=_,e("SPA navigation detected \u2014 refreshing feedbacks for new scope"),xe().catch(()=>{T===_&&(T=et);});},N=history.pushState,G=history.replaceState,J=function(..._){N.apply(this,_),M();},z=function(..._){G.apply(this,_),M();};history.pushState=J,history.replaceState=z,window.addEventListener("popstate",M),window.addEventListener("hashchange",M),we=()=>{window.removeEventListener("popstate",M),window.removeEventListener("hashchange",M),history.pushState===J&&(history.pushState=N),history.replaceState===z&&(history.replaceState=G);};}return {destroy:()=>{O||(e("Destroying widget"),O=true,Y=false,w.disconnect(),we?.(),v.destroy(),to(),Zn(),Qn(),pt.destroy(),ye?.destroy(),P?.destroy(),ve.destroy(),R.destroy(),H.destroy(),d?.dispose(),h?.dispose(),f.removeAll(),y$1.removeAll(),C.remove(),b.remove());},open:()=>{f.emit("panel:toggle",true);},close:()=>{P?P.close():Y=false;},focusFeedback:u=>R.focusFeedback(u),refresh:()=>{xe().catch(()=>{});},on:(u,T)=>y$1.on(u,T),off:(u,T)=>{y$1.off(u,T);},getUiState:()=>({open:P?.isCurrentlyOpen??false,settingsExpanded:P?.isSettingsExpanded??false}),expandSettings:()=>{Xt().then(u=>u?.expandSettings());}}}function ki(n,t){return new Promise(e=>{let o=n.activeElement??document.activeElement,i=n.host;i.parentNode&&i.parentNode.appendChild(i);let s=document.createElement("div");s.style.cssText=`
      position:fixed;inset:0;
      background:var(--sp-identity-overlay);
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
      z-index:${2147483647};
      opacity:0;transition:opacity 0.25s ease;
    `;let r=document.createElement("div");r.style.cssText=`
      width:340px;padding:28px;border-radius:var(--sp-radius-xl);
      background:var(--sp-identity-bg);
      backdrop-filter:blur(var(--sp-blur-heavy));
      -webkit-backdrop-filter:blur(var(--sp-blur-heavy));
      border:1px solid var(--sp-glass-border);
      box-shadow:0 16px 48px var(--sp-shadow), 0 8px 16px var(--sp-shadow);
      font-family:var(--sp-font, ${a});
      color:var(--sp-text);
      transform:translateY(12px) scale(0.97);
      transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      -webkit-font-smoothing:antialiased;
    `;let a$1=`sp-identity-title-${Date.now()}`;r.setAttribute("role","dialog"),r.setAttribute("aria-modal","true"),r.setAttribute("aria-labelledby",a$1);let c=document.createElement("div");c.className="sp-identity-title",c.id=a$1,c.textContent=t("identity.title"),c.style.marginBottom="20px";let l=`sp-identity-name-${Date.now()}`,d=`sp-identity-email-${Date.now()}`,h=document.createElement("label");h.className="sp-input-label",h.textContent=t("identity.nameLabel"),h.setAttribute("for",l);let p=document.createElement("input");p.className="sp-input",p.id=l,p.type="text",p.placeholder=t("identity.namePlaceholder"),p.style.marginBottom="14px";let m=document.createElement("label");m.className="sp-input-label",m.textContent=t("identity.emailLabel"),m.setAttribute("for",d);let f=document.createElement("input");f.className="sp-input",f.id=d,f.type="email",f.placeholder=t("identity.emailPlaceholder");let y=document.createElement("div");y.style.cssText="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;";let E=L=>{s.removeEventListener("keydown",A),s.style.opacity="0",r.style.transform="translateY(12px) scale(0.97)",setTimeout(()=>{s.remove(),o?.focus(),e(L);},250);},k=document.createElement("button");k.className="sp-btn-ghost",k.textContent=t("identity.cancel"),k.addEventListener("click",()=>E(null));let b=document.createElement("button");b.className="sp-btn-primary",b.textContent=t("identity.submit"),b.addEventListener("click",()=>{let L=p.value.trim(),w=f.value.trim();if(!L||!w)return;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w)){f.style.borderColor="var(--sp-type-bug, #ef4444)";return}E({name:L,email:w});});let B='input, button, [tabindex]:not([tabindex="-1"])',A=L=>{let w=L;if(w.key==="Escape"){E(null);return}if(w.key==="Tab"){let v=Array.from(r.querySelectorAll(B));if(v.length===0)return;let C=v[0],H=v[v.length-1];if(!C||!H)return;let R=n.activeElement;w.shiftKey?(R===C||!r.contains(R))&&(w.preventDefault(),H.focus()):(R===H||!r.contains(R))&&(w.preventDefault(),C.focus());}};s.addEventListener("keydown",A),s.addEventListener("click",L=>{L.target===s&&E(null);}),y.appendChild(k),y.appendChild(b),r.appendChild(c),r.appendChild(h),r.appendChild(p),r.appendChild(m),r.appendChild(f),r.appendChild(y),s.appendChild(r),n.appendChild(s),requestAnimationFrame(()=>{s.style.opacity="1",r.style.transform="translateY(0) scale(1)",p.focus();});})}function Jn(n){return be(n)}function Ir(n){let t=useRef(n);t.current=n;let[e,o]=useState(null);return useEffect(()=>{let i=true,s=Jn({...t.current,onSkip:r=>{i&&t.current.onSkip?.(r);},onOpen:()=>{i&&t.current.onOpen?.();},onClose:()=>{i&&t.current.onClose?.();},onFeedbackSent:r=>{i&&t.current.onFeedbackSent?.(r);},onError:r=>{i&&t.current.onError?.(r);},onAnnotationStart:()=>{i&&t.current.onAnnotationStart?.();},onAnnotationEnd:()=>{i&&t.current.onAnnotationEnd?.();}});if(!i){s.destroy();return}return o(s),()=>{i=false,s.destroy(),o(null);}},[]),e}export{Ir as useInstaFix};//# sourceMappingURL=react.js.map
//# sourceMappingURL=react.js.map