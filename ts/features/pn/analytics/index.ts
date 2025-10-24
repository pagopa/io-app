import { mixpanelTrack } from "../../../mixpanel";
import {
  booleanToYesNo,
  buildEventProperties,
  numberToYesNoOnThreshold
} from "../../../utils/analytics";
import { PaymentStatistics } from "../../messages/store/reducers/payments";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { NotificationStatus } from "../../../../definitions/pn/NotificationStatus";

export type PNServiceStatus = "active" | "not_active" | "unknown";

export const booleanOrUndefinedToPNServiceStatus = (
  active: boolean | undefined
): PNServiceStatus =>
  active != null ? (active ? "active" : "not_active") : "unknown";

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

export const trackPNServiceStatusChangeError = (
  currentStatus: boolean,
  reason: string
) =>
  void mixpanelTrack(
    "PN_SERVICE_STATUS_CHANGE_ERROR",
    buildEventProperties("KO", undefined, {
      CURRENT_STATUS: pnServiceActivationStatusBoolToString(currentStatus),
      reason
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

export function trackPNAttachmentOpening(
  openingSource: SendOpeningSource,
  userType: SendUserType,
  category?: string
) {
  void mixpanelTrack(
    "PN_ATTACHMENT_OPENING",
    buildEventProperties("UX", "action", {
      category,
      opening_source: openingSource,
      send_user: userType
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
      ERROR_CODE: errorCode
    })
  );
}

export function trackPNNotificationLoadSuccess(
  hasAttachmens: boolean,
  status: NotificationStatus | undefined,
  openingSource: SendOpeningSource,
  userType: SendUserType
) {
  const eventName = "PN_NOTIFICATION_LOAD_SUCCESS";
  const eventProperties = buildEventProperties("TECH", undefined, {
    NOTIFICATION_LAST_STATUS: status ?? "not_set",
    HAS_ATTACHMENTS: hasAttachmens,
    opening_source: openingSource,
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProperties);
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
  firstTimeOpening: boolean | undefined,
  isCancelled: boolean,
  containsF24: boolean,
  openingSource: SendOpeningSource,
  userType: SendUserType
) {
  void mixpanelTrack(
    "PN_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      contains_payment: numberToYesNoOnThreshold(paymentCount),
      first_time_opening:
        firstTimeOpening != null ? booleanToYesNo(firstTimeOpening) : "not_set",
      notification_status: isCancelled ? "cancelled" : "active",
      contains_multipayment: numberToYesNoOnThreshold(paymentCount, 1),
      count_payment: paymentCount,
      contains_f24: containsF24,
      opening_source: openingSource,
      send_user: userType
    })
  );
}

export function trackPNPaymentStart(
  openingSource: SendOpeningSource,
  userType: SendUserType
) {
  const eventName = "PN_PAYMENT_START";
  const eventProps = buildEventProperties("UX", "action", {
    opening_source: openingSource,
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProps);
}

export function trackPNShowAllPayments() {
  void mixpanelTrack(
    "PN_SHOW_ALL_PAYMENT",
    buildEventProperties("UX", "action")
  );
}

export function trackPNPaymentStatus(
  {
    paymentCount,
    unpaidCount,
    paidCount,
    errorCount,
    expiredCount,
    revokedCount,
    ongoingCount
  }: PaymentStatistics,
  openingSource: SendOpeningSource,
  userType: SendUserType
) {
  void mixpanelTrack(
    "PN_PAYMENT_STATUS",
    buildEventProperties("TECH", undefined, {
      count_payment: paymentCount,
      count_unpaid: unpaidCount,
      count_paid: paidCount,
      count_error: errorCount,
      count_expired: expiredCount,
      count_revoked: revokedCount,
      count_inprogress: ongoingCount,
      opening_source: openingSource,
      send_user: userType
    })
  );
}

export function trackPNShowF24() {
  void mixpanelTrack("PN_SHOW_F24", buildEventProperties("UX", "action"));
}
