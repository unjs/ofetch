import { describe, it } from "vitest";
import { createFetch } from "../src/index.ts";

type ApiPaths = {
  "/users": {
    get: {
      responses: {
        200: { content: { "application/json": { users: string[] } } };
        default: { content: { "application/json": { message: string } } };
      };
    };
    post: {
      requestBody: {
        required: true;
        content: { "application/json": { name: string } };
      };
      responses: {
        201: { content: { "application/json": { id: string } } };
      };
    };
  };
  "/users/{id}": {
    get: {
      parameters: {
        path: { id: string };
        query: { expand?: boolean };
      };
      responses: {
        200: { content: { "application/json": { id: string; name: string } } };
        404: { content: { "application/json": { message: string } } };
      };
    };
    delete: {
      parameters: {
        path: { id: string };
      };
      responses: {
        204: Record<string, never>;
      };
    };
  };
  "/health": {
    get: {
      responses: {
        200: { content: { "text/plain": "ok" } };
      };
    };
  };
};

describe("typed create", () => {
  const typedFetch = createFetch<ApiPaths>({
    fetch: () =>
      Promise.resolve(
        new Response('{"users":[]}', {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      ),
  });

  it("infers path, method, body and response types", () => {
    // GET /users — default response should not include `default` error branch
    const _users: Promise<{ users: string[] }> = typedFetch("/users");

    // POST /users — required body enforced, response from 201
    const _created: Promise<{ id: string }> = typedFetch("/users", {
      method: "POST",
      body: { name: "Ada" },
    });

    // GET with responseType override
    const _health: Promise<string> = typedFetch("/health", {
      responseType: "text",
    });

    // GET /users/{id} — path params and optional query params
    const _user: Promise<{ id: string; name: string }> = typedFetch(
      "/users/{id}",
      { pathParams: { id: "1" }, query: { expand: true } }
    );

    // DELETE /users/{id} — 204 no-content resolves to undefined
    const _deleted: Promise<undefined> = typedFetch("/users/{id}", {
      method: "DELETE",
      pathParams: { id: "1" },
    });

    // @ts-expect-error Missing required request body for POST operation.
    typedFetch("/users", { method: "POST" });

    // @ts-expect-error PATCH is not an available method on /users.
    typedFetch("/users", { method: "PATCH" });

    // @ts-expect-error Path is not part of the schema.
    typedFetch("/unknown");
  });

  it("keeps legacy generic usage", () => {
    const _legacy: Promise<any> = typedFetch(
      new Request("https://example.com")
    );
  });

  it("supports ofetch.create with schema type", () => {
    const apiFetch = typedFetch.create<ApiPaths>({ baseURL: "/api" });
    const _users: Promise<{ users: string[] }> = apiFetch("/users");
  });
});
