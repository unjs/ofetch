import destr from 'destr'
import { joinURL } from '@nuxt/ufo'
import type { Fetch, RequestInfo, RequestInit } from './types'
import { createFetchError } from './error'

export interface CreateFetchOptions {
  fetch: Fetch
}

export type $FetchInput = RequestInfo

export interface $FetchOptions extends RequestInit {
  baseURL?: string
}

export type $Fetch<T = any> = (input: $FetchInput, opts?: $FetchOptions) => Promise<T>

export function createFetch ({ fetch }: CreateFetchOptions): $Fetch {
  return async function $fetch (input, opts) {
    if (opts && opts.baseURL && typeof input === 'string') {
      input = joinURL(opts.baseURL, input)
    }
    const response = await fetch(input, opts)
    const text = await response.text()
    const data = destr(text)
    if (!response.ok) {
      throw createFetchError(response, input, data)
    }
    return data
  }
}
