import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { SendUserType } from "../../../pushNotifications/analytics";
import { SendAARFailurePhase } from "../utils/stateUtils";

export type SendAarScreen = "CIE_PREPARATION" | "NFC_ACTIVATION";

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

export const trackSendAarNotificationClosureConfirm = (
  userType: SendUserType
) => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_CLOSURE_CONFIRM";
  const eventProps = buildEventProperties("UX", "action", {
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationClosureExit = (userType: SendUserType) => {
  const eventName = "SEND_TEMPORARY_NOTIFICATION_CLOSURE_EXIT";
  const eventProps = buildEventProperties("UX", "exit", {
    send_user: userType
  });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarErrorScreenClosure = () => {
  const eventName = "SEND_AAR_ERROR_CLOSURE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarErrorScreenDetails = () => {
  const eventName = "SEND_AAR_ERROR_DETAIL";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarErrorScreenDetailsHelp = () => {
  const eventName = "SEND_AAR_ERROR_DETAIL_HELP";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarErrorScreenDetailsCode = () => {
  const eventName = "SEND_AAR_ERROR_DETAIL_CODE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateDisclaimer = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateDisclaimerAccepted = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER_ACCEPTED";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateDisclaimerClosure = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER_CLOSURE";
  const eventProps = buildEventProperties("UX", "exit");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateBottomSheet = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateBottomSheetAccepted = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET_ACCEPTED";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningMandateBottomSheetClosure = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET_CLOSURE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningNfcNotSupported = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningNfcNotSupportedInfo = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED_INFO";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarNotificationOpeningNfcNotSupportedClosure = () => {
  const eventName = "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED_CLOSURE";
  const eventProps = buildEventProperties("UX", "exit");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCiePreparation = () => {
  const eventName = "SEND_MANDATE_CIE_PREPARATION";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCiePreparationContinue = () => {
  const eventName = "SEND_MANDATE_CIE_PREPARATION_CONTINUE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieReadingClosureAlert = (
  screen: SendAarScreen
) => {
  const eventName = "SEND_MANDATE_CIE_READING_CLOSURE_ALERT";
  const eventProps = buildEventProperties("UX", "screen_view", { screen });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieReadingClosureAlertAccepted = (
  screen: SendAarScreen
) => {
  const eventName = "SEND_MANDATE_CIE_READING_CLOSURE_ALERT_ACCEPTED";
  const eventProps = buildEventProperties("UX", "exit", { screen });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieReadingClosureAlertContinue = (
  screen: SendAarScreen
) => {
  const eventName = "SEND_MANDATE_CIE_READING_CLOSURE_ALERT_CONTINUE";
  const eventProps = buildEventProperties("UX", "action", { screen });
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCanEnter = () => {
  const eventName = "SEND_MANDATE_CIE_CAN_ENTER";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReadingDisclaimer = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING_DISCLAIMER";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReadingDisclaimerContinue = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING_DISCLAIMER_CONTINUE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReading = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReadingSuccess = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING_SUCCESS";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReadingError = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING_ERROR";
  const eventProps = buildEventProperties("KO", undefined);
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNfcActivation = () => {
  const eventName = "SEND_MANDATE_CIE_NFC_ACTIVATION";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNfcActivationContinue = () => {
  const eventName = "SEND_MANDATE_CIE_NFC_ACTIVATION_CONTINUE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNfcGoToSettings = () => {
  const eventName = "SEND_MANDATE_CIE_NFC_GO_TO_SETTINGS";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNfcActivationControlAlert = () => {
  const eventName = "SEND_MANDATE_CIE_NFC_ACTIVATION_CONTROL_ALERT";
  const eventProps = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNfcActivationControlAlertGoToSettings =
  () => {
    const eventName =
      "SEND_MANDATE_CIE_NFC_ACTIVATION_CONTROL_ALERT_GO_TO_SETTINGS";
    const eventProps = buildEventProperties("UX", "exit");
    void mixpanelTrack(eventName, eventProps);
  };

export const trackSendAarMandateCieNfcActivationControlAlertClosure = () => {
  const eventName = "SEND_MANDATE_CIE_NFC_ACTIVATION_CONTROL_ALERT_CLOSURE";
  const eventProps = buildEventProperties("UX", "action");
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCanCodeError = () => {
  const eventName = "SEND_MANDATE_CIE_CAN_ERROR";
  const eventProps = buildEventProperties("KO", undefined);
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieCardReadingFailure = () => {
  const eventName = "SEND_MANDATE_CIE_CARD_READING_FAILURE";
  const eventProps = buildEventProperties("KO", undefined);
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieExpiredError = () => {
  const eventName = "SEND_MANDATE_CIE_EXPIRED_ERROR";
  const eventProps = buildEventProperties("KO", undefined);
  void mixpanelTrack(eventName, eventProps);
};

export const trackSendAarMandateCieNotRelatedToDelegatorError = () => {
  const eventName = "SEND_MANDATE_CIE_NOT_RELATED_TO_DELEGATOR_ERROR";
  const eventProps = buildEventProperties("KO", undefined);
  void mixpanelTrack(eventName, eventProps);
};
