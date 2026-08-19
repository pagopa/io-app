/**
 * Helpers for setting and getting the PIN code using expo-secure-store.
 *
 * Data is stored with WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility,
 * meaning it is not backed up and only accessible while the device is unlocked.
 */

import * as SecureStore from "expo-secure-store";
import * as LegacyKeychain from "react-native-keychain";

import { PinString } from "../types/PinString";

const PIN_KEY = "PIN";

// Items with this attribute do not migrate to a new device and are only
// accessible while the device is unlocked by the user.
const DEFAULT_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

/**
 * Removes the unlock code from the secure store.
 */
export async function deletePin(): Promise<boolean> {
  await SecureStore.deleteItemAsync(PIN_KEY, DEFAULT_OPTIONS);
  return true;
}

/**
 * Returns the unlock code from the secure store.
 */
export async function getPin(): Promise<PinString | undefined> {
  const value = await SecureStore.getItemAsync(PIN_KEY, DEFAULT_OPTIONS);
  if (value !== null && PinString.is(value)) {
    return value;
  }
  return await migrateLegacyPin();
}

/**
 * Saves the provided unlock code in the secure store.
 */
export async function setPin(pin: PinString): Promise<boolean> {
  await SecureStore.setItemAsync(PIN_KEY, pin, DEFAULT_OPTIONS);
  return true;
}

// TODO: IOPLT-2010 remove once all users have migrated off react-native-keychain (one release after this one)
async function migrateLegacyPin(): Promise<PinString | undefined> {
  const credentials = await LegacyKeychain.getGenericPassword();
  if (typeof credentials === "boolean" || !PinString.is(credentials.password)) {
    return undefined;
  }
  const pin = credentials.password;
  await setPin(pin);
  await LegacyKeychain.resetGenericPassword();
  return pin;
}
