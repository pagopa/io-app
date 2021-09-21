This file describes the reason for the patches applied.


### @types/react-native+0.63.2
Created on **29/07/2020**

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


### react-native-i18n+2.0.15
Created on **05/08/2020**

#### Reason:
- Removed minSdkVersion from gradle to allow the compilation on Android. 

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

### react-native+0.64.2
Created on **20/08/2021**

#### Reason:
- As for known issue anytime a developer launch a pod install on his own machine the podfile would be updated with 
  different hashes: [here the issue](https://github.com/facebook/react-native/issues/31193)
  To be removed when updating to `react-native` *0.65*

### react-native-qrcode-scanner+1.5.3
Created on **16/09/2021**

#### Reason:
- The package use the prop `checkAndroid6Permissions` for both display the `notAuthorizedView` and display the rationale.
  We need always to display the rationale alert and not only when requested by the Android OS. Without this patch is impossible
  to use the `notAuthorizedView` without displaying again the alert.
  ⚠️ The `QRCodeScanner` component, with this patch, doesn't use anymore the props permissionDialogTitle, permissionDialogMessage and
  buttonPositive.
