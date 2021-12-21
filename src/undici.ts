import { fetch as undiciFetch } from 'undici'
import { createNodeFetch, Headers } from './node'
import { createFetch } from './base'

export * from './base'

export const fetch = globalThis.fetch || undiciFetch || createNodeFetch()

export { Headers } from './node'

export const $fetch = createFetch({ fetch, Headers })
