# Changelog

## [0.11.0](https://github.com/gnoopy/instafix/compare/widget-v0.10.16...widget-v0.11.0) (2026-09-05)


### ⚠ BREAKING CHANGES

* @instafix/* now require Node >= 22. Consumers still on Node 20 should stay on the previous release.

### Features

* **cli:** report every [@instafix](https://github.com/instafix) package and its on-disk version after init ([da350fd](https://github.com/gnoopy/instafix/commit/da350fdf73e7e3a1f92a0685caf2ce93b47a5475))
* require Node 22 — better-sqlite3 v13 (N-API) ends the Node 24 abort ([e8bd91b](https://github.com/gnoopy/instafix/commit/e8bd91b78148e9e9765477a8cafd83d02d277f8b))
* **widget:** stop asking who you are before every first submission ([b68419f](https://github.com/gnoopy/instafix/commit/b68419fab280dd454293dc970676a5411fc6e606))

## [0.10.16](https://github.com/gnoopy/instafix/compare/widget-v0.10.15...widget-v0.10.16) (2026-09-04)


### Features

* capture a DOM/CSSOM snapshot of the annotated element ([2e5fd77](https://github.com/gnoopy/instafix/commit/2e5fd77f9c63c80b96df4bfb3494021bf0e3f461))
* stop re-asking who you are — session-held identity, prefilled from your git/GitHub account ([b9934f2](https://github.com/gnoopy/instafix/commit/b9934f2bce9a411afb4e1246ec02716dc8af8528))
* **widget:** Copy Prompt honors the page scope, making a cross-page batch real ([7c00def](https://github.com/gnoopy/instafix/commit/7c00def31e9ca3b536d83f75aed9c6af8f439e1a))
* **widget:** freeze the page to annotate a state that will not hold still ([8b758f0](https://github.com/gnoopy/instafix/commit/8b758f015e04412faf12ba8525250d45973b13e9))


### Tests

* cover the new modules' branches — CI's coverage floor was the release gate ([c681d02](https://github.com/gnoopy/instafix/commit/c681d0209d5bd4989fefb92e03eeed5dfbebb1b9))

## [0.10.15](https://github.com/gnoopy/instafix/compare/widget-v0.10.14...widget-v0.10.15) (2026-09-04)


### Features

* **widget:** move-side toolbar button, and 80% toolbar chips ([ebeb8d3](https://github.com/gnoopy/instafix/commit/ebeb8d301d34f3b115513188992d3107f3b4040d))
* **widget:** show the build version next to the panel title ([91eef0a](https://github.com/gnoopy/instafix/commit/91eef0afc3de4705f87dfa41f77922e69ee5ca09))


### Bug Fixes

* **e2e:** update toolbar assertions — unblocks the release that was failing to publish ([6f04777](https://github.com/gnoopy/instafix/commit/6f0477792192ed25125c984e3ec90b1df1700759))
* **widget:** adapt the accent FILL for white content, and dock the move arrow to its own side ([5ffd628](https://github.com/gnoopy/instafix/commit/5ffd628b85bd4268b85fd72973c7831492fd0aa0))
* **widget:** composer's undo/redo were invisible — disable by icon tone, not by fading the button ([8800c8f](https://github.com/gnoopy/instafix/commit/8800c8fd2aed6a9236635f669f5f938ad6a3eb4f))
* **widget:** derive accent foreground and ink by WCAG contrast, not a fixed white ([6289e46](https://github.com/gnoopy/instafix/commit/6289e46667e6a200efdd69dd3645f0971456b8a4))
* **widget:** ship the area-select crop icon and its "영역 지정" label ([f55144d](https://github.com/gnoopy/instafix/commit/f55144d74dc77d70283510f25dc0d9c973664465))

## [0.10.14](https://github.com/gnoopy/instafix/compare/widget-v0.10.13...widget-v0.10.14) (2026-09-04)


### Bug Fixes

* **widget:** overlay clear/undo/redo as translucent circular buttons on the composer ([c8a9089](https://github.com/gnoopy/instafix/commit/c8a9089be1fca6dfb42360af51b18ecce497802c))

## [0.10.13](https://github.com/gnoopy/instafix/compare/widget-v0.10.12...widget-v0.10.13) (2026-09-04)


### Features

* **widget:** compact type row + wider popup, bigger composer with clear/undo/redo ([cd2d93d](https://github.com/gnoopy/instafix/commit/cd2d93dbb6fa2f0535b5ab8c418e679d00fbd313))

## [0.10.12](https://github.com/gnoopy/instafix/compare/widget-v0.10.11...widget-v0.10.12) (2026-09-04)


### Features

* **widget,dashboard:** wire dashboardUrl into the live demo, sync theme + locale too ([e43b50f](https://github.com/gnoopy/instafix/commit/e43b50ff7e8c35e9c880bcaa8f8e3af5e14d4cfc))

## [0.10.11](https://github.com/gnoopy/instafix/compare/widget-v0.10.10...widget-v0.10.11) (2026-09-04)


### Bug Fixes

* **widget,dashboard:** reposition dashboard-link button, fix accent-sync bugs ([5deb2b7](https://github.com/gnoopy/instafix/commit/5deb2b749a4d1b525d8855b8cf1beed834dbc731))

## [0.10.10](https://github.com/gnoopy/instafix/compare/widget-v0.10.9...widget-v0.10.10) (2026-09-04)


### Features

* **widget,dashboard:** add a dashboard link + accent-color sync from the panel ([4d46db7](https://github.com/gnoopy/instafix/commit/4d46db7d4584e209c9a192bd58f5f42adec7177a))


### Bug Fixes

* **widget:** make the dashboard-link button icon-only to stop header wrap ([7790659](https://github.com/gnoopy/instafix/commit/7790659bc06269b20fc8162f79ed7f0f8b8ba020))

## [0.10.9](https://github.com/gnoopy/instafix/compare/widget-v0.10.8...widget-v0.10.9) (2026-09-03)


### Bug Fixes

* **ci:** repair CI regressions surfaced by the adapter-kit/prisma removal ([abba41c](https://github.com/gnoopy/instafix/commit/abba41ce26026a80eb8454a10a4c9a69215eaa42))

## [0.10.8](https://github.com/gnoopy/instafix/compare/widget-v0.10.7...widget-v0.10.8) (2026-09-03)


### Features

* add a filesystem adapter for a single-developer local history ([ec276a3](https://github.com/gnoopy/instafix/commit/ec276a3de88cc550bb1c26f9c75cc16bb2c014d0))
* close the mark→record→prompt→agent loop (upgrade-v3) ([7f02284](https://github.com/gnoopy/instafix/commit/7f0228428bd458193de6c1fdd31773739ca3b5f3))
* **i18n:** add Korean (ko) as the default widget/dashboard locale ([c840dc6](https://github.com/gnoopy/instafix/commit/c840dc674b51ad69032ce1b8eef1325edfcc4df0))
* name the recorded item — fix note (픽스노트) — and put "Agent에게" on list cards ([77112c2](https://github.com/gnoopy/instafix/commit/77112c269abb696b794be54f155e8a55f53bd276))
* **widget:** add an in-panel Settings view for runtime config ([1186a9b](https://github.com/gnoopy/instafix/commit/1186a9bc1077816816f18a52a7aea9ea8333c0b8))
* **widget:** auto-avoid other floating overlays anchored in the same corner ([8a486af](https://github.com/gnoopy/instafix/commit/8a486af3bdb4760c9bd1bbea0c7192819672b10e))
* **widget:** auto-contrast toolbar and periodic discovery shine ([d83cdcd](https://github.com/gnoopy/instafix/commit/d83cdcd531523aefbf1d2cd88f6268bba1583925))
* **widget:** auto-detect a selection color distinct from the host palette ([4846a70](https://github.com/gnoopy/instafix/commit/4846a7049dc6c17cf1e7e9459cd7b14304275345))
* **widget:** auto-target hover-and-click picker, drop demo/docs right-click refs ([e514a1a](https://github.com/gnoopy/instafix/commit/e514a1acbe65c4fb195a00af68fd07da1b19b800))
* **widget:** compact panel & detail — toast for handoff errors, hover-reveal card actions, de-bordered chrome ([3527ae6](https://github.com/gnoopy/instafix/commit/3527ae68f27a8fe7c3cfadacf39d0574e5c2ec5d))
* **widget:** contrast-aware selection color, selection-colored FAB/toolbar, filled markers, reveal-on-select ([57b831b](https://github.com/gnoopy/instafix/commit/57b831bc491d5b6a5e1a297befd18b2c8ee4b848))
* **widget:** detail view — status pill joins the header, all commands on one row, annotation section flattened ([baddfe0](https://github.com/gnoopy/instafix/commit/baddfe07f2189fae258cf9e7cb2cb8e9f9277233))
* **widget:** drag-select summary/detail numbering, remove right-click select ([3d972a2](https://github.com/gnoopy/instafix/commit/3d972a2b77ecf03ed6ebc7b9aa44a7f476ae8155))
* **widget:** global Alt+Shift toolbar shortcuts, shown as key chips in the tooltips ([9004a9b](https://github.com/gnoopy/instafix/commit/9004a9b2fb171159b406992039aa53a8612e79e7))
* **widget:** in-composer "copy prompt" (full context, agent-ready) + auto-growing note field ([ee87532](https://github.com/gnoopy/instafix/commit/ee87532e10baaa155c7ac62c701f9b536f9467d8))
* **widget:** layer SURFACE tokens — dynamic palette rule now covers backgrounds, not just accents ([2baf276](https://github.com/gnoopy/instafix/commit/2baf276b5f837036df45cfba1467d18d30df451d))
* **widget:** marker click scrolls+selects its list card, shine pauses under the open panel ([6b04cfb](https://github.com/gnoopy/instafix/commit/6b04cfb36ae1b489d809f744c104cfc597a666e6))
* **widget:** select-all + search share one toolbar row; card checkboxes visible at rest ([efa1878](https://github.com/gnoopy/instafix/commit/efa18785b6eb68bda9e513f8d560548424836019))
* **widget:** unified layer identity — curated LAYER_PALETTES, one tone across every InstaFix surface ([827ae36](https://github.com/gnoopy/instafix/commit/827ae3632cac117095e76ca403befada8e97afae))
* **widget:** unify the drag and auto-target popovers — Element/Container toggle everywhere ([d00e8e5](https://github.com/gnoopy/instafix/commit/d00e8e5cb6f1b1c1c5901f1a29eb0e00509e9a8c))
* **widget:** unify toolbar color, fix auto-target outline persistence, selection-colored markers ([340d8a1](https://github.com/gnoopy/instafix/commit/340d8a18abfd7b965a5c5c4436ee2cb3ab2c7af5))
* **widget:** win max-z-index stacking ties against other floating overlays ([92c03b3](https://github.com/gnoopy/instafix/commit/92c03b35022807f9308779cdc3ef84122e40943f))


### Bug Fixes

* **lint:** clear biome errors/warnings blocking CI on main ([d558c4d](https://github.com/gnoopy/instafix/commit/d558c4d047e44de540b0f367fa34dc9aebd71239))
* **size,e2e:** correct IIFE bundle budget, sync test to committed i18n string ([d133cbf](https://github.com/gnoopy/instafix/commit/d133cbf2e685159fae1b1cf17ca3189efb68406e))
* **widget:** container toggle re-tracks the host-page outline; targeting highlight wins z-index wars ([c9f3bff](https://github.com/gnoopy/instafix/commit/c9f3bffdf5c899ccb0a0aa55a4b5bb92c29d96bc))
* **widget:** filter Next error-boundary wrappers out of the source-hint path ([9f32502](https://github.com/gnoopy/instafix/commit/9f32502f3a73c4354b3e326e47083e5a9b03a78b))
* **widget:** full-bounds click annotations, measured popup clamping, inverted active toolbar state ([4d19819](https://github.com/gnoopy/instafix/commit/4d19819fe0c809472df0f898807621ad7f8d90f2))
* **widget:** hit-test auto-target clicks at the exact cursor hotspot ([167dc1e](https://github.com/gnoopy/instafix/commit/167dc1e9a694d0fedb2652f1790f54843dc91e60))
* **widget:** never line-break inside the Ctrl+Enter chord in the composer hint ([0314585](https://github.com/gnoopy/instafix/commit/03145854b39473e6efb58991318d41728fa36b1e))
* **widget:** one FONT_STACK constant, system-ui first — identical panel typography on every host ([d8e175c](https://github.com/gnoopy/instafix/commit/d8e175c00261e17fecee721d303e3d643cad78e1))
* **widget:** panel shortcut Alt+Shift+F → Alt+Shift+S ([6ca1928](https://github.com/gnoopy/instafix/commit/6ca1928953907414cb96d17fbf9bad57be131262))
* **widget:** screenshots work again (html2canvas-pro); bug pre-selected; sort controls join the action bar ([6d262a0](https://github.com/gnoopy/instafix/commit/6d262a056afa26b2bb3cfe15c005ff33c7d19d8d))
* **widget:** settings segmented controls fill their pill evenly ([b6d3467](https://github.com/gnoopy/instafix/commit/b6d3467a465df62e86c4a83ac6f9cbe7b90d199d))
* **widget:** shave detail command-row button sizes so all four commands fit one line ([54dce98](https://github.com/gnoopy/instafix/commit/54dce9847c26aaee11405a4d845e83cb2060c0d3))
* **widget:** sort + group-by-page controls move into the filter bar's last row, right end ([91b65e1](https://github.com/gnoopy/instafix/commit/91b65e1a448bcd71caa5345a25ad63b4e57beba7))
* **widget:** source hint survives React 19 — owner-chain component path fallback ([f21b1ed](https://github.com/gnoopy/instafix/commit/f21b1ed4dfc1315c1fdfa3f2b9a9e40a5ca58ab0))
* **widget:** text selections get the Element/Container toggle; source hint decoupled from it ([1a54486](https://github.com/gnoopy/instafix/commit/1a54486e1ed5030eb0d9529ccef7fc8d20ae6a3c))


### Refactoring

* rebrand SitePing → InstaFix across codebase ([b9e0872](https://github.com/gnoopy/instafix/commit/b9e0872ce04136561b1c26130d46d9922c9500c6))
* **widget:** fold Settings into an inline accordion, fix panel closing on every change ([731c411](https://github.com/gnoopy/instafix/commit/731c4116da5e67b6eae8f9c6fcbb453ba1b3644f))


### Tests

* close the coverage gap left by recent features (unblocks release-please) ([42a31fc](https://github.com/gnoopy/instafix/commit/42a31fc021d5aab27879e77e56d4f2be4cc49645))


### Documentation

* mark i18n and contact/admin work complete in rebranding plan ([d25dcf5](https://github.com/gnoopy/instafix/commit/d25dcf5d4297547ba79bf0364d5576fa37e5c1ed))
* **readme:** drop the 'Why InstaFix?' section (verbose, and its ([92c03b3](https://github.com/gnoopy/instafix/commit/92c03b35022807f9308779cdc3ef84122e40943f))
* record language switcher, Korean docs, and production bug fixes in rebranding plan ([fcc3d63](https://github.com/gnoopy/instafix/commit/fcc3d63620d556a9410c4536c2ed0eb31af6a838))
* replace every npm-registry install reference with the GitHub dist-branch method ([7c59881](https://github.com/gnoopy/instafix/commit/7c59881a1dae9360cc7460603fefa9f87902e5af))
* rewrite rebranding plan in Korean, track progress checklist ([0be081a](https://github.com/gnoopy/instafix/commit/0be081a85f7dff30ea6a8b1e00af216ea183e03b))


### Miscellaneous

* **deps-dev:** bump the dev-dependencies group with 2 updates ([#1](https://github.com/gnoopy/instafix/issues/1)) ([8d71356](https://github.com/gnoopy/instafix/commit/8d713566fbb56646173af42245d9bf2288baacfc))
* snapshot before InstaFix rebrand ([465768c](https://github.com/gnoopy/instafix/commit/465768c631f2dd3f126b4cc8bd7af803466c53d7))

## [0.10.7](https://github.com/gnoopy/instafix/compare/widget-v0.10.6...widget-v0.10.7) (2026-07-28)


### Features

* type-safe contracts + mechanical extension paths (adapters, locales, packages) ([#247](https://github.com/gnoopy/instafix/issues/247)) ([75cd2f5](https://github.com/gnoopy/instafix/commit/75cd2f5024509e5552bfbcf7587a0d67819909a6))

## [0.10.6](https://github.com/gnoopy/instafix/compare/widget-v0.10.5...widget-v0.10.6) (2026-07-26)


### Documentation

* **site:** ship instafix.realstory.blog/docs — verified bilingual documentation + slimmed READMEs ([#241](https://github.com/gnoopy/instafix/issues/241)) ([252073f](https://github.com/gnoopy/instafix/commit/252073f2eb11a99980d81eecb5ed37b23c3894f8))


### Miscellaneous

* **security:** close every actionable OpenSSF Scorecard finding ([#242](https://github.com/gnoopy/instafix/issues/242)) ([8d989a3](https://github.com/gnoopy/instafix/commit/8d989a3bfb4a80c107a968fc66379e76ff830ea8))

## [0.10.5](https://github.com/gnoopy/instafix/compare/widget-v0.10.4...widget-v0.10.5) (2026-07-25)


### Bug Fixes

* **widget:** prevent re-entry during popup open ([#196](https://github.com/gnoopy/instafix/issues/196)) and fix contextmenu trigger ([#197](https://github.com/gnoopy/instafix/issues/197)) ([#217](https://github.com/gnoopy/instafix/issues/217)) ([a885eba](https://github.com/gnoopy/instafix/commit/a885eba8814ce90a4d93949b119e48f4436fea76))

## [0.10.4](https://github.com/gnoopy/instafix/compare/widget-v0.10.3...widget-v0.10.4) (2026-07-25)


### Bug Fixes

* ship fully resolvable type declarations for every published package ([#232](https://github.com/gnoopy/instafix/issues/232)) ([01a8085](https://github.com/gnoopy/instafix/commit/01a8085c90fab4e721eaede8def9a4d9f5eefcc0))

## [0.10.3](https://github.com/gnoopy/instafix/compare/widget-v0.10.2...widget-v0.10.3) (2026-07-24)


### Features

* **widget:** cross-strategy scored anchor resolution — visibility-aware, structurally verified, subquadratic matching ([#216](https://github.com/gnoopy/instafix/issues/216)) ([98029b1](https://github.com/gnoopy/instafix/commit/98029b1c8f7183bbd5c820c21d8d14bcd5843731))

## [0.10.2](https://github.com/gnoopy/instafix/compare/widget-v0.10.1...widget-v0.10.2) (2026-07-24)


### Features

* **widget:** apiKey and headers config options for authenticated HTTP mode (fixes [#100](https://github.com/gnoopy/instafix/issues/100)) ([#209](https://github.com/gnoopy/instafix/issues/209)) ([9de14db](https://github.com/gnoopy/instafix/commit/9de14db90b7832d375cce19d7fd5e607c20b550f))


### Bug Fixes

* **widget:** production guard survives bundler NODE_ENV folding; add SSR guard (fixes [#104](https://github.com/gnoopy/instafix/issues/104)) ([#207](https://github.com/gnoopy/instafix/issues/207)) ([f2d2eb2](https://github.com/gnoopy/instafix/commit/f2d2eb2673d209ededabe75af7911ae3f20be771))
* **widget:** target the last focused page element for FAB-launched keyboard annotation (fixes [#162](https://github.com/gnoopy/instafix/issues/162)) ([#210](https://github.com/gnoopy/instafix/issues/210)) ([61d94d6](https://github.com/gnoopy/instafix/commit/61d94d6e3e884ddf022bd9e6d998842bdca6d9cd))

## [0.10.1](https://github.com/gnoopy/instafix/compare/widget-v0.10.0...widget-v0.10.1) (2026-07-24)


### Features

* **widget:** add opt-in right-click to start comment (fixes [#190](https://github.com/gnoopy/instafix/issues/190)) ([#191](https://github.com/gnoopy/instafix/issues/191)) ([470c576](https://github.com/gnoopy/instafix/commit/470c576283df06ad287c29cdb1c2bf5689942cc0))

## [0.10.0](https://github.com/gnoopy/instafix/compare/widget-v0.9.16...widget-v0.10.0) (2026-07-24)


### ⚠ BREAKING CHANGES

* **widget:** render the 4-state model and capture screenshots with context
* **adapter-prisma:** 4-state validation, statuses bucket filter, screenshotRegion persistence

### Features

* **adapter-localstorage:** persist screenshotRegion and support multi-status queries ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **adapter-memory:** persist screenshotRegion and support multi-status queries ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **adapter-prisma:** 4-state validation, statuses bucket filter, screenshotRegion persistence ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **cli:** generate the screenshotRegion Json? column via instafix init/sync ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **core:** 4-state feedback model, screenshotRegion metadata and multi-status queries ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **dashboard:** @instafix/dashboard — Linear-style triage inbox with keyboard-first triage, annotated-screenshot evidence card, store/endpoint modes, theming and 7 locales; WCAG 2.1 AA verified (axe: zero violations) ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **demo:** freelancer inbox at /demo/inbox with a seeded triage backlog and real annotated screenshots ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* triage inbox (@instafix/dashboard), 4-state statuses and annotated screenshots ([#201](https://github.com/gnoopy/instafix/issues/201)) ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))
* **widget:** render the 4-state model and capture screenshots with context ([07e4c29](https://github.com/gnoopy/instafix/commit/07e4c29af5d522fd1a8ea124d6365b4e3463c96b))

## [0.9.16](https://github.com/gnoopy/instafix/compare/widget-v0.9.15...widget-v0.9.16) (2026-07-23)


### Miscellaneous

* **deps-dev:** bump the dev-dependencies group across 1 directory with 6 updates ([#195](https://github.com/gnoopy/instafix/issues/195)) ([bc53c84](https://github.com/gnoopy/instafix/commit/bc53c8446541a1f9a57adcf1003f9cf29515a60e))
* **deps:** bump the production-dependencies group across 1 directory with 3 updates ([#188](https://github.com/gnoopy/instafix/issues/188)) ([ce3d967](https://github.com/gnoopy/instafix/commit/ce3d967b18da4f658f2ea1c77a6a4f8d1ef4923b))

## [0.9.15](https://github.com/gnoopy/instafix/compare/widget-v0.9.14...widget-v0.9.15) (2026-06-17)


### Bug Fixes

* **widget:** re-fetch feedbacks on SPA navigation ([#181](https://github.com/gnoopy/instafix/issues/181)) ([a8eddda](https://github.com/gnoopy/instafix/commit/a8eddda4cb4feec8c6c764713498979476ec5ade))

## [0.9.14](https://github.com/gnoopy/instafix/compare/widget-v0.9.13...widget-v0.9.14) (2026-06-10)


### Features

* tech-lead review quick wins — a11y keyboard flow, store persistence contract, CSV formula guard ([#165](https://github.com/gnoopy/instafix/issues/165)) ([56f17a9](https://github.com/gnoopy/instafix/commit/56f17a99f159dc12707bcc0ec2f7c906bddf2a3f))

## [0.9.13](https://github.com/gnoopy/instafix/compare/widget-v0.9.12...widget-v0.9.13) (2026-06-01)


### Features

* **widget:** add showAnnotationsToggle config to hide the FAB marker-visibility item ([#130](https://github.com/gnoopy/instafix/issues/130)) ([6ecdf86](https://github.com/gnoopy/instafix/commit/6ecdf867c8ce360cdb4fc004c6f48a0e98542b62))
* **widget:** clarify FAB radial-item labels and icons ([#128](https://github.com/gnoopy/instafix/issues/128)) ([9168e98](https://github.com/gnoopy/instafix/commit/9168e98a538db072d3212ae92c723ee5a4616ba0))


### Bug Fixes

* **widget:** exclude annotator overlay from captured screenshots ([#125](https://github.com/gnoopy/instafix/issues/125)) ([af04013](https://github.com/gnoopy/instafix/commit/af040131606eb67c2ec2160e75a5fe033879ed18))
* **widget:** preserve FAB toggle hover label across icon swaps ([#129](https://github.com/gnoopy/instafix/issues/129)) ([4e25241](https://github.com/gnoopy/instafix/commit/4e252411c0606bdc0cdc4d8f44d6c89c2c5e788c))
* **widget:** raise identity prompt above the in-flight feedback popup ([#127](https://github.com/gnoopy/instafix/issues/127)) ([f19e36c](https://github.com/gnoopy/instafix/commit/f19e36cea470a1423595874e8858f51e122ab3ff))
* **widget:** theme-aware focus & hover backgrounds in dark mode ([#158](https://github.com/gnoopy/instafix/issues/158)) ([106b557](https://github.com/gnoopy/instafix/commit/106b557cd8133fb8428485cec5be50fc4f7d65b6)), closes [#157](https://github.com/gnoopy/instafix/issues/157)


### Miscellaneous

* **deps:** bump @medv/finder from 3.2.0 to 4.0.2 ([#152](https://github.com/gnoopy/instafix/issues/152)) ([84e72ab](https://github.com/gnoopy/instafix/commit/84e72ab90f5270846aa940a6c03cfe46fdec160d))
* **deps:** bump the production-dependencies group across 1 directory with 3 updates ([#145](https://github.com/gnoopy/instafix/issues/145)) ([b529a27](https://github.com/gnoopy/instafix/commit/b529a276c98ca929376d3e00b82abcf495f16905))

## [0.9.12](https://github.com/gnoopy/instafix/compare/widget-v0.9.11...widget-v0.9.12) (2026-05-20)


### Bug Fixes

* **widget:** keep popup visible with spinner during feedback submission ([#114](https://github.com/gnoopy/instafix/issues/114)) ([1ec5c27](https://github.com/gnoopy/instafix/commit/1ec5c2791850b42b96a26fcb2a0f8ee81793abab))
* **widget:** re-localize FAB + popup after locale chunk loads ([#107](https://github.com/gnoopy/instafix/issues/107)) ([0e501c2](https://github.com/gnoopy/instafix/commit/0e501c2a6cfe805dd397c5f7174ffadc755aa1e2))
* **widget:** wire FAB unread badge to marker mutations ([#112](https://github.com/gnoopy/instafix/issues/112)) ([7a6aa1d](https://github.com/gnoopy/instafix/commit/7a6aa1de9ce1cb34b1c48ec55d01c5e4e10effee))

## [0.9.11](https://github.com/gnoopy/instafix/compare/widget-v0.9.10...widget-v0.9.11) (2026-05-19)


### Bug Fixes

* **widget:** avoid stale identity retry replay ([#95](https://github.com/gnoopy/instafix/issues/95)) ([7177e58](https://github.com/gnoopy/instafix/commit/7177e58cdb4cc7cfbda1e6ff36a9cbee46ba8e5f))


### Refactoring

* **types:** tighten type safety across all packages ([1b212ba](https://github.com/gnoopy/instafix/commit/1b212bae29177e71abc15a88d0133b73cde346e5))

## [0.9.10](https://github.com/gnoopy/instafix/compare/widget-v0.9.9...widget-v0.9.10) (2026-05-19)


### Features

* **widget:** deep-link to annotations via URL query + focusFeedback API ([#91](https://github.com/gnoopy/instafix/issues/91)) ([b821e43](https://github.com/gnoopy/instafix/commit/b821e436ec4291314e4b58666a1d9aad51d2a8d2))


### Bug Fixes

* **widget:** opaque backdrop-filter fallback for .sp-detail ([#92](https://github.com/gnoopy/instafix/issues/92)) ([41bee72](https://github.com/gnoopy/instafix/commit/41bee726ef24bf9456ba5a2481ea24150ba574a8))

## [0.9.9](https://github.com/gnoopy/instafix/compare/widget-v0.9.8...widget-v0.9.9) (2026-05-19)


### Features

* **widget:** allow host apps to pre-fill identity via config ([#82](https://github.com/gnoopy/instafix/issues/82)) ([d1d4363](https://github.com/gnoopy/instafix/commit/d1d4363e2ae74a8bccb91125b24e2575b1f352a1))

## [0.9.8](https://github.com/gnoopy/instafix/compare/widget-v0.9.7...widget-v0.9.8) (2026-05-18)


### Features

* **core,widget:** typed error hierarchy with retryable flag ([#76](https://github.com/gnoopy/instafix/issues/76)) ([f942c58](https://github.com/gnoopy/instafix/commit/f942c58b0a7d1f765ca92ceeded59c1e34157515))
* **widget:** add useInstaFix() React hook with StrictMode-safe lifecycle ([#72](https://github.com/gnoopy/instafix/issues/72)) ([6a303e8](https://github.com/gnoopy/instafix/commit/6a303e8be0e8e0d1a7f41dd546077943741cd0c7))
* **widget:** capture last 50 console messages + failed network requests with each feedback ([#71](https://github.com/gnoopy/instafix/issues/71)) ([726e1b8](https://github.com/gnoopy/instafix/commit/726e1b8a0d4dcef726ec6dc468c168fb73396dbc))


### Bug Fixes

* **docs:** correct bundle size claim and remove phantom v1.0.0 section ([#65](https://github.com/gnoopy/instafix/issues/65)) ([12f12ed](https://github.com/gnoopy/instafix/commit/12f12ed772c5cff8cd39d5e3a7ae0c12560e6a9c))
* **widget:** show tooltip on marker focus (WCAG 1.4.13) + harden focus trap ([#73](https://github.com/gnoopy/instafix/issues/73)) ([ed710e3](https://github.com/gnoopy/instafix/commit/ed710e3cdf406f7a4854985f0ffc8731fe9acbbf))
* **widget:** unify i18n across 6 panel modules — DE/ES/IT/PT/RU now fully translated ([1666a6f](https://github.com/gnoopy/instafix/commit/1666a6f22f0abda3bd360c151d12814393af4aed))


### Performance

* **widget:** lazy-load panel and i18n locales (-50% first-paint gzip) ([#68](https://github.com/gnoopy/instafix/issues/68)) ([fa0a674](https://github.com/gnoopy/instafix/commit/fa0a674d18078c511b4b9267baa9e793ebb666f3))


### Refactoring

* **widget,core:** share SegmentedControl, setButtonLoading, filter logic ([#75](https://github.com/gnoopy/instafix/issues/75)) ([8cb536b](https://github.com/gnoopy/instafix/commit/8cb536bca303b82e76a00e461d939da210054714))


### Tests

* fix vitest i18n setup (restore green main) ([#80](https://github.com/gnoopy/instafix/issues/80)) ([f622223](https://github.com/gnoopy/instafix/commit/f622223d31a79e891918673143660ddb5b1399c3))


### Miscellaneous

* biome organize imports ([26d98c5](https://github.com/gnoopy/instafix/commit/26d98c5984d3e580455ed9acfa0cad367c8d83d7))
* **deps:** reclassify @medv/finder, widen prisma peer range, harmonize engines ([#74](https://github.com/gnoopy/instafix/issues/74)) ([b28465d](https://github.com/gnoopy/instafix/commit/b28465dc762077a535b79dbaffb51faa73f68538))

## [0.9.7](https://github.com/gnoopy/instafix/compare/widget-v0.9.6...widget-v0.9.7) (2026-05-06)


### Features

* page-scoped annotations + semantic anchors (data-feedback-anchor) ([#55](https://github.com/gnoopy/instafix/issues/55)) ([db722de](https://github.com/gnoopy/instafix/commit/db722deab9f69cfdeb6fbe6f7f0bea57e2995e5c))
* screenshot capture with pluggable storage ([#58](https://github.com/gnoopy/instafix/issues/58)) ([f14ecd2](https://github.com/gnoopy/instafix/commit/f14ecd2f2f05a547a4a52e5a6ad4d794d438008c))


### Bug Fixes

* **widget:** clamp popup inside viewport when rect leaves no room above or below ([#54](https://github.com/gnoopy/instafix/issues/54)) ([1aeffd2](https://github.com/gnoopy/instafix/commit/1aeffd2ee25e9595faf8e30d9993abacda5a9eb7))


### Tests

* raise unit test coverage to 99%+ across all packages ([f2e9f9e](https://github.com/gnoopy/instafix/commit/f2e9f9e406a6f0a3971b9df864af4e96d742304a))

## [0.9.6](https://github.com/gnoopy/instafix/compare/widget-v0.9.5...widget-v0.9.6) (2026-05-02)


### Features

* **widget:** add Brazilian Portuguese (pt) locale ([#41](https://github.com/gnoopy/instafix/issues/41)) ([ebee6d7](https://github.com/gnoopy/instafix/commit/ebee6d70d715b23624d4732c65c096002f463a75))
* **widget:** add German (de) locale ([#43](https://github.com/gnoopy/instafix/issues/43)) ([f028235](https://github.com/gnoopy/instafix/commit/f028235ce8dd40a42c4cd108ddc333b4fa646175))
* **widget:** add Italian (it) locale ([#42](https://github.com/gnoopy/instafix/issues/42)) ([d67fe88](https://github.com/gnoopy/instafix/commit/d67fe88e9edeb9f604b973fc47d049d55ced3481))
* **widget:** add panel enhancements — stats, sort, bulk, export, detail, shortcuts ([f3e8833](https://github.com/gnoopy/instafix/commit/f3e88333babf88d5426bc32b087a7b1210c17ef3))
* **widget:** add Russian (ru) locale ([#30](https://github.com/gnoopy/instafix/issues/30)) ([ce7c17b](https://github.com/gnoopy/instafix/commit/ce7c17be67900d8a0903f8d272383efd1ce49c0a))
* **widget:** add Spanish (es) locale ([#44](https://github.com/gnoopy/instafix/issues/44)) ([8fb4fd3](https://github.com/gnoopy/instafix/commit/8fb4fd332d642d0e6c05557d07a635c7696ceb53))
* **widget:** replace 8 filter chips with type dropdown + status segmented control ([0564010](https://github.com/gnoopy/instafix/commit/056401009b485609fa8a705218b144d7cabf60d5))


### Bug Fixes

* **widget,adapter-prisma:** harden retry queue, panel UX, and PATCH ownership ([26301d3](https://github.com/gnoopy/instafix/commit/26301d34f23c62a7e623741ca6f815841088ca4f))
* **widget:** fall back to body when no ancestor contains the drawn rect ([5a994f2](https://github.com/gnoopy/instafix/commit/5a994f21cb94ffd4ecda462a242ad78da5f521c8))
* **widget:** lift panel header above sticky filters so export dropdown overlays correctly ([d4ea6b8](https://github.com/gnoopy/instafix/commit/d4ea6b83d84dcb6760c6e53125de3585110f4410))


### Tests

* **widget:** add coverage for panel-bulk ([#38](https://github.com/gnoopy/instafix/issues/38)) ([52e126c](https://github.com/gnoopy/instafix/commit/52e126c00d4f699a0ddcf9ac333929dfe263b306))
* **widget:** add coverage for panel-sort ([#39](https://github.com/gnoopy/instafix/issues/39)) ([9dbd2c5](https://github.com/gnoopy/instafix/commit/9dbd2c5053d266df181b024b5b534cfb2508d31b))
* **widget:** add export utils coverage ([#40](https://github.com/gnoopy/instafix/issues/40)) ([a82d74e](https://github.com/gnoopy/instafix/commit/a82d74e1cafc4cacb9852be08a1157e6ca012c18))


### Miscellaneous

* harmonize locale rollout — types, docs, coverage thresholds ([40f7166](https://github.com/gnoopy/instafix/commit/40f71663d78156b5d46a9b1f7d7e938788a96e08))

## [0.9.5](https://github.com/gnoopy/instafix/compare/widget-v0.9.4...widget-v0.9.5) (2026-04-05)


### Bug Fixes

* **widget:** add button loading spinner and fix stale GET cache on mutations ([bab698d](https://github.com/gnoopy/instafix/commit/bab698db4f5ca4f9020657196f3ddb6b689907a9))

## [0.9.4](https://github.com/gnoopy/instafix/compare/widget-v0.9.3...widget-v0.9.4) (2026-04-04)


### Bug Fixes

* **widget:** prevent spam-click race condition on resolve/delete buttons ([9958150](https://github.com/gnoopy/instafix/commit/9958150f0be87df3a95f0d5816e68921827ab9c7))

## [0.9.3](https://github.com/gnoopy/instafix/compare/widget-v0.9.2...widget-v0.9.3) (2026-04-04)


### Features

* add adapter-memory, adapter-localstorage, and widget store mode ([efa8b64](https://github.com/gnoopy/instafix/commit/efa8b64197d1a612146b0c988f1b708cd594b373))


### Bug Fixes

* comprehensive audit — 44 fixes across all packages ([60652ad](https://github.com/gnoopy/instafix/commit/60652ad03eb070fe18e2a4e943ea013f76070896))
* **widget:** performance, security, DX, and dark theme overhaul ([b0422fe](https://github.com/gnoopy/instafix/commit/b0422fe27e2f76780956848fa8c1898710bcfe30))
* **widget:** preserve runtime NODE_ENV check for Shadow DOM mode in bundle ([4cf482b](https://github.com/gnoopy/instafix/commit/4cf482ba5c56f89dade7875b86eead4c124e11d7))


### Tests

* add 184 tests across all packages + E2E for new features ([b7f869c](https://github.com/gnoopy/instafix/commit/b7f869c119c0a76f089d4e889d5b48be8b3e06c1))
* raise coverage to 93%+ with 110 new tests across all packages ([cb39737](https://github.com/gnoopy/instafix/commit/cb3973774a89dec2eafb6aeb6087d492647553c1))


### Documentation

* update all documentation for adapter pattern and new packages ([bcdbd46](https://github.com/gnoopy/instafix/commit/bcdbd46cfe7f504f659335176e9454b66f3a4547))

## [0.9.0](https://github.com/gnoopy/instafix/compare/widget-v0.8.1...widget-v0.9.0) (2026-04-03)

### Features

* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))
* **repo:** add community files, npm keywords, and badges ([30645b4](https://github.com/gnoopy/instafix/commit/30645b42d5a52d945e7e3919ce197020e0f261d6))
* **widget:** add i18n system with French and English locales ([0fe17d7](https://github.com/gnoopy/instafix/commit/0fe17d7bae454d30b94ae48a607fba97ba353460))
* **widget:** comprehensive accessibility improvements ([fb28f81](https://github.com/gnoopy/instafix/commit/fb28f815aac309ee87e7f0b26b8326663a2e6c5e))

### Bug Fixes

* resolve merge conflicts and post-merge issues ([e342ee8](https://github.com/gnoopy/instafix/commit/e342ee8cc3ade358d2a8c3685f5ae4080849c3ab))
* **widget:** fix double callbacks, unhandled promises, biome rules ([849af37](https://github.com/gnoopy/instafix/commit/849af378fb32ea0ee60468471e71f5dc5b56a66a))

### Performance

* **widget:** minify bundle, add DB indexes, optimize retry ([58e5e11](https://github.com/gnoopy/instafix/commit/58e5e113e2b67e860556fa68bc8b9fc7246fcfe0))

### Documentation

* add README and LICENSE to each published package ([d4cfbf1](https://github.com/gnoopy/instafix/commit/d4cfbf16ca79562195be6374e74463f6aae7ceb0))

## [0.8.1](https://github.com/gnoopy/instafix/compare/widget-v0.8.0...widget-v0.8.1) (2026-04-03)

### Documentation

* **widget:** clarify launcher jsdoc ([1a14004](https://github.com/gnoopy/instafix/commit/1a14004a8373fd8ed33af37c9e977164e2a5443e))

## [0.8.0](https://github.com/gnoopy/instafix/compare/widget-v0.7.0...widget-v0.8.0) (2026-04-03)

### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Refactoring

* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))
