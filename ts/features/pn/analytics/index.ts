import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { mixpanelTrack } from "../../../mixpanel";
import { TransactionSummaryErrorContent } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { PnActivationState } from "../../pn/store/reducers/activation";
import { PNMessage } from "../../pn/store/types/types";

export function trackPNAttachmentDownloadFailure() {
  void mixpanelTrack("PN_ATTACHMENT_DOWNLOADFAILURE");
}

export function trackPNAttachmentOpen() {
  void mixpanelTrack("PN_ATTACHMENT_OPEN");
}

export function trackPNAttachmentPreviewStatus(
  previewStatus: "displayed" | "error"
) {
  void mixpanelTrack("PN_ATTACHMENT_PREVIEW_STATUS", {
    previewStatus
  });
}

export function trackPNAttachmentSave() {
  void mixpanelTrack("PN_ATTACHMENT_SAVE");
}

export function trackPNAttachmentShare() {
  void mixpanelTrack("PN_ATTACHMENT_SHARE");
}

export function trackPNDisclaimerAccepted(
  messageCreatedAt: Date,
  messageReceiptDate: Date
) {
  void mixpanelTrack("PN_DISCLAIMER_ACCEPTED", {
    eventTimestamp: new Date().toISOString(),
    messageTimestamp: messageCreatedAt.toISOString(),
    notificationTimestamp: messageReceiptDate.toISOString()
  });
}

export function trackPNDisclaimerRejected() {
  void mixpanelTrack("PN_DISCLAIMER_REJECTED");
}

export function trackPNDisclaimerShowSuccess() {
  void mixpanelTrack("PN_DISCLAIMER_SHOW_SUCCESS");
}

export function trackPNNotificationLoadError(errorCode?: string) {
  const properties = errorCode ? { errorCode } : { jsonDecodeFailed: true };
  void mixpanelTrack("PN_NOTIFICATION_LOAD_ERROR", properties);
}

export function trackPNNotificationLoadSuccess(pnMessage: PNMessage) {
  const notificationStatusHistory = pnMessage.notificationStatusHistory;
  const lastNotificationIndex = notificationStatusHistory.length - 1;
  const lastNotification = notificationStatusHistory[lastNotificationIndex];
  const lastNotificationStatus = lastNotification.status;
  const messageAttachments = pnMessage.attachments;
  const messageAttachmentLength = messageAttachments?.length ?? 0;
  const messageHasAttachments = messageAttachmentLength > 0;
  void mixpanelTrack("PN_NOTIFICATION_LOAD_SUCCESS", {
    notificationLastStatus: lastNotificationStatus,
    hasAttachments: messageHasAttachments
  });
}

export function trackPNPaymentInfoError(
  paymentVerificationError: O.Some<TransactionSummaryErrorContent>
) {
  void mixpanelTrack("PN_PAYMENTINFO_ERROR", {
    paymentStatus: paymentVerificationError
  });
}

export function trackPNPaymentInfoPaid() {
  void mixpanelTrack("PN_PAYMENTINFO_PAID");
}

export function trackPNPaymentInfoPayable() {
  void mixpanelTrack("PN_PAYMENTINFO_PAYABLE");
}

export function trackPNPushOpened() {
  void mixpanelTrack("PN_PUSH_OPENED");
}

export function trackPNServiceCTAFired() {
  void mixpanelTrack("PN_SERVICE_CTAFIRED");
}

export function trackPNServiceStatusChangedError(isServiceActive?: boolean) {
  void mixpanelTrack("PN_SERVICE_STATUSCHANGE_ERROR", {
    currentStatus: isServiceActive
  });
}

export function trackPNServiceStatusChangedSuccess(
  serviceActivation: PnActivationState
) {
  void mixpanelTrack("PN_SERVICE_STATUSCHANGE_SUCCESS", {
    newStatus: pot.toUndefined(serviceActivation)
  });
}

export function trackPNTimelineExternal() {
  void mixpanelTrack("PN_TIMELINE_EXTERNAL");
}
