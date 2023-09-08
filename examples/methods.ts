import { ofetch } from "ofetch";

async function main() {
  const response = await ofetch("https://api.github.com/gists", {
    method: "POST",
  }); // Be careful, we use the GitHub API directly.

  console.log(response);
}

main().catch(console.error);
