import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwFlow, ItwScreenFlowContext } from "../../analytics";
import { ITW_IDENTIFICATION_SCREENVIEW_EVENTS } from "./enum";

export function trackItWalletIDMethod(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_METHOD,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletSpidIDPSelection() {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_SPID_IDP_SELECTION,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCiePinEnter(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_ENTER,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCieNfcActivation(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_NFC_ACTIVATION,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCieCardReading(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_CARD_READING,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCieCardReadingSuccess(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CARD_READING_SUCCESS,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItwPinInfoBottomSheet(
  screenFlowContext: ItwScreenFlowContext
) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_PIN_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
}

export function trackItwCieInfoBottomSheet(
  screenFlowContext: ItwScreenFlowContext
) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
}

export function trackItwCiePinTutorialCie(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_CIE,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItwCiePinTutorialPin(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_PIN,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItwUserWithoutL3Bottomsheet() {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_USER_WITHOUT_L3_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
}
