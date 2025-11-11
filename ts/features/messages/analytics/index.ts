import * as t from "io-ts";
import * as S from "fp-ts/lib/string";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../mixpanel";
import { readablePrivacyReport } from "../../../utils/reporters";
import {
  booleanToYesNo,
  buildEventProperties,
  dateToUTCISOString
} from "../../../utils/analytics";
import { MessageGetStatusFailurePhaseType } from "../store/reducers/messageGetStatus";
import { MessageListCategory } from "../types/messageListCategory";
import { Action } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../store/actions";
import {
  messageCountForCategorySelector,
  shownMessageCategorySelector
} from "../store/reducers/allPaginated";
import { pageSize } from "../../../config";

export const trackMessagesActionsPostDispatch = (
  action: Action,
  state: GlobalState
) => {
  switch (action.type) {
    case getType(reloadAllMessages.success):
    case getType(loadPreviousPageMessages.success):
    case getType(loadNextPageMessages.success):
      const shownCategory = shownMessageCategorySelector(state);
      const messageCount = messageCountForCategorySelector(
        state,
        shownCategory
      );
      trackMessagesPage(
        shownCategory,
        messageCount,
        pageSize,
        action.payload.fromUserAction
      );
      break;
  }
};

export const trackOpenMessage = (
  serviceId: ServiceId,
  serviceName: string,
  organizationName: string,
  organizationFiscalCode: string,
  firstTimeOpening: boolean,
  containsPayment: boolean | undefined,
  hasRemoteContent: boolean,
  containsAttachments: boolean,
  fromPushNotification: boolean,
  hasFIMSCTA: boolean,
  createdAt: Date
) => {
  const eventName = "OPEN_MESSAGE";
  const props = buildEventProperties("UX", "screen_view", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    contains_payment:
      containsPayment != null ? booleanToYesNo(containsPayment) : "unknown",
    remote_content: booleanToYesNo(hasRemoteContent),
    contains_attachment: booleanToYesNo(containsAttachments),
    first_time_opening: booleanToYesNo(firstTimeOpening),
    fromPushNotification: booleanToYesNo(fromPushNotification),
    has_fims_callback: booleanToYesNo(hasFIMSCTA),
    date_sent: dateToUTCISOString(createdAt)
  });
  void mixpanelTrack(eventName, props);
};

export const trackCTAFrontMatterDecodingError = (
  reason: string,
  serviceId: ServiceId
) => {
  const eventName = "CTA_FRONT_MATTER_DECODING_ERROR";
  const props = buildEventProperties("KO", undefined, { reason, serviceId });
  void mixpanelTrack(eventName, props);
};

export const trackMessageNotificationParsingFailure = (
  id: string,
  reason: t.Errors | string,
  userOptedIn: boolean
) => {
  const eventName = "NOTIFICATION_PARSING_FAILURE";
  const props = buildEventProperties("KO", undefined, {
    reason: typeof reason !== "string" ? readablePrivacyReport(reason) : reason
  });
  if (isMixpanelInstanceInitialized()) {
    mixpanelTrack(eventName, props);
  } else if (userOptedIn) {
    enqueueMixpanelEvent(eventName, id, props);
  }
};

export const trackMessageNotificationTap = (
  messageId: string,
  userOptedIn: boolean
) => {
  const eventName = "NOTIFICATIONS_MESSAGE_TAP";
  const props = buildEventProperties("UX", "action", {
    messageId
  });
  if (isMixpanelInstanceInitialized()) {
    mixpanelTrack(eventName, props);
  } else if (userOptedIn) {
    enqueueMixpanelEvent(eventName, messageId, props);
  }
};

export const trackThirdPartyMessageAttachmentCount = (
  attachmentCount: number
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_COUNT";
  const props = buildEventProperties("UX", "screen_view", {
    attachmentCount
  });
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentUnavailable = (
  messageId: string,
  serviceId: ServiceId | undefined
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_UNAVAILABLE";
  const props = buildEventProperties("KO", undefined, {
    messageId,
    service_id: serviceId
  });
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentDownloadFailed = (
  messageId: string,
  serviceId: ServiceId | undefined
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_DOWNLOAD_FAILED";
  const props = buildEventProperties("KO", undefined, {
    messageId,
    service_id: serviceId
  });
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentBadFormat = (
  messageId: string,
  serviceId: ServiceId | undefined
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_BAD_FORMAT";
  const props = buildEventProperties("KO", undefined, {
    messageId,
    service_id: serviceId
  });
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentCorruptedFile = (
  messageId: string,
  serviceId?: ServiceId
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_CORRUPTED_FILE";
  const props = buildEventProperties("KO", undefined, {
    messageId,
    service_id: serviceId
  });
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentPreviewSuccess = () => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_PREVIEW_SUCCESS";
  const props = buildEventProperties("TECH", "control");
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentShowPreview = () => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_SHOW_PREVIEW";
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackThirdPartyMessageAttachmentUserAction = (
  userAction: "download" | "share"
) => {
  const eventName = "THIRD_PARTY_MESSAGE_ATTACHMENT_USER_ACTION";
  const props = buildEventProperties("UX", "action", {
    userAction
  });
  void mixpanelTrack(eventName, props);
};

export const trackDisclaimerOpened = (tag: MessageCategory["tag"]) => {
  const eventName = `${S.toUpperCase(tag)}_DISCLAIMER_OPENED`;
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackUxConversion = (tag: MessageCategory["tag"]) => {
  const eventName = `${S.toUpperCase(tag)}_UX_CONVERSION`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackDisclaimerLoadError = (tag: MessageCategory["tag"]) => {
  const eventName = `${S.toUpperCase(tag)}_DISCLAIMER_LOAD_ERROR`;
  const props = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, props);
};

export const trackNotificationRejected = (tag: MessageCategory["tag"]) => {
  const eventName = `${S.toUpperCase(tag)}_NOTIFICATION_REJECTED`;
  const props = buildEventProperties("UX", "exit");
  void mixpanelTrack(eventName, props);
};

export const trackLoadMessageByIdFailure = (reason: string) => {
  const eventName = "FAILURE_LOAD_MESSAGE_BY_ID";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackLoadMessageDetailsFailure = (reason: string) => {
  const eventName = "FAILURE_LOAD_MESSAGE_DETAILS";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackLoadNextPageMessagesFailure = (reason: string) => {
  const eventName = "FAILURE_LOAD_NEXT_PAGE_MESSAGES";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackLoadPreviousPageMessagesFailure = (reason: string) => {
  const eventName = "FAILURE_LOAD_PREVIOUS_PAGE_MESSAGES";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackReloadAllMessagesFailure = (reason: string) => {
  const eventName = "FAILURE_RELOAD_ALL_MESSAGES";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackUpsertMessageStatusAttributesFailure = (reason: string) => {
  const eventName = "FAILURE_UPSERT_MESSAGE_STATUS_ATTRIBUTES";
  const props = buildEventProperties("TECH", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackRemoteContentLoadRequest = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  tag: string
) => {
  const eventName = "REMOTE_CONTENT_LOAD_REQUEST";
  const props = buildEventProperties("TECH", undefined, {
    message_category_tag: tag,
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode
  });
  void mixpanelTrack(eventName, props);
};

export const trackRemoteContentLoadSuccess = (
  serviceId: ServiceId | undefined,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  tag: string
) => {
  const eventName = "REMOTE_CONTENT_LOAD_SUCCESS";
  const props = buildEventProperties("TECH", undefined, {
    message_category_tag: tag,
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode
  });
  void mixpanelTrack(eventName, props);
};

export const trackRemoteContentLoadFailure = (
  serviceId: ServiceId | undefined,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  tag: string,
  reason: string
) => {
  const eventName = "REMOTE_CONTENT_LOAD_FAILURE";
  const props = buildEventProperties("TECH", undefined, {
    reason,
    message_category_tag: tag,
    serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageDataLoadRequest = (fromPushNotification: boolean) => {
  const eventName = "MESSAGE_DATA_LOAD_REQUEST";
  const props = buildEventProperties("TECH", undefined, {
    fromPushNotification: booleanToYesNo(fromPushNotification)
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageDataLoadPending = (fromPushNotification: boolean) => {
  const eventName = "MESSAGE_DATA_LOAD_PENDING";
  const props = buildEventProperties("TECH", undefined, {
    fromPushNotification: booleanToYesNo(fromPushNotification)
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageDataLoadFailure = (
  fromPushNotification: boolean,
  phase: MessageGetStatusFailurePhaseType
) => {
  const eventName = "MESSAGE_DATA_LOAD_FAILURE";
  const props = buildEventProperties("TECH", undefined, {
    fromPushNotification: booleanToYesNo(fromPushNotification),
    phase
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageDataLoadSuccess = (fromPushNotification: boolean) => {
  const eventName = "MESSAGE_DATA_LOAD_SUCCESS";
  const props = buildEventProperties("TECH", undefined, {
    fromPushNotification: booleanToYesNo(fromPushNotification)
  });
  void mixpanelTrack(eventName, props);
};

export const trackRemoteContentMessageDecodingWarning = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  tag: string,
  reason: string
) => {
  const eventName = "REMOTE_CONTENT_DETAILS_DECODING_WARNING";
  const props = buildEventProperties("TECH", undefined, {
    reason,
    serviceId,
    message_category_tag: tag,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode
  });
  void mixpanelTrack(eventName, props);
};

export const trackRemoteContentInfo = () => {
  const eventName = "REMOTE_CONTENT_INFO";
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackMessagesPage = (
  category: MessageListCategory,
  messageCount: number,
  inputPageSize: number,
  fromUserAction: boolean
) => {
  const eventName = `MESSAGES_${
    category === "ARCHIVE" ? "ARCHIVE" : "INBOX"
  }_PAGE`;
  const props = buildEventProperties("UX", "screen_view", {
    page: Math.max(1, Math.ceil(messageCount / inputPageSize)),
    count_messages: messageCount,
    fromUserAction
  });
  void mixpanelTrack(eventName, props);
};

export const trackArchivedRestoredMessages = (
  archived: boolean,
  messageCount: number
) => {
  const eventName = `MESSAGES_${archived ? "ARCHIVED" : "RESTORED"}`;
  const props = buildEventProperties("UX", "action", {
    [`count_messages_${archived ? "archived" : "restored"}`]: messageCount
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageListEndReached = (
  category: MessageListCategory,
  willLoadNextMessagePage: boolean
) => {
  const eventName = `MESSAGES_${category === "ARCHIVE" ? "ARCHIVE" : "INBOX"}_${
    willLoadNextMessagePage ? "SCROLL" : "ENDLIST"
  }`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackPullToRefresh = (category: MessageListCategory) => {
  const eventName = `MESSAGES_${
    category === "ARCHIVE" ? "ARCHIVE" : "INBOX"
  }_REFRESH`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackAutoRefresh = (category: MessageListCategory) => {
  const eventName = `MESSAGES_${
    category === "ARCHIVE" ? "ARCHIVE" : "INBOX"
  }_AUTO_REFRESH`;
  const props = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, props);
};

export const trackMessageSearchPage = () => {
  const eventName = `MESSAGES_SEARCH_PAGE`;
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackMessageSearchResult = (resultCount: number) => {
  const eventName = `MESSAGES_SEARCH_RESULT_PAGE`;
  const props = buildEventProperties("UX", "screen_view", {
    count_result_returned: resultCount
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessageSearchSelection = () => {
  const eventName = `MESSAGES_SEARCH_RESULT_SELECTED`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackMessageSearchClosing = () => {
  const eventName = `MESSAGES_SEARCH_CLOSE`;
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackPaymentStatus = (
  serviceId: ServiceId | undefined,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  paymentStatus: string
) => {
  const eventName = `MESSAGE_PAYMENT_STATUS`;
  const props = buildEventProperties("TECH", undefined, {
    service_id: serviceId,
    service_name: serviceName,
    organization_fiscal_code: organizationFiscalCode,
    organization_name: organizationName,
    payment_status: paymentStatus
  });
  void mixpanelTrack(eventName, props);
};

export const trackPaymentStart = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined
) => {
  const eventName = `MESSAGE_PAYMENT_START`;
  const props = buildEventProperties("UX", "action", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode
  });
  void mixpanelTrack(eventName, props);
};

export const trackCTAPressed = (
  serviceId: ServiceId,
  serviceName: string | undefined,
  organizationName: string | undefined,
  organizationFiscalCode: string | undefined,
  isFirstCTA: boolean,
  ctaText: string
) => {
  const eventName = `MESSAGE_CTA_TAPPED`;
  const props = buildEventProperties("UX", "action", {
    service_id: serviceId,
    service_name: serviceName,
    organization_name: organizationName,
    organization_fiscal_code: organizationFiscalCode,
    cta_category: isFirstCTA ? "custom_1" : "custom_2",
    cta_id: ctaText
  });
  void mixpanelTrack(eventName, props);
};

export const trackMessagePaymentFailure = (reason: string) => {
  const eventName = "MESSAGE_PAYMENT_FAILURE";
  const props = buildEventProperties("KO", undefined, { reason });
  void mixpanelTrack(eventName, props);
};

export enum UndefinedBearerTokenPhase {
  attachmentDownload = "attachmentDownload",
  previousMessagesLoading = "previousMessagesLoading",
  thirdPartyMessageLoading = "thirdPartyMessageLoading",
  messageByIdLoading = "messageByIdLoading",
  messageDetailLoading = "messageDetailLoading",
  nextPageMessagesLoading = "nextPageMessagesLoading",
  previousPageMessagesLoading = "previousPageMessagesLoading",
  getPaymentsInfo = "getPaymentsInfo",
  reloadAllMessagesLoading = "reloadAllMessages",
  upsertMessageStatusAttributes = "upsertMessageStatusAttributes"
}

export const trackUndefinedBearerToken = (phase: UndefinedBearerTokenPhase) => {
  const eventName = "UNDEFINED_BEARER_TOKEN";
  const props = buildEventProperties("TECH", "error", { phase });
  void mixpanelTrack(eventName, props);
};
