import { describe, expectTypeOf, it } from "vitest";
import type {
  FetchContext,
  FetchRetryState,
  FetchOptions,
  FetchHooks,
} from "../src/types.ts";

describe("retry types", () => {
  it("FetchRetryState has correct shape", () => {
    expectTypeOf<FetchRetryState>().toHaveProperty("attempt");
    expectTypeOf<FetchRetryState>().toHaveProperty("limit");
    expectTypeOf<FetchRetryState["attempt"]>().toBeNumber();
    expectTypeOf<FetchRetryState["limit"]>().toBeNumber();
  });

  it("FetchContext includes optional retry state", () => {
    expectTypeOf<FetchContext>().toHaveProperty("retry");
    expectTypeOf<FetchContext["retry"]>().toEqualTypeOf<
      FetchRetryState | undefined
    >();
  });

  it("retryCondition accepts FetchContext and returns boolean or Promise<boolean>", () => {
    const opts: FetchOptions = {
      retryCondition: (ctx) => {
        expectTypeOf(ctx).toMatchTypeOf<FetchContext>();
        return true;
      },
    };
    expectTypeOf(opts.retryCondition).toEqualTypeOf<
      | ((
          context: FetchContext<
            any,
            "json" | "text" | "blob" | "arrayBuffer" | "stream"
          >
        ) => boolean | Promise<boolean>)
      | undefined
    >();
  });

  it("retryDelay callback receives context with retry state", () => {
    const opts: FetchOptions = {
      retryDelay: (ctx) => {
        expectTypeOf(ctx.retry).toEqualTypeOf<FetchRetryState | undefined>();
        return 1000;
      },
    };
    void opts;
  });

  it("onRetry hook receives context with required retry state", () => {
    const hooks: FetchHooks = {
      onRetry: (ctx) => {
        expectTypeOf(ctx.retry).toEqualTypeOf<FetchRetryState>();
        expectTypeOf(ctx.retry.attempt).toBeNumber();
        expectTypeOf(ctx.retry.limit).toBeNumber();
      },
    };
    void hooks;
  });

  it("onRetry can be an array of hooks", () => {
    const hooks: FetchHooks = {
      onRetry: [
        (ctx) => {
          expectTypeOf(ctx.retry).toEqualTypeOf<FetchRetryState>();
        },
        async (ctx) => {
          expectTypeOf(ctx.retry).toEqualTypeOf<FetchRetryState>();
        },
      ],
    };
    void hooks;
  });
});
