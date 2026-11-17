import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./web", import.meta.url)),
  base: "/_expo/plugins/@io-app/expo-xstate-inspector/",
  plugins: [tailwindcss()],
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/expo-dev-plugins": {
        target: "http://localhost:8081",
        ws: true
      }
    }
  }
});
