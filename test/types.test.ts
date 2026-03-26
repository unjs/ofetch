import { describe, it } from "vitest";
import { createFetch } from "../src/index.ts";

type ApiPaths = {
  "/users": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": { users: string[] };
          };
        };
      };
    };
    post: {
      requestBody: {
        required: true;
        content: {
          "application/json": { name: string };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": { id: string };
          };
        };
      };
    };
  };
  "/health": {
    get: {
      responses: {
        200: {
          content: {
            "text/plain": "ok";
          };
        };
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
    const _users: Promise<{ users: string[] }> = typedFetch("/users");

    const _created: Promise<{ id: string }> = typedFetch("/users", {
      method: "POST",
      body: { name: "Ada" },
    });

    const _health: Promise<string> = typedFetch("/health", {
      responseType: "text",
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
});
