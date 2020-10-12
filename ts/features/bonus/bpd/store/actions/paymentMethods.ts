import { IUnitTag } from "italia-ts-commons/lib/units";
import { ActionType, createAsyncAction } from "typesafe-actions";

// Temp type to ensure that only HPan from walled are used to query the bpd pm activation
export type HPan = string & IUnitTag<"HPan">;

/**
 * The possible bpd activation status on a payment method
 * - active: bpd is active on the payment method
 * - inactive: bpd is not active on the payment method
 * - notActivable: bpd activate on the payment method by someone else, cannot be activated
 */
type BpdPmActivationStatus = "active" | "inactive" | "notActivable";

/**
 * The response payload to know the actual state of bpd on a payment method
 */
export type BpdPaymentMethodActivation = {
  hPan: HPan;
  activationStatus: BpdPmActivationStatus;
  activationDate?: Date;
  deactivationDate?: Date;
};

/**
 * The failure payload when trying to know the actual state or update bpd on a payment method
 */
type BpdPaymentMethodFailure = {
  hPan: HPan;
  error: Error;
};

type BpdUpdatePaymentMethodActivationPayload = {
  hPan: HPan;
  value: Exclude<BpdPmActivationStatus, "notActivable">;
};

/**
 * The remote request to find out the current activation status of a payment method.
 */
export const bpdPaymentMethodActivation = createAsyncAction(
  "BPD_PAYMENT_METHOD_ACTIVATION_REQUEST",
  "BPD_PAYMENT_METHOD_ACTIVATION_SUCCESS",
  "BPD_PAYMENT_METHOD_ACTIVATION_FAILURE"
)<HPan, BpdPaymentMethodActivation, BpdPaymentMethodFailure>();

/**
 * The remote request to change the bpd activation on a payment method
 */
export const bpdUpdatePaymentMethodActivation = createAsyncAction(
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_REQUEST",
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_SUCCESS",
  "BPD_PAYMENT_METHOD_ACTIVATION_UPDATE_FAILURE"
)<
  BpdUpdatePaymentMethodActivationPayload,
  BpdPaymentMethodActivation,
  BpdPaymentMethodFailure
>();

export type BpdPaymentMethod =
  | ActionType<typeof bpdPaymentMethodActivation>
  | ActionType<typeof bpdUpdatePaymentMethodActivation>;
