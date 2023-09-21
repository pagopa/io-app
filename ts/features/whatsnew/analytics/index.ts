import { mixpanelTrack } from "../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../utils/analytics";

export function trackWhatsNewScreen(flow: FlowType) {
  void mixpanelTrack(
    "WHATS_NEW",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}
