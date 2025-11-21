import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";
import { IdpCIE, IdpCIE_ID } from "../../login/hooks/useNavigateToLoginMethod";
import { LoginSessionDuration } from "../../fastLogin/analytics/optinAnalytics";
import { SpidLevel } from "../../../authentication/login/cie/utils";
import { LoginTypeEnum } from "../../activeSessionLogin/screens/analytics";

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
export function trackLoginCiePinSelected(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_CIE_PIN_SELECTED",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
export function trackLoginCieIdSelected(
  spidLevel: SpidLevel,
  isReauth: boolean = false
) {
  void mixpanelTrack(
    "LOGIN_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel],
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
// This event must be send when user taps on cie login button
export async function trackCieLoginSelected() {
  mixpanelTrack("LOGIN_CIE_SELECTED", buildEventProperties("UX", "action"));
}
export async function trackCiePinLoginSelected(
  state: GlobalState,
  isReauth: boolean = false
) {
  trackLoginCiePinSelected(isReauth);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
}
export async function trackCieIDLoginSelected(
  state: GlobalState,
  spidLevel: SpidLevel,
  isReauth: boolean = false
) {
  trackLoginCieIdSelected(spidLevel, isReauth);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
}
export async function trackCieBottomSheetScreenView(isReauth: boolean = false) {
  mixpanelTrack(
    "LOGIN_CIE_IDENTIFICATION_MODE",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
export async function loginCieWizardSelected(isReauth: boolean = false) {
  mixpanelTrack(
    "LOGIN_CIE_WIZARD_SELECTED",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
export function trackSpidLoginSelected() {
  void mixpanelTrack(
    "LOGIN_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackSpidLoginIdpSelection(isReauth: boolean = false) {
  void mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTION",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackMethodInfo() {
  void mixpanelTrack("LOGIN_METHOD_INFO", buildEventProperties("UX", "exit"));
}

export function trackCieLoginSuccess(
  login_session: LoginSessionDuration,
  isReauth: boolean = false
) {
  void mixpanelTrack(
    "LOGIN_CIE_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}
// As in the `trackCieIDLoginSelected` event, there should be a `security_level` property;
// however, this value might differ from the one selected before,
// and this information cannot be retrieved in the current implementation at the flow step where this event is dispatched.
// TODO: Add the `security_level` property with the correct value.
export function trackCieIDLoginSuccess(
  login_session: LoginSessionDuration,
  isReauth: boolean = false
) {
  void mixpanelTrack(
    "LOGIN_CIEID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
}

export function trackSpidLoginSuccess(
  login_session: LoginSessionDuration,
  idp: string,
  isReauth: boolean = false
) {
  void mixpanelTrack(
    "LOGIN_SPID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      idp,
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
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
