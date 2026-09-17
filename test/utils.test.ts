import { describe, it, expect } from "vitest";
import { isJSONSerializable } from "../src/utils.ts";

describe("utils", () => {
  describe("isJSONSerializable", () => {
    it("returns true for null (fixes #571)", () => {
      // null is the fixture under test here — unicorn/no-null must stay on
      // for the rest of the file, so this line needs a targeted suppression.
      // eslint-disable-next-line unicorn/no-null
      expect(isJSONSerializable(JSON.parse("null"))).toBe(true);
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

    it.each([new FormData(), new URLSearchParams()])(
      "returns false for form bodies even with toJSON (#580): %s",
      (body) => {
        expect(isJSONSerializable(body)).toBe(false);
        Object.assign(body, { toJSON: () => ({}) });
        expect(isJSONSerializable(body)).toBe(false);
      }
    );

    it("does not throw when SharedArrayBuffer is unavailable", () => {
      const saved = globalThis.SharedArrayBuffer;
      try {
        (globalThis as any).SharedArrayBuffer = undefined;
        expect(isJSONSerializable({ hello: "world" })).toBe(true);
      } finally {
        (globalThis as any).SharedArrayBuffer = saved;
      }
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
