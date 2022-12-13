/**
 * Action types and action creator related to OutcomeCodeState.
 */
import * as O from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";
import { PaymentMethodType } from "./payment";

// This action is supposed to be used to update the state with the outcome
// code when the add credit card workflow is finished
export const addCreditCardOutcomeCode = createStandardAction(
  "CREDIT_CARD_PAYMENT_OUTCOME_CODE"
)<O.Option<string>>();

// This action is supposed to be used to update the state with the outcome
// code when the payment workflow is finished. It brings also the payment method type used to do the payment
export const paymentOutcomeCode = createStandardAction("PAYMENT_OUTCOME_CODE")<{
  outcome: O.Option<string>;
  paymentMethodType: PaymentMethodType;
}>();

// Bring the state to the initial value
export const resetLastPaymentOutcomeCode = createStandardAction(
  "RESET_LAST_PAYMENT_OUTCOME_CODE"
)();

export type OutcomeCodeActions =
  | ActionType<typeof addCreditCardOutcomeCode>
  | ActionType<typeof paymentOutcomeCode>
  | ActionType<typeof resetLastPaymentOutcomeCode>;
