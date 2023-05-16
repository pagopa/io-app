#!/bin/bash

# Recreate google-services.json from ENV variable
echo $ENCODED_IOAPP_GOOGLE_SERVICES_JSON_FILE | base64 --decode > $1/google-services.json

# Recreate JSON key file (for Google Play) from ENV variable
echo $ENCODED_IOAPP_JSON_KEY_FILE | base64 --decode > /tmp/json-key.json

# Recreate keystore from ENV variable
echo $ENCODED_IO_APP_RELEASE_KEYSTORE | base64 --decode > /tmp/ioapp-release.keystore