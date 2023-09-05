import { $fetch } from "ofetch"

async function main() {
  try {
    await $fetch("https://api.github.com", {
      method: 'POST'
    })
  } catch (error) {
    console.log(error.data) // This allow us to get the error body.
  }
}

main().catch(console.error)
