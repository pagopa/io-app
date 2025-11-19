import { IdpCIE, IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../store/reducers/types";
import { buildEventProperties } from "../../../../../utils/analytics";
import { SpidLevel } from "../utils";
import { LoginTypeEnum } from "../../../activeSessionLogin/screens/analytics";

export const trackCieIdNoWhitelistUrl = (
  url: string,
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_NO_WHITELIST_URL",
    buildEventProperties("KO", undefined, {
      url,
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};

export const trackCieIdSecurityLevelMismatch = () => {
  //  miss on ASL (check it)
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
export const trackCieIdWizardScreen = async (isReauth: boolean = false) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_CIEID",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackCiePinWizardScreen = async (isReauth: boolean = false) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackSpidWizardScreen = async (isReauth: boolean = false) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackIdpActivationWizardScreen = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_IDP_ACTIVATION",
    buildEventProperties("UX", "screen_view", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
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
export const trackWizardCiePinInfoSelected = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_PIN_INFO",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackWizardSpidSelected = async (isReauth: boolean = false) => {
  void mixpanelTrack(
    "LOGIN_CIE_WIZARD_SPID_SELECTED",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};

// Cie id not installed screen view events
export const trackCieIdNotInstalledScreen = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND",
    buildEventProperties("KO", "error", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
// Cie id not installed action events
export const trackCieIdNotInstalledDownloadAction = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_APP_NOT_FOUND_DOWNLOAD",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};

// Cie Id error screen view events
export const trackCieIdErrorCiePinFallbackScreen = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN",
    buildEventProperties("KO", undefined, {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackCieIdErrorSpidFallbackScreen = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_SPID",
    buildEventProperties("KO", undefined, {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};

// Cie Id error screen action events
export const trackCieIdErrorCiePinSelected = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_PIN_SELECTED",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
export const trackCieIdErrorSpidSelected = async (
  isReauth: boolean = false
) => {
  void mixpanelTrack(
    "LOGIN_CIEID_FALLBACK_CIE_SPID_SELECTED",
    buildEventProperties("UX", "action", {
      flow: isReauth ? LoginTypeEnum.REAUTH : LoginTypeEnum.AUTH
    })
  );
};
