#!/bin/bash

echo $ENCODED_GOOGLE_SERVICES_JSON_FILE | base64 --decode > $1/google-services.json
