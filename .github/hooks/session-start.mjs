#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import { readPayload } from "./shared.mjs";

const payload = await readPayload();

if (payload.source !== "resume") {
  execFileSync("pnpm", ["install"], { stdio: "inherit" });
  execFileSync("pnpm", ["nx", "run", "@io-app/main-app:sync"], {
    stdio: "inherit"
  });
}
