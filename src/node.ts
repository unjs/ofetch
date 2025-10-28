import http from "node:http";
import https, { type AgentOptions } from "node:https";
import nodeFetch, {
  Headers as _Headers,
  AbortController as _AbortController,
} from "node-fetch-native";

import { createFetch } from "./base.ts";
import type { $Fetch } from "./types.ts";

export * from "./base.ts";
export type * from "./types.ts";

export function createNodeFetch(): typeof globalThis.fetch {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return nodeFetch;
  }

  // https://github.com/node-fetch/node-fetch#custom-agent
  const agentOptions: AgentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL: any) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    },
  };

  return function nodeFetchWithKeepAlive(
    input: RequestInfo,
    init?: RequestInit
  ) {
    return (nodeFetch as any)(input, { ...nodeFetchOptions, ...init });
  } as any;
}

export const fetch: typeof globalThis.fetch = globalThis.fetch
  ? (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args)
  : (createNodeFetch() as typeof globalThis.fetch);

export const Headers: typeof globalThis.Headers =
  globalThis.Headers || _Headers;
export const AbortController: typeof globalThis.AbortController =
  globalThis.AbortController || _AbortController;

export const ofetch: $Fetch = createFetch({ fetch, Headers, AbortController });
export const $fetch: $Fetch = ofetch;
