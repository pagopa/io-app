/**
 * Helpers for setting a getting the PIN code.
 *
 * Note: setGenerigPassword and getGenericPassword will use the App bundle ID
 * as the service ID by default.
 * @see https://github.com/oblador/react-native-keychain#options
 */

import * as Keychain from "react-native-keychain";

const PIN_KEY = "PIN";

// Save the PIN in the Keychain
export async function setPin(pin: string): Promise<void> {
  await Keychain.setGenericPassword(PIN_KEY, pin);
}

// Get the PIN from the Keychain
export async function getPin(): Promise<string> {
  const credentials = await Keychain.getGenericPassword();
  if (typeof credentials !== "boolean") {
    return credentials.password;
  } else {
    // Throw error if PIN doesn't exist
    throw Error("No PIN found");
  }
}
