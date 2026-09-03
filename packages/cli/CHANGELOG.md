# Changelog

## [0.5.6](https://github.com/gnoopy/instafix/compare/cli-v0.5.5...cli-v0.5.6) (2026-09-03)


### Documentation

* **readme,cli:** make npm install the primary quick start, GitHub dist branches nightly-only ([340808f](https://github.com/gnoopy/instafix/commit/340808f6e5c89a8a2168df00cc8743a2005a0c2d))

## [0.5.5](https://github.com/gnoopy/instafix/compare/cli-v0.5.4...cli-v0.5.5) (2026-09-03)


### Features

* add a filesystem adapter for a single-developer local history ([ec276a3](https://github.com/gnoopy/instafix/commit/ec276a3de88cc550bb1c26f9c75cc16bb2c014d0))
* add a zero-ORM SQLite adapter, fix cross-package store errors, and stop the CLI from assuming Prisma ([8d9ff25](https://github.com/gnoopy/instafix/commit/8d9ff251bf24f2a2a3343c3673b7fbe35d259862))
* **cli:** auto-run prisma db push and scaffold the widget component ([3e04d09](https://github.com/gnoopy/instafix/commit/3e04d09a817d1ba6667fcc79c185e9a1e6e43715))
* close the mark→record→prompt→agent loop (upgrade-v3) ([7f02284](https://github.com/gnoopy/instafix/commit/7f0228428bd458193de6c1fdd31773739ca3b5f3))
* **i18n:** add Korean (ko) as the default widget/dashboard locale ([c840dc6](https://github.com/gnoopy/instafix/commit/c840dc674b51ad69032ce1b8eef1325edfcc4df0))
* name the recorded item — fix note (픽스노트) — and put "Agent에게" on list cards ([77112c2](https://github.com/gnoopy/instafix/commit/77112c269abb696b794be54f155e8a55f53bd276))


### Bug Fixes

* **cli:** update init's --help description for the SQLite backend choice ([b391a1f](https://github.com/gnoopy/instafix/commit/b391a1f61189f356d5e5bd6fd5fe9c0b287ef019))


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

## [0.5.4](https://github.com/gnoopy/instafix/compare/cli-v0.5.3...cli-v0.5.4) (2026-07-28)


### Features

* type-safe contracts + mechanical extension paths (adapters, locales, packages) ([#247](https://github.com/gnoopy/instafix/issues/247)) ([75cd2f5](https://github.com/gnoopy/instafix/commit/75cd2f5024509e5552bfbcf7587a0d67819909a6))

## [0.5.3](https://github.com/gnoopy/instafix/compare/cli-v0.5.2...cli-v0.5.3) (2026-07-26)


### Documentation

* **site:** ship instafix.realstory.blog/docs — verified bilingual documentation + slimmed READMEs ([#241](https://github.com/gnoopy/instafix/issues/241)) ([252073f](https://github.com/gnoopy/instafix/commit/252073f2eb11a99980d81eecb5ed37b23c3894f8))

## [0.5.2](https://github.com/gnoopy/instafix/compare/cli-v0.5.1...cli-v0.5.2) (2026-07-25)


### Miscellaneous

* **deps-dev:** bump commander from 14.0.3 to 15.0.0 ([#227](https://github.com/gnoopy/instafix/issues/227)) ([903b9fa](https://github.com/gnoopy/instafix/commit/903b9faacebfb5c616794c96a708859782ab287a))

## [0.5.1](https://github.com/gnoopy/instafix/compare/cli-v0.5.0...cli-v0.5.1) (2026-07-25)


### Bug Fixes

* **cli:** run under plain Node — createRequire shim + Object.groupBy polyfill ([#221](https://github.com/gnoopy/instafix/issues/221)) ([45ee65d](https://github.com/gnoopy/instafix/commit/45ee65de4ed164b683d76e8ac6adc3b5bbe8240e))

## [0.5.0](https://github.com/gnoopy/instafix/compare/cli-v0.4.9...cli-v0.5.0) (2026-07-24)


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

## [0.4.9](https://github.com/gnoopy/instafix/compare/cli-v0.4.8...cli-v0.4.9) (2026-07-23)


### Miscellaneous

* **deps-dev:** bump the dev-dependencies group across 1 directory with 6 updates ([#195](https://github.com/gnoopy/instafix/issues/195)) ([bc53c84](https://github.com/gnoopy/instafix/commit/bc53c8446541a1f9a57adcf1003f9cf29515a60e))

## [0.4.8](https://github.com/gnoopy/instafix/compare/cli-v0.4.7...cli-v0.4.8) (2026-06-14)


### Bug Fixes

* **cli:** avoid leading newline in prisma sync ([98f7c2a](https://github.com/gnoopy/instafix/commit/98f7c2a0a457734f54696481e30b39bb385fe6a9))

## [0.4.7](https://github.com/gnoopy/instafix/compare/cli-v0.4.6...cli-v0.4.7) (2026-06-01)


### Miscellaneous

* **deps-dev:** bump @clack/prompts from 0.9.1 to 1.4.0 ([#147](https://github.com/gnoopy/instafix/issues/147)) ([1d86fd2](https://github.com/gnoopy/instafix/commit/1d86fd2a323d14619c86def19acd1bbf0cf36d2b))
* **deps-dev:** bump commander from 13.1.0 to 14.0.3 ([#148](https://github.com/gnoopy/instafix/issues/148)) ([560c4f3](https://github.com/gnoopy/instafix/commit/560c4f3a1ca31d687f0243f98129e444b1de07d3))
* **deps-dev:** bump the dev-dependencies group with 2 updates ([#133](https://github.com/gnoopy/instafix/issues/133)) ([5a95afa](https://github.com/gnoopy/instafix/commit/5a95afa762350e3abd6cd9654fc9457427792ab4))

## [0.4.6](https://github.com/gnoopy/instafix/compare/cli-v0.4.5...cli-v0.4.6) (2026-05-19)


### Refactoring

* **types:** tighten type safety across all packages ([1b212ba](https://github.com/gnoopy/instafix/commit/1b212bae29177e71abc15a88d0133b73cde346e5))

## [0.4.5](https://github.com/gnoopy/instafix/compare/cli-v0.4.4...cli-v0.4.5) (2026-05-18)


### Features

* **widget:** capture last 50 console messages + failed network requests with each feedback ([#71](https://github.com/gnoopy/instafix/issues/71)) ([726e1b8](https://github.com/gnoopy/instafix/commit/726e1b8a0d4dcef726ec6dc468c168fb73396dbc))


### Miscellaneous

* **deps:** reclassify @medv/finder, widen prisma peer range, harmonize engines ([#74](https://github.com/gnoopy/instafix/issues/74)) ([b28465d](https://github.com/gnoopy/instafix/commit/b28465dc762077a535b79dbaffb51faa73f68538))

## [0.4.4](https://github.com/gnoopy/instafix/compare/cli-v0.4.3...cli-v0.4.4) (2026-05-06)


### Features

* page-scoped annotations + semantic anchors (data-feedback-anchor) ([#55](https://github.com/gnoopy/instafix/issues/55)) ([db722de](https://github.com/gnoopy/instafix/commit/db722deab9f69cfdeb6fbe6f7f0bea57e2995e5c))
* screenshot capture with pluggable storage ([#58](https://github.com/gnoopy/instafix/issues/58)) ([f14ecd2](https://github.com/gnoopy/instafix/commit/f14ecd2f2f05a547a4a52e5a6ad4d794d438008c))


### Tests

* raise unit test coverage to 99%+ across all packages ([f2e9f9e](https://github.com/gnoopy/instafix/commit/f2e9f9e406a6f0a3971b9df864af4e96d742304a))

## [0.4.3](https://github.com/gnoopy/instafix/compare/cli-v0.4.2...cli-v0.4.3) (2026-04-04)


### Bug Fixes

* **cli:** translate to English, exit codes, timeout, nativeType support ([2773cae](https://github.com/gnoopy/instafix/commit/2773cae20de4e6d6a01635cd100003c783b16765))
* comprehensive audit — 44 fixes across all packages ([60652ad](https://github.com/gnoopy/instafix/commit/60652ad03eb070fe18e2a4e943ea013f76070896))


### Tests

* add 184 tests across all packages + E2E for new features ([b7f869c](https://github.com/gnoopy/instafix/commit/b7f869c119c0a76f089d4e889d5b48be8b3e06c1))
* raise coverage to 93%+ with 110 new tests across all packages ([cb39737](https://github.com/gnoopy/instafix/commit/cb3973774a89dec2eafb6aeb6087d492647553c1))


### Documentation

* sync all documentation and CI with adapter-memory/localstorage packages ([1be3661](https://github.com/gnoopy/instafix/commit/1be36619c7c0b80d23cb4533fb2ca96beafa7bcf))

## [0.4.0](https://github.com/gnoopy/instafix/compare/cli-v0.3.0...cli-v0.4.0) (2026-04-03)

### Features

* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))
* **repo:** add community files, npm keywords, and badges ([30645b4](https://github.com/gnoopy/instafix/commit/30645b42d5a52d945e7e3919ce197020e0f261d6))

### Bug Fixes

* resolve merge conflicts and post-merge issues ([e342ee8](https://github.com/gnoopy/instafix/commit/e342ee8cc3ade358d2a8c3685f5ae4080849c3ab))

### Refactoring

* **cli:** extract shared utils, bundle deps, fix language ([6118d9e](https://github.com/gnoopy/instafix/commit/6118d9ef522e51a1da62865fab4b627b6633e21e))

### Tests

* add coverage config, CLI tests, fix test quality ([27ad06d](https://github.com/gnoopy/instafix/commit/27ad06dd7dfcb75c5ffbf40a3a9c1282d89728f9))

### Documentation

* add README and LICENSE to each published package ([d4cfbf1](https://github.com/gnoopy/instafix/commit/d4cfbf16ca79562195be6374e74463f6aae7ceb0))

## [0.3.0](https://github.com/gnoopy/instafix/compare/cli-v0.2.0...cli-v0.3.0) (2026-04-03)

### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Refactoring

* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))
