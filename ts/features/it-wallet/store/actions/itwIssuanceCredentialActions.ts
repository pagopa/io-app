import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { ItwIssuanceCredentialData } from "../reducers/itwIssuanceCredentialReducer";
import {
  CredentialDefinition,
  StartIssuanceFlow,
  StoredCredential
} from "../../utils/itwTypesUtils";

/**
 * Actions for the issuance checks flow.
 */
export const itwIssuanceCredentialChecks = createAsyncAction(
  "ITW_ISSUANCE_CREDENTIAL_CHECKS_REQUEST",
  "ITW_ISSUANCE_CREDENTIAL_CHECKS_SUCCESS",
  "ITW_ISSUANCE_CREDENTIAL_CHECKS_FAILURE"
)<
  StartIssuanceFlow & CredentialDefinition,
  ItwIssuanceCredentialData,
  ItWalletError
>();

/**
 * Actions for the issuance flow.
 */
export const itwIssuanceCredential = createAsyncAction(
  "ITW_ISSUANCE_CREDENTIAL_REQUEST",
  "ITW_ISSUANCE_CREDENTIAL_SUCCESS",
  "ITW_ISSUANCE_CREDENTIAL_FAILURE"
)<void, StoredCredential, ItWalletError>();

/**
 * Action which is dispatched when the user confirms the storage of the credential.
 */
export const itwIssuanceCredentialStore = createStandardAction(
  "ITW_CONFIRM_STORE_CREDENTIAL"
)<void>();

export type ItwIssuanceCredentialActions =
  | ActionType<typeof itwIssuanceCredentialStore>
  | ActionType<typeof itwIssuanceCredential>
  | ActionType<typeof itwIssuanceCredentialChecks>;
