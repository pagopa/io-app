/**
 * Helpers for setting and getting the PIN code using expo-secure-store.
 *
 * Data is stored with WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility,
 * meaning it is not backed up and only accessible while the device is unlocked.
 */

import * as SecureStore from "expo-secure-store";
import * as O from "fp-ts/lib/Option";

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
 * Removes a value from the secure store by key.
 */
export async function deleteSecureItem(key: string): Promise<void> {
  return SecureStore.deleteItemAsync(key, DEFAULT_OPTIONS);
}

/**
 * Returns the unlock code from the secure store.
 */
export async function getPin(): Promise<O.Option<PinString>> {
  const value = await SecureStore.getItemAsync(PIN_KEY, DEFAULT_OPTIONS);
  if (value !== null && value.length > 0) {
    return O.fromEither(PinString.decode(value));
  }
  return O.none;
}

/**
 * Saves the provided unlock code in the secure store.
 */
export async function setPin(pin: PinString): Promise<boolean> {
  await setSecureItem(PIN_KEY, pin);
  return true;
}

/**
 * Stores a value with the default secure storage options applied.
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  return SecureStore.setItemAsync(key, value, DEFAULT_OPTIONS);
}
