/**
 * Action types and action creator related to the Messages.
 */

import { PaymentData } from "../../../definitions/backend/PaymentData";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import {
  MESSAGE_LOAD_SUCCESS,
  MESSAGES_LOAD_CANCEL,
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  PAYMENT_START
} from "./constants";

export type MessagesLoadRequest = Readonly<{
  type: typeof MESSAGES_LOAD_REQUEST;
}>;

export type MessagesLoadCancel = Readonly<{
  type: typeof MESSAGES_LOAD_CANCEL;
}>;

export type MessagesLoadSuccess = Readonly<{
  type: typeof MESSAGES_LOAD_SUCCESS;
}>;

export type MessagesLoadFailure = Readonly<{
  type: typeof MESSAGES_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type MessageLoadSuccess = Readonly<{
  type: typeof MESSAGE_LOAD_SUCCESS;
  payload: MessageWithContentPO;
}>;

export type StartPayment = Readonly<{
  type: typeof PAYMENT_START;
  payload: PaymentData;
}>;

export type MessagesActions =
  | MessagesLoadRequest
  | MessagesLoadCancel
  | MessagesLoadSuccess
  | MessagesLoadFailure
  | MessageLoadSuccess
  | StartPayment;

// Creators
export const loadMessages = (): MessagesLoadRequest => ({
  type: MESSAGES_LOAD_REQUEST
});

export const loadMessagesCancel = (): MessagesLoadCancel => ({
  type: MESSAGES_LOAD_CANCEL
});

export const loadMessagesSuccess = (): MessagesLoadSuccess => ({
  type: MESSAGES_LOAD_SUCCESS
});

export const loadMessagesFailure = (error: Error): MessagesLoadFailure => ({
  type: MESSAGES_LOAD_FAILURE,
  payload: error,
  error: true
});

export const loadMessageSuccess = (
  message: MessageWithContentPO
): MessageLoadSuccess => ({
  type: MESSAGE_LOAD_SUCCESS,
  payload: message
});

export const startPayment = (paymentData: PaymentData): StartPayment => ({
  type: PAYMENT_START,
  payload: paymentData
});
