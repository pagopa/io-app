/**
 * Helpers for setting and getting the PIN code using expo-secure-store.
 *
 * Data is stored with WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility, meaning it
 * is not backed up and only accessible while the device is unlocked.
 */

import * as SecureStore from "expo-secure-store";
import * as LegacyKeychain from "react-native-keychain";

import { mixpanelTrack } from "../mixpanel";
import { PinString } from "../types/PinString";
import { buildEventProperties, trackPinOperation } from "./analytics";
import { unknownToString } from "./errors";

const PIN_KEY = "PIN";

// Items with this attribute do not migrate to a new device and are only
// accessible while the device is unlocked by the user.
const DEFAULT_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

/** Removes the unlock code from the secure store. */
export async function deletePin(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY, DEFAULT_OPTIONS);
    // TODO: IOPLT-2010 remove once all users have migrated off react-native-keychain (one release after this one)
    // clears the legacy entry too, in case migration never completed (e.g. after a write failure)
    await LegacyKeychain.resetGenericPassword();
    trackPinOperation("REMOVE", true);
    return true;
  } catch (error) {
    trackPinOperation("REMOVE", false, error);
    throw error;
  }
}

/** Returns the unlock code from the secure store. */
export async function getPin(): Promise<PinString | undefined> {
  try {
    const value = await SecureStore.getItemAsync(PIN_KEY, DEFAULT_OPTIONS);
    const pin =
      value !== null && PinString.is(value) ? value : await migrateLegacyPin();
    trackPinOperation("GET", true);
    return pin;
  } catch (error) {
    trackPinOperation("GET", false, error);
    throw error;
  }
}

/** Saves the provided unlock code in the secure store. */
export async function setPin(pin: PinString): Promise<boolean> {
  const result = await savePin(pin);
  return result.success;
}

// TODO: IOPLT-2010 remove once all users have migrated off react-native-keychain (one release after this one)
async function migrateLegacyPin(): Promise<PinString | undefined> {
  const credentials = await LegacyKeychain.getGenericPassword();
  if (typeof credentials === "boolean" || !PinString.is(credentials.password)) {
    return undefined;
  }
  void mixpanelTrack(
    "PIN_KEYCHAIN_MIGRATION_REQUEST",
    buildEventProperties("TECH", undefined)
  );
  const pin = credentials.password;
  const migrated = await savePin(pin);
  if (migrated.success) {
    await LegacyKeychain.resetGenericPassword();
    void mixpanelTrack(
      "PIN_KEYCHAIN_MIGRATION_SUCCESS",
      buildEventProperties("TECH", undefined)
    );
  } else {
    void mixpanelTrack(
      "PIN_KEYCHAIN_MIGRATION_FAILURE",
      buildEventProperties("KO", "error", {
        reason: unknownToString(migrated.error)
      })
    );
  }
  return pin;
}

async function savePin(
  pin: PinString
): Promise<{ error: unknown; success: false } | { success: true }> {
  try {
    await SecureStore.setItemAsync(PIN_KEY, pin, DEFAULT_OPTIONS);
    trackPinOperation("SET", true);
    return { success: true };
  } catch (error) {
    trackPinOperation("SET", false, error);
    return { success: false, error };
  }
}
