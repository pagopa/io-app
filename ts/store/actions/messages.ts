/**
 * Action types and action creator related to the Messages.
 */
import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
import {
  MESSAGE_LOAD_SUCCESS,
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS
} from "./constants";

export type MessagesLoadRequest = Readonly<{
  type: typeof MESSAGES_LOAD_REQUEST;
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
  payload: MessageWithContent;
}>;

export type MessagesActions =
  | MessagesLoadRequest
  | MessagesLoadSuccess
  | MessagesLoadFailure
  | MessageLoadSuccess;

// Creators
export const loadMessages = (): MessagesLoadRequest => ({
  type: MESSAGES_LOAD_REQUEST
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
  message: MessageWithContent
): MessageLoadSuccess => ({
  type: MESSAGE_LOAD_SUCCESS,
  payload: message
});
