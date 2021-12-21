import { createFetch } from './base'

export * from './base'

// ref: https://github.com/tc39/proposal-global
const _globalThis = (function () {
  if (typeof globalThis !== 'undefined') { return globalThis }
  if (typeof self !== 'undefined') { return self }
  if (typeof window !== 'undefined') { return window }
  if (typeof global !== 'undefined') { return global }
  throw new Error('unable to locate global object')
})()

export const fetch = _globalThis.fetch ||
 (() => Promise.reject(new Error('[ohmyfetch] global.fetch is not supported!')))

export const Headers = _globalThis.Headers

export const $fetch = createFetch({ fetch, Headers })
