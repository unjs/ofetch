import { $fetch } from '../src/node'

async function main () {
  // const r = await $fetch<string>('http://google.com/404')
  const r = await $fetch<string>('http://httpstat.us/500')
  // const r = await $fetch<string>('http://httpstat/500')
  // eslint-disable-next-line no-console
  console.log(r)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
