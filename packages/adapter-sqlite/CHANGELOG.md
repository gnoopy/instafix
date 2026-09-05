# Changelog

## [2.0.0](https://github.com/gnoopy/instafix/compare/adapter-sqlite-v1.1.0...adapter-sqlite-v2.0.0) (2026-09-05)


### ⚠ BREAKING CHANGES

* @instafix/* now require Node >= 22. Consumers still on Node 20 should stay on the previous release.

### Features

* require Node 22 — better-sqlite3 v13 (N-API) ends the Node 24 abort ([e8bd91b](https://github.com/gnoopy/instafix/commit/e8bd91b78148e9e9765477a8cafd83d02d277f8b))


### Bug Fixes

* **core:** close stores after each conformance test — a leaked handle aborts Node 24 ([4182cf2](https://github.com/gnoopy/instafix/commit/4182cf2608feec62fff8ef108ff5f3d60a49899e))

## [1.1.0](https://github.com/gnoopy/instafix/compare/adapter-sqlite-v1.0.0...adapter-sqlite-v1.1.0) (2026-09-04)


### Features

* capture a DOM/CSSOM snapshot of the annotated element ([2e5fd77](https://github.com/gnoopy/instafix/commit/2e5fd77f9c63c80b96df4bfb3494021bf0e3f461))


### Bug Fixes

* **adapter-sqlite:** migrate via pragma() — a leaked Statement crashed Node 24 at teardown ([00558f0](https://github.com/gnoopy/instafix/commit/00558f0a703965622662f40f17f0aa4b5c555cc4))

## 1.0.0 (2026-09-03)


### Features

* add a zero-ORM SQLite adapter, fix cross-package store errors, and stop the CLI from assuming Prisma ([8d9ff25](https://github.com/gnoopy/instafix/commit/8d9ff251bf24f2a2a3343c3673b7fbe35d259862))


### Refactoring

* move the generic HTTP handler into core so adapter-sqlite needs no cross-adapter dependency ([5f70e77](https://github.com/gnoopy/instafix/commit/5f70e77adf5b5057ded78bfa0701d8d760a0a1e0))


### Documentation

* mark i18n and contact/admin work complete in rebranding plan ([d25dcf5](https://github.com/gnoopy/instafix/commit/d25dcf5d4297547ba79bf0364d5576fa37e5c1ed))
* record language switcher, Korean docs, and production bug fixes in rebranding plan ([fcc3d63](https://github.com/gnoopy/instafix/commit/fcc3d63620d556a9410c4536c2ed0eb31af6a838))
* replace every npm-registry install reference with the GitHub dist-branch method ([7c59881](https://github.com/gnoopy/instafix/commit/7c59881a1dae9360cc7460603fefa9f87902e5af))
* rewrite rebranding plan in Korean, track progress checklist ([0be081a](https://github.com/gnoopy/instafix/commit/0be081a85f7dff30ea6a8b1e00af216ea183e03b))

## Changelog
