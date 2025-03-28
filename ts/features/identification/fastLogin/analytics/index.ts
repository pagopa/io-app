import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export function trackLoginSessionTimeoutPrePin() {
  void mixpanelTrack(
    "LOGIN_SESSION_TIMEOUT_PRE_PIN",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackLoginSessionTimeoutPostPin() {
  void mixpanelTrack(
    "LOGIN_SESSION_TIMEOUT_POST_PIN",
    buildEventProperties("UX", "screen_view")
  );
}
