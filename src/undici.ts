import { fetch as undiciFetch } from 'undici'
import { createNodeFetch } from './node'
import { createFetch } from './base'

export * from './base'

export const fetch = globalThis.fetch || undiciFetch || createNodeFetch()

export const $fetch = createFetch({ fetch })
