import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { xstateInspectorPlugin } from "./server/plugin.ts";

export default defineConfig({
  plugins: [react(), xstateInspectorPlugin()],
  server: {
    host: "0.0.0.0",
    open: true,
    port: 5173,
    strictPort: true
  },
  build: {
    // A dev tool: the bundle stays readable and mapped back to `src/`.
    sourcemap: true
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "server/**/*.test.ts"]
  }
});
