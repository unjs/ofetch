import { describe, expect, it, vi } from "vitest";
import { createFetch } from "../src/fetch.ts";

describe("Request method semantics", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "does not automatically retry a %s Request",
    async (method) => {
      const fetch = vi.fn(
        async () => new Response("unavailable", { status: 503 })
      );
      const ofetch = createFetch({ fetch });
      await expect(
        ofetch(new Request("https://example.test/", { method }))
      ).rejects.toMatchObject({ status: 503 });
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );

  it("keeps the default retry for a GET Request", async () => {
    const fetch = vi.fn(
      async () => new Response("unavailable", { status: 503 })
    );
    await expect(
      createFetch({ fetch })(new Request("https://example.test/"))
    ).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("allows explicitly enabling retries for a POST Request", async () => {
    const fetch = vi.fn(
      async () => new Response("unavailable", { status: 503 })
    );
    await expect(
      createFetch({ fetch })(
        new Request("https://example.test/", { method: "POST" }),
        {
          retry: 2,
        }
      )
    ).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("uses an explicit method override for retry policy", async () => {
    const fetch = vi.fn(
      async () => new Response("unavailable", { status: 503 })
    );
    await expect(
      createFetch({ fetch })(
        new Request("https://example.test/", { method: "POST" }),
        {
          method: "GET",
        }
      )
    ).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not parse a HEAD Request response body", async () => {
    const parseResponse = vi.fn(JSON.parse);
    const fetch = vi.fn(async () => new Response("not JSON"));
    const data = await createFetch({ fetch })(
      new Request("https://example.test/", { method: "HEAD" }),
      { parseResponse }
    );
    expect(data).toBeUndefined();
    expect(parseResponse).not.toHaveBeenCalled();
  });

  it("serializes an overriding JSON body using the Request method", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(
      async () =>
        new Response("ok", {
          headers: { "content-type": "text/plain" },
        })
    );
    await createFetch({ fetch })(
      new Request("https://example.test/", { method: "POST" }),
      { body: { message: "hello" } }
    );
    const options = fetch.mock.calls[0][1] as RequestInit;
    expect(options.body).toBe('{"message":"hello"}');
    expect(new Headers(options.headers).get("content-type")).toBe(
      "application/json"
    );
  });

  it("honors a default method overriding the Request", async () => {
    const fetch = vi.fn(
      async () => new Response("unavailable", { status: 503 })
    );
    await expect(
      createFetch({ fetch, defaults: { method: "POST" } })(
        new Request("https://example.test/")
      )
    ).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("reads the Request method after an onRequest replacement", async () => {
    const fetch = vi.fn(
      async () => new Response("unavailable", { status: 503 })
    );
    await expect(
      createFetch({ fetch })(new Request("https://example.test/"), {
        onRequest(context) {
          context.request = new Request("https://example.test/", {
            method: "POST",
          });
        },
      })
    ).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
