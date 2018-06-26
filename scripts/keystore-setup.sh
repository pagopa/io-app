#!/bin/bash

echo $ENCODED_ITALIAAPP_RELEASE_KEYSTORE | base64 --decode >> /tmp/italiaapp-release.keystore
