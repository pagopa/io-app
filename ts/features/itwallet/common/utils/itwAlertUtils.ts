import { AlertButton, Platform } from "react-native";

/**
 * iOS and Android handle the button order differently. Reversing the array
 * guarantees the buttons appear in the same order on both platforms.
 */
export const normalizeAlertButtons = (
  buttons: ReadonlyArray<AlertButton>
): Array<AlertButton> =>
  Platform.OS === "android" ? [...buttons].reverse() : [...buttons];
