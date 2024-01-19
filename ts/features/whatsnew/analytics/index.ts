import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackWhatsNewScreen() {
  void mixpanelTrack(
    "WHATS_NEW",
    buildEventProperties("UX", "screen_view", undefined)
  );
}
