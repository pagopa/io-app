#!/bin/bash

# Writes the App Store Connect API key read by fastlane (see fastlane/Fastfile).

set -euo pipefail

echo -e "$APP_STORE_API_PRIVATE_KEY" >"./fastlane/AuthKey_$APP_STORE_API_KEY_ID.p8"
