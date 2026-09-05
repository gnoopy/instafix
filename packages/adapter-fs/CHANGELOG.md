# Changelog

## [2.0.0](https://github.com/gnoopy/instafix/compare/adapter-fs-v1.0.1...adapter-fs-v2.0.0) (2026-09-05)


### ⚠ BREAKING CHANGES

* @instafix/* now require Node >= 22. Consumers still on Node 20 should stay on the previous release.

### Features

* require Node 22 — better-sqlite3 v13 (N-API) ends the Node 24 abort ([e8bd91b](https://github.com/gnoopy/instafix/commit/e8bd91b78148e9e9765477a8cafd83d02d277f8b))

## [1.0.1](https://github.com/gnoopy/instafix/compare/adapter-fs-v1.0.0...adapter-fs-v1.0.1) (2026-09-03)


### Bug Fixes

* **ci:** repair CI regressions surfaced by the adapter-kit/prisma removal ([abba41c](https://github.com/gnoopy/instafix/commit/abba41ce26026a80eb8454a10a4c9a69215eaa42))

## 1.0.0 (2026-09-03)


### Features

* **adapter-fs:** refuse to start FsStore under NODE_ENV=production ([4d43702](https://github.com/gnoopy/instafix/commit/4d4370218c42e84b78192552d773982cdd8530c4))
* add a filesystem adapter for a single-developer local history ([ec276a3](https://github.com/gnoopy/instafix/commit/ec276a3de88cc550bb1c26f9c75cc16bb2c014d0))
* close the mark→record→prompt→agent loop (upgrade-v3) ([7f02284](https://github.com/gnoopy/instafix/commit/7f0228428bd458193de6c1fdd31773739ca3b5f3))


### Documentation

* mark i18n and contact/admin work complete in rebranding plan ([d25dcf5](https://github.com/gnoopy/instafix/commit/d25dcf5d4297547ba79bf0364d5576fa37e5c1ed))
* record language switcher, Korean docs, and production bug fixes in rebranding plan ([fcc3d63](https://github.com/gnoopy/instafix/commit/fcc3d63620d556a9410c4536c2ed0eb31af6a838))
* rewrite rebranding plan in Korean, track progress checklist ([0be081a](https://github.com/gnoopy/instafix/commit/0be081a85f7dff30ea6a8b1e00af216ea183e03b))

## Changelog
