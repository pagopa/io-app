import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../utils/analytics";
import { IdpCIE } from "../LandingScreen";
import { LoginSessionDuration } from "../../../features/fastLogin/analytics/optinAnalytics";

export function trackLoginFlowStarting() {
  void mixpanelTrack(
    "LOGIN_START_FLOW",
    buildEventProperties("UX", "screen_view")
  );
}

export async function trackCieLoginSelected(state: GlobalState) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
  await mixpanelTrack(
    "LOGIN_CIE_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackSpidLoginSelected() {
  void mixpanelTrack(
    "LOGIN_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackSpidLoginIdpSelection() {
  void mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTION",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackMethodInfo() {
  void mixpanelTrack("LOGIN_METHOD_INFO", buildEventProperties("UX", "exit"));
}

export function trackCieLoginSuccess(login_session: LoginSessionDuration) {
  void mixpanelTrack(
    "LOGIN_CIE_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session
    })
  );
}

export function trackSpidLoginSuccess(
  login_session: LoginSessionDuration,
  idp: string
) {
  void mixpanelTrack(
    "LOGIN_SPID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      idp
    })
  );
}

export function trackTosUserExit(flow: FlowType) {
  void mixpanelTrack(
    "TOS_USER_EXIT",
    buildEventProperties("UX", "exit", undefined, flow)
  );
}

export function trackLoginUserExit() {
  void mixpanelTrack("LOGIN_USER_EXIT", buildEventProperties("UX", "exit"));
}

export function trackLoginEnded(
  fastLogin: boolean,
  idp: string,
  flow: FlowType,
  screenName: string
) {
  void mixpanelTrack(
    "LOGIN_ENDED",
    buildEventProperties(
      "UX",
      "action",
      {
        screen_name: screenName,
        login_veloce: fastLogin,
        idp
      },
      flow
    )
  );
}
