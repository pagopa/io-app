import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginType } from "../../activeSessionLogin/screens/analytics";

export function trackLoginSessionOptIn(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_2",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackLoginSessionOptInInfo(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_INFO",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}
export async function trackLoginSessionOptIn365(
  state: GlobalState,
  flow: LoginType = "auth"
) {
  if (flow === "auth") {
    await updateMixpanelProfileProperties(state, {
      property: "LOGIN_SESSION",
      value: "365"
    });
    await updateMixpanelSuperProperties(state, {
      property: "LOGIN_SESSION",
      value: "365"
    });
  }
  mixpanelTrack(
    "LOGIN_SESSION_OPTIN_365_SELECTED",
    buildEventProperties("UX", "action", { flow })
  );
}
export async function trackLoginSessionOptIn30(
  state: GlobalState,
  flow: LoginType = "auth"
) {
  if (flow === "auth") {
    // miss on ASL (check it)
    await updateMixpanelProfileProperties(state, {
      property: "LOGIN_SESSION",
      value: "30"
    });
    await updateMixpanelSuperProperties(state, {
      property: "LOGIN_SESSION",
      value: "30"
    });
  }
  mixpanelTrack(
    "LOGIN_SESSION_OPTIN_30_SELECTED",
    buildEventProperties("UX", "action", { flow })
  );
}

export type LoginSessionDuration = "365" | "30" | "not set";
