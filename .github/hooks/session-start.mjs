#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import { readPayload } from "./shared.mjs";

await readPayload();

execFileSync("pnpm", ["install", "--ignore-scripts"], { stdio: "inherit" });
execFileSync("pnpm", ["prepare"], { stdio: "inherit" });
execFileSync("pnpm", ["nx", "run", "@io-app/main-app:generate"], {
  stdio: "inherit"
});
