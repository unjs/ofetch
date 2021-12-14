import destr from 'destr'
import { withBase, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'
import { isPayloadMethod, isJSONSerializable, detectContentMethod } from './utils'

export interface CreateFetchOptions { fetch: Fetch }

export type FetchRequest = RequestInfo

export interface SearchParams { [key: string]: any }

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  parseResponse?: 'blob' | 'json' | 'text' | ((responseText: string) => any)
  response?: boolean
  retry?: number | false
}

export interface FetchResponse<T> extends Response { data?: T }

export interface $Fetch {
  <T = any>(request: FetchRequest, opts?: FetchOptions): Promise<T>
  raw<T = any>(request: FetchRequest, opts?: FetchOptions): Promise<FetchResponse<T>>
}

export function setHeader (options: FetchOptions, _key: string, value: string) {
  const key = _key.toLowerCase()
  options.headers = options.headers || {}
  if ('set' in options.headers) {
    ;(options.headers as Headers).set(key, value)
  } else if (Array.isArray(options.headers)) {
    const existingHeader = options.headers.find(([header]) => header.toLowerCase() === key)
    if (existingHeader) {
      existingHeader[1] = value
    } else {
      options.headers.push([key, value])
    }
  } else {
    const existingHeader = Object.keys(options.headers).find(header => header.toLowerCase() === key)
    options.headers[existingHeader || key] = value
  }
}

export function createFetch ({ fetch }: CreateFetchOptions): $Fetch {
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
          setHeader(opts, 'content-type', 'application/json')
          setHeader(opts, 'accept', 'application/json')
        }
      }
    }
    const response: FetchResponse<any> = await fetch(request, opts as RequestInit).catch(error => onError(request, opts, error, undefined))

    const contentMethod = typeof opts.parseResponse === 'string'
      ? opts.parseResponse
      : detectContentMethod(response.headers.get('content-type') || '')

    const data = await response[contentMethod]()

    if (contentMethod === 'text') {
      const parseFn = typeof opts.parseResponse === 'function' ? opts.parseResponse : destr
      response.data = parseFn(data)
    } else {
      response.data = data
    }
    return response.ok ? response : onError(request, opts, undefined, response)
  }

  const $fetch = function $fetch (request, opts) {
    return $fetchRaw(request, opts).then(r => r.data)
  } as $Fetch

  $fetch.raw = $fetchRaw

  return $fetch
}
