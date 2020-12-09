import type { Response, RequestInfo } from './types'

export class FetchError extends Error {
  name: 'FetchError' = 'FetchError'
}

export function createFetchError<T = any> (response: Response, input: RequestInfo, data: T): FetchError {
  const message = `${response.status} ${response.statusText} (${input.toString()})`
  const error = new FetchError(message)

  Object.defineProperty(error, 'data', { get () { return data } })

  const stack = error.stack
  Object.defineProperty(error, 'stack', { get () { return normalizeStack(stack) } })

  return error
}

function normalizeStack (stack: string = '') {
  return stack.split('\n')
    .filter(l =>
      !l.includes('createFetchError') &&
      !l.includes('at $fetch') &&
      !l.includes('processTicksAndRejections')
    )
    .join('\n')
}
