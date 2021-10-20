import { createFetch } from './base'

export * from './base'

// ref: https://github.com/tc39/proposal-global
const getGlobal = function () {
  if (typeof globalThis !== 'undefined') { return globalThis }
  if (typeof self !== 'undefined') { return self }
  if (typeof window !== 'undefined') { return window }
  if (typeof global !== 'undefined') { return global }
  if (typeof this !== 'undefined') { return this }
  throw new Error('unable to locate global object')
}

export const fetch = getGlobal().fetch || (() => {
  return Promise.reject(new Error('[ohmyfetch] global.fetch is not supported!'))
})

export const $fetch = createFetch({ fetch })
