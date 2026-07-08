import AsyncStorage from "@react-native-async-storage/async-storage";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { STORAGE_PREFIX } from "./consts";

export const STORAGE_KEY_LAST_CHECK_TIME = `${STORAGE_PREFIX}:lastCheckTime`;

/**
 * Fallback ITW specs version, used when no version is persisted yet. Mirrors the
 * app default (`itWalletSpecsVersion` initial state).
 */
const FALLBACK_ITW_VERSION: ItwVersion = "1.0.0";

/**
 * AsyncStorage key under which redux-persist stores the `itWallet` slice.
 * Format: `${KEY_PREFIX}${persistConfig.key}` with each whitelisted sub-state
 * JSON-stringified. Mirrors `itwPersistConfig` in
 * features/itwallet/common/store/reducers/index.ts.
 */
const ITW_PERSIST_STORAGE_KEY = "persist:itWallet";

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
 * @returns A promise that resolves to the timestamp of the last check in
 * milliseconds since the Unix epoch
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
 * Reads the current ITW specs version directly from the redux-persist store,
 * so the background fetch task (which has no Redux access) can reuse it without
 * duplicating the value. Reads the `environment` sub-state of the persisted
 * `itWallet` slice.
 *
 * @returns A promise resolving to the persisted version, or the app default
 * when absent or unreadable
 */
export const getPersistedItwVersion = async (): Promise<ItwVersion> => {
  try {
    const raw = await AsyncStorage.getItem(ITW_PERSIST_STORAGE_KEY);
    if (!raw) {
      return FALLBACK_ITW_VERSION;
    }
    // Each whitelisted slice is itself a JSON string within the root object.
    const environment = JSON.parse(JSON.parse(raw).environment);
    return (
      (environment.itWalletSpecsVersion as ItwVersion) ?? FALLBACK_ITW_VERSION
    );
  } catch {
    return FALLBACK_ITW_VERSION;
  }
};
