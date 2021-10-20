import { createFetch } from './base'

export * from './base'

const getGlobal = function () {
  if (typeof globalThis !== 'undefined') { return globalThis }
  if (typeof self !== 'undefined') { return self }
  if (typeof window !== 'undefined') { return window }
  if (typeof global !== 'undefined') { return global }
  return (function() { return this })();
}

export const fetch = getGlobal().fetch || (() => {
  return Promise.reject(new Error('[ohmyfetch] global.fetch is not supported!'))
})

export const $fetch = createFetch({ fetch })
