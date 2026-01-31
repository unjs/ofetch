// ==============================================================
// Proxy Examples for Different Runtimes
// ==============================================================

// --------------------------------------------------------------
// Node.js (using undici ProxyAgent)
// --------------------------------------------------------------
// Note: Uncomment to test in Node.js environment
// import { ofetch } from "ofetch";
// import { ProxyAgent } from "undici";
//
// const proxyAgent = new ProxyAgent("http://localhost:3128");
// const data = await ofetch("https://icanhazip.com", {
//   dispatcher: proxyAgent
// });
// console.log("Node.js with proxy:", data);

// --------------------------------------------------------------
// Bun (using native proxy option)
// --------------------------------------------------------------
// Note: Uncomment to test in Bun environment
// import { ofetch } from "ofetch";
//
// const data = await ofetch("https://icanhazip.com", {
//   proxy: "http://localhost:3128"
// });
// console.log("Bun with proxy:", data);
//
// // With authentication:
// const authData = await ofetch("https://icanhazip.com", {
//   proxy: "http://username:[email protected]:3128"
// });
// console.log("Bun with auth proxy:", authData);

// --------------------------------------------------------------
// Deno (using environment variables or undici)
// --------------------------------------------------------------
// Option 1: Set HTTP_PROXY environment variable before running
// HTTP_PROXY=http://localhost:3128 deno run --allow-net your-script.ts
//
// Option 2: Use undici with npm specifier (uncomment to test)
// import { ofetch } from "npm:ofetch";
// import { ProxyAgent } from "npm:undici";
// const proxyAgent = new ProxyAgent("http://localhost:3128");
// const data = await ofetch("https://icanhazip.com", {
//   dispatcher: proxyAgent
// });
// console.log("Deno with proxy:", data);

// --------------------------------------------------------------
// Self-signed certificates (USE AT YOUR OWN RISK!)
// --------------------------------------------------------------
// Note: Uncomment to test - works in Node.js and Deno with undici
// import { ofetch } from "ofetch";
// import { Agent } from "undici";
//
// // This makes fetch unsecure against MITM attacks. USE AT YOUR OWN RISK!
// const unsecureAgent = new Agent({ connect: { rejectUnauthorized: false } });
// const unsecureFetch = ofetch.create({ dispatcher: unsecureAgent });
// const data = await unsecureFetch("https://self-signed.example.com/");
// console.log("Unsecure fetch:", data);

console.log(
  "Proxy examples are commented out. Uncomment the relevant section for your runtime."
);
