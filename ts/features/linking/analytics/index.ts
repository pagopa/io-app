import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export type LinkIdType = "aar" | "continua_su_io";

export function trackIOOpenedFromUniversalAppLink(link_id: LinkIdType) {
  void mixpanelTrack(
    "IO_UNIVERSAL_APP_LINK",
    buildEventProperties("TECH", undefined, {
      link_id
    })
  );
}
