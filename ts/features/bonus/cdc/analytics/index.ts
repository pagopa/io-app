import { select } from "typed-redux-saga/macro";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { GlobalState } from "../../../../store/reducers/types.ts";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties.ts";
import { cdcStatusHandler } from "../../../../mixpanelConfig/mixpanelPropertyUtils.ts";

export const trackCdcRequestIntro = () =>
  mixpanelTrack("CDC_REQUEST_INTRO", buildEventProperties("UX", "screen_view"));

export const trackCdcRequestIntroContinue = () =>
  mixpanelTrack(
    "CDC_REQUEST_INTRO_CONTINUE",
    buildEventProperties("UX", "action")
  );

export const trackCdcGoToService = () =>
  mixpanelTrack("CDC_GO_TO_SERVICE", buildEventProperties("UX", "action"));

export const trackCdcCardError = () =>
  mixpanelTrack("CDC_CARD_ERROR", buildEventProperties("KO", "error"));

export async function* trackCdcStatus() {
  const state: GlobalState = yield* select();
  await updateMixpanelProfileProperties(state, {
    property: "CDC_STATUS",
    value: cdcStatusHandler(state)
  });
}
