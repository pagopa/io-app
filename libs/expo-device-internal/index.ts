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
 * @throws If native identity lookup or persistence fails. Requires a native
 *   iOS/Android build containing this module; Expo Go is not supported.
 */
export const getUniqueIdSync = (): string =>
  DeviceInternalModule.getUniqueIdSync();

export const isDisplayZoomed = (): boolean =>
  DeviceInternalModule.isDisplayZoomed();
