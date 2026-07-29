import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  it,
  expect,
  vi,
} from "vitest";
import { Readable } from "node:stream";
import { H3, HTTPError, serve } from "h3";
import { $fetch } from "../src/index.ts";
import { sleep } from "../src/utils.ts";
import type { RetryEntry, RetryIntent } from "../src/index.ts";

describe("retries", () => {
  let listener: ReturnType<typeof serve>;
  const getURL = (url: string) => listener.url! + url.replace(/^\//, "");

  let authCalls: string[] = [];
  const sequences = new Map<
    string,
    {
      calls: number;
      statuses: number[];
      delays?: number[];
      onCall?: () => void;
    }
  >();
  const setSequence = (
    id: string,
    statuses: number[],
    delays?: number[],
    onCall?: () => void
  ) => {
    sequences.set(id, { calls: 0, statuses, delays, onCall });
    return getURL(`seq?id=${id}`);
  };

  beforeAll(async () => {
    const app = new H3()
      .all("/auth", (event) => {
        const auth = event.req.headers.get("authorization") ?? "";
        authCalls.push(auth);
        if (auth === "valid") {
          return {
            authorization: auth,
            extra: event.req.headers.get("x-extra"),
          };
        }
        return new HTTPError({ status: 401 });
      })
      .all("/seq", async (event) => {
        const state = sequences.get(event.url.searchParams.get("id")!)!;
        const index = Math.min(state.calls, state.statuses.length - 1);
        const status = state.statuses[index];
        state.calls++;
        state.onCall?.();
        const delay = state.delays?.[index];
        if (delay) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        if (status >= 400) {
          return new HTTPError({ status });
        }
        return { calls: state.calls };
      });

    listener = await serve(app, { port: 0, hostname: "localhost" }).ready();
  });

  afterAll(() => {
    listener.close().catch(console.error);
  });

  beforeEach(() => {
    authCalls = [];
  });

  it("replays the request with merged options and re-runs hooks on manual retry", async () => {
    let onRequestCalls = 0;
    const res = await $fetch<{ authorization: string }>(getURL("auth"), {
      onRequest() {
        onRequestCalls++;
      },
      onResponseError(ctx) {
        if (ctx.response.status === 401 && ctx.retries.count("auth") === 0) {
          return ctx.retry({
            cause: "auth",
            options: { headers: { authorization: "valid" } },
          });
        }
      },
    });
    expect(res.authorization).toBe("valid");
    expect(authCalls).toEqual(["", "valid"]);
    expect(onRequestCalls).toBe(2);
  });

  it("records retries in the history with a default cause of 'manual'", async () => {
    const histories: RetryEntry[][] = [];
    await $fetch(getURL("auth"), {
      onRequest(ctx) {
        histories.push([...ctx.retries.history]);
      },
      onResponseError(ctx) {
        if (ctx.retries.count() === 0) {
          return ctx.retry({
            options: { headers: { authorization: "valid" } },
          });
        }
      },
    });
    expect(histories).toEqual([
      [],
      [{ cause: "manual", trigger: "status", status: 401 }],
    ]);
  });

  it("stops when the guard is exhausted and exposes history on the error", async () => {
    const error = await $fetch(getURL("auth"), {
      retry: false,
      onResponseError(ctx) {
        if (ctx.retries.count("auth") === 0) {
          return ctx.retry({ cause: "auth" });
        }
      },
    }).catch((error_) => error_);
    expect(error.status).toBe(401);
    expect(authCalls.length).toBe(2);
    expect(error.retries).toEqual([
      { cause: "auth", trigger: "status", status: 401 },
    ]);
  });

  it("allows later hooks to merge into the pending retry without changing its cause", async () => {
    const histories: RetryEntry[][] = [];
    const res = await $fetch<{ authorization: string; extra: string }>(
      getURL("auth"),
      {
        onRequest(ctx) {
          histories.push([...ctx.retries.history]);
        },
        onResponseError: [
          (ctx) => {
            if (ctx.retries.count("auth") === 0) {
              return ctx.retry({
                cause: "auth",
                options: { headers: { authorization: "valid" } },
              });
            }
          },
          (ctx) => {
            if (ctx.pendingRetry) {
              return ctx.retry({
                cause: "other",
                options: { headers: { "x-extra": "merged" } },
              });
            }
          },
        ],
      }
    );
    expect(res.authorization).toBe("valid");
    expect(res.extra).toBe("merged");
    expect(histories[1]).toEqual([
      { cause: "auth", trigger: "status", status: 401 },
    ]);
  });

  it("ignores a merging intent that targets a different request", async () => {
    const url = setSequence("merge-conflict", [500, 200]);
    const otherUrl = setSequence("merge-conflict-other", [200]);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let pendingSnapshot: RetryIntent<any, "json"> | undefined;
    const res = await $fetch<{ calls: number }>(url, {
      retry: false,
      onResponseError: [
        (ctx) => ctx.retry({ options: { headers: { "x-a": "1" } } }),
        (ctx) =>
          ctx.retry({
            request: otherUrl,
            options: { headers: { "x-b": "2" } },
          }),
        (ctx) => {
          pendingSnapshot = ctx.pendingRetry;
        },
      ],
    });
    expect(res.calls).toBe(2);
    expect(sequences.get("merge-conflict-other")!.calls).toBe(0);
    expect(pendingSnapshot?.request).toBeUndefined();
    expect(pendingSnapshot?.options?.headers).toEqual({ "x-a": "1" });
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it("keeps the longest delay when merging intents", async () => {
    const url = setSequence("merge-delay", [500, 200]);
    const delays: (number | undefined)[] = [];
    const res = await $fetch<{ calls: number }>(url, {
      retry: false,
      onResponseError: [
        (ctx) => ctx.retry({ delay: 20 }),
        (ctx) => ctx.retry({ delay: 5 }),
        (ctx) => {
          delays.push(ctx.pendingRetry?.delay);
        },
        (ctx) => ctx.retry({ delay: 40 }),
        (ctx) => {
          delays.push(ctx.pendingRetry?.delay);
        },
      ],
    });
    expect(res.calls).toBe(2);
    expect(delays).toEqual([20, 40]);
  });

  it("clears a pending retry when cancelRetry is called", async () => {
    const error = await $fetch(getURL("auth"), {
      onResponseError: [
        (ctx) =>
          ctx.retry({
            cause: "auth",
            options: { headers: { authorization: "valid" } },
          }),
        (ctx) => {
          ctx.cancelRetry();
        },
      ],
    }).catch((error_) => error_);
    expect(error.status).toBe(401);
    expect(authCalls.length).toBe(1);
    expect(error.retries).toEqual([]);
  });

  it("allows a later hook to claim a new retry after a cancel", async () => {
    const res = await $fetch<{ authorization: string }>(getURL("auth"), {
      onResponseError: [
        (ctx) => {
          if (ctx.retries.count() === 0) {
            return ctx.retry({ cause: "first" });
          }
        },
        (ctx) => {
          ctx.cancelRetry();
        },
        (ctx) => {
          if (ctx.retries.count() === 0) {
            return ctx.retry({
              cause: "second",
              options: { headers: { authorization: "valid" } },
            });
          }
        },
      ],
    });
    expect(res.authorization).toBe("valid");
    expect(authCalls).toEqual(["", "valid"]);
  });

  it("auto-retries again after a manual retry even when the budget was already spent", async () => {
    const url = setSequence("budget", [500, 401, 500, 200]);
    const codes: number[] = [];
    const res = await $fetch<{ calls: number }>(url, {
      retry: 1,
      onResponse(ctx) {
        codes.push(ctx.response.status);
      },
      onResponseError(ctx) {
        if (ctx.response.status === 401 && ctx.retries.count("auth") === 0) {
          return ctx.retry({ cause: "auth" });
        }
      },
    });
    expect(res.calls).toBe(4);
    expect(codes).toMatchInlineSnapshot(`
      [
        500,
        401,
        500,
        200,
      ]
    `);
  });

  it("keeps the `retry` option stable across attempts", async () => {
    const url = setSequence("stable", [500, 500, 500]);
    const seen: (number | false | undefined)[] = [];
    const error = await $fetch(url, {
      retry: 2,
      onRequest(ctx) {
        seen.push(ctx.options.retry);
      },
    }).catch((error_) => error_);
    expect(seen).toEqual([2, 2, 2]);
    expect(error.status).toBe(500);
    expect(error.retries).toEqual([
      { cause: "auto", trigger: "status", status: 500 },
      { cause: "auto", trigger: "status", status: 500 },
    ]);
  });

  it("allows retrying from onRequestError with a new request", async () => {
    let history: readonly RetryEntry[] = [];
    const res = await $fetch<{ calls: number }>("http://localhost:1/nope", {
      retry: false,
      onRequestError(ctx) {
        if (ctx.retries.count() === 0) {
          return ctx.retry({ request: setSequence("network", [200]) });
        }
      },
      onResponse(ctx) {
        history = [...ctx.retries.history];
      },
    });
    expect(res.calls).toBe(1);
    expect(history).toEqual([
      { cause: "manual", trigger: "network", status: undefined },
    ]);
  });

  it("allows retrying from onResponse on a successful response (polling)", async () => {
    const url = setSequence("poll", [200]);
    const res = await $fetch<{ calls: number }>(url, {
      onResponse(ctx) {
        if (ctx.response._data?.calls < 3 && ctx.retries.count("poll") < 5) {
          return ctx.retry({ cause: "poll" });
        }
      },
    });
    expect(res.calls).toBe(3);
  });

  it("coerces a manual cause of 'auto' to 'manual'", async () => {
    const error = await $fetch(getURL("auth"), {
      retry: false,
      onResponseError(ctx) {
        if (ctx.retries.count() === 0) {
          return ctx.retry({ cause: "auto" });
        }
      },
    }).catch((error_) => error_);
    expect(error.status).toBe(401);
    expect(error.retries).toEqual([
      { cause: "manual", trigger: "status", status: 401 },
    ]);
  });

  it("aborts immediately during an automatic retry delay", async () => {
    const url = setSequence("abort-auto-delay", [500, 200]);
    const controller = new AbortController();
    const start = Date.now();
    const promise = $fetch(url, {
      retry: 1,
      retryDelay: 5000,
      signal: controller.signal,
      onResponseError() {
        setTimeout(() => controller.abort(), 0);
      },
    });
    await expect(promise).rejects.toThrow(/abort/i);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it("aborts immediately during a manual retry delay", async () => {
    const url = setSequence("abort-manual-delay", [500, 200]);
    const controller = new AbortController();
    const start = Date.now();
    const promise = $fetch(url, {
      retry: false,
      signal: controller.signal,
      onResponseError(ctx) {
        if (ctx.retries.count() === 0) {
          setTimeout(() => controller.abort(), 0);
          return ctx.retry({ delay: 5000 });
        }
      },
    });
    await expect(promise).rejects.toThrow(/abort/i);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it("doesn't run a pending manual retry after an abort", async () => {
    const controller = new AbortController();
    const error = await $fetch(getURL("auth"), {
      signal: controller.signal,
      onResponseError(ctx) {
        controller.abort();
        return ctx.retry({
          cause: "auth",
          options: { headers: { authorization: "valid" } },
        });
      },
    }).catch((error_) => error_);
    expect(error.message).toMatch(/abort/i);
    expect(authCalls).toEqual([""]);
    expect(error.retries).toEqual([
      { cause: "auth", trigger: "status", status: 401 },
    ]);
  });

  it("gives each retry attempt a fresh timeout", async () => {
    const url = setSequence("timeout-fresh", [200, 200], [100, 0]);
    const histories: RetryEntry[][] = [];
    const res = await $fetch<{ calls: number }>(url, {
      retry: 1,
      timeout: 50,
      onResponse(ctx) {
        histories.push([...ctx.retries.history]);
      },
    });
    expect(res.calls).toBe(2);
    expect(histories.at(-1)).toEqual([
      { cause: "auto", trigger: "timeout", status: undefined },
    ]);
  });

  it("applies the timeout to each attempt, not to the whole retry chain", async () => {
    const url = setSequence(
      "timeout-per-attempt",
      [500, 500, 200],
      [60, 60, 60]
    );
    const res = await $fetch<{ calls: number }>(url, {
      retry: 2,
      timeout: 150,
    });
    expect(res.calls).toBe(3);
  });

  it("re-attempts the request after a timeout until the budget is exhausted", async () => {
    const url = setSequence("timeout-exhausted", [200, 200], [100, 100]);
    const error = await $fetch(url, { retry: 1, timeout: 10 }).catch(
      (error_) => error_
    );
    expect(error.message).toMatch(/timeout/i);
    expect(sequences.get("timeout-exhausted")!.calls).toBe(2);
    expect(error.retries).toEqual([
      { cause: "auto", trigger: "timeout", status: undefined },
    ]);
  });

  it("does not auto-retry when the caller aborts while a timeout is set", async () => {
    const controller = new AbortController();
    const url = setSequence("timeout-user-abort", [200], [100], () =>
      controller.abort()
    );
    const error = await $fetch(url, {
      retry: 1,
      timeout: 5000,
      signal: controller.signal,
    }).catch((error_) => error_);
    expect(error.message).toMatch(/abort/i);
    expect(error.retries).toEqual([]);
    expect(sequences.get("timeout-user-abort")!.calls).toBe(1);
  });

  it("does not retry when the caller aborts with a custom reason", async () => {
    const controller = new AbortController();
    const url = setSequence("custom-abort-reason", [200], [100], () =>
      controller.abort(new Error("user cancelled"))
    );
    const error = await $fetch(url, {
      retry: 1,
      timeout: 5000,
      signal: controller.signal,
    }).catch((error_) => error_);
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe("user cancelled");
    expect(error.retries).toEqual([]);
    expect(sequences.get("custom-abort-reason")!.calls).toBe(1);
  });

  it("throws when ctx.retry() is called with a stream body", async () => {
    const url = setSequence("stream", [500]);
    await expect(
      $fetch(url, {
        method: "POST",
        body: Readable.from(["hello"]),
        retry: false,
        onResponseError(ctx) {
          return ctx.retry();
        },
      })
    ).rejects.toThrow("cannot be replayed");
  });
});

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the given duration", async () => {
    let resolved = false;
    sleep(1000).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it("resolves immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    let resolved = false;
    sleep(60_000, controller.signal).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });

  it("resolves early when the signal aborts mid-sleep", async () => {
    const controller = new AbortController();
    let resolved = false;
    sleep(60_000, controller.signal).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(resolved).toBe(false);
    controller.abort();
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });
});
