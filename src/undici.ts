import { fetch as undiciFetch } from 'undici'
import nodeFetch from 'node-fetch'
import { createFetch } from './base'

export * from './base'

export const fetch = globalThis.fetch || undiciFetch || nodeFetch

export const $fetch = createFetch({ fetch })
