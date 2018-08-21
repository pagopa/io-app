/**
 * Action types and action creator related to the Messages.
 */

import { PaymentData } from "../../../definitions/backend/PaymentData";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import {
  MESSAGE_LOAD_FAILURE,
  MESSAGE_LOAD_REQUEST,
  MESSAGE_LOAD_SUCCESS,
  MESSAGES_LOAD_CANCEL,
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  NAVIGATE_TO_MESSAGE_DETAILS,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY
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

export type MessageLoadRequest = Readonly<{
  type: typeof MESSAGE_LOAD_REQUEST;
  payload: string;
}>;

export type MessageLoadSuccess = Readonly<{
  type: typeof MESSAGE_LOAD_SUCCESS;
  payload: MessageWithContentPO;
}>;

export type MessageLoadFailure = Readonly<{
  type: typeof MESSAGE_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type NavigateToMessageDetails = Readonly<{
  type: typeof NAVIGATE_TO_MESSAGE_DETAILS;
  payload: string;
}>;

export type StartPayment = Readonly<{
  type: typeof PAYMENT_REQUEST_TRANSACTION_SUMMARY;
  payload: PaymentData;
}>;

export type MessagesActions =
  | MessagesLoadRequest
  | MessagesLoadCancel
  | MessagesLoadSuccess
  | MessagesLoadFailure
  | MessageLoadSuccess
  | NavigateToMessageDetails
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

export const loadMessage = (id: string): MessageLoadRequest => ({
  type: MESSAGE_LOAD_REQUEST,
  payload: id
});

export const loadMessageSuccess = (
  message: MessageWithContentPO
): MessageLoadSuccess => ({
  type: MESSAGE_LOAD_SUCCESS,
  payload: message
});

export const loadMessageFailure = (error: Error): MessageLoadFailure => ({
  type: MESSAGE_LOAD_FAILURE,
  payload: error,
  error: true
});

export const navigateToMessageDetails = (
  messageId: string
): NavigateToMessageDetails => ({
  type: NAVIGATE_TO_MESSAGE_DETAILS,
  payload: messageId
});

// TODO: PaymentData is not compatible with the
// data required (notice #, fiscal code, amount)
// @https://www.pivotaltracker.com/story/show/158285425
export const startPayment = (paymentData: PaymentData): StartPayment => ({
  type: PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  payload: paymentData
});
