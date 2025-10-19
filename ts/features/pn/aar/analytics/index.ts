import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

export const trackSendQRCodeScanRedirect = () => {
  const eventName = "SEND_QRCODE_SCAN_REDIRECT";
  const properties = buildEventProperties("UX", "screen_view");
  mixpanelTrack(eventName, properties);
};

export const trackSendQRCodeScanRedirectConfirmed = () => {
  const eventName = "SEND_QRCODE_SCAN_REDIRECT_CONFIRMED";
  const properties = buildEventProperties("UX", "action");
  mixpanelTrack(eventName, properties);
};

export const trackSendQRCodeScanRedirectDismissed = () => {
  const eventName = "SEND_QRCODE_SCAN_REDIRECT_DISMISSED";
  const properties = buildEventProperties("UX", "action");
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialog = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource,
  sendUser: SendUserType
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG";
  const properties = buildEventProperties("UX", "screen_view", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationStart = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource,
  sendUser: SendUserType
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START";
  const properties = buildEventProperties("UX", "action", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationDismissed = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource,
  sendUser: SendUserType
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED";
  const properties = buildEventProperties("UX", "action", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
};

export const trackSendAARAttachmentDownloadFailure = (reason: string) => {
  const eventName = "SEND_AAR_ATTACHMENT_DOWNLOAD_FAILED";
  const props = buildEventProperties("KO", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackSendAARToS = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};
