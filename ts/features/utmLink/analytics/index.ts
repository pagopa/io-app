import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackUtmLink(
  utm_source: string,
  utm_medium: string,
  utm_campaign?: string
) {
  void mixpanelTrack(
    "UTM_LINK",
    buildEventProperties("UX", undefined, {
      utm_source,
      utm_medium,
      utm_campaign
    })
  );
}
