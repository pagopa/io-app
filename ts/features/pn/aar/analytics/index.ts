import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

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

export const trackSendActivationModalDialog = () => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG";
  const properties = buildEventProperties("UX", "screen_view");
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationStart = () => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START";
  const properties = buildEventProperties("UX", "action");
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationDismissed = () => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED";
  const properties = buildEventProperties("UX", "action");
  mixpanelTrack(eventName, properties);
};

export const trackSendAARAttachmentDownloadFailure = (reason: string) => {
  const eventName = "SEND_AAR_ATTACHMENT_DOWNLOAD_FAILED";
  const props = buildEventProperties("KO", undefined, {
    reason
  });
  void mixpanelTrack(eventName, props);
};
