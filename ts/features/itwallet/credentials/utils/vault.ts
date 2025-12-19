import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import * as Sentry from "@sentry/react-native";

const PREFIX = "itw:credential:";

const getStorageKeyFromCredentialId = (credentialType: string): string =>
  `${PREFIX}${credentialType}`;

const getCredentialIdFromStorageKey = (key: string): string => {
  if (key.startsWith(PREFIX)) {
    return key.slice(PREFIX.length);
  }
  return key;
};

const isValueNotFoundError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") {
    return false;
  }
  const error = e as { message?: unknown };
  return (
    typeof error.message === "string" && error.message === "VALUE_NOT_FOUND"
  );
};

/**
 * Lists all the credential IDs stored in the Secure Storage
 * @returns A promise that resolves to an array of credential IDs
 */
const list = async (): Promise<ReadonlyArray<string>> => {
  try {
    const storageKeys = await SecureStorage.keys();
    return storageKeys
      .filter(key => key.startsWith(PREFIX))
      .map(getCredentialIdFromStorageKey);
  } catch (e) {
    Sentry.captureException(e, {
      tags: {
        isRequired: true
      }
    });
    return [];
  }
};

/**
 * Stores a credential's SD-JWT/MDOC in the Secure Storage
 * @param id The credential type
 * @param credential The credential's SD-JWT/MDOC as a string
 */
const store = async (id: string, credential: string) => {
  const key = getStorageKeyFromCredentialId(id);

  try {
    await SecureStorage.put(key, credential);
  } catch (e) {
    Sentry.captureException(e, {
      tags: {
        isRequired: true
      }
    });
    Sentry.captureMessage(
      `Credential vault: SecureStorage.put threw an exception on ${key} key`
    );
  }
};

/**
 * Retrieves a credential's SD-JWT/MDOC from the Secure Storage using its type
 * @param id The credential type
 * @returns A promise that resolves to the credential's SD-JWT/MDOC as a string, or undefined if not found
 */
const retrieve = async (id: string): Promise<string | undefined> => {
  const key = getStorageKeyFromCredentialId(id);

  try {
    return await SecureStorage.get(key);
  } catch (e) {
    if (!isValueNotFoundError(e)) {
      // VALUE_NOT_FOUND it's a normal case when we try to get a value that is not set
      // We should send to Sentry only unwanted exceptions
      Sentry.captureException(e, {
        tags: {
          isRequired: true
        }
      });
      Sentry.captureMessage(
        `Credential vault: SecureStorage.get threw an exception on ${key} key`
      );
    }
    return undefined;
  }
};

/**
 * Removes a credential's SD-JWT/MDOC from the Secure Storage using its type
 * @param id The credential type
 */
const remove = async (id: string) => {
  const key = getStorageKeyFromCredentialId(id);

  try {
    await SecureStorage.remove(key);
  } catch (e) {
    Sentry.captureException(e, {
      tags: {
        isRequired: true
      }
    });
    Sentry.captureMessage(
      `Credential vault: SecureStorage.remove threw an exception on ${key} key`
    );
  }
};

/**
 * Removes all credentials' SD-JWT/MDOCs from the Secure Storage
 */
const removeAll = async () => {
  const credentialIds = await list();
  await Promise.all(credentialIds.map(remove));
};

export default {
  store,
  retrieve,
  remove,
  removeAll,
  list
};
