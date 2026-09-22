import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export type AvailableNfcAntenna = {
  locationX: number;
  locationY: number;
};

export type NfcAntennaInfoResult = {
  availableNfcAntennas: ReadonlyArray<AvailableNfcAntenna>;
  deviceHeight: number;
  deviceWidth: number;
  isDeviceFoldable: boolean;
};

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

/**
 * Checks if Host Card Emulation (HCE) is supported on the device.
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
