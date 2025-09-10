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
  create(defaults: FetchOptions, globalOptions?: CreateFetchOptions): $Fetch;
}

// --------------------------
// Options
// --------------------------

export interface FetchOptions<R extends ResponseType = ResponseType, T = any>
  extends Omit<RequestInit, "body">,
    FetchHooks<T, R> {
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
   * @see https://fetch.spec.whatwg.org/#enumdef-requestduplex
   */
  duplex?: "half" | undefined;

  /**
   * Only supported in Node.js >= 18 using undici
   *
   * @see https://undici.nodejs.org/#/docs/api/Dispatcher
   */
  dispatcher?: InstanceType<typeof import("undici").Dispatcher>;

  /**
   * Only supported older Node.js versions using node-fetch-native polyfill.
   */
  agent?: unknown;

  /** timeout in milliseconds */
  timeout?: number;

  retry?: number | false;

  /** Delay between retries in milliseconds. */
  retryDelay?: number | ((context: FetchContext<T, R>) => number);

  /** Default is [408, 409, 425, 429, 500, 502, 503, 504] */
  retryStatusCodes?: number[];
}

export interface ResolvedFetchOptions<
  R extends ResponseType = ResponseType,
  T = any,
> extends FetchOptions<R, T> {
  headers: Headers;
}

export interface CreateFetchOptions {
  defaults?: FetchOptions;
  fetch?: Fetch;
  Headers?: typeof Headers;
  AbortController?: typeof AbortController;
}

export type GlobalOptions = Pick<
  FetchOptions,
  "timeout" | "retry" | "retryDelay"
>;

// --------------------------
// Hooks and Context
// --------------------------

export interface FetchContext<T = any, R extends ResponseType = ResponseType> {
  request: FetchRequest;
  options: ResolvedFetchOptions<R>;
  response?: FetchResponse<T>;
  error?: Error;
}

type MaybePromise<T> = T | Promise<T>;
type MaybeArray<T> = T | T[];

export type FetchHook<C extends FetchContext = FetchContext> = (
  context: C
) => MaybePromise<void>;

export interface FetchHooks<T = any, R extends ResponseType = ResponseType> {
  onRequest?: MaybeArray<FetchHook<FetchContext<T, R>>>;
  onRequestError?: MaybeArray<FetchHook<FetchContext<T, R> & { error: Error }>>;
  onResponse?: MaybeArray<
    FetchHook<FetchContext<T, R> & { response: FetchResponse<T> }>
  >;
  onResponseError?: MaybeArray<
    FetchHook<FetchContext<T, R> & { response: FetchResponse<T> }>
  >;
}

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
