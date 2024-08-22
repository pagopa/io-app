import * as t from "io-ts";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { pipe } from "fp-ts/lib/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
import { mixpanelTrack } from "../../../mixpanel";
import { readablePrivacyReport } from "../../../utils/reporters";
import { UIMessageId } from "../types";
import { booleanToYesNo, buildEventProperties } from "../../../utils/analytics";
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

export function trackOpenMessage(
  organizationName: string,
  serviceName: string,
  firstTimeOpening: boolean,
  containsPayment: boolean | undefined,
  hasRemoteContent: boolean,
  containsAttachments: boolean,
  fromPushNotification: boolean
) {
  void mixpanelTrack(
    "OPEN_MESSAGE",
    buildEventProperties("UX", "screen_view", {
      organization_name: organizationName,
      service_name: serviceName,
      contains_payment: pipe(
        containsPayment,
        O.fromNullable,
        O.fold(() => "unknown" as const, booleanToYesNo)
      ),
      remote_content: booleanToYesNo(hasRemoteContent),
      contains_attachment: booleanToYesNo(containsAttachments),
      first_time_opening: booleanToYesNo(firstTimeOpening),
      fromPushNotification: booleanToYesNo(fromPushNotification)
    })
  );
}

export function trackMessageCTAFrontMatterDecodingError(serviceId?: ServiceId) {
  void mixpanelTrack("CTA_FRONT_MATTER_DECODING_ERROR", {
    serviceId
  });
}

export function trackMessageNotificationTap(messageId: NonEmptyString) {
  return mixpanelTrack(
    "NOTIFICATIONS_MESSAGE_TAP",
    buildEventProperties("UX", "action", {
      messageId
    })
  );
}

export function trackMessageNotificationParsingFailure(errors: t.Errors) {
  void mixpanelTrack("NOTIFICATION_PARSING_FAILURE", {
    reason: readablePrivacyReport(errors)
  });
}

export function trackThirdPartyMessageAttachmentCount(attachmentCount: number) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_COUNT",
    buildEventProperties("UX", "screen_view", {
      attachmentCount
    })
  );
}

export function trackThirdPartyMessageAttachmentUnavailable(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_UNAVAILABLE",
    buildEventProperties("KO", undefined, {
      messageId,
      serviceId: serviceId ?? ""
    })
  );
}

export function trackThirdPartyMessageAttachmentDownloadFailed(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_DOWNLOAD_FAILED",
    buildEventProperties("KO", undefined, {
      messageId,
      serviceId: serviceId ?? ""
    })
  );
}

export function trackThirdPartyMessageAttachmentBadFormat(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_BAD_FORMAT",
    buildEventProperties("KO", undefined, {
      messageId,
      serviceId: serviceId ?? ""
    })
  );
}

export function trackThirdPartyMessageAttachmentCorruptedFile(
  messageId: UIMessageId,
  serviceId?: ServiceId
) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_CORRUPTED_FILE",
    buildEventProperties("KO", undefined, {
      messageId,
      serviceId: serviceId ?? ""
    })
  );
}

export function trackThirdPartyMessageAttachmentPreviewSuccess() {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_PREVIEW_SUCCESS",
    buildEventProperties("TECH", "control")
  );
}

export function trackThirdPartyMessageAttachmentShowPreview() {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_SHOW_PREVIEW",
    buildEventProperties("UX", "action")
  );
}

export function trackThirdPartyMessageAttachmentUserAction(
  userAction: "download" | "open" | "share"
) {
  void mixpanelTrack(
    "THIRD_PARTY_MESSAGE_ATTACHMENT_USER_ACTION",
    buildEventProperties("UX", "action", {
      userAction
    })
  );
}

export function trackDisclaimerOpened(tag: MessageCategory["tag"]) {
  void mixpanelTrack(
    `${S.toUpperCase(tag)}_DISCLAIMER_OPENED`,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackUxConversion(tag: MessageCategory["tag"]) {
  void mixpanelTrack(
    `${S.toUpperCase(tag)}_UX_CONVERSION`,
    buildEventProperties("UX", "action")
  );
}

export function trackDisclaimerLoadError(tag: MessageCategory["tag"]) {
  void mixpanelTrack(
    `${S.toUpperCase(tag)}_DISCLAIMER_LOAD_ERROR`,
    buildEventProperties("TECH", undefined)
  );
}

export function trackNotificationRejected(tag: MessageCategory["tag"]) {
  void mixpanelTrack(
    `${S.toUpperCase(tag)}_NOTIFICATION_REJECTED`,
    buildEventProperties("UX", "exit")
  );
}

export function trackLoadMessageByIdFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_LOAD_MESSAGE_BY_ID",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackLoadMessageDetailsFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_LOAD_MESSAGE_DETAILS",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackLoadNextPageMessagesFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_LOAD_NEXT_PAGE_MESSAGES",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackLoadPreviousPageMessagesFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_LOAD_PREVIOUS_PAGE_MESSAGES",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackReloadAllMessagesFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_RELOAD_ALL_MESSAGES",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackUpsertMessageStatusAttributesFailure(reason: string) {
  void mixpanelTrack(
    "FAILURE_UPSERT_MESSAGE_STATUS_ATTRIBUTES",
    buildEventProperties("TECH", undefined, {
      reason
    })
  );
}

export function trackRemoteContentLoadRequest(tag: string) {
  void mixpanelTrack(
    "REMOTE_CONTENT_LOAD_REQUEST",
    buildEventProperties("TECH", undefined, {
      message_category_tag: tag
    })
  );
}

export function trackRemoteContentLoadSuccess(tag: string) {
  void mixpanelTrack(
    "REMOTE_CONTENT_LOAD_SUCCESS",
    buildEventProperties("TECH", undefined, {
      message_category_tag: tag
    })
  );
}

export function trackRemoteContentLoadFailure(
  serviceId: ServiceId,
  tag: string,
  reason: string
) {
  void mixpanelTrack(
    "REMOTE_CONTENT_LOAD_FAILURE",
    buildEventProperties("TECH", undefined, {
      reason,
      serviceId,
      message_category_tag: tag
    })
  );
}

export function trackMessageDataLoadRequest(fromPushNotification: boolean) {
  void mixpanelTrack(
    "MESSAGE_DATA_LOAD_REQUEST",
    buildEventProperties("TECH", undefined, {
      fromPushNotification: booleanToYesNo(fromPushNotification)
    })
  );
}

export function trackMessageDataLoadPending(fromPushNotification: boolean) {
  void mixpanelTrack(
    "MESSAGE_DATA_LOAD_PENDING",
    buildEventProperties("TECH", undefined, {
      fromPushNotification: booleanToYesNo(fromPushNotification)
    })
  );
}

export function trackMessageDataLoadFailure(
  fromPushNotification: boolean,
  phase: MessageGetStatusFailurePhaseType
) {
  void mixpanelTrack(
    "MESSAGE_DATA_LOAD_FAILURE",
    buildEventProperties("TECH", undefined, {
      fromPushNotification: booleanToYesNo(fromPushNotification),
      phase
    })
  );
}

export function trackMessageDataLoadSuccess(fromPushNotification: boolean) {
  void mixpanelTrack(
    "MESSAGE_DATA_LOAD_SUCCESS",
    buildEventProperties("TECH", undefined, {
      fromPushNotification: booleanToYesNo(fromPushNotification)
    })
  );
}

export function trackRemoteContentMessageDecodingWarning(
  reason: string,
  serviceId: ServiceId,
  tag: string
) {
  void mixpanelTrack(
    "REMOTE_CONTENT_DETAILS_DECODING_WARNING",
    buildEventProperties("TECH", undefined, {
      reason,
      serviceId,
      message_category_tag: tag
    })
  );
}

export function trackRemoteContentInfo() {
  void mixpanelTrack(
    "REMOTE_CONTENT_INFO",
    buildEventProperties("UX", "action")
  );
}

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
  // console.log(`${eventName} ${JSON.stringify(props)}`);
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
  // console.log(`${eventName} ${JSON.stringify(props)}`);
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
  // console.log(`${eventName} ${JSON.stringify(props)}`);
  void mixpanelTrack(eventName, props);
};

export const trackPullToRefresh = (category: MessageListCategory) => {
  const eventName = `MESSAGES_${
    category === "ARCHIVE" ? "ARCHIVE" : "INBOX"
  }_REFRESH`;
  const props = buildEventProperties("UX", "action");
  // console.log(`${eventName} ${JSON.stringify(props)}`);
  void mixpanelTrack(eventName, props);
};
