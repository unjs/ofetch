import type { FetchRequest, FetchResponse } from './fetch'

export class FetchError<T = any> extends Error {
  name: 'FetchError' = 'FetchError'
  request?: FetchRequest
  response?: FetchResponse<T>
  data?: T
}

export function createFetchError<T = any> (request: FetchRequest, response: FetchResponse<T>): FetchError<T> {
  const message = `${response.status} ${response.statusText} (${request.toString()})`
  const error: FetchError<T> = new FetchError(message)

  Object.defineProperty(error, 'request', { get () { return request } })
  Object.defineProperty(error, 'response', { get () { return response } })
  Object.defineProperty(error, 'data', { get () { return response.data } })

  const stack = error.stack
  Object.defineProperty(error, 'stack', { get () { return normalizeStack(stack) } })

  return error
}

function normalizeStack (stack: string = '') {
  return stack.split('\n')
    .filter(l =>
      !l.includes('createFetchError') &&
      !l.includes('at $fetch') &&
      !l.includes('at $fetchRaw') &&
      !l.includes('processTicksAndRejections')
    )
    .join('\n')
}
