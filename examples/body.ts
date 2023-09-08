import { ofetch } from "ofetch";

async function main() {
  const response = await ofetch<string>("https://api.github.com/markdown", {
    method: "POST",
    // To provide a body, we need to use the `body` option and just use an object.
    body: {
      text: "UnJS is **awesome**!\n\nCheck out their [website](https://unjs.io).",
    },
  }); // Be careful, we use the GitHub API.

  console.log(response);
}

main().catch(console.error);
