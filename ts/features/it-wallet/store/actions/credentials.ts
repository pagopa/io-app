import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { VerifyResult } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { ItWalletError } from "../../utils/errors/itwErrors";

/**
 * Type for the itwPid action success payload.
 */
type ItwCredentialsPidSuccessType = {
  pid: PidResponse;
  decodedPid: VerifyResult;
};

/**
 * Action which requests a PID issuing.
 */
export const itwPid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<void, ItwCredentialsPidSuccessType, ItWalletError>();

/**
 * Action which adds the PID to the wallet.
 */
/* export const itwCredentialsAddPid = createStandardAction(
  "ITW_CREDENTIAL_ADD_PID"
)<PidResponse>(); */
export const itwCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIAL_ADD_PID_REQUEST",
  "ITW_CREDENTIAL_ADD_PID_SUCCESS",
  "ITW_CREDENTIAL_ADD_PID_FAILURE"
)<PidResponse, PidResponse, void>();

/**
 * Type for credentials related actions.
 */
export type itwCredentialsActions =
  | ActionType<typeof itwPid>
  | ActionType<typeof itwCredentialsAddPid>;
