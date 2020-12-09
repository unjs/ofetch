import { createFetch } from './base'

export * from './base'

export const $fetch = createFetch({
  fetch: globalThis.fetch
})
