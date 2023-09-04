import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { ActionType, createAsyncAction } from "typesafe-actions";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import * as O from "fp-ts/lib/Option";
import { PidIssuerEntityConfiguration } from "@pagopa/io-react-native-wallet/lib/typescript/pid/metadata";
import { ItWalletError } from "../../utils/errors/itwErrors";

/**
 * Action which requests a PID issuing.
 */
export const itwPid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<
  PidData,
  { pid: PidResponse; issuer: PidIssuerEntityConfiguration },
  ItWalletError
>();

/**
 * Action which decodes a PID.
 */
export const itwDecodePid = createAsyncAction(
  "ITW_CREDENTIAL_DECODE_PID_REQUEST",
  "ITW_CREDENTIAL_DECODE_PID_SUCCESS",
  "ITW_CREDENTIAL_DECODE_PID_FAILURE"
)<O.Option<PidResponse>, O.Option<PidWithToken>, ItWalletError>();

/**
 * Action which adds the PID to the wallet.
 */
export const itwCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIAL_ADD_PID_REQUEST",
  "ITW_CREDENTIAL_ADD_PID_SUCCESS",
  "ITW_CREDENTIAL_ADD_PID_FAILURE"
)<O.Option<PidResponse>, PidResponse, ItWalletError>();

/**
 * Type for credentials related actions.
 */
export type ItwCredentialsActions =
  | ActionType<typeof itwPid>
  | ActionType<typeof itwCredentialsAddPid>
  | ActionType<typeof itwDecodePid>;
