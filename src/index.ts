import { createFetch } from "./base.ts";
import type { $Fetch } from "./types.ts";

export * from "./base.ts";

export type * from "./types.ts";

// Allow patching globalThis.fetch
export const fetch: typeof globalThis.fetch = globalThis.fetch
  ? (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args)
  : () => Promise.reject(new Error("[ofetch] global.fetch is not supported!"));

export const ofetch: $Fetch = createFetch({ fetch });

export const $fetch: $Fetch = ofetch;
