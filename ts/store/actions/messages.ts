/**
 * Action types and action creator related to the Messages.
 */

import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";

import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";

export const loadMessage = createAsyncAction(
  "MESSAGE_LOAD_REQUEST",
  "MESSAGE_LOAD_SUCCESS",
  "MESSAGE_LOAD_FAILURE"
)<
  CreatedMessageWithoutContent,
  CreatedMessageWithContentAndAttachments,
  { id: string; error: Error }
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
)<void, ReadonlyArray<string>, Error>();

export const loadMessagesCancel = createStandardAction(
  "MESSAGES_LOAD_CANCEL"
)();

export const loadMessagesCancelled = createStandardAction(
  "MESSAGES_LOAD_CANCELLED"
)();

export const removeMessages = createStandardAction("MESSAGES_REMOVE")<
  ReadonlyArray<string>
>();

export const setMessageReadState = createAction(
  "MESSAGES_SET_READ",
  resolve => (id: string, read: boolean) => resolve({ id, read }, { id, read })
);

export const setMessagesArchivedState = createAction(
  "MESSAGES_SET_ARCHIVED",
  resolve => (ids: ReadonlyArray<string>, archived: boolean) =>
    resolve({ ids, archived })
);

export type MessagesActions =
  | ActionType<typeof loadMessage>
  | ActionType<typeof loadMessageWithRelations>
  | ActionType<typeof loadMessages>
  | ActionType<typeof loadMessagesCancel>
  | ActionType<typeof removeMessages>
  | ActionType<typeof setMessageReadState>
  | ActionType<typeof setMessagesArchivedState>;
