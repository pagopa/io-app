import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties } from "../../../../utils/analytics";

export function trackLoginSessionOptIn() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_2",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackLoginSessionOptInInfo() {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_INFO",
    buildEventProperties("UX", "action")
  );
}

export async function trackLoginSessionOptIn365(state: GlobalState) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_SESSION",
    value: "365"
  });
  await updateMixpanelSuperProperties(state, {
    property: "LOGIN_SESSION",
    value: "365"
  });
  mixpanelTrack(
    "LOGIN_SESSION_OPTIN_365_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export async function trackLoginSessionOptIn30(state: GlobalState) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_SESSION",
    value: "30"
  });
  await updateMixpanelSuperProperties(state, {
    property: "LOGIN_SESSION",
    value: "30"
  });
  mixpanelTrack(
    "LOGIN_SESSION_OPTIN_30_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export type LoginSessionDuration = "365" | "30" | "not set";
