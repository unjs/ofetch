import * as nodeFetch from 'node-fetch'
import { createFetch } from './base'

export * from './base'

export const $fetch = createFetch({
  fetch: nodeFetch.default as any // TODO
})
