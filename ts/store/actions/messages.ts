/**
 * Action types and action creator related to the Messages.
 */

import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import {
  UIMessage,
  UIMessageDetails,
  UIMessageId,
  UIAttachment
} from "../reducers/entities/messages/types";
import { Cursor } from "../reducers/entities/messages/allPaginated";
import { MessagesStatus } from "../reducers/entities/messages/messagesStatus";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import {
  Download,
  DownloadError
} from "../reducers/entities/messages/downloads";

/**
 * Load a single message given its ID
 */
export const loadMessageById = createAsyncAction(
  "MESSAGE_BY_ID_LOAD_REQUEST",
  "MESSAGE_BY_ID_LOAD_SUCCESS",
  "MESSAGE_BY_ID_LOAD_FAILURE"
)<{ id: UIMessageId }, UIMessage, { id: UIMessageId; error: Error }>();

/**
 * Load a single message's details given its ID
 */
export const loadMessageDetails = createAsyncAction(
  "MESSAGE_DETAILS_LOAD_REQUEST",
  "MESSAGE_DETAILS_LOAD_SUCCESS",
  "MESSAGE_DETAILS_LOAD_FAILURE"
)<{ id: UIMessageId }, UIMessageDetails, { id: string; error: Error }>();

export type Filter = { getArchived?: boolean };
// generic error used by all pagination actions
export type MessagesFailurePayload = {
  error: Error;
  filter: Filter;
};

export type LoadMessagesRequestPayload = {
  pageSize: number;
  cursor?: Cursor;
  filter: Filter;
};

type PaginatedMessagesSuccessPayload = {
  messages: ReadonlyArray<UIMessage>;
  filter: Filter;
};

// The data is appended to the state
export type NextPageMessagesSuccessPayload = PaginatedMessagesSuccessPayload & {
  pagination: { next?: string };
  filter: Filter;
};
export const loadNextPageMessages = createAsyncAction(
  "MESSAGES_LOAD_NEXT_PAGE_REQUEST",
  "MESSAGES_LOAD_NEXT_PAGE_SUCCESS",
  "MESSAGES_LOAD_NEXT_PAGE_FAILURE"
)<
  LoadMessagesRequestPayload,
  NextPageMessagesSuccessPayload,
  MessagesFailurePayload
>();

// The data is prepended to the state
export type PreviousPageMessagesSuccessPayload =
  PaginatedMessagesSuccessPayload & {
    pagination: { previous?: string };
    filter: Filter;
  };

export const loadPreviousPageMessages = createAsyncAction(
  "MESSAGES_LOAD_PREVIOUS_PAGE_REQUEST",
  "MESSAGES_LOAD_PREVIOUS_PAGE_SUCCESS",
  "MESSAGES_LOAD_PREVIOUS_PAGE_FAILURE"
)<
  LoadMessagesRequestPayload,
  PreviousPageMessagesSuccessPayload,
  MessagesFailurePayload
>();

// Forces a refresh of the internal state
export type ReloadMessagesPayload = PaginatedMessagesSuccessPayload & {
  pagination: { previous?: string; next?: string };
};
export const reloadAllMessages = createAsyncAction(
  "MESSAGES_RELOAD_REQUEST",
  "MESSAGES_RELOAD_SUCCESS",
  "MESSAGES_RELOAD_FAILURE"
)<
  Pick<LoadMessagesRequestPayload, "pageSize" | "filter">,
  ReloadMessagesPayload,
  MessagesFailurePayload
>();

export type UpsertMessageStatusAttributesPayload = {
  message: UIMessage;
  update:
    | { tag: "archiving"; isArchived: boolean }
    | { tag: "reading" }
    | { tag: "bulk"; isArchived: boolean };
};
export const upsertMessageStatusAttributes = createAsyncAction(
  "UPSERT_MESSAGE_STATUS_ATTRIBUTES_REQUEST",
  "UPSERT_MESSAGE_STATUS_ATTRIBUTES_SUCCESS",
  "UPSERT_MESSAGE_STATUS_ATTRIBUTES_FAILURE"
)<
  UpsertMessageStatusAttributesPayload,
  UpsertMessageStatusAttributesPayload,
  { error: Error; payload: UpsertMessageStatusAttributesPayload }
>();

export const removeMessages =
  createStandardAction("MESSAGES_REMOVE")<ReadonlyArray<string>>();

type MigrationFailure = {
  error: unknown;
  messageId: string;
};
export type MigrationResult = {
  failed: Array<MigrationFailure>;
  succeeded: Array<string>;
};
export const migrateToPaginatedMessages = createAsyncAction(
  "MESSAGES_MIGRATE_TO_PAGINATED_REQUEST",
  "MESSAGES_MIGRATE_TO_PAGINATED_SUCCESS",
  "MESSAGES_MIGRATE_TO_PAGINATED_FAILURE"
)<MessagesStatus, number, MigrationResult>();

/**
 * Used to mark the end of a migration and reset it to a pristine state.
 */
export const resetMigrationStatus = createAction(
  "MESSAGES_MIGRATE_TO_PAGINATED_DONE"
);

/**
 * The user requests an attachment download.
 */
export const downloadAttachment = createAsyncAction(
  "DOWNLOAD_ATTACHMENT_REQUEST",
  "DOWNLOAD_ATTACHMENT_SUCCESS",
  "DOWNLOAD_ATTACHMENT_FAILURE",
  "DOWNLOAD_ATTACHMENT_CANCEL"
)<UIAttachment, Download, DownloadError<Error>, UIAttachment>();

export const cancelPreviousAttachmentDownload = createAction(
  "CANCEL_PREVIOUS_ATTACHMENT_DOWNLOAD"
);

/**
 * This action removes any cached data in order to perform another download.
 */
export const removeCachedAttachment = createStandardAction(
  "REMOVE_CACHED_ATTACHMENT"
)<Download>();

export type MessagesActions = ActionType<
  | typeof reloadAllMessages
  | typeof loadNextPageMessages
  | typeof loadPreviousPageMessages
  | typeof loadMessageDetails
  | typeof migrateToPaginatedMessages
  | typeof resetMigrationStatus
  | typeof removeMessages
  | typeof upsertMessageStatusAttributes
  | typeof loadMessageById
  | typeof loadThirdPartyMessage
  | typeof downloadAttachment
  | typeof cancelPreviousAttachmentDownload
  | typeof removeCachedAttachment
>;
