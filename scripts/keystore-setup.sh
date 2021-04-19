#!/bin/bash

echo $ENCODED_IO_APP_RELEASE_KEYSTORE | base64 --decode > /tmp/italiaapp-release.keystore
