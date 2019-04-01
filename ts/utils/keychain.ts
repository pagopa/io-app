/**
 * Helpers for setting a getting the PIN code.
 *
 * Note: setGenerigPassword and getGenericPassword will use the App bundle ID
 * as the service ID by default.
 * @see https://github.com/oblador/react-native-keychain#options
 */

import { fromEither, none, Option } from "fp-ts/lib/Option";
import * as Keychain from "react-native-keychain";

import { PinString } from "../types/PinString";

const PIN_KEY = "PIN";

/**
 * Saves the provided PIN in the Keychain
 */
export async function setPin(pin: PinString): Promise<boolean> {
  return await Keychain.setGenericPassword(PIN_KEY, pin, {
    accessible: Keychain.SecAccessible.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

/**
 * Removes the PIN from the Keychain
 */
export async function deletePin(): Promise<boolean> {
  return await Keychain.resetGenericPassword();
}

/**
 * Returns the PIN from the Keychain.
 *
 * The promise fails when there is no valid PIN stored.
 */
export async function getPin(): Promise<Option<PinString>> {
  const credentials = await Keychain.getGenericPassword();
  if (typeof credentials !== "boolean" && credentials.password.length > 0) {
    return fromEither(PinString.decode(credentials.password));
  } else {
    return none;
  }
}
