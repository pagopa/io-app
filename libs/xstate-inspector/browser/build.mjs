/**
 * Builds the inspector UI into `browser/dist`, the directory the middleware
 * serves. `index.html` is authored, so it is copied verbatim rather than
 * generated; only the ES modules under `browser/src` are bundled.
 *
 * Run it through `pnpm nx run xstate-inspector:build`, or with `--watch` while
 * working on the UI.
 */
import { copyFileSync, mkdirSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const browserDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(browserDir, "dist");
const indexHtml = join(browserDir, "index.html");
const indexHtmlOut = join(distDir, "index.html");

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: [join(browserDir, "src", "app.js")],
  outfile: join(distDir, "app.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  // The UI is only ever served by the dev server, so it stays readable and
  // mapped back to `src/` instead of being minified.
  sourcemap: true,
  logLevel: "info"
};

mkdirSync(distDir, { recursive: true });
copyFileSync(indexHtml, indexHtmlOut);

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);
  await context.watch();
  // esbuild watches only the modules it bundles, so without this the markup
  // and its inline styles would sit stale next to a fresh bundle. The
  // directory is watched, not the file: an editor that saves atomically
  // replaces the inode and a file watch would stop being notified.
  watch(browserDir, (_event, filename) => {
    if (filename === "index.html") {
      copyFileSync(indexHtml, indexHtmlOut);
    }
  });
  console.log(`watching ${join("browser", "src")} and index.html`);
} else {
  await esbuild.build(options);
}
