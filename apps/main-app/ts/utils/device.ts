/**
 * util file to expose those functions that get or set data from/to device
 * regardless of the specific library used
 */
import { constFalse } from "fp-ts/lib/function";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const getDeviceId = (): string => DeviceInfo.getUniqueIdSync();

export const getFontScale = (): Promise<number> => DeviceInfo.getFontScale();

export const getModel = (): string => DeviceInfo.getModel();

export const getSystemVersion = (): string => DeviceInfo.getSystemVersion();

export const getFreeDiskStorage = (): number =>
  DeviceInfo.getFreeDiskStorageSync();

// true if at least one screen lock method is set
export const isScreenLockSet = (): Promise<boolean> =>
  DeviceInfo.isPinOrFingerprintSet().catch(constFalse);

export const getDeviceAppVersion = (): string =>
  Platform.select({
    ios: DeviceInfo.getReadableVersion(),
    default: DeviceInfo.getVersion()
  });

export const isTablet = (): boolean => DeviceInfo.isTablet();

export const isDisplayZoomed = (): boolean => DeviceInfo.isDisplayZoomed();
