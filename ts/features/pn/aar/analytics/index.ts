import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { SendUserType } from "../../../pushNotifications/analytics";
import { SendAARFailurePhase } from "../utils/stateUtils";

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

export const trackSendAARFailure = (
  phase: SendAARFailurePhase,
  reason: string
) => {
  const eventName = "SEND_AAR_ERROR";
  const props = buildEventProperties("KO", undefined, {
    phase,
    reason
  });
  void mixpanelTrack(eventName, props);
};

export const trackSendAARToS = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackSendAARToSAccepted = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_ACCEPTED";
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackSendAARToSDismissed = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_DISMISSED";
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const trackSendAARAccessDeniedScreenView = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackSendAARAccessDeniedDelegateInfo = () => {
  const eventName =
    "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_MANDATE_INFO";
  const props = buildEventProperties("UX", "exit");
  void mixpanelTrack(eventName, props);
};

export const trackSendAARAccessDeniedDismissed = () => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_DISMISSED";
  const props = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, props);
};

export const aarProblemJsonAnalyticsReport = (
  responseCode: number,
  input: AARProblemJson
) => {
  const titleReport = input.title != null ? ` ${input.title}` : "";
  const traceIdReport = input.traceId != null ? ` ${input.traceId}` : "";
  const errorReport =
    input.errors != null
      ? input.errors
          .map(error => {
            const detailReport = error.detail != null ? ` ${error.detail}` : "";
            const elementReport =
              error.element != null ? ` ${error.element}` : "";
            return ` ${error.code}${detailReport}${elementReport}`;
          })
          .join(",")
      : "";
  return `${responseCode} ${input.status}${titleReport} ${input.detail}${traceIdReport}${errorReport}`;
};

export const trackSendAarNotificationClosure = (userType: SendUserType) => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_CLOSURE";
  const eventProps = buildEventProperties("UX", "screen_view", {
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationClosureBack = (userType: SendUserType) => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_CLOSURE_BACK";
  const eventProps = buildEventProperties("UX", "action", {
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProps);
};
