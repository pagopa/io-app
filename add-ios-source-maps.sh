#!/bin/bash

script=./node_modules/react-native/scripts/react-native-xcode.sh
backup=./node_modules/react-native/scripts/react-native-xcode.back.sh

if [ ! -f "$backup" ]; then
  echo "Running custom build script: add-ios-source-maps.sh"
  echo "Patching script: ./node_modules/react-native/scripts/react-native-xcode.sh"

  # Create a backup for the `react-native-xcode.sh` script in `node_modules`
  cp -n "$script" "$backup"
  # append `  --sourcemap-output "$BUNDLE_FILE.map"` to the `bundle` after `--bundle-output "$BUNDLE_FILE" \`
  replace=$(awk '1;/bundle-output /{ print "  --sourcemap-output \"$BUNDLE_FILE.map\" \\"}' "$script")
  echo "$replace" > "$script"

fi
