/**
 * Util file to expose those functions that get or set data from/to device
 * regardless of the specific library used
 */
import { getUniqueIdSync } from "@io-app/expo-device-internal";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Paths } from "expo-file-system";
import {
  getEnrolledLevelAsync,
  SecurityLevel
} from "expo-local-authentication";
import { constFalse } from "fp-ts/lib/function";
import { PixelRatio, Platform } from "react-native";

export const getDeviceId = (): string => getUniqueIdSync();

export const getFontScale = (): number => PixelRatio.getFontScale();

export const getModel = (): string => Device.modelName ?? "";

export const getSystemVersion = (): string => Device.osVersion ?? "";

export const getFreeDiskStorage = (): number => Paths.availableDiskSpace;

// true if at least one screen lock method is set
export const isScreenLockSet = (): Promise<boolean> =>
  getEnrolledLevelAsync()
    .then(level => level !== SecurityLevel.NONE)
    .catch(constFalse);

export const getDeviceAppVersion = (): string =>
  Platform.select({
    ios: `${Application.nativeApplicationVersion ?? ""}.${Application.nativeBuildVersion ?? ""}`,
    default: Application.nativeApplicationVersion ?? ""
  });

export const isTablet = (): boolean =>
  Device.deviceType === Device.DeviceType.TABLET;

export { isDisplayZoomed } from "@io-app/expo-device-internal";
