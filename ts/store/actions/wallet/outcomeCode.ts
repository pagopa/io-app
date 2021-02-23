/**
 * Action types and action creator related to OutcomeCodeState.
 */
import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

// This action is supposed to be used to update the state with the outcome
// code when the add credit card workflow is finished
export const addCreditCardOutcomeCode = createStandardAction(
  "CREDIT_CARD_PAYMENT_OUTCOME_CODE"
)<Option<string>>();

// This action is supposed to be used to update the state with the outcome
// code when the payment workflow is finished
export const paymentOutcomeCode = createStandardAction("PAYMENT_OUTCOME_CODE")<
  Option<string>
>();

// Bring the state to the initial value
export const resetLastPaymentOutcomeCode = createStandardAction(
  "RESET_LAST_PAYMENT_OUTCOME_CODE"
)();

export type OutcomeCodeActions =
  | ActionType<typeof addCreditCardOutcomeCode>
  | ActionType<typeof paymentOutcomeCode>
  | ActionType<typeof resetLastPaymentOutcomeCode>;
