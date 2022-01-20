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
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../reducers/entities/messages/types";
import { Cursor } from "../reducers/entities/messages/allPaginated";
import { MessageCategory } from "../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../definitions/backend/MessageCategoryPayment";

/**
 * Load a single message's details given its ID
 */
export const loadMessageDetails = createAsyncAction(
  "MESSAGE_DETAILS_LOAD_REQUEST",
  "MESSAGE_DETAILS_LOAD_SUCCESS",
  "MESSAGE_DETAILS_LOAD_FAILURE"
)<{ id: UIMessageId }, UIMessageDetails, { id: string; error: Error }>();

/**
 * Load a single message's details given its content
 * @deprecated use loadMessageDetails instead
 */
export const DEPRECATED_loadMessage = createAsyncAction(
  "MESSAGE_LOAD_REQUEST",
  "MESSAGE_LOAD_SUCCESS",
  "MESSAGE_LOAD_FAILURE"
)<
  CreatedMessageWithoutContent,
  CreatedMessageWithContentAndAttachments,
  { id: string; error: Error }
>();

/**
 * Load a single message's details given its ID, and the sender service
 * if needed.
 */
export const loadMessageWithRelations = createAsyncAction(
  "MESSAGE_WITH_RELATIONS_LOAD_REQUEST",
  "MESSAGE_WITH_RELATIONS_LOAD_SUCCESS",
  "MESSAGE_WITH_RELATIONS_LOAD_FAILURE"
)<CreatedMessageWithoutContent, void, Error>();

export type LoadMessagesRequestPayload = {
  pageSize: number;
  cursor?: Cursor;
};

type PaginatedMessagesSuccessPayload = {
  messages: ReadonlyArray<UIMessage>;
};

// The data is appended to the state
export type NextPageMessagesSuccessPayload = PaginatedMessagesSuccessPayload & {
  pagination: { next?: string };
};
export const loadNextPageMessages = createAsyncAction(
  "MESSAGES_LOAD_NEXT_PAGE_REQUEST",
  "MESSAGES_LOAD_NEXT_PAGE_SUCCESS",
  "MESSAGES_LOAD_NEXT_PAGE_FAILURE"
)<LoadMessagesRequestPayload, NextPageMessagesSuccessPayload, Error>();

// The data is prepended to the state
export type PreviousPageMessagesSuccessPayload =
  PaginatedMessagesSuccessPayload & {
    pagination: { previous?: string };
  };
export const loadPreviousPageMessages = createAsyncAction(
  "MESSAGES_LOAD_PREVIOUS_PAGE_REQUEST",
  "MESSAGES_LOAD_PREVIOUS_PAGE_SUCCESS",
  "MESSAGES_LOAD_PREVIOUS_PAGE_FAILURE"
)<LoadMessagesRequestPayload, PreviousPageMessagesSuccessPayload, Error>();

// Forces a refresh of the internal state
export type ReloadMessagesPayload = PaginatedMessagesSuccessPayload & {
  pagination: { previous?: string; next?: string };
};
export const reloadAllMessages = createAsyncAction(
  "MESSAGES_RELOAD_REQUEST",
  "MESSAGES_RELOAD_SUCCESS",
  "MESSAGES_RELOAD_FAILURE"
)<Pick<LoadMessagesRequestPayload, "pageSize">, ReloadMessagesPayload, Error>();

/**
 *  @deprecated Please use actions with pagination instead
 */
export const DEPRECATED_loadMessages = createAsyncAction(
  "MESSAGES_LOAD_REQUEST",
  "MESSAGES_LOAD_SUCCESS",
  "MESSAGES_LOAD_FAILURE"
)<void, ReadonlyArray<string>, Error>();

export const removeMessages =
  createStandardAction("MESSAGES_REMOVE")<ReadonlyArray<string>>();

export type MessageReadType =
  | Extract<MessageCategory["tag"], TagEnum.PAYMENT>
  | "unknown";
export const setMessageReadState = createAction(
  "MESSAGES_SET_READ",
  resolve => (id: string, read: boolean, messageType: MessageReadType) =>
    resolve({ id, read, messageType }, { id, read })
);

export const setMessagesArchivedState = createAction(
  "MESSAGES_SET_ARCHIVED",
  resolve => (ids: ReadonlyArray<string>, archived: boolean) =>
    resolve({ ids, archived })
);

export type MessagesActions =
  | ActionType<typeof DEPRECATED_loadMessage>
  | ActionType<typeof loadMessageWithRelations>
  | ActionType<typeof reloadAllMessages>
  | ActionType<typeof loadNextPageMessages>
  | ActionType<typeof loadPreviousPageMessages>
  | ActionType<typeof loadMessageDetails>
  | ActionType<typeof DEPRECATED_loadMessages>
  | ActionType<typeof removeMessages>
  | ActionType<typeof setMessageReadState>
  | ActionType<typeof setMessagesArchivedState>;
