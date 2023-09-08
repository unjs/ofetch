import { ofetch } from "ofetch";

async function main() {
  try {
    await ofetch("https://api.github.com", {
      method: "POST",
    });
  } catch (error) {
    console.log(error.data); // This allow us to get the error body.
  }
}

main().catch(console.error);
