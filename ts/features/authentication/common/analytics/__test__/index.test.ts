import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  trackToSWebViewError,
  trackToSWebViewErrorRetry
} from "../../../../settings/privacy/shared/analytics";
import { SpidLevel } from "../../../login/cie/utils";
import {
  IdpCIE,
  IdpCIE_ID
} from "../../../login/hooks/useNavigateToLoginMethod";
import {
  trackLoginFlowStarting,
  trackCieLoginSelected,
  trackCiePinLoginSelected,
  trackCieIDLoginSelected,
  trackCieBottomSheetScreenView,
  loginCieWizardSelected,
  trackSpidLoginSelected,
  trackSpidLoginIdpSelection,
  trackMethodInfo,
  trackCieLoginSuccess,
  trackCieIDLoginSuccess,
  trackSpidLoginSuccess,
  trackTosUserExit,
  trackLoginUserExit,
  trackLoginEnded
} from "../index";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("analytics/index.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks login flow starting", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginFlowStarting();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_START_FLOW", props);
  });

  it("tracks cie login selected", async () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackCieLoginSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIE_SELECTED", props);
  });

  it("tracks cie pin login selected and updates profile", async () => {
    const props = { test: true };
    const mockState = { mock: "state" } as any;
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackCiePinLoginSelected(mockState);
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIE_PIN_SELECTED", props);
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_METHOD",
      value: IdpCIE.id
    });
  });

  it("tracks cieID login selected with spid level", async () => {
    const props = { test: true };
    const mockState = { mock: "state" } as any;
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackCieIDLoginSelected(mockState, "SpidL2" as SpidLevel);
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIEID_SELECTED", props);
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_METHOD",
      value: IdpCIE_ID.id
    });
  });

  it("tracks cie bottom sheet screen", async () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackCieBottomSheetScreenView();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_IDENTIFICATION_MODE",
      props
    );
  });

  it("tracks cie wizard selected", async () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await loginCieWizardSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_SELECTED",
      props
    );
  });

  it("tracks spid login selected", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackSpidLoginSelected();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_SPID_SELECTED", props);
  });

  it("tracks spid idp selection", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackSpidLoginIdpSelection();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SPID_IDP_SELECTION",
      props
    );
  });

  it("tracks method info", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackMethodInfo();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_METHOD_INFO", props);
  });

  it("tracks cie login success", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackCieLoginSuccess("365");
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIE_UX_SUCCESS", props);
  });

  it("tracks cieID login success", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackCieIDLoginSuccess("365");
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIEID_UX_SUCCESS", props);
  });

  it("tracks spid login success", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackSpidLoginSuccess("30", "idp_name");
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_SPID_UX_SUCCESS", props);
  });

  it("tracks tos user exit", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackTosUserExit("onBoarding");
    expect(mixpanelTrack).toHaveBeenCalledWith("TOS_USER_EXIT", props);
  });

  it("tracks tos load failure", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackToSWebViewError("onBoarding");
    expect(mixpanelTrack).toHaveBeenCalledWith("TOS_LOAD_FAILURE", props);
  });

  it("tracks tos retry", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackToSWebViewErrorRetry("onBoarding");
    expect(mixpanelTrack).toHaveBeenCalledWith("TOS_LOAD_RETRY", props);
  });

  it("tracks login user exit", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginUserExit();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_USER_EXIT", props);
  });

  it("tracks login ended with flow", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginEnded(true, "idp-test", "onBoarding", "LoginScreen");
    expect(buildEventProperties).toHaveBeenCalledWith(
      "UX",
      "action",
      {
        screen_name: "LoginScreen",
        login_veloce: true,
        idp: "idp-test"
      },
      "onBoarding"
    );
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_ENDED", props);
  });
});
