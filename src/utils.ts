import type { FetchOptions } from "./fetch";

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

export interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type ResponseType = keyof ResponseMap | "json";
export type MappedType<
  R extends ResponseType,
  JsonType = any
> = R extends keyof ResponseMap ? ResponseMap[R] : JsonType;

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
  input: FetchOptions | undefined,
  defaults: FetchOptions | undefined,
  Headers = globalThis.Headers
): FetchOptions {
  const merged: FetchOptions = {
    ...defaults,
    ...input,
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
