import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId,
  WithUIMessageId
} from "../../types";
import { MessageGetStatusFailurePhaseType } from "../reducers/messageGetStatus";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { MessagesStatus } from "../reducers/messagesStatus";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";

export type ThirdPartyMessageActions = ActionType<typeof loadThirdPartyMessage>;

export type RequestGetMessageDataActionType = {
  messageId: UIMessageId;
  fromPushNotification: boolean;
};

export type SuccessGetMessageDataActionType = {
  containsAttachments: boolean;
  containsPayment?: boolean;
  euCovidCerficateAuthCode?: string;
  firstTimeOpening: boolean;
  hasRemoteContent: boolean;
  isPNMessage: boolean;
  messageId: UIMessageId;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
};

type FailureGetMessageDataActionType = {
  blockedFromPushNotificationOpt?: boolean;
  phase: MessageGetStatusFailurePhaseType;
};

export const getMessageDataAction = createAsyncAction(
  "GET_MESSAGE_DATA_REQUEST",
  "GET_MESSAGE_DATA_SUCCESS",
  "GET_MESSAGE_DATA_FAILURE"
)<
  RequestGetMessageDataActionType,
  SuccessGetMessageDataActionType,
  FailureGetMessageDataActionType
>();

/**
 * The user requests the message third party content.
 */
export const loadThirdPartyMessage = createAsyncAction(
  "THIRD_PARTY_MESSAGE_LOAD_REQUEST",
  "THIRD_PARTY_MESSAGE_LOAD_SUCCESS",
  "THIRD_PARTY_MESSAGE_LOAD_FAILURE"
)<
  { id: UIMessageId; serviceId: ServiceId; tag: string },
  { id: UIMessageId; content: ThirdPartyMessageWithContent },
  { id: UIMessageId; error: Error }
>();

export const resetGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_RESET_REQUEST"
);

export const cancelGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_CANCEL_REQUEST"
);

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
  cursor?: string;
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

export const getMessagePrecondition = createAsyncAction(
  "GET_MESSAGE_PRECONDITION_REQUEST",
  "GET_MESSAGE_PRECONDITION_SUCCESS",
  "GET_MESSAGE_PRECONDITION_FAILURE"
)<
  WithUIMessageId<{ categoryTag: MessageCategory["tag"] }>,
  ThirdPartyMessagePrecondition,
  Error
>();

export const clearMessagePrecondition = createAction(
  "CLEAR_MESSAGE_PRECONDITION"
);

/**
 * Used to mark the end of a migration and reset it to a pristine state.
 */
export const resetMigrationStatus = createAction(
  "MESSAGES_MIGRATE_TO_PAGINATED_DONE"
);

export type DownloadAttachmentRequest = {
  attachment: ThirdPartyAttachment;
  messageId: UIMessageId;
  skipMixpanelTrackingOnFailure: boolean;
};

export type DownloadAttachmentSuccess = {
  attachment: ThirdPartyAttachment;
  messageId: UIMessageId;
  path: string;
};

export type DownloadAttachmentError = {
  attachment: ThirdPartyAttachment;
  error: Error;
  messageId: UIMessageId;
};

export type DownloadAttachmentCancel = {
  attachment: ThirdPartyAttachment;
  messageId: UIMessageId;
};

/**
 * The user requests an attachment download.
 */
export const downloadAttachment = createAsyncAction(
  "DOWNLOAD_ATTACHMENT_REQUEST",
  "DOWNLOAD_ATTACHMENT_SUCCESS",
  "DOWNLOAD_ATTACHMENT_FAILURE",
  "DOWNLOAD_ATTACHMENT_CANCEL"
)<
  DownloadAttachmentRequest,
  DownloadAttachmentSuccess,
  DownloadAttachmentError,
  DownloadAttachmentCancel
>();

export const cancelPreviousAttachmentDownload = createAction(
  "CANCEL_PREVIOUS_ATTACHMENT_DOWNLOAD"
);

export const clearRequestedAttachmentDownload = createAction(
  "CLEAR_REQUESTED_ATTACHMNET_DOWNLOAD"
);

/**
 * This action removes any cached data in order to perform another download.
 */
export const removeCachedAttachment = createStandardAction(
  "REMOVE_CACHED_ATTACHMENT"
)<DownloadAttachmentSuccess>();

export type UpdatePaymentForMessageRequest = {
  messageId: UIMessageId;
  paymentId: string;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: UIMessageId;
  paymentId: string;
  paymentData: PaymentRequestsGetResponse;
};

export type UpdatePaymentForMessageFailure = {
  messageId: UIMessageId;
  paymentId: string;
  details: Detail_v2Enum;
};

export type UpdatePaymentForMessageCancel =
  ReadonlyArray<UpdatePaymentForMessageRequest>;

export const updatePaymentForMessage = createAsyncAction(
  "UPDATE_PAYMENT_FOR_MESSAGE_REQUEST",
  "UPDATE_PAYMENT_FOR_MESSAGE_SUCCESS",
  "UPDATE_PAYMENT_FOR_MESSAGE_FAILURE",
  "UPDATE_PAYMENT_FOR_MESSAGE_CANCEL"
)<
  UpdatePaymentForMessageRequest,
  UpdatePaymentForMessageSuccess,
  UpdatePaymentForMessageFailure,
  UpdatePaymentForMessageCancel
>();

export const cancelQueuedPaymentUpdates = createAction(
  "CANCEL_QUEUED_PAYMENT_UPDATES"
);

export const addMessagePaymentToCheck = createAction(
  "MESSAGES_ADD_PAYMENT_TO_CHECK",
  resolve => (paymentId: string) => resolve({ paymentId })
);

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
  | typeof clearRequestedAttachmentDownload
  | typeof removeCachedAttachment
  | typeof getMessagePrecondition
  | typeof clearMessagePrecondition
  | typeof getMessageDataAction
  | typeof cancelGetMessageDataAction
  | typeof resetGetMessageDataAction
  | typeof updatePaymentForMessage
  | typeof cancelQueuedPaymentUpdates
  | typeof addMessagePaymentToCheck
>;
