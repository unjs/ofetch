import { createFetch } from "./base";

export * from "./base";

export type { ResponseType, ResponseMap, MappedType } from "./types";

// ref: https://github.com/tc39/proposal-global
const _globalThis = (function () {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
})();

export const fetch =
  _globalThis.fetch ||
  (() => Promise.reject(new Error("[ofetch] global.fetch is not supported!")));

export const Headers = _globalThis.Headers;
export const AbortController = _globalThis.AbortController;

export const ofetch = createFetch({ fetch, Headers, AbortController });
export const $fetch = ofetch;
