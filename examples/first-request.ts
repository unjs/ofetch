import { $fetch } from "ofetch"

async function main() {
  const data = await $fetch("https://ungh.cc/repos/unjs/ofetch")

  console.log(data)
}

main().catch(console.error)
