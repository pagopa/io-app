import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";

/**
 * Async action which starts the presentation checks.
 */
export const itwPrRemoteCredentialInit = createAsyncAction(
  "ITW_PR_REMOTE_CREDENTIAL_INIT_REQUEST",
  "ITW_PR_REMOTE_CREDENTIAL_INIT_SUCCESS",
  "ITW_PR_REMOTE_CREDENTIAL_INIT_FAILURE"
)<void, void, ItWalletError>();

/**
 * Async action which starts the presentation request.
 */
export const itwPrRemoteCredential = createAsyncAction(
  "ITW_PR_REMOTE_CREDENTIAL_REQUEST",
  "ITW_PR_REMOTE_CREDENTIAL_SUCCESS",
  "ITW_PR_REMOTE_CREDENTIAL_FAILURE"
)<void, void, ItWalletError>();

export type itwPrRemoteCredentialInit =
  | ActionType<typeof itwPrRemoteCredentialInit>
  | ActionType<typeof itwPrRemoteCredential>;
