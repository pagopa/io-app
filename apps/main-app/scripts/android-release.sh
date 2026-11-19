#!/bin/bash

# Writes the Android release secrets outside the generated android/ folder,
# which `expo prebuild --clean` wipes.

# Recreate google-services.json from ENV variable: pass it to `expo prebuild`
# through GOOGLE_SERVICES_JSON (see app.config.ts)
echo $ENCODED_IOAPP_GOOGLE_SERVICES_JSON_FILE | base64 --decode > /tmp/google-services.json

# Recreate JSON key file (for Google Play) from ENV variable
echo $ENCODED_IOAPP_JSON_KEY_FILE | base64 --decode > /tmp/json-key.json

# Recreate keystore from ENV variable
echo $ENCODED_IO_APP_RELEASE_KEYSTORE | base64 --decode > /tmp/ioapp-release.keystore
