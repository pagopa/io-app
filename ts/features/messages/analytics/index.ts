import * as t from "io-ts";
import * as S from "fp-ts/lib/string";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
import { mixpanelTrack } from "../../../mixpanel";
import { readablePrivacyReport } from "../../../utils/reporters";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { buildEventProperties } from "../../../utils/analytics";

export function trackMessageCTAFrontMatterDecodingError(serviceId?: ServiceId) {
  void mixpanelTrack("CTA_FRONT_MATTER_DECODING_ERROR", {
    serviceId
  });
}

export function trackMessageNotificationTap(messageId: NonEmptyString) {
  void mixpanelTrack(
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
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_COUNT", {
    attachmentCount
  });
}

export function trackThirdPartyMessageAttachmentUnavailable(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_UNAVAILABLE", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentDownloadFailed(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_DOWNLOAD_FAILED", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentBadFormat(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_BAD_FORMAT", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentCorruptedFile(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_CORRUPTED_FILE", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentPreviewSuccess() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_PREVIEW_SUCCESS");
}

export function trackThirdPartyMessageAttachmentShowPreview() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_SHOW_PREVIEW");
}

export function trackThirdPartyMessageAttachmentDoNotShow() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_DO_NOT_SHOW");
}

export function trackThirdPartyMessageAttachmentUserAction(
  userAction: "download" | "open" | "share"
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_USER_ACTION", {
    userAction
  });
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
