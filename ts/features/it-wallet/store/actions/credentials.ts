import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { ActionType, createAsyncAction } from "typesafe-actions";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { ItWalletError } from "../../utils/errors/itwErrors";

/**
 * Type for the itwPid action success payload.
 */
type ItwCredentialsPidSuccessType = {
  pid: PidResponse;
  decodedPid: PidWithToken;
};

/**
 * Action which requests a PID issuing.
 */
export const itwPid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<PidData, ItwCredentialsPidSuccessType, ItWalletError>();

/**
 * Action which adds the PID to the wallet.
 */
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
