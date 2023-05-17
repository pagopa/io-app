<p align="center">
  <img src="img/app-logo.svg" width="100"/></br>
  <h3 align="center">IO - The public services app</h3>
</p>

<p align="center">
    <a href="https://github.com/pagopa/io-app/actions/workflows/test-e2e.yml">
        <img src="https://github.com/pagopa/io-app/actions/workflows/test-e2e.yml/badge.svg?branch=master" />
    </a>
    <a href="https://codecov.io/gh/pagopa/io-app">
        <img src="https://codecov.io/gh/pagopa/io-app/branch/master/graph/badge.svg" />
    </a>
  <img src="https://img.shields.io/github/contributors-anon/pagopa/io-app" />
  <img src="https://img.shields.io/github/repo-size/pagopa/io-app" />
</p>


<p align="center">
    <a href="https://apps.apple.com/it/app/io/id1501681835">
        <img height="50" src="img/badges/app-store-badge.png" alt="Download on the App Store" />
    </a>
    <a href="https://play.google.com/store/apps/details?id=it.pagopa.io.app">
        <img height="50" src="img/badges/google-play-badge.png" alt="Get it on Google Play"/>
    </a>
</p>

# The mobile app of the Digital Citizenship project

- [FAQ](#faq)
  - [What is the Digital Citizenship project?](#what-is-the-digital-citizenship-project)
  - [What is the Digital Citizenship mobile app?](#what-is-the-digital-citizenship-mobile-app)
  - [Who develops the app?](#who-develops-the-app)
  - [Can I use the app?](#can-i-use-the-app)
  - [How can I help you?](#how-can-i-help-you)
  - [What permissions are used by the IO app?](#what-permissions-are-used-by-the-io-app)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Build the app](#build-the-app)
  - [Environment variables](#environment-variables)
  - [Run the app](#run-the-app)
  - [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
  - [Main technologies used](#main-technologies-used)
  - [SPID Authentication](#spid-authentication)
  - [Deep linking](#deep-linking)
- Appendix
  - [Internationalization](locales/README.md)
  - [End to end test](e2e/README.md)
  - [Core components](ts/components/core/README.md) 🚧

# FAQ

## What is the Digital Citizenship project?

Digital Citizenship aims at bringing citizens to the center of the Italian public administrations services.

The project comprises two main components:

* a platform made of elements that enable the development of citizen-centric digital services;
* an interface for citizens to manage their data and their digital citizen profiles.

## What is the Digital Citizenship mobile app?

The Digital Citizenship mobile app is a native mobile application for iOS and Android with a dual purpose:

* to be an interface for citizens to manage their data and their digital citizen profile;
* to act as _reference implementation_ of the integrations with the Digital Citizenship platform.

## Who develops the app?

The development of the app is carried out by several contributors:

* [PagoPA S.p.A.](https://www.pagopa.it);
* volunteers who support the project.

## Can I use the app?

Sure! However you will need a [SPID account](https://www.agid.gov.it/en/platforms/spid) or have a [CIE](https://www.cartaidentita.interno.gov.it) to login to the app.

## How can I help you?

[Reporting bugs](https://github.com/pagopa/io-app/issues), bug fixes, [translations](locales/README.md) and generally any improvement is welcome! [Send us a Pull Request](https://github.com/pagopa/io-app/pulls)!

## What permissions are used by the IO app?

Because different platforms have different types of Permissions below we have two sections about permissions requested by the IO app for both environments (iOS and Android). Some permissions may be defined but not used. Their presence is due to dependencies with third-party modules or because they are required by the target store.

<details>
  <summary><b>Android</b></summary>
  <table>
    <tr>
        <td>Permission (android.permission.*)</td>
        <td>Usage / Meaning</td>
    </tr>
    <tr>
        <td>INTERNET</td>
        <td>Allows the app to open network sockets (e.g. simple internet connectivity)</td>
    </tr>
    <tr>
        <td>ACCESS_NETWORK_STATE</td>
        <td>Allows the app to access information about networks (e.g. details about connection quality/state)</td>
    </tr>
    <tr>
        <td>CAMERA</td>
        <td>Allows the app to access device camera to scan QR codes</td>
    </tr>
    <tr>
        <td>NFC</td>
        <td>Allows the app to perform I/O operations over NFC</td>
    </tr>
    <tr>
        <td>RECEIVE_BOOT_COMPLETED</td>
        <td>Allows the app to receive the Intent.ACTION_BOOT_COMPLETED that is broadcast after the system finishes booting. Used for push notification.</td>
    </tr>
    <tr>
        <td>VIBRATE</td>
        <td>Allows the app to access the vibration motor. This allow the application to emit vibration.</td>
    </tr>
    <tr>
        <td>WAKE_LOCK</td>
        <td>Allows the app to use PowerManager WakeLocks to keep processor from sleeping or screen from dimming. Used for push notification.</td>
    </tr>
    <tr>
        <td>READ_APP_BADGE</td>
        <td>Allows the app to show notification badges on its icon.</td>
    </tr>
    <tr>
        <td>READ_CALENDAR</td>
        <td>Allows the app to read the user&#39;s calendar data.</td>
    </tr>
    <tr>
        <td>WRITE_CALENDAR</td>
        <td>Allows the app to write the user&#39;s calendar data. Used to automatically set reminders.</td>
    </tr>
    <tr>
        <td>READ_EXTERNAL_STORAGE</td>
        <td>Allows the app to read from external storage. Used to pick images from gallery with payment QRCode.</td>
    </tr>
    <tr>
        <td>WRITE_EXTERNAL_STORAGE</td>
        <td>Allows the app to write to external storage. Used to store images, certificates, etc.</td>
    </tr>
    <tr>
        <td>USE_FINGERPRINT</td>
        <td>Allows the app to use fingerprint hardware for biometric identification required from API level 23 until API level 28</td>
    </tr>
    <tr>
        <td>USE_BIOMETRIC</td>
        <td>Allows the app to use device&#39;s available biometric identification system (Face unlock, Iris unlock, Fingerprint) required from API Level 28.</td>
    </tr>
    <tr>
      <td>SCHEDULE_EXACT_ALARM</td>
      <td>Allows the app to send local notifications.</td>
    </tr>
    <tr>
      <td>DOWNLOAD_WITHOUT_NOTIFICATION</td>
      <td>Allows the app to download files in background without promping a notification.</td>
    </tr>
  </table>                                     

Below there are the permissions required by the main android hardware manufacturers. Mainly used to manage notification badge icons.
<table>
    <tr>
        <td>Permission (manufacturer)</td>
        <td>Usage / Meaning</td>
    </tr>
    <tr>
        <td>com.google.android.c2dm.permission.RECEIVE</td>
        <td>Allows the app to receive a broadcast from a GCM server that contains a GCM message. Used for push notification.</td>
    </tr>
    <tr>
        <td>com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE</td>
        <td>Allows the app to recognize where the app was installed from. Used for Firebase.</td>
    </tr>
     <tr>
        <td>com.anddoes.launcher.permission.UPDATE_COUNT</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.htc.launcher.permission.READ_SETTINGS</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.htc.launcher.permission.UPDATE_SHORTCUT</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.CHANGE_BADGE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.READ_SETTINGS</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.WRITE_SETTINGS</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.majeur.launcher.permission.UPDATE_BADGE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.oppo.launcher.permission.READ_SETTINGS</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.oppo.launcher.permission.WRITE_SETTINGS</td>
        <td>Allows the app to use notification badgee.</td>
    </tr>
    <tr>
        <td>com.sec.android.provider.badge.permission.READ</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.sec.android.provider.badge.permission.WRITE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.sonyericsson.home.permission.BROADCAST_BADGE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>com.sonymobile.home.permission.PROVIDER_INSERT_BADGE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>me.everything.badger.permission.BADGE_COUNT_READ</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
    <tr>
        <td>me.everything.badger.permission.BADGE_COUNT_WRITE</td>
        <td>Allows the app to use notification badges.</td>
    </tr>
     <tr>
      <td>com.android.vending.CHECK_LICENSE</td>
      <td>Allows the app to access Google Play Licensing.</td>
    </tr>
     <tr>
      <td>com.samsung.android.providers.context.permission.WRITE_USE_APP_FEATURE_SURVEY</td>
      <td>Allows the app to use the Samsung Developer SDK. Used for Samsung biometric identification.</td>
    </tr>
     <tr>
      <td>com.fingerprints.service.ACCESS_FINGERPRINT_MANAGER</td>
      <td>Allows the app to access the fingerprint hardware for biometric identification.</td>
    </tr>
  </table>
</details>

<details>
   <summary><b>iOS</b></summary>
    <table>
    <tr>
        <td>Permission</td>
        <td>Usage / Meaning</td>
    </tr>
    <tr>
        <td>NSAppleMusicUsageDescription</td>
        <td>Allows the app to access the user’s media library.</td>
    </tr>
    <tr>
        <td>NSBluetoothAlwaysUsageDescription</td>
        <td>Allows the app to use the device’s Bluetooth interface.</td>
    </tr>
    <tr>
        <td>NSBluetoothPeripheralUsageDescription</td>
        <td>Allows the app to access Bluetooth peripherals and has a deployment target earlier than iOS 13.</td>
    </tr>
    <tr>
        <td>NSContactsUsageDescription</td>
        <td>Allows the app to access contacts to let you add them in calendar events.</td>
    </tr>
    <tr>
        <td>NSLocationAlwaysUsageDescription</td>
        <td>Allows the app to access the user’s location at all times and deploys to targets earlier than iOS 11.</td>
    </tr>
    <tr>
        <td>NSLocationUsageDescription</td>
        <td>Allows the app to access the user’s location information.</td>
    </tr>
    <tr>
        <td>NSLocationWhenInUseUsageDescription</td>
        <td>Allows the app to access the user’s location information while the app is in use.</td>
    </tr>
    <tr>
        <td>NSMicrophoneUsageDescription</td>
        <td>Allows the app to use the microphone in case you want to leave a voice note. Used in the assistance flow.</td>
    </tr>
    <tr>
        <td>NSMotionUsageDescription</td>
        <td>Allows the app to access the device’s motion data.</td>
    </tr>
    <tr>
        <td>NSCalendarsUsageDescription</td>
        <td>Allows the app to access the calendar to add event reminders.</td>
    </tr>
    <tr>
        <td>NSCameraUsageDescription</td>
        <td>Allows the app to use the camera to scan QR codes.</td>
    </tr>
    <tr>
        <td>NSFaceIDUsageDescription</td>
        <td>Allows the app to use Face ID for biometric identification.</td>
    </tr>
    <tr>
        <td>NSPhotoLibraryAddUsageDescription</td>
        <td>Allows the app to access the user’s photo library.</td>
    </tr>
    <tr>
        <td>NSPhotoLibraryUsageDescription</td>
        <td>Allows the app to access the photo library to scan QR codes.</td>
    </tr>
    <tr>
        <td>NSSpeechRecognitionUsageDescription</td>
        <td>Allows the app to send user data to Apple’s speech recognition servers. Used in the assistance flow.</td>
    </tr>
    <tr>
        <td>Remote  Notification</td>
        <td>Allows the app to receive remote push notification.</td>
    </tr>
    <tr>
        <td>NFC (Near Field Communication Tag Reading)</td>
        <td>Allows the app to use the NFC.</td>
    </tr>
  </table>
</details>

# Getting started

The following sections provide instructions to build and run the app for development purposes.

## Prerequisites

### NodeJS and Ruby
To run the project you need to install the correct version of NodeJS and Ruby.
We recommend the use of a virtual environment of your choice. For ease of use, this guide adopts [nodenv](https://github.com/nodenv/nodenv) for NodeJS, [rbenv](https://github.com/rbenv/rbenv) for Ruby.

The node version used in this project is stored in [.node-version](.node-version), 
while the version of Ruby is stored in [.ruby-version](.ruby-version).

### React Native
Follow the [official tutorial](https://reactnative.dev/docs/environment-setup?guide=native) for installing the `React Native CLI` for your operating system.

If you have a macOS system, you can follow both the tutorial for iOS and for Android. If you have a Linux or Windows system, you need only to install the development environment for Android.

## Build the app
In order to build the app, we use [yarn](https://yarnpkg.com/) for managing javascript dependencies. 
As stated [previously](#nodejs-and-ruby), we also use `nodenv` and `rbenv` for managing the environment:
```bash
# Clone the repository
$ git clone https://github.com/pagopa/io-app

# CD into the repository
$ cd io-app

# Install NodeJS with nodenv, the returned version should match the one in the .node-version file
$ nodenv install && nodenv version

# Install Ruby with rbenv, the returned version should match the one in the .ruby-version file
$ rbenv install && rbenv version

# Install yarn and rehash to install shims
$ npm install -g yarn && nodenv rehash

# Install bundle
$ gem install bundle

# Install the required Gems from the Gemfile
# Run this only during the first setup and when Gems dependencies change
$ bundle install

# Install dependencies 
# Run this only during the first setup and when JS dependencies change
$ yarn install

# Install podfiles when targeting iOS (ignore this step for Android)
# Run this only during the first setup and when Pods dependencies change
$ cd iOS && bundle exec pod install && cd ..

# Generate the definitions from the OpenAPI specs and from the YAML translations
# Run this only during the first setup and when specs/translations change
$ yarn generate
```

## Environment variables

### Production
You can target the production server by copying the included `.env.production` file to `.env`:

```bash
$ cp .env.production .env
```

> **Note**
> The sample configuration sets the app to interface with our test environment, on which we work continuously; therefore, it may occur that some features are not always available or fully working. Check the comments in the file for more informations about environment variables.

### io-dev-api-server
You can also target the [io-dev-api-server](https://github.com/pagopa/io-dev-api-server) for development purposes by coyping the included `.env.local` file to `.env`:

```bash
$ cp .env.local .env
```

## Run the app
### Android Emulator
An Android Emulator must be [created and launched manually](https://developer.android.com/studio/run/managing-avds).
Then, from your command line, run these commands:
```bash
# Perform the port forwarding
$ adb reverse tcp:8081 tcp:8081;adb reverse tcp:3000 tcp:3000;adb reverse tcp:9090 tcp:9090

# Run Android build
$ yarn run-android
```

### iOS Simulator
```bash
# Run iOS build
$ yarn run-ios
```

### Pyshical devices
The React Native documentation provides a [useful guide](https://reactnative.dev/docs/running-on-device) for running projects on pyshical devices.
> **Warning**
> On iOS you also have to change the `Bundle Identifier` to something unique before running io-app on your pyshical device. This can be done in the `Signing (Debug)` section of Xcode.



## Troubleshooting
This section lists possible solutions to problems you might encounter while building the app.
<details>
<summary>iOS build</summary>

-   ```
    error: redefinition of module 'YogaKit' build Failed
    ```
    Restart your machine to fix the issue.

    ---

-   ```
    error: Can't find 'node' binary to build React Native bundle If you have non-standard nodejs installation, select your project in Xcode, find 'Build Phases' - 'Bundle React Native code and images' and change NODE_BINARY to absolute path to your node executable (you can find it by invoking 'which node' in the terminal)
    ```
    While using a virtual node enviroment and building with Xcode you might encounter the aformentioned error.
    Create a local Xcode enviroment file by running: 
    ```bash
    $ cd ios
    $ cp .xcode.env .xcode.env.local
    ```
    Edit `.xcode.env.local` to your needs by adding your node binary path which can be found by running `which node`.

    ---

-   ```
    error No simulator available with name "iPhone 13".
    ```
    This happens because new versions of Xcode do not automatically create a simulator for the iPhone 13. 
    To fix the issue you can either create a new simulator and name it `iPhone 13` or run the command `yarn run-ios --simulator='a valid simulator name'`.

    ---

-   ```
    Application launch for 'it.pagopa.app.io' did not return a valid pid nor a launch error. Domain: NSPOSIXErrorDomain Code: 3 Failure Reason: No such process User Info: { DVTErrorCreationDateKey = "2022-01-25 12:02:41 +0000"; IDERunOperationFailingWorker = IDELaunchiPhoneSimulatorLauncher; }
    ```
    This happens on Apple Silicon CPUs because some `Pods` do not implement the `XCFramework` yet. Install `Rosetta` by running `softwareupdate --install-rosetta` to fix the issue.

    ---
</details>

# Architecture

## Main technologies used

* [TypeScript](https://www.typescriptlang.org/)
* [React Native](https://facebook.github.io/react-native)
* [Redux](http://redux.js.org/)
* [Redux Saga](https://redux-saga.js.org/)


## SPID Authentication

The application relies on a [backend](https://github.com/pagopa/io-backend) for the authentication through SPID (the Public System for Digital Identity) and for interacting with the other components and APIs that are part of the [digital citizenship project](https://github.com/teamdigitale/digital-citizenship).

The backend implements a SAML2 Service Provider that deals with user authentication with the SPID Identity Providers (IdP).

The authentication between the application and the backend takes place via a session token, generated by the backend at the time of the authentication with the SPID IdP.

Once the backend communicates the session token to the application, it is used for all subsequent calls that the application makes to the API exposed by the backend.

The authentication flow is as follows:

1. The user selects the IdP;
1. The app opens a webview on the SAML SP authentication endpoint implemented in the backend, which specifies: the entity ID of the IdP selected by the user and, as returns URL, the URL of the endpoint that generates a new session token.
1. The SAML SP logic takes over the authentication process by redirecting the user to the chosen IdP.
1. After the authentication, a redirect is made from the IdP to the backend endpoint that deals with the generation of a new session token.
1. The endpoint that generates a new token receives the SPID attributes via the HTTP header; then, it generates a new random session token and returns to the webview an HTTP redirect to an URL well-known containing the session token.
1. The app, which monitors the webview, intercepts this URL before the HTTP request is made, extracts the session token and ends the authentication flow by closing the webview.
1. Next, the session token is used by the app to make calls to the backend API.

## Deep linking

The application is able to manage _deep links_. [Deep linking](https://reactnavigation.org/docs/5.x/deep-linking) allows opening the app or a specific screen once a user clicks on specific URL. The URL scheme for io-app is: `ioit://`.
<details>
    <summary>Supported URLs</summary>
    <h3>main</h3>
    <table>
         <tr>
            <td>ioit://main/messages</td>
        </tr>
        <tr>
            <td>ioit://main/wallet</td>
        </tr>
        <tr>
            <td>ioit://main/services</td>
        </tr>
        <tr>
            <td>ioit://main/profile</td>
        </tr>
    </table>
    <h3>messages</h3>
    <table>
        <tr>
            <td>ioit://messages</td>
        </tr>
    </table>
    <h3>wallet</h3>
    <table>
        <tr>
            <td>ioit://wallet</td>
        </tr>
        <tr>
            <td>ioit://wallet/payments-history</td>
        <tr>
        <tr>
            <td>ioit://wallet/card-onboarding-attempts</td>
        <tr>
        <tr>
            <td>ioit://wallet/bpd-iban-update</td>
        <tr>
        <tr>
            <td>ioit://wallet/bpd-opt-in</td>
        <tr>
        <tr>
            <td>ioit://wallet/bpd-opt-in/choice</td>
        <tr>
    </table>
    <h3>services</h3>
    <table>
        <tr>
            <td>ioit://services</td>
        </tr>
        <tr>
            <td>ioit://services/service-detail</td>
        </tr>
        <tr>
            <td>ioit://services/webview</td>
        </tr>
        <tr>
            <td>ioit://services/sv-generation/check-status</td>
        </tr>
    </table>
    <h3>profile</h3>
    <table>
        <tr>
            <td>ioit://profile </td>
        </tr>
        <tr>
            <td>ioit://profile/preferences </td>
        </tr>
        <tr>
            <td>ioit://profile/privacy</td>
        </tr>
        <tr>
            <td>ioit://profile/privacy-main</td>
        </tr>
    </table>
    <h3>cgn</h3>
    <table>
        <tr>
            <td>ioit://cgn-details/detail</td>
        </tr>
        <tr>
            <td>ioit://cgn-details/categories</td>
        </tr>
        <tr>
            <td>ioit://cgn-details/categories-merchant/:category</td>
        </tr>
    </table>
    <h3>fci</h3>
    <table>
        <tr>
            <td>ioit://fci/main</td>
        </tr>
        <tr>
            <td>ioit://fci/signature-requests</td>
        </tr>
        <tr>
            <td>ioit://cgn-details/categories-merchant/:category</td>
        </tr>
    </table>
    <h3>idpay</h3>
    <table>
        <tr>
            <td>ioit://idpay/onboarding/:serviceId</td>
        </tr>
        <tr>
            <td>ioit://idpay/initiative/:initiativeId</td>
        </tr>
    </table>
    <h3>miscs</h3>
    <table>
        <tr>
            <td>ioit://uadonations-webview </td>
        </tr>
        <tr>
            <td>ioit://fims/webview</td>
        </tr>
        <tr>
            <td>ioit://cgn-activation</td>
        </tr>
    </table>
</details>


