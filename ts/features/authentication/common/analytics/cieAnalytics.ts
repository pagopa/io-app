import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginType } from "../../activeSessionLogin/screens/analytics";

export type CieLoginFlowType = LoginType | "FCI_auth";

export function trackLoginCiePinScreen(flow: CieLoginFlowType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_PIN",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCiePinInfo(flow: CieLoginFlowType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_PIN_INFO",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}

export function trackLoginCieCardReaderScreen(flow: CieLoginFlowType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READER",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCieCardReadingSuccess(
  flow: CieLoginFlowType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_SUCCESS",
    buildEventProperties("UX", "confirm", {
      flow
    })
  );
}

export function trackLoginCieConsentDataUsageScreen(
  flow: CieLoginFlowType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIE_CONSENT_DATA_USAGE",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCieCardReadingError(flow: CieLoginFlowType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_ERROR",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
}

export function trackLoginCieDataSharingError(flow: CieLoginFlowType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_DATA_SHARING_ERROR",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
}
