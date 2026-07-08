import { describe, it, expect } from "vitest";
import { isJSONSerializable } from "../src/utils.ts";

describe("isJSONSerializable", () => {
  it("returns true for null", () => {
    expect(isJSONSerializable(null)).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isJSONSerializable(undefined)).toBe(false);
  });

  it("returns true for strings", () => {
    expect(isJSONSerializable("hello")).toBe(true);
  });

  it("returns true for numbers", () => {
    expect(isJSONSerializable(42)).toBe(true);
    expect(isJSONSerializable(0)).toBe(true);
    expect(isJSONSerializable(-1)).toBe(true);
    expect(isJSONSerializable(3.14)).toBe(true);
  });

  it("returns true for booleans", () => {
    expect(isJSONSerializable(true)).toBe(true);
    expect(isJSONSerializable(false)).toBe(true);
  });

  it("returns true for arrays", () => {
    expect(isJSONSerializable([])).toBe(true);
    expect(isJSONSerializable([1, 2, 3])).toBe(true);
    expect(isJSONSerializable([null, undefined])).toBe(true);
  });

  it("returns true for plain objects", () => {
    expect(isJSONSerializable({})).toBe(true);
    expect(isJSONSerializable({ a: 1 })).toBe(true);
  });

  it("returns false for buffers", () => {
    expect(isJSONSerializable(new ArrayBuffer(8))).toBe(false);
  });

  it("returns false for FormData", () => {
    expect(isJSONSerializable(new FormData())).toBe(false);
  });

  it("returns false for URLSearchParams", () => {
    expect(isJSONSerializable(new URLSearchParams())).toBe(false);
  });
});