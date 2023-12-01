import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";

/**
 * Start ITW wallet instance attestation request.
 */
export const itwWiaRequest = createAsyncAction(
  "ITW_REQUIREMENTS_REQUEST",
  "ITW_REQUIREMENTS_SUCCESS",
  "ITW_REQUIREMENTS_FAILURE"
)<void, string, ItWalletError>();

/**
 * Type for WIA related actions.
 */
export type ItwWiaActions = ActionType<typeof itwWiaRequest>;
