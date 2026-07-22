#!/usr/bin/env node

/**
 * Prepares the repository for a Copilot session.
 *
 * - Installs JavaScript dependencies without lifecycle scripts because runtime
 *   setup is unnecessary.
 * - Runs `pnpm prepare` to install the Husky Git hooks.
 * - Generates the API definitions used by the app.
 *
 * CocoaPods and other runtime-only dependencies are intentionally skipped
 * because Copilot does not run the app (for now)
 */

import { execFileSync } from "node:child_process";

import { readPayload } from "./shared.mjs";

await readPayload();

execFileSync("pnpm", ["install", "--ignore-scripts"], { stdio: "inherit" });
execFileSync("pnpm", ["prepare"], { stdio: "inherit" });
execFileSync("pnpm", ["nx", "run", "@io-app/main-app:generate"], {
  stdio: "inherit"
});
