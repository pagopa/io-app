import { ActionType, createAsyncAction } from "typesafe-actions";

/**
 * The remote request to find out the current activation status of a payment method.
 */
export const bpdPaymentMethodActivation = createAsyncAction(
  "BPD_PAYMENT_METHOD_ACTIVATION_REQUEST",
  "BPD_PAYMENT_METHOD_ACTIVATION_SUCCESS",
  "BPD_PAYMENT_METHOD_ACTIVATION_FAILURE"
)<string, void, Error>();

/**
 * The remote request to change the bpd activation on a payment method
 */
export const bpdUpdatePaymentMethodActivation = createAsyncAction(
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_REQUEST",
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_SUCCESS",
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_FAILURE"
)<boolean, void, Error>();

export type BpdPaymentMethod =
  | ActionType<typeof bpdPaymentMethodActivation>
  | ActionType<typeof bpdUpdatePaymentMethodActivation>;
