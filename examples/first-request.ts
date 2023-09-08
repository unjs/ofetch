import { ofetch } from "ofetch";

async function main() {
  const data = await ofetch("https://ungh.cc/repos/unjs/ofetch");

  console.log(data);
}

main().catch(console.error);
