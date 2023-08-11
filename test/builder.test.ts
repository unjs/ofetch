import { listen } from "listhen";
import { getQuery } from "ufo";
import { createApp, eventHandler, readBody, toNodeListener } from "h3";
import { describe, beforeEach, afterEach, it, expect } from "vitest";
import type { Listener } from "listhen";
import { createClient } from "../src/builder";
import type { ClientBuilder } from "../src/builder";

// Test TypeScript support
interface TypedGetResponse {
  foo: string;
}

describe("rest client", () => {
  let listener: Listener;
  let client: ClientBuilder;

  beforeEach(async () => {
    const app = createApp()
      .use(
        "/foo/1",
        eventHandler(() => ({ foo: "1" }))
      )
      .use(
        "/foo",
        eventHandler(() => ({ foo: "bar" }))
      )
      .use(
        "/bar",
        eventHandler(async (event) => ({
          url: event.node.req.url,
          body: await readBody(event),
          headers: event.node.req.headers,
          method: event.node.req.method,
        }))
      )
      .use(
        "/params",
        eventHandler((request) => getQuery(request.node.req.url || ""))
      );
    listener = await listen(toNodeListener(app), { port: 3001 });
    client = createClient({
      baseURL: listener.url,
      headers: {
        "X-Foo": "bar",
      },
    });
  });

  afterEach(async () => {
    await listener.close();
  });

  it("GET request", async () => {
    const response = await client.foo.get();
    expect(response).to.deep.equal({ foo: "bar" });
  });

  it("POST request", async () => {
    const response = await client.bar.post({ foo: "bar" });
    expect(response.body).to.deep.equal({ foo: "bar" });
    expect(response.method).to.equal("POST");
  });

  it("PUT request", async () => {
    const response = await client.bar.put({ foo: "bar" });
    expect(response.body).to.deep.equal({ foo: "bar" });
    expect(response.method).to.equal("PUT");
  });

  it("DELETE request", async () => {
    const response = await client.bar.delete();
    expect(response.method).to.equal("DELETE");
  });

  it("PATCH request", async () => {
    const response = await client.bar.patch({ foo: "bar" });
    expect(response.body).to.deep.equal({ foo: "bar" });
    expect(response.method).to.equal("PATCH");
  });

  it("query parameter", async () => {
    const response = await client.params.get({ test: "true" });
    expect(response).to.deep.equal({ test: "true" });
  });

  it("default options", async () => {
    const { headers } = await client.bar.post();
    expect(headers).to.include({ "x-foo": "bar" });
  });

  it("override default options", async () => {
    const { headers } = await client.bar.post(
      {},
      { headers: { "X-Foo": "baz" } }
    );
    expect(headers).to.include({ "x-foo": "baz" });
  });

  it("bracket syntax for path segment", async () => {
    const response = await client.foo["1"].get<TypedGetResponse>();
    expect(response).to.deep.equal({ foo: "1" });
  });

  it("chain syntax for path segment", async () => {
    const response = await client.foo(1).get<TypedGetResponse>();
    expect(response).to.deep.equal({ foo: "1" });
  });

  it("multiple path segments", async () => {
    const response = await client("foo", "1").get<TypedGetResponse>();
    expect(response).to.deep.equal({ foo: "1" });
  });

  it("invalid api endpoint", () => {
    expect(invalidHandle()).rejects.toThrow(
      /404 Cannot find any route matching \/baz/
    );
  });

  async function invalidHandle() {
    await client.baz.get<TypedGetResponse>();
  }
});
