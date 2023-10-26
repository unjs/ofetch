import { ofetch } from "ofetch";

const response = await ofetch("https://api.github.com/markdown", {
  method: "POST",
  // To provide a body, we need to use the `body` option and just use an object.
  body: {
    text: "UnJS is **awesome**!\n\nCheck out their [website](https://unjs.io).",
  },
});

console.log(response);
