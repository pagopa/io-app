import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";
import { IdpCIE, IdpCIE_ID } from "../../login/hooks/useNavigateToLoginMethod";
import { LoginSessionDuration } from "../../fastLogin/analytics/optinAnalytics";
import { SpidLevel } from "../../../authentication/login/cie/utils";
import { LoginType } from "../../activeSessionLogin/screens/analytics";

const SECURITY_LEVEL_MAP: Record<SpidLevel, "L2" | "L3"> = {
  SpidL2: "L2",
  SpidL3: "L3"
};

export function trackLoginFlowStarting() {
  void mixpanelTrack(
    "LOGIN_START_FLOW",
    buildEventProperties("UX", "screen_view")
  );
}
export function trackLoginCiePinSelected(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_PIN_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}
export function trackLoginCieIdSelected(
  spidLevel: SpidLevel,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel],
      flow
    })
  );
}
// This event must be send when user taps on cie login button
export async function trackCieLoginSelected() {
  mixpanelTrack("LOGIN_CIE_SELECTED", buildEventProperties("UX", "action"));
}
export async function trackCiePinLoginSelected(
  state: GlobalState,
  flow: LoginType = "auth"
) {
  trackLoginCiePinSelected(flow);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
}
export async function trackCieIDLoginSelected(
  state: GlobalState,
  spidLevel: SpidLevel,
  flow: LoginType = "auth"
) {
  trackLoginCieIdSelected(spidLevel, flow);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
}
export async function trackCieBottomSheetScreenView(flow: LoginType = "auth") {
  mixpanelTrack(
    "LOGIN_CIE_IDENTIFICATION_MODE",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}
export async function loginCieWizardSelected(flow: LoginType = "auth") {
  mixpanelTrack(
    "LOGIN_CIE_WIZARD_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}
export function trackSpidLoginSelected() {
  void mixpanelTrack(
    "LOGIN_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackSpidLoginIdpSelection(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTION",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
}

export function trackMethodInfo() {
  void mixpanelTrack("LOGIN_METHOD_INFO", buildEventProperties("UX", "exit"));
}

export function trackCieLoginSuccess(
  login_session: LoginSessionDuration,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIE_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      flow
    })
  );
}
// As in the `trackCieIDLoginSelected` event, there should be a `security_level` property;
// however, this value might differ from the one selected before,
// and this information cannot be retrieved in the current implementation at the flow step where this event is dispatched.
// TODO: Add the `security_level` property with the correct value.
export function trackCieIDLoginSuccess(
  login_session: LoginSessionDuration,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIEID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      flow
    })
  );
}

export function trackSpidLoginSuccess(
  login_session: LoginSessionDuration,
  idp: string,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_SPID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      idp,
      flow
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

export function trackLoginInfoTap() {
  void mixpanelTrack(
    "LOGIN_START_FLOW_INFO",
    buildEventProperties("UX", "action")
  );
}

export function trackLoginInfoResourceTap(
  resource_selected: "privacy_policy" | "manage_access" | "app_features"
) {
  void mixpanelTrack(
    "LOGIN_START_FLOW_RESOURCES_TAP",
    buildEventProperties("UX", "action", { resource_selected })
  );
}
