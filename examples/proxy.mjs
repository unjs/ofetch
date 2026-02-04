import { ofetch } from "ofetch";

// Node.js: Use undici ProxyAgent with dispatcher option
// import { ProxyAgent } from "undici";
// const proxyAgent = new ProxyAgent("http://localhost:3128");

// Bun: Use native proxy option
const proxy = "http://localhost:3128";

// Deno: Set HTTP_PROXY environment variable or use undici with npm specifier
// HTTP_PROXY=http://localhost:3128 deno run --allow-net proxy.mjs

const data = await ofetch("https://icanhazip.com", {
  // dispatcher: proxyAgent, // Node.js
  proxy, // Bun
});

console.log(data);
