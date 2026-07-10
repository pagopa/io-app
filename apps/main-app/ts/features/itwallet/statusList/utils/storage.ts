import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { STORAGE_KEY_LAST_CHECK_TIME } from "./consts";

const LastStatusListCheckTimestampsSchema = z
  .union([z.array(z.number()), z.number().transform(timestamp => [timestamp])])
  .transform(timestamps => timestamps.slice(-10));

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
    return LastStatusListCheckTimestampsSchema.parse(JSON.parse(raw || ""));
  } catch {
    return [];
  }
};
