#!/bin/bash

# Configures expo-cie-sdk pods; the original framework only supports devices.
# - prod: installs pods with the original SDK.
# - dev: installs the Expo module with its unsupported-device stub.
# - ci: checks the module sources without installing pods.

set -euo pipefail

MODE="${1:-}"
CIE_ROOT="../../libs/expo-cie-sdk/ios"

case "$MODE" in
prod)
  echo "Installing iOS pods"
  (cd ios && NO_INTERNAL_MODULE=0 bundle exec pod install)
  ;;
dev)
  echo "Installing iOS pods without the internal module"
  (cd ios && NO_INTERNAL_MODULE=1 bundle exec pod install)
  ;;
ci)
  test -f "$CIE_ROOT/ExpoCieSdk.podspec"
  test -f "$CIE_ROOT/iociesdkios.framework/iociesdkios"
  ;;
*)
  echo "Usage: $0 <prod|dev|ci>" >&2
  exit 1
  ;;
esac
