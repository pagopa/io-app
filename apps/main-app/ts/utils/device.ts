/**
 * Util file to expose those functions that get or set data from/to device
 * regardless of the specific library used
 */
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Paths } from "expo-file-system";
import { constFalse } from "fp-ts/lib/function";
import { PixelRatio, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

// export const getDeviceIdLegacy = (): string => DeviceInfo.getUniqueIdSync();
export const getDeviceId = (): Promise<null | string> | undefined =>
  Platform.select({
    ios: Application.getIosIdForVendorAsync(),
    android: Promise.resolve(Application.getAndroidId())
  });

export const getFontScale = (): number => PixelRatio.getFontScale();

export const getModel = (): string => Device.modelName ?? "";

export const getSystemVersion = (): string => Device.osVersion ?? "";

export const getFreeDiskStorage = (): number => Paths.availableDiskSpace;

// true if at least one screen lock method is set
export const isScreenLockSet = (): Promise<boolean> =>
  DeviceInfo.isPinOrFingerprintSet().catch(constFalse);

export const getDeviceAppVersion = (): string =>
  Platform.select({
    ios: `${Application.nativeApplicationVersion ?? ""}.${Application.nativeBuildVersion ?? ""}`,
    default: Application.nativeApplicationVersion ?? ""
  });

export const isTablet = (): boolean =>
  Device.deviceType === Device.DeviceType.TABLET;

export const isDisplayZoomed = (): boolean => DeviceInfo.isDisplayZoomed();
