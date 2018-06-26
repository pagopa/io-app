#!/bin/bash

echo $ENCODED_ITALIAAPP_JSON_KEY_FILE | base64 --decode >> /tmp/json-key.json
