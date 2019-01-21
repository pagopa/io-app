/**
 * Action types and action creator related to the Messages.
 */

import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";

export const loadMessage = createAsyncAction(
  "MESSAGE_LOAD_REQUEST",
  "MESSAGE_LOAD_SUCCESS",
  "MESSAGE_LOAD_FAILURE"
)<
  CreatedMessageWithoutContent,
  MessageWithContentPO,
  { id: string; error: string | undefined }
>();

export const loadMessageWithRelations = createAsyncAction(
  "MESSAGE_WITH_RELATIONS_LOAD_REQUEST",
  "MESSAGE_WITH_RELATIONS_LOAD_SUCCESS",
  "MESSAGE_WITH_RELATIONS_LOAD_FAILURE"
)<CreatedMessageWithoutContent, void, Error>();

export const loadMessages = createAsyncAction(
  "MESSAGES_LOAD_REQUEST",
  "MESSAGES_LOAD_SUCCESS",
  "MESSAGES_LOAD_FAILURE"
)<void, ReadonlyArray<string>, string>();

export const loadMessagesCancel = createStandardAction(
  "MESSAGES_LOAD_CANCEL"
)();

export const setMessageReadState = createAction(
  "MESSAGES_SET_READ",
  resolve => (id: string, read: boolean) => resolve({ id, read }, { id, read })
);

export type MessagesActions =
  | ActionType<typeof loadMessage>
  | ActionType<typeof loadMessageWithRelations>
  | ActionType<typeof loadMessages>
  | ActionType<typeof loadMessagesCancel>
  | ActionType<typeof setMessageReadState>;
