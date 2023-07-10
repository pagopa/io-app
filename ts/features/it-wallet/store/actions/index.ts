import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import { ItWalletError } from "../../utils/errors/itwErrors";

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
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ActionType<typeof itwActivationStart>
  | ActionType<typeof itwRequirementsRequest>;
