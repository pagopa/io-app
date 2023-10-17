import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../../utils/errors/itwErrors";

/**
 * Async action which starts the presentation checks.
 */
export const itwPresentationChecks = createAsyncAction(
  "ITW_PRESENTATION_CHECKS_REQUEST",
  "ITW_PRESENTATION_CHECKS_SUCCESS",
  "ITW_PRESETATION_CHECKS_FAILURE"
)<void, void, ItWalletError>();

export type ItwPresentationChecks = ActionType<typeof itwPresentationChecks>;
