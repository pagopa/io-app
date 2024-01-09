import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { StoredCredential } from "../../utils/itwTypesUtils";

/**
 * Action which adds the PID to the wallet.
 */
export const itwPersistedCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIAL_ADD_PID_REQUEST",
  "ITW_CREDENTIAL_ADD_PID_SUCCESS",
  "ITW_CREDENTIAL_ADD_PID_FAILURE"
)<StoredCredential, StoredCredential, ItWalletError>();

/**
 * Action to add a credential to the wallet.
 */
export const itwPersistedCredentialsAdd = createAsyncAction(
  "ITW_CREDENTIALS_ADD_REQUEST",
  "ITW_CREDENTIALS_ADD_SUCCESS",
  "ITW_CREDENTIALS_ADD_FAILURE"
)<StoredCredential, StoredCredential, ItWalletError>();

/**
 * Type for credentials related actions.
 */
export type ItwPersistedCredentialsActions =
  | ActionType<typeof itwPersistedCredentialsAddPid>
  | ActionType<typeof itwPersistedCredentialsAdd>;
