import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIMessage, UIMessageDetails, UIMessageId } from "../../types";
import { MessageGetStatusFailurePhaseType } from "../reducers/messageGetStatus";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { MessageListCategory } from "../../types/messageListCategory";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  scheduledPreconditionStatusAction,
  shownPreconditionStatusAction,
  updateRequiredPreconditionStatusAction
} from "./preconditions";
import {
  resetMessageArchivingAction,
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  startProcessingMessageArchivingAction,
  toggleScheduledMessageArchivingAction
} from "./archiving";

export type ThirdPartyMessageActions = ActionType<typeof loadThirdPartyMessage>;

export type RequestGetMessageDataActionType = {
  messageId: UIMessageId;
  fromPushNotification: boolean;
};

export type SuccessGetMessageDataActionType = {
  containsAttachments: boolean;
  containsPayment?: boolean;
  firstTimeOpening: boolean;
  hasFIMSCTA: boolean;
  hasRemoteContent: boolean;
  isLegacyGreenPass?: boolean;
  isPNMessage: boolean;
  messageId: UIMessageId;
  organizationFiscalCode: string;
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
  fromUserAction: boolean;
};

type PaginatedMessagesSuccessPayload = {
  messages: ReadonlyArray<UIMessage>;
  filter: Filter;
  fromUserAction: boolean;
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
  Pick<LoadMessagesRequestPayload, "pageSize" | "filter" | "fromUserAction">,
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
  serviceId: ServiceId;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: UIMessageId;
  paymentId: string;
  paymentData: PaymentRequestsGetResponse;
  serviceId: ServiceId;
};

export type UpdatePaymentForMessageFailure = {
  messageId: UIMessageId;
  paymentId: string;
  details: Detail_v2Enum;
  serviceId: ServiceId;
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

export const startPaymentStatusTracking = createStandardAction(
  "MESSAGES_START_TRACKING_PAYMENT_STATUS"
)<void>();
export const cancelPaymentStatusTracking = createStandardAction(
  "MESSAGES_CANCEL_PAYMENT_STATUS_TRACKING"
)<void>();

export const addUserSelectedPaymentRptId = createAction(
  "MESSAGES_ADD_USER_SELECTED_PAYMENT_RPTID",
  resolve => (paymentId: string) => resolve({ paymentId })
);

export const setShownMessageCategoryAction = createStandardAction(
  "SET_SHOWN_MESSAGE_CATEGORY"
)<MessageListCategory>();

export const requestAutomaticMessagesRefresh = createStandardAction(
  "REQUEST_AUOMATIC_MESSAGE_REFRESH"
)<MessageListCategory>();

export type MessagesActions = ActionType<
  | typeof reloadAllMessages
  | typeof loadNextPageMessages
  | typeof loadPreviousPageMessages
  | typeof loadMessageDetails
  | typeof upsertMessageStatusAttributes
  | typeof loadMessageById
  | typeof loadThirdPartyMessage
  | typeof downloadAttachment
  | typeof cancelPreviousAttachmentDownload
  | typeof clearRequestedAttachmentDownload
  | typeof removeCachedAttachment
  | typeof errorPreconditionStatusAction
  | typeof idlePreconditionStatusAction
  | typeof loadingContentPreconditionStatusAction
  | typeof retrievingDataPreconditionStatusAction
  | typeof scheduledPreconditionStatusAction
  | typeof shownPreconditionStatusAction
  | typeof updateRequiredPreconditionStatusAction
  | typeof getMessageDataAction
  | typeof cancelGetMessageDataAction
  | typeof resetGetMessageDataAction
  | typeof updatePaymentForMessage
  | typeof cancelQueuedPaymentUpdates
  | typeof addUserSelectedPaymentRptId
  | typeof setShownMessageCategoryAction
  | typeof toggleScheduledMessageArchivingAction
  | typeof resetMessageArchivingAction
  | typeof startProcessingMessageArchivingAction
  | typeof removeScheduledMessageArchivingAction
  | typeof interruptMessageArchivingProcessingAction
  | typeof requestAutomaticMessagesRefresh
  | typeof startPaymentStatusTracking
  | typeof cancelPaymentStatusTracking
>;
