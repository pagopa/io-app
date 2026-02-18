import { NativeModules, Platform } from "react-native";
import { z } from "zod";

const NfcAntennaInfoNativeModule = NativeModules.NfcAntennaInfo;

/**
 * Position of the NFC antenna on the device, in millimeters from the top-left corner.
 */
const AvailableNfcAntennaSchema = z.object({
  locationX: z.number(),
  locationY: z.number()
});

/**
 * Information about the NFC antennas available on the device.
 * Includes the dimensions (in millimeters) of the device to determine antenna placement.
 */
const NfcAntennaInfoSchema = z.object({
  availableNfcAntennas: z.array(AvailableNfcAntennaSchema),
  deviceWidth: z.number(),
  deviceHeight: z.number(),
  isDeviceFoldable: z.boolean()
});

export type NfcAntennaInfo = z.infer<typeof NfcAntennaInfoSchema>;
export type AvailableNfcAntenna = z.infer<typeof AvailableNfcAntennaSchema>;

function getUnsupportedPlatformNfcInfo(): Promise<NfcAntennaInfo> {
  return Promise.reject(
    new Error("NFC info is only available on Android devices.")
  );
}

/**
 * Retrieves NFC antenna information on Android devices with API level 34+.
 * The information includes the device dimensions and the locations of available NFC antennas
 * in millimeters from the top-left corner of the device.
 *
 * @returns NFC antenna information.
 * @throws If the platform is not Android or if the native module fails to provide valid data.
 */
export const getNfcAntennaInfo: () => Promise<NfcAntennaInfo> = Platform.select(
  {
    android: async () => {
      const raw = await NfcAntennaInfoNativeModule.getNfcAntennaInfo();
      return NfcAntennaInfoSchema.parse(raw);
    },
    default: getUnsupportedPlatformNfcInfo
  }
);

/**
 * Checks if Host Card Emulation (HCE) is supported on the device.
 * HCE allows the device to emulate an NFC card, enabling it to interact with NFC readers.
 *
 * @returns A promise that resolves to true if HCE is supported, or false if not.
 * @throws If the platform is not Android or if the native module fails to provide valid data.
 */
export const isHceSupported: () => Promise<boolean> = Platform.select({
  android: () => NfcAntennaInfoNativeModule.isHceSupported(),
  default: getUnsupportedPlatformNfcInfo
});
