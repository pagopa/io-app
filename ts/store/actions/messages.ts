/**
 * Action types and action creator related to the Messages.
 */
import { PaymentData } from "../../../definitions/backend/PaymentData";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import {
  MESSAGE_LOAD_FAILURE,
  MESSAGE_LOAD_SUCCESS,
  MESSAGE_WITH_RELATIONS_LOAD_FAILURE,
  MESSAGE_WITH_RELATIONS_LOAD_REQUEST,
  MESSAGE_WITH_RELATIONS_LOAD_SUCCESS,
  MESSAGES_LOAD_CANCEL,
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  NAVIGATE_TO_MESSAGE_DETAILS,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY
} from "./constants";

type MessageLoadSuccess = Readonly<{
  type: typeof MESSAGE_LOAD_SUCCESS;
  payload: MessageWithContentPO;
}>;

type MessageLoadFailure = Readonly<{
  type: typeof MESSAGE_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type MessageWithRelationsLoadRequest = Readonly<{
  type: typeof MESSAGE_WITH_RELATIONS_LOAD_REQUEST;
  // The messageId
  payload: string;
}>;

export type MessageWithRelationsLoadSuccess = Readonly<{
  type: typeof MESSAGE_WITH_RELATIONS_LOAD_SUCCESS;
}>;

export type MessageWithRelationsLoadFailure = Readonly<{
  type: typeof MESSAGE_WITH_RELATIONS_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type MessagesLoadRequest = Readonly<{
  type: typeof MESSAGES_LOAD_REQUEST;
}>;

export type MessagesLoadCancel = Readonly<{
  type: typeof MESSAGES_LOAD_CANCEL;
}>;

type MessagesLoadSuccess = Readonly<{
  type: typeof MESSAGES_LOAD_SUCCESS;
}>;

type MessagesLoadFailure = Readonly<{
  type: typeof MESSAGES_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type NavigateToMessageDetails = Readonly<{
  type: typeof NAVIGATE_TO_MESSAGE_DETAILS;
  payload: string;
}>;

type StartPayment = Readonly<{
  type: typeof PAYMENT_REQUEST_TRANSACTION_SUMMARY;
  payload: PaymentData;
}>;

export type MessagesActions =
  | MessageLoadSuccess
  | MessageWithRelationsLoadRequest
  | MessageWithRelationsLoadSuccess
  | MessageWithRelationsLoadFailure
  | MessagesLoadRequest
  | MessagesLoadCancel
  | MessagesLoadSuccess
  | MessagesLoadFailure
  | StartPayment;

// Creators
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

export const loadMessageWithRelationsAction = (
  messageId: string
): MessageWithRelationsLoadRequest => ({
  type: MESSAGE_WITH_RELATIONS_LOAD_REQUEST,
  payload: messageId
});

export const loadMessageWithRelationsSuccessAction = (): MessageWithRelationsLoadSuccess => ({
  type: MESSAGE_WITH_RELATIONS_LOAD_SUCCESS
});

export const loadMessageWithRelationsFailureAction = (
  error: Error
): MessageWithRelationsLoadFailure => ({
  type: MESSAGE_WITH_RELATIONS_LOAD_FAILURE,
  payload: error,
  error: true
});

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

export const navigateToMessageDetails = (
  messageId: string
): NavigateToMessageDetails => ({
  type: NAVIGATE_TO_MESSAGE_DETAILS,
  payload: messageId
});
