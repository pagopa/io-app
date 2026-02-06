import { ActionType, createStandardAction } from "typesafe-actions";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";

/**
 * This actions stores one or multiple credentials using the CredentialBundle payload:
 * the metadata is stored in the Redux store and the raw credential is stored in the
 * secure storage.
 *
 * Credentials are stored using the credential ID as key, the new credential completely
 * overwrites the previous one.
 */
export const itwCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<ReadonlyArray<CredentialMetadata>>();

/**
 * @internal To properly remove a credential, dispatch `itwCredentialsRemoveByType`.
 *
 * Action used to remove credentials from the credentials store only. It is used in
 * the saga that orchestrates the deletion of a credential type.
 */
export const itwCredentialsRemove = createStandardAction(
  "ITW_CREDENTIALS_REMOVE"
)<ReadonlyArray<CredentialMetadata>>();

/**
 * Remove all credentials of the specified type. Used to fully clean
 * a credential in all its formats. A separate saga handles the deletion
 * of the associated crypto keys and Wallet cards.
 */
export const itwCredentialsRemoveByType = createStandardAction(
  "ITW_CREDENTIALS_REMOVE_BY_TYPE"
)<CredentialMetadata["credentialType"]>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsRemove>
  | ActionType<typeof itwCredentialsRemoveByType>;
