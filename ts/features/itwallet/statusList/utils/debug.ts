import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Debug functions
 *
 * TODO: remove these functions once status list is fully implemented
 */

const STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS = `@io.itwallet.statusList:appWakeUpTimestamps`;

/**
 * Retrieves the timestamps of the app wake up events stored in the Secure Storage.
 * @returns A promise that resolves to an array of timestamps (in milliseconds
 * since the Unix epoch) representing the times the app woke up since the last
 * app open.
 */
export const getAppWakeUpTimestamps = async (): Promise<Array<number>> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS);
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
    await AsyncStorage.setItem(
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
    await AsyncStorage.removeItem(STORAGE_KEY_APP_WAKE_UP_TIMESTAMPS);
  } catch (error) {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};
