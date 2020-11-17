This file describes the reason for the patches applied.

### react-native-qrcode-scanner+1.4.1
Created on **19/05/2020**

#### Reason:
- Integrate https://github.com/moaazsidat/react-native-qrcode-scanner/pull/280, waiting for the official release.


### @types/react-native+0.63.2
Created on **29/07/2020**

#### Reason:
- Missing accessibility types.


### react-native-mixpanel+1.2.0
Created on **20/03/2020**

#### Reason:
- Change the endpoint to european server.


### react-native-safe-area-view+0.12.0
Created on **27/07/2020**

#### Reason:
- Temporary fix, in order to execute the application after the porting to 0.63.x, waiting to replace react-navigation and remove this patch.


### react-native-touch-id+4.4.1
Created on **09/05/2019** and **20/12/2019**

#### Reason:
- Solve crash on Android and export types.


### reactotron-redux-saga+2.1.4
Created on **13/12/2019**

#### Reason:
- Change type export.


### native-base+2.13.13
Created on **30/07/2020**

#### Reason:
- Integrate the pr https://github.com/GeekyAnts/NativeBase/pull/3200 waiting the official release. (remove this patch after the release)
- Use TouchableHighlight instead of TouchableNativeFeedback on Android sdk < 19 to avoid crash.

### react-native-push-notification+4.0.0
Created on **03/08/2020**

#### Reason:
- Revert the change to the notification parser to allows compatibility to the legacy GCM format used atm. (revert the change https://github.com/zo0r/react-native-push-notification/pull/1212 )
also discussed here https://github.com/zo0r/react-native-push-notification/issues/1452.
The new notification format should follow https://firebase.google.com/docs/cloud-messaging/http-server-ref, https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages

### react-native-i18n+2.0.15
Created on **05/08/2020**

#### Reason:
- Removed minSdkVersion from gradle to allow the compilation on Android. 

### danger-plugin-digitalcitizenship+0.3.1
Created on **06/08/2020**

#### Reason:
- Recognizes the ids of pivotal stories even if they are not at the beginning of the line


### react-native-popup-menu+0.14.2
Created on **12/08/2020**

#### Reason:
- Use TouchableHighlight instead of TouchableNativeFeedback on Android sdk < 19 to avoid crash.
