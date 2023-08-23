import type { FetchOptions, FetchRequest, FetchResponse } from "./fetch";

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

export function createFetchError<T = any>(
  request: FetchRequest,
  options: FetchOptions,
  error?: Error,
  response?: FetchResponse<T>
): FetchError<T> {
  const errorMessage = error?.message || error?.toString() || "";

  const method = (request as Request)?.method || options?.method || "GET";
  const url = (request as Request)?.url || String(request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;

  const statusStr = response
    ? `${response.status} ${JSON.stringify(response.statusText)}`
    : "<no response>";

  const message = `${requestStr}: ${statusStr}${
    errorMessage ? ` ${errorMessage}` : ""
  }`;

  const fetchError: FetchError<T> = new FetchError(message);

  Object.defineProperty(fetchError, "request", {
    get() {
      return request;
    },
  });
  Object.defineProperty(fetchError, "options", {
    get() {
      return options;
    },
  });
  Object.defineProperty(fetchError, "response", {
    get() {
      return response;
    },
  });
  Object.defineProperty(fetchError, "data", {
    get() {
      return response && response._data;
    },
  });
  Object.defineProperty(fetchError, "status", {
    get() {
      return response && response.status;
    },
  });
  Object.defineProperty(fetchError, "statusText", {
    get() {
      return response && response.statusText;
    },
  });
  Object.defineProperty(fetchError, "statusCode", {
    get() {
      return response && response.status;
    },
  });
  Object.defineProperty(fetchError, "statusMessage", {
    get() {
      return response && response.statusText;
    },
  });

  return fetchError;
}
