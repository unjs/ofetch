import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src"],
      reporter: ["text", "clover", "json"],
    },
  },
});
