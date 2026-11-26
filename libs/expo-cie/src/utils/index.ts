import { ExpoCieNative } from "../native";

/**
 * Checks if the device has NFC hardware capabilities.
 *
 * On iOS the NFC features is always available.
 *
 * @returns A promise that resolves to true if the device supports NFC, false
 *   otherwise.
 * @throws {CieError} If cannot check if NFC is available.
 */
export const hasNfcFeature = async (): Promise<boolean> =>
  ExpoCieNative.hasNfcFeature();

/**
 * Checks if NFC is currently enabled on the device.
 *
 * On iOS the NFC features is always enabled.
 *
 * @returns A promise that resolves to true if NFC is enabled, false otherwise.
 * @throws {CieError} If cannot check if NFC is enabled.
 */
export const isNfcEnabled = async (): Promise<boolean> =>
  ExpoCieNative.isNfcEnabled();

/**
 * Verifies if the device supports CIE (Electronic Identity Card)
 * authentication.
 *
 * @returns A promise that resolves to true if CIE authentication is supported,
 *   false otherwise.
 */
export const isCieAuthenticationSupported = async (): Promise<boolean> =>
  ExpoCieNative.isCieAuthenticationSupported();

/**
 * Opens the device's NFC settings page, allowing users to enable or disable
 * NFC.
 *
 * @returns A promise that resolves when the settings page is opened.
 * @throws {CieError} If cannot open the settings page.
 */
export const openNfcSettings = async (): Promise<boolean> =>
  ExpoCieNative.openNfcSettings();
