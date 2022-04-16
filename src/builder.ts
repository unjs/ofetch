import { resolveURL, withQuery } from 'ufo'
import { defu } from 'defu'
import type { QueryObject } from 'ufo'
import type { FetchOptions } from './fetch'
import type { ResponseType, MappedType } from './types'
import { $fetch } from './undici'

export type ApiClientMethodHandler = <T = any, R extends ResponseType = 'json'>(
  data?: RequestInit['body'] | Record<string, any>,
  opts?: Omit<FetchOptions<R>, 'baseURL' | 'method'>
) => Promise<MappedType<R, T>>

export type ApiClientBuilder = {
  [key: string]: ApiClientBuilder;
  (...segmentsOrIds: (string | number)[]): ApiClientBuilder
} & {
  get: ApiClientMethodHandler
  post: ApiClientMethodHandler
  put: ApiClientMethodHandler
  delete: ApiClientMethodHandler
  patch: ApiClientMethodHandler
}

export function createClient<R extends ResponseType = 'json'> (
  url: string,
  defaults: Omit<FetchOptions<R>, 'method'> = {}
): ApiClientBuilder {
  // Callable internal target required to use `apply` on it
  const internalTarget = (() => {}) as ApiClientBuilder

  const p = (url: string): ApiClientBuilder =>
    new Proxy(internalTarget, {
      get (_target, key: string) {
        const method = key.toUpperCase()

        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          return p(resolveURL(url, key))
        }

        const handler: ApiClientMethodHandler = <T = any, R extends ResponseType = 'json'>(
          data?: RequestInit['body'] | Record<string, any>,
          opts: FetchOptions<R> = {}
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

          opts.method = method

          return $fetch<T, R>(url, defu(opts, defaults) as FetchOptions<R>)
        }

        return handler
      },
      apply (_target, _thisArg, args: (string | number)[] = []) {
        return p(resolveURL(url, ...args.map(i => `${i}`)))
      }
    })

  return p(url)
}
