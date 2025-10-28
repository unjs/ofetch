import { ofetch } from "ofetch";

try {
  await ofetch("https://api.github.com", {
    method: "POST",
  });
} catch (error) {
  // Error will be pretty printed
  console.error(error);

  // This allows us to access the error body
  console.log(error.data);
}
