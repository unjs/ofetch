import { ofetch } from "ofetch";

const response = await ofetch("https://api.github.com/repos/unjs/ofetch/tags", {
  query: {
    per_page: 2,
  },
}); // Be careful, we use the GitHub API directly.

console.log(response);
