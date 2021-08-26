#!/bin/bash

echo $ENCODED_IOAPP_JSON_KEY_FILE | base64 --decode > /tmp/json-key.json
