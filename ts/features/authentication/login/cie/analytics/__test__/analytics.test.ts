import {
  trackCieIdNoWhitelistUrl,
  trackCieIdSecurityLevelMismatch,
  trackCieIdWizardScreen,
  trackCiePinWizardScreen,
  trackSpidWizardScreen,
  trackIdpActivationWizardScreen,
  trackWizardCieIdSelected,
  trackWizardCiePinSelected,
  trackWizardCiePinInfoSelected,
  trackWizardSpidSelected,
  trackCieIdNotInstalledScreen,
  trackCieIdNotInstalledDownloadAction,
  trackCieIdErrorCiePinFallbackScreen,
  trackCieIdErrorSpidFallbackScreen,
  trackCieIdErrorCiePinSelected,
  trackCieIdErrorSpidSelected
} from "..";

import { mixpanelTrack } from "../../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../../mixpanelConfig/profileProperties";
import { IdpCIE, IdpCIE_ID } from "../../../hooks/useNavigateToLoginMethod";
import { GlobalState } from "../../../../../../store/reducers/types";

jest.mock("../../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("Analytics", () => {
  const dummyState = {} as GlobalState;

  it("trackCieIdNoWhitelistUrl", () => {
    trackCieIdNoWhitelistUrl("https://fake.url");
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_NO_WHITELIST_URL",
      expect.objectContaining({ url: "https://fake.url" })
    );
  });

  it("trackCieIdSecurityLevelMismatch", () => {
    trackCieIdSecurityLevelMismatch();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SECURITY_LEVEL_MISMATCH",
      expect.any(Object)
    );
  });

  it("trackCieIdWizardScreen", async () => {
    await trackCieIdWizardScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_CIEID",
      expect.any(Object)
    );
  });

  it("trackCiePinWizardScreen", async () => {
    await trackCiePinWizardScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_PIN",
      expect.any(Object)
    );
  });

  it("trackSpidWizardScreen", async () => {
    await trackSpidWizardScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_SPID",
      expect.any(Object)
    );
  });

  it("trackIdpActivationWizardScreen", async () => {
    await trackIdpActivationWizardScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_IDP_ACTIVATION",
      expect.any(Object)
    );
  });

  it("trackWizardCieIdSelected", async () => {
    await trackWizardCieIdSelected(dummyState, "SpidL2");
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_CIEID_SELECTED",
      expect.objectContaining({
        security_level: "L2"
      })
    );
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(dummyState, {
      property: "LOGIN_METHOD",
      value: IdpCIE_ID.id
    });
  });

  it("trackWizardCiePinSelected", async () => {
    await trackWizardCiePinSelected(dummyState);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_PIN_SELECTED",
      expect.any(Object)
    );
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(dummyState, {
      property: "LOGIN_METHOD",
      value: IdpCIE.id
    });
  });

  it("trackWizardCiePinInfoSelected", async () => {
    await trackWizardCiePinInfoSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_PIN_INFO",
      expect.any(Object)
    );
  });

  it("trackWizardSpidSelected", async () => {
    await trackWizardSpidSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_SPID_SELECTED",
      expect.any(Object)
    );
  });

  it("trackCieIdNotInstalledScreen", async () => {
    await trackCieIdNotInstalledScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_APP_NOT_FOUND",
      expect.any(Object)
    );
  });

  it("trackCieIdNotInstalledDownloadAction", async () => {
    await trackCieIdNotInstalledDownloadAction();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_APP_NOT_FOUND_DOWNLOAD",
      expect.any(Object)
    );
  });

  it("trackCieIdErrorCiePinFallbackScreen", async () => {
    await trackCieIdErrorCiePinFallbackScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_FALLBACK_CIE_PIN",
      expect.any(Object)
    );
  });

  it("trackCieIdErrorSpidFallbackScreen", async () => {
    await trackCieIdErrorSpidFallbackScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_FALLBACK_SPID",
      expect.any(Object)
    );
  });

  it("trackCieIdErrorCiePinSelected", async () => {
    await trackCieIdErrorCiePinSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_FALLBACK_CIE_PIN_SELECTED",
      expect.any(Object)
    );
  });

  it("trackCieIdErrorSpidSelected", async () => {
    await trackCieIdErrorSpidSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIEID_FALLBACK_CIE_SPID_SELECTED",
      expect.any(Object)
    );
  });
});
