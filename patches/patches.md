This file describes the reason for the patches applied.

### detox+19.13.0
Created on 03/05/2024

- Apply [fix/ios-17-regression](https://github.com/wix/Detox/pull/4171).
- Remove this patch once bumped `detox` to `v20`.

### react-native-pdf+6.4.0
Created on **16/03/2024**

#### Reason:
- Make PDF annotations on iOS read-only to align with Android behaviour.

### react-native-device-info+8.3.3
Created on **15/12/2021**

#### Reason:
- Remove all those methods that use `ACCESS_WIFI_STATE` (Android) in order to exclude that permission
    - `getIpAddress`
    - `getIpAddressSync`
    - `getMacAddress`
    - `getMacAddressSync`

### @types/react-native+0.70.19
Created on **30/08/2022**

#### Reason:
- Missing accessibility types.

### react-native-mixpanel+1.2.0

#### Reason:
- **20/03/2020** Change the endpoint to european server.
- **04/03/2021** Improve track function type definition.


### reactotron-redux-saga+2.1.4
Created on **13/12/2019**

#### Reason:
- Change type export.

### react-native-i18n+2.0.15
Created on **05/08/2020**

#### Reason:
- Removed minSdkVersion from gradle to allow the compilation on Android. 

Updated on **29/08/2022**

#### Reason:

- This patch is going to fix a gradle issue that breaks the compile on android platform, due to gradle imcompatibility

### react-native-push-notification+7.3.1
Created on **10/05/2021**

#### Reason:
- Add backwards compatibility to the legacy GCM format (this patch will be removed in a next version) for Android notification.

Updated on **31/01/2024**

#### Reason:
- Adds a guard to prevent a crash on Android SDK 34 (Android 14) when using Exact Alarms without having requested user's permission first.
  This works since we are not using local notifications anymore (and the library has to be replaced - since it is deprecated) and the
  remote notifications do not trigger the Exact Alarms API.

### react-native-screen-brightness+2.0.0-alpha
Created on **16/08/2021**

#### Reason:
- implementation 'androidx.core:core:1.+' not compatible with the new gradle settings used by react-native 0.64.2

### react-native+0.70.15
Created on **20/08/2021**

#### Reason:
- As for known issue anytime a developer launch a pod install on his own machine the podfile would be updated with 
  different hashes: [here the issue](https://github.com/facebook/react-native/issues/31193)
  To be removed when updating to `react-native` *0.65*


Updated on **29/08/2022**

#### Reason:
- Fixes deprecation of PropTypes for backward compatibility on libraries.

### react-native-qrcode-scanner+1.5.3
Created on **16/09/2021**

#### Reason:
- The package use the prop `checkAndroid6Permissions` for both display the `notAuthorizedView` and display the
  rationale. We need always to display the rationale alert and not only when requested by the Android OS. Without this
  patch is impossible to use the `notAuthorizedView` without displaying again the alert. ⚠️ The `QRCodeScanner`
  component, with this patch, doesn't use anymore the props permissionDialogTitle, permissionDialogMessage and
  buttonPositive.

### react-native+0.70.15 (Localizable.strings)

Created on **28/02/2022**

#### Reason:

- This patch is going to add a new `Localizable.strings` file inside
  the `[package]/React/AccessibilityResources/it.lproj` directory in order to translate various internal strings used
  for accessibility. At the moment there are no other ways to translate these strings even in newer React Native
  versions, thus this patch should be replicated for every new update. See https://github.com/pagopa/io-app/pull/3791
  for reference.

### @gorhom+bottom-sheet+4.1.5

Created on **24/03/2022**

#### Reason:

- This patch is going to add the customization of accessibility props on bottom sheet children components.
  A [PR has been opened](https://github.com/gorhom/react-native-bottom-sheet/pull/889) on the package repo in order to
  fix the issue on the dependency too.

### react-native-flag-secure-android+1.0.3

Created on **29/08/2022**

Removed on **10/01/2025** and replaced with `react-native-screenshot-prevent`

#### Reason:

- This patch is going to fix a gradle issue that breaks the compile on android platform, due to gradle imcompatibility

### react-native-webview+13.8.1

Updated on **13/07/2023**

#### Reason:

- This patch applies security fixes to avoid access on camera and microphone without user permission.

### react-native-calendar-events+2.2.0.patch

Created on **16/01/2023**

#### Reason:

- This patch fixes a crash on Android devices when trying to find/create/remove calendar events.
  An Event has an Id property which type may be a long but the library deals only with Java's signed int32.
  This was fine as long as each event was originally created and handled using this library only but 
  initially another library was used, react-native-add-calendar-event, which treated event's Id as long

### react-native-fingerprint-scanner+6.0.0.patch

Created on **29/08/2024**

#### Reason:

- Patch to fix an error occurring during Android gradle build (see https://github.com/hieuvp/react-native-fingerprint-scanner/issues/192)

### react-native+0.72.14.patch

Created on **04/10/2024**

#### Reason:

- Patch to fix this jest error: `TypeError: _reactNative.AccessibilityInfo.announceForAccessibilityWithOptions is not a function`.  
In the `react-native/jest/setup.js` the `announceForAccessibilityWithOptions` method mock was missing (see [this issue](https://github.com/facebook/react-native/issues/44014)), this patch adds it.  