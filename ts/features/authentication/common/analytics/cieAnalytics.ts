import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginType } from "../../activeSessionLogin/screens/analytics";

export function trackLoginCiePinScreen(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_PIN",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCiePinInfo(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_PIN_INFO",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}

export function trackLoginCieCardReaderScreen(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READER",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCieCardReadingSuccess(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_SUCCESS",
    buildEventProperties("UX", "confirm", {
      flow
    })
  );
}

export function trackLoginCieConsentDataUsageScreen(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CONSENT_DATA_USAGE",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginCieCardReadingError(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_ERROR",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
}

export function trackLoginCieDataSharingError(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_DATA_SHARING_ERROR",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
}
