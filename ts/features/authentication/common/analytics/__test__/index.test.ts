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
  trackLoginEnded,
  trackSessionTokenSource,
  trackSessionTokenFragmentFailure
} from "../index";
import * as MIXPANEL from "../../../../../mixpanel";
import * as PROFILEPROPERTIES from "../../../../../mixpanelConfig/profileProperties";

describe("analytics/index.ts", () => {
  const mixpanelTrackSpyOn = jest
    .spyOn(MIXPANEL, "mixpanelTrack")
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks login flow starting", () => {
    trackLoginFlowStarting();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_START_FLOW", {
      event_category: "UX",
      event_type: "screen_view"
    });
  });

  it("tracks cie login selected", async () => {
    await trackCieLoginSelected();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_CIE_SELECTED", {
      event_category: "UX",
      event_type: "action"
    });
  });

  it("tracks cie pin login selected and updates profile", async () => {
    const updateMixpanelProfilePropertiesSpyOn = jest
      .spyOn(PROFILEPROPERTIES, "updateMixpanelProfileProperties")
      .mockImplementation(_state => new Promise(resolve => resolve()));

    const state = { mock: "state" } as any;
    await trackCiePinLoginSelected(state);

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_CIE_PIN_SELECTED", {
      event_category: "UX",
      event_type: "action",
      flow: "auth"
    });

    expect(updateMixpanelProfilePropertiesSpyOn).toHaveBeenCalledWith(state, {
      property: "LOGIN_METHOD",
      value: IdpCIE.id
    });
  });

  it("tracks cieID login selected with spid level", async () => {
    const updateMixpanelProfilePropertiesSpyOn = jest
      .spyOn(PROFILEPROPERTIES, "updateMixpanelProfileProperties")
      .mockImplementation(_state => new Promise(resolve => resolve()));

    const state = { mock: "state" } as any;
    await trackCieIDLoginSelected(state, "SpidL2" as SpidLevel);

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_CIEID_SELECTED", {
      event_category: "UX",
      event_type: "action",
      flow: "auth",
      security_level: "L2"
    });

    expect(updateMixpanelProfilePropertiesSpyOn).toHaveBeenCalledWith(state, {
      property: "LOGIN_METHOD",
      value: IdpCIE_ID.id
    });
  });

  it("tracks cie bottom sheet screen", async () => {
    await trackCieBottomSheetScreenView();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith(
      "LOGIN_CIE_IDENTIFICATION_MODE",
      {
        event_category: "UX",
        event_type: "screen_view",
        flow: "auth"
      }
    );
  });

  it("tracks cie wizard selected", async () => {
    await loginCieWizardSelected();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith(
      "LOGIN_CIE_WIZARD_SELECTED",
      {
        event_category: "UX",
        event_type: "action",
        flow: "auth"
      }
    );
  });

  it("tracks spid login selected", () => {
    trackSpidLoginSelected();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_SPID_SELECTED", {
      event_category: "UX",
      event_type: "action"
    });
  });

  it("tracks spid idp selection", () => {
    trackSpidLoginIdpSelection();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith(
      "LOGIN_SPID_IDP_SELECTION",
      {
        event_category: "UX",
        event_type: "screen_view",
        flow: "auth"
      }
    );
  });

  it("tracks method info", () => {
    trackMethodInfo();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_METHOD_INFO", {
      event_category: "UX",
      event_type: "exit"
    });
  });

  it("tracks cie login success", () => {
    trackCieLoginSuccess("365");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_CIE_UX_SUCCESS", {
      event_category: "UX",
      event_type: "confirm",
      flow: "auth",
      login_session: "365"
    });
  });

  it("tracks cieID login success", () => {
    trackCieIDLoginSuccess("365");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_CIEID_UX_SUCCESS", {
      event_category: "UX",
      event_type: "confirm",
      login_session: "365",
      flow: "auth"
    });
  });

  it("tracks spid login success", () => {
    trackSpidLoginSuccess("30", "idp_name");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_SPID_UX_SUCCESS", {
      event_category: "UX",
      event_type: "confirm",
      flow: "auth",
      idp: "idp_name",
      login_session: "30"
    });
  });

  it("tracks tos user exit", () => {
    trackTosUserExit("onBoarding");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("TOS_USER_EXIT", {
      event_category: "UX",
      event_type: "exit",
      flow: "onBoarding"
    });
  });

  it("tracks tos load failure", () => {
    trackToSWebViewError("onBoarding");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("TOS_LOAD_FAILURE", {
      event_category: "KO",
      flow: "onBoarding"
    });
  });

  it("tracks tos retry", () => {
    trackToSWebViewErrorRetry("onBoarding");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("TOS_LOAD_RETRY", {
      event_category: "UX",
      event_type: "action",
      flow: "onBoarding"
    });
  });

  it("tracks login user exit", () => {
    trackLoginUserExit();

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_USER_EXIT", {
      event_category: "UX",
      event_type: "exit"
    });
  });

  it("tracks login ended with flow", () => {
    trackLoginEnded(true, "idp-test", "onBoarding", "LoginScreen");

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("LOGIN_ENDED", {
      event_category: "UX",
      event_type: "action",
      screen_name: "LoginScreen",
      login_veloce: true,
      idp: "idp-test",
      flow: "onBoarding"
    });
  });

  (["fragment", "queryParam"] as const).forEach(source =>
    it(`should call trackSessionTokenSource with proper parameters (source: ${source})`, () => {
      trackSessionTokenSource(source);

      expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
      expect(mixpanelTrackSpyOn).toHaveBeenCalledWith("SESSION_TOKEN_SOURCE", {
        event_category: "TECH",
        source
      });
    })
  );

  it("should call trackSessionTokenFragmentFailure with proper parameters", () => {
    const reason = "Some error message";
    trackSessionTokenFragmentFailure(reason);

    expect(mixpanelTrackSpyOn).toHaveBeenCalledTimes(1);
    expect(mixpanelTrackSpyOn).toHaveBeenCalledWith(
      "SESSION_TOKEN_FRAGMENT_FAILURE",
      {
        event_category: "TECH",
        reason
      }
    );
  });
});
