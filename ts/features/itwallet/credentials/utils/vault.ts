import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import * as Sentry from "@sentry/react-native";

const PREFIX = "itw:credential:";

/**
 * Generates the storage key for a given credential ID.
 *
 * Example:for credentialId "dc_sd_jwt_PersonalIdentificationData",
 * the generated storage key will be "itw:credential:dc_sd_jwt_PersonalIdentificationData"
 * @param credentialId The credential ID
 * @returns The storage key
 */
const getStorageKeyFromCredentialId = (credentialId: string): string =>
  `${PREFIX}${credentialId}`;

/**
 * Extracts the credential ID from a given storage key.
 *
 * Example: for storage key "itw:credential:dc_sd_jwt_PersonalIdentificationData",
 * the extracted credential ID will be "dc_sd_jwt_PersonalIdentificationData"
 * @param key The storage key
 * @returns The credential ID
 */
const getCredentialIdFromStorageKey = (key: string): string => {
  if (key.startsWith(PREFIX)) {
    return key.slice(PREFIX.length);
  }
  return key;
};

/**
 * Type guard to check if an error is a VALUE_NOT_FOUND error emitted from
 * SecureStorage package
 * @param e The error to check
 * @returns True if the error is a VALUE_NOT_FOUND error, false otherwise
 */
const isValueNotFoundError = (e: unknown): e is Error =>
  e instanceof Error && e.message === "VALUE_NOT_FOUND";

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
      tags: { isRequired: true },
      extra: { operation: "list" }
    });
    return [];
  }
};

/**
 * Stores a credential's SD-JWT/MDOC in the Secure Storage
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @param credential The credential's SD-JWT/MDOC as a string
 * @returns A promise that resolves to true if the storage was successful, false otherwise
 */
const store = async (
  credentialId: string,
  credential: string
): Promise<boolean> => {
  const key = getStorageKeyFromCredentialId(credentialId);

  try {
    await SecureStorage.put(key, credential);
    return true;
  } catch (e) {
    Sentry.captureException(e, {
      tags: { isRequired: true },
      extra: { operation: "put", key }
    });
    return false;
  }
};

/**
 * Retrieves a credential's SD-JWT/MDOC from the Secure Storage using its type
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @returns A promise that resolves to the credential's SD-JWT/MDOC as a string, or undefined if not found
 */
const get = async (credentialId: string): Promise<string | undefined> => {
  const key = getStorageKeyFromCredentialId(credentialId);

  try {
    return await SecureStorage.get(key);
  } catch (e) {
    if (!isValueNotFoundError(e)) {
      // VALUE_NOT_FOUND it's a normal case when we try to get a value that is not set
      // We should send to Sentry only unwanted exceptions
      Sentry.captureException(e, {
        tags: { isRequired: true },
        extra: { operation: "get", key }
      });
    }
    return undefined;
  }
};

/**
 * Removes a credential's SD-JWT/MDOC from the Secure Storage using its type
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @returns A promise that resolves to true if the removal was successful, false otherwise
 */
const remove = async (credentialId: string): Promise<boolean> => {
  const key = getStorageKeyFromCredentialId(credentialId);

  try {
    await SecureStorage.remove(key);
    return true;
  } catch (e) {
    Sentry.captureException(e, {
      tags: { isRequired: true },
      extra: { operation: "remove", key }
    });
    return false;
  }
};

/**
 * Removes all credentials' SD-JWT/MDOCs from the Secure Storage with the given IDs
 * @param credentialIds An array of credential IDs
 * @returns A promise that resolves when all removals are complete
 */
const removeAll = async (credentialIds: ReadonlyArray<string>) => {
  await Promise.all(credentialIds.map(remove));
};

/**
 * Clears all credentials' SD-JWT/MDOCs from the Secure Storage
 * @returns A promise that resolves when the clearing is complete
 */
const clear = async () => {
  const credentialIds = await list();
  await removeAll(credentialIds);
};

export const CredentialsVault = {
  store,
  get,
  remove,
  removeAll,
  clear,
  list
};
