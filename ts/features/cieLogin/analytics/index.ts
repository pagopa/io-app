import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export const trackCieIdNoWhitelistUrl = (url: string) => {
  void mixpanelTrack(
    "LOGIN_CIEID_NO_WHITELIST_URL",
    buildEventProperties("KO", undefined, { url })
  );
};