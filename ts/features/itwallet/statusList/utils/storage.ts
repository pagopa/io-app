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
export const storeLastStatusListCheckTimestamp = async (
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
export const getLastStatusListCheckTimestamp = async (): Promise<
  number | undefined
> => {
  try {
    const raw = await SecureStorage.get(STORAGE_KEY_LAST_CHECK);
    return raw ? parseInt(raw, 10) : undefined;
  } catch (error) {
    return undefined;
  }
};
