import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackUtmLink(utm_campaign: string) {
  void mixpanelTrack(
    "UTM_LINK",
    buildEventProperties("UX", undefined, { utm_campaign })
  );
}
