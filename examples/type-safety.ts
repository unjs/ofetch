// @ts-ignore
import { ofetch } from "ofetch";

interface Repo {
  id: number;
  name: string;
  repo: string;
  description: string;
  stars: number;
}

async function main() {
  const { repo } = await ofetch<{ repo: Repo }>(
    "https://ungh.cc/repos/unjs/ofetch"
  );

  console.log(`The repo ${repo.name} has ${repo.stars} stars.`); // The repo object is now strongly typed.
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(console.error);
