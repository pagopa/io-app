import { CieUtils } from "@pagopa/io-react-native-cie";

/**
 * Checks if NFC is currently activated on the device.
 * @returns A promise that resolves to true if NFC is on, or false otherwise.
 */
export const checkNfcActivation = async () => CieUtils.isNfcEnabled();

/**
 * Opens the NFC settings page on the device.
 *
 * **Android only**
 */
export const openNfcPreferences = () => CieUtils.openNfcSettings();
