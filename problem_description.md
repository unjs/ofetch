# Problem Title
Implement request coalescing for concurrent identical requests

# Problem Brief
When multiple identical requests are made concurrently, ofetch currently sends each request independently. This wastes network resources and can cause race conditions. Users need an opt-in request coalescing feature that automatically detects identical in-flight requests and shares a single network call, returning the same response (or error) to all callers. This is a performance optimization that reduces redundant network calls without requiring external state management or caching infrastructure.

# Agent Instructions
1. Implement request coalescing enabled per-request via a request option.
2. Detect identical concurrent requests and share a single network call, returning the same response (or error) to all waiting callers.
   - Identity (coalescing key) MUST include: HTTP method, full URL with query parameters (normalized; order-insensitive), headers (case-insensitive; keys normalized to lowercase and order-insensitive), and serialized request body.
3. Interoperability with existing features:
   - Interceptors: MUST run once per unique network request (not once per subscriber).
   - Retries: When a coalesced request retries, all subscribers share the same retry attempts (no duplicated retries per subscriber).
   - Caching: ofetch does NOT include a built-in cache. Coalescing applies only to in-flight requests and MUST clean up completed requests promptly so external caches can layer on top independently. Do not mandate any specific cache vs. dedupe ordering in the library itself.
4. Cancellation, timeouts, and error propagation:
   - Cancellation (AbortSignal): Each subscriber may provide a signal. If a subscriber aborts, only that subscriber MUST receive an AbortError. If all subscribers abort, the underlying network request SHOULD be canceled.
   - Timeouts: Respect timeouts without creating duplicate in-flight requests when coalesced.
   - Error propagation: Client-facing errors MUST be the standard ofetch FetchError (name: "FetchError") with status/statusText populated from the HTTP response. Server handlers (for example, h3) may throw HTTPError to produce HTTP status codes, but callers of $fetch observe FetchError instances.
5. Error deferral requirement (critical): Implementations MUST defer promise rejections via a macrotask (setTimeout or setImmediate), NOT a microtask (queueMicrotask or Promise.then), so consumers can attach error handlers after abort and before the next macrotask without unhandled promise rejections.
6. Configuration: Support both per-request ({ dedupe: true }) and global (via $fetch.create({ dedupe: true })) enablement.
7. Maintain backward compatibility and type safety. When dedupe is omitted or false, behavior MUST match existing ofetch semantics (no coalescing).

# Test Assumptions
1. Environment: local h3 server endpoints bound to 127.0.0.1; `globalThis.fetch` available.
2. Identifiers exercised by tests: `dedupe?: boolean` request option and `$fetch.create({ dedupe: true })` factory.
3. Tooling and methodology: Vitest with fake timers and deterministic server‑start coordination to validate behaviors defined in Agent Instructions (no global unhandledRejection hooks).
