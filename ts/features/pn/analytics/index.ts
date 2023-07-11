import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { mixpanelTrack } from "../../../mixpanel";
import { TransactionSummaryErrorContent } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { PnActivationState } from "../../pn/store/reducers/activation";
import {
  NotificationStatusHistoryElement,
  PNMessage
} from "../../pn/store/types/types";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { buildEventProperties } from "../../../utils/analytics";

export const trackPNOptInMessageOpened = () =>
  void mixpanelTrack(
    "PN_OPTIN_MESSAGE_OPENED",
    buildEventProperties("UX", "screen_view")
  );

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
  pipe(
    pnMessage.notificationStatusHistory as Array<NotificationStatusHistoryElement>,
    A.last,
    O.map(lastNotification => lastNotification.status),
    O.fold(
      () => undefined,
      (status: string) =>
        void mixpanelTrack("PN_NOTIFICATION_LOAD_SUCCESS", {
          notificationLastStatus: status,
          hasAttachments: pipe(
            pnMessage.attachments as Array<UIAttachment>,
            O.fromNullable,
            O.map(A.isNonEmpty),
            O.getOrElse(() => false)
          )
        })
    )
  );
}

export function trackPNPaymentInfoError(
  paymentVerificationError: O.Some<TransactionSummaryErrorContent>
) {
  void mixpanelTrack("PN_PAYMENTINFO_ERROR", {
    paymentStatus: O.toUndefined(paymentVerificationError)
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
