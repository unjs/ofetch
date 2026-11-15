import { createServer } from "node:http";
import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFetch } from "../src/fetch.ts";

describe("Request body retries", () => {
  let server: Server;
  let url: string;
  let bodies: string[];
  let paths: string[];
  const $fetch = createFetch();

  beforeAll(async () => {
    server = createServer(async (request, response) => {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
      }
      bodies.push(body);
      paths.push(request.url || "/");
      if (request.url === "/network-error" && bodies.length === 1) {
        request.socket.destroy();
        return;
      }
      const status =
        request.url === "/always-error" || bodies.length === 1 ? 503 : 200;
      response.writeHead(status, { "content-type": "text/plain" });
      response.end(status === 200 ? body : "unavailable");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected an HTTP server address");
    }
    url = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    bodies = [];
    paths = [];
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it.each(["POST", "PUT"])(
    "retries a %s Request with the same JSON body",
    async (method) => {
      const body = JSON.stringify({ message: "hello" });
      const request = new Request(url, { method, body });

      expect(await $fetch(request, { method, retry: 1 })).toBe(body);
      expect(bodies).toEqual([body, body]);
    }
  );

  it("preserves multipart data across retries", async () => {
    const form = new FormData();
    form.set("message", "hello");
    const request = new Request(url, { method: "POST", body: form });

    const result = await $fetch(request, { method: "POST", retry: 1 });
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toBe(bodies[1]);
    expect(result).toBe(bodies[0]);
    expect(result).toContain("hello");
  });

  it("retries after the server consumes the body and closes the connection", async () => {
    const request = new Request(`${url}/network-error`, {
      method: "PUT",
      body: "hello",
    });

    expect(await $fetch(request, { method: "PUT", retry: 1 })).toBe("hello");
    expect(bodies).toEqual(["hello", "hello"]);
  });

  it("keeps the retry count and final HTTP error", async () => {
    const request = new Request(`${url}/always-error`, {
      method: "PUT",
      body: "hello",
    });

    await expect(
      $fetch(request, { method: "PUT", retry: 2 })
    ).rejects.toMatchObject({ status: 503 });
    expect(bodies).toEqual(["hello", "hello", "hello"]);
  });

  it.each([false, 0, undefined] as const)(
    "keeps a single attempt with retry=%s",
    async (retry) => {
      const request = new Request(url, { method: "PUT", body: "hello" });

      await expect(
        $fetch(request, { method: "PUT", retry })
      ).rejects.toMatchObject({ status: 503 });
      expect(bodies).toEqual(["hello"]);
      expect(request.bodyUsed).toBe(true);
    }
  );

  it("retries an overriding options body", async () => {
    const request = new Request(url, { method: "PUT", body: "original" });

    expect(
      await $fetch(request, { method: "PUT", body: "override", retry: 1 })
    ).toBe("override");
    expect(bodies).toEqual(["override", "override"]);
  });

  it("honors a replacement request from onResponseError", async () => {
    const request = new Request(url, { method: "PUT", body: "hello" });

    expect(
      await $fetch(request, {
        method: "PUT",
        retry: 1,
        onResponseError(context) {
          context.request = `${url}/replacement`;
          context.options.body = "replacement";
        },
      })
    ).toBe("replacement");
    expect(paths).toEqual(["/", "/replacement"]);
    expect(bodies).toEqual(["hello", "replacement"]);
  });

  it("normalizes errors from an already consumed Request", async () => {
    const request = new Request(url, { method: "PUT", body: "hello" });
    await request.text();

    await expect(
      $fetch(request, { method: "PUT", retry: 1 })
    ).rejects.toMatchObject({
      name: "FetchError",
      cause: { name: "TypeError" },
    });
    expect(bodies).toEqual([]);
  });
});
