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
 * Wrapper that sets default accessible option.
 *
 * More about accessibility options:
 * https://developer.apple.com/documentation/security/ksecattraccessibleafterfirstunlock
 */
export async function setGenericPasswordWithDefaultAccessibleOption(
  username: string,
  password: string,
  options?: Options
) {
  return Keychain.setGenericPassword(username, password, {
    ...options,
    // The data in the keychain item can be accessed only while the device is unlocked by the user.
    // This is recommended for items that need to be accessible only while the application is in the foreground. Items
    // with this attribute do not migrate to a new device. Thus, after restoring from a backup of a different device,
    // these items will not be present.
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

/**
 * Saves the provided unlock code in the Keychain
 */
export async function setPin(pin: PinString): Promise<boolean> {
  return await setGenericPasswordWithDefaultAccessibleOption(PIN_KEY, pin);
}

/**
 * Removes the unlock code from the Keychain
 */
export async function deletePin(): Promise<boolean> {
  return await Keychain.resetGenericPassword();
}

/**
 * Returns the unlock code from the Keychain.
 *
 * The promise fails when there is no valid unlock code stored.
 */
export async function getPin(): Promise<Option<PinString>> {
  const credentials = await Keychain.getGenericPassword();
  if (typeof credentials !== "boolean" && credentials.password.length > 0) {
    return fromEither(PinString.decode(credentials.password));
  } else {
    return none;
  }
}
