/**
 * Action types and action creator related to OutcomeCodeState.
 */
import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

export const paymentOutcomeCode = createStandardAction("PAYMENT_OUTCOME_CODE")<
  Option<string>
>();

// Bring the state to the initial value
export const resetLastPaymentOutcomeCode = createStandardAction(
  "RESET_LAST_PAYMENT_OUTCOME_CODE"
)();

export type OutcomeCodeActions =
  | ActionType<typeof paymentOutcomeCode>
  | ActionType<typeof resetLastPaymentOutcomeCode>;
