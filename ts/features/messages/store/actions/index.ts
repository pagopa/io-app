import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessage, UIMessageDetails } from "../../types";
import { MessageListCategory } from "../../types/messageListCategory";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";
import { MessageGetStatusFailurePhaseType } from "../reducers/messageGetStatus";
import {
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  resetMessageArchivingAction,
  startProcessingMessageArchivingAction,
  toggleScheduledMessageArchivingAction
} from "./archiving";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  scheduledPreconditionStatusAction,
  shownPreconditionStatusAction,
  updateRequiredPreconditionStatusAction
} from "./preconditions";

export type RequestGetMessageDataActionType = {
  messageId: string;
  fromPushNotification: boolean;
};

export type SuccessGetMessageDataActionType = {
  containsAttachments: boolean;
  containsPayment?: boolean;
  createdAt: Date;
  firstTimeOpening: boolean;
  hasFIMSCTA: boolean;
  hasRemoteContent: boolean;
  isLegacyGreenPass?: boolean;
  isPNMessage: boolean;
  messageId: string;
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
  { id: string; serviceId: ServiceId; tag: string },
  { id: string; content: ThirdPartyMessageUnion },
  { id: string; error: Error }
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
)<{ id: string }, UIMessage, { id: string; error: Error }>();

/**
 * Load a single message's details given its ID
 */
export const loadMessageDetails = createAsyncAction(
  "MESSAGE_DETAILS_LOAD_REQUEST",
  "MESSAGE_DETAILS_LOAD_SUCCESS",
  "MESSAGE_DETAILS_LOAD_FAILURE"
)<{ id: string }, UIMessageDetails, { id: string; error: Error }>();

type Filter = { getArchived?: boolean };

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
  messageId: string;
  skipMixpanelTrackingOnFailure: boolean;
  serviceId: ServiceId;
};

export type DownloadAttachmentSuccess = {
  attachment: ThirdPartyAttachment;
  messageId: string;
  path: string;
};

export type DownloadAttachmentError = {
  attachment: ThirdPartyAttachment;
  error: Error;
  messageId: string;
};

export type DownloadAttachmentCancel = {
  attachment: ThirdPartyAttachment;
  messageId: string;
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
  messageId: string;
  paymentId: string;
  serviceId: ServiceId;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: string;
  paymentId: string;
  paymentData: PaymentInfoResponse;
  serviceId: ServiceId;
};

export type PaymentError = GenericError | SpecificError | TimeoutError;
export type GenericError = { type: "generic"; message: string };
export type SpecificError = { type: "specific"; details: Detail_v2Enum };
export type TimeoutError = { type: "timeout" };

export const isGenericError = (error: PaymentError): error is GenericError =>
  error.type === "generic";
export const isSpecificError = (error: PaymentError): error is SpecificError =>
  error.type === "specific";
export const isTimeoutError = (error: PaymentError): error is TimeoutError =>
  error.type === "timeout";

export const toGenericError = (message: string): PaymentError => ({
  type: "generic",
  message
});
export const toSpecificError = (details: Detail_v2Enum): PaymentError => ({
  type: "specific",
  details
});
export const toTimeoutError = (): PaymentError => ({ type: "timeout" });

export type UpdatePaymentForMessageFailure = {
  messageId: string;
  paymentId: string;
  reason: PaymentError;
  serviceId: ServiceId;
};

export const updatePaymentForMessage = createAsyncAction(
  "UPDATE_PAYMENT_FOR_MESSAGE_REQUEST",
  "UPDATE_PAYMENT_FOR_MESSAGE_SUCCESS",
  "UPDATE_PAYMENT_FOR_MESSAGE_FAILURE"
)<
  UpdatePaymentForMessageRequest,
  UpdatePaymentForMessageSuccess,
  UpdatePaymentForMessageFailure
>();

export const cancelQueuedPaymentUpdates = createStandardAction(
  "CANCEL_QUEUED_PAYMENT_UPDATES"
)<{ messageId: string }>();

export const startPaymentStatusTracking = createStandardAction(
  "MESSAGES_START_TRACKING_PAYMENT_STATUS"
)<void>();
export const cancelPaymentStatusTracking = createStandardAction(
  "MESSAGES_CANCEL_PAYMENT_STATUS_TRACKING"
)<void>();

export const addUserSelectedPaymentRptId = createStandardAction(
  "MESSAGES_ADD_USER_SELECTED_PAYMENT_RPTID"
)<string>(); // PaymentId

export const setShownMessageCategoryAction = createStandardAction(
  "SET_SHOWN_MESSAGE_CATEGORY"
)<MessageListCategory>();

export const requestAutomaticMessagesRefresh = createStandardAction(
  "REQUEST_AUTOMATIC_MESSAGE_REFRESH"
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
