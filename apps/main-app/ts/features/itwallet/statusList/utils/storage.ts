import { ItwVersion } from "@pagopa/io-react-native-wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

import {
  STORAGE_KEY_ITW_SPECS_VERSION,
  STORAGE_KEY_LAST_CHECK_TIME
} from "./consts";

const LastStatusListCheckTimestampsSchema = z
  .union([z.array(z.number()), z.number().transform(timestamp => [timestamp])])
  .transform(timestamps => timestamps.slice(-10));

/**
 * Persists the IT-Wallet specs version selected while Redux is available, so
 * the Status List background task can use the same version.
 *
 * @param itwVersion Current IT-Wallet specs version
 */
export const storeItwSpecsVersion = async (
  itwVersion: ItwVersion
): Promise<void> =>
  AsyncStorage.setItem(STORAGE_KEY_ITW_SPECS_VERSION, itwVersion);

/**
 * Retrieves the IT-Wallet specs version persisted for the Status List
 * background task.
 *
 * Only {@link storeItwSpecsVersion} writes this value, preserving the
 * {@link ItwVersion} invariant at the storage boundary.
 *
 * @throws If no specs version was persisted or AsyncStorage cannot be read
 */
export const getItwSpecsVersion = async (): Promise<ItwVersion> => {
  const itwVersion = await AsyncStorage.getItem(STORAGE_KEY_ITW_SPECS_VERSION);
  if (itwVersion === null) {
    throw new Error("IT-Wallet specs version not found");
  }
  return itwVersion as ItwVersion;
};

/**
 * Stores the timestamps of the latest checks made of the Status List
 *
 * @param timestamp The timestamp to store, in milliseconds since the Unix epoch
 */
export const storeLastStatusListCheckTimestamp = async (
  timestamp: number
): Promise<void> => {
  try {
    const timestamps = await getLastStatusListCheckTimestamps();
    const nextTimestamps = LastStatusListCheckTimestampsSchema.parse([
      ...timestamps,
      timestamp
    ]);

    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_CHECK_TIME,
      JSON.stringify(nextTimestamps)
    );
  } catch {
    // Since the store happens outside the app context, there's no way to log or
    // track this error
  }
};

/**
 * Retrieves the timestamps of the latest checks for the ITW Status List.
 * @returns A promise that resolves to the timestamps of the latest checks in
 * milliseconds since the Unix epoch
 */
export const getLastStatusListCheckTimestamps = async (): Promise<
  Array<number>
> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME);

    if (raw === null || raw.trim() === "") {
      return [];
    }

    return LastStatusListCheckTimestampsSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
};
