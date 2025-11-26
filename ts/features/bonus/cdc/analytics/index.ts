import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export const trackCdcRequestIntro = () =>
  mixpanelTrack("CDC_REQUEST_INTRO", buildEventProperties("UX", "screen_view"));

export const trackCdcRequestIntroContinue = () =>
  mixpanelTrack(
    "CDC_REQUEST_INTRO_CONTINUE",
    buildEventProperties("UX", "action")
  );

export const trackCdcGoToService = () =>
  mixpanelTrack("CDC_GO_TO_SERVICE", buildEventProperties("UX", "action"));
