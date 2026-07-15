import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { PaymentInfoResponse } from "../../../../../definitions/communication/PaymentInfoResponse";
import { ThirdPartyAttachment } from "../../../../../definitions/communication/ThirdPartyAttachment";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { UIMessage, UIMessageDetails } from "../../types";
import { MessageListCategory } from "../../types/messageListCategory";
import { MessagePaymentError } from "../../types/paymentErrors";
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
  fromPushNotification: boolean;
  messageId: string;
};

export type SuccessGetMessageDataActionType = {
  containsAttachments: boolean;
  containsPayment?: boolean;
  createdAt: Date;
  fciMessageType: "not_set" | "request" | "result";
  fciResult: "failure" | "not_set" | "success";
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

/** The user requests the message third party content. */
export const loadThirdPartyMessage = createAsyncAction(
  "THIRD_PARTY_MESSAGE_LOAD_REQUEST",
  "THIRD_PARTY_MESSAGE_LOAD_SUCCESS",
  "THIRD_PARTY_MESSAGE_LOAD_FAILURE"
)<
  { id: string; serviceId: ServiceId; tag: string },
  { content: ThirdPartyMessageUnion; id: string },
  { error: Error; id: string }
>();

export const resetGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_RESET_REQUEST"
);

export const cancelGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_CANCEL_REQUEST"
);

/** Load a single message given its ID */
export type LoadMessageByIdFailureKind = "generic" | "messageNotFound";
export const loadMessageById = createAsyncAction(
  "MESSAGE_BY_ID_LOAD_REQUEST",
  "MESSAGE_BY_ID_LOAD_SUCCESS",
  "MESSAGE_BY_ID_LOAD_FAILURE"
)<
  { id: string },
  UIMessage,
  { error: Error; id: string; kind: LoadMessageByIdFailureKind }
>();

/** Load a single message's details given its ID */
export const loadMessageDetails = createAsyncAction(
  "MESSAGE_DETAILS_LOAD_REQUEST",
  "MESSAGE_DETAILS_LOAD_SUCCESS",
  "MESSAGE_DETAILS_LOAD_FAILURE"
)<{ id: string }, UIMessageDetails, { error: Error; id: string }>();

export type LoadMessagesRequestPayload = {
  cursor?: string;
  filter: Filter;
  fromUserAction: boolean;
  pageSize: number;
};

// generic error used by all pagination actions
export type MessagesFailurePayload = {
  error: Error;
  filter: Filter;
};

// The data is appended to the state
export type NextPageMessagesSuccessPayload = PaginatedMessagesSuccessPayload & {
  filter: Filter;
  pagination: { next?: string };
};

type Filter = { getArchived?: boolean };

type PaginatedMessagesSuccessPayload = {
  filter: Filter;
  fromUserAction: boolean;
  messages: ReadonlyArray<UIMessage>;
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
    filter: Filter;
    pagination: { previous?: string };
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
  pagination: { next?: string; previous?: string };
};

export const reloadAllMessages = createAsyncAction(
  "MESSAGES_RELOAD_REQUEST",
  "MESSAGES_RELOAD_SUCCESS",
  "MESSAGES_RELOAD_FAILURE"
)<
  Pick<LoadMessagesRequestPayload, "filter" | "fromUserAction" | "pageSize">,
  ReloadMessagesPayload,
  MessagesFailurePayload
>();

export type UpsertMessageStatusAttributesPayload = {
  message: UIMessage;
  update:
    | { isArchived: boolean; tag: "archiving" }
    | { isArchived: boolean; tag: "bulk" }
    | { tag: "reading" };
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

export type DownloadAttachmentCancel = {
  attachment: ThirdPartyAttachment;
  messageId: string;
};

export type DownloadAttachmentError = {
  attachment: ThirdPartyAttachment;
  error: Error;
  messageId: string;
};

export type DownloadAttachmentRequest = {
  attachment: ThirdPartyAttachment;
  messageId: string;
  serviceId: ServiceId;
  skipMixpanelTrackingOnFailure: boolean;
};

export type DownloadAttachmentSuccess = {
  attachment: ThirdPartyAttachment;
  messageId: string;
  path: string;
};

/** The user requests an attachment download. */
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

/** This action removes any cached data in order to perform another download. */
export const removeCachedAttachment = createStandardAction(
  "REMOVE_CACHED_ATTACHMENT"
)<DownloadAttachmentSuccess>();

export type UpdatePaymentForMessageFailure = {
  messageId: string;
  paymentId: string;
  reason: MessagePaymentError;
  serviceId: ServiceId;
};

export type UpdatePaymentForMessageRequest = {
  messageId: string;
  paymentId: string;
  serviceId: ServiceId;
};

export type UpdatePaymentForMessageSuccess = {
  messageId: string;
  paymentData: PaymentInfoResponse;
  paymentId: string;
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

export const setMessageSagasRegisteredAction = createStandardAction(
  "SET_MESSAGE_SAGAS_REGISTERED"
)();

export type MessagesActions = ActionType<
  | typeof addUserSelectedPaymentRptId
  | typeof cancelGetMessageDataAction
  | typeof cancelPaymentStatusTracking
  | typeof cancelPreviousAttachmentDownload
  | typeof cancelQueuedPaymentUpdates
  | typeof clearRequestedAttachmentDownload
  | typeof downloadAttachment
  | typeof errorPreconditionStatusAction
  | typeof getMessageDataAction
  | typeof idlePreconditionStatusAction
  | typeof interruptMessageArchivingProcessingAction
  | typeof loadingContentPreconditionStatusAction
  | typeof loadMessageById
  | typeof loadMessageDetails
  | typeof loadNextPageMessages
  | typeof loadPreviousPageMessages
  | typeof loadThirdPartyMessage
  | typeof reloadAllMessages
  | typeof removeCachedAttachment
  | typeof removeScheduledMessageArchivingAction
  | typeof requestAutomaticMessagesRefresh
  | typeof resetGetMessageDataAction
  | typeof resetMessageArchivingAction
  | typeof retrievingDataPreconditionStatusAction
  | typeof scheduledPreconditionStatusAction
  | typeof setMessageSagasRegisteredAction
  | typeof setShownMessageCategoryAction
  | typeof shownPreconditionStatusAction
  | typeof startPaymentStatusTracking
  | typeof startProcessingMessageArchivingAction
  | typeof toggleScheduledMessageArchivingAction
  | typeof updatePaymentForMessage
  | typeof updateRequiredPreconditionStatusAction
  | typeof upsertMessageStatusAttributes
>;
