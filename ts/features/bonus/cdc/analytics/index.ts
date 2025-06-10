import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export const trackCdcRequestStart = () =>
  mixpanelTrack("CDC_REQUEST_START", buildEventProperties("UX", "action"));

export const trackCdcRequestIntro = () =>
  mixpanelTrack("CDC_REQUEST_INTRO", buildEventProperties("UX", "screen_view"));

export const trackCdcRequestIntroContinue = () =>
  mixpanelTrack(
    "CDC_REQUEST_INTRO_CONTINUE",
    buildEventProperties("UX", "action")
  );
