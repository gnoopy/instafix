# Changelog

## [0.7.2](https://github.com/gnoopy/instafix/compare/core-v0.7.1...core-v0.7.2) (2026-05-06)


### Features

* page-scoped annotations + semantic anchors (data-feedback-anchor) ([#55](https://github.com/gnoopy/instafix/issues/55)) ([db722de](https://github.com/gnoopy/instafix/commit/db722deab9f69cfdeb6fbe6f7f0bea57e2995e5c))
* screenshot capture with pluggable storage ([#58](https://github.com/gnoopy/instafix/issues/58)) ([f14ecd2](https://github.com/gnoopy/instafix/commit/f14ecd2f2f05a547a4a52e5a6ad4d794d438008c))

## [0.7.1](https://github.com/gnoopy/instafix/compare/core-v0.7.0...core-v0.7.1) (2026-05-02)


### Miscellaneous

* harmonize locale rollout — types, docs, coverage thresholds ([40f7166](https://github.com/gnoopy/instafix/commit/40f71663d78156b5d46a9b1f7d7e938788a96e08))

## [0.7.0](https://github.com/gnoopy/instafix/compare/core-v0.6.0...core-v0.7.0) (2026-04-05)


### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Features

* **core:** add store abstraction layer — errors, helpers, conformance tests ([1590f95](https://github.com/gnoopy/instafix/commit/1590f953c6f9aac9e57ef08a1417ac4c2cca0265))
* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))
* **widget:** add i18n system with French and English locales ([0fe17d7](https://github.com/gnoopy/instafix/commit/0fe17d7bae454d30b94ae48a607fba97ba353460))
* **widget:** add i18n system with French and English locales ([c41d7c4](https://github.com/gnoopy/instafix/commit/c41d7c4c23a3e618a290555120ce83a6a9b1718e))


### Bug Fixes

* comprehensive audit — 44 fixes across all packages ([60652ad](https://github.com/gnoopy/instafix/commit/60652ad03eb070fe18e2a4e943ea013f76070896))
* **core:** strengthen types, schema, and build infrastructure ([90f37f2](https://github.com/gnoopy/instafix/commit/90f37f21e35935b567a13811b026fec2590d3df4))


### Performance

* **widget:** minify bundle, add DB indexes, optimize retry ([58e5e11](https://github.com/gnoopy/instafix/commit/58e5e113e2b67e860556fa68bc8b9fc7246fcfe0))
* **widget:** minify bundle, add DB indexes, optimize retry ([d196b68](https://github.com/gnoopy/instafix/commit/d196b68b391b0c9849fee24e1f73173d7a7a6525))


### Refactoring

* **architecture:** add InstaFixStore interface, sync types ([35dda18](https://github.com/gnoopy/instafix/commit/35dda1899c137529f8be3f73411182a8ebf45264))
* **architecture:** add InstaFixStore interface, sync types ([c2afd03](https://github.com/gnoopy/instafix/commit/c2afd0353554c4277217059be94325ac60387835))
* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))


### Tests

* add 184 tests across all packages + E2E for new features ([b7f869c](https://github.com/gnoopy/instafix/commit/b7f869c119c0a76f089d4e889d5b48be8b3e06c1))


### Documentation

* update all documentation for adapter pattern and new packages ([bcdbd46](https://github.com/gnoopy/instafix/commit/bcdbd46cfe7f504f659335176e9454b66f3a4547))


### Miscellaneous

* fix stale lockfile and add missing package metadata ([369d9c0](https://github.com/gnoopy/instafix/commit/369d9c01c4c489911aefaf28245b2f1de3b92d5e))
* release main ([69156f1](https://github.com/gnoopy/instafix/commit/69156f1c65602bf866d7559647ae20687b6782d5))
* release main ([#19](https://github.com/gnoopy/instafix/issues/19)) ([c72d917](https://github.com/gnoopy/instafix/commit/c72d91717bb43049e0c1103a4a3d7f66a54a5a16))
* release main ([#20](https://github.com/gnoopy/instafix/issues/20)) ([a6e3f4d](https://github.com/gnoopy/instafix/commit/a6e3f4df54810ca0511eb301d79f8a1854ce01e0))
* release main ([#21](https://github.com/gnoopy/instafix/issues/21)) ([9867b31](https://github.com/gnoopy/instafix/commit/9867b31c226a7754120de326f11b054c97e2371a))
* release main ([#22](https://github.com/gnoopy/instafix/issues/22)) ([e1ef6a5](https://github.com/gnoopy/instafix/commit/e1ef6a58d9696bb4b565ac361b0b3944917b0bdd))
* rename repo to InstaFix and improve project presence ([c1c6e1b](https://github.com/gnoopy/instafix/commit/c1c6e1bfa3f1a00f8df3523a3e8beb26422a886a))

## [0.6.0](https://github.com/gnoopy/instafix/compare/core-v0.5.0...core-v0.6.0) (2026-04-04)


### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Features

* **core:** add store abstraction layer — errors, helpers, conformance tests ([1590f95](https://github.com/gnoopy/instafix/commit/1590f953c6f9aac9e57ef08a1417ac4c2cca0265))
* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))
* **widget:** add i18n system with French and English locales ([0fe17d7](https://github.com/gnoopy/instafix/commit/0fe17d7bae454d30b94ae48a607fba97ba353460))
* **widget:** add i18n system with French and English locales ([c41d7c4](https://github.com/gnoopy/instafix/commit/c41d7c4c23a3e618a290555120ce83a6a9b1718e))


### Bug Fixes

* comprehensive audit — 44 fixes across all packages ([60652ad](https://github.com/gnoopy/instafix/commit/60652ad03eb070fe18e2a4e943ea013f76070896))
* **core:** strengthen types, schema, and build infrastructure ([90f37f2](https://github.com/gnoopy/instafix/commit/90f37f21e35935b567a13811b026fec2590d3df4))


### Performance

* **widget:** minify bundle, add DB indexes, optimize retry ([58e5e11](https://github.com/gnoopy/instafix/commit/58e5e113e2b67e860556fa68bc8b9fc7246fcfe0))
* **widget:** minify bundle, add DB indexes, optimize retry ([d196b68](https://github.com/gnoopy/instafix/commit/d196b68b391b0c9849fee24e1f73173d7a7a6525))


### Refactoring

* **architecture:** add InstaFixStore interface, sync types ([35dda18](https://github.com/gnoopy/instafix/commit/35dda1899c137529f8be3f73411182a8ebf45264))
* **architecture:** add InstaFixStore interface, sync types ([c2afd03](https://github.com/gnoopy/instafix/commit/c2afd0353554c4277217059be94325ac60387835))
* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))


### Tests

* add 184 tests across all packages + E2E for new features ([b7f869c](https://github.com/gnoopy/instafix/commit/b7f869c119c0a76f089d4e889d5b48be8b3e06c1))


### Documentation

* update all documentation for adapter pattern and new packages ([bcdbd46](https://github.com/gnoopy/instafix/commit/bcdbd46cfe7f504f659335176e9454b66f3a4547))


### Miscellaneous

* fix stale lockfile and add missing package metadata ([369d9c0](https://github.com/gnoopy/instafix/commit/369d9c01c4c489911aefaf28245b2f1de3b92d5e))
* release main ([69156f1](https://github.com/gnoopy/instafix/commit/69156f1c65602bf866d7559647ae20687b6782d5))
* release main ([#19](https://github.com/gnoopy/instafix/issues/19)) ([c72d917](https://github.com/gnoopy/instafix/commit/c72d91717bb43049e0c1103a4a3d7f66a54a5a16))
* release main ([#20](https://github.com/gnoopy/instafix/issues/20)) ([a6e3f4d](https://github.com/gnoopy/instafix/commit/a6e3f4df54810ca0511eb301d79f8a1854ce01e0))
* release main ([#21](https://github.com/gnoopy/instafix/issues/21)) ([9867b31](https://github.com/gnoopy/instafix/commit/9867b31c226a7754120de326f11b054c97e2371a))
* rename repo to InstaFix and improve project presence ([c1c6e1b](https://github.com/gnoopy/instafix/commit/c1c6e1bfa3f1a00f8df3523a3e8beb26422a886a))

## [0.5.0](https://github.com/gnoopy/instafix/compare/core-v0.4.0...core-v0.5.0) (2026-04-04)


### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Features

* **core:** add store abstraction layer — errors, helpers, conformance tests ([1590f95](https://github.com/gnoopy/instafix/commit/1590f953c6f9aac9e57ef08a1417ac4c2cca0265))
* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))
* **widget:** add i18n system with French and English locales ([0fe17d7](https://github.com/gnoopy/instafix/commit/0fe17d7bae454d30b94ae48a607fba97ba353460))
* **widget:** add i18n system with French and English locales ([c41d7c4](https://github.com/gnoopy/instafix/commit/c41d7c4c23a3e618a290555120ce83a6a9b1718e))


### Bug Fixes

* comprehensive audit — 44 fixes across all packages ([60652ad](https://github.com/gnoopy/instafix/commit/60652ad03eb070fe18e2a4e943ea013f76070896))
* **core:** strengthen types, schema, and build infrastructure ([90f37f2](https://github.com/gnoopy/instafix/commit/90f37f21e35935b567a13811b026fec2590d3df4))


### Performance

* **widget:** minify bundle, add DB indexes, optimize retry ([58e5e11](https://github.com/gnoopy/instafix/commit/58e5e113e2b67e860556fa68bc8b9fc7246fcfe0))
* **widget:** minify bundle, add DB indexes, optimize retry ([d196b68](https://github.com/gnoopy/instafix/commit/d196b68b391b0c9849fee24e1f73173d7a7a6525))


### Refactoring

* **architecture:** add InstaFixStore interface, sync types ([35dda18](https://github.com/gnoopy/instafix/commit/35dda1899c137529f8be3f73411182a8ebf45264))
* **architecture:** add InstaFixStore interface, sync types ([c2afd03](https://github.com/gnoopy/instafix/commit/c2afd0353554c4277217059be94325ac60387835))
* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))


### Tests

* add 184 tests across all packages + E2E for new features ([b7f869c](https://github.com/gnoopy/instafix/commit/b7f869c119c0a76f089d4e889d5b48be8b3e06c1))


### Documentation

* update all documentation for adapter pattern and new packages ([bcdbd46](https://github.com/gnoopy/instafix/commit/bcdbd46cfe7f504f659335176e9454b66f3a4547))


### Miscellaneous

* fix stale lockfile and add missing package metadata ([369d9c0](https://github.com/gnoopy/instafix/commit/369d9c01c4c489911aefaf28245b2f1de3b92d5e))
* release main ([69156f1](https://github.com/gnoopy/instafix/commit/69156f1c65602bf866d7559647ae20687b6782d5))
* release main ([#19](https://github.com/gnoopy/instafix/issues/19)) ([c72d917](https://github.com/gnoopy/instafix/commit/c72d91717bb43049e0c1103a4a3d7f66a54a5a16))
* release main ([#20](https://github.com/gnoopy/instafix/issues/20)) ([a6e3f4d](https://github.com/gnoopy/instafix/commit/a6e3f4df54810ca0511eb301d79f8a1854ce01e0))
* rename repo to InstaFix and improve project presence ([c1c6e1b](https://github.com/gnoopy/instafix/commit/c1c6e1bfa3f1a00f8df3523a3e8beb26422a886a))

## [0.3.0](https://github.com/gnoopy/instafix/compare/core-v0.2.0...core-v0.3.0) (2026-04-03)

### Refactoring

* **architecture:** add InstaFixStore interface, sync types ([c2afd03](https://github.com/gnoopy/instafix/commit/c2afd0353554c4277217059be94325ac60387835))

## [0.2.0](https://github.com/gnoopy/instafix/compare/core-v0.1.0...core-v0.2.0) (2026-04-03)

### ⚠ BREAKING CHANGES

* **main:** package renamed from @gnoopy/instafix to @instafix/*

### Features

* docs, CI/CD, DX, and security improvements ([ae451e3](https://github.com/gnoopy/instafix/commit/ae451e3f883b61449fb87e965bc32d9bfb98c588))

### Refactoring

* **main:** migrate to @instafix/* monorepo with Turborepo ([e6b19a9](https://github.com/gnoopy/instafix/commit/e6b19a9675ca67eb5fc3888b45718c7e71a34b93))

### Miscellaneous

* fix stale lockfile and add missing package metadata ([369d9c0](https://github.com/gnoopy/instafix/commit/369d9c01c4c489911aefaf28245b2f1de3b92d5e))
