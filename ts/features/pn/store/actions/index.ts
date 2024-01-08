import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { UIMessageId } from "../../../messages/types";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";

export type UpdatePaymentForMessageRequest = {
  messageId: UIMessageId;
  paymentId: string;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: UIMessageId;
  paymentId: string;
  paymentData: PaymentRequestsGetResponse;
};

export type UpdatePaymentForMessageFailure = {
  messageId: UIMessageId;
  paymentId: string;
  details: Detail_v2Enum;
};

export type UpdatePaymentForMessageCancel =
  ReadonlyArray<UpdatePaymentForMessageRequest>;

export const pnActivationUpsert = createAsyncAction(
  "PN_ACTIVATION_UPSERT_REQUEST",
  "PN_ACTIVATION_UPSERT_SUCCESS",
  "PN_ACTIVATION_UPSERT_FAILURE"
)<boolean, boolean, Error>();

export const updatePaymentForMessage = createAsyncAction(
  "UPDATE_PAYMENT_FOR_MESSAGE_REQUEST",
  "UPDATE_PAYMENT_FOR_MESSAGE_SUCCESS",
  "UPDATE_PAYMENT_FOR_MESSAGE_FAILURE",
  "UPDATE_PAYMENT_FOR_MESSAGE_CANCEL"
)<
  UpdatePaymentForMessageRequest,
  UpdatePaymentForMessageSuccess,
  UpdatePaymentForMessageFailure,
  UpdatePaymentForMessageCancel
>();

export const cancelQueuedPaymentUpdates = createAction(
  "CANCEL_QUEUED_PAYMENT_UPDATES"
);

export const setSelectedPayment = createAction(
  "PN_SET_SELECTED_PAYMENT",
  resolve => (paymentId: string) => resolve({ paymentId })
);

export const clearSelectedPayment = createAction("PN_CLEAR_SELECTED_PAYMENT");

export const startPaymentStatusTracking = createAction(
  "PN_START_TRACKING_PAYMENT_STATUS",
  resolve => (messageId: UIMessageId) => resolve({ messageId })
);
export const cancelPaymentStatusTracking = createAction(
  "PN_CANCEL_PAYMENT_STATUS_TRACKING"
);

export type PnActions =
  | ActionType<typeof pnActivationUpsert>
  | ActionType<typeof updatePaymentForMessage>
  | ActionType<typeof cancelQueuedPaymentUpdates>
  | ActionType<typeof setSelectedPayment>
  | ActionType<typeof clearSelectedPayment>
  | ActionType<typeof startPaymentStatusTracking>
  | ActionType<typeof cancelPaymentStatusTracking>;
