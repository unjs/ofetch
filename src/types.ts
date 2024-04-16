// --------------------------
// $fetch API
// --------------------------

export interface $Fetch {
  <T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>
  ): Promise<MappedResponseType<R, T>>;
  raw<T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>
  ): Promise<FetchResponse<MappedResponseType<R, T>>>;
  native: Fetch;
  create(defaults: GlobalFetchOptions): $Fetch;
}

// --------------------------
// Context
// --------------------------

export interface FetchContext<T = any, R extends ResponseType = ResponseType> {
  request: FetchRequest;
  // eslint-disable-next-line no-use-before-define
  options: FetchOptions<R>;
  response?: FetchResponse<T>;
  error?: Error;
}

// --------------------------
// Interceptor
// --------------------------

export type InterceptorFn<T> = (context: T, data: any) => Promise<any> | any
export type Interceptor<T> = InterceptorFn<T> | { 
  strategy: 'overwrite' | "manual" | "before" | "after", 
  handler: InterceptorFn<T> 
}

export type OmitInterceptors<T> = Omit<T, "onRequest" | "onRequestError" | "onResponse" | "onResponseError">;

// --------------------------
// Options
// --------------------------

export interface FetchOptions<R extends ResponseType = ResponseType>
  extends Omit<RequestInit, "body"> {
  baseURL?: string;
  body?: RequestInit["body"] | Record<string, any>;
  ignoreResponseError?: boolean;
  params?: Record<string, any>;
  query?: Record<string, any>;
  parseResponse?: (responseText: string) => any;
  responseType?: R;

  /**
   * @experimental Set to "half" to enable duplex streaming.
   * Will be automatically set to "half" when using a ReadableStream as body.
   * https://fetch.spec.whatwg.org/#enumdef-requestduplex
   */
  duplex?: "half" | undefined;

  /** timeout in milliseconds */
  timeout?: number;

  retry?: number | false;
  /** Delay between retries in milliseconds. */
  retryDelay?: number;
  /** Default is [408, 409, 425, 429, 500, 502, 503, 504] */
  retryStatusCodes?: number[];

  onRequest?: InterceptorFn<FetchContext>
  onRequestError?: InterceptorFn<FetchContext & { error: Error }>
  onResponse?: InterceptorFn<FetchContext & { response: FetchResponse<R> }>
  onResponseError?: InterceptorFn<FetchContext & { response: FetchResponse<R> }>
}

export interface GlobalFetchOptions<R extends ResponseType = ResponseType> 
  extends OmitInterceptors<FetchOptions<R>> {
  onRequest?: Interceptor<FetchContext>
  onRequestError?: Interceptor<FetchContext & { error: Error }>
  onResponse?: Interceptor<FetchContext & { response: FetchResponse<R> }>
  onResponseError?: Interceptor<FetchContext & { response: FetchResponse<R> }>
}

export interface CreateFetchOptions {
  // eslint-disable-next-line no-use-before-define
  defaults?: GlobalFetchOptions;
  fetch?: Fetch;
  Headers?: typeof Headers;
  AbortController?: typeof AbortController;
}

export type GlobalOptions = Pick<
  FetchOptions,
  "timeout" | "retry" | "retryDelay"
>;

// --------------------------
// Response Types
// --------------------------

export interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type ResponseType = keyof ResponseMap | "json";

export type MappedResponseType<
  R extends ResponseType,
  JsonType = any,
> = R extends keyof ResponseMap ? ResponseMap[R] : JsonType;

export interface FetchResponse<T> extends Response {
  _data?: T;
}

// --------------------------
// Error
// --------------------------

export interface IFetchError<T = any> extends Error {
  request?: FetchRequest;
  options?: FetchOptions;
  response?: FetchResponse<T>;
  data?: T;
  status?: number;
  statusText?: string;
  statusCode?: number;
  statusMessage?: string;
}

// --------------------------
// Other types
// --------------------------

export type Fetch = typeof globalThis.fetch;

export type FetchRequest = RequestInfo;

export interface SearchParameters {
  [key: string]: any;
}
