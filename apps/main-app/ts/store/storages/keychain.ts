import * as SecureStore from "expo-secure-store";
import * as LegacyKeychain from "react-native-keychain";
import { Storage } from "redux-persist";

// expo-secure-store only allows [A-Za-z0-9._-] https://docs.expo.dev/versions/latest/sdk/securestore/?utm_source=chatgpt.com#securestoresetitemasynckey-value-options; encode other chars as -XX (hex)
const sanitizeKey = (key: string): string =>
  `k.${key
    .split("")
    .map(char => char.charCodeAt(0).toString(16).padStart(4, "0"))
    .join("")}`;

// Stay under iOS limit ~2048-byte https://docs.expo.dev/versions/latest/sdk/securestore/
const CHUNK_SIZE = 1800;

const chunkKey = (base: string, index: number) => `${base}.c${index}`;
const metaKey = (base: string) => `${base}.n`;

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

async function getChunked(base: string): Promise<string | undefined> {
  const countStr = await SecureStore.getItemAsync(metaKey(base), OPTIONS);
  if (countStr === null) {
    return undefined;
  }
  const count = parseInt(countStr, 10);
  const chunks: ReadonlyArray<null | string> = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.getItemAsync(chunkKey(base, i), OPTIONS)
    )
  );
  const complete = chunks.filter((c): c is string => c !== null);
  if (complete.length !== count) {
    return undefined;
  }
  return complete.join("");
}

// TODO: IOPLT-2010 remove once all users have migrated off react-native-keychain (one release after this one)
async function migrateLegacyItem(
  sanitizedKey: string,
  originalKey: string
): Promise<string | undefined> {
  const legacy = await LegacyKeychain.getGenericPassword({
    service: originalKey
  });
  if (typeof legacy === "boolean") {
    return undefined;
  }
  await setChunked(sanitizedKey, legacy.password);
  await LegacyKeychain.resetGenericPassword({ service: originalKey });
  return legacy.password;
}

async function removeChunked(base: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(metaKey(base), OPTIONS);
  if (countStr === null) {
    return;
  }
  const count = parseInt(countStr, 10);
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.deleteItemAsync(chunkKey(base, i), OPTIONS)
    )
  );
  await SecureStore.deleteItemAsync(metaKey(base), OPTIONS);
}

async function setChunked(base: string, value: string): Promise<void> {
  await removeChunked(base);
  const chunks = Array.from(
    { length: Math.ceil(value.length / CHUNK_SIZE) },
    (_, i) => value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
  );
  await SecureStore.setItemAsync(metaKey(base), String(chunks.length), OPTIONS);
  await Promise.all(
    chunks.map((chunk, i) =>
      SecureStore.setItemAsync(chunkKey(base, i), chunk, OPTIONS)
    )
  );
}

// eslint-disable-next-line functional/no-let
export let getKeychainError: string | undefined;
// eslint-disable-next-line functional/no-let
export let setKeychainError: string | undefined;
// eslint-disable-next-line functional/no-let
export let removeKeychainError: string | undefined;

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        const value = await getChunked(sanitizeKey(key));
        if (value !== undefined) {
          return value;
        }
        return await migrateLegacyItem(sanitizeKey(key), key);
      } catch (err) {
        getKeychainError = JSON.stringify(err);
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        return await setChunked(sanitizeKey(key), value);
      } catch (err) {
        setKeychainError = JSON.stringify(err);
        return false;
      }
    },

    removeItem: async key => {
      try {
        return await removeChunked(sanitizeKey(key));
      } catch (err) {
        removeKeychainError = JSON.stringify(err);
        return false;
      }
    }
  };
}

export const clearKeychainError = () => {
  getKeychainError = undefined;
  setKeychainError = undefined;
  removeKeychainError = undefined;
};
