# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v1.5.0

[compare changes](https://github.com/unjs/ofetch/compare/v1.4.1...v1.5.0)

### 🚀 Enhancements

- Serialize with `URLSearchParams` for `application/x-www-form-urlencoded` content type header ([#482](https://github.com/unjs/ofetch/pull/482))
- Auto detect `text/event-stream` as `stream` response type ([#486](https://github.com/unjs/ofetch/pull/486))

### 🩹 Fixes

- Mark `FormData` & `URLSearchParams` as non-serializable for bun compatibility ([#483](https://github.com/unjs/ofetch/pull/483))

### 💅 Refactors

- Deprecate `params` in favor of `query` ([#511](https://github.com/unjs/ofetch/pull/511))

### 📖 Documentation

- **readme:** Use `ProxyAgent` in example ([#465](https://github.com/unjs/ofetch/pull/465))
- Fix typo ([#472](https://github.com/unjs/ofetch/pull/472))
- Add `retryStatusCodes` option to auto retry example ([#480](https://github.com/unjs/ofetch/pull/480))
- Guide on augmenting `FetchOptions` ([#487](https://github.com/unjs/ofetch/pull/487))
- Replace ProxyAgent with Agent in self-signed certs example ([#516](https://github.com/unjs/ofetch/pull/516))

### 🏡 Chore

- Update deps ([5b40e65](https://github.com/unjs/ofetch/commit/5b40e65))
- Fix lint issue ([630f9f8](https://github.com/unjs/ofetch/commit/630f9f8))
- Fix typos ([#452](https://github.com/unjs/ofetch/pull/452))
- Update deps ([c35e71e](https://github.com/unjs/ofetch/commit/c35e71e))
- Update ci ([d146a87](https://github.com/unjs/ofetch/commit/d146a87))
- Update docs ([#501](https://github.com/unjs/ofetch/pull/501))
- Fix test coverage ([1c7c34d](https://github.com/unjs/ofetch/commit/1c7c34d))
- Update deps ([560dcd4](https://github.com/unjs/ofetch/commit/560dcd4))
- Prepare v1 branch ([bec1985](https://github.com/unjs/ofetch/commit/bec1985))
- Remove node 18 from ci matrix ([38dd116](https://github.com/unjs/ofetch/commit/38dd116))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Eugene ([@outslept](https://github.com/outslept))
- Kricsleo ([@kricsleo](https://github.com/kricsleo))
- Robin <robin.kehl@singular-it.de>
- Abeer0 ([@iiio2](https://github.com/iiio2))
- Kanon ([@ysknsid25](https://github.com/ysknsid25))
- @beer ([@iiio2](https://github.com/iiio2))
- Jan-Henrik Damaschke <jdamaschke@outlook.de>

## v1.4.1

[compare changes](https://github.com/unjs/ofetch/compare/v1.4.0...v1.4.1)

### 🩹 Fixes

- Remove undefined `method` and `query`/`params` from fetch options ([#451](https://github.com/unjs/ofetch/pull/451))
- Use `response._bodyInit` as fallback for react-native and qq ([#398](https://github.com/unjs/ofetch/pull/398))

### 🏡 Chore

- **examples:** Fix typos ([#450](https://github.com/unjs/ofetch/pull/450))
- Update dependencies ([caaf04d](https://github.com/unjs/ofetch/commit/caaf04d))
- Update eslint config ([b4c9990](https://github.com/unjs/ofetch/commit/b4c9990))

### ✅ Tests

- Fix typo ([#448](https://github.com/unjs/ofetch/pull/448))

### ❤️ Contributors

- Joshua Sosso ([@joshmossas](http://github.com/joshmossas))
- Pooya Parsa ([@pi0](http://github.com/pi0))
- @beer ([@iiio2](http://github.com/iiio2))
- Cooper Roper <cooproper@hotmail.com>

## v1.4.0

[compare changes](https://github.com/unjs/ofetch/compare/v1.3.4...v1.4.0)

### 🚀 Enhancements

- Support `retryDelay` with callback function ([#372](https://github.com/unjs/ofetch/pull/372))
- Add better message and code for timeout error ([#351](https://github.com/unjs/ofetch/pull/351))
- Allow custom global options for `$fetch.create` ([#401](https://github.com/unjs/ofetch/pull/401))
- Support interceptors arrays ([#353](https://github.com/unjs/ofetch/pull/353))
- Always clone and normalize `options.headers` and `options.query` ([#436](https://github.com/unjs/ofetch/pull/436))

### 🩹 Fixes

- Export types from `node` export condition ([#407](https://github.com/unjs/ofetch/pull/407))
- Use wrapper to allow patching global `fetch` ([#377](https://github.com/unjs/ofetch/pull/377))

### 📖 Documentation

- Add docs for using undici dispatcher ([#389](https://github.com/unjs/ofetch/pull/389))

### 🌊 Types

- Add `agent` and `dispatcher` options (node-specific) ([#308](https://github.com/unjs/ofetch/pull/308))

### 🏡 Chore

- **release:** V1.3.4 ([5cc16a0](https://github.com/unjs/ofetch/commit/5cc16a0))
- Remove extra space ([#384](https://github.com/unjs/ofetch/pull/384))
- Update deps ([509a037](https://github.com/unjs/ofetch/commit/509a037))
- Update to eslint v9 ([e63c598](https://github.com/unjs/ofetch/commit/e63c598))
- Apply automated fixes ([f8f5413](https://github.com/unjs/ofetch/commit/f8f5413))
- Add back spoiler ([dba1915](https://github.com/unjs/ofetch/commit/dba1915))
- Add experimental for `Too Early` status ([#426](https://github.com/unjs/ofetch/pull/426))
- Update dependencies ([b5fe505](https://github.com/unjs/ofetch/commit/b5fe505))
- Update deps ([20f67b9](https://github.com/unjs/ofetch/commit/20f67b9))

### ✅ Tests

- Add additional tests for hook errors ([7ff4d11](https://github.com/unjs/ofetch/commit/7ff4d11))

### 🤖 CI

- Update node version ([4faac04](https://github.com/unjs/ofetch/commit/4faac04))
- Update autifix ([79483ab](https://github.com/unjs/ofetch/commit/79483ab))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Antoine Rey <antoinerey38@gmail.com>
- Cafu Chino <kirino@cafuchino.cn>
- Marco Solazzi <marco.solazzi@gmail.com>
- @beer ([@iiio2](http://github.com/iiio2))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Arlo <webfansplz@gmail.com>
- Alexander Topalo <topaloalexander@gmail.com>
- Sam Blowes <samblowes@hotmail.com>
- Kongmoumou ([@kongmoumou](http://github.com/kongmoumou))

## v1.3.4

[compare changes](https://github.com/unjs/ofetch/compare/v1.3.3...v1.3.4)

### 🚀 Enhancements

- Export all types ([#280](https://github.com/unjs/ofetch/pull/280))
- Expose `GlobalOptions` type ([#307](https://github.com/unjs/ofetch/pull/307))

### 🩹 Fixes

- Clear abort timeout after response was received ([#369](https://github.com/unjs/ofetch/pull/369))

### 💅 Refactors

- Remove extra line ([#374](https://github.com/unjs/ofetch/pull/374))

### 📖 Documentation

- Add initial examples ([#288](https://github.com/unjs/ofetch/pull/288))

### 📦 Build

- Add top level `react-native` field ([03680dd](https://github.com/unjs/ofetch/commit/03680dd))

### 🏡 Chore

- **release:** V1.3.3 ([31c61c1](https://github.com/unjs/ofetch/commit/31c61c1))
- Update dependencies ([308f03f](https://github.com/unjs/ofetch/commit/308f03f))
- Ignore conflicting ts error for now ([3a73165](https://github.com/unjs/ofetch/commit/3a73165))
- Improve docs ([173d5b9](https://github.com/unjs/ofetch/commit/173d5b9))
- Remove lagon ([#346](https://github.com/unjs/ofetch/pull/346))
- Update lockfile ([4b6d1ba](https://github.com/unjs/ofetch/commit/4b6d1ba))
- Fix build error ([472c4d9](https://github.com/unjs/ofetch/commit/472c4d9))
- Update node-fetch-native ([fa2cc07](https://github.com/unjs/ofetch/commit/fa2cc07))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Alex Liu ([@Mini-ghost](http://github.com/Mini-ghost))
- Danila Rodichkin ([@daniluk4000](http://github.com/daniluk4000))
- Maxime Pauvert ([@maximepvrt](http://github.com/maximepvrt))
- Estéban ([@Barbapapazes](http://github.com/Barbapapazes))
- Saman <bounoable@gmail.com>

## v1.3.3

[compare changes](https://github.com/unjs/ofetch/compare/v1.3.2...v1.3.3)

### 🩹 Fixes

- Augment `FetchError` type to include `IFetchError` ([#279](https://github.com/unjs/ofetch/pull/279))

### ❤️ Contributors

- Johann Schopplich ([@johannschopplich](http://github.com/johannschopplich))

## v1.3.2

[compare changes](https://github.com/unjs/ofetch/compare/v1.3.1...v1.3.2)

### 🩹 Fixes

- Hide getters from console and pass `cause` ([905244a](https://github.com/unjs/ofetch/commit/905244a))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.3.1

[compare changes](https://github.com/unjs/ofetch/compare/v1.3.0...v1.3.1)

### 🏡 Chore

- Update dependencies ([c72976f](https://github.com/unjs/ofetch/commit/c72976f))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.3.0

[compare changes](https://github.com/unjs/ofetch/compare/v1.2.1...v1.3.0)

### 🚀 Enhancements

- Support customizable `retryStatusCodes` ([#109](https://github.com/unjs/ofetch/pull/109))
- Add `options` field and improve formatting of errors ([#270](https://github.com/unjs/ofetch/pull/270))
- Automatically enable duplex to stream request body ([#275](https://github.com/unjs/ofetch/pull/275))

### 🩹 Fixes

- Avoid binding `.native` to `$fetch` ([#272](https://github.com/unjs/ofetch/pull/272))
- Skip reading body with `204` responses and `HEAD` requests ([#171](https://github.com/unjs/ofetch/pull/171), [#84](https://github.com/unjs/ofetch/pull/84))
- Improve response body check for node 16 compatibility ([64d3aed](https://github.com/unjs/ofetch/commit/64d3aed))
- Avoid serializing buffer body ([#273](https://github.com/unjs/ofetch/pull/273))
- Move body handling out of request block ([15a28fb](https://github.com/unjs/ofetch/commit/15a28fb))

### 💅 Refactors

- Remove unused `response?: boolean` option ([#223](https://github.com/unjs/ofetch/pull/223))
- Pass all fetch context to the error ([b70e6b0](https://github.com/unjs/ofetch/commit/b70e6b0))
- **error:** Factory pattern for getters ([6139785](https://github.com/unjs/ofetch/commit/6139785))

### 📖 Documentation

- Improve explanation about `body` option ([#276](https://github.com/unjs/ofetch/pull/276))

### 🏡 Chore

- **release:** V1.2.1 ([bb98cb5](https://github.com/unjs/ofetch/commit/bb98cb5))
- Remove accidental `raw` response type addition ([8589cae](https://github.com/unjs/ofetch/commit/8589cae))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Nozomu Ikuta 
- Daniil Bezuglov

## v1.2.1

[compare changes](https://github.com/unjs/ofetch/compare/v1.2.0...v1.2.1)

### 📦 Build

- Add missing `node` export condition ([4081170](https://github.com/unjs/ofetch/commit/4081170))

### 🏡 Chore

- Update dependencies ([d18584d](https://github.com/unjs/ofetch/commit/d18584d))

### ✅ Tests

- Speedup with background close ([567fb35](https://github.com/unjs/ofetch/commit/567fb35))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.2.0

[compare changes](https://github.com/unjs/ofetch/compare/v1.1.1...v1.2.0)

### 🚀 Enhancements

- Support `retryDelay` ([#262](https://github.com/unjs/ofetch/pull/262))
- Support `timeout` and `AbortController` ([#268](https://github.com/unjs/ofetch/pull/268))

### 🩹 Fixes

- Always uppercase `method` option ([#259](https://github.com/unjs/ofetch/pull/259))
- **pkg:** Fix ts type resolution for `/node` subpath ([#256](https://github.com/unjs/ofetch/pull/256))
- Make all `createFetch` options optional ([#266](https://github.com/unjs/ofetch/pull/266))

### 📖 Documentation

- Clarify retry behavior ([#264](https://github.com/unjs/ofetch/pull/264))
- Fix typo ([de66aad](https://github.com/unjs/ofetch/commit/de66aad))

### 🏡 Chore

- Update dev dependencies ([8fc7d96](https://github.com/unjs/ofetch/commit/8fc7d96))
- **release:** V1.1.1 ([41c3b56](https://github.com/unjs/ofetch/commit/41c3b56))
- Update dependencies ([db2434c](https://github.com/unjs/ofetch/commit/db2434c))
- Add autofix ci ([a953a33](https://github.com/unjs/ofetch/commit/a953a33))
- Apply automated fixes ([bbdfb9c](https://github.com/unjs/ofetch/commit/bbdfb9c))

### ✅ Tests

- Update tests ([db2ad50](https://github.com/unjs/ofetch/commit/db2ad50))

### 🎨 Styles

- Lint code ([b3c6a96](https://github.com/unjs/ofetch/commit/b3c6a96))
- Lint repo with prettier ([2be558c](https://github.com/unjs/ofetch/commit/2be558c))

### ❤️ Contributors

- Daniil Bezuglov 
- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Tmk ([@tmkx](http://github.com/tmkx))
- Murisceman <murisceman@gmail.com>
- Heb ([@Hebilicious](http://github.com/Hebilicious))

## v1.1.1

[compare changes](https://github.com/unjs/ofetch/compare/v1.1.0...v1.1.1)


### 🏡 Chore

  - Update dev dependencies ([8fc7d96](https://github.com/unjs/ofetch/commit/8fc7d96))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.0

[compare changes](https://github.com/unjs/ofetch/compare/v1.0.1...v1.1.0)


### 🚀 Enhancements

  - Support `ignoreResponseError` option ([#221](https://github.com/unjs/ofetch/pull/221))
  - **pkg:** Add export conditions for runtime keys ([#246](https://github.com/unjs/ofetch/pull/246))

### 🩹 Fixes

  - Pass empty object to headers initializer to prevent crash on chrome 49 ([#235](https://github.com/unjs/ofetch/pull/235))
  - Export `ResponseMap` type to allow composition of `ofetch` ([#232](https://github.com/unjs/ofetch/pull/232))
  - Fix issues with native node fetch ([#245](https://github.com/unjs/ofetch/pull/245))
  - **pkg:** Add `./package.json` subpath ([253707a](https://github.com/unjs/ofetch/commit/253707a))
  - Deep merge fetch options ([#243](https://github.com/unjs/ofetch/pull/243))

### 📖 Documentation

  - **readme:** Use `_data` rather than `data` for raw requests ([#239](https://github.com/unjs/ofetch/pull/239))
  - Mention `DELETE` is no-retry be default ([#241](https://github.com/unjs/ofetch/pull/241))

### 🏡 Chore

  - **readme:** Small improvements ([65921a1](https://github.com/unjs/ofetch/commit/65921a1))

### 🤖 CI

  - Enable tests against node `16`, `18` and `20` ([351fc80](https://github.com/unjs/ofetch/commit/351fc80))

### ❤️  Contributors

- Dennis Meuwissen 
- Pooya Parsa ([@pi0](http://github.com/pi0))
- Alex Korytskyi ([@alex-key](http://github.com/alex-key))
- Arunanshu Biswas 
- Jonathan Bakebwa <codebender828@gmail.com>
- Ilya Semenov ([@IlyaSemenov](http://github.com/IlyaSemenov))
- _lmmmmmm <lmmmmmm12138@gmail.com>
- Jonas Thelemann ([@dargmuesli](http://github.com/dargmuesli))
- Sébastien Chopin <seb@nuxtjs.com>

## v1.0.1

[compare changes](https://github.com/unjs/ofetch/compare/v1.0.0...v1.0.1)


### 🩹 Fixes

  - Improve error message for request errors ([#199](https://github.com/unjs/ofetch/pull/199))

### 📖 Documentation

  - Fix small typos ([#200](https://github.com/unjs/ofetch/pull/200))
  - Fix typo ([#175](https://github.com/unjs/ofetch/pull/175))
  - Add agent option usage ([#173](https://github.com/unjs/ofetch/pull/173))
  - Add note about http agent ([#202](https://github.com/unjs/ofetch/pull/202))

### 📦 Build

  - Use standalone commonjs dist ([#211](https://github.com/unjs/ofetch/pull/211))

### 🏡 Chore

  - Update lockfile ([67a7fa4](https://github.com/unjs/ofetch/commit/67a7fa4))
  - Remove build badge ([9a878b6](https://github.com/unjs/ofetch/commit/9a878b6))
  - Update ufo ([3776210](https://github.com/unjs/ofetch/commit/3776210))
  - Update release script ([50a58ab](https://github.com/unjs/ofetch/commit/50a58ab))

### 🎨 Styles

  - Format with prettier ([aabfb9a](https://github.com/unjs/ofetch/commit/aabfb9a))

### ❤️  Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel West <daniel@silverback.is>
- Sébastien Chopin <seb@nuxtjs.com>
- Nozomu Ikuta 
- Yuyin 
- Kricsleo 
- 0xflotus <0xflotus@gmail.com>

## [1.0.0](https://github.com/unjs/ofetch/compare/v0.4.21...v1.0.0) (2022-11-15)


### ⚠ BREAKING CHANGES

* drop undici support

### Features

* expose `$fetch.native` ([ff697d7](https://github.com/unjs/ofetch/commit/ff697d7b4a43c4399897b69097485b3785dfd661))
* expose `ofetch` named export ([d8fc46f](https://github.com/unjs/ofetch/commit/d8fc46f21a51f0aac75118905fb999a62d46c793))


* drop undici support ([c7d8c93](https://github.com/unjs/ofetch/commit/c7d8c93b1dc9af6f556b713d63787d4295709908))

### [0.4.21](https://github.com/unjs/ofetch/compare/v0.4.20...v0.4.21) (2022-11-03)


### Features

* add `status` and `statusText` to fetch errors ([#152](https://github.com/unjs/ofetch/issues/152)) ([784a7c0](https://github.com/unjs/ofetch/commit/784a7c0524a60406b0ba09055502107ef57ef5c9))


### Bug Fixes

* only call error handler if status code is >= 400 ([#153](https://github.com/unjs/ofetch/issues/153)) ([385f7fe](https://github.com/unjs/ofetch/commit/385f7fe9c92d1ee614919c0ce3a9586acf031d05))

### [0.4.20](https://github.com/unjs/ofetch/compare/v0.4.19...v0.4.20) (2022-10-17)


### Bug Fixes

* add backwards-compatible subpath declarations ([#144](https://github.com/unjs/ofetch/issues/144)) ([3a48c21](https://github.com/unjs/ofetch/commit/3a48c21a0a5deb41be7ca8e9ea176c49e6d6ba56))
* **types:** allow synchronous interceptors to be passed ([#128](https://github.com/unjs/ofetch/issues/128)) ([46e8f3c](https://github.com/unjs/ofetch/commit/46e8f3c70bbae09b123db42ab868631cdf9a45af))

### [0.4.19](https://github.com/unjs/ofetch/compare/v0.4.18...v0.4.19) (2022-09-19)


### Features

* support `responseType: 'stream'` as `ReadableStream` ([#100](https://github.com/unjs/ofetch/issues/100)) ([5a19f73](https://github.com/unjs/ofetch/commit/5a19f73e97b13b6679ee2c75ad10b87480599d9b))


### Bug Fixes

* do not retry when fetch is aborted ([#112](https://github.com/unjs/ofetch/issues/112)) ([b73fe67](https://github.com/unjs/ofetch/commit/b73fe67aaa7d5d5b1a283b653e7cd7fb30a4cc21))

### [0.4.18](https://github.com/unjs/ofetch/compare/v0.4.17...v0.4.18) (2022-05-20)


### Bug Fixes

* only serialize JSON bodies ([#80](https://github.com/unjs/ofetch/issues/80)) ([dc237d4](https://github.com/unjs/ofetch/commit/dc237d489a68936996c9ab95dce35ca9e0d2b2e4))

### [0.4.17](https://github.com/unjs/ofetch/compare/v0.4.16...v0.4.17) (2022-05-11)


### Features

* use `node-fetch-native` ([a881acb](https://github.com/unjs/ofetch/commit/a881acb4067406092e25a1f97ff576040e279bce))

### [0.4.16](https://github.com/unjs/ofetch/compare/v0.4.15...v0.4.16) (2022-04-29)


### Bug Fixes

* generalise `application/json` content types ([#75](https://github.com/unjs/ofetch/issues/75)) ([adaa03b](https://github.com/unjs/ofetch/commit/adaa03b56bf17df2a9a69eb471e84460e0d1ad12))

### [0.4.15](https://github.com/unjs/ofetch/compare/v0.4.14...v0.4.15) (2022-01-18)


### Bug Fixes

* use `_data` rather than `data` to store deserialized response ([#49](https://github.com/unjs/ofetch/issues/49)) ([babb331](https://github.com/unjs/ofetch/commit/babb331c3c2dc52d682f87b3c2c660d23cf056b3))

### [0.4.14](https://github.com/unjs/ofetch/compare/v0.4.13...v0.4.14) (2021-12-22)


### Bug Fixes

* avoid calling `fetch` with `globalOptions` context ([8ea2d2b](https://github.com/unjs/ofetch/commit/8ea2d2b5f9dcda333de5824862a7377085fd8bb4))

### [0.4.13](https://github.com/unjs/ofetch/compare/v0.4.12...v0.4.13) (2021-12-21)


### Features

* `$fetch.create` support ([d7fb8f6](https://github.com/unjs/ofetch/commit/d7fb8f688c2b3f574430b40f7139ee144850be23))
* initial interceptor support (resolves [#19](https://github.com/unjs/ofetch/issues/19)) ([1bf2dd9](https://github.com/unjs/ofetch/commit/1bf2dd928935b79b13a4e7a8fbd93365b082835f))

### [0.4.12](https://github.com/unjs/ofetch/compare/v0.4.11...v0.4.12) (2021-12-21)


### Bug Fixes

* avoid overriding headers ([4b74e45](https://github.com/unjs/ofetch/commit/4b74e45f9989a993e725e7fe4d2e098442e457f1)), closes [#40](https://github.com/unjs/ofetch/issues/40) [#41](https://github.com/unjs/ofetch/issues/41)
* only retry on known response codes (resolves [#31](https://github.com/unjs/ofetch/issues/31)) ([f7fff24](https://github.com/unjs/ofetch/commit/f7fff24acfde76029051fe26a88f993518a95735))

### [0.4.11](https://github.com/unjs/ofetch/compare/v0.4.10...v0.4.11) (2021-12-17)


### Features

* return blob if `content-type` isn't text, svg, xml or json ([#39](https://github.com/unjs/ofetch/issues/39)) ([1029b9e](https://github.com/unjs/ofetch/commit/1029b9e2c982991d21d77ea33036d7c20a4536bb))

### [0.4.10](https://github.com/unjs/ofetch/compare/v0.4.9...v0.4.10) (2021-12-14)


### Bug Fixes

* avoid optional chaining ([931d12d](https://github.com/unjs/ofetch/commit/931d12d945d5bc014b34f46d93a627dbb4eda3a7))

### [0.4.9](https://github.com/unjs/ofetch/compare/v0.4.8...v0.4.9) (2021-12-14)


### Features

* improve json body handling ([4adb3bc](https://github.com/unjs/ofetch/commit/4adb3bc38d9423507ccdcd895b62a3a7d95f4144)), closes [#36](https://github.com/unjs/ofetch/issues/36)

### [0.4.8](https://github.com/unjs/ofetch/compare/v0.4.7...v0.4.8) (2021-11-22)


### Bug Fixes

* add accept header when using json payload ([#30](https://github.com/unjs/ofetch/issues/30)) ([662145f](https://github.com/unjs/ofetch/commit/662145f8b74a18ba7d07e8eb6f3fd1af91941a22))

### [0.4.7](https://github.com/unjs/ofetch/compare/v0.4.6...v0.4.7) (2021-11-18)


### Bug Fixes

* use `application/json` for array body  ([#29](https://github.com/unjs/ofetch/issues/29)) ([e794b1e](https://github.com/unjs/ofetch/commit/e794b1e4644f803e9c18c8813c432b29c7f9ef33))

### [0.4.6](https://github.com/unjs/ofetch/compare/v0.4.5...v0.4.6) (2021-11-10)


### Bug Fixes

* add check for using `Error.captureStackTrace` ([#27](https://github.com/unjs/ofetch/issues/27)) ([0c55e1e](https://github.com/unjs/ofetch/commit/0c55e1ec1bf21fcb3a7fc6ed570956b4dfba80d5))
* remove baseurl append on retry ([#25](https://github.com/unjs/ofetch/issues/25)) ([7e1b54d](https://github.com/unjs/ofetch/commit/7e1b54d1363ba3f5fe57fe8089babab921a8e9ea))

### [0.4.5](https://github.com/unjs/ofetch/compare/v0.4.4...v0.4.5) (2021-11-05)


### Bug Fixes

* improve error handling for non-user errors ([6b965a5](https://github.com/unjs/ofetch/commit/6b965a5206bd3eb64b86d550dbba2932495bf67d))

### [0.4.4](https://github.com/unjs/ofetch/compare/v0.4.3...v0.4.4) (2021-11-04)


### Bug Fixes

* allow `retry: false` ([ce8e4d3](https://github.com/unjs/ofetch/commit/ce8e4d31332403937bf7db0b45ecd54bb97c319f))

### [0.4.3](https://github.com/unjs/ofetch/compare/v0.4.2...v0.4.3) (2021-11-04)


### Features

* experimental undici support ([dfa0b55](https://github.com/unjs/ofetch/commit/dfa0b554c72f1fe03bf3dc3cb0f47b7d306edb63))
* **node:** pick `globalThis.fetch` when available over `node-fetch` ([54b779b](https://github.com/unjs/ofetch/commit/54b779b97a6722542bdfe4b0f6dd9e82e59a7010))
* **node:** support http agent with `keepAlive` ([#22](https://github.com/unjs/ofetch/issues/22)) ([18a952a](https://github.com/unjs/ofetch/commit/18a952af10eb40823086837f71a921221e49c559))
* support retry and default to `1` ([ec83366](https://github.com/unjs/ofetch/commit/ec83366ae3a0cbd2b2b093b92b99ef7fbb561ceb))


### Bug Fixes

* remove `at raw` from stack ([82351a8](https://github.com/unjs/ofetch/commit/82351a8b6f5fea0b062bff76881bd8b740352ca8))

### [0.4.2](https://github.com/unjs/ofetch/compare/v0.4.1...v0.4.2) (2021-10-22)


### Features

* **cjs:** provide `fetch` and `$fetch.raw` exports ([529af1c](https://github.com/unjs/ofetch/commit/529af1c22b31b71ffe9bb21a1f13997ae7aac195))

### [0.4.1](https://github.com/unjs/ofetch/compare/v0.4.0...v0.4.1) (2021-10-22)


### Bug Fixes

* avoid optional chaining for sake of webpack4 ([38a75fe](https://github.com/unjs/ofetch/commit/38a75fe599a2b96d2d5fe12f2e4630ae4f17a102))

## [0.4.0](https://github.com/unjs/ofetch/compare/v0.3.2...v0.4.0) (2021-10-22)


### ⚠ BREAKING CHANGES

* upgrade to node-fetch 3.x

### Features

* upgrade to node-fetch 3.x ([ec51edf](https://github.com/unjs/ofetch/commit/ec51edf1fd53e4ab4ef99ec3253ea95353abb50e))

### [0.3.2](https://github.com/unjs/ofetch/compare/v0.3.1...v0.3.2) (2021-10-22)


### Features

* allow for custom response parser with `parseResponse` ([#16](https://github.com/unjs/ofetch/issues/16)) ([463ced6](https://github.com/unjs/ofetch/commit/463ced66c4d12f8d380d0bca2c5ff2febf38af7e))


### Bug Fixes

* check for `globalThis` before fallback to shims ([#20](https://github.com/unjs/ofetch/issues/20)) ([b5c0c3b](https://github.com/unjs/ofetch/commit/b5c0c3bb38289a83164570ffa7458c3f47c6d41b))

### [0.3.1](https://github.com/unjs/ofetch/compare/v0.3.0...v0.3.1) (2021-08-26)


### Bug Fixes

* include typings ([#12](https://github.com/unjs/ofetch/issues/12)) ([2d9a9e9](https://github.com/unjs/ofetch/commit/2d9a9e921ab42756f6420b728bc5f47447d59df3))

## [0.3.0](https://github.com/unjs/ofetch/compare/v0.2.0...v0.3.0) (2021-08-25)


### ⚠ BREAKING CHANGES

* use export condition to automatically use node-fetch

### Features

* direct export fetch implementation ([65b27dd](https://github.com/unjs/ofetch/commit/65b27ddb863790af8637b9da1c50c8fba14a295d))
* use export condition to automatically use node-fetch ([b81082b](https://github.com/unjs/ofetch/commit/b81082b6ab1b8e89fa620699c4f9206101230805))

## [0.2.0](https://github.com/unjs/ofetch/compare/v0.1.8...v0.2.0) (2021-04-06)


### ⚠ BREAKING CHANGES

* don't inline dependencies

### Features

* don't inline dependencies ([cf3578b](https://github.com/unjs/ofetch/commit/cf3578baf265e1044f22c4ba42b227831c6fd183))

### [0.1.8](https://github.com/unjs/ofetch/compare/v0.1.7...v0.1.8) (2021-02-22)


### Bug Fixes

* **pkg:** add top level node.d.ts ([dcc1358](https://github.com/unjs/ofetch/commit/dcc13582747ba8404dd26b48d3db755b7775b78b))

### [0.1.7](https://github.com/unjs/ofetch/compare/v0.1.6...v0.1.7) (2021-02-19)


### Features

* support automatic json body for post requests ([#7](https://github.com/unjs/ofetch/issues/7)) ([97d0987](https://github.com/unjs/ofetch/commit/97d0987131e006e72aac6d1d4acb063f3e53953d))

### [0.1.6](https://github.com/unjs/ofetch/compare/v0.1.5...v0.1.6) (2021-01-12)

### [0.1.5](https://github.com/unjs/ofetch/compare/v0.1.4...v0.1.5) (2021-01-04)


### Bug Fixes

* **pkg:** use same export names for incompatible tools ([7fc450a](https://github.com/unjs/ofetch/commit/7fc450ac81596de1dea53380dc9ef3ae8ceb2304))

### [0.1.4](https://github.com/unjs/ofetch/compare/v0.1.3...v0.1.4) (2020-12-16)


### Features

* update ufo to 0.5 (reducing bundle size) ([837707d](https://github.com/unjs/ofetch/commit/837707d2ed03a7c6e69127849bf0c25ae182982d))

### [0.1.3](https://github.com/unjs/ofetch/compare/v0.1.2...v0.1.3) (2020-12-16)


### Bug Fixes

* ufo 0.3.1 ([e56e73e](https://github.com/unjs/ofetch/commit/e56e73e90bb6ad9be88f7c8413053744a64c702e))

### [0.1.2](https://github.com/unjs/ofetch/compare/v0.1.1...v0.1.2) (2020-12-16)


### Bug Fixes

* update ufo to 0.3 ([52d84e7](https://github.com/unjs/ofetch/commit/52d84e75034c3c6fd7542b2829e06f6d87f069c2))

### [0.1.1](https://github.com/unjs/ofetch/compare/v0.0.7...v0.1.1) (2020-12-12)


### Bug Fixes

* preserve params when using baseURL ([c3a63e2](https://github.com/unjs/ofetch/commit/c3a63e2b337b09b082eb9faf8e23e818d866c49c))

### [0.0.7](https://github.com/unjs/ofetch/compare/v0.0.6...v0.0.7) (2020-12-12)

### [0.0.6](https://github.com/unjs/ofetch/compare/v0.0.5...v0.0.6) (2020-12-12)


### Bug Fixes

* **pkg:** fix top level named exports ([0b51462](https://github.com/unjs/ofetch/commit/0b514620dcfa65d156397114b87ed5e4f28e33a1))

### [0.0.5](https://github.com/unjs/ofetch/compare/v0.0.4...v0.0.5) (2020-12-12)


### Bug Fixes

* **pkg:** fix ./node in exports ([c6b27b7](https://github.com/unjs/ofetch/commit/c6b27b7cb61d66444f3d43bfa5226057ec7a9c95))

### [0.0.4](https://github.com/unjs/ofetch/compare/v0.0.3...v0.0.4) (2020-12-12)


### Features

* support params ([e6a56ff](https://github.com/unjs/ofetch/commit/e6a56ff083244fac918e29058aaf28bf87c98384))

### [0.0.3](https://github.com/unjs/ofetch/compare/v0.0.2...v0.0.3) (2020-12-12)


### Features

* bundle ufo and destr for easier bundler integration ([8f5ba88](https://github.com/unjs/ofetch/commit/8f5ba88f1ac0aa40ff2c99316da98a71d6dcc7e8))
* support `$fetch.raw` and improve docs ([f9f70a5](https://github.com/unjs/ofetch/commit/f9f70a59222bc0d0166cbe9a03eebf2a73682398))

### [0.0.2](https://github.com/unjs/ofetch/compare/v0.0.1...v0.0.2) (2020-12-09)


### Bug Fixes

* **pkg:** add top level dist ([6da17ca](https://github.com/unjs/ofetch/commit/6da17cad07e08cff9e5ea9e8b505638d560bcb47))

### 0.0.1 (2020-12-09)


### Features

* universal + isomorphic builds ([a873702](https://github.com/unjs/ofetch/commit/a873702c336c7ecce87c506d81c146db9f7516d0))
