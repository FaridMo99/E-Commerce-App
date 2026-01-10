import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@shared": "../shared",
    },
  },
});
