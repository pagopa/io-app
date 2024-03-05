import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { UIMessageId } from "../../../messages/types";

export const pnActivationUpsert = createAsyncAction(
  "PN_ACTIVATION_UPSERT_REQUEST",
  "PN_ACTIVATION_UPSERT_SUCCESS",
  "PN_ACTIVATION_UPSERT_FAILURE"
)<boolean, boolean, Error>();

export const startPaymentStatusTracking = createAction(
  "MESSAGES_START_TRACKING_PAYMENT_STATUS",
  resolve => (messageId: UIMessageId) => resolve({ messageId })
);
export const cancelPaymentStatusTracking = createAction(
  "MESSAGES_CANCEL_PAYMENT_STATUS_TRACKING"
);

export type PnActions =
  | ActionType<typeof pnActivationUpsert>
  | ActionType<typeof startPaymentStatusTracking>
  | ActionType<typeof cancelPaymentStatusTracking>;
