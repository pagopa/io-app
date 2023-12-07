import { LoginSessionDuration } from "../../../features/fastLogin/analytics/optinAnalytics";
import { mixpanelTrack } from "../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../utils/analytics";

export function trackLoginFlowStarting() {
  void mixpanelTrack(
    "LOGIN_START_FLOW",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackCieLoginSelected() {
  void mixpanelTrack(
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
  flow: FlowType
) {
  void mixpanelTrack(
    "LOGIN_ENDED",
    buildEventProperties(
      "UX",
      "action",
      {
        login_veloce: fastLogin,
        idp
      },
      flow
    )
  );
}
