// Exponential backoff + jitter strategies.
// Reference: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/

export type RetryBackoffStrategy =
  | "full-jitter"
  | "equal-jitter"
  | "decorrelated-jitter";

export interface RetryBackoffOptions {
  strategy: RetryBackoffStrategy;
  /** Minimum delay in milliseconds. */
  base: number;
  /** Maximum delay in milliseconds. */
  cap: number;
}

export interface ComputeBackoffParams {
  options: RetryBackoffOptions;
  /** 0-indexed: how many retries have already happened. */
  attempt: number;
  /** Previous sleep value, used by decorrelated-jitter. */
  prevDelay?: number;
  /** Random source (DI for tests). Defaults to Math.random. */
  random?: () => number;
}

export function computeBackoffDelay(params: ComputeBackoffParams): number {
  const { options, attempt, prevDelay, random = Math.random } = params;
  const { strategy, base, cap } = options;

  // Saturate the exponent first to avoid 2 ** large -> Infinity.
  const expCap = Math.min(cap, base * 2 ** Math.min(attempt, 31));

  if (strategy === "full-jitter") {
    // sleep = random(0, min(cap, base * 2^attempt))
    return Math.floor(random() * expCap);
  }

  if (strategy === "equal-jitter") {
    // sleep = temp/2 + random(0, temp/2)
    return Math.floor(expCap / 2 + random() * (expCap / 2));
  }

  // decorrelated-jitter: sleep = min(cap, random(base, prev * 3))
  const prev = prevDelay ?? base;
  const upper = Math.max(base, prev * 3);
  const sleep = base + random() * (upper - base);
  return Math.floor(Math.min(cap, sleep));
}
