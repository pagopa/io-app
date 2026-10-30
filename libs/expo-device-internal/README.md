# Expo device internals

An app-owned Expo module exposing `getUniqueIdSync()`, `isDisplayZoomed()`, and
Android's `isHapticFeedbackEnabled()`. It preserves the successful identity lookup
behavior of `react-native-device-info` without including its other device APIs.

## Integration

Add `@io-app/expo-device-internal` with `workspace:*` to the consuming app's
dependencies, install with pnpm, and rebuild native dependencies (including
CocoaPods on iOS). Expo autolinking discovers both native modules.

```ts
import { getUniqueIdSync } from "@io-app/expo-device-internal";

const deviceId = getUniqueIdSync();
```

The call returns a string synchronously. Native iOS/Android builds are required;
Expo Go and web are not supported. This scaffold does not change app consumers
or remove `react-native-device-info`.

## Identity compatibility

- Android reads `Settings.Secure.ANDROID_ID`, just like the legacy implementation.
  Its lifecycle depends on Android user, device, and app-signing key.
- iOS reads the legacy Keychain generic-password item with account/service
  `deviceUID`, then the standard UserDefaults `deviceUID` key, then IDFV, then a
  generated UUID. Missing stores receive the selected ID; existing values are
  not overwritten. Strings are not normalized.
- The Keychain query preserves `AfterFirstUnlockThisDeviceOnly` and the default
  access group. App signing and Keychain entitlements must retain access to the
  original item. Keychain persistence across reinstall is not guaranteed.
- The iOS resolver serializes and caches successful lookups. Unlike the old
  library, storage errors are thrown rather than treated as missing IDs.
  Persistence failures do not return an unpersisted identity. Duplicate writes
  succeed only if the existing item contains the same ID.
- The value is not a hardware serial number or an authentication credential.
  Consumers remain responsible for analytics consent and privacy disclosures.
  The bundled privacy manifest declares app-local UserDefaults access.

## Android haptic feedback

`isHapticFeedbackEnabled()` synchronously reads Android's
`Settings.System.HAPTIC_FEEDBACK_ENABLED` and the current ringer mode. It returns
`false` when touch feedback is disabled, the preference is absent, or the phone
is in silent mode. Vibrate mode remains eligible for haptics when touch feedback
is enabled. Native context or audio-service failures propagate to the caller.
This method is Android-only and requires rebuilding the native app.

The main app applies this value to Pulsar on mount and whenever it returns to
the foreground, using `useHapticFeedbackConfiguration`. The preference is not
cached, and iOS behavior is unchanged.

To validate on Android, disable touch feedback in system settings, return to IO,
and verify that Pulsar receives `enableHaptics(false)`. Enable touch feedback
with the ringer in normal or vibrate mode and verify `enableHaptics(true)`.
Repeat with silent mode and expect `false`, including after restarting the app.
The touch feedback value can be inspected with:

```sh
adb shell settings get system haptic_feedback_enabled
```

Jest covers the native bridge delegation and mount/foreground synchronization
without requiring a vibration motor. An emulator can validate the native
preference lookup; perceived strength still requires a physical device.

## Validation

```sh
pnpm nx test @io-app/expo-device-internal --runInBand
pnpm nx run @io-app/expo-device-internal:test-native
pnpm nx run @io-app/expo-device-internal:tsc-noemit
pnpm nx lint @io-app/expo-device-internal
```

The native resolver tests use Swift on macOS, without requiring a simulator.
They cover lookup precedence, storage repair, IDFV/UUID fallback, caching,
failure/retry behavior, and concurrent initialization.

Before migrating the app, install a build using the legacy library and upgrade
in place to a build using this module. Compare exact identifiers on real iOS
and Android devices without clearing app data, using the same signing setup.
Also validate Keychain access while protected data is unavailable. JavaScript
tests alone cannot verify signing, autolinking, or native storage continuity.
