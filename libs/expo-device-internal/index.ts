import { requireNativeModule } from "expo-modules-core";

interface DeviceInternalModuleType {
  getUniqueIdSync: () => string;
  isDisplayZoomed: () => boolean;
  isHapticFeedbackEnabled: () => boolean;
}

const DeviceInternalModule =
  requireNativeModule<DeviceInternalModuleType>("DeviceInternal");

/**
 * Preserves react-native-device-info's identity: Android's ANDROID_ID, or the
 * legacy iOS deviceUID stored in Keychain/UserDefaults (seeded from IDFV/UUID).
 * This is not a hardware identifier or an authentication credential.
 *
 * Never throws. If the identity cannot be read, iOS falls back to IDFV or a
 * generated UUID, while Android falls back to a UUID saved in SharedPreferences
 * (or a newly generated one).
 *
 * Requires a native iOS/Android build containing this module; Expo Go is not
 * supported.
 */
export const getUniqueIdSync = (): string =>
  DeviceInternalModule.getUniqueIdSync();

export const isDisplayZoomed = (): boolean =>
  DeviceInternalModule.isDisplayZoomed();

/**
 * Android only. Checks touch feedback and ringer mode without caching. Returns
 * false when the touch feedback preference is absent.
 *
 * @throws If the native Android context or audio service is unavailable.
 */
export const isHapticFeedbackEnabled = (): boolean =>
  DeviceInternalModule.isHapticFeedbackEnabled();
