# Problem Title
Implement request coalescing for concurrent identical requests

# Problem Brief
Implement an opt-in request coalescing feature that automatically detects identical in-flight requests and shares a single network call, returning the same response (or error) to all callers.

# Agent Instructions
1. Implement request coalescing enabled per-request via a request option.
2. Identity: Requests are considered identical when they have the same HTTP method, URL (including query parameters), headers, and body. Query parameters are considered identical regardless of order. Header names are compared case-insensitively.
3. Interoperability with existing features:
   - Interceptors: Must be called once per unique network request.
   - Caching: Completed requests must not interfere with subsequent identical requests.
4. Cancellation, timeouts, and error propagation: If a subscriber aborts, only that subscriber receives an AbortError. If all subscribers abort, the underlying network request should be canceled. Timeouts are respected without creating duplicate in-flight requests. Client-facing errors are the standard ofetch FetchError with status/statusText populated from the HTTP response.
5. Abort handling: Error handlers must be attachable before abort rejections occur, preventing unhandled promise rejections.
6. Configuration: Support both per-request ({ dedupe: true }) and global (via $fetch.create({ dedupe: true })) enablement.
7. Maintain backward compatibility and type safety. When dedupe is omitted or false, behavior MUST match existing ofetch semantics (no coalescing).