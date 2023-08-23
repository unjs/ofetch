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

  Object.defineProperty(fetchError, "request", {
    get() {
      return ctx.request;
    },
  });
  Object.defineProperty(fetchError, "options", {
    get() {
      return ctx.options;
    },
  });
  Object.defineProperty(fetchError, "response", {
    get() {
      return ctx.response;
    },
  });
  Object.defineProperty(fetchError, "data", {
    get() {
      return ctx.response && ctx.response._data;
    },
  });
  Object.defineProperty(fetchError, "status", {
    get() {
      return ctx.response && ctx.response.status;
    },
  });
  Object.defineProperty(fetchError, "statusText", {
    get() {
      return ctx.response && ctx.response.statusText;
    },
  });
  Object.defineProperty(fetchError, "statusCode", {
    get() {
      return ctx.response && ctx.response.status;
    },
  });
  Object.defineProperty(fetchError, "statusMessage", {
    get() {
      return ctx.response && ctx.response.statusText;
    },
  });

  return fetchError;
}
