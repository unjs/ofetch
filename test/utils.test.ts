import { describe, it, expect } from "vitest";
import { isJSONSerializable } from "../src/utils.ts";

describe("isJSONSerializable", () => {
  it("treats null as serializable and does not throw", () => {
    // `null` is valid JSON (`JSON.stringify(null) === "null"`).
    // Previously this threw `Cannot read properties of null (reading 'buffer')`.
    /* eslint-disable unicorn/no-null -- exercising null is the point of this test */
    expect(() => isJSONSerializable(null)).not.toThrow();
    expect(isJSONSerializable(null)).toBe(true);
    /* eslint-enable unicorn/no-null */
  });

  it("handles primitives", () => {
    expect(isJSONSerializable("hello")).toBe(true);
    expect(isJSONSerializable(42)).toBe(true);
    expect(isJSONSerializable(true)).toBe(true);
    expect(isJSONSerializable(undefined)).toBe(false);
    expect(isJSONSerializable(10n)).toBe(false);
    expect(isJSONSerializable(() => {})).toBe(false);
  });

  it("handles plain objects and arrays", () => {
    expect(isJSONSerializable({ a: 1 })).toBe(true);
    expect(isJSONSerializable([1, 2, 3])).toBe(true);
    expect(isJSONSerializable({ toJSON: () => ({}) })).toBe(true);
  });

  it("rejects streams, FormData and URLSearchParams", () => {
    expect(isJSONSerializable(new FormData())).toBe(false);
    expect(isJSONSerializable(new URLSearchParams())).toBe(false);
  });
});
