import { ProxyAgent } from "undici";
import { ofetch } from "ofetch";

// Note: You need a squid server running locally
const proxyAgent = new ProxyAgent("http://localhost:3128");

const data = await ofetch("https://icanhazip.com", {
  dispatcher: proxyAgent,
});

console.log(data);
