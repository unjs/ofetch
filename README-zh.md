# ofetch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]
[![JSDocs][jsdocs-src]][jsdocs-href]

一个更好的 fetch API。兼容 node、浏览器和 Web Workers
## 🚀 快速开始

安装:

```bash
# npm
npm i ofetch

# yarn
yarn add ofetch
```

引入:

```js
// ESM / Typescript
import { ofetch } from 'ofetch'

// CommonJS
const { ofetch } = require('ofetch')
```

## ✔️ 在 Node.js 中使用

通过使用 [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) 检测 Node.js
 并且自动的使用 [unjs/node-fetch-native](https://github.com/unjs/node-fetch-native)。 如果 `globalThis.fetch` 是可用的, 将会替代 [unjs/node-fetch-native](https://github.com/unjs/node-fetch-native)。在 Node.js 17.5.0 版本或以上，使用 experimental native fetch API use [`--experimental-fetch` flag](https://nodejs.org/dist/latest-v17.x/docs/api/cli.html#--experimental-fetch) 实验参数，即可使用原生 fetch API。

### `keepAlive` 支持

通过设置 `FETCH_KEEP_ALIVE` 环境变量为 `true`, 一个 http/https 代理将会被注册，这样即使请求都完成，也可以保持链接持续存在, 所以对于后续的请求就非常有用，因为不需要再次重复建立连接了。

**注意:** 这个选项可能会潜在的导致内存泄露。详细可查看 [node-fetch/node-fetch#1325](https://github.com/node-fetch/node-fetch/pull/1325).

## ✔️ 解析响应

`ofetch` 使用 [destr](https://github.com/unjs/destr) 巧妙的解析 JSON 和处理原始值, 当解析错误时，会返回传入的值。

```js
const { users } = await ofetch('/api/users')
```

如果响应内容是 `binary` 类型, `ofetch` 会返回一个 `Blob` 对象。

你也可以提供自己的解析器代替 `destr`, 或者明确传入 `blob`, `arrayBuffer` 或 `text` 参数，强制使用相应的 `FetchResponse` 方法解析响应体。

```js
// 使用 JSON.parse
await ofetch('/movie?lang=en', { parseResponse: JSON.parse })

// 返回 text
await ofetch('/movie?lang=en', { parseResponse: txt => txt })

// 获取 blob 版本的响应
await ofetch('/api/generate-image', { responseType: 'blob' })
```

## ✔️ JSON Body

`ofetch` 会自动把请求体(如果是对象类型就会通过)转换成字符串 and adds JSON `Content-Type` and `Accept` headers (for `put`, `patch` and `post` requests).

```js
const { users } = await ofetch('/api/users', { method: 'POST', body: { some: 'json' } })
```

## ✔️ 处理错误

当 `response.ok` 是 `false` 时，`ofetch` 自动抛出友好且精简的错误和栈信息 (隐藏了内部错误)。

解析后的错误内容，可以通过 `error.data` 访问。也可以使用 `FetchError` 类型。


```ts
await ofetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

捕获错误响应:

```ts
await ofetch('/url').catch(err => err.data)
```

也可以设置 `ignoreResponseError` 参数，忽略捕获错误状态：

```ts
await ofetch('/url', { ignoreResponseError: true })
```

## ✔️ 自动重试

如果发生错误，`ofetch` 会自动重新发送请求。 默认值是 `1` (排除 `POST`, `PUT`, `PATCH` and `DELETE` 方法，它们的默认值是 `0`)

```ts
await ofetch('http://google.com/404', {
  retry: 3
})
```

## ✔️ 类型友好

响应体可以提供类型辅助:

```ts
const article = await ofetch<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## ✔️ 添加 `baseURL`

通过 `baseURL` 选项, `ofetch` 会使用 [ufo](https://github.com/unjs/ufo) 处理 baseURL，并在添加时遵循尾部/前导斜杠和查询搜索参数:

```js
await ofetch('/config', { baseURL })
```

## ✔️ 添加查询搜索参数

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

// response._data
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
[npm-version-src]: https://img.shields.io/npm/v/ofetch?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/ofetch
[npm-downloads-src]: https://img.shields.io/npm/dm/ofetch?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/ofetch
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/ofetch/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/ofetch
[bundle-src]: https://img.shields.io/bundlephobia/minzip/ofetch?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=ofetch
[license-src]: https://img.shields.io/github/license/unjs/ofetch.svg?style=flat&colorA=18181B&colorB=F0DB4F
[license-href]: https://github.com/unjs/ofetch/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&colorA=18181B&colorB=F0DB4F
[jsdocs-href]: https://www.jsdocs.io/package/ofetch
