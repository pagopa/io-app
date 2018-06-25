#!/bin/bash

echo $ENCODED_ITALIAAPP_RELEASE_KEYSTORE | base64 --decode >> ${HOME}/italia-app/android/app/italiaapp-release.keystore
