import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusListPayloadSchema, type StatusListPayload } from "./schemas";
import { STORAGE_PREFIX } from "./consts";

export const STORAGE_ENTRY_PREFIX = `${STORAGE_PREFIX}:entry:`;

/**
 * Encodes a raw URI into a safe AsyncStorage key.
 * Keeps encoding internal so callers always use the raw URI.
 */
const entryKey = (uri: string): string =>
  `${STORAGE_ENTRY_PREFIX}${encodeURIComponent(uri)}`;

/**
 * Reads all cached Status List entry keys.
 * Other feature keys sharing the same storage prefix are ignored.
 */
const readEntryKeys = async (): Promise<Array<string>> => {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter(key => key.startsWith(STORAGE_ENTRY_PREFIX));
};

/**
 * Lists all cached Status List Token payloads.
 */
const list = async (): Promise<Array<StatusListPayload>> => {
  const keys = await readEntryKeys();
  if (keys.length === 0) {
    return [];
  }
  const pairs = await AsyncStorage.multiGet(keys);
  return pairs.flatMap(([, raw]) =>
    raw ? [StatusListPayloadSchema.parse(JSON.parse(raw))] : []
  );
};

/**
 * Retrieves a single cached Status List Token payload by its URI.
 * Returns `undefined` if not found or if validation fails.
 */
const get = async (uri: string): Promise<StatusListPayload | undefined> => {
  try {
    const raw = await AsyncStorage.getItem(entryKey(uri));
    if (!raw) {
      return undefined;
    }
    return StatusListPayloadSchema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
};

/**
 * Persists a Status List Token payload, validating it before writing.
 */
const upsert = async (
  uri: string,
  payload: StatusListPayload
): Promise<void> => {
  StatusListPayloadSchema.parse(payload);
  await AsyncStorage.setItem(entryKey(uri), JSON.stringify(payload));
};

/**
 * Removes a single cached Status List Token by its URI.
 */
const remove = async (uri: string): Promise<void> => {
  await AsyncStorage.removeItem(entryKey(uri));
};

/**
 * Removes multiple cached Status List Tokens by their URIs.
 */
const removeMany = async (uris: Array<string>): Promise<void> => {
  if (uris.length === 0) {
    return;
  }

  const keys = uris.map(entryKey);
  await AsyncStorage.multiRemove(keys);
};

/**
 * Removes all cached Status List Token entries.
 */
const clear = async (): Promise<void> => {
  const keys = await readEntryKeys();
  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
  }
};

export const StatusListRepository = {
  list,
  get,
  upsert,
  remove,
  removeMany,
  clear
};
