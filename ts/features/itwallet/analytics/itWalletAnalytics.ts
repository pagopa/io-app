import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

// PROPERTIES TYPES
type TrackITWalletBannerClosureProperties = {
  banner_id: string;
  // banner_campaign: string (EVOLUTIVA)
  banner_page: string;
  banner_landing: string;
};

type TrackITWalletIDMethodSelected = {
  ITW_ID_method: "spid" | "cie_pin" | "cieid";
};

type TrackITWalletSpidIDPSelected = { idp: string };

type TrackItWalletCieCardReadingFailure = { reason: string };

// SCREEN VIEW EVENTS
export function trackITWalletBannerVisualized(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    "BANNER",
    buildEventProperties("UX", "screen_view", properties)
  );
}

export function trackItWalletIntroScreen() {
  void mixpanelTrack("ITW_INTRO", buildEventProperties("UX", "screen_view"));
}

export function trackItWalletIDMethod() {
  void mixpanelTrack(
    "ITW_ID_METHOD",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletSpidIDPSelection() {
  void mixpanelTrack(
    "ITW_SPID_IDP_SELECTION",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCiePinEnter() {
  void mixpanelTrack(
    "ITW_CIE_PIN_ENTER",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieNfcActivation() {
  void mixpanelTrack(
    "ITW_CIE_NFC_ACTIVATION",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieCardReading() {
  void mixpanelTrack(
    "ITW_CIE_CARD_READING",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieCardReadingSuccess() {
  void mixpanelTrack(
    "ITW_CARD_READING_SUCCESS",
    buildEventProperties("UX", "screen_view")
  );
}

// ACTION EVENTS
export function trackItWalletBannerClosure(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    "CLOSE_BANNER",
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletBannerTap(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    "TAP_BANNER",
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletTOSTap() {
  void mixpanelTrack("ITW_TOS", buildEventProperties("UX", "action"));
}

export function trackItWalletActivationStart() {
  void mixpanelTrack("ITW_ID_START", buildEventProperties("UX", "action"));
}

export function trackItWalletIDMethodSelected(
  properties: TrackITWalletIDMethodSelected
) {
  void mixpanelTrack(
    "ITW_ID_METHOD_SELECTED",
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletSpidIDPSelected(
  properties: TrackITWalletSpidIDPSelected
) {
  void mixpanelTrack(
    "ITW_SPID_IDP_SELECTED",
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletCiePinInfo() {
  void mixpanelTrack("ITW_CIE_PIN_INFO", buildEventProperties("UX", "action"));
}

export function trackItWalletCiePinForgotten() {
  void mixpanelTrack(
    "ITW_CIE_PIN_FORGOTTEN",
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCiePukForgotten() {
  void mixpanelTrack(
    "ITW_CIE_PUK_FORGOTTEN",
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCieNfcGoToSettings() {
  void mixpanelTrack(
    "ITW_CIE_NFC_GO_TO_SETTINGS",
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCieRetryPin() {
  void mixpanelTrack("ITW_CIE_RETRY_PIN", buildEventProperties("UX", "action"));
}

// ERROR EVENTS
export function trackItWalletErrorDeviceNotSupported() {
  void mixpanelTrack(
    "ITW_DEVICE_NOT_SUPPORTED",
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletErrorCardReading() {
  void mixpanelTrack(
    "ITW_CIE_CARD_READING_ERROR",
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletErrorPinIncorrect() {
  void mixpanelTrack("ITW_CIE_PIN_ERROR", buildEventProperties("UX", "error"));
}

export function trackItWalletErrorPinIncorrectTwice() {
  void mixpanelTrack(
    "ITW_CIE_PIN_SECOND_ERROR",
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletErrorPinIncorrectLast() {
  void mixpanelTrack(
    "ITW_CIE_PIN_LAST_ERROR",
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletCieCardVerifyFailure() {
  void mixpanelTrack(
    "ITW_CIE_CARD_VERIFY_FAILURE",
    buildEventProperties("UX", "error")
  );
}

// TODO where we need to call it? la lettura della CIe è completata (false)
export function trackItWalletCieCardReadingFailure(
  properties: TrackItWalletCieCardReadingFailure
) {
  void mixpanelTrack(
    "ITW_CIE_CARD_READING_FAILURE",
    buildEventProperties("UX", "error", properties)
  );
}
