#!/usr/bin/env bash
set -euo pipefail

test_binary="$(mktemp -t device-identity-tests)"
trap 'rm -f "$test_binary"' EXIT
swiftc ios/DeviceIdentityResolver.swift ios/__tests__/DeviceIdentityResolverTests.swift -o "$test_binary"
"$test_binary"
