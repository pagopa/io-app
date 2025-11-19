import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginTypeEnum } from "../../activeSessionLogin/screens/analytics";

export function trackLoginSessionOptIn(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_2",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackLoginSessionOptInInfo(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_SESSION_OPTIN_INFO",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
// miss on ASL
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
// miss on ASL
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
