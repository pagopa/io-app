import { requireNativeModule } from "expo-modules-core";

interface DeviceInternalModuleType {
  getUniqueIdSync: () => string;
  isDisplayZoomed: () => boolean;
}

const DeviceInternalModule =
  requireNativeModule<DeviceInternalModuleType>("DeviceInternal");

/**
 * Preserves react-native-device-info's identity: Android's ANDROID_ID, or the
 * legacy iOS deviceUID stored in Keychain/UserDefaults (seeded from IDFV/UUID).
 * This is not a hardware identifier or an authentication credential.
 *
 * Never throws: if the identity cannot be read, iOS falls back to IDFV or a
 * generated UUID and Android returns null (like the legacy implementation).
 * Requires a native iOS/Android build containing this module; Expo Go is not
 * supported.
 */
export const getUniqueIdSync = (): string =>
  DeviceInternalModule.getUniqueIdSync();

export const isDisplayZoomed = (): boolean =>
  DeviceInternalModule.isDisplayZoomed();
