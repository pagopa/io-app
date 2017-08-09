#!/bin/bash

# This script patches the original bundle script found at
# https://github.com/facebook/react-native/blob/master/scripts/react-native-xcode.sh
# and inside `./node_modules/react-native/scripts/` after each successful install
# in order to append the sourcemaps generation argument
# `  --sourcemap-output "$BUNDLE_FILE.map"`
# after the line
# `  --bundle-output "$BUNDLE_FILE" \`
# This script is ran on each `yarn install` (or `npm install`)
# with a `postinstall` script found in `package.json`

# Original target script that is invoked as part of Xcode build process
ORIGINAL_BUILD_SCRIPT=./node_modules/react-native/scripts/react-native-xcode.sh
# A local backup of the same script, also serving as lock file
BACKUP_BUILD_SCRIPT=./node_modules/react-native/scripts/react-native-xcode.back.sh

# The backup file does not exist yet
if [ ! -f "$BACKUP_BUILD_SCRIPT" ]
then
  echo "Running custom 'postinstall' script: 'bin/add-ios-source-maps.sh'"
  echo "Patching build script: $ORIGINAL_BUILD_SCRIPT"

  # Create a backup for the original `react-native-xcode.sh` script in `node_modules`
  cp -n "$ORIGINAL_BUILD_SCRIPT" "$BACKUP_BUILD_SCRIPT"
  # append `  --sourcemap-output "$BUNDLE_FILE.map"` to the 'bundle' after `--bundle-output "$BUNDLE_FILE" \`
  replace=$(awk '1;/bundle-output /{ print "  --sourcemap-output \"$BUNDLE_FILE.map\" \\"}' "$ORIGINAL_BUILD_SCRIPT")
  echo "$replace" > "$ORIGINAL_BUILD_SCRIPT"
else
  echo "Custom 'postinstall' script: 'bin/add-ios-source-maps.sh' did not run"
  echo "if this was the first time you ran 'install' on the project, please report this issue here:"
  echo "https://github.com/teamdigitale/ItaliaApp/issues"
fi
