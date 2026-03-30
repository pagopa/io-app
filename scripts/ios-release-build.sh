#!/bin/bash

cp .env.production .env
yarn postinstall
yarn cie-ios:ci
touch ./ios/fastlane/AuthKey_$APP_STORE_API_KEY_ID.p8
echo -e "$APP_STORE_API_PRIVATE_KEY" > ./ios/fastlane/AuthKey_$APP_STORE_API_KEY_ID.p8
