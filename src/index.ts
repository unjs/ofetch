import { createFetch } from "./base";

export * from "./base";

export type * from "./types";

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
export const fetch = _globalThis.fetch
  ? (...args: Parameters<typeof globalThis.fetch>) => _globalThis.fetch(...args)
  : () => Promise.reject(new Error("[ofetch] global.fetch is not supported!"));

export const Headers = _globalThis.Headers;
export const AbortController = _globalThis.AbortController;

export const ofetch = createFetch({ fetch, Headers, AbortController });
export const $fetch = ofetch;
