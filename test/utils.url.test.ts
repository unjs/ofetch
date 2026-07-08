import { describe, it, expect } from "vitest";
import { withBase } from "../src/utils.url.ts";

describe("withBase", () => {
  it("returns the input unchanged when base is empty", () => {
    expect(withBase("/foo", "")).toBe("/foo");
  });

  it("returns the input unchanged when base is '/'", () => {
    expect(withBase("/foo", "/")).toBe("/foo");
  });

  it("joins base and input when input lacks the base", () => {
    expect(withBase("/foo", "https://api.example.com")).toBe(
      "https://api.example.com/foo"
    );
  });

  it("returns input unchanged when input already starts with base and the boundary is '/'", () => {
    expect(
      withBase("https://api.example.com/x", "https://api.example.com")
    ).toBe("https://api.example.com/x");
  });

  it("returns input unchanged when input equals base exactly", () => {
    expect(withBase("https://api.example.com", "https://api.example.com")).toBe(
      "https://api.example.com"
    );
  });

  it("returns input unchanged when boundary is '?'", () => {
    expect(
      withBase("https://api.example.com?q=1", "https://api.example.com")
    ).toBe("https://api.example.com?q=1");
  });

  it("returns input unchanged when boundary is '#'", () => {
    expect(
      withBase("https://api.example.com#frag", "https://api.example.com")
    ).toBe("https://api.example.com#frag");
  });

  // Regression test for issue #564: previously, an input like
  // "http://api.internal.attacker.com/steal" would be returned unchanged
  // when base was "http://api.internal", because it merely starts with the
  // base string. That bypass let attacker-controlled inputs reach arbitrary
  // hosts. The fix requires a URL boundary character after the base.
  it("rejects boundary-less prefix match and joins instead (SSRF guard)", () => {
    expect(
      withBase("http://api.internal.attacker.com/steal", "http://api.internal")
    ).toBe("http://api.internal/http://api.internal.attacker.com/steal");
  });
});
