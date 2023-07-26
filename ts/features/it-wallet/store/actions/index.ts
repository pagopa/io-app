import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { ItwCieAuthenticationActions } from "./cie";

/**
 * Start ITW activation
 */
export const itwActivationStart = createStandardAction(
  "ITW_ACTIVATION_START"
)<void>();

/**
 * Start ITW wallet instance attestation request.
 */
export const itwWiaRequest = createAsyncAction(
  "ITW_REQUIREMENTS_REQUEST",
  "ITW_REQUIREMENTS_SUCCESS",
  "ITW_REQUIREMENTS_FAILURE"
)<void, string, ItWalletError>();

/**
 * Adds an ITW credential, currently only a mocked PID is supported.
 */
export const itwCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIALS_ADD_PID",
  "ITW_CREDENTIALS_ADD_PID_SUCCESS",
  "ITW_REQUIREMENTS_ADD_PID_FAILURE"
)<void, PidResponse, ItWalletError>();

export const itwLifecycleOperational = createStandardAction(
  "ITW_LIFECYCLE_OPERATIONAL"
)<void>();

export const itwLifecycleValid = createStandardAction(
  "ITW_LIFECYCLE_VALID"
)<void>();

export const itwLifecycleDeactivated = createStandardAction(
  "ITW_LIFECYCLE_DEACTIVATED"
)<void>();

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ActionType<typeof itwActivationStart>
  | ActionType<typeof itwWiaRequest>
  | ActionType<typeof itwCredentialsAddPid>
  | ActionType<typeof itwLifecycleOperational>
  | ActionType<typeof itwLifecycleValid>
  | ActionType<typeof itwLifecycleDeactivated>
  | ItwCieAuthenticationActions;
