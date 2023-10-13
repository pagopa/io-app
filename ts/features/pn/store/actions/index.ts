import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { RptId } from "../../../../../definitions/backend/RptId";

export type UpdatePaymentForMessageRequest = {
  messageId: UIMessageId;
  paymentId: RptId;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: UIMessageId;
  paymentId: RptId;
  paymentData: PaymentRequestsGetResponse;
};

export type UpdatePaymentForMessageFailure = {
  messageId: UIMessageId;
  paymentId: RptId;
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

export type PnActions =
  | ActionType<typeof pnActivationUpsert>
  | ActionType<typeof updatePaymentForMessage>
  | ActionType<typeof cancelQueuedPaymentUpdates>;
