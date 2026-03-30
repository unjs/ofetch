import { describe, expectTypeOf, it } from "vitest";
import { createFetch } from "../src/fetch.ts";
import type { $Fetch, TypedFetch } from "../src/types.ts";

// Mock OpenAPI-style schema (similar to openapi-typescript output)
interface ApiPaths {
  "/users": {
    get: {
      responses: {
        200: {
          content: { "application/json": { id: number; name: string }[] };
        };
      };
    };
    post: {
      requestBody: {
        content: { "application/json": { name: string } };
      };
      responses: {
        200: {
          content: { "application/json": { id: number; name: string } };
        };
      };
    };
  };
  "/users/{id}": {
    get: {
      responses: {
        200: { content: { "application/json": { id: number; name: string } } };
      };
    };
    delete: {
      responses: {
        200: { content: { "application/json": { success: boolean } } };
      };
    };
  };
}

describe("typed create", () => {
  it("$fetch.create returns $Fetch without generics", () => {
    const $fetch = createFetch();
    const api = $fetch.create({});
    expectTypeOf(api).toMatchTypeOf<$Fetch>();
  });

  it("$fetch.create<S> returns TypedFetch<S>", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});
    expectTypeOf(api).toMatchTypeOf<TypedFetch<ApiPaths>>();
  });

  it("infers GET response type from schema", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});

    const result = api("/users");
    expectTypeOf(result).toEqualTypeOf<
      Promise<{ id: number; name: string }[]>
    >();
  });

  it("infers GET response with explicit method", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});

    const result = api("/users/{id}", { method: "GET" });
    expectTypeOf(result).toEqualTypeOf<Promise<{ id: number; name: string }>>();
  });

  it("infers POST response type", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});

    const result = api("/users", { method: "POST" });
    expectTypeOf(result).toEqualTypeOf<Promise<{ id: number; name: string }>>();
  });

  it("infers DELETE response type", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});

    const result = api("/users/{id}", { method: "DELETE" });
    expectTypeOf(result).toEqualTypeOf<Promise<{ success: boolean }>>();
  });

  it("accepts lowercase methods", () => {
    const $fetch = createFetch();
    const api = $fetch.create<ApiPaths>({});

    const result = api("/users", { method: "post" });
    expectTypeOf(result).toEqualTypeOf<Promise<{ id: number; name: string }>>();
  });
});
