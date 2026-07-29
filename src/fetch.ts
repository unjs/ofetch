import type { Readable } from "node:stream";
import { withBase, withQuery } from "./utils.url.ts";
import { createFetchError } from "./error.ts";
import {
  isPayloadMethod,
  isJSONSerializable,
  detectResponseType,
  resolveFetchOptions,
  callHooks,
  callRetryHooks,
  createRetryIntent,
  createRetryHistory,
  mergeRetryOptions,
  sleep,
} from "./utils.ts";
import type {
  CreateFetchOptions,
  FetchResponse,
  FetchContext,
  $Fetch,
  FetchRequest,
  FetchOptions,
  RetryEntry,
  RetryTrigger,
} from "./types.ts";

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const retryStatusCodes = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early (Experimental)
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

// https://developer.mozilla.org/en-US/docs/Web/API/Response/body
const nullBodyResponses = new Set([101, 204, 205, 304]);

export function createFetch(globalOptions: CreateFetchOptions = {}): $Fetch {
  const { fetch = globalThis.fetch } = globalOptions;

  async function onError(
    context: FetchContext,
    history: RetryEntry[],
    timeoutSignal?: AbortSignal
  ): Promise<FetchResponse<any>> {
    // Is Abort
    // If it is an active abort, it will not retry automatically.
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException#error_names
    const isAbort =
      (context.error &&
        ((context.error.name === "AbortError" && !timeoutSignal?.aborted) ||
          context.options.signal?.aborted)) ||
      false;

    if (!isAbort) {
      let trigger: RetryTrigger = "network";
      if (context.response) {
        trigger = "status";
      } else if (
        context.error &&
        (context.error.name === "TimeoutError" ||
          (context.error.name === "AbortError" && timeoutSignal?.aborted))
      ) {
        trigger = "timeout";
      }

      // Manual retry claimed by a hook
      if (context.pendingRetry) {
        return performRetry(context, history, trigger);
      }

      // Automatic retry
      if (context.options.retry !== false) {
        let retries;
        if (typeof context.options.retry === "number") {
          retries = context.options.retry;
        } else {
          retries = isPayloadMethod(context.options.method) ? 0 : 1;
        }

        // Count the number of automatic retries since the last manual fetch
        let autoUsed = 0;
        for (
          let i = history.length - 1;
          i >= 0 && history[i].cause === "auto";
          i--
        ) {
          autoUsed++;
        }

        const responseCode =
          (context.response && context.response.status) || 500;
        if (
          autoUsed < retries &&
          (Array.isArray(context.options.retryStatusCodes)
            ? context.options.retryStatusCodes.includes(responseCode)
            : retryStatusCodes.has(responseCode))
        ) {
          const retryDelay =
            typeof context.options.retryDelay === "function"
              ? context.options.retryDelay(context)
              : context.options.retryDelay || 0;
          if (retryDelay > 0) {
            await sleep(retryDelay, context.options.signal ?? undefined);
          }
          history.push({
            cause: "auto",
            trigger,
            status: context.response?.status,
          });
          return doFetch(context.request, context.options, history);
        }
      }
    }

    // Throw normalized error
    const error = createFetchError(context);

    // Only available on V8 based runtimes (https://v8.dev/docs/stack-trace-api)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, doFetch);
    }
    throw error;
  }

  async function performRetry(
    context: FetchContext,
    history: RetryEntry[],
    trigger: RetryTrigger
  ): Promise<FetchResponse<any>> {
    const intent = context.pendingRetry!;
    history.push({
      cause: intent.cause || "manual",
      trigger,
      status: context.response?.status,
    });
    if (intent.delay && intent.delay > 0) {
      await sleep(intent.delay, context.options.signal ?? undefined);
    }
    return doFetch(
      intent.request === undefined ? context.request : intent.request,
      intent.options
        ? mergeRetryOptions(context.options, intent.options)
        : context.options,
      history
    );
  }

  async function doFetch(
    _request: FetchRequest,
    _options: FetchOptions,
    history: RetryEntry[]
  ): Promise<FetchResponse<any>> {
    const context: FetchContext = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: undefined,
      error: undefined,
      retries: createRetryHistory(history),
      pendingRetry: undefined,
      retry: (intent) => createRetryIntent(context, intent),
      cancelRetry: () => {
        context.pendingRetry = undefined;
      },
    };

    // Uppercase method name
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }

    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }

    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }

    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");

        // Automatically stringify request bodies, when not already a string.
        if (typeof context.options.body !== "string") {
          context.options.body =
            contentType === "application/x-www-form-urlencoded"
              ? new URLSearchParams(
                  context.options.body as Record<string, any>
                ).toString()
              : JSON.stringify(context.options.body);
        }

        // Set Content-Type and Accept headers to application/json by default
        // for JSON serializable request bodies.
        // Pass empty object as older browsers don't support undefined.
        context.options.headers = new Headers(context.options.headers || {});
        if (!contentType) {
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

    // The timeout applies per attempt: a fresh timeout signal is created for
    // every attempt and combined with the caller's signal, which is kept
    // untouched on `context.options` so retries start from a clean slate.
    const timeoutSignal = context.options.timeout
      ? AbortSignal.timeout(context.options.timeout)
      : undefined;

    try {
      context.response = await fetch(
        context.request,
        (timeoutSignal
          ? {
              ...context.options,
              signal: context.options.signal
                ? AbortSignal.any([timeoutSignal, context.options.signal])
                : timeoutSignal,
            }
          : context.options) as RequestInit
      );
    } catch (error) {
      context.error = error as Error;
      if (context.options.onRequestError) {
        await callRetryHooks(
          context as FetchContext & { error: Error },
          context.options.onRequestError
        );
      }
      return await onError(context, history, timeoutSignal);
    }

    const hasBody =
      (context.response.body ||
        // https://github.com/unjs/ofetch/issues/324
        // https://github.com/unjs/ofetch/issues/294
        // https://github.com/JakeChampion/fetch/issues/1454
        (context.response as any)._bodyInit) &&
      !nullBodyResponses.has(context.response.status) &&
      context.options.method !== "HEAD";
    if (hasBody) {
      const responseType =
        (context.options.parseResponse
          ? "json"
          : context.options.responseType) ||
        detectResponseType(context.response.headers.get("content-type") || "");

      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          if (data) {
            const parseFunction = context.options.parseResponse || JSON.parse;
            context.response._data = parseFunction(data);
          }
          break;
        }
        case "stream": {
          context.response._data =
            context.response.body || (context.response as any)._bodyInit; // (see refs above)
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }

    if (context.options.onResponse) {
      await callRetryHooks(
        context as FetchContext & { response: FetchResponse<any> },
        context.options.onResponse
      );
    }

    if (
      !context.options.ignoreResponseError &&
      context.response.status >= 400 &&
      context.response.status < 600
    ) {
      if (context.options.onResponseError) {
        await callRetryHooks(
          context as FetchContext & { response: FetchResponse<any> },
          context.options.onResponseError
        );
      }
      return await onError(context, history, timeoutSignal);
    }

    if (context.pendingRetry) {
      return performRetry(context, history, "status");
    }

    return context.response;
  }

  const $fetchRaw = function $fetchRaw(
    _request: FetchRequest,
    _options: FetchOptions = {}
  ) {
    return doFetch(_request, _options, []);
  } as $Fetch["raw"];

  const $fetch = async function $fetch(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  } as $Fetch;

  $fetch.raw = $fetchRaw;

  $fetch.native = (...args) => fetch(...args);

  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) =>
    createFetch({
      ...globalOptions,
      ...customGlobalOptions,
      defaults: {
        ...globalOptions.defaults,
        ...customGlobalOptions.defaults,
        ...defaultOptions,
      },
    });

  return $fetch;
}
