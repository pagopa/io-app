import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";
import { z } from "zod";

import type { NfcAntennaInfoResult, NfcAntennaPositionInfo } from "./types";

import {
  getMappedNfcAntennaPosition,
  getNfcAntennaBands,
  getNfcAntennaPositionFromBands
} from "./position";

export type {
  AvailableNfcAntenna,
  NfcAntennaConfidence,
  NfcAntennaInfoResult,
  NfcAntennaPosition,
  NfcAntennaPositionInfo
} from "./types";

interface NfcAntennaInfoModuleType {
  getNfcAntennaInfo: () => Promise<NfcAntennaInfoResult>;
  isHceSupported: () => Promise<boolean>;
}

const NfcAntennaInfoModule =
  Platform.OS === "android"
    ? requireNativeModule<NfcAntennaInfoModuleType>("NfcAntennaInfo")
    : undefined;

/**
 * Retrieves NFC antenna information on Android devices with API level 34+.
 *
 * @throws If invoked on a platform other than Android.
 */
export const getNfcAntennaInfo = (): Promise<NfcAntennaInfoResult> => {
  if (!NfcAntennaInfoModule) {
    return Promise.reject(
      new Error("NfcAntennaInfo is only available on Android devices.")
    );
  }
  return NfcAntennaInfoModule.getNfcAntennaInfo();
};

const unavailableAntennaInfoError = z.object({
  code: z.enum([
    "ERR_NFC_ADAPTER_UNAVAILABLE",
    "ERR_NFC_ANTENNA_INFO_UNAVAILABLE",
    "ERR_NFC_UNSUPPORTED_DEVICE"
  ])
});

/**
 * Returns undefined for known API-unavailability errors and propagates
 * unexpected errors.
 */
const getAvailableNfcAntennaInfo = (): Promise<
  NfcAntennaInfoResult | undefined
> =>
  getNfcAntennaInfo().catch((error: unknown) => {
    if (unavailableAntennaInfoError.safeParse(error).success) {
      return undefined;
    }
    throw error;
  });

/** Looks up the current Android device in the study's brand/model mapping. */
const getDeviceNfcAntennaPosition = (): NfcAntennaPositionInfo | undefined => {
  if (Platform.OS !== "android") {
    return undefined;
  }
  const { Brand, Model } = Platform.constants;
  return getMappedNfcAntennaPosition({ brand: Brand, model: Model });
};

/**
 * Resolves the antenna's vertical third using Android's NFC antenna API. When
 * the API, adapter, or antenna information is unavailable or has invalid
 * geometry, an internal study's classification is looked up by Android brand
 * and model. API results have high confidence; mapping results retain the
 * study's confidence.
 *
 * Defaults to top with low confidence and no source when the position cannot be
 * determined. Unexpected native errors are propagated.
 *
 * @throws If the Android native module is unavailable.
 */
export const getNfcAntennaPosition =
  async (): Promise<NfcAntennaPositionInfo> => {
    if (!NfcAntennaInfoModule) {
      return Promise.reject(
        new Error("NfcAntennaInfo is only available on Android devices.")
      );
    }

    const info = await getAvailableNfcAntennaInfo();
    const bands = info ? getNfcAntennaBands(info) : undefined;
    const position = bands
      ? getNfcAntennaPositionFromBands(bands)
      : getDeviceNfcAntennaPosition();
    return (
      position ?? { position: "top", confidence: "low", source: undefined }
    );
  };

/**
 * Checks if Host Card Emulation (HCE) is supported on the device.
 *
 * @throws If invoked on a platform other than Android.
 */
export const isHceSupported = (): Promise<boolean> => {
  if (!NfcAntennaInfoModule) {
    return Promise.reject(
      new Error("NfcAntennaInfo is only available on Android devices.")
    );
  }
  return NfcAntennaInfoModule.isHceSupported();
};
