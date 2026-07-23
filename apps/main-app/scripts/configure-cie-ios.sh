#!/bin/bash

set -euo pipefail

MODE="${1:-}"
CIE_ROOT="../../node_modules/@pagopa/react-native-cie"

move_if_missing() {
  local source="$1"
  local target="$2"

  # existing targets are authoritative; reconcile duplicates only if needed.
  if [[ -e "$target" ]]; then
    echo "Skipping move: $target already exists"
    return
  fi
  [[ -e "$source" ]] || {
    echo "Neither $source nor $target exists" >&2
    return 1
  }

  echo "Moving $source to $target"
  mv "$source" "$target"
}

case "$MODE" in
prod | ci)
  IOS_SOURCE="$CIE_ROOT/.ios"
  IOS_TARGET="$CIE_ROOT/ios"
  PODSPEC_SOURCE="$CIE_ROOT/.react-native-cie.podspec"
  PODSPEC_TARGET="$CIE_ROOT/react-native-cie.podspec"
  ;;
dev)
  IOS_SOURCE="$CIE_ROOT/ios"
  IOS_TARGET="$CIE_ROOT/.ios"
  PODSPEC_SOURCE="$CIE_ROOT/react-native-cie.podspec"
  PODSPEC_TARGET="$CIE_ROOT/.react-native-cie.podspec"
  ;;
*)
  echo "Usage: $0 <prod|dev|ci>" >&2
  exit 1
  ;;
esac

move_if_missing "$IOS_SOURCE" "$IOS_TARGET"
move_if_missing "$PODSPEC_SOURCE" "$PODSPEC_TARGET"

case "$MODE" in
prod)
  echo "Installing iOS pods"
  (cd ios && bundle exec pod install)
  ;;
dev)
  echo "Removing installed iOS pods"
  rm -rf ios/Pods
  echo "Installing iOS pods without the internal module"
  (cd ios && NO_INTERNAL_MODULE=1 bundle exec pod install)
  ;;
esac
