import { IdpCIE, IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../store/reducers/types";
import { buildEventProperties } from "../../../../../utils/analytics";
import { SpidLevel } from "../utils";

export const trackCieIdNoWhitelistUrl = (url: string) => {
  void mixpanelTrack(
    "LOGIN_CIEID_NO_WHITELIST_URL",
    buildEventProperties("KO", undefined, { url })
  );
};

export const trackCieIdSecurityLevelMismatch = () => {
  void mixpanelTrack(
    "SECURITY_LEVEL_MISMATCH",
    buildEventProperties("TECH", undefined)
  );
};

const SECURITY_LEVEL_MAP: Record<SpidLevel, "L2" | "L3"> = {
  SpidL2: "L2",
  SpidL3: "L3"
};

// Wizards screen view events
export const trackCieIdWizardScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_CIEID",
    buildEventProperties("UX", "screen_view")
  );
};
export const trackCiePinWizardScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN",
    buildEventProperties("UX", "screen_view")
  );
};
export const trackSpidWizardScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID",
    buildEventProperties("UX", "screen_view")
  );
};
export const trackIdpActivationWizardScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_IDP_ACTIVATION",
    buildEventProperties("UX", "screen_view")
  );
};

// Wizards action events
export const trackWizardCieIdSelected = async (
  state: GlobalState,
  spidLevel: SpidLevel
) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_CIEID_SELECTED",
    buildEventProperties("UX", "action", {
      security_level: SECURITY_LEVEL_MAP[spidLevel]
    })
  );
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE_ID.id
  });
};
export const trackWizardCiePinSelected = async (state: GlobalState) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN_SELECTED",
    buildEventProperties("UX", "action")
  );
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: IdpCIE.id
  });
};
export const trackWizardCiePinInfoSelected = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN_INFO",
    buildEventProperties("UX", "action")
  );
};
export const trackWizardSpidSelected = async () => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
};

// Cie id not installed screen view events
export const trackCieIdNotInstalledScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND",
    buildEventProperties("KO", "error")
  );
};
// Cie id not installed action events
export const trackCieIdNotInstalledDownloadAction = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND_DOWNLOAD",
    buildEventProperties("UX", "action")
  );
};

// Cie Id error screen view events
export const trackCieIdErrorCiePinFallbackScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN",
    buildEventProperties("KO", undefined)
  );
};
export const trackCieIdErrorSpidFallbackScreen = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_SPID",
    buildEventProperties("KO", undefined)
  );
};

// Cie Id error screen action events
export const trackCieIdErrorCiePinSelected = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN_SELECTED",
    buildEventProperties("UX", "action")
  );
};
export const trackCieIdErrorSpidSelected = async () => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
};
