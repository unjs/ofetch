# 😱 0fetch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

## 🚀 Quick Start

Install:

```bash
# npm
npm i 0fetch

# yarn
yarn add 0fetch
```

Import:

```js
// Browser / Workers
import { $fetch } from '0fetch/browser'

// NodeJS
import { $fetch } from '0fetch/node'

// NodeJS (commonjs)
const { $fetch } = require('0fetch/node')
```

## 🤔 Why?

### ✔️ Parse Response

😌 `$fetch`:

```js
const { users } = await $fetch('/api/users')
```

- Using [destr](https://github.com/nuxt-contrib/destr)
- Smartly parse JSON and native values like `true`
- Fallback to text if cannot parse
- Secure against prototype pollution

🥺 `fetch`:

```js
const { users } = await fetch('/api/users').then(r => r.json())
```

### ✔️ Handle Errors

😌 `$fetch`:

```ts
await $fetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

- Automatically throw errors when `response.ok` is `false`
- Friendly error message with compact stack (hiding internals)
- Parsed error body is available with `error.data`

🤷 `fetch`:

```js
const resonse = await fetch('http://google.com/404')
// You need to manually check response.ok and throw an error
```

### ✔️ Type Friendly

😌 `$fetch`:

```ts
const { article } = await $fetch<Article>(`/api/article/${id}`)
// article object is type assisted
```

- Expected response type can be specified

🥺 `fetch`:

```js
const { article } = await fetch(`/api/article/${id}`).then(r => r.json())
// article type is any
```

### ✔️ Support baseURL

😌 `$fetch`:

```js
await $fetch('/config', { baseURL })
```

- Allow making factory functions to add baseURL
- Prepend baseURL with respecting traling/leading slashes and query params for base (using [ufo](https://github.com/nuxt-contrib/ufo))

🤷 `fetch`:

```js
await $fetch(baseURL + '/config')
```

### ✔️ Univeral

Supporting browsers, workers and NodeJS

## 📦 Bundler Notes

- All targets are exported with Module and CommonJS format and named exports
- No export is transpiled for sake of Modern syntax
  - You probably need to transpile `0fetch` package with babel for ES5 support
- You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)

## ❓ FAQ

**Why package name is not simpler?**

Ask who took all cool names and kept unused. Also `ofetch` is not available due npm similar naming policy. 🤷

**Why export is called `$fetch` instead of `fetch`?**

Using same name of `fetch` can be confusing since API is different but still it is a fetch so using closes possible alternative.

**Why note having default export?**

Default exports are always risky to be mixed with CommonJS exports.

This also guarantees we can introduce more utils without breaking package and also encourage using `$fetch` name.

**Why not transpiled?**

By keep transpiling libraries we push web backwards with legacy code which is unneeded for most of users.

If you really need to support legacy users, can optionally transpile library in build pipelines.

## License

MIT. Made with 💖

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/0fetch?style=flat-square
[npm-version-href]: https://npmjs.com/package/0fetch

[npm-downloads-src]: https://img.shields.io/npm/dm/0fetch?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/0fetch

[github-actions-src]: https://img.shields.io/github/workflow/status/nuxt-contrib/0fetch/ci/main?style=flat-square
[github-actions-href]: https://github.com/nuxt-contrib/0fetch/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/nuxt-contrib/0fetch/main?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-contrib/0fetch
