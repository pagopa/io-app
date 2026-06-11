import * as SecureStorage from "@pagopa/io-react-native-secure-storage";

const PREFIX = "itw:credential:";
/**
 * Separator between the credentialId and the per-copy keyTag in the vault key of a batch
 * credential copy. The keyTag is a UUID, so it never contains this character.
 */
const BATCH_SEPARATOR = ":";

/**
 * Reference to a credential entry in the vault.
 *
 * `keyTag` is provided ONLY when addressing a specific copy of a batch credential. Non-batch
 * credentials are stored under their `credentialId` alone, exactly as before batch support was
 * introduced, so existing installs need no vault migration.
 */
export type VaultRef = {
  credentialId: string;
  keyTag?: string;
};

/**
 * Builds the vault id (the storage key without the prefix) for a credential entry.
 *
 * - Non-batch credential: `{credentialId}` (e.g. `dc_sd_jwt_PersonalIdentificationData`).
 * - Batch credential copy: `{credentialId}:{keyTag}`.
 *
 * @param ref The vault reference
 * @returns The vault id
 */
export const vaultIdFor = ({ credentialId, keyTag }: VaultRef): string =>
  keyTag === undefined
    ? credentialId
    : `${credentialId}${BATCH_SEPARATOR}${keyTag}`;

/**
 * Generates the full storage key for a given vault id.
 * @param vaultId The vault id (see {@link vaultIdFor})
 * @returns The storage key
 */
const getStorageKeyFromVaultId = (vaultId: string): string =>
  `${PREFIX}${vaultId}`;

/**
 * Extracts the vault id from a given storage key.
 * @param key The storage key
 * @returns The vault id
 */
const getVaultIdFromStorageKey = (key: string): string => {
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
 * Lists all the credential vault ids stored in the Secure Storage.
 * @returns A promise that resolves to an array of vault ids
 * @throws If the Secure Storage operation fails
 */
const list = async (): Promise<ReadonlyArray<string>> => {
  const storageKeys = await SecureStorage.keys();
  return storageKeys
    .filter(key => key.startsWith(PREFIX))
    .map(getVaultIdFromStorageKey);
};

/**
 * Stores a credential's SD-JWT/MDOC in the Secure Storage.
 * @param vaultId The credential vault id (see {@link vaultIdFor})
 * @param credential The credential's SD-JWT/MDOC as a string
 * @throws If the Secure Storage operation fails
 */
const store = async (vaultId: string, credential: string): Promise<void> => {
  const key = getStorageKeyFromVaultId(vaultId);
  await SecureStorage.put(key, credential);
};

/**
 * Store multiple credentials' SD-JWT/MDOC in the Secure Storage.
 * @param credentials An array of objects containing vaultId and credential string
 * @throws If any Secure Storage operation fails
 */
const storeAll = async (
  credentials: ReadonlyArray<{ vaultId: string; credential: string }>
) => {
  await Promise.all(
    credentials.map(data => store(data.vaultId, data.credential))
  );
};

/**
 * Retrieves a credential's SD-JWT/MDOC from the Secure Storage using its vault id.
 * @param vaultId The credential vault id (see {@link vaultIdFor})
 * @returns A promise that resolves to the credential's SD-JWT/MDOC as a string, or undefined if not found
 * @throws If the Secure Storage operation fails for reasons other than a missing value
 */
const get = async (vaultId: string): Promise<string | undefined> => {
  const key = getStorageKeyFromVaultId(vaultId);
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
 * Removes a credential's SD-JWT/MDOC from the Secure Storage using its vault id.
 * @param vaultId The credential vault id (see {@link vaultIdFor})
 * @throws If the Secure Storage operation fails
 */
const remove = async (vaultId: string): Promise<void> => {
  const key = getStorageKeyFromVaultId(vaultId);
  await SecureStorage.remove(key);
};

/**
 * Removes all credentials' SD-JWT/MDOCs from the Secure Storage with the given vault ids.
 * @param vaultIds An array of credential vault ids
 * @throws If any Secure Storage operation fails
 */
const removeAll = async (vaultIds: ReadonlyArray<string>) => {
  await Promise.all(vaultIds.map(remove));
};

/**
 * Clears all credentials' SD-JWT/MDOCs from the Secure Storage.
 * @throws If the Secure Storage operation fails
 */
const clear = async () => {
  const vaultIds = await list();
  await removeAll(vaultIds);
};

export const CredentialsVault = {
  store,
  storeAll,
  get,
  remove,
  removeAll,
  clear,
  list
};
