import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys for the ITW Status List feature.
const STORAGE_PREFIX = "@io.itwallet.statusList";
const STORAGE_KEY_LAST_CHECK_TIME = `${STORAGE_PREFIX}:lastCheckTime`;
const STORAGE_KEY_LAST_FETCH_TIME = `${STORAGE_PREFIX}:lastFetchTime`;

/**
 * Stores the timestamp of the last check made of the Status List
 *
 * @param timestamp The timestamp to store, in milliseconds since the Unix epoch
 */
export const storeLastStatusListCheckTimestamp = async (
  timestamp: number
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_CHECK_TIME,
      timestamp.toString()
    );
  } catch {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};

/**
 * Retrieves the timestamp of the last check for the ITW Status List.
 *
 * @returns A promise that resolves to the timestamp of the last check in
 *   milliseconds since the Unix epoch
 */
export const getLastStatusListCheckTimestamp = async (): Promise<
  number | undefined
> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME);
    return raw ? parseInt(raw, 10) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Stores the timestamp of the last successful fetch of the Status List, used to
 * compute the age of the Status List and decide whether a refresh is needed.
 *
 * @param timestamp The timestamp to store, in milliseconds since the Unix epoch
 */
export const storeLastStatusListFetchTimestamp = async (
  timestamp: number
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_FETCH_TIME,
      timestamp.toString()
    );
  } catch {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};

/**
 * Retrieves the timestamp of the last successfull fetch of the ITW Status List,
 * used to compute the age of the Status List and decide whether a refresh is
 * needed.
 *
 * @returns A promise that resolves to the timestamp of the last check in
 *   milliseconds since the Unix epoch
 */
export const getLastStatusListFetchTimestamp = async (): Promise<
  number | undefined
> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_FETCH_TIME);
    return raw ? parseInt(raw, 10) : undefined;
  } catch {
    return undefined;
  }
};
