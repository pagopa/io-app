import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The middleware in the app serves the page under this prefix, so the
  // emitted asset URLs have to carry it too.
  base: "/xstate-inspector/",
  plugins: [react()],
  build: {
    // A dev tool: the bundle stays readable and mapped back to `src/`.
    sourcemap: true
  },
  test: {
    globals: true
  }
});
