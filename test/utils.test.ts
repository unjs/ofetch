import { describe, it, expect } from "vitest";
import { isJSONSerializable } from "../src/utils.ts";

describe("utils", () => {
  describe("isJSONSerializable", () => {
    it("returns true for null (fixes #571)", () => {
      expect(isJSONSerializable(null)).toBe(true);
    });

    it("returns true for primitives", () => {
      expect(isJSONSerializable("string")).toBe(true);
      expect(isJSONSerializable(42)).toBe(true);
      expect(isJSONSerializable(true)).toBe(true);
      expect(isJSONSerializable(false)).toBe(true);
    });

    it("returns false for undefined", () => {
      expect(isJSONSerializable(undefined)).toBe(false);
    });

    it("returns true for plain objects", () => {
      expect(isJSONSerializable({})).toBe(true);
      expect(isJSONSerializable({ a: 1 })).toBe(true);
    });

    it("returns true for arrays", () => {
      expect(isJSONSerializable([])).toBe(true);
      expect(isJSONSerializable([1, 2, 3])).toBe(true);
    });

    it("returns false for TypedArrays and ArrayBuffer views", () => {
      expect(isJSONSerializable(new Uint8Array(4))).toBe(false);
      expect(isJSONSerializable(new ArrayBuffer(4))).toBe(false);
    });

    it("does not throw when accessing buffer throws", () => {
      const obj = {
        constructor: { name: "Object" },
        get buffer() {
          throw new Error("getter error");
        },
      };
      // Should return true (plain object) instead of throwing
      expect(isJSONSerializable(obj)).toBe(true);
    });
  });
});
