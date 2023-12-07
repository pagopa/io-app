import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackLoginRootedScreen() {
  void mixpanelTrack(
    "LOGIN_JAILBREAK",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackForcedUpdateScreen() {
  void mixpanelTrack(
    "APP_FORCED_UPDATE",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackUpdateAppButton() {
  void mixpanelTrack("APP_UPDATE_EXIT", buildEventProperties("UX", "action"));
}
