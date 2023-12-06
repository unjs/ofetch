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

通过设置 `FETCH_KEEP_ALIVE` 环境变量为 `true`, 一个 HTTP/HTTPS 代理将会被注册，这样即使请求都完成，也可以保持链接持续存在, 所以对于后续的请求就非常有用，因为不需要重复建立连接了。

**注意:** 这个选项可能会潜在的导致内存泄露。详细可查看 [node-fetch/node-fetch#1325](https://github.com/node-fetch/node-fetch/pull/1325).

## ✔️ 响应解析

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
如果 `body` 是一个带有 `.toJSON()` 方法的对象或类，`ofetch` 将自动对其字符串化。

`ofetch` 利用 `JSON.stringify()` 转换传递过来的对象。没有 `.toJSON()` 方法的类在传递给 `body` 选项之前必须转换为字符串值。

对于 `put`, `patch` and `post` 请求方法，当 `body` 是一个字符串或对象时，`ofetch` 会添加默认的头信息 `content-type: application/json` 和 `accept: application/json`（你也可以选择覆盖）

另外，`ofetch` 也支持 `Buffer`、`ReadableStream`、`Stream` 和 [body兼容类型](https://developer.mozilla.org/en-US/docs/Web/API/fetch#body)(中文文档没有body兼容类型内容)的二进制流数据响应。`ofetch` 将自动设置 `duplex:half` 参数以支持流式传输。

**例子:**
```js
const { users } = await ofetch('/api/users', {
  method: 'POST',
  body: { some: 'json' }
})
```

## ✔️ 处理错误

当 `response.ok` 是 `false` 时，`ofetch` 自动抛出友好且精简的错误和栈信息 (隐藏内部细节)。

解析后的错误内容，可以通过 `error.data` 访问。也可以使用 `FetchError` 类型处理错误。


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

如果发生错误或者响应状态码符合`重试状态码`条件时，`ofetch` 会自动重新发送请求。

**重试状态码:**
- `408` - 请求超市
- `409` - 冲突
- `425` - 太早
- `429` - 请求过多
- `500` - 服务器内部错误
- `502` - 错误的网关
- `503` - 服务不可用
- `504` - 网关超时

你能使用 `retry` 和 `retryDelay` 两个参数，来指定重试的次数和它们之间延迟的时间，并且可以使用 `retryStatusCodes` 自定义一个状态码数组。

`retry` 默认值是 `1`, 除了 `POST`, `PUT`, `PATCH` and `DELETE` 方法，`ofetch` 不会进行重试，以避免引入副作用。如果设置了一个自定义的 `retry` 值，那所有类型的请求，都将进行重试。

`retryDelay` 的默认值是 `0` 毫秒。


```ts
await ofetch('http://google.com/404', {
  retry: 3,
  retryDelay: 500, // ms
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
