import type { FetchRequest, FetchResponse } from './fetch'

export class FetchError<T = any> extends Error {
  name: 'FetchError' = 'FetchError'
  request?: FetchRequest
  response?: FetchResponse<T>
  data?: T
}

export function createFetchError<T = any> (request: FetchRequest, error?: Error, response?: FetchResponse<T>): FetchError<T> {
  let message = ''
  if (request && response) {
    message = `${response.status} ${response.statusText} (${request.toString()})`
  }
  if (error) {
    message = `${error.message} (${message})`
  }

  const fetchError: FetchError<T> = new FetchError(message)

  Object.defineProperty(fetchError, 'request', { get () { return request } })
  Object.defineProperty(fetchError, 'response', { get () { return response } })
  Object.defineProperty(fetchError, 'data', { get () { return response && response._data } })

  return fetchError
}
