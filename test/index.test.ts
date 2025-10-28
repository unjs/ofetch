import {
  describe,
  beforeEach,
  beforeAll,
  afterAll,
  it,
  expect,
  vi,
} from "vitest";
import { Readable } from "node:stream";
import { H3, HTTPError, readBody, serve } from "h3";
import { $fetch } from "../src/index.ts";

describe("ofetch", () => {
  let listener: ReturnType<typeof serve>;
  const getURL = (url: string = "/") =>
    listener.url! + (url.replace(/^\//, "") || "");

  const fetch = vi.spyOn(globalThis, "fetch");

  beforeAll(async () => {
    const app = new H3({ debug: true })
      // .use(async (event) => {
      //   console.log({
      //     body: await event.req.clone().text(),
      //     url: event.url.href,
      //     headers: event.req.headers,
      //   });
      // })
      .all("/ok", () => "ok")
      .all("/params", (event) => Object.fromEntries(event.url.searchParams))
      .all("/url/**", (event) => event.url.pathname + event.url.search)
      .all("/echo", async (event) => ({
        path: event.url.pathname + event.url.search,
        body: event.req.method === "POST" ? await event.req.text() : undefined,
        headers: Object.fromEntries(event.req.headers),
      }))
      .all("/post", async (event) => ({
        body: event.req.headers
          .get("content-type")
          ?.includes("multipart/form-data")
          ? await event.req.text()
          : await readBody(event),
        headers: Object.fromEntries(event.req.headers),
      }))
      .all("/binary", (event) => {
        event.res.headers.set("Content-Type", "application/octet-stream");
        return new Blob(["binary"]);
      })
      .all(
        "/403",
        () => new HTTPError({ status: 403, statusMessage: "Forbidden" })
      )
      .all("/408", () => new HTTPError({ status: 408 }))
      .all(
        "/204",
        () => null // eslint-disable-line unicorn/no-null
      )
      .all("/timeout", async () => {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(new HTTPError({ status: 408 }));
          }, 1000 * 5);
        });
      });

    listener = await serve(app, { port: 0, hostname: "localhost" }).ready();
  });

  afterAll(() => {
    listener.close().catch(console.error);
  });

  beforeEach(() => {
    fetch.mockClear();
  });

  it("ok", async () => {
    expect(await $fetch(getURL("ok"))).to.equal("ok");
  });

  it("custom parseResponse", async () => {
    let called = 0;
    const parser = (r: any) => {
      called++;
      return "C" + r;
    };
    expect(await $fetch(getURL("ok"), { parseResponse: parser })).to.equal(
      "Cok"
    );
    expect(called).to.equal(1);
  });

  it("allows specifying FetchResponse method", async () => {
    expect(
      await $fetch(getURL("params?test=true"), { responseType: "json" })
    ).to.deep.equal({ test: "true" });
    expect(
      await $fetch(getURL("params?test=true"), { responseType: "blob" })
    ).to.be.instanceOf(Blob);
    expect(
      await $fetch(getURL("params?test=true"), { responseType: "text" })
    ).to.equal('{\n  "test": "true"\n}');
    expect(
      await $fetch(getURL("params?test=true"), { responseType: "arrayBuffer" })
    ).to.be.instanceOf(ArrayBuffer);
  });

  it("returns a blob for binary content-type", async () => {
    expect(await $fetch(getURL("binary"))).to.be.instanceOf(Blob);
  });

  it("baseURL", async () => {
    expect(await $fetch("/x?foo=123", { baseURL: getURL("url") })).to.equal(
      "/url/x?foo=123"
    );
  });

  it("stringifies posts body automatically", async () => {
    const { body } = await $fetch(getURL("post"), {
      method: "POST",
      body: { num: 42 },
    });
    expect(body).to.deep.eq({ num: 42 });

    const body2 = (
      await $fetch(getURL("post"), {
        method: "POST",
        body: [{ num: 42 }, { num: 43 }],
      })
    ).body;
    expect(body2).to.deep.eq([{ num: 42 }, { num: 43 }]);

    let body3;
    await $fetch(getURL("post"), {
      method: "POST",
      body: { num: 42 },
      onResponse(ctx) {
        body3 = ctx.options.body;
      },
    });
    expect(JSON.parse(body3! as string)).toMatchObject({ num: 42 });

    const headerFetches = [
      [["X-header", "1"]],
      { "x-header": "1" },
      new Headers({ "x-header": "1" }),
    ];

    for (const sentHeaders of headerFetches) {
      const { headers } = await $fetch(getURL("post"), {
        method: "POST",
        body: { num: 42 },
        headers: sentHeaders as HeadersInit,
      });
      expect(headers).to.include({ "x-header": "1" });
      expect(headers).to.include({ accept: "application/json" });
    }
  });

  it("does not stringify body when content type != application/json", async () => {
    const message = '"Hallo von Pascal"';
    const { body } = await $fetch(getURL("echo"), {
      method: "POST",
      body: message,
      headers: { "Content-Type": "text/plain" },
    });
    expect(body).to.deep.eq(message);
  });

  it("Handle Buffer body", async () => {
    const message = "Hallo von Pascal";
    const { body } = await $fetch(getURL("echo"), {
      method: "POST",
      body: Buffer.from("Hallo von Pascal"),
      headers: { "Content-Type": "text/plain" },
    });
    expect(body).to.deep.eq(message);
  });

  it("Handle ReadableStream body", async () => {
    const message = "Hallo von Pascal";
    const { body } = await $fetch(getURL("echo"), {
      method: "POST",
      headers: {
        "content-length": "16",
      },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      }),
    });
    expect(body).to.deep.eq(message);
  });

  it("Handle Readable body", async () => {
    const message = "Hallo von Pascal";
    const { body } = await $fetch(getURL("echo"), {
      method: "POST",
      headers: {
        "content-length": "16",
      },
      body: new Readable({
        read() {
          this.push(message);
          this.push(null); // eslint-disable-line unicorn/no-null
        },
      }),
    });
    expect(body).to.deep.eq(message);
  });

  it("Bypass FormData body", async () => {
    const data = new FormData();
    data.append("foo", "bar");
    const { body } = await $fetch(getURL("post"), {
      method: "POST",
      body: data,
    });
    expect(body).to.include('form-data; name="foo"');
  });

  it("Bypass URLSearchParams body", async () => {
    const data = new URLSearchParams({ foo: "bar" });
    const { body } = await $fetch(getURL("post"), {
      method: "POST",
      body: data,
    });
    expect(body).toMatchObject({ foo: "bar" });
  });

  it("404", async () => {
    const error = await $fetch(getURL("404")).catch((error_: any) => error_);
    expect(error.toString()).toBe(
      `FetchError: [GET] "${getURL("404")}": 404 Not Found`
    );
    expect(error.data).toMatchObject({
      status: 404,
      message: expect.stringContaining("Cannot find any route matching"),
    });
    expect(error.response?._data).to.deep.eq(error.data);
    expect(error.request).to.equal(getURL("404"));
  });

  it("403 with ignoreResponseError", async () => {
    const res = await $fetch(getURL("403"), { ignoreResponseError: true });
    expect(res?.status).to.eq(403);
    expect(res?.message).to.eq("Forbidden");
  });

  it("204 no content", async () => {
    const res = await $fetch(getURL("204"));
    expect(res).toBe(undefined);
  });

  it("HEAD no content", async () => {
    const res = await $fetch(getURL("/ok"), { method: "HEAD" });
    expect(res).toBeUndefined();
  });

  it("baseURL with retry", async () => {
    const error = await $fetch("", { baseURL: getURL("404"), retry: 3 }).catch(
      (error_: any) => error_
    );
    expect(error.request).to.equal(getURL("404"));
  });

  it("retry with number delay", async () => {
    const slow = $fetch<string>(getURL("408"), {
      retry: 2,
      retryDelay: 100,
    }).catch(() => "slow");
    const fast = $fetch<string>(getURL("408"), {
      retry: 2,
      retryDelay: 1,
    }).catch(() => "fast");

    const race = await Promise.race([slow, fast]);
    expect(race).to.equal("fast");
  });

  it("retry with callback delay", async () => {
    const slow = $fetch<string>(getURL("408"), {
      retry: 2,
      retryDelay: () => 100,
    }).catch(() => "slow");
    const fast = $fetch<string>(getURL("408"), {
      retry: 2,
      retryDelay: () => 1,
    }).catch(() => "fast");

    const race = await Promise.race([slow, fast]);
    expect(race).to.equal("fast");
  });

  it("abort with retry", async () => {
    const controller = new AbortController();
    async function abortHandle() {
      controller.abort();
      const response = await $fetch("", {
        baseURL: getURL("ok"),
        retry: 3,
        signal: controller.signal,
      });
      console.log("response", response);
    }
    await expect(abortHandle()).rejects.toThrow(/aborted/);
  });

  it("passing request obj should return request obj in error", async () => {
    const error = await $fetch(getURL("/403"), { method: "post" }).catch(
      (error: any) => error
    );
    expect(error.toString()).toBe(
      `FetchError: [POST] "${getURL("403")}": 403 Forbidden`
    );
    expect(error.request).to.equal(getURL("403"));
    expect(error.options.method).to.equal("POST");
    expect(error.response?._data).to.deep.eq(error.data);
  });

  it("aborting on timeout", async () => {
    const noTimeout = $fetch(getURL("timeout")).catch(() => "no timeout");
    const timeout = $fetch(getURL("timeout"), {
      timeout: 100,
      retry: 0,
    }).catch(() => "timeout");
    const race = await Promise.race([noTimeout, timeout]);
    expect(race).to.equal("timeout");
  });

  it("aborting on timeout reason", async () => {
    await $fetch(getURL("timeout"), {
      timeout: 100,
      retry: 0,
    }).catch((error: any) => {
      expect(error.cause.message).to.include(
        "The operation was aborted due to timeout"
      );
      expect(error.cause.name).to.equal("TimeoutError");
      expect(error.cause.code).to.equal(DOMException.TIMEOUT_ERR);
    });
  });

  it("deep merges defaultOptions", async () => {
    const _customFetch = $fetch.create({
      query: {
        a: 0,
      },
      params: {
        b: 2,
      },
      headers: {
        "x-header-a": "0",
        "x-header-b": "2",
      },
    });
    const { headers, path } = await _customFetch(getURL("echo"), {
      query: {
        a: 1,
      },
      params: {
        c: 3,
      },
      headers: {
        "Content-Type": "text/plain",
        "x-header-a": "1",
        "x-header-c": "3",
      },
    });

    expect(headers).to.include({
      "x-header-a": "1",
      "x-header-b": "2",
      "x-header-c": "3",
    });

    const parseParams = (str: string) =>
      Object.fromEntries(new URL(str, "http://_").searchParams.entries());
    expect(parseParams(path)).toMatchObject({ a: "1", b: "2", c: "3" });
  });

  it("uses request headers", async () => {
    expect(
      await $fetch(
        new Request(getURL("echo"), { headers: { foo: "1" } }),
        {}
      ).then((r) => r.headers)
    ).toMatchObject({ foo: "1" });

    expect(
      await $fetch(new Request(getURL("echo"), { headers: { foo: "1" } }), {
        headers: { foo: "2", bar: "3" },
      }).then((r) => r.headers)
    ).toMatchObject({ foo: "2", bar: "3" });
  });

  it("hook errors", async () => {
    // onRequest
    await expect(
      $fetch(getURL("/ok"), {
        onRequest: () => {
          throw new Error("error in onRequest");
        },
      })
    ).rejects.toThrow("error in onRequest");

    // onRequestError
    await expect(
      $fetch("/" /* non absolute is not acceptable */, {
        onRequestError: () => {
          throw new Error("error in onRequestError");
        },
      })
    ).rejects.toThrow("error in onRequestError");

    // onResponse
    await expect(
      $fetch(getURL("/ok"), {
        onResponse: () => {
          throw new Error("error in onResponse");
        },
      })
    ).rejects.toThrow("error in onResponse");

    // onResponseError
    await expect(
      $fetch(getURL("/403"), {
        onResponseError: () => {
          throw new Error("error in onResponseError");
        },
      })
    ).rejects.toThrow("error in onResponseError");
  });

  it("calls hooks", async () => {
    const onRequest = vi.fn();
    const onRequestError = vi.fn();
    const onResponse = vi.fn();
    const onResponseError = vi.fn();

    await $fetch(getURL("/ok"), {
      onRequest,
      onRequestError,
      onResponse,
      onResponseError,
    });

    expect(onRequest).toHaveBeenCalledOnce();
    expect(onRequestError).not.toHaveBeenCalled();
    expect(onResponse).toHaveBeenCalledOnce();
    expect(onResponseError).not.toHaveBeenCalled();

    onRequest.mockReset();
    onRequestError.mockReset();
    onResponse.mockReset();
    onResponseError.mockReset();

    await $fetch(getURL("/403"), {
      onRequest,
      onRequestError,
      onResponse,
      onResponseError,
    }).catch((error: any) => error);

    expect(onRequest).toHaveBeenCalledOnce();
    expect(onRequestError).not.toHaveBeenCalled();
    expect(onResponse).toHaveBeenCalledOnce();
    expect(onResponseError).toHaveBeenCalledOnce();

    onRequest.mockReset();
    onRequestError.mockReset();
    onResponse.mockReset();
    onResponseError.mockReset();

    await $fetch(getURL("/ok"), {
      onRequest: [onRequest, onRequest],
      onRequestError: [onRequestError, onRequestError],
      onResponse: [onResponse, onResponse],
      onResponseError: [onResponseError, onResponseError],
    });

    expect(onRequest).toHaveBeenCalledTimes(2);
    expect(onRequestError).not.toHaveBeenCalled();
    expect(onResponse).toHaveBeenCalledTimes(2);
    expect(onResponseError).not.toHaveBeenCalled();

    onRequest.mockReset();
    onRequestError.mockReset();
    onResponse.mockReset();
    onResponseError.mockReset();

    await $fetch(getURL("/403"), {
      onRequest: [onRequest, onRequest],
      onRequestError: [onRequestError, onRequestError],
      onResponse: [onResponse, onResponse],
      onResponseError: [onResponseError, onResponseError],
    }).catch((error) => error);

    expect(onRequest).toHaveBeenCalledTimes(2);
    expect(onRequestError).not.toHaveBeenCalled();
    expect(onResponse).toHaveBeenCalledTimes(2);
    expect(onResponseError).toHaveBeenCalledTimes(2);
  });

  it("default fetch options", async () => {
    await $fetch("https://jsonplaceholder.typicode.com/todos/1", {});
    expect(fetch).toHaveBeenCalledOnce();
    const options = fetch.mock.calls[0][1];
    expect(options).toStrictEqual({
      headers: expect.any(Headers),
    });
    fetch.mockReset();
    await $fetch("https://jsonplaceholder.typicode.com/todos/1", {
      timeout: 10_000,
    });
    expect(fetch).toHaveBeenCalledOnce();
    const options2 = fetch.mock.calls[0][1];
    expect(options2).toStrictEqual({
      headers: expect.any(Headers),
      signal: expect.any(AbortSignal),
      timeout: 10_000,
    });
  });
});
