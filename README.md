
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
// ESM / Typescript
import { $fetch } from 'ohmyfetch'

// CommonJS
const { $fetch } = require('ohmyfetch')
```

<details>
  <summary>Spoiler</summary>
  <img src="https://media.giphy.com/media/Dn1QRA9hqMcoMz9zVZ/giphy.gif">
</details>

## ✔️ Works with Node.js

We use [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) to detect Node.js
 and automatically use [node-fetch](https://github.com/node-fetch/node-fetch). If `globalThis.fetch` is available, will be used instead.

### `undici` support

In order to use experimental fetch implementation from [nodejs/undici](https://github.com/nodejs/undici), You can import from `ohmyfetch/undici`.

```js
import { $fetch } from 'ohmyfetch/undici'
```

On Node.js versions older than `16.5`, node-fetch will be used as the fallback.

### `keepAlive` support

By setting `FETCH_KEEP_ALIVE` environment variable to `true`, A http/https agent will be registred that keeps sockets around even when there are no outstanding requests, so they can be used for future requests without having to reestablish a TCP connection.

**Note:** This option can potentially introduce memory leaks. Please check [node-fetch/node-fetch#1325](https://github.com/unjs/ohmyfetch/pull/22).

## ✔️ Parsing Response

`$fetch` will smartly parse JSON and native values using [destr](https://github.com/unjs/destr), falling back to text if it fails to parse.

```js
const { users } = await $fetch('/api/users')
```

For binary content types, `$fetch` will instead return a `Blob` object.

You can optionally provde a different parser than destr, or specify `blob`, `arrayBuffer` or `text` to force parsing the body with the respective `FetchResponse` method.

```js
// Use JSON.parse
await $fetch('/movie?lang=en', { parseResponse: JSON.parse })

// Return text as is
await $fetch('/movie?lang=en', { parseResponse: txt => txt })

// Get the blob version of the response
await $fetch('/api/generate-image', { responseType: 'blob' })
```

## ✔️ JSON Body

`$fetch` automatically stringifies request body (if an object is passed) and adds JSON `Content-Type` and `Accept` headers (for `put`, `patch` and `post` requests).

```js
const { users } = await $fetch('/api/users', { method: 'POST', body: { some: 'json' } })
```

## ✔️ Handling Errors

`$fetch` Automatically throw errors when `response.ok` is `false` with a friendly error message and compact stack (hiding internals).

Parsed error body is available with `error.data`. You may also use `FetchError` type.

```ts
await $fetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

In order to bypass errors as response you can use `error.data`:

```ts
await $fetch(...).catch((error) => error.data)
```

## ✔️ Auto Retry

`$fetch` Automatically retries the request if an error happens. Default is `1` (except for `POST`, `PUT` and `PATCH` methods that is `0`)

```ts
await $fetch('http://google.com/404', {
  retry: 3
})
```

## ✔️ Type Friendly

Response can be type assisted:

```ts
const article = await $fetch<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## ✔️ Adding `baseURL`

By using `baseURL` option, `$fetch` prepends it with respecting to trailing/leading slashes and query params for baseURL using [ufo](https://github.com/unjs/ufo):

```js
await $fetch('/config', { baseURL })
```

## ✔️ Adding params

By using `params` option, `$fetch` adds params to URL by preserving params in request itself using [ufo](https://github.com/unjs/ufo):

```js
await $fetch('/movie?lang=en', { params: { id: 123 } })
```

## 💡 Adding headers

By using `headers` option, `$fetch` adds extra headers in addition to the request default headers:

```js
await $fetch('/movies', {
  headers: {
    Accept: 'application/json',
    'Cache-Control': 'no-cache'
  }
})
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
- No export is transpiled for sake of modern syntax
  - You probably need to transpile `ohmyfetch`, `destr` and `ufo` packages with babel for ES5 support
- You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)

## ❓ FAQ

**Why export is called `$fetch` instead of `fetch`?**

Using the same name of `fetch` can be confusing since API is different but still it is a fetch so using closest possible alternative. You can however, import `{ fetch }` from `ohmyfetch` which is auto polyfilled for Node.js and using native otherwise.

**Why not having default export?**

Default exports are always risky to be mixed with CommonJS exports.

This also guarantees we can introduce more utils without breaking the package and also encourage using `$fetch` name.

**Why not transpiled?**

By keep transpiling libraries we push web backward with legacy code which is unneeded for most of the users.

If you need to support legacy users, you can optionally transpile the library in your build pipeline.

## License

MIT. Made with 💖

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ohmyfetch?style=flat-square
[npm-version-href]: https://npmjs.com/package/ohmyfetch

[npm-downloads-src]: https://img.shields.io/npm/dm/ohmyfetch?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/ohmyfetch

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/ohmyfetch/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/ohmyfetch/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/ohmyfetch/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/ohmyfetch

[bundle-src]: https://img.shields.io/bundlephobia/minzip/ohmyfetch?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=ohmyfetch
