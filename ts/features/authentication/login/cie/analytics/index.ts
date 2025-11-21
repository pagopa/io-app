import { IdpCIE, IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../store/reducers/types";
import { buildEventProperties } from "../../../../../utils/analytics";
import { SpidLevel } from "../utils";
import { LoginType } from "../../../activeSessionLogin/screens/analytics";

export const trackCieIdNoWhitelistUrl = (
  url: string,
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_NO_WHITELIST_URL",
    buildEventProperties("KO", undefined, {
      url,
      flow
    })
  );
};

export const trackCieIdSecurityLevelMismatch = (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "SECURITY_LEVEL_MISMATCH",
    buildEventProperties("TECH", undefined, {
      flow
    })
  );
};

const SECURITY_LEVEL_MAP: Record<SpidLevel, "L2" | "L3"> = {
  SpidL2: "L2",
  SpidL3: "L3"
};

// Wizards screen view events
export const trackCieIdWizardScreen = async (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_CIEID",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
};
export const trackCiePinWizardScreen = async (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
};
export const trackSpidWizardScreen = async (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
};
export const trackIdpActivationWizardScreen = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_IDP_ACTIVATION",
    buildEventProperties("UX", "screen_view", {
      flow
    })
  );
};

export function trackLoginCieWizardCieIdSelected(
  spidLevel: SpidLevel,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel],
      flow
    })
  );
}
// Wizards action events
export const trackWizardCieIdSelected = async (
  state: GlobalState,
  spidLevel: SpidLevel,
  flow: LoginType = "auth"
) => {
  trackLoginCieWizardCieIdSelected(spidLevel, flow);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
};
export function trackLoginCieWizardCiePinSelected(flow: LoginType = "auth") {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
}
export const trackWizardCiePinSelected = async (
  state: GlobalState,
  flow: LoginType = "auth"
) => {
  trackLoginCieWizardCiePinSelected(flow);
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
};
export const trackWizardCiePinInfoSelected = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN_INFO",
    buildEventProperties("UX", "action", {
      flow
    })
  );
};
export const trackWizardSpidSelected = async (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
};

// Cie id not installed screen view events
export const trackCieIdNotInstalledScreen = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND",
    buildEventProperties("KO", "error", {
      flow
    })
  );
};
// Cie id not installed action events
export const trackCieIdNotInstalledDownloadAction = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND_DOWNLOAD",
    buildEventProperties("UX", "action", {
      flow
    })
  );
};

// Cie Id error screen view events
export const trackCieIdErrorCiePinFallbackScreen = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
};
export const trackCieIdErrorSpidFallbackScreen = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_SPID",
    buildEventProperties("KO", undefined, {
      flow
    })
  );
};

// Cie Id error screen action events
export const trackCieIdErrorCiePinSelected = async (
  flow: LoginType = "auth"
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
};
export const trackCieIdErrorSpidSelected = async (flow: LoginType = "auth") => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_SPID_SELECTED",
    buildEventProperties("UX", "action", {
      flow
    })
  );
};
