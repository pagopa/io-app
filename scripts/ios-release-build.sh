#!/bin/bash

cp .env.production .env
yarn postinstall
yarn cie-ios:ci
touch ./ios/fastlane/AuthKey_$APP_STORE_API_KEY_ID.p8
echo -e "$APP_STORE_API_PRIVATE_KEY" > ./ios/fastlane/AuthKey_$APP_STORE_API_KEY_ID.p8

# read the previous tag in order to generate the Test changelog
PREVIOUS_TAG=$(git tag --sort=-taggerdate | grep \\-rc\\. | sed -n '2 p')
echo PREVIOUS_TAG
touch ./ios/fastlane/previous_tag
echo -e "$PREVIOUS_TAG" > ./ios/fastlane/previous_tag
