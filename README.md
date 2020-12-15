
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle][bundle-src]][bundle-href]

![😱 ohmyfetch](.github/banner.svg)

## 🚀 Quick Start

Install:

```bash
# npm
npm i ohmyfetch

# yarn
yarn add ohmyfetch
```

Import:

```js
// Universal (requires global.fetch)
import { $fetch } from 'ohmyfetch'

// NodeJS / Isomorphic
import { $fetch } from 'ohmyfetch/node'

// NodeJS / Isomorphic (CommonJS)
const { $fetch } = require('ohmyfetch/node')
```

<details>
  <summary>Spoiler</summary>
  <img src="https://media.giphy.com/media/Dn1QRA9hqMcoMz9zVZ/giphy.gif">
</details>



## ✔️ Parsing Response

`$fetch` Smartly parses JSON and native values using [destr](https://github.com/nuxt-contrib/destr) and fallback to text if cannot parse

```js
const { users } = await $fetch('/api/users')
```

## ✔️ Handling Errors

`$fetch` Automatically throw errors when `response.ok` is `false` with a friendly error message and compact stack (hiding internals).

Parsed error body is available with `error.data`. You may also use `FetchError` type.

```ts
await $fetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

In order to bypass errors as reponse you can use `error.data`:

```ts
await $fetch(...).catch((error) => error.data)
```

## ✔️ Type Friendly

Response can be type assisted:

```ts
const { article } = await $fetch<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## ✔️ Adding `baseURL`

By using `baseURL` option, `$fetch` prepends it with respecting to trailing/leading slashes and query params for baseURL using [ufo](https://github.com/nuxt-contrib/ufo):

```js
await $fetch('/config', { baseURL })
```

## ✔️ Adding params

By using `params` option, `$fetch` adds params to URL by preserving params in request itself using [ufo](https://github.com/nuxt-contrib/ufo):

```js
await $fetch('/movie?lang=en', { params: { id: 123 } })
```

## 🍣 Access to Raw Response

If you need to access raw response (for headers, etc), can use `$fetch.raw`:

```js
const response = await $fetch.raw('/sushi')

// response.data
// response.headers
// ...
```


## 📦 Bundler Notes

- All targets are exported with Module and CommonJS format and named exports
- No export is transpiled for sake of Modern syntax
  - You probably need to transpile `ohmyfetch` package with babel for ES5 support
- You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)

## ❓ FAQ

**Why export is called `$fetch` instead of `fetch`?**

Using the same name of `fetch` can be confusing since API is different but still it is a fetch so using closest possible alternative.

**Why not having default export?**

Default exports are always risky to be mixed with CommonJS exports.

This also guarantees we can introduce more utils without breaking the package and also encourage using `$fetch` name.

**Why not transpiled?**

By keep transpiling libraries we push web backward with legacy code which is unneeded for most of the users.

If you need to support legacy users, can optionally transpile the library in build pipeline.

## License

MIT. Made with 💖

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ohmyfetch?style=flat-square
[npm-version-href]: https://npmjs.com/package/ohmyfetch

[npm-downloads-src]: https://img.shields.io/npm/dm/ohmyfetch?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/ohmyfetch

[github-actions-src]: https://img.shields.io/github/workflow/status/nuxt-contrib/ohmyfetch/ci/main?style=flat-square
[github-actions-href]: https://github.com/nuxt-contrib/ohmyfetch/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/nuxt-contrib/ohmyfetch/main?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-contrib/ohmyfetch

[bundle-src]: https://img.shields.io/bundlephobia/minzip/ohmyfetch?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=ohmyfetch

