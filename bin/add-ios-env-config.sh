#!/bin/bash

if which ruby > /dev/null
then
  RNC_ROOT="./node_modules/react-native-config"
  export SYMROOT="$RNC_ROOT/ios/ReactNativeConfig"
  export BUILD_DIR="$RNC_ROOT/ios/ReactNativeConfig"
  ENV_ROOT="$(cd "$(dirname "$1")"; pwd -P)/$(basename "$1")"
  ruby "$RNC_ROOT/ios/ReactNativeConfig/BuildDotenvConfig.rb" "$ENV_ROOT" "$ENV_ROOT"
fi
