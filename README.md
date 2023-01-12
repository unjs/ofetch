# ofetch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle][bundle-src]][bundle-href]

> A better fetch API. Works on node, browser and workers.

## 🚀 Quick Start

Install:

```bash
# npm
npm i ofetch

# yarn
yarn add ofetch
```

Import:

```js
// ESM / Typescript
import { ofetch } from 'ofetch'

// CommonJS
const { ofetch } = require('ofetch')
```

<details>
  <summary>Spoiler</summary>
  <img src="https://media.giphy.com/media/Dn1QRA9hqMcoMz9zVZ/giphy.gif">
</details>

## ✔️ Works with Node.js

We use [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) to detect Node.js
 and automatically use [unjs/node-fetch-native](https://github.com/unjs/node-fetch-native). If `globalThis.fetch` is available, will be used instead. To leverage Node.js 17.5.0 experimental native fetch API use [`--experimental-fetch` flag](https://nodejs.org/dist/latest-v17.x/docs/api/cli.html#--experimental-fetch).

### `keepAlive` support

By setting the `FETCH_KEEP_ALIVE` environment variable to `true`, an http/https agent will be registered that keeps sockets around even when there are no outstanding requests, so they can be used for future requests without having to reestablish a TCP connection.

**Note:** This option can potentially introduce memory leaks. Please check [node-fetch/node-fetch#1325](https://github.com/node-fetch/node-fetch/pull/1325).

## ✔️ Parsing Response

`ofetch` will smartly parse JSON and native values using [destr](https://github.com/unjs/destr), falling back to text if it fails to parse.

```js
const { users } = await ofetch('/api/users')
```

For binary content types, `ofetch` will instead return a `Blob` object.

You can optionally provide a different parser than destr, or specify `blob`, `arrayBuffer` or `text` to force parsing the body with the respective `FetchResponse` method.

```js
// Use JSON.parse
await ofetch('/movie?lang=en', { parseResponse: JSON.parse })

// Return text as is
await ofetch('/movie?lang=en', { parseResponse: txt => txt })

// Get the blob version of the response
await ofetch('/api/generate-image', { responseType: 'blob' })
```

## ✔️ JSON Body

`ofetch` automatically stringifies request body (if an object is passed) and adds JSON `Content-Type` and `Accept` headers (for `put`, `patch` and `post` requests).

```js
const { users } = await ofetch('/api/users', { method: 'POST', body: { some: 'json' } })
```

## ✔️ Handling Errors

`ofetch` Automatically throw errors when `response.ok` is `false` with a friendly error message and compact stack (hiding internals).

Parsed error body is available with `error.data`. You may also use `FetchError` type.

```ts
await ofetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

In order to bypass errors as response you can use `error.data`:

```ts
await ofetch(...).catch((error) => error.data)
```

## ✔️ Auto Retry

`ofetch` Automatically retries the request if an error happens. Default is `1` (except for `POST`, `PUT` and `PATCH` methods that is `0`)

```ts
await ofetch('http://google.com/404', {
  retry: 3
})
```

## ✔️ Type Friendly

Response can be type assisted:

```ts
const article = await ofetch<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## ✔️ Adding `baseURL`

By using `baseURL` option, `ofetch` prepends it with respecting to trailing/leading slashes and query search params for baseURL using [ufo](https://github.com/unjs/ufo):

```js
await ofetch('/config', { baseURL })
```

## ✔️ Adding Query Search Params

By using `query` option (or `params` as alias), `ofetch` adds query search params to URL by preserving query in request itself using [ufo](https://github.com/unjs/ufo):

```js
await ofetch('/movie?lang=en', { query: { id: 123 } })
```

## ✔️ Interceptors

It is possible to provide async interceptors to hook into lifecycle events of `ofetch` call.

You might want to use `ofetch.create` to set shared interceptors.

### `onRequest({ request, options })`

`onRequest` is called as soon as `ofetch` is being called, allowing to modify options or just do simple logging.

```js
await ofetch('/api', {
  async onRequest({ request, options }) {
    // Log request
    console.log('[fetch request]', request, options)

    // Add `?t=1640125211170` to query search params
    options.query = options.query || {}
    options.query.t = new Date()
  }
})
```

### `onRequestError({ request, options, error })`

`onRequestError` will be called when fetch request fails.

```js
await ofetch('/api', {
  async onRequestError({ request, options, error }) {
    // Log error
    console.log('[fetch request error]', request, error)
  }
})
```


### `onResponse({ request, options, response })`

`onResponse` will be called after `fetch` call and parsing body.

```js
await ofetch('/api', {
  async onResponse({ request, response, options }) {
    // Log response
    console.log('[fetch response]', request, response.status, response.body)
  }
})
```

### `onResponseError({ request, options, response })`

`onResponseError` is same as `onResponse` but will be called when fetch happens but `response.ok` is not `true`.

```js
await ofetch('/api', {
  async onResponseError({ request, response, options }) {
    // Log error
    console.log('[fetch response error]', request, response.status, response.body)
  }
})
```

## ✔️ Create fetch with default options

This utility is useful if you need to use common options across several fetch calls.

**Note:** Defaults will be cloned at one level and inherited. Be careful about nested options like `headers`.

```js
const apiFetch = ofetch.create({ baseURL: '/api' })

apiFetch('/test') // Same as ofetch('/test', { baseURL: '/api' })
```

## 💡 Adding headers

By using `headers` option, `ofetch` adds extra headers in addition to the request default headers:

```js
await ofetch('/movies', {
  headers: {
    Accept: 'application/json',
    'Cache-Control': 'no-cache'
  }
})
```

## 💡 Adding HTTP(S) Agent

If you need use HTTP(S) Agent, can add `agent` option with `https-proxy-agent` (for Node.js only):

```js
import { HttpsProxyAgent } from "https-proxy-agent";

await ofetch('/api', {
  agent: new HttpsProxyAgent('http://example.com')
})
```

## 🍣 Access to Raw Response

If you need to access raw response (for headers, etc), can use `ofetch.raw`:

```js
const response = await ofetch.raw('/sushi')

// response.data
// response.headers
// ...
```

## Native fetch

As a shortcut, you can use `ofetch.native` that provides native `fetch` API

```js
const json = await ofetch.native('/sushi').then(r => r.json())
```

## 📦 Bundler Notes

- All targets are exported with Module and CommonJS format and named exports
- No export is transpiled for sake of modern syntax
  - You probably need to transpile `ofetch`, `destr` and `ufo` packages with babel for ES5 support
- You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)

## ❓ FAQ

**Why export is called `ofetch` instead of `fetch`?**

Using the same name of `fetch` can be confusing since API is different but still it is a fetch so using closest possible alternative. You can however, import `{ fetch }` from `ofetch` which is auto polyfilled for Node.js and using native otherwise.

**Why not having default export?**

Default exports are always risky to be mixed with CommonJS exports.

This also guarantees we can introduce more utils without breaking the package and also encourage using `ofetch` name.

**Why not transpiled?**

By keep transpiling libraries we push web backward with legacy code which is unneeded for most of the users.

If you need to support legacy users, you can optionally transpile the library in your build pipeline.

## License

MIT. Made with 💖

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ofetch?style=flat-square
[npm-version-href]: https://npmjs.com/package/ofetch

[npm-downloads-src]: https://img.shields.io/npm/dm/ofetch?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/ofetch

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/ofetch/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/ofetch/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/ofetch/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/ofetch

[bundle-src]: https://img.shields.io/bundlephobia/minzip/ofetch?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=ofetch
