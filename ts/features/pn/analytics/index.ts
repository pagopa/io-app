import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { mixpanelTrack } from "../../../mixpanel";
import { PNMessage } from "../../pn/store/types/types";
import { NotificationStatusHistoryElement } from "../../../../definitions/pn/NotificationStatusHistoryElement";
import { UIAttachment } from "../../messages/types";
import {
  booleanToYesNo,
  buildEventProperties,
  numberToYesNoOnThreshold
} from "../../../utils/analytics";

export interface TrackPNPaymentStatus {
  paymentCount: number;
  unpaidCount: number;
  paidCount: number;
  errorCount: number;
  expiredCount: number;
  revokedCount: number;
  ongoingCount: number;
}

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

export function trackPNAttachmentDownloadFailure(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_DOWNLOAD_FAILURE",
    buildEventProperties("TECH", undefined, {
      category
    })
  );
}

export function trackPNAttachmentSave(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_SAVE",
    buildEventProperties("UX", "action", {
      category
    })
  );
}

export function trackPNAttachmentShare(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_SHARE",
    buildEventProperties("UX", "action", {
      category
    })
  );
}

export function trackPNAttachmentSaveShare(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_SAVE_SHARE",
    buildEventProperties("UX", "action", {
      category
    })
  );
}

export function trackPNAttachmentOpen(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPEN",
    buildEventProperties("UX", "action", {
      category
    })
  );
}

export function trackPNAttachmentOpening(category?: string) {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPENING",
    buildEventProperties("UX", "action", {
      category
    })
  );
}

export function trackPNAttachmentOpeningSuccess(
  previewStatus: "displayer" | "error",
  category?: string
) {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPENING_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      PREVIEW_STATUS: previewStatus,
      category
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
  paymentCount: number,
  firstTimeOpening: boolean,
  isCancelled: boolean,
  containsF24: boolean
) {
  void mixpanelTrack(
    "PN_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      contains_payment: numberToYesNoOnThreshold(paymentCount),
      first_time_opening: booleanToYesNo(firstTimeOpening),
      notification_status: isCancelled ? "cancelled" : "active",
      contains_multipayment: numberToYesNoOnThreshold(paymentCount, 1),
      count_payment: paymentCount,
      contains_f24: containsF24
    })
  );
}

export function trackPNPaymentStart() {
  void mixpanelTrack("PN_PAYMENT_START", buildEventProperties("UX", "action"));
}

export function trackPNShowAllPayments() {
  void mixpanelTrack(
    "PN_SHOW_ALL_PAYMENT",
    buildEventProperties("UX", "action")
  );
}

export function trackPNPaymentStatus({
  paymentCount,
  unpaidCount,
  paidCount,
  errorCount,
  expiredCount,
  revokedCount,
  ongoingCount
}: TrackPNPaymentStatus) {
  void mixpanelTrack(
    "PN_PAYMENT_STATUS",
    buildEventProperties("TECH", undefined, {
      count_payment: paymentCount,
      count_unpaid: unpaidCount,
      count_paid: paidCount,
      count_error: errorCount,
      count_expired: expiredCount,
      count_revoked: revokedCount,
      count_inprogress: ongoingCount
    })
  );
}

export function trackPNShowF24() {
  void mixpanelTrack("PN_SHOW_F24", buildEventProperties("UX", "action"));
}
