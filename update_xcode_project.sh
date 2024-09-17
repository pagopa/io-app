#!/bin/bash
# Default values
DEFAULT_TEAM_ID="M2X5YQ4BJ7" # For PagoPA "M2X5YQ4BJ7"
DEFAULT_BUNDLE_IDENTIFIER="it.pagopa.app.io" # For PagoPA "it.pagopa.app.io"
DEFAULT_NODE_PATH=$(which node)
# Parameters with fallbacks
TEAM_ID=${1:-$DEFAULT_TEAM_ID}
BUNDLE_IDENTIFIER=${2:-$DEFAULT_BUNDLE_IDENTIFIER}
NODE_PATH=${3:-$DEFAULT_NODE_PATH}
# File to be modified
PBXPROJ_FILE="ios/ItaliaApp.xcodeproj/project.pbxproj"
# Enable automatic signing and set the new team ID
sed -i.bak "s/DevelopmentTeam = .*;/DevelopmentTeam = $TEAM_ID;/g" $PBXPROJ_FILE
sed -i.bak "s/ProvisioningStyle = Manual;/ProvisioningStyle = Automatic;/g" $PBXPROJ_FILE
# Update the NODE_BINARY path in the shell script
sed -i.bak "s|export NODE_BINARY=node|export NODE_BINARY=$NODE_PATH|g" $PBXPROJ_FILE
# Change the bundle identifier
sed -i.bak "s|PRODUCT_BUNDLE_IDENTIFIER = .*;|PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_IDENTIFIER;|g" $PBXPROJ_FILE
# Update the provisioning profile specifier
sed -i.bak "s|PROVISIONING_PROFILE_SPECIFIER = .*;|PROVISIONING_PROFILE_SPECIFIER = \"\";|g" $PBXPROJ_FILE
# Update the code sign identity and code sign style
sed -i.bak "s|CODE_SIGN_IDENTITY = .*;|CODE_SIGN_IDENTITY = \"Apple Development\";|g" $PBXPROJ_FILE
sed -i.bak "s|\"CODE_SIGN_IDENTITY\[sdk=iphoneos\*\]\" = .*;|CODE_SIGN_STYLE = Automatic;|g" $PBXPROJ_FILE
# Ensure all instances of DEVELOPMENT_TEAM are updated
sed -i.bak "s|DEVELOPMENT_TEAM = .*;|DEVELOPMENT_TEAM = $TEAM_ID;|g" $PBXPROJ_FILE
# Clean up backup file created by sed
rm ${PBXPROJ_FILE}.bak
echo "Modifications completed successfully."