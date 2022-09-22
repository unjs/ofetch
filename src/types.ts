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

export type Fetch = typeof globalThis.fetch;
export type RequestInfo = globalThis.RequestInfo;
export type RequestInit = globalThis.RequestInit;
export type Response = globalThis.Response;
