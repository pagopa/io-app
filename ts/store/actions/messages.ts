/**
 * Action types and action creator related to the Messages.
 */

import { NormalizedMessagesResponse } from "../../sagas/messages";
import {
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS
} from "./constants";

export type MessageLoadRequest = Readonly<{
  type: typeof MESSAGES_LOAD_REQUEST;
}>;

export type MessageLoadSuccess = Readonly<{
  type: typeof MESSAGES_LOAD_SUCCESS;
  payload: NormalizedMessagesResponse;
}>;

export type MessageLoadFailure = Readonly<{
  type: typeof MESSAGES_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type MessagesActions =
  | MessageLoadRequest
  | MessageLoadSuccess
  | MessageLoadFailure;

// Creators
export const loadMessages = (): MessageLoadRequest => ({
  type: MESSAGES_LOAD_REQUEST
});

export const loadMessagesSuccess = (
  messages: NormalizedMessagesResponse
): MessageLoadSuccess => ({
  type: MESSAGES_LOAD_SUCCESS,
  payload: messages
});

export const loadMessagesFailure = (error: Error): MessageLoadFailure => ({
  type: MESSAGES_LOAD_FAILURE,
  payload: error,
  error: true
});
