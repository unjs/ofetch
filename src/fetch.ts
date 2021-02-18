import destr from 'destr'
import { joinURL, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'

export interface CreateFetchOptions { fetch: Fetch }

export type FetchRequest = RequestInfo

export interface SearchParams { [key: string]: any }

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  response?: boolean
}

export interface FetchResponse<T> extends Response { data?: T }

export interface $Fetch {
  <T = any>(request: FetchRequest, opts?: FetchOptions): Promise<T>
  raw<T = any>(request: FetchRequest, opts?: FetchOptions): Promise<FetchResponse<T>>
}

export function createFetch ({ fetch }: CreateFetchOptions): $Fetch {
  const raw: $Fetch['raw'] = async function (request, opts) {
    if (opts && typeof request === 'string') {
      if (opts.baseURL) {
        request = joinURL(opts.baseURL, request)
      }
      if (opts.params) {
        request = withQuery(request, opts.params)
      }
      if (opts.body && typeof opts.body === 'object' && ['patch', 'post', 'put'].includes(opts.method?.toLowerCase() || '')) {
        try {
          opts.body = JSON.stringify(opts.body)
          opts.headers = opts.headers || {}
          if (Array.isArray(opts.headers)) {
            opts.headers.push(['content-type', 'application/json'])
          } else if ('set' in opts.headers) {
            ;(opts.headers as Headers).set('content-type', 'application/json')
          } else {
            opts.headers['content-type'] = 'application/json'
          }
        } catch {}
      }
    }
    const response: FetchResponse<any> = await fetch(request, opts as RequestInit)
    const text = await response.text()
    response.data = destr(text)
    if (!response.ok) {
      throw createFetchError(request, response)
    }
    return response
  }

  const $fetch = function (request, opts) {
    return raw(request, opts).then(r => r.data)
  } as $Fetch

  $fetch.raw = raw

  return $fetch
}
