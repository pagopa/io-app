import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";
import { IdpCIE, IdpCIE_ID } from "../../login/hooks/useNavigateToLoginMethod";
import { LoginSessionDuration } from "../../fastLogin/analytics/optinAnalytics";
import { SpidLevel } from "../../../authentication/login/cie/utils";

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

// This event must be send when user taps on cie login button
export async function trackCieLoginSelected() {
  mixpanelTrack("LOGIN_CIE_SELECTED", buildEventProperties("UX", "action"));
}
export async function trackCiePinLoginSelected(state: GlobalState) {
  mixpanelTrack("LOGIN_CIE_PIN_SELECTED", buildEventProperties("UX", "action"));
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
}
export async function trackCieIDLoginSelected(
  state: GlobalState,
  spidLevel: SpidLevel
) {
  mixpanelTrack(
    "LOGIN_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel]
    })
  );
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
}
export async function trackCieBottomSheetScreenView() {
  mixpanelTrack(
    "LOGIN_CIE_IDENTIFICATION_MODE",
    buildEventProperties("UX", "screen_view")
  );
}
export async function loginCieWizardSelected() {
  mixpanelTrack(
    "LOGIN_CIE_WIZARD_SELECTED",
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
// As in the `trackCieIDLoginSelected` event, there should be a `security_level` property;
// however, this value might differ from the one selected before,
// and this information cannot be retrieved in the current implementation at the flow step where this event is dispatched.
// TODO: Add the `security_level` property with the correct value.
export function trackCieIDLoginSuccess(login_session: LoginSessionDuration) {
  void mixpanelTrack(
    "LOGIN_CIEID_UX_SUCCESS",
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
