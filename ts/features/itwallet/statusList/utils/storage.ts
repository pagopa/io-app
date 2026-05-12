import * as SecureStorage from "@pagopa/io-react-native-secure-storage";

// Storage keys for the ITW Status List feature.
const STORAGE_PREFIX = "@io.itwallet.statusList";
const STORAGE_KEY_LAST_CHECK = `${STORAGE_PREFIX}:lastCheck`;

/**
 * Stores the timestamp of the last check for the ITW Status List in the
 * Secure Storage.
 *
 * @param timestamp The timestamp to store, in milliseconds since the Unix epoch
 */
export const storeLastCheckTimestamp = async (
  timestamp: number
): Promise<void> => {
  try {
    await SecureStorage.put(STORAGE_KEY_LAST_CHECK, timestamp.toString());
  } catch (error) {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};

/**
 * Retrieves the timestamp of the last check for the ITW Status List from the
 * Secure Storage.
 * @returns A promise that resolves to the timestamp of the last check in
 * milliseconds since the Unix epoch
 */
export const getLastCheckTimestamp = async (): Promise<number | undefined> => {
  try {
    const raw = await SecureStorage.get(STORAGE_KEY_LAST_CHECK);
    return raw ? parseInt(raw, 10) : undefined;
  } catch (error) {
    return undefined;
  }
};

/**
 * Debug functions
 *
 * TODO: remove these functions once status list is fully implemented
 */

const STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS = `${STORAGE_PREFIX}:appWakeUpTimestamps`;

export const getAppWakeUpTimestamps = async (): Promise<Array<number>> => {
  try {
    const raw = await SecureStorage.get(STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS);
    return raw ? (JSON.parse(raw) as Array<number>) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Everytime the app wakes up, stores the current timestamp in the AsyncStorage
 * to keep track of the times the app woke up since the last app open.
 */
export const storeAppWakeUpTimestamps = async (): Promise<void> => {
  try {
    const timestamps = await getAppWakeUpTimestamps();
    const updatedTimestamp = [...timestamps, Date.now()];
    await SecureStorage.put(
      STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS,
      JSON.stringify(updatedTimestamp)
    );
  } catch (error) {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};

export const clearAppWakeUpTimestamps = async (): Promise<void> => {
  try {
    await SecureStorage.remove(STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS);
  } catch (error) {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};
