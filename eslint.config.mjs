import unjs from "eslint-config-unjs";

// https://github.com/unjs/eslint-config
export default unjs({
  ignores: [],
  rules: {
  "no-undef": 0,
  "unicorn/consistent-destructuring": 0,
  "unicorn/no-await-expression-member": 0
},
});