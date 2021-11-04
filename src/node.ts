import nodeFetch from 'node-fetch'
import { createFetch } from './base'

export * from './base'

export const fetch = globalThis.fetch || nodeFetch as any as typeof globalThis.fetch

export const $fetch = createFetch({ fetch })
