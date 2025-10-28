import { createFetch } from "./base.ts";
import type { $Fetch } from "./types.ts";

export * from "./base.ts";

export type * from "./types.ts";

// ref: https://github.com/tc39/proposal-global
const _globalThis = (function () {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  /* eslint-disable unicorn/prefer-global-this */
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  /* eslint-enable unicorn/prefer-global-this */
  throw new Error("unable to locate global object");
})();

// ref: https://github.com/unjs/ofetch/issues/295
export const fetch: typeof globalThis.fetch = _globalThis.fetch
  ? (...args: Parameters<typeof globalThis.fetch>) => _globalThis.fetch(...args)
  : () => Promise.reject(new Error("[ofetch] global.fetch is not supported!"));

export const Headers: typeof globalThis.Headers = _globalThis.Headers;
export const AbortController: typeof globalThis.AbortController =
  _globalThis.AbortController;

export const ofetch: $Fetch = createFetch({ fetch, Headers, AbortController });
export const $fetch: $Fetch = ofetch;
