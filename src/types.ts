// --------------------------
// $fetch API
// --------------------------

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options"
  | "trace";

type _UntypedSchemaMarker = void;

type PathsForSchema<TSchema> = Extract<keyof TSchema, string>;

type PathsWithMethod<TSchema, TMethod extends HttpMethod> = {
  [TPath in PathsForSchema<TSchema>]: TMethod extends MethodsForPath<
    TSchema,
    TPath
  >
    ? TPath
    : never;
}[PathsForSchema<TSchema>];

type GetMethodForPath<TSchema, TPath extends PathsForSchema<TSchema>> = Extract<
  "get",
  MethodsForPath<TSchema, TPath>
>;

type MethodInputForPath<TSchema, TPath extends PathsForSchema<TSchema>> =
  | MethodsForPath<TSchema, TPath>
  | Uppercase<MethodsForPath<TSchema, TPath>>;

type MethodFromInput<
  TSchema,
  TPath extends PathsForSchema<TSchema>,
  TInput extends MethodInputForPath<TSchema, TPath>,
> = Extract<Lowercase<TInput>, MethodsForPath<TSchema, TPath>>;

type MethodsForPath<TSchema, TPath extends PathsForSchema<TSchema>> = Extract<
  Extract<keyof TSchema[TPath], string>,
  HttpMethod
>;

type OperationFor<
  TSchema,
  TPath extends PathsForSchema<TSchema>,
  TMethod extends MethodsForPath<TSchema, TPath>,
> = TSchema[TPath][TMethod];

type UntypedRequest<TSchema, TRequest extends FetchRequest> = [
  TSchema,
] extends [_UntypedSchemaMarker]
  ? TRequest
  : TRequest extends string
    ? never
    : TRequest;

type OperationRequestBody<T> = T extends { requestBody: infer TRequestBody }
  ? TRequestBody extends { content: infer TContent }
    ? TContent[keyof TContent]
    : never
  : never;

type OperationHasRequiredBody<T> = T extends {
  requestBody: { required: true };
}
  ? true
  : false;

type OperationResponses<T> = T extends { responses: infer TResponses }
  ? TResponses
  : never;

type SuccessStatusCode = `${2}${number}${number}` | "2XX" | "default";

type SuccessResponses<TResponses> =
  TResponses extends Record<string, any>
    ? {
        [TStatus in keyof TResponses]: `${TStatus & (string | number)}` extends SuccessStatusCode
          ? TResponses[TStatus]
          : never;
      }[keyof TResponses]
    : never;

type ResponseBodyFromResponse<T> = T extends { content: infer TContent }
  ? TContent[keyof TContent]
  : never;

type OperationData<T> = ResponseBodyFromResponse<
  SuccessResponses<OperationResponses<T>>
>;

type OperationQuery<T> = T extends { parameters: infer TParameters }
  ? TParameters extends { query: infer TQuery }
    ? TQuery
    : never
  : never;

type QueryOption<T> = [OperationQuery<T>] extends [never]
  ? {}
  : {
      query?: OperationQuery<T>;
      /**
       * @deprecated use query instead.
       */
      params?: OperationQuery<T>;
    };

type BodyOption<T> = [OperationRequestBody<T>] extends [never]
  ? {}
  : OperationHasRequiredBody<T> extends true
    ? { body: OperationRequestBody<T> }
    : { body?: OperationRequestBody<T> };

type TypedFetchOptions<T, R extends ResponseType = "json"> = Omit<
  FetchOptions<R, OperationData<T>>,
  "query" | "params" | "body"
> &
  QueryOption<T> &
  BodyOption<T>;

export interface $Fetch<TSchema = _UntypedSchemaMarker> {
  <
    TPath extends PathsForSchema<TSchema>,
    TMethodInput extends MethodInputForPath<TSchema, TPath>,
    TMethod extends MethodsForPath<TSchema, TPath> = MethodFromInput<
      TSchema,
      TPath,
      TMethodInput
    >,
    R extends ResponseType = "json",
  >(
    request: TPath,
    options: TypedFetchOptions<OperationFor<TSchema, TPath, TMethod>, R> & {
      method: TMethodInput;
    }
  ): Promise<
    MappedResponseType<R, OperationData<OperationFor<TSchema, TPath, TMethod>>>
  >;
  <
    TPath extends PathsWithMethod<TSchema, "get">,
    R extends ResponseType = "json",
  >(
    request: TPath,
    options?: TypedFetchOptions<
      OperationFor<TSchema, TPath, GetMethodForPath<TSchema, TPath>>,
      R
    > & {
      method?: "get" | "GET";
    }
  ): Promise<
    MappedResponseType<
      R,
      OperationData<
        OperationFor<TSchema, TPath, GetMethodForPath<TSchema, TPath>>
      >
    >
  >;
  <
    T = any,
    R extends ResponseType = "json",
    TRequest extends FetchRequest = FetchRequest,
  >(
    request: UntypedRequest<TSchema, TRequest>,
    options?: FetchOptions<R>
  ): Promise<MappedResponseType<R, T>>;
  raw<T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>
  ): Promise<FetchResponse<MappedResponseType<R, T>>>;
  native: Fetch;
  create<TNewSchema = TSchema>(
    defaults: FetchOptions,
    globalOptions?: CreateFetchOptions
  ): $Fetch<TNewSchema>;
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

  /**
   * @deprecated use query instead.
   */
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
