import type {
  Arrayable,
  FetchContext,
  FetchOptions,
  Interceptor,
  InterceptorCb,
  ResponseType,
} from "./types";

const interceptorNames = [
  "onRequest",
  "onResponse",
  "onRequestError",
  "onResponseError",
] as const;

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
export function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}

export function isJSONSerializable(value: any) {
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

  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }

  return "blob";
}

// Merging of fetch option objects.
export function mergeFetchOptions(
  input?: FetchOptions,
  defaults?: FetchOptions,
  Headers = globalThis.Headers
): FetchOptions {
  const interceptors: Pick<FetchOptions, (typeof interceptorNames)[number]> =
    {};

  for (const key of interceptorNames) {
    if (input?.[key] || defaults?.[key]) {
      interceptors[key] = mergeInterceptors(defaults?.[key], input?.[key]);
    }
  }

  const merged: FetchOptions = {
    ...defaults,
    ...input,
    ...interceptors,
  };

  // Merge params and query
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params,
    };
  }
  if (defaults?.query && input?.query) {
    merged.query = {
      ...defaults?.query,
      ...input?.query,
    };
  }

  // Merge headers
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults?.headers || {});
    for (const [key, value] of new Headers(input?.headers || {})) {
      merged.headers.set(key, value);
    }
  }

  return merged;
}

function mergeInterceptors(
  defaults?: Arrayable<Interceptor<any>>,
  input?: Arrayable<Interceptor<any>>
): InterceptorCb<any>[] {
  return [
    ...(defaults ? [defaults].flat() : []),
    ...(input ? [input].flat() : []),
  ]
    .sort((a: any, b: any) => {
      if (a?.enforce === "pre" || b?.enforce === "post") {
        return -1;
      }
      if (b?.enforce === "pre" || a?.enforce === "post") {
        return 1;
      }
      return 0;
    })
    .map((item) => (typeof item === "object" ? item.handler : item));
}

export async function callInterceptors(
  ctx: FetchContext,
  name: (typeof interceptorNames)[number]
) {
  if (!ctx.options[name]) {
    return;
  }
  for (const interceptor of ctx.options[name] as InterceptorCb<any>[]) {
    await interceptor(ctx);
  }
}
