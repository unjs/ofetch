import { describe, it, expect } from "vitest";
import { computeBackoffDelay } from "../src/retry.ts";

describe("computeBackoffDelay", () => {
  describe("full-jitter", () => {
    const options = {
      strategy: "full-jitter" as const,
      base: 100,
      cap: 3000,
    };

    it("random=0 returns 0", () => {
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0 })
      ).toBe(0);
    });

    it("random~=1 approaches expCap", () => {
      // expCap = min(3000, 100 * 2^0) = 100; sleep = 0.999 * 100 = 99
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0.999 })
      ).toBe(99);
    });

    it("upper bound grows exponentially within cap", () => {
      // attempt=3 -> expCap = min(3000, 800) = 800
      const high = computeBackoffDelay({
        options,
        attempt: 3,
        random: () => 0.999,
      });
      expect(high).toBeGreaterThanOrEqual(799 - 1);
      expect(high).toBeLessThan(800);
    });

    it("saturates at cap for large attempt", () => {
      const high = computeBackoffDelay({
        options,
        attempt: 50,
        random: () => 0.999,
      });
      expect(high).toBeLessThanOrEqual(options.cap);
      expect(high).toBeGreaterThan(options.cap - 5);
    });
  });

  describe("equal-jitter", () => {
    const options = {
      strategy: "equal-jitter" as const,
      base: 100,
      cap: 3000,
    };

    it("attempt=0 with random=0 returns base/2", () => {
      // temp = min(3000, 100 * 2^0) = 100; sleep = 50 + 0 = 50
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0 })
      ).toBe(50);
    });

    it("attempt=0 with random~=1 returns just under base", () => {
      // temp = 100; sleep = 50 + 0.999 * 50 ~= 99
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0.999 })
      ).toBe(99);
    });

    it("grows exponentially within cap", () => {
      // attempt=3 -> temp = min(3000, 100*8) = 800; sleep range [400, 800)
      const mid = computeBackoffDelay({
        options,
        attempt: 3,
        random: () => 0.5,
      });
      expect(mid).toBeGreaterThanOrEqual(400);
      expect(mid).toBeLessThan(800);
    });

    it("saturates at cap", () => {
      // very large attempt should still respect cap; max sleep == cap
      const high = computeBackoffDelay({
        options,
        attempt: 50,
        random: () => 0.999,
      });
      expect(high).toBeLessThanOrEqual(options.cap);
      expect(high).toBeGreaterThanOrEqual(options.cap / 2 - 1);
    });
  });

  describe("decorrelated-jitter", () => {
    const options = {
      strategy: "decorrelated-jitter" as const,
      base: 100,
      cap: 3000,
    };

    it("first call (no prevDelay) uses base as prev", () => {
      // upper = max(100, 100*3) = 300; sleep = 100 + 0 = 100
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0 })
      ).toBe(100);
    });

    it("first call upper bound is base*3", () => {
      // sleep = 100 + 0.999 * (300 - 100) ~= 299
      expect(
        computeBackoffDelay({ options, attempt: 0, random: () => 0.999 })
      ).toBe(299);
    });

    it("grows from prevDelay", () => {
      // prev=500 -> upper = 1500; sleep at random=0.5 = 100 + 700 = 800
      expect(
        computeBackoffDelay({
          options,
          attempt: 1,
          prevDelay: 500,
          random: () => 0.5,
        })
      ).toBe(800);
    });

    it("saturates at cap", () => {
      expect(
        computeBackoffDelay({
          options,
          attempt: 10,
          prevDelay: 5000,
          random: () => 0.999,
        })
      ).toBe(options.cap);
    });
  });
});
