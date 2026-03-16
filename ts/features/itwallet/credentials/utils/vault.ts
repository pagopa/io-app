import * as SecureStorage from "@pagopa/io-react-native-secure-storage";

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
 * Lists all the credential IDs stored in the Secure Storage.
 * @returns A promise that resolves to an array of credential IDs
 * @throws If the Secure Storage operation fails
 */
const list = async (): Promise<ReadonlyArray<string>> => {
  const storageKeys = await SecureStorage.keys();
  return storageKeys
    .filter(key => key.startsWith(PREFIX))
    .map(getCredentialIdFromStorageKey);
};

/**
 * Stores a credential's SD-JWT/MDOC in the Secure Storage.
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @param credential The credential's SD-JWT/MDOC as a string
 * @throws If the Secure Storage operation fails
 */
const store = async (
  credentialId: string,
  credential: string
): Promise<void> => {
  const key = getStorageKeyFromCredentialId(credentialId);
  await SecureStorage.put(key, credential);
};

/**
 * Retrieves a credential's SD-JWT/MDOC from the Secure Storage using its type.
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @returns A promise that resolves to the credential's SD-JWT/MDOC as a string, or undefined if not found
 * @throws If the Secure Storage operation fails for reasons other than a missing value
 */
const get = async (credentialId: string): Promise<string | undefined> => {
  const key = getStorageKeyFromCredentialId(credentialId);
  try {
    return await SecureStorage.get(key);
  } catch (e) {
    if (isValueNotFoundError(e)) {
      // VALUE_NOT_FOUND it's a normal case when we try to get a value that is not set
      return undefined;
    }
    // In case of other errors, we rethrow them to be handled by the caller
    throw e;
  }
};

/**
 * Removes a credential's SD-JWT/MDOC from the Secure Storage using its type.
 * @param credentialId The credential ID (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @throws If the Secure Storage operation fails
 */
const remove = async (credentialId: string): Promise<void> => {
  const key = getStorageKeyFromCredentialId(credentialId);
  await SecureStorage.remove(key);
};

/**
 * Removes all credentials' SD-JWT/MDOCs from the Secure Storage with the given IDs.
 * @param credentialIds An array of credential IDs
 * @throws If any Secure Storage operation fails
 */
const removeAll = async (credentialIds: ReadonlyArray<string>) => {
  await Promise.all(credentialIds.map(remove));
};

/**
 * Clears all credentials' SD-JWT/MDOCs from the Secure Storage.
 * @throws If the Secure Storage operation fails
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
