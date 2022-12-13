This file describes the reason for the patches applied.

### react-native-device-info+8.3.3
Created on **15/12/2021**

#### Reason:
- Remove all those methods that use `ACCESS_WIFI_STATE` (Android) in order to exclude that permission
    - `getIpAddress`
    - `getIpAddressSync`
    - `getMacAddress`
    - `getMacAddressSync`

### @types/react-native+0.69.6
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


### native-base+2.13.13
Created on **30/07/2020**

#### Reason:
- Integrate the pr https://github.com/GeekyAnts/NativeBase/pull/3200 waiting the official release. (remove this patch after the release)
- Use TouchableHighlight instead of TouchableNativeFeedback on Android sdk < 19 to avoid crash.

Updated on **03/02/2022**

#### Reason:
- Removed the StatusBar embedded in the Header component because it causes status bar 
  glitches when using the component in a tabbed navigation ([PR](https://github.com/pagopa/io-app/pull/3717)).

### react-native-i18n+2.0.15
Created on **05/08/2020**

#### Reason:
- Removed minSdkVersion from gradle to allow the compilation on Android. 

Updated on **29/08/2022**

#### Reason:

- This patch is going to fix a gradle issue that breaks the compile on android platform, due to gradle imcompatibility

### danger-plugin-digitalcitizenship+0.3.1
Created on **06/08/2020**

#### Reason:
- Recognizes the ids of pivotal stories even if they are not at the beginning of the line

### react-native-push-notification+7.3.1
Created on **10/05/2021**

#### Reason:
- Add backwards compatibility to the legacy GCM format (this patch will be removed in a next version) for Android notification.

### react-native-screen-brightness+2.0.0-alpha
Created on **16/08/2021**

#### Reason:
- implementation 'androidx.core:core:1.+' not compatible with the new gradle settings used by react-native 0.64.2

### react-native+0.69.4
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

### react-native+0.64.2 (Localizable.strings)

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

#### Reason:

- This patch is going to fix a gradle issue that breaks the compile on android platform, due to gradle imcompatibility

### @react-navigation/material-top-tabs+5.3.1

Created on **01/12/2022**

#### Reason:

- This patch is going to add a missing prop to component definition, it can be removed once updating the library.