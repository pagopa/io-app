#!/bin/bash

# Prepares a release build of the iOS app on CI. Set APP_VARIANT=canary to
# generate the canary native project. Pods are installed by fastlane.

set -euo pipefail

cp .env.production .env
pnpm postinstall
pnpm cie-ios ci
pnpm exec expo prebuild --platform ios --clean --no-install
./scripts/ios-app-store-api-key.sh
