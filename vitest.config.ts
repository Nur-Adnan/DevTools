import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    },
    alias: {
      "@/": path.resolve(__dirname, "./apps/web/"),
      "@ui/": path.resolve(__dirname, "./packages/ui/src/"),
      "@server/": path.resolve(__dirname, "./apps/web/server/"),
      "@types/": path.resolve(__dirname, "./apps/web/types/"),
      "@config/": path.resolve(__dirname, "./packages/config/src/"),
      "@features/": path.resolve(__dirname, "./apps/web/features/")
    }
  }
})
