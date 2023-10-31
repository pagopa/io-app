import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Credential } from "@pagopa/io-react-native-wallet";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import { CredentialCatalogDisplay } from "../../../utils/mocks";
import { IssuanceResultData } from "../../reducers/new/itwIssuanceReducer";

export type StartIssuanceFlow = Awaited<
  ReturnType<Credential.Issuance.StartFlow>
>;

// The definition of the credential we are about to request
// It will include data from the Issuer configuration
// For now it's fetched from a static catalog
export type CredentialDefinition = {
  displayData: CredentialCatalogDisplay;
};

export const itwStartIssuanceFlow = createAsyncAction(
  "ITW_START_ISSUANCE_FLOW_REQUEST",
  "ITW_START_ISSUANCE_FLOW_SUCCESS",
  "ITW_START_ISSUANCE_FLOW_FAILURE",
  "ITW_START_ISSUANCE_FLOW_CANCEL"
)<StartIssuanceFlow & CredentialDefinition, void, ItWalletError, void>();

export const itwIssuanceChecks = createAsyncAction(
  "ITW_ISSUANCE_CHECKS_REQUEST",
  "ITW_ISSUANCE_CHECKS_SUCCESS",
  "ITW_ISSUANCE_CHECKS_FAILURE"
)<StartIssuanceFlow, boolean, ItWalletError>();

// When the User confirm to continue the flow right after the start
// YES, THIS IS THE CRED I WANT TO REQUEST
export const itwConfirmIssuance = createStandardAction(
  "ITW_CONFIRM_ISSUANCE"
)<void>();
export const itwCancelIssuance = createStandardAction(
  "ITW_CANCEL_ISSUANCE"
)<void>();

export const itwConfirmStoreCredential = createStandardAction(
  "ITW_CONFIRM_STORE_CREDENTIAL"
)<void>();
export const itwCancelStoreCredential = createStandardAction(
  "ITW_CANCEL_STORE_CREDENTIAL"
)<void>();

export const itwIssuanceUserAuthorization = createAsyncAction(
  "ITW_ISSUANCE_USER_AUTHZ_REQUEST",
  "ITW_ISSUANCE_USER_AUTHZ_SUCCESS",
  "ITW_ISSUANCE_USER_AUTHZ_FAILURE"
)<void, IssuanceResultData, ItWalletError>();

export const itwIssuanceCredential = createAsyncAction(
  "ITW_ISSUANCE_GET_CREDENTIAL_REQUEST",
  "ITW_ISSUANCE_GET_CREDENTIAL_SUCCESS",
  "ITW_ISSUANCE_GET_CREDENTIAL_FAILURE"
)<void, void, ItWalletError>();

export type itwIssuanceActions =
  | ActionType<typeof itwStartIssuanceFlow>
  | ActionType<typeof itwConfirmIssuance>
  | ActionType<typeof itwCancelIssuance>
  | ActionType<typeof itwConfirmStoreCredential>
  | ActionType<typeof itwCancelStoreCredential>
  | ActionType<typeof itwIssuanceUserAuthorization>
  | ActionType<typeof itwIssuanceCredential>
  | ActionType<typeof itwIssuanceChecks>;
