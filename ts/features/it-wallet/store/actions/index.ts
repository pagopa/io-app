import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { PidMockType } from "../../utils/mocks";
import { ItwCieAuthenticationActions } from "./cie";

/**
 * Start ITW activation
 */
export const itwActivationStart = createStandardAction(
  "ITW_ACTIVATION_START"
)<void>();

/**
 * Start ITW requirements check
 */
export const itwRequirementsRequest = createAsyncAction(
  "ITW_REQUIREMENTS_REQUEST",
  "ITW_REQUIREMENTS_SUCCESS",
  "ITW_REQUIREMENTS_FAILURE"
)<void, true, ItWalletError>();

/**
 * Adds an ITW credential, currently only a mocked PID is supported.
 */
export const itwCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIALS_ADD_PID",
  "ITW_CREDENTIALS_ADD_PID_SUCCESS",
  "ITW_REQUIREMENTS_ADD_PID_FAILURE"
)<PidMockType, PidMockType, ItWalletError>();

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ActionType<typeof itwActivationStart>
  | ActionType<typeof itwRequirementsRequest>
  | ActionType<typeof itwCredentialsAddPid>
  | ItwCieAuthenticationActions;
