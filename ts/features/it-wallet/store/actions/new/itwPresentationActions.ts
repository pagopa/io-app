import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../../utils/itwErrorsUtils";

/**
 * Async action which starts the presentation checks.
 */
export const itwPresentationChecks = createAsyncAction(
  "ITW_PRESENTATION_CHECKS_REQUEST",
  "ITW_PRESENTATION_CHECKS_SUCCESS",
  "ITW_PRESETATION_CHECKS_FAILURE"
)<void, void, ItWalletError>();

/**
 * Async action which starts the presentation request.
 */
export const itwPresentation = createAsyncAction(
  "ITW_PRESENTATION_REQUEST",
  "ITW_PRESENTATION_SUCCESS",
  "ITW_PRESENTATION_FAILURE"
)<void, void, ItWalletError>();

export type ItwPresentationChecks =
  | ActionType<typeof itwPresentationChecks>
  | ActionType<typeof itwPresentation>;
