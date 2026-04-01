import {
  isHttpLink,
  isHttpsLink
} from "../../../components/ui/Markdown/handlers/link";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { getUrlBasepath } from "../../../utils/url";

export function trackIOOpenedFromUniversalAppLink(link_id: string) {
  // check if is universal app link (if it is not, it means that it is an
  // deeplink that should not be tracked as universal app link opening)
  if (isHttpsLink(link_id) || isHttpLink(link_id)) {
    void mixpanelTrack(
      "IO_UNIVERSAL_APP_LINK",
      buildEventProperties("TECH", undefined, {
        link_id: getUrlBasepath(link_id)
      })
    );
  }
}
