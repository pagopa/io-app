#!/bin/bash

echo "Installing build SDK for Android API level $ANDROID_SDK_BUILD_API_LEVEL..."
echo y | sdkmanager "platforms;android-$ANDROID_SDK_BUILD_API_LEVEL"
echo "Installing SDK build tools, revision $ANDROID_SDK_BUILD_TOOLS_REVISION..."
echo y | sdkmanager "build-tools;$ANDROID_SDK_BUILD_TOOLS_REVISION"
echo "Installing Google APIs for Android API level $ANDROID_SDK_BUILD_API_LEVEL..."
echo y | sdkmanager "add-ons;addon-google_apis-google-$ANDROID_SDK_BUILD_API_LEVEL"
echo "Installing Android Support Repository"
echo y | sdkmanager "extras;android;m2repository"
