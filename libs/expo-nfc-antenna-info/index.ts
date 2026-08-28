import { requireNativeModule } from "expo-modules-core";

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
  requireNativeModule<NfcAntennaInfoModuleType>("NfcAntennaInfo");

/**
 * Retrieves NFC antenna information on Android devices with API level 34+.
 */
export const getNfcAntennaInfo = (): Promise<NfcAntennaInfoResult> =>
  NfcAntennaInfoModule.getNfcAntennaInfo();

/**
 * Checks if Host Card Emulation (HCE) is supported on the device.
 */
export const isHceSupported = (): Promise<boolean> =>
  NfcAntennaInfoModule.isHceSupported();
