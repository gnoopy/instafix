# Changelog

## [0.2.7](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.6...dashboard-v0.2.7) (2026-09-03)


### Bug Fixes

* **ci:** repair CI regressions surfaced by the adapter-kit/prisma removal ([abba41c](https://github.com/gnoopy/instafix/commit/abba41ce26026a80eb8454a10a4c9a69215eaa42))

## [0.2.6](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.5...dashboard-v0.2.6) (2026-09-03)


### Features

* **dashboard:** dim resolved/wont_fix rows in the inbox sidebar ([f03175d](https://github.com/gnoopy/instafix/commit/f03175db7e155fd1c899cd32f9dc44a9d47042e2))
* **i18n:** add Korean (ko) as the default widget/dashboard locale ([c840dc6](https://github.com/gnoopy/instafix/commit/c840dc674b51ad69032ce1b8eef1325edfcc4df0))
* name the recorded item — fix note (픽스노트) — and put "Agent에게" on list cards ([77112c2](https://github.com/gnoopy/instafix/commit/77112c269abb696b794be54f155e8a55f53bd276))


### Refactoring

* rebrand SitePing → InstaFix across codebase ([b9e0872](https://github.com/gnoopy/instafix/commit/b9e0872ce04136561b1c26130d46d9922c9500c6))


### Tests

* close the coverage gap left by recent features (unblocks release-please) ([42a31fc](https://github.com/gnoopy/instafix/commit/42a31fc021d5aab27879e77e56d4f2be4cc49645))


### Documentation

* mark i18n and contact/admin work complete in rebranding plan ([d25dcf5](https://github.com/gnoopy/instafix/commit/d25dcf5d4297547ba79bf0364d5576fa37e5c1ed))
* record language switcher, Korean docs, and production bug fixes in rebranding plan ([fcc3d63](https://github.com/gnoopy/instafix/commit/fcc3d63620d556a9410c4536c2ed0eb31af6a838))
* replace every npm-registry install reference with the GitHub dist-branch method ([7c59881](https://github.com/gnoopy/instafix/commit/7c59881a1dae9360cc7460603fefa9f87902e5af))
* rewrite rebranding plan in Korean, track progress checklist ([0be081a](https://github.com/gnoopy/instafix/commit/0be081a85f7dff30ea6a8b1e00af216ea183e03b))


### Miscellaneous

* snapshot before InstaFix rebrand ([465768c](https://github.com/gnoopy/instafix/commit/465768c631f2dd3f126b4cc8bd7af803466c53d7))

## [0.2.5](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.4...dashboard-v0.2.5) (2026-07-28)


### Features

* type-safe contracts + mechanical extension paths (adapters, locales, packages) ([#247](https://github.com/gnoopy/instafix/issues/247)) ([75cd2f5](https://github.com/gnoopy/instafix/commit/75cd2f5024509e5552bfbcf7587a0d67819909a6))

## [0.2.4](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.3...dashboard-v0.2.4) (2026-07-26)


### Documentation

* **site:** ship instafix.realstory.blog/docs — verified bilingual documentation + slimmed READMEs ([#241](https://github.com/gnoopy/instafix/issues/241)) ([252073f](https://github.com/gnoopy/instafix/commit/252073f2eb11a99980d81eecb5ed37b23c3894f8))

## [0.2.3](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.2...dashboard-v0.2.3) (2026-07-25)


### Bug Fixes

* ship fully resolvable type declarations for every published package ([#232](https://github.com/gnoopy/instafix/issues/232)) ([01a8085](https://github.com/gnoopy/instafix/commit/01a8085c90fab4e721eaede8def9a4d9f5eefcc0))

## [0.2.2](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.1...dashboard-v0.2.2) (2026-07-24)


### Tests

* **dashboard:** unmount hooks in use-inbox tests — post-teardown debounce flake (fixes [#206](https://github.com/gnoopy/instafix/issues/206)) ([#212](https://github.com/gnoopy/instafix/issues/212)) ([2f74b78](https://github.com/gnoopy/instafix/commit/2f74b78df326597926b70051dec1bdea6e701fc6))

## [0.2.1](https://github.com/gnoopy/instafix/compare/dashboard-v0.2.0...dashboard-v0.2.1) (2026-07-24)


### Bug Fixes

* **adapter-prisma:** redact authorEmail and strip clientId from unauthenticated HTTP responses (fixes [#105](https://github.com/gnoopy/instafix/issues/105)) ([#208](https://github.com/gnoopy/instafix/issues/208)) ([2a511e7](https://github.com/gnoopy/instafix/commit/2a511e762009ac1a17d5b6e08e6ab1bf04884b0d))

## [0.2.0](https://github.com/gnoopy/instafix/compare/dashboard-v0.1.0...dashboard-v0.2.0) (2026-07-24)


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
