import type {
  FetchContext,
  FetchHook,
  FetchRetryHook,
  FetchOptions,
  FetchRequest,
  ResolvedFetchOptions,
  ResponseType,
  RetryCause,
  RetryIntent,
  RetryHistory,
  RetryEntry,
} from "./types.ts";

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
export function isPayloadMethod(method = "GET"): boolean {
  return payloadMethods.has(method.toUpperCase());
}

export function isJSONSerializable(value: any): boolean {
  if (value === undefined) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false; // bigint, function, symbol, undefined
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  // `FormData` and `URLSearchParams` shouldn't have a `toJSON` method,
  // but Bun adds it, which is non-standard.
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return (
    (value.constructor && value.constructor.name === "Object") ||
    typeof value.toJSON === "function"
  );
}

const textTypes = new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html",
]);

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

// This provides reasonable defaults for the correct parser based on Content-Type header.
export function detectResponseType(_contentType = ""): ResponseType {
  if (!_contentType) {
    return "json";
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(";").shift() || "";

  if (JSON_RE.test(contentType)) {
    return "json";
  }

  // TODO
  // if (contentType === 'application/octet-stream') {
  //   return 'stream'
  // }

  // SSE
  // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
  if (contentType === "text/event-stream") {
    return "stream";
  }

  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }

  return "blob";
}

export function resolveFetchOptions<
  R extends ResponseType = ResponseType,
  T = any,
>(
  request: FetchRequest,
  input: FetchOptions<R, T> | undefined,
  defaults: FetchOptions<R, T> | undefined,
  Headers: typeof globalThis.Headers
): ResolvedFetchOptions<R, T> {
  // Merge headers
  const headers = mergeHeaders(
    input?.headers ?? (request as Request)?.headers,
    defaults?.headers,
    Headers
  );

  // Merge query/params
  let query: Record<string, any> | undefined;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query,
    };
  }

  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers,
  };
}

function mergeHeaders(
  input: HeadersInit | undefined,
  defaults: HeadersInit | undefined,
  Headers: typeof globalThis.Headers
): Headers {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input)
      ? input
      : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}

export async function callHooks<C extends FetchContext = FetchContext>(
  context: C,
  hooks: FetchHook<C> | FetchHook<C>[] | undefined
): Promise<void> {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const onDone = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onDone);
      resolve();
    };
    const timer = setTimeout(onDone, ms);
    signal?.addEventListener("abort", onDone);
  });
}

const kRetryIntent = /* @__PURE__ */ Symbol.for("ofetch:retryIntent");

export function createRetryHistory(history: RetryEntry[]): RetryHistory {
  return {
    get history() {
      return history;
    },
    get last() {
      return history.at(-1);
    },
    count(cause?: RetryCause) {
      return cause === undefined
        ? history.length
        : history.filter((record) => record.cause === cause).length;
    },
  };
}

export function createRetryIntent<
  T = any,
  R extends ResponseType = ResponseType,
>(
  context: FetchContext<T, R>,
  input: RetryIntent<T, R> = {}
): RetryIntent<T, R> {
  const body = context.options.body;
  if (
    body &&
    (typeof (body as ReadableStream).pipeTo === "function" ||
      typeof (body as any).pipe === "function")
  ) {
    throw new TypeError(
      "[ofetch] Cannot retry: request body is a stream and cannot be replayed."
    );
  }
  return { ...input, [kRetryIntent]: true } as RetryIntent<T, R>;
}

export function mergeRetryOptions(
  base: FetchOptions | undefined,
  patch: FetchOptions
): FetchOptions {
  const merged: FetchOptions = { ...base, ...patch };
  if (base?.headers && patch.headers) {
    merged.headers = mergeHeaders(patch.headers, base.headers, Headers);
  }
  return merged;
}

export async function callRetryHooks<
  C extends FetchContext<any, any> = FetchContext,
>(
  context: C,
  hooks: FetchRetryHook<C> | FetchRetryHook<C>[] | undefined
): Promise<void> {
  if (!hooks) {
    return;
  }
  for (const hook of Array.isArray(hooks) ? hooks : [hooks]) {
    const result = await hook(context);
    if (result && (result as any)[kRetryIntent]) {
      const pending = context.pendingRetry;
      if (pending) {
        // An intent for a different request is a conflict
        if (
          result.request !== undefined &&
          result.request !== (pending.request ?? context.request)
        ) {
          console.error(
            "[ofetch] Ignoring a retry intent targeting a different request than the pending retry."
          );
          continue;
        }
        if (result.delay !== undefined) {
          pending.delay = Math.max(pending.delay || 0, result.delay);
        }
        if (result.options) {
          pending.options = mergeRetryOptions(pending.options, result.options);
        }
      } else {
        context.pendingRetry = {
          cause:
            !result.cause || result.cause === "auto" ? "manual" : result.cause,
          request: result.request,
          options: result.options,
          delay: result.delay,
        } as typeof context.pendingRetry;
      }
    }
  }
}
