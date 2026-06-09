import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StoredStatusListSchema,
  type StoredStatusList,
  type StatusListPayload
} from "./schemas";

const STORAGE_PREFIX = "@io.itwallet.statusList";
const INDEX_KEY = `${STORAGE_PREFIX}:index`;

/**
 * Encodes a raw URI into a safe AsyncStorage key.
 * Keeps encoding internal so callers always use the raw URI.
 */
const entryKey = (uri: string): string =>
  `${STORAGE_PREFIX}:entry:${encodeURIComponent(uri)}`;

/**
 * Reads and parses the index of cached Status List URIs.
 * Returns an empty array if the index is missing or malformed.
 */
const readIndex = async (): Promise<Array<string>> => {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(s => typeof s === "string")
      : [];
  } catch {
    return [];
  }
};

/**
 * Writes the index of cached Status List URIs.
 */
const writeIndex = async (uris: Array<string>): Promise<void> => {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(uris));
};

/**
 * Lists all valid cached Status List Token entries.
 * Performs self-healing: entries that fail validation are excluded
 * and their URI is removed from the index.
 */
export const list = async (): Promise<Array<StoredStatusList>> => {
  const uris = await readIndex();
  if (uris.length === 0) {
    return [];
  }

  const keys = uris.map(entryKey);
  const pairs = await AsyncStorage.multiGet(keys);

  const validated = uris.reduce<{
    readonly results: ReadonlyArray<StoredStatusList>;
    readonly validUris: ReadonlyArray<string>;
  }>(
    (acc, uri, idx) => {
      const raw = pairs[idx]?.[1];
      if (!raw) {
        return acc;
      }
      try {
        const parsed: unknown = JSON.parse(raw);
        const entry = StoredStatusListSchema.parse(parsed);
        return {
          results: [...acc.results, entry],
          validUris: [...acc.validUris, uri]
        };
      } catch {
        // Malformed entry: skip and exclude from index
        return acc;
      }
    },
    { results: [], validUris: [] }
  );

  // Self-heal index if any entries were dropped
  if (validated.validUris.length !== uris.length) {
    try {
      await writeIndex([...validated.validUris]);
    } catch {
      // Best-effort index repair
    }
  }

  return [...validated.results];
};

/**
 * Retrieves a single cached Status List Token by its URI.
 * Returns `undefined` if not found or if validation fails.
 */
export const get = async (
  uri: string
): Promise<StoredStatusList | undefined> => {
  try {
    const raw = await AsyncStorage.getItem(entryKey(uri));
    if (!raw) {
      return undefined;
    }
    return StoredStatusListSchema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
};

/**
 * Persists a Status List Token entry.
 * Accepts a decoded payload and resolution timestamp, builds the
 * persisted object internally after validation.
 * Writes the entry first, then updates the index.
 */
export const upsert = async (
  uri: string,
  payload: StatusListPayload,
  resolvedAt: number
): Promise<void> => {
  const entry: StoredStatusList = {
    payload,
    meta: { resolvedAt }
  };
  // Validate before persisting
  StoredStatusListSchema.parse(entry);

  await AsyncStorage.setItem(entryKey(uri), JSON.stringify(entry));

  const index = await readIndex();
  if (!index.includes(uri)) {
    await writeIndex([...index, uri]);
  }
};

/**
 * Removes a single cached Status List Token by its URI.
 * Removes the entry first, then updates the index.
 */
export const remove = async (uri: string): Promise<void> => {
  await AsyncStorage.removeItem(entryKey(uri));

  const index = await readIndex();
  const updated = index.filter(s => s !== uri);
  if (updated.length !== index.length) {
    await writeIndex(updated);
  }
};

/**
 * Removes multiple cached Status List Tokens by their URIs.
 */
export const removeMany = async (uris: Array<string>): Promise<void> => {
  if (uris.length === 0) {
    return;
  }

  const keys = uris.map(entryKey);
  await AsyncStorage.multiRemove(keys);

  const uriSet = new Set(uris);
  const index = await readIndex();
  const updated = index.filter(s => !uriSet.has(s));
  if (updated.length !== index.length) {
    await writeIndex(updated);
  }
};

/**
 * Removes all cached Status List Token entries and the index.
 */
export const clear = async (): Promise<void> => {
  const index = await readIndex();
  if (index.length > 0) {
    await AsyncStorage.multiRemove(index.map(entryKey));
  }
  await AsyncStorage.removeItem(INDEX_KEY);
};
