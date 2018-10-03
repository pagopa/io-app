/**
 * Action types and action creator related to the Messages.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentData } from "../../../definitions/backend/PaymentData";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { PAYMENT_REQUEST_TRANSACTION_SUMMARY } from "./constants";

export const loadMessageSuccess = createAction(
  "MESSAGE_LOAD_SUCCESS",
  resolve => (message: MessageWithContentPO) => resolve(message)
);

export const loadMessageFailure = createAction(
  "MESSAGE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export const loadMessageWithRelationsAction = createAction(
  "MESSAGE_WITH_RELATIONS_LOAD_REQUEST",
  resolve => (messageId: string) => resolve(messageId)
);

export const loadMessageWithRelationsSuccessAction = createStandardAction(
  "MESSAGE_WITH_RELATIONS_LOAD_SUCCESS"
)();

export const loadMessageWithRelationsFailureAction = createAction(
  "MESSAGE_WITH_RELATIONS_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export const loadMessagesRequest = createStandardAction(
  "MESSAGES_LOAD_REQUEST"
)();

export const loadMessagesCancel = createStandardAction(
  "MESSAGES_LOAD_CANCEL"
)();

export const loadMessagesSuccess = createStandardAction(
  "MESSAGES_LOAD_SUCCESS"
)();

export const loadMessagesFailure = createAction(
  "MESSAGES_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export const navigateToMessageDetails = createAction(
  "NAVIGATE_TO_MESSAGE_DETAILS",
  resolve => (messageId: string) => resolve(messageId)
);

export const startPayment = createAction(
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  resolve => (paymentData: PaymentData) => resolve(paymentData)
);

export type MessagesActions =
  | ActionType<typeof loadMessageSuccess>
  | ActionType<typeof loadMessageFailure>
  | ActionType<typeof loadMessageWithRelationsAction>
  | ActionType<typeof loadMessageWithRelationsSuccessAction>
  | ActionType<typeof loadMessageWithRelationsFailureAction>
  | ActionType<typeof loadMessagesRequest>
  | ActionType<typeof loadMessagesCancel>
  | ActionType<typeof loadMessagesSuccess>
  | ActionType<typeof loadMessagesFailure>
  | ActionType<typeof navigateToMessageDetails>
  | ActionType<typeof startPayment>;
