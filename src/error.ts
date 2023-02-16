import type { FetchRequest, FetchResponse } from "./fetch";

export class FetchError<T = any> extends Error {
  name = "FetchError";
  request?: FetchRequest;
  response?: FetchResponse<T>;
  data?: T;
  status?: number;
  statusText?: string;
  statusCode?: number;
  statusMessage?: string;
}

export function createFetchError<T = any>(
  request: FetchRequest,
  error?: Error,
  response?: FetchResponse<T>
): FetchError<T> {
  let message = "";
  if (error) {
    message = error.message;
  }
  if (request && response) {
    message = `${message} (${response.status} ${
      response.statusText
    } (${request.toString()}))`;
  } else if (request) {
    message = `${message} (${request.toString()})`;
  }

  const fetchError: FetchError<T> = new FetchError(message);

  Object.defineProperty(fetchError, "request", {
    get() {
      return request;
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
