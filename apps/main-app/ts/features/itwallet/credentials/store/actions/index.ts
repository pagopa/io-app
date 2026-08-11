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
 * This action stores one or multiple credentials using the CredentialMetadata payload.
 * The store keeps a single metadata per `credentialId`, so storing overwrites any previous
 * value for that id. Batch copies are collapsed into one metadata (carrying `keyTags`) before
 * dispatch, so this action never appends multiple instances of the same credential.
 */
export const itwCredentialsStore = createStandardAction(
  "@@internal/ITW_CREDENTIALS_STORE"
)<ReadonlyArray<CredentialMetadata>>();

/**
 * This action stores one or multiple credentials using the CredentialBundle payload.
 * The handling saga writes each credential's raw bytes to the vault and collapses batch copies
 * into a single metadata (carrying `keyTags`) per `credentialId` before dispatching
 * `itwCredentialsStore`, which keeps one metadata per `credentialId`.
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
 * Consumes one presented copy of a batch-issued credential (e.g. Proof of Age) after a
 * successful presentation, as required by the IT-Wallet spec: the consumed copy's vault entry
 * and crypto key are deleted and the credential's `keyTags` are reduced by one, decreasing the
 * batch count. If the consumed copy was the last one, the credential is fully removed instead
 * (same effect as `itwCredentialsRemoveByType` for that credential).
 * Has no effect on non-batch credentials.
 */
export const itwCredentialsConsumeInstance = createStandardAction(
  "ITW_CREDENTIALS_CONSUME_INSTANCE"
)<
  ReadonlyArray<{
    credentialId: CredentialMetadata["credentialId"];
    keyTag: string;
  }>
>();

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

/**
 * Refresh the status of a credential, requesting a status assertion
 * to the Issuer and updating the stored credential with the result.
 */
export const itwCredentialsRefreshStatusByType = createStandardAction(
  "ITW_CREDENTIALS_REFRESH_STATUS_BY_TYPE"
)<string>();

/**
 * Requests a silent renewal of a one-time-use credential batch that is down to its refill
 * threshold. The handling saga issues a new batch headlessly and swaps it with the residual pool,
 * never interrupting the user and giving up silently on failure.
 *
 * `trigger` records who asked for it: `presentation` right after a copy was consumed, `app-start`
 * when the boot-time check found the pool under threshold.
 */
export const itwCredentialsBatchRefillRequest = createStandardAction(
  "ITW_CREDENTIALS_BATCH_REFILL_REQUEST"
)<{
  credentialType: CredentialMetadata["credentialType"];
  trigger: "app-start" | "presentation";
}>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsBatchRefillRequest>
  | ActionType<typeof itwCredentialsConsumeInstance>
  | ActionType<typeof itwCredentialsRefreshStatusByType>
  | ActionType<typeof itwCredentialsRemove>
  | ActionType<typeof itwCredentialsRemoveByType>
  | ActionType<typeof itwCredentialsReplaceByType>
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsStoreBundle>
  | ActionType<typeof itwCredentialsVaultMigrationComplete>;
