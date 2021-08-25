import * as nodeFetch from 'node-fetch'
import { createFetch } from './base'

export * from './base'

export const fetch = nodeFetch.default as any as typeof globalThis.fetch

export const $fetch = createFetch({ fetch })
