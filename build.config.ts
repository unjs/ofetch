import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true
  },
  entries: [
    "src/index",
    "src/node",
    "src/undici"
  ]
});
