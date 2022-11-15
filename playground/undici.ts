import { $fetch } from "../src/undici";

async function main () {
  const r = await $fetch<string>("http://google.com/404");
  // eslint-disable-next-line no-console
  console.log(r);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
