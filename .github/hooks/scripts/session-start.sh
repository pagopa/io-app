#!/usr/bin/env bash
set -euo pipefail

# Fresh worktrees do not share node_modules. Install dependencies only when
# missing, skipping lifecycle scripts because Copilot does not run the native
# app or need CocoaPods. Run prepare explicitly to install Husky's commit and
# push checks.
if [ ! -d node_modules ]; then
  pnpm install --ignore-scripts
  pnpm prepare
fi

# API definitions are generated and ignored by Git, so fresh worktrees do not
# contain them. Regenerate them when missing so generated imports resolve.
if [ ! -d apps/main-app/definitions ] ||
  pnpm nx run @io-app/main-app:generate
fi
