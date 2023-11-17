import { Agent } from "undici";
import { ofetch } from "ofetch";

// Note: This make fetch unsecure to MITM attacks. USE AT YOUW OWN RISK!
const unsecureAgent = new Agent({ connect: { rejectUnauthorized: false } });
const unsecureFetch = ofetch.create({ dispatcher: unsecureAgent });
const data = await unsecureFetch("https://www.squid-cache.org/");

console.log(data);
