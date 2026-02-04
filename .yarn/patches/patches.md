This file describes the reason for the patches applied.

### react-native-pdf-npm-6.7.7-7aa1e3a631.patch
Created on **16/07/2025**

#### Reason:
- Make PDF annotations on iOS read-only to align with Android behaviour;
- Update Android dependencies to the latest versions to support 16KB page size.


### react-native-device-info-npm-14.0.4-9bb10f6c3d.patch
Created on **15/12/2021**

#### Reason:
- Remove all those methods that use `ACCESS_WIFI_STATE` (Android) in order to exclude that permission
    - `getIpAddress`
    - `getIpAddressSync`
    - `getMacAddress`
    - `getMacAddressSync`


### react-native-push-notification-npm-8.1.1-bcb0d8a65e.patch
Created on **10/05/2021**

#### Reason:
- Add backwards compatibility to the legacy GCM format (this patch will be removed in a next version) for Android notification.

Updated on **31/01/2024**

#### Reason:
- Adds a guard to prevent a crash on Android SDK 34 (Android 14) when using Exact Alarms without having requested user's permission first.
  This works since we are not using local notifications anymore (and the library has to be replaced - since it is deprecated) and the
  remote notifications do not trigger the Exact Alarms API.

### react-native-screen-brightness-npm-2.0.0-alpha-22c6aeb21e.patch
Created on **16/08/2021**

#### Reason:
- implementation 'androidx.core:core:1.+' not compatible with the new gradle settings used by react-native 0.64.2


### @gorhom+bottom-sheet+5.1.2

Created on **24/03/2022**
Updated on **23/04/2025**

#### Reason:

- The initial patch added customisazion of accessibility props on bottom sheet children components (v4). 
  A [PR had been opened](https://github.com/gorhom/react-native-bottom-sheet/pull/889) on the package repo in order 
  to fix the issue on the dependency too.
- On v5, such customisations were not needed anymore (since the library had been updated by the author to handle 
  accessibility). Nonetheless, a new patch has been applied in order to set accessibility-order starting from
  the bottom-sheet content instead of the bottom-sheet background layer (chosen by the author as a default).


### react-native-webview-npm-13.13.5-802657184f.patch

Updated on **13/07/2023**

#### Reason:

- This patch applies security fixes to avoid access on camera and microphone without user permission.

### react-native-calendar-events-npm-2.2.0-7c2fb115c6.patch

Created on **16/01/2023**

#### Reason:

- This patch fixes a crash on Android devices when trying to find/create/remove calendar events.
  An Event has an Id property which type may be a long but the library deals only with Java's signed int32.
  This was fine as long as each event was originally created and handled using this library only but 
  initially another library was used, react-native-add-calendar-event, which treated event's Id as long


### react-native-reanimated-npm-3.17.5-134bd4e99e.patch

Created on **19/05/2025**

#### Reason:

- Patch to fix a visualization error that prevented cards to be incorrectly rendered in Wallet Home Screen.

### react-native-screenshot-prevent-npm-1.2.1-d115315590.patch

Created on **24/11/2025**

#### Reason:

- Patch to make the library ready for react-native new architecture

### react-native-npm-0.81.5-d8232ef145.patch

Created on **15/01/2026**

#### Reason:

- Patch to fix RefreshControl issues on Fabric enablement


### react-native-reanimated-npm-4.2.1-8be3b216b9.patch

Created on **04/02/2026**

#### Reason:

- **Temporary patch** until Reanimated 4.2.2 is released. Backports the fix from [PR #8881](https://github.com/software-mansion/react-native-reanimated/pull/8881)
- Prevents `nativeID` from being assigned to animated components during Jest tests, avoiding unstable snapshots with random IDs
- This restores the behavior from Reanimated v3 where `nativeID` remained `undefined` in test environments
- **Remove this patch** once Reanimated 4.2.2+ is released and upgrade to that version