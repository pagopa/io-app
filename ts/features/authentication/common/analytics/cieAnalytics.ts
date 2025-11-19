import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginTypeEnum } from "../../activeSessionLogin/screens/analytics";

export function trackLoginCiePinScreen(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_PIN",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCiePinInfo(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_PIN_INFO",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCieCardReaderScreen(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READER",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCieCardReadingSuccess(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_SUCCESS",
    buildEventProperties("UX", "confirm", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCieConsentDataUsageScreen(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_CONSENT_DATA_USAGE",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCieCardReadingError(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_CARD_READING_ERROR",
    buildEventProperties("KO", undefined, {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginCieDataSharingError(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_DATA_SHARING_ERROR",
    buildEventProperties("KO", undefined, {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
