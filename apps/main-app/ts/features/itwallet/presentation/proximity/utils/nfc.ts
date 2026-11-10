import { CieUtils } from "@pagopa/io-react-native-cie";
import { Platform } from "react-native";

import { openAppSettings } from "../../../../../utils/appSettings";

/**
 * Checks NFC reader availability. This does not check iOS contactless consent;
 * the proximity machine waits for native NFC startup to confirm it.
 *
 * @returns A promise that resolves to true if NFC is on, or false otherwise.
 */
export const checkNfcActivation = async () => CieUtils.isNfcEnabled();

/** Opens app permissions on iOS, or NFC activation settings on Android. */
export const openNfcPreferences = () =>
  Platform.OS === "ios" ? openAppSettings() : CieUtils.openNfcSettings();
