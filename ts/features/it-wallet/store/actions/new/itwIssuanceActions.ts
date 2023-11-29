import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ItWalletError } from "../../../utils/itwErrorsUtils";
import { IssuanceData } from "../../reducers/new/itwIssuanceReducer";
import { CredentialDefinition, StartIssuanceFlow } from "../../../utils/types";
import { StoredCredential } from "../../reducers/itwCredentialsReducer";

/**
 * Actions for the issuance checks flow.
 */
export const itwIssuanceChecks = createAsyncAction(
  "ITW_ISSUANCE_CHECKS_REQUEST",
  "ITW_ISSUANCE_CHECKS_SUCCESS",
  "ITW_ISSUANCE_CHECKS_FAILURE",
  "ITW_ISSUANCE_CHECKS_CANCEL"
)<StartIssuanceFlow & CredentialDefinition, IssuanceData, ItWalletError>();

/**
 * Actions for the issuance flow.
 */
export const itwIssuanceGetCredential = createAsyncAction(
  "ITW_ISSUANCE_GET_CREDENTIAL_REQUEST",
  "ITW_ISSUANCE_GET_CREDENTIAL_SUCCESS",
  "ITW_ISSUANCE_GET_CREDENTIAL_FAILURE"
)<void, StoredCredential, ItWalletError>();

/**
 * Action which is dispatched when the user confirms the storage of the credential.
 */
export const itwConfirmStoreCredential = createStandardAction(
  "ITW_CONFIRM_STORE_CREDENTIAL"
)<void>();

export type itwIssuanceActions =
  | ActionType<typeof itwConfirmStoreCredential>
  | ActionType<typeof itwIssuanceGetCredential>
  | ActionType<typeof itwIssuanceChecks>;
