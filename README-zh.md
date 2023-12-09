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

## ✔️ 超时
你能设置 `timeout` 选项以毫秒为单位指定超时时间，当请求超过设置的时间时，将会自动取消和中止（默认未开启）。

```ts
await ofetch('http://google.com/404', {
  timeout: 3000, // 3s 后超时
})
```

## ✔️ 类型友好

响应体可以提供类型辅助:

```ts
const article = await ofetch<Article>(`/api/article/${id}`)
// 自动完成使用 article.id
```

## ✔️ 添加 `baseURL`

通过 `baseURL` 选项, `ofetch` 会使用 [ufo](https://github.com/unjs/ufo) 处理 baseURL，并在添加时遵循尾部/前导斜杠和查询搜索参数:

```js
await ofetch('/config', { baseURL })
```

## ✔️ 添加查询搜索参数

<!-- TODO:这句要怎么理解 -->
通过使用 `query` 参数（或者 `params` 做为别名），`ofetch` 会使用[ufo](https://github.com/unjs/ufo)添加查询搜寻参数到 URL 上，通过保存请求自己的 query


```js
await ofetch('/movie?lang=en', { query: { id: 123 } })
```

## ✔️ 拦截器
通过提供异步拦截器，使其能够在 `ofetch` 生命周期内进行回调。

你也可以使用 `ofetch.create` 创建一个共享拦截器的实例。

### `onRequest({ request, options })`

当 `ofetch` 被调用时，`onRequest` 会立即被调用，它能修改选项或者打印简单的日志


```js
await ofetch('/api', {
  async onRequest({ request, options }) {
    // 打印请求日志
    console.log('[fetch request]', request, options)

    // 添加 `?t=1640125211170` 查询参数
    options.query = options.query || {}
    options.query.t = new Date()
  },
});
```

### `onRequestError({ request, options, error })`

当请求失败时，`onRequestError` 将会被调用。

```js
await ofetch('/api', {
  async onRequestError({ request, options, error }) {
    // 打印错误日志
    console.log('[fetch request error]', request, error)
  }
})
```


### `onResponse({ request, options, response })`

`fetch` 执行到解析响应体后 `onResponse` 将会被调用

```js
await ofetch('/api', {
  async onResponse({ request, response, options }) {
    // 打印响应日志
    console.log('[fetch response]', request, response.status, response.body)
  }
})
```

### `onResponseError({ request, options, response })`

`onResponseError` 和 `onResponse` 是一样的，但是只在当请求 `response.ok` 不是 `true` 的时候调用。

```js
await ofetch('/api', {
  async onResponseError({ request, response, options }) {
    // 打印错误日志
    console.log(
      '[fetch response error]',
      request,
      response.status,
      response.body,
    )
  }
})
```

## ✔️ 创建默认参数的 fetch

如果你有几个使用相同选项的 fetch 调用，那这个方法非常有用。

**注意：** 默认只会在第一级克隆并继承。像 `headers` 这类的嵌套参数需要注意。

```js
const apiFetch = ofetch.create({ baseURL: '/api' })

apiFetch('/test') // 和 ofetch('/test', { baseURL: '/api' }) 相同
```

## 💡 添加 headers

通过使用 `headers` 选项，`ofetch` 可以添加额外的头信息与默认的请求头信息叠加在一起。

```js
await ofetch('/movies', {
  headers: {
    Accept: 'application/json',
    'Cache-Control': 'no-cache'
  }
})
```

## 💡 添加 HTTP(S) 代理

如果你需要使用 HTTP(S) 代理, 通过添加 `agent` 选项和 `https-proxy-agent` (只有 Node.js 能够使用):

```js
import { HttpsProxyAgent } from "https-proxy-agent";

await ofetch('/api', {
  agent: new HttpsProxyAgent('http://example.com')
})
```

## 🍣 访问原始响应

如果你需要访问原始响应信息（例如 headers 等），可以使用 `ofetch.raw` 方法。

```js
const response = await ofetch.raw('/sushi')

// response._data
// response.headers
// ...
```

## 原始 fetch

做为一个快捷方法, 你可以使用 `ofetch.native` 获取原始 `fetch` API。

```js
const json = await ofetch.native('/sushi').then(r => r.json())
```

## 📦 Bundler Notes

- 所有产物都以 Module 或 CommonJS 命名风格进行导出。
- 为了保留现代语法的便利性，不会对导出进行编译。
  - 为了支持 ES5 你可能需要使用 `Babel` 转义 `ofetch`，`destr` 和 `ufo` 包。
- 如果需要支持更低版本的浏览器，你需要使用 [unfetch](https://github.com/developit/unfetch) 添加全局 `fetch` 垫片。

## ❓ 问答

**为什么叫`ofetch` 而不是`fetch`?**

使用和 `fetch` 相同的名字，可能会导致困惑，因为从 API 上，它们仍然有一些不同，它是一个使用上与 fetch 非常接近的替代产物。但是，你依然可以使用 import `{ fetch }` from `ofetch`, 它将为 Node.js 自动引入 polyfill，如果原生功能缺失的情况下。

**为什么没有默认导出?**

默认导出与 CommonJS 混合导出总是存在风险的.

这也保证了我们能在不破坏包的情况下，提供更多的工具，且鼓励我们使用 `ofetch` 名字。

**为什么不转译?**
转译库，为了更好的兼容性，可能需要发布很久之前的且已经过时的代码兼容性代码，而这些代码对大多数使用者都是不需要的。

如果你需要支持旧版用户，可以选择在构建流程中对库进行转译。

## 许可证

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
