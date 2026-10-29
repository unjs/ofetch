import { createFetch } from "./base.ts";
import type { $Fetch } from "./types.ts";

export * from "./base.ts";

export type * from "./types.ts";

// Allow patching globalThis.fetch
export const fetch: typeof globalThis.fetch = globalThis.fetch
  ? (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args)
  : () => Promise.reject(new Error("[ofetch] global.fetch is not supported!"));

// Mark the default client creation as pure so bundlers can drop it via
// tree-shaking when only other exports (e.g. `FetchError`) are imported.
export const ofetch: $Fetch = /* @__PURE__ */ createFetch({ fetch });

export const $fetch: $Fetch = ofetch;
