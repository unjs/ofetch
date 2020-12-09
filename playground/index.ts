import { $fetch } from '../src/node'

async function main () {
  await $fetch('http://google.com/404')
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
