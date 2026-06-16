import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Vitest config for the pure-TS game engine + store tests. The "@/..." alias
// mirrors the tsconfig paths so test imports match the app's imports.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
