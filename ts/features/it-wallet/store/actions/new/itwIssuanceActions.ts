import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import {
  IssuanceData,
  IssuanceResultData
} from "../../reducers/new/itwIssuanceReducer";
import { CredentialDefinition, StartIssuanceFlow } from "../../../utils/types";

export const itwIssuanceChecks = createAsyncAction(
  "ITW_ISSUANCE_CHECKS_REQUEST",
  "ITW_ISSUANCE_CHECKS_SUCCESS",
  "ITW_ISSUANCE_CHECKS_FAILURE",
  "ITW_ISSUANCE_CHECKS_CANCEL"
)<StartIssuanceFlow & CredentialDefinition, IssuanceData, ItWalletError>();

export const itwConfirmStoreCredential = createStandardAction(
  "ITW_CONFIRM_STORE_CREDENTIAL"
)<void>();

export const itwIssuanceGetCredential = createAsyncAction(
  "ITW_ISSUANCE_GET_CREDENTIAL_REQUEST",
  "ITW_ISSUANCE_GET_CREDENTIAL_SUCCESS",
  "ITW_ISSUANCE_GET_CREDENTIAL_FAILURE"
)<void, IssuanceResultData, ItWalletError>();

export const itwIssuanceAddCredential = createAsyncAction(
  "ITW_ISSUANCE_GET_CREDENTIAL_REQUEST",
  "ITW_ISSUANCE_GET_CREDENTIAL_SUCCESS",
  "ITW_ISSUANCE_GET_CREDENTIAL_FAILURE"
)<void, void, ItWalletError>();

export type itwIssuanceActions =
  | ActionType<typeof itwConfirmStoreCredential>
  | ActionType<typeof itwIssuanceGetCredential>
  | ActionType<typeof itwIssuanceChecks>;
