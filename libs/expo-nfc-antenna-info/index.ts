import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import type { NfcAntennaInfoResult, NfcAntennaPositionInfo } from "./types";

import { antennaMapping } from "./antennaMapping";

export type {
  AvailableNfcAntenna,
  NfcAntennaConfidence,
  NfcAntennaInfoResult,
  NfcAntennaPosition,
  NfcAntennaPositionInfo
} from "./types";

interface NfcAntennaInfoModuleType {
  getDevice: () => string;
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

const unavailableAntennaInfoCodes = new Set([
  "ERR_NFC_ADAPTER_UNAVAILABLE",
  "ERR_NFC_ANTENNA_INFO_UNAVAILABLE",
  "ERR_NFC_UNSUPPORTED_DEVICE"
]);

const antennaPositions = ["top", "center", "bottom"] as const;
const antennaBandCount = antennaPositions.length;

/**
 * Resolves the antenna's vertical third, with API data taking precedence over
 * the SIW-5555 model mapping. API results have high confidence; mapping results
 * retain the confidence of the source document.
 *
 * Returns undefined on iOS, for unknown models, unusable geometry, or antennas
 * spanning different thirds. Unexpected native errors are propagated.
 */
export const getNfcAntennaPosition = async (): Promise<
  NfcAntennaPositionInfo | undefined
> => {
  if (Platform.OS !== "android") {
    return undefined;
  }

  const info = await getNfcAntennaInfo().catch((error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string" &&
      unavailableAntennaInfoCodes.has(error.code)
    ) {
      return undefined;
    }
    throw error;
  });

  if (!info) {
    const device = NfcAntennaInfoModule?.getDevice().trim().toLowerCase();
    const model = Platform.constants.Model.trim().toLowerCase();
    const models =
      device && Object.hasOwn(antennaMapping, device)
        ? antennaMapping[device]
        : undefined;
    const entry =
      models && Object.hasOwn(models, model) ? models[model] : undefined;
    if (!entry) {
      return undefined;
    }
    const [position, confidence] = entry;
    return { position, source: "mapping", confidence };
  }

  const { deviceHeight, deviceWidth, availableNfcAntennas } = info;
  if (
    !Number.isFinite(deviceHeight) ||
    !Number.isFinite(deviceWidth) ||
    deviceHeight <= 0 ||
    deviceWidth <= 0 ||
    availableNfcAntennas.length === 0
  ) {
    return undefined;
  }

  const bands = availableNfcAntennas.map(({ locationX, locationY }) => {
    if (
      !Number.isFinite(locationX) ||
      !Number.isFinite(locationY) ||
      locationX < 0 ||
      locationX > deviceWidth ||
      locationY < 0 ||
      locationY > deviceHeight
    ) {
      return undefined;
    }
    // Include the device's bottom edge in the last third.
    const band = Math.min(
      Math.floor((locationY / deviceHeight) * antennaBandCount),
      antennaBandCount - 1
    );
    return antennaPositions[band];
  });
  const [position] = bands;
  return position && bands.every(band => band === position)
    ? { position, source: "api", confidence: "high" }
    : undefined;
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
