import { $fetch } from "../src/node";

const myFetch = $fetch.create({
  onResponse: {
    strategy: "after",
    handler(ctx, data) {
      return 'global: ' + data
    },
  }
})

async function main() {
  const r = await myFetch<string>("http://httpstat.us/200", {
    onResponse(ctx, data) {
      return 'local -> ' + data
    }
  });
  // const r = await $fetch<string>('http://google.com/404')
  // const r = await $fetch<string>('http://httpstat/500')
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
