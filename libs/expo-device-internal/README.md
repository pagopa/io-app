# Expo device identity

An app-owned Expo module exposing only `getUniqueIdSync()`. It preserves the
successful identity lookup behavior of `react-native-device-info` without
including its other device APIs.

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
