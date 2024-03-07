import type { Readable } from "node:stream";
import destr from "destr";
import { withBase, withQuery } from "ufo";
import { createFetchError } from "./error";
import {
  isPayloadMethod,
  isJSONSerializable,
  detectResponseType,
  mergeFetchOptions,
} from "./utils";
import type {
  CreateFetchOptions,
  FetchResponse,
  FetchContext,
  $Fetch,
} from "./types";

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

// https://developer.mozilla.org/en-US/docs/Web/API/Response/body
const nullBodyResponses = new Set([101, 204, 205, 304]);

export function createFetch(globalOptions: CreateFetchOptions = {}): $Fetch {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController,
  } = globalOptions;

  async function getRetryResponse(
    context: FetchContext
  ): Promise<FetchResponse<any> | void> {
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
      const hasStatusCode = Array.isArray(context.options.retryStatusCodes)
        ? context.options.retryStatusCodes.includes(responseCode)
        : retryStatusCodes.has(responseCode);
      // @ts-expect-error value for internal use
      const { retry, retryDelay = 0, _retryCount = 1 } = context.options;
      const shouldRetry =
        typeof retry === "function" ? await retry(context, _retryCount) : false;

      if ((retries > 0 && hasStatusCode) || shouldRetry) {
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        // Timeout
        return $fetchRaw(context.request, {
          ...context.options,
          retry: typeof retry === "function" ? retry : retries - 1,
          // @ts-expect-error value for internal use
          _retryCount: _retryCount + 1,
        });
      }
    }
  }

  async function onError(context: FetchContext): Promise<FetchResponse<any>> {
    const retryResponse = await getRetryResponse(context);

    if (retryResponse) {
      return retryResponse;
    }

    // Throw normalized error
    const error = createFetchError(context);

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
    }

    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        // JSON Body
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
      } else if (
        // ReadableStream Body
        ("pipeTo" in (context.options.body as ReadableStream) &&
          typeof (context.options.body as ReadableStream).pipeTo ===
            "function") ||
        // Node.js Stream Body
        typeof (context.options.body as Readable).pipe === "function"
      ) {
        // eslint-disable-next-line unicorn/no-lonely-if
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
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

    const hasBody =
      context.response.body &&
      !nullBodyResponses.has(context.response.status) &&
      context.options.method !== "HEAD";
    if (hasBody) {
      const responseType =
        (context.options.parseResponse
          ? "json"
          : context.options.responseType) ||
        detectResponseType(context.response.headers.get("content-type") || "");

      // We override the `.json()` method to parse the body more securely with `destr`
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
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

    const retryResponse = await getRetryResponse(context);

    return retryResponse || context.response;
  };

  const $fetch = async function $fetch(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  } as $Fetch;

  $fetch.raw = $fetchRaw;

  // @ts-expect-error TODO: Fix conflicting types with undici
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
