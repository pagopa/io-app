import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
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
