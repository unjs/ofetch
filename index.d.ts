declare type Fetch = typeof globalThis.fetch;
declare type RequestInfo = globalThis.RequestInfo;
declare type RequestInit = globalThis.RequestInit;
declare type Response = globalThis.Response;

interface CreateFetchOptions {
    fetch: Fetch;
}
declare type $FetchInput = RequestInfo;
interface $FetchOptions extends RequestInit {
    baseURL?: string;
}
declare type $Fetch<T = any> = (input: $FetchInput, opts?: $FetchOptions) => Promise<T>;
declare function createFetch({ fetch }: CreateFetchOptions): $Fetch;

declare class FetchError extends Error {
    name: 'FetchError';
}
declare function createFetchError<T = any>(response: Response, input: RequestInfo, data: T): FetchError;

declare const $fetch: $Fetch<any>;

export { $Fetch, $FetchInput, $FetchOptions, $fetch, CreateFetchOptions, Fetch, FetchError, RequestInfo, RequestInit, Response, createFetch, createFetchError };
