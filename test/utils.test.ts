import { describe, it, expect } from "vitest";
import { isJSONSerializable } from "../src/utils.ts";

describe("isJSONSerializable", () => {
  it("treats primitives as serializable", () => {
    expect(isJSONSerializable("foo")).toBe(true);
    expect(isJSONSerializable(123)).toBe(true);
    expect(isJSONSerializable(true)).toBe(true);
  });

  it("treats `null` as serializable without throwing", () => {
    // Regression: previously this threw `Cannot read properties of null
    // (reading 'buffer')` because `null` fell through to the `value.buffer`
    // check. `JSON.stringify(null)` is valid (`"null"`).
    // eslint-disable-next-line unicorn/no-null
    expect(() => isJSONSerializable(null)).not.toThrow();
    // eslint-disable-next-line unicorn/no-null
    expect(isJSONSerializable(null)).toBe(true);
  });

  it("treats `undefined` as non-serializable", () => {
    expect(isJSONSerializable(undefined)).toBe(false);
  });

  it("treats plain objects and arrays as serializable", () => {
    expect(isJSONSerializable({ a: 1 })).toBe(true);
    expect(isJSONSerializable([1, 2, 3])).toBe(true);
  });

  it("treats objects with a `toJSON` method as serializable", () => {
    expect(isJSONSerializable(new Date())).toBe(true);
  });

  it("treats non-serializable values as non-serializable", () => {
    expect(isJSONSerializable(() => {})).toBe(false);
    expect(isJSONSerializable(Symbol("x"))).toBe(false);
    expect(isJSONSerializable(10n)).toBe(false);
    expect(isJSONSerializable(new Uint8Array([1, 2, 3]))).toBe(false);
    expect(isJSONSerializable(new FormData())).toBe(false);
    expect(isJSONSerializable(new URLSearchParams())).toBe(false);
  });
});
