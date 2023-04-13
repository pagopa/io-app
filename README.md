<p align="center">
  <img src="img/app-logo.svg" width="100"/></br>
  <h3 align="center">IO - The public services app</h3>
</p>

<p align="center">
    <a href="https://circleci.com/gh/pagopa/io-app">
        <img src="https://circleci.com/gh/pagopa/io-app.svg?style=svg" />
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
  - [Environment variables](#environment-variables)
  - [Build the app](#build-the-app)
  - [Run the app](#run-the-app)
  - [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
  - [Main technologies used](#main-technologies-used)
  - [SPID Authentication](#spid-authentication)
  - [Deep linking](#deep-linking)
  - [Fonts](#fonts)
  - [Vector graphics](#vector-graphics)
- [Appendix]
  - [Internationalization](locales/README.md)
  - [End to end test](e2e/README.md)

# FAQ

## What is the Digital Citizenship project?

Digital Citizenship aims at bringing citizens to the center of the Italian public administrations services.

The project comprises two main components:

* a platform made of elements that enable the development of citizen-centric digital services;
* an interface for citizens to manage their data and their digital citizen profiles.

## What is the Digital Citizenship mobile app?

The Digital Citizenship mobile app is a native mobile application for iOS and Android with a dual purpose:

* To be an interface for citizens to manage their data and their digital citizen profile;
* To act as _reference implementation_ of the integrations with the Digital Citizenship platform.

## Who develops the app?

The development of the app is carried out by several contributors:

* [PagoPA S.p.A.](https://www.pagopa.gov.it/);
* Volunteers who support the project.

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
        <td>Allows applications to open network sockets (e.g. simple internet connectivity)</td>
    </tr>
    <tr>
        <td>ACCESS_NETWORK_STATE</td>
        <td>Allows applications to access information about networks (e.g. details about connection quality/state)</td>
    </tr>
    <tr>
        <td>ACCESS_WIFI_STATE</td>
        <td>Allows applications to access information about WIFI state</td>
    </tr>
    <tr>
        <td>CAMERA</td>
        <td>Allows applications to access device camera to scan QR codes</td>
    </tr>
    <tr>
        <td>FOREGROUND_SERVICE</td>
        <td>Allows applications to use foreground service</td>
    </tr>
    <tr>
        <td>MODIFY_AUDIO_SETTINGS</td>
        <td>Allows an application to modify global audio settings. Related to camera usage.</td>
    </tr>
    <tr>
        <td>NFC</td>
        <td>Allows applications to perform I/O operations over NFC</td>
    </tr>
    <tr>
        <td>RECEIVE_BOOT_COMPLETED</td>
        <td>Allows an application to receive the Intent.ACTION_BOOT_COMPLETED that is broadcast after the system finishes booting. Used for push notification.</td>
    </tr>
    <tr>
        <td>VIBRATE</td>
        <td>Allows access to the vibrator. This allow the application to emit vibration</td>
    </tr>
    <tr>
        <td>WAKE_LOCK</td>
        <td>Allows using PowerManager WakeLocks to keep processor from sleeping or screen from dimming. Used for push notification.</td>
    </tr>
    <tr>
        <td>READ_APP_BADGE</td>
        <td>Notification Badges that show on app icons</td>
    </tr>
    <tr>
        <td>READ_CALENDAR</td>
        <td>Allows an application to read the user&#39;s calendar data</td>
    </tr>
    <tr>
        <td>WRITE_CALENDAR</td>
        <td>Allows an application to write the user&#39;s calendar data. Used to automatically set reminders.</td>
    </tr>
    <tr>
        <td>READ_EXTERNAL_STORAGE</td>
        <td>Allows an application to read from external storage. Used to pick images from gallery with payment QRCode.</td>
    </tr>
    <tr>
        <td>WRITE_EXTERNAL_STORAGE</td>
        <td>Allows an application to write to external storage. Used to store images, e.g.: save bonus information (QRCode for Bonus Vacanze or EuCovid Certificate, etc.)</td>
    </tr>
    <tr>
        <td>USE_FINGERPRINT</td>
        <td>Allows an app to use fingerprint hardware for biometric identification required from API level 23 until API level 28</td>
    </tr>
    <tr>
        <td>USE_BIOMETRIC</td>
        <td>Allows an app to use device&#39;s available biometric identification system (Face unlock, Iris unlock, Fingerprint) required from API Level 28</td>
    </tr>
  </table>                                     

Below there are the permissions required by the main android hardware manufacturers. Mainly used to manage notification badge icons.
<table>
    <tr>
        <td>Permission (manufacturer)</td>
        <td>Usage / Meaning</td>
    </tr>
    <tr>
        <td>com.anddoes.launcher.permission.UPDATE_COUNT</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.google.android.c2dm.permission.RECEIVE</td>
        <td>It is used when receiving a broadcast from GCM server that contains a GCM message. Used for push notification.</td>
    </tr>
    <tr>
        <td>com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE</td>
        <td>It is used by Firebase to recognize where the app was installed from</td>
    </tr>
    <tr>
        <td>com.htc.launcher.permission.READ_SETTINGS</td>
        <td>Used for the notification badge. Specific for HTC vendor.</td>
    </tr>
    <tr>
        <td>com.htc.launcher.permission.UPDATE_SHORTCUT</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.CHANGE_BADGE</td>
        <td>Used for the notification badge. Specific for Huawei vendor.</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.READ_SETTINGS</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.huawei.android.launcher.permission.WRITE_SETTINGS</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.majeur.launcher.permission.UPDATE_BADGE</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.oppo.launcher.permission.READ_SETTINGS</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.oppo.launcher.permission.WRITE_SETTINGS</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.sec.android.provider.badge.permission.READ</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.sec.android.provider.badge.permission.WRITE</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.sonyericsson.home.permission.BROADCAST_BADGE</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>com.sonymobile.home.permission.PROVIDER_INSERT_BADGE</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>me.everything.badger.permission.BADGE_COUNT_READ</td>
        <td>used for the notification badge</td>
    </tr>
    <tr>
        <td>me.everything.badger.permission.BADGE_COUNT_WRITE</td>
        <td>used for the notification badge</td>
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
        <td>This key is required if your app uses APIs that access the user’s media library.</td>
    </tr>
    <tr>
        <td>NSBluetoothAlwaysUsageDescription</td>
        <td>This key is required if your app uses the device’s Bluetooth interface.</td>
    </tr>
    <tr>
        <td>NSBluetoothPeripheralUsageDescription</td>
        <td>This key is required if your app uses APIs that access Bluetooth peripherals and has a deployment target earlier than iOS 13.</td>
    </tr>
    <tr>
        <td>NSContactsUsageDescription</td>
        <td>IO needs access to your contacts to let you add them in calendar events.</td>
    </tr>
    <tr>
        <td>NSLocationAlwaysUsageDescription</td>
        <td>This key is required if your iOS app uses APIs that access the user’s location at all times and deploys to targets earlier than iOS 11.</td>
    </tr>
    <tr>
        <td>NSLocationUsageDescription</td>
        <td>This key is required if your app uses APIs that access the user’s location information.</td>
    </tr>
    <tr>
        <td>NSLocationWhenInUseUsageDescription</td>
        <td>This key is required if your iOS app uses APIs that access the user’s location information while the app is in use.</td>
    </tr>
    <tr>
        <td>NSMicrophoneUsageDescription</td>
        <td>IO needs access to the microphone in case you want to leave a voice note. Used in the assistance flow.</td>
    </tr>
    <tr>
        <td>NSMotionUsageDescription</td>
        <td>This key is required if your app uses APIs that access the device’s motion data.</td>
    </tr>
    <tr>
        <td>NSCalendarsUsageDescription</td>
        <td>IO needs access to the calendar to add event reminders.</td>
    </tr>
    <tr>
        <td>NSCameraUsageDescription</td>
        <td>IO needs access to the camera to scan QR codes.</td>
    </tr>
    <tr>
        <td>NSFaceIDUsageDescription</td>
        <td>Enable Face ID for biometric identification.</td>
    </tr>
    <tr>
        <td>NSPhotoLibraryAddUsageDescription</td>
        <td>This key is required if your app uses APIs that have write access to the user’s photo library.</td>
    </tr>
    <tr>
        <td>NSPhotoLibraryUsageDescription</td>
        <td>IO needs access to the Photos to scan QR codes.</td>
    </tr>
    <tr>
        <td>NSSpeechRecognitionUsageDescription</td>
        <td>This key is required if your app uses APIs that send user data to Apple’s speech recognition servers. Used in the assistance flow.</td>
    </tr>
    <tr>
        <td>Remote  Notification</td>
        <td>Request permission to receive remote push notification.</td>
    </tr>
    <tr>
        <td>NFC (Near Field Communication Tag Reading)</td>
        <td>Request NFC capability.</td>
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
Follow the [official tutorial](https://reactnative.dev/docs/environment-setup) for installing the `React Native CLI` for your operating system.

If you have a macOS system, you can follow both the tutorial for iOS and for Android. If you have a Linux or Windows system, you need only to install the development environment for Android.

## Environment variables

### Production
If you want to run the app in production mode, run these commands:

```bash
  $ cd io-app
  $ cp .env.production .env
```

_Note: The sample configuration sets the app to interface with our test environment, on which we work continuously; therefore, it may occur that some features are not always available or are fully working. Check the comments in the file for more informations about environment variables._

### io-dev-api-server
You can also target the [io-dev-api-server](https://github.com/pagopa/io-dev-api-server) for development purposes.
`.env.local` is included in IO app files. It is a pre-filled config file ready to use with the local server. 
To use it, run these commands:

```bash
  $ cd io-app
  $ cp .env.local .env
```

## Build the app
In order to build the app, we use [yarn](https://yarnpkg.com/) for managing javascript dependencies. 
As stated [previously](#nodejs-and-ruby), we also use NodeJS and Ruby for managing the environment.
```bash
# CD into the repository
$ cd io-app

# Install NodeJS with nodenv, the returned version should match the one in the .node-version file
$ nodenv install && nodenv version

# Install Ruby with rbenv, the returned version should match the one in the .ruby-version file
$ rbenv install && rbenv version

# Install yarn and rehash to install shims
$ npm install -g yarn && nodenv rehash

# Install all of the required gems from the Gemfile
# Run this only while setting up and when gems dependencies change
$ bundle install

# Install dependencies 
# Run this only while setting up and when js dependencies change
$ yarn install

# Install podfiles when targeting iOS (ignore this step for Android)
# Run this only while setting up and when pods dependencies change
$ cd iOS && bundle exec pod install && cd ..

# Generate the definitions from the OpenAPI specs and from the YAML translations
# Run this only while setting up and when specs/translations change
$ yarn generate
```

## Run the app
### Android
The device simulator must be [created and launched manually](https://developer.android.com/studio/run/managing-avds).
Then, from your command line, run these commands:
```
# Perform the port forwarding
$ adb reverse tcp:8081 tcp:8081;adb reverse tcp:3000 tcp:3000;adb reverse tcp:9090 tcp:9090

$ react-native run-android
```

### iOS
```
$ yarn run-ios
```

### iOS physical devices
For this step you’ll need to have a proper iOS development certificate on your dev machine that is also 
installed on your physical device.

To test the io-app on a real iOS device you must:
1. Open the project with Xcode and modify the bundle identifier (eg: add ‘.test’ to the existing one)  
2. Go to the 'Build Settings' tab and in the PROVISIONING_PROFILE section delete the existing ID. 
   Then select 'ios developer' in the debug field of the 'Code Signing Identity'  
3. In General tab select the 'Automatically Menage Signing' checkbox  
4. You must have an Apple id developer and select it from the 'Team' drop-down menu  
5. (Without Xcode) navigate in the io-app project and open the package.json file, in the scripts section 
   add: _"build: ios": "react-native bundle --entry-file = 'index.js' - bundle-output = '. / ios / main.jsbundle' --dev = false --platform = 'ios' "_ 
6. Open the Terminal and from the root directory project run _npm run build: ios_  
7. In Xcode navigate in the project, select _'main.jsbundle'_ and enable the checkbox on the right labeled 'ItaliaApp'
8. Always in Xcode select 'Product' -> 'Clean Build Folder'
9. On the real device connected, accept to trust the device
10. From Xcode select the device by the drop-down list and run ('Product' -> 'Run') on the iOS device, if the unit tests fail they can be disabled by going to Product -> Scheme -> Edit Scheme -> Build

## Build (release)

For the release of the app on the stores we use [Fastlane](https://fastlane.tools/).

### iOS

The beta distribution is done with [TestFlight](https://developer.apple.com/testflight/).

To release a new beta:

```
$ cd ios
$ bundle exec fastlane testflight_beta
```

### Android

To release a new alpha:

```
$ bundle exec fastlane alpha
```

_Note: the alpha releases on Android are automatically carried by the `alpha-release-android` job on [circleci](https://circleci.com/gh/pagopa/io-app) on each by merge to the master branch._

# Troubleshooting
- ## Bundler
  - ***Can't find gem bundler (>= 0.a) with executable bundle (Gem::GemNotFoundException):***

    Can be solved by launching ```gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)```

- ## iOS build 
  - ***error: redefinition of module 'YogaKit' build Failed***
  
    Can be solved by restarting your machine.

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

The application is able to manage _deep links_. The URL scheme is: `ioit://`. The link format is `ioit://<route-name>`.

## Fonts

The application uses the font _Titillium Web_. Fonts are handled differently than Android and iOS. To use the font, `TitilliumWeb-SemiBoldItalic` example, you must apply the following properties for Android:

```css
{
  fontFamily: 'TitilliumWeb-SemiBoldItalic'
}
```

while in iOS the code to be applied is:

```css
{
  fontFamily: 'Titillium Web',
  fontWeight: '600',
  fontStyle: 'italic'
}
```

To manage fonts and variants more easily, we have created utility functions within the file [ts/theme/fonts.ts](ts/theme/fonts.ts).

## Vector graphics
Most of the images used in the app can be rendered as vector assets using SVG image format. Currently we have these groups:
- **Pictograms**: assets with an intended size greather than `56px`, checked the relevant [README](/ts/components/core/pictograms/README.md) for more information;
- **Icons**: assets with an intended size between `16px` and `56px`, checked the relevant [README](/ts/components/core/icons/README.md) for more information;
- **Logos**: check the relavant [README](/ts/components/core/logos/README.md) for more information.

Once you understand which group you must put the asset in, you must take into consideration the following instructions for the best result in terms of quality and future maintenance:

1. In your user interface design app (Figma/Sketch) make the vector path as simple as possible:
    * Detach the symbol instance to avoid destructive actions to the original source component. Feel free to use a draft or disposable project document.
    * Outline all the present strokes (unless required for dynamic stroke width, but we don't manage this case at the moment)
    * Select all the different paths and flatten into one. Now you should have a single vector layer.
    * Make sure your vector path is centered (both vertically and horizontally) in a square
2. Export your SVG with `1×` preset
3. Delete `width` and `height` attributes and leave the original `viewBox` attribute. You could easily process the image using online editors like [SVGOmg](https://jakearchibald.github.io/svgomg/) (enable `Prefer viewBox to width/height`)
4. To easily preview the available SVG assets, include the original SVG in the `originals` subfolder **with the same filename of your corresponding React component**.
5. If your asset is part of one of the subset, make sure to use the same prefix of the corresponding set. *E.g*: If you want to add a new pictogram related to a section, you should use the `PictogramSection…` prefix.
6. Copy all the `<path>` elements into a new React component and replace the original `<path>` with the element `<Path>` (capital P) from the `react-native-svg` package. Replace all the harcoded fill values with the generic `currentColor` value.
7. Add the dynamic size and colour (if required), replacing the hardcoded values with the corresponding props:
```jsx
import { Svg, Path } from "react-native-svg";

const IconSpid = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M13.615 …"
      fill="currentColor"
    />
  </Svg>
);
```
**Note:** The icon inherit the color from the parent `Svg` container

8. Add the key associated to the single pictogram/icon in the corresponding set. If you want to learn more, read the contextual documentation:
    * [Pictograms](ts/components/core/pictograms)
    * [Icons](ts/components/core/icons)
    * [Logos](ts/components/core/logos)

9. There's no need to add the new pictogram/icon in the `Design System` specific page because it happens automatically.

