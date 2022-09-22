import { resolveURL, withQuery } from 'ufo'
import type { QueryObject } from 'ufo'
import type { FetchOptions } from './fetch'
import type { ResponseType, MappedType } from './types'
import { $fetch } from './undici'

export type ClientMethodHandler = <T = any, R extends ResponseType = 'json'>(
  data?: RequestInit['body'] | Record<string, any>,
  opts?: Omit<FetchOptions<R>, 'baseURL' | 'method'>
) => Promise<MappedType<R, T>>

export type ClientBuilder = {
  [key: string]: ClientBuilder;
  (...segmentsOrIds: (string | number)[]): ClientBuilder
} & {
  get: ClientMethodHandler
  post: ClientMethodHandler
  put: ClientMethodHandler
  delete: ClientMethodHandler
  patch: ClientMethodHandler
}

export function createClient<R extends ResponseType = 'json'> (
  url: string,
  defaults: Omit<FetchOptions<R>, 'method'> = {}
): ClientBuilder {
  // Callable internal target required to use `apply` on it
  const internalTarget = (() => {}) as ClientBuilder

  const p = (url: string): ClientBuilder =>
    new Proxy(internalTarget, {
      get (_target, key: string) {
        const method = key.toUpperCase()

        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          return p(resolveURL(url, key))
        }

        const handler: ClientMethodHandler = <T = any, R extends ResponseType = 'json'>(
          data?: RequestInit['body'] | Record<string, any>,
          opts: Omit<FetchOptions<R>, 'baseURL' | 'method'> = {}
        ) => {
          switch (method) {
            case 'GET':
              if (data) { url = withQuery(url, data as QueryObject) }
              break
            case 'POST':
            case 'PUT':
            case 'PATCH':
              opts.body = data
          }

          return $fetch<T, R>(url, {
            ...(defaults as unknown as FetchOptions<R>),
            ...opts,
            method
          })
        }

        return handler
      },
      apply (_target, _thisArg, args: (string | number)[] = []) {
        return p(resolveURL(url, ...args.map(i => `${i}`)))
      }
    })

  return p(url)
}
