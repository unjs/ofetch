import http from 'http'
import https, { AgentOptions } from 'https'
import nodeFetch from 'node-fetch'

import { createFetch } from './base'

export * from './base'

function createNodeFetch () {
  const nodeFetchOptions = {}

  // https://github.com/node-fetch/node-fetch#custom-agent
  if (JSON.parse(process.env.FETCH_AGENT || 'true')) {
    const agentOpts: AgentOptions = {
      keepAlive: JSON.parse(process.env.FETCH_KEEP_ALIVE || 'true'),
      maxSockets: JSON.parse(process.env.FETCH_AGENT_MAX_SOCKETS || '16'),
      timeout: 1000
    }
    const httpAgent = new http.Agent(agentOpts)
    const httpsAgent = new https.Agent(agentOpts)
    Object.assign(nodeFetchOptions, {
      agent (_parsedURL: any) {
        if (_parsedURL.protocol === 'http:') {
          return httpAgent
        } else {
          return httpsAgent
        }
      }
    })
  }

  return function (input: RequestInfo, init?: RequestInit) {
    return (nodeFetch as any)(input, {
      ...nodeFetchOptions,
      ...init
    }).catch((err: Error) => {
      throw err
    })
  }
}

export const _fetch = globalThis.fetch || createNodeFetch()

export const $fetch = createFetch({ fetch: _fetch })
