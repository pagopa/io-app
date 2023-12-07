import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackLoginSessionOptIn() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackLoginSessionOptInInfo() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_INFO",
    buildEventProperties("UX", "action")
  );
}

export function trackLoginSessionOptIn365() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_365_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackLoginSessionOptIn30() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_30_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export type LoginSessionDuration = "365" | "30" | "not set";
