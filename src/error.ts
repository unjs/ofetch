import type {
  FetchContext,
  FetchOptions,
  FetchRequest,
  FetchResponse,
} from "./fetch";

export class FetchError<T = any> extends Error {
  name = "FetchError";
  request?: FetchRequest;
  options?: FetchOptions;
  response?: FetchResponse<T>;
  data?: T;
  status?: number;
  statusText?: string;
  statusCode?: number;
  statusMessage?: string;
}

export function createFetchError<T = any>(ctx: FetchContext<T>): FetchError<T> {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";

  const method =
    (ctx.request as Request)?.method || ctx.options?.method || "GET";
  const url = (ctx.request as Request)?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;

  const statusStr = ctx.response
    ? `${ctx.response.status} ${JSON.stringify(ctx.response.statusText)}`
    : "<no response>";

  const message = `${requestStr}: ${statusStr}${
    errorMessage ? ` ${errorMessage}` : ""
  }`;

  const fetchError: FetchError<T> = new FetchError(message);

  for (const key of ["request", "options", "response"] as const) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      },
    });
  }

  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"],
  ] as const) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      },
    });
  }

  return fetchError;
}
