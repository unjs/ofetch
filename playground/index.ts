import { $fetch } from "../src/node";

async function main() {
  // const r = await $fetch<string>('http://google.com/404')
  const r = await $fetch<string>("http://httpstat.us/500");
  // const r = await $fetch<string>('http://httpstat/500')

  console.log(r);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
