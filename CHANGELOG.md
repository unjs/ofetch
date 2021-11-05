# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.5](https://github.com/unjs/ohmyfetch/compare/v0.4.4...v0.4.5) (2021-11-05)


### Bug Fixes

* improve error handling for non-user errors ([6b965a5](https://github.com/unjs/ohmyfetch/commit/6b965a5206bd3eb64b86d550dbba2932495bf67d))

### [0.4.4](https://github.com/unjs/ohmyfetch/compare/v0.4.3...v0.4.4) (2021-11-04)


### Bug Fixes

* allow `retry: false` ([ce8e4d3](https://github.com/unjs/ohmyfetch/commit/ce8e4d31332403937bf7db0b45ecd54bb97c319f))

### [0.4.3](https://github.com/unjs/ohmyfetch/compare/v0.4.2...v0.4.3) (2021-11-04)


### Features

* experimental undici support ([dfa0b55](https://github.com/unjs/ohmyfetch/commit/dfa0b554c72f1fe03bf3dc3cb0f47b7d306edb63))
* **node:** pick `globalThis.fetch` when available over `node-fetch` ([54b779b](https://github.com/unjs/ohmyfetch/commit/54b779b97a6722542bdfe4b0f6dd9e82e59a7010))
* **node:** support http agent with `keepAlive` ([#22](https://github.com/unjs/ohmyfetch/issues/22)) ([18a952a](https://github.com/unjs/ohmyfetch/commit/18a952af10eb40823086837f71a921221e49c559))
* support retry and default to `1` ([ec83366](https://github.com/unjs/ohmyfetch/commit/ec83366ae3a0cbd2b2b093b92b99ef7fbb561ceb))


### Bug Fixes

* remove `at raw` from stack ([82351a8](https://github.com/unjs/ohmyfetch/commit/82351a8b6f5fea0b062bff76881bd8b740352ca8))

### [0.4.2](https://github.com/unjs/ohmyfetch/compare/v0.4.1...v0.4.2) (2021-10-22)


### Features

* **cjs:** provide `fetch` and `$fetch.raw` exports ([529af1c](https://github.com/unjs/ohmyfetch/commit/529af1c22b31b71ffe9bb21a1f13997ae7aac195))

### [0.4.1](https://github.com/unjs/ohmyfetch/compare/v0.4.0...v0.4.1) (2021-10-22)


### Bug Fixes

* avoid optional chaining for sake of webpack4 ([38a75fe](https://github.com/unjs/ohmyfetch/commit/38a75fe599a2b96d2d5fe12f2e4630ae4f17a102))

## [0.4.0](https://github.com/unjs/ohmyfetch/compare/v0.3.2...v0.4.0) (2021-10-22)


### ⚠ BREAKING CHANGES

* upgrade to node-fetch 3.x

### Features

* upgrade to node-fetch 3.x ([ec51edf](https://github.com/unjs/ohmyfetch/commit/ec51edf1fd53e4ab4ef99ec3253ea95353abb50e))

### [0.3.2](https://github.com/unjs/ohmyfetch/compare/v0.3.1...v0.3.2) (2021-10-22)


### Features

* allow for custom response parser with `parseResponse` ([#16](https://github.com/unjs/ohmyfetch/issues/16)) ([463ced6](https://github.com/unjs/ohmyfetch/commit/463ced66c4d12f8d380d0bca2c5ff2febf38af7e))


### Bug Fixes

* check for `globalThis` before fallback to shims ([#20](https://github.com/unjs/ohmyfetch/issues/20)) ([b5c0c3b](https://github.com/unjs/ohmyfetch/commit/b5c0c3bb38289a83164570ffa7458c3f47c6d41b))

### [0.3.1](https://github.com/unjs/ohmyfetch/compare/v0.3.0...v0.3.1) (2021-08-26)


### Bug Fixes

* include typings ([#12](https://github.com/unjs/ohmyfetch/issues/12)) ([2d9a9e9](https://github.com/unjs/ohmyfetch/commit/2d9a9e921ab42756f6420b728bc5f47447d59df3))

## [0.3.0](https://github.com/unjs/ohmyfetch/compare/v0.2.0...v0.3.0) (2021-08-25)


### ⚠ BREAKING CHANGES

* use export condition to automatically use node-fetch

### Features

* direct export fetch implementation ([65b27dd](https://github.com/unjs/ohmyfetch/commit/65b27ddb863790af8637b9da1c50c8fba14a295d))
* use export condition to automatically use node-fetch ([b81082b](https://github.com/unjs/ohmyfetch/commit/b81082b6ab1b8e89fa620699c4f9206101230805))

## [0.2.0](https://github.com/unjs/ohmyfetch/compare/v0.1.8...v0.2.0) (2021-04-06)


### ⚠ BREAKING CHANGES

* don't inline dependencies

### Features

* don't inline dependencies ([cf3578b](https://github.com/unjs/ohmyfetch/commit/cf3578baf265e1044f22c4ba42b227831c6fd183))

### [0.1.8](https://github.com/unjs/ohmyfetch/compare/v0.1.7...v0.1.8) (2021-02-22)


### Bug Fixes

* **pkg:** add top level node.d.ts ([dcc1358](https://github.com/unjs/ohmyfetch/commit/dcc13582747ba8404dd26b48d3db755b7775b78b))

### [0.1.7](https://github.com/unjs/ohmyfetch/compare/v0.1.6...v0.1.7) (2021-02-19)


### Features

* support automatic json body for post requests ([#7](https://github.com/unjs/ohmyfetch/issues/7)) ([97d0987](https://github.com/unjs/ohmyfetch/commit/97d0987131e006e72aac6d1d4acb063f3e53953d))

### [0.1.6](https://github.com/unjs/ohmyfetch/compare/v0.1.5...v0.1.6) (2021-01-12)

### [0.1.5](https://github.com/unjs/ohmyfetch/compare/v0.1.4...v0.1.5) (2021-01-04)


### Bug Fixes

* **pkg:** use same export names for incompatible tools ([7fc450a](https://github.com/unjs/ohmyfetch/commit/7fc450ac81596de1dea53380dc9ef3ae8ceb2304))

### [0.1.4](https://github.com/unjs/ohmyfetch/compare/v0.1.3...v0.1.4) (2020-12-16)


### Features

* update ufo to 0.5 (reducing bundle size) ([837707d](https://github.com/unjs/ohmyfetch/commit/837707d2ed03a7c6e69127849bf0c25ae182982d))

### [0.1.3](https://github.com/unjs/ohmyfetch/compare/v0.1.2...v0.1.3) (2020-12-16)


### Bug Fixes

* ufo 0.3.1 ([e56e73e](https://github.com/unjs/ohmyfetch/commit/e56e73e90bb6ad9be88f7c8413053744a64c702e))

### [0.1.2](https://github.com/unjs/ohmyfetch/compare/v0.1.1...v0.1.2) (2020-12-16)


### Bug Fixes

* update ufo to 0.3 ([52d84e7](https://github.com/unjs/ohmyfetch/commit/52d84e75034c3c6fd7542b2829e06f6d87f069c2))

### [0.1.1](https://github.com/unjs/ohmyfetch/compare/v0.0.7...v0.1.1) (2020-12-12)


### Bug Fixes

* preserve params when using baseURL ([c3a63e2](https://github.com/unjs/ohmyfetch/commit/c3a63e2b337b09b082eb9faf8e23e818d866c49c))

### [0.0.7](https://github.com/unjs/ohmyfetch/compare/v0.0.6...v0.0.7) (2020-12-12)

### [0.0.6](https://github.com/unjs/ohmyfetch/compare/v0.0.5...v0.0.6) (2020-12-12)


### Bug Fixes

* **pkg:** fix top level named exports ([0b51462](https://github.com/unjs/ohmyfetch/commit/0b514620dcfa65d156397114b87ed5e4f28e33a1))

### [0.0.5](https://github.com/unjs/ohmyfetch/compare/v0.0.4...v0.0.5) (2020-12-12)


### Bug Fixes

* **pkg:** fix ./node in exports ([c6b27b7](https://github.com/unjs/ohmyfetch/commit/c6b27b7cb61d66444f3d43bfa5226057ec7a9c95))

### [0.0.4](https://github.com/unjs/ohmyfetch/compare/v0.0.3...v0.0.4) (2020-12-12)


### Features

* support params ([e6a56ff](https://github.com/unjs/ohmyfetch/commit/e6a56ff083244fac918e29058aaf28bf87c98384))

### [0.0.3](https://github.com/unjs/ohmyfetch/compare/v0.0.2...v0.0.3) (2020-12-12)


### Features

* bundle ufo and destr for easier bundler integration ([8f5ba88](https://github.com/unjs/ohmyfetch/commit/8f5ba88f1ac0aa40ff2c99316da98a71d6dcc7e8))
* support `$fetch.raw` and improve docs ([f9f70a5](https://github.com/unjs/ohmyfetch/commit/f9f70a59222bc0d0166cbe9a03eebf2a73682398))

### [0.0.2](https://github.com/unjs/ohmyfetch/compare/v0.0.1...v0.0.2) (2020-12-09)


### Bug Fixes

* **pkg:** add top level dist ([6da17ca](https://github.com/unjs/ohmyfetch/commit/6da17cad07e08cff9e5ea9e8b505638d560bcb47))

### 0.0.1 (2020-12-09)


### Features

* universal + isomorphic builds ([a873702](https://github.com/unjs/ohmyfetch/commit/a873702c336c7ecce87c506d81c146db9f7516d0))
