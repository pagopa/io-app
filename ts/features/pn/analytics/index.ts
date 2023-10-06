import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { mixpanelTrack } from "../../../mixpanel";
import { TransactionSummaryErrorContent } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { PNMessage } from "../../pn/store/types/types";
import { NotificationStatusHistoryElement } from "../../../../definitions/pn/NotificationStatusHistoryElement";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { booleanToYesNo, buildEventProperties } from "../../../utils/analytics";

const pnServiceActivationStatusBoolToString = (activated?: boolean) =>
  activated ? "activated" : "deactivated";

export const trackPNOptInMessageOpened = () =>
  void mixpanelTrack(
    "PN_OPTIN_MESSAGE_OPENED",
    buildEventProperties("UX", "screen_view")
  );

export const trackPNOptInMessageAccepted = () =>
  void mixpanelTrack(
    "PN_OPTIN_MESSAGE_ACCEPTED",
    buildEventProperties("UX", "action")
  );

export const trackPNServiceDeactivated = () =>
  void mixpanelTrack(
    "PN_SERVICE_DEACTIVATED",
    buildEventProperties("UX", "screen_view")
  );

export const trackPNServiceActivated = () =>
  void mixpanelTrack(
    "PN_SERVICE_ACTIVATED",
    buildEventProperties("UX", "screen_view")
  );

export const trackPNServiceStartDeactivation = () =>
  void mixpanelTrack(
    "PN_SERVICE_START_DEACTIVATION",
    buildEventProperties("UX", "action")
  );

export const trackPNServiceStartActivation = () =>
  void mixpanelTrack(
    "PN_SERVICE_START_ACTIVATION",
    buildEventProperties("UX", "action")
  );

export const trackPNPushSettings = (enabled: boolean) =>
  void mixpanelTrack(
    "PN_PUSH_SETTINGS",
    buildEventProperties("UX", "micro_action", {
      push_notification: enabled
    })
  );

export const trackPNOptInMessageCTADisplaySuccess = () =>
  void mixpanelTrack(
    "PN_OPTIN_MESSAGE_CTA_DISPLAY_SUCCESS",
    buildEventProperties("TECH", "control")
  );

export const trackPNServiceStatusChangeSuccess = (activated?: boolean) =>
  void mixpanelTrack(
    "PN_SERVICE_STATUS_CHANGE_SUCCESS",
    buildEventProperties("TECH", undefined, {
      NEW_STATUS: pnServiceActivationStatusBoolToString(activated)
    })
  );

export const trackPNServiceStatusChangeError = (currentStatus?: boolean) =>
  void mixpanelTrack(
    "PN_SERVICE_STATUS_CHANGE_ERROR",
    buildEventProperties("KO", undefined, {
      CURRENT_STATUS: pnServiceActivationStatusBoolToString(currentStatus)
    })
  );

export function trackPNAttachmentDownloadFailure() {
  void mixpanelTrack(
    "PN_ATTACHMENT_DOWNLOAD_FAILURE",
    buildEventProperties("TECH", undefined)
  );
}

export function trackPNAttachmentSave() {
  void mixpanelTrack(
    "PN_ATTACHMENT_SAVE",
    buildEventProperties("UX", "action")
  );
}

export function trackPNAttachmentShare() {
  void mixpanelTrack(
    "PN_ATTACHMENT_SHARE",
    buildEventProperties("UX", "action")
  );
}

export function trackPNAttachmentSaveShare() {
  void mixpanelTrack(
    "PN_ATTACHMENT_SAVE_SHARE",
    buildEventProperties("UX", "action")
  );
}

export function trackPNAttachmentOpen() {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPEN",
    buildEventProperties("UX", "action")
  );
}

export function trackPNAttachmentOpening() {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPENING",
    buildEventProperties("UX", "action")
  );
}

export function trackPNAttachmentOpeningSuccess(
  previewStatus: "displayer" | "error"
) {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPENING_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      PREVIEW_STATUS: previewStatus
    })
  );
}

export function trackPNNotificationLoadError(errorCode?: string) {
  void mixpanelTrack(
    "PN_NOTIFICATION_LOAD_ERROR",
    buildEventProperties("KO", undefined, {
      ERROR_CODE: errorCode,
      JSON_DECODE_FAILED: errorCode ? false : true
    })
  );
}

export function trackPNNotificationLoadSuccess(pnMessage: PNMessage) {
  pipe(
    pnMessage.notificationStatusHistory as Array<NotificationStatusHistoryElement>,
    A.last,
    O.map(lastNotification => lastNotification.status),
    O.fold(
      () => undefined,
      (status: string) =>
        void mixpanelTrack(
          "PN_NOTIFICATION_LOAD_SUCCESS",
          buildEventProperties("TECH", undefined, {
            NOTIFICATION_LAST_STATUS: status,
            HAS_ATTACHMENTS: pipe(
              pnMessage.attachments as Array<UIAttachment>,
              O.fromNullable,
              O.map(A.isNonEmpty),
              O.getOrElse(() => false)
            )
          })
        )
    )
  );
}

export function trackPNPaymentInfoError(
  paymentVerificationError: O.Some<TransactionSummaryErrorContent>
) {
  void mixpanelTrack(
    "PN_PAYMENT_INFO_ERROR",
    buildEventProperties("TECH", undefined, {
      PAYMENT_STATUS: O.toUndefined(paymentVerificationError)
    })
  );
}

export function trackPNPaymentInfoPaid() {
  void mixpanelTrack(
    "PN_PAYMENT_INFO_PAID",
    buildEventProperties("TECH", undefined)
  );
}

export function trackPNPaymentInfoPayable() {
  void mixpanelTrack(
    "PN_PAYMENT_INFO_PAYABLE",
    buildEventProperties("TECH", undefined)
  );
}

export function trackPNPushOpened() {
  void mixpanelTrack("PN_PUSH_OPENED", buildEventProperties("UX", "action"));
}

export function trackPNTimelineExternal() {
  void mixpanelTrack(
    "PN_TIMELINE_EXTERNAL",
    buildEventProperties("UX", "exit")
  );
}

export function trackPNShowTimeline() {
  void mixpanelTrack("PN_SHOW_TIMELINE", buildEventProperties("UX", "action"));
}

export function trackPNUxSuccess(
  containsPayment: boolean,
  firstTimeOpening: boolean,
  isCancelled: boolean
) {
  void mixpanelTrack(
    "PN_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      contains_payment: booleanToYesNo(containsPayment),
      first_time_opening: booleanToYesNo(firstTimeOpening),
      notification_status: isCancelled ? "cancelled" : "active",
      contains_multipayment: "no",
      count_payment: containsPayment ? 1 : 0,
      contains_f24: "no"
    })
  );
}
