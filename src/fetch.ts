import destr from 'destr'
import { withBase, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'
import { isPayloadMethod, isJSONSerializable, detectResponseType, ResponseType, MappedType } from './utils'

export interface CreateFetchOptions {
  // eslint-disable-next-line no-use-before-define
  defaults?: FetchOptions
  fetch: Fetch
  Headers: typeof Headers
}

export type FetchRequest = RequestInfo
export interface FetchResponse<T> extends Response { _data?: T }
export interface SearchParams { [key: string]: any }

export interface FetchContext<T = any, R extends ResponseType = ResponseType> {
  request: FetchRequest
  // eslint-disable-next-line no-use-before-define
  options: FetchOptions<R>,
  response?: FetchResponse<T>
  error?: Error
}

export interface FetchOptions<R extends ResponseType = ResponseType> extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  query?: SearchParams
  parseResponse?: (responseText: string) => any
  responseType?: R
  response?: boolean
  retry?: number | false

  onRequest?(ctx: FetchContext): Promise<void>
  onRequestError?(ctx: FetchContext & { error: Error }): Promise<void>
  onResponse?(ctx: FetchContext & { response: FetchResponse<R> }): Promise<void>
  onResponseError?(ctx: FetchContext & { response: FetchResponse<R> }): Promise<void>
}

export interface $Fetch {
  <T = any, R extends ResponseType = 'json'>(request: FetchRequest, opts?: FetchOptions<R>): Promise<MappedType<R, T>>
  raw<T = any, R extends ResponseType = 'json'>(request: FetchRequest, opts?: FetchOptions<R>): Promise<FetchResponse<MappedType<R, T>>>
  create(defaults: FetchOptions): $Fetch
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const retryStatusCodes = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504 //  Gateway Timeout
])

export function createFetch (globalOptions: CreateFetchOptions): $Fetch {
  const { fetch, Headers } = globalOptions

  function onError (ctx: FetchContext): Promise<FetchResponse<any>> {
    // Is Abort
    // If it is an active abort, it will not retry automatically.
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException#error_names
    const isAbort = (ctx.error && ctx.error.name === 'AbortError') || false
    // Retry
    if (ctx.options.retry !== false && !isAbort) {
      const retries = typeof ctx.options.retry === 'number'
        ? ctx.options.retry
        : (isPayloadMethod(ctx.options.method) ? 0 : 1)

      const responseCode = (ctx.response && ctx.response.status) || 500
      if (retries > 0 && retryStatusCodes.has(responseCode)) {
        return $fetchRaw(ctx.request, {
          ...ctx.options,
          retry: retries - 1
        })
      }
    }

    // Throw normalized error
    const err = createFetchError(ctx.request, ctx.error, ctx.response)

    // Only available on V8 based runtimes (https://v8.dev/docs/stack-trace-api)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, $fetchRaw)
    }
    throw err
  }

  const $fetchRaw: $Fetch['raw'] = async function $fetchRaw (_request, _opts = {}) {
    const ctx: FetchContext = {
      request: _request,
      options: { ...globalOptions.defaults, ..._opts },
      response: undefined,
      error: undefined
    }

    if (ctx.options.onRequest) {
      await ctx.options.onRequest(ctx)
    }

    if (typeof ctx.request === 'string') {
      if (ctx.options.baseURL) {
        ctx.request = withBase(ctx.request, ctx.options.baseURL)
      }
      if (ctx.options.query || ctx.options.params) {
        ctx.request = withQuery(ctx.request, { ...ctx.options.params, ...ctx.options.query })
      }
      if (ctx.options.body && isPayloadMethod(ctx.options.method)) {
        if (isJSONSerializable(ctx.options.body)) {
          // Automatically JSON stringify request bodies, when not already a string.
          ctx.options.body = typeof ctx.options.body === 'string'
            ? ctx.options.body
            : JSON.stringify(ctx.options.body)

          // Set Content-Type and Accept headers to application/json by default
          // for JSON serializable request bodies.
          ctx.options.headers = new Headers(ctx.options.headers)
          if (!ctx.options.headers.has('content-type')) {
            ctx.options.headers.set('content-type', 'application/json')
          }
          if (!ctx.options.headers.has('accept')) {
            ctx.options.headers.set('accept', 'application/json')
          }
        }
      }
    }

    ctx.response = await fetch(ctx.request, ctx.options as RequestInit).catch(async (error) => {
      ctx.error = error
      if (ctx.options.onRequestError) {
        await ctx.options.onRequestError(ctx as any)
      }
      return onError(ctx)
    })

    const responseType =
      (ctx.options.parseResponse ? 'json' : ctx.options.responseType) ||
      detectResponseType(ctx.response.headers.get('content-type') || '')

    // We override the `.json()` method to parse the body more securely with `destr`
    if (responseType === 'json') {
      const data = await ctx.response.text()
      const parseFn = ctx.options.parseResponse || destr
      ctx.response._data = parseFn(data)
    } else if (responseType === 'stream') {
      ctx.response._data = ctx.response.body
    } else {
      ctx.response._data = await ctx.response[responseType]()
    }

    if (ctx.options.onResponse) {
      await ctx.options.onResponse(ctx as any)
    }

    if (!ctx.response.ok) {
      if (ctx.options.onResponseError) {
        await ctx.options.onResponseError(ctx as any)
      }
    }

    return ctx.response.ok ? ctx.response : onError(ctx)
  }

  const $fetch = function $fetch (request, opts) {
    return $fetchRaw(request, opts).then(r => r._data)
  } as $Fetch

  $fetch.raw = $fetchRaw

  $fetch.create = (defaultOptions = {}) => createFetch({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  })

  return $fetch
}
