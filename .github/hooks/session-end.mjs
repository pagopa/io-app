#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import { readPayload } from "./shared.mjs";

const payload = await readPayload();

if (["complete", "user_exit"].includes(payload.reason)) {
  execFileSync("pnpm", ["prettier:check"], { stdio: "inherit" });
  execFileSync(
    "pnpm",
    [
      "nx",
      "affected",
      "--targets=lint,tsc-noemit",
      "--configuration=ci",
      "--nx-bail"
    ],
    { stdio: "inherit" }
  );
}
