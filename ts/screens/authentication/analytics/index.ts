import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../utils/analytics";
import { IdpCIE, IdpCIE_ID } from "../../../hooks/useNavigateToLoginMethod";
import { LoginSessionDuration } from "../../../features/fastLogin/analytics/optinAnalytics";
import { SpidLevel } from "../../../features/cieLogin/utils";
import { SpidLevelEnum } from "../../../../definitions/backend/SpidLevel";

const SECURITY_LEVEL_MAP: Record<SpidLevel, "L2" | "L3"> = {
  SpidL2: "L2",
  SpidL3: "L3"
};
const SECURITY_LEVELENUM_MAP: Record<SpidLevelEnum, "L1" | "L2" | "L3"> = {
  "https://www.spid.gov.it/SpidL1": "L1",
  "https://www.spid.gov.it/SpidL2": "L2",
  "https://www.spid.gov.it/SpidL3": "L3"
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
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
  mixpanelTrack("LOGIN_CIE_PIN_SELECTED", buildEventProperties("UX", "action"));
}
export async function trackCieIDLoginSelected(
  state: GlobalState,
  spidLevel: SpidLevel
) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
  mixpanelTrack(
    "LOGIN_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel]
    })
  );
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

export function trackCieIDLoginSuccess(
  login_session: LoginSessionDuration,
  spidLevel?: SpidLevelEnum
) {
  void mixpanelTrack(
    "LOGIN_CIEID_UX_SUCCESS",
    buildEventProperties("UX", "confirm", {
      login_session,
      security_level: spidLevel ? SECURITY_LEVELENUM_MAP[spidLevel] : spidLevel
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
export function trackToSWebViewError(flow: FlowType) {
  void mixpanelTrack(
    "TOS_LOAD_FAILURE",
    buildEventProperties("KO", undefined, { flow })
  );
}

export function trackToSWebViewErrorRetry(flow: FlowType) {
  void mixpanelTrack(
    "TOS_LOAD_RETRY",
    buildEventProperties("UX", "action", undefined, flow)
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
