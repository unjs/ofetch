import destr from 'destr'
import { joinURL, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'

export interface CreateFetchOptions { fetch: Fetch }

export type FetchRequest = RequestInfo

export interface SearchParams { [key: string]: any }

const payloadMethods = ['patch', 'post', 'put']

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  parseResponse?: (responseText: string) => any
  response?: boolean
  retry?: number
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
  const $fetchRaw: $Fetch['raw'] = async function (request, opts = {}) {
    const hasPayload = payloadMethods.includes((opts.method || '').toLowerCase())
    if (typeof request === 'string') {
      if (opts.baseURL) {
        request = joinURL(opts.baseURL, request)
      }
      if (opts.params) {
        request = withQuery(request, opts.params)
      }
      if (opts.body && opts.body.toString() === '[object Object]' && hasPayload) {
        opts.body = JSON.stringify(opts.body)
        setHeader(opts, 'content-type', 'application/json')
      }
    }
    const response: FetchResponse<any> = await fetch(request, opts as RequestInit)
    const text = await response.text()
    const parseFn = opts.parseResponse || destr
    response.data = parseFn(text)
    if (!response.ok) {
      const retries = opts.retry ?? (hasPayload ? 0 : 1)
      if (retries > 0) {
        return $fetchRaw(request, {
          ...opts,
          retry: retries - 1
        })
      }
      throw createFetchError(request, response)
    }
    return response
  }

  const $fetch = function (request, opts) {
    return $fetchRaw(request, opts).then(r => r.data)
  } as $Fetch

  $fetch.raw = $fetchRaw

  return $fetch
}
