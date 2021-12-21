import destr from 'destr'
import { withBase, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'
import { isPayloadMethod, isJSONSerializable, detectResponseType, ResponseType, MappedType } from './utils'

export interface CreateFetchOptions {
  fetch: Fetch
  Headers: typeof Headers
}

export type FetchRequest = RequestInfo

export interface SearchParams { [key: string]: any }

export interface FetchOptions<R extends ResponseType = ResponseType> extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  parseResponse?: (responseText: string) => any
  responseType?: R
  response?: boolean
  retry?: number | false
}

export interface FetchResponse<T> extends Response { data?: T }

export interface $Fetch {
  <T = any, R extends ResponseType = 'json'>(request: FetchRequest, opts?: FetchOptions<R>): Promise<MappedType<R, T>>
  raw<T = any, R extends ResponseType = 'json'>(request: FetchRequest, opts?: FetchOptions<R>): Promise<FetchResponse<MappedType<R, T>>>
}

export function createFetch ({ fetch, Headers }: CreateFetchOptions): $Fetch {
  function onError (request: FetchRequest, opts: FetchOptions, error?: Error, response?: FetchResponse<any>): Promise<FetchResponse<any>> {
    // Retry
    if (opts.retry !== false) {
      const retries = typeof opts.retry === 'number' ? opts.retry : (isPayloadMethod(opts.method) ? 0 : 1)
      if (retries > 0) {
        return $fetchRaw(request, {
          ...opts,
          retry: retries - 1
        })
      }
    }

    // Throw normalized error
    const err = createFetchError(request, error, response)
    // Only available on V8 based runtimes (https://v8.dev/docs/stack-trace-api)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, $fetchRaw)
    }
    throw err
  }

  const $fetchRaw: $Fetch['raw'] = async function $fetchRaw (request, opts = {}) {
    if (typeof request === 'string') {
      if (opts.baseURL) {
        request = withBase(request, opts.baseURL)
      }
      if (opts.params) {
        request = withQuery(request, opts.params)
      }
      if (opts.body && isPayloadMethod(opts.method)) {
        if (isJSONSerializable(opts.body)) {
          opts.body = JSON.stringify(opts.body)
          opts.headers = new Headers(opts.headers)
          if (!opts.headers.has('content-type')) {
            opts.headers.set('content-type', 'application/json')
          }
          if (!opts.headers.has('accept')) {
            opts.headers.set('accept', 'application/json')
          }
        }
      }
    }
    const response: FetchResponse<any> = await fetch(request, opts as RequestInit).catch(error => onError(request, opts, error, undefined))

    const responseType = opts.parseResponse ? 'json' : opts.responseType || detectResponseType(response.headers.get('content-type') || '')

    // We override the `.json()` method to parse the body more securely with `destr`
    if (responseType === 'json') {
      const data = await response.text()
      const parseFn = opts.parseResponse || destr
      response.data = parseFn(data)
    } else {
      response.data = await response[responseType]()
    }

    return response.ok ? response : onError(request, opts, undefined, response)
  }

  const $fetch = function $fetch (request, opts) {
    return $fetchRaw(request, opts).then(r => r.data)
  } as $Fetch

  $fetch.raw = $fetchRaw

  return $fetch
}
