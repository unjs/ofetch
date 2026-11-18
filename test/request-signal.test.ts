import { createServer } from "node:http";
import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFetch } from "../src/fetch.ts";

describe("Request signals with timeout", () => {
  let server: Server;
  let url: string;
  let requests = 0;
  let onPendingRequest: (() => void) | undefined;
  const $fetch = createFetch();

  beforeAll(async () => {
    server = createServer((request, response) => {
      requests++;
      if (request.url === "/pending") {
        onPendingRequest?.();
        return;
      }
      if (request.url === "/unavailable") {
        response.statusCode = 503;
      }
      response.setHeader("content-type", "text/plain");
      response.end("ok");
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
    requests = 0;
    onPendingRequest = undefined;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("honors an already aborted Request signal", async () => {
    const controller = new AbortController();
    const request = new Request(url, { signal: controller.signal });
    controller.abort();

    await expect(
      $fetch(request, { timeout: 1000, retry: false })
    ).rejects.toMatchObject({ cause: { name: "AbortError" } });
    expect(requests).toBe(0);
  });

  it("honors a Request aborted after the server receives it", async () => {
    const controller = new AbortController();
    const received = new Promise<void>((resolve) => {
      onPendingRequest = resolve;
    });
    const request = new Request(`${url}/pending`, {
      signal: controller.signal,
    });
    const result = $fetch(request, { timeout: 1000, retry: false }).catch(
      (error) => error
    );
    await received;
    controller.abort();

    expect(await result).toMatchObject({ cause: { name: "AbortError" } });
    expect(requests).toBe(1);
  });

  it("lets an explicit signal override the Request signal", async () => {
    const controller = new AbortController();
    const request = new Request(url, { signal: controller.signal });
    controller.abort();

    expect(
      await $fetch(request, {
        timeout: 1000,
        retry: false,
        signal: new AbortController().signal,
      })
    ).toBe("ok");
    expect(requests).toBe(1);
  });

  it("lets an explicit null signal override the Request signal", async () => {
    const controller = new AbortController();
    const request = new Request(url, { signal: controller.signal });
    controller.abort();

    expect(
      // eslint-disable-next-line unicorn/no-null
      await $fetch(request, { timeout: 1000, retry: false, signal: null })
    ).toBe("ok");
    expect(requests).toBe(1);
  });

  it("lets a default signal override the Request signal", async () => {
    const controller = new AbortController();
    const request = new Request(url, { signal: controller.signal });
    controller.abort();
    const fetchWithDefaults = $fetch.create({
      signal: new AbortController().signal,
    });

    expect(
      await fetchWithDefaults(request, { timeout: 1000, retry: false })
    ).toBe("ok");
    expect(requests).toBe(1);
  });

  it("reads the signal after onRequest replaces the Request", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      $fetch(url, {
        timeout: 1000,
        retry: false,
        onRequest(context) {
          context.request = new Request(url, { signal: controller.signal });
        },
      })
    ).rejects.toMatchObject({ cause: { name: "AbortError" } });
    expect(requests).toBe(0);
  });

  it("reads a replacement Request signal on retry", async () => {
    const controller = new AbortController();
    controller.abort();
    let attempts = 0;

    await expect(
      $fetch(new Request(`${url}/unavailable`), {
        timeout: 1000,
        retry: 1,
        onRequest(context) {
          if (++attempts === 2) {
            context.request = new Request(url, { signal: controller.signal });
          }
        },
      })
    ).rejects.toMatchObject({ cause: { name: "AbortError" } });
    expect(attempts).toBe(2);
    expect(requests).toBe(1);
  });

  it("honors a replacement Request aborted while a retry is pending", async () => {
    const controller = new AbortController();
    const received = new Promise<void>((resolve) => {
      onPendingRequest = resolve;
    });
    let attempts = 0;
    const result = $fetch(new Request(`${url}/unavailable`), {
      timeout: 1000,
      retry: 1,
      onRequest(context) {
        if (++attempts === 2) {
          context.request = new Request(`${url}/pending`, {
            signal: controller.signal,
          });
        }
      },
    }).catch((error) => error);
    await received;
    controller.abort();

    expect(await result).toMatchObject({ cause: { name: "AbortError" } });
    expect(attempts).toBe(2);
    expect(requests).toBe(2);
  });

  it.each(["request", "option", "default"])(
    "does not retry cancellation from the %s signal with a timeout",
    async (source) => {
      const controller = new AbortController();
      const received = new Promise<void>((resolve) => {
        onPendingRequest = resolve;
      });
      const fetchWithDefaults = $fetch.create(
        source === "default" ? { signal: controller.signal } : {}
      );
      const request = new Request(
        `${url}/pending`,
        source === "request" ? { signal: controller.signal } : {}
      );
      let attempts = 0;
      let delays = 0;
      const result = fetchWithDefaults(request, {
        ...(source === "option" ? { signal: controller.signal } : {}),
        timeout: 1000,
        retry: 2,
        retryDelay() {
          delays++;
          return 1;
        },
        onRequest() {
          attempts++;
        },
      }).catch((error) => error);
      await received;
      const reason = new Error("Caller cancelled the request");
      controller.abort(reason);

      expect(await result).toMatchObject({ cause: reason });
      expect(attempts).toBe(1);
      expect(delays).toBe(0);
      expect(requests).toBe(1);
    }
  );

  it("does not retry a default AbortError when a timeout is set", async () => {
    const controller = new AbortController();
    controller.abort();
    let attempts = 0;
    let delays = 0;

    await expect(
      $fetch(new Request(url, { signal: controller.signal }), {
        timeout: 1000,
        retry: 2,
        retryDelay() {
          delays++;
          return 1;
        },
        onRequest() {
          attempts++;
        },
      })
    ).rejects.toMatchObject({ cause: { name: "AbortError" } });
    expect(attempts).toBe(1);
    expect(delays).toBe(0);
    expect(requests).toBe(0);
  });

  it("starts a fresh timeout after retryDelay", async () => {
    let attempts = 0;
    expect(
      await $fetch(new Request(`${url}/unavailable`), {
        timeout: 50,
        retry: 1,
        retryDelay: 100,
        onRequest(context) {
          if (++attempts === 2) {
            context.request = new Request(url);
          }
          expect(context.options.signal).toBeUndefined();
        },
      })
    ).toBe("ok");
    expect(attempts).toBe(2);
    expect(requests).toBe(2);
  });

  it("still retries timeout expiry", async () => {
    let attempts = 0;
    expect(
      await $fetch(new Request(`${url}/pending`), {
        timeout: 50,
        retry: 1,
        onRequest(context) {
          if (++attempts === 2) {
            context.request = new Request(url);
          }
        },
      })
    ).toBe("ok");
    expect(attempts).toBe(2);
    expect(requests).toBe(2);
  });

  it.each(["signal", "null"])(
    "preserves an explicit %s override on retry",
    async (source) => {
      const controller = new AbortController();
      controller.abort();
      // eslint-disable-next-line unicorn/no-null
      const signal = source === "null" ? null : new AbortController().signal;
      let attempts = 0;

      expect(
        await $fetch(new Request(`${url}/unavailable`), {
          signal,
          timeout: 1000,
          retry: 1,
          onRequest(context) {
            expect(context.options.signal).toBe(signal);
            if (++attempts === 2) {
              context.request = new Request(url, { signal: controller.signal });
            }
          },
        })
      ).toBe("ok");
      expect(attempts).toBe(2);
      expect(requests).toBe(2);
    }
  );
});
