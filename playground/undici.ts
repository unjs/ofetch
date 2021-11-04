import { $fetch } from '../src/undici'

async function main () {
  const r = await $fetch<string>('http://google.com/404')
  // eslint-disable-next-line no-console
  console.log(r)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
