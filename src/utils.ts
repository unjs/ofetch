import type {
  FetchContext,
  FetchHook,
  FetchOptions,
  FetchRequest,
  ResolvedFetchOptions,
  ResponseType,
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
  // `typeof null` is `"object"`, so check for `null` explicitly before the
  // general object handling below (which would throw on `null.buffer`).
  if (t === "string" || t === "number" || t === "boolean" || value === null) {
    return true;
  }
  if (t !== "object") {
    return false; // bigint, function, symbol, undefined
  }
  if (Array.isArray(value)) {
    return true;
  }
  // `FormData` and `URLSearchParams` shouldn't have a `toJSON` method,
  // but Bun adds it, which is non-standard. Check before `value.buffer`
  // to avoid throwing on objects whose `buffer` getter throws.
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  if (value instanceof ArrayBuffer) {
    return false;
  }
  if (
    typeof SharedArrayBuffer !== "undefined" &&
    value instanceof SharedArrayBuffer
  ) {
    return false;
  }
  // Guard against objects with throwing `buffer` getters or no buffer property
  try {
    if (value.buffer) {
      return false;
    }
  } catch {
    // If `buffer` access throws, fall through to constructor/JSON checks
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
