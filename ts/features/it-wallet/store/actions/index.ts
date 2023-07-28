import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { itwCredentialsActions } from "./credentials";
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
 * Actions which sets the wallet lifecycle status to operational.
 */
export const itwLifecycleOperational = createStandardAction(
  "ITW_LIFECYCLE_OPERATIONAL"
)<void>();

/**
 * Actions which sets the wallet lifecycle status to valid.
 */
export const itwLifecycleValid = createStandardAction(
  "ITW_LIFECYCLE_VALID"
)<void>();

/**
 * Actions which sets the wallet lifecycle status to deactivated.
 */
export const itwLifecycleDeactivated = createStandardAction(
  "ITW_LIFECYCLE_DEACTIVATED"
)<void>();

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ActionType<typeof itwActivationStart>
  | ActionType<typeof itwWiaRequest>
  | ActionType<typeof itwLifecycleOperational>
  | ActionType<typeof itwLifecycleValid>
  | ActionType<typeof itwLifecycleDeactivated>
  | itwCredentialsActions
  | ItwCieAuthenticationActions;
