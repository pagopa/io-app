import { ActionType, createStandardAction } from "typesafe-actions";
import {
  CredentialBundle,
  CredentialMetadata
} from "../../../common/utils/itwTypesUtils";

type CallbackActionMeta = {
  onComplete?: () => void;
  onError?: (error: Error) => void;
};

/**
 * @internal To properly add a credential, dispatch `itwCredentialsStoreBundle`.
 *
 * This actions stores one or multiple credentials using the CredentialMetadata payload.
 * Credentials are stored using the credential ID as key, the new credential completely
 * overwrites the previous one.
 */
export const itwCredentialsStore = createStandardAction(
  "@@internal/ITW_CREDENTIALS_STORE"
)<ReadonlyArray<CredentialMetadata>>();

/**
 * This actions stores one or multiple credentials using the CredentialMetadata payload.
 * Credentials are stored using the credential ID as key, the new credential completely
 * overwrites the previous one.
 * It also accepts optional callbacks in the meta to handle success and failure cases
 * after the credentials are stored in the vault.
 */
export const itwCredentialsStoreBundle = createStandardAction(
  "ITW_CREDENTIALS_STORE_BUNDLE"
)<ReadonlyArray<CredentialBundle>, CallbackActionMeta>();

/**
 * @internal To properly remove a credential, dispatch `itwCredentialsRemoveByType`.
 *
 * Action used to remove credentials from the credentials store only. It is used in
 * the saga that orchestrates the deletion of a credential type.
 */
export const itwCredentialsRemove = createStandardAction(
  "@@internal/ITW_CREDENTIALS_REMOVE"
)<ReadonlyArray<CredentialMetadata>>();

/**
 * Remove all credentials of the specified type. Used to fully clean
 * a credential in all its formats. A separate saga handles the deletion
 * of the associated crypto keys and Wallet cards.
 * It also accepts optional callbacks in the meta to handle success and failure cases
 * after the credentials are stored in the vault.
 */
export const itwCredentialsRemoveByType = createStandardAction(
  "ITW_CREDENTIALS_REMOVE_BY_TYPE"
)<CredentialMetadata["credentialType"], CallbackActionMeta>();

/**
 * Signals that one or more legacy `credential` JWTs have been written to CredentialsVault.
 * The payload contains the IDs of successfully migrated credentials so the reducer can
 * remove only those from `legacyCredentials`; failing ones stay and retry on the next boot.
 */
export const itwCredentialsVaultMigrationComplete = createStandardAction(
  "ITW_CREDENTIALS_VAULT_MIGRATION_COMPLETE"
)<ReadonlyArray<string>>();

/**
 * Atomically removes all credentials of the specified type and stores the new ones.
 * The credential type is derived from the first bundle's metadata.
 * This avoids the race condition of dispatching remove and store as two separate actions.
 * It also accepts optional callbacks in the meta to handle success and failure cases
 * after the credentials are stored in the vault.
 */
export const itwCredentialsReplaceByType = createStandardAction(
  "ITW_CREDENTIALS_REPLACE_BY_TYPE"
)<ReadonlyArray<CredentialBundle>, CallbackActionMeta>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsStoreBundle>
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsRemove>
  | ActionType<typeof itwCredentialsRemoveByType>
  | ActionType<typeof itwCredentialsReplaceByType>
  | ActionType<typeof itwCredentialsVaultMigrationComplete>;
