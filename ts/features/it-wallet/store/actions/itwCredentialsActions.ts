import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import * as O from "fp-ts/lib/Option";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { CredentialCatalogItem } from "./../../utils/mocks";

/**
 * Action which requests a PID issuing.
 */
export const itwPid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<PidData, PidResponse, ItWalletError>();

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
 * Action which adds the PID to the wallet.
 */
export const itwCredentialsAddCredential = createStandardAction(
  "ITW_CREDENTIAL_ADD_CREDENTIAL"
)<CredentialCatalogItem>();

/**
 * Action to check if the citizen can add a credential to the wallet.
 */
export const itwCredentialsChecks = createAsyncAction(
  "ITW_CREDENTIALS_CHECKS_REQUEST",
  "ITW_CREDENTIALS_CHECKS_SUCCESS",
  "ITW_CREDENTIALS_CHECKS_FAILURE"
)<CredentialCatalogItem, CredentialCatalogItem, ItWalletError>();

/**
 * Type for credentials related actions.
 */
export type ItwCredentialsActions =
  | ActionType<typeof itwPid>
  | ActionType<typeof itwCredentialsAddPid>
  | ActionType<typeof itwDecodePid>
  | ActionType<typeof itwCredentialsChecks>
  | ActionType<typeof itwCredentialsAddCredential>;
