/**
 * util file to expose those functions that get or set data from/to device
 * regardless of the specific library used
 */
import DeviceInfo from "react-native-device-info";

export const getDeviceId = (): string => DeviceInfo.getUniqueIdSync();

export const getFontScale = (): Promise<number> => DeviceInfo.getFontScale();

export const getModel = (): string => DeviceInfo.getModel();

export const getSystemVersion = (): string => DeviceInfo.getSystemVersion();

// true if at least one screen lock method is set
export const isScreenLockSet = (): Promise<boolean> =>
  DeviceInfo.isPinOrFingerprintSet();
