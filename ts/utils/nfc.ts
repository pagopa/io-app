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
 * Includes the dimensions of the device to determine antenna placement.
 */
const NfcAntennaInfoSchema = z.object({
  availableNfcAntennas: z.array(AvailableNfcAntennaSchema),
  deviceWidthMm: z.number(),
  deviceHeightMm: z.number(),
  isDeviceFoldable: z.boolean()
});

export type NfcAntennaInfo = z.infer<typeof NfcAntennaInfoSchema>;
export type AvailableNfcAntenna = z.infer<typeof AvailableNfcAntennaSchema>;

/**
 * Retrieves NFC antenna information on Android devices with API level 34+.
 * Returns undefined for unsupported Android devices or iOS devices.
 */
export const getNfcAntennaInfo = Platform.select({
  android: () => {
    try {
      const raw = NfcAntennaInfoNativeModule.getNfcAntennaInfo();
      return NfcAntennaInfoSchema.parse(raw);
    } catch (e) {
      return undefined;
    }
  },
  default: () => undefined
});
