import { ofetch } from "ofetch";

async function main() {
  const response = await ofetch(
    "https://api.github.com/repos/unjs/ofetch/tags",
    {
      query: {
        per_page: 2,
      },
    }
  ); // Be careful, we use the GitHub API directly.

  console.log(response);
}

main().catch(console.error);
