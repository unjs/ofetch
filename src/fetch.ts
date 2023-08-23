import destr from "destr";
import { withBase, withQuery } from "ufo";
import type { Fetch, RequestInfo, RequestInit, Response } from "./types";
import { createFetchError } from "./error";
import {
  isPayloadMethod,
  isJSONSerializable,
  detectResponseType,
  ResponseType,
  MappedType,
  mergeFetchOptions,
} from "./utils";

export interface CreateFetchOptions {
  // eslint-disable-next-line no-use-before-define
  defaults?: FetchOptions;
  fetch?: Fetch;
  Headers?: typeof Headers;
  AbortController?: typeof AbortController;
}

export type FetchRequest = RequestInfo;
export interface FetchResponse<T> extends Response {
  _data?: T;
}
export interface SearchParameters {
  [key: string]: any;
}

export interface FetchContext<T = any, R extends ResponseType = ResponseType> {
  request: FetchRequest;
  // eslint-disable-next-line no-use-before-define
  options: FetchOptions<R>;
  response?: FetchResponse<T>;
  error?: Error;
}

export interface FetchOptions<R extends ResponseType = ResponseType>
  extends Omit<RequestInit, "body"> {
  baseURL?: string;
  body?: RequestInit["body"] | Record<string, any>;
  ignoreResponseError?: boolean;
  params?: SearchParameters;
  query?: SearchParameters;
  parseResponse?: (responseText: string) => any;
  responseType?: R;
  retry?: number | false;
  /** timeout in milliseconds */
  timeout?: number;
  /** Delay between retries in milliseconds. */
  retryDelay?: number;

  onRequest?(context: FetchContext): Promise<void> | void;
  onRequestError?(
    context: FetchContext & { error: Error }
  ): Promise<void> | void;
  onResponse?(
    context: FetchContext & { response: FetchResponse<R> }
  ): Promise<void> | void;
  onResponseError?(
    context: FetchContext & { response: FetchResponse<R> }
  ): Promise<void> | void;
}

export interface $Fetch {
  <T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>
  ): Promise<MappedType<R, T>>;
  raw<T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>
  ): Promise<FetchResponse<MappedType<R, T>>>;
  native: Fetch;
  create(defaults: FetchOptions): $Fetch;
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const retryStatusCodes = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, //  Gateway Timeout
]);

export function createFetch(globalOptions: CreateFetchOptions = {}): $Fetch {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController,
  } = globalOptions;

  async function onError(context: FetchContext): Promise<FetchResponse<any>> {
    // Is Abort
    // If it is an active abort, it will not retry automatically.
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException#error_names
    const isAbort =
      (context.error &&
        context.error.name === "AbortError" &&
        !context.options.timeout) ||
      false;
    // Retry
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }

      const responseCode = (context.response && context.response.status) || 500;
      if (retries > 0 && retryStatusCodes.has(responseCode)) {
        const retryDelay = context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        // Timeout
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1,
          timeout: context.options.timeout,
        });
      }
    }

    // Throw normalized error
    const error = createFetchError(
      context.request,
      context.error,
      context.response
    );

    // Only available on V8 based runtimes (https://v8.dev/docs/stack-trace-api)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }

  const $fetchRaw: $Fetch["raw"] = async function $fetchRaw(
    _request,
    _options = {}
  ) {
    const context: FetchContext = {
      request: _request,
      options: mergeFetchOptions(_options, globalOptions.defaults, Headers),
      response: undefined,
      error: undefined,
    };

    // Uppercase method name
    context.options.method = context.options.method?.toUpperCase();

    if (context.options.onRequest) {
      await context.options.onRequest(context);
    }

    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query || context.options.params) {
        context.request = withQuery(context.request, {
          ...context.options.params,
          ...context.options.query,
        });
      }
      if (
        context.options.body &&
        isPayloadMethod(context.options.method) &&
        isJSONSerializable(context.options.body)
      ) {
        // Automatically JSON stringify request bodies, when not already a string.
        context.options.body =
          typeof context.options.body === "string"
            ? context.options.body
            : JSON.stringify(context.options.body);

        // Set Content-Type and Accept headers to application/json by default
        // for JSON serializable request bodies.
        // Pass empty object as older browsers don't support undefined.
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      }
    }

    // TODO: Can we merge signals?
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), context.options.timeout);
      context.options.signal = controller.signal;
    }

    try {
      context.response = await fetch(
        context.request,
        context.options as RequestInit
      );
    } catch (error) {
      context.error = error as Error;
      if (context.options.onRequestError) {
        await context.options.onRequestError(context as any);
      }
      return await onError(context);
    }

    const responseType =
      (context.options.parseResponse ? "json" : context.options.responseType) ||
      detectResponseType(context.response.headers.get("content-type") || "");

    // We override the `.json()` method to parse the body more securely with `destr`
    if (responseType === "json") {
      const data = await context.response.text();
      const parseFunction = context.options.parseResponse || destr;
      context.response._data = parseFunction(data);
    } else if (responseType === "stream") {
      context.response._data = context.response.body;
    } else {
      context.response._data = await context.response[responseType]();
    }

    if (context.options.onResponse) {
      await context.options.onResponse(context as any);
    }

    if (
      !context.options.ignoreResponseError &&
      context.response.status >= 400 &&
      context.response.status < 600
    ) {
      if (context.options.onResponseError) {
        await context.options.onResponseError(context as any);
      }
      return await onError(context);
    }

    return context.response;
  };

  const $fetch = async function $fetch(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  } as $Fetch;

  $fetch.raw = $fetchRaw;

  $fetch.native = (...args) => fetch(...args);

  $fetch.create = (defaultOptions = {}) =>
    createFetch({
      ...globalOptions,
      defaults: {
        ...globalOptions.defaults,
        ...defaultOptions,
      },
    });

  return $fetch;
}
