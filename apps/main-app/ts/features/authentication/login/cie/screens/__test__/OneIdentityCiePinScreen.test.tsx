import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { merge } from "lodash";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import * as hooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as accessibilityUtils from "../../../../../../utils/accessibility";
import * as analyticsUtils from "../../../../../../utils/analytics";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as urlUtils from "../../../../../../utils/url";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as useCieInfoBottomSheetModule from "../../hooks/useCieInfoBottomSheet";
import { nfcIsEnabled } from "../../store/actions";
import { OneIdentityCiePinScreen } from "../OneIdentityCiePinScreen";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe("OneIdentityCiePinScreen", () => {
  const mockDispatch = jest.fn();
  const mockCieInfoBottomSheetPresent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest
      .spyOn(useCieInfoBottomSheetModule, "useCieInfoBottomSheet")
      .mockReturnValue({
        present: mockCieInfoBottomSheetPresent,
        dismiss: jest.fn(),
        bottomSheet: <></>
      });
  });

  it("should render OTPInput title, subtitleCTA and help banner", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(I18n.t("authentication.cie.pin.pinCardTitle"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.cie.pin.subtitleCTA"))
    ).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_title"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_content"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_action"))).toBeTruthy();
  });

  it("should call cieInfoBottomSheet.present() when subtitleCTA is pressed", () => {
    const { getByText } = renderComponent();
    const cta = getByText(I18n.t("authentication.cie.pin.subtitleCTA"));

    fireEvent.press(cta);

    expect(mockCieInfoBottomSheetPresent).toHaveBeenCalled();
  });

  it("should track the screen on first focus", () => {
    const spy = jest.spyOn(cieAnalytics, "trackLoginCiePinScreen");
    renderComponent();
    expect(spy).toHaveBeenCalled();
  });

  it("should focus pinPadViewRef on focus", () => {
    const focusSpy = jest.spyOn(accessibilityUtils, "setAccessibilityFocus");
    renderComponent();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("should dispatch nfcIsEnabled.request() and navigate to CIE_AUTH_SCREEN once the pin is complete", () => {
    const { getByLabelText } = renderComponent();

    const otpInput = getByLabelText(
      I18n.t("authentication.cie.pin.accessibility.label")
    );

    fireEvent(otpInput, "valueChange", "12345678");

    expect(mockDispatch).toHaveBeenCalledWith(nfcIsEnabled.request());
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_AUTH_SCREEN,
      params: { pin: "12345678" }
    });
  });

  it("should not navigate when the pin is not yet complete", () => {
    const { getByLabelText } = renderComponent();

    const otpInput = getByLabelText(
      I18n.t("authentication.cie.pin.accessibility.label")
    );

    fireEvent(otpInput, "valueChange", "1234");

    expect(mockDispatch).not.toHaveBeenCalledWith(nfcIsEnabled.request());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should track the help center CTA and open the help url when the banner is pressed", () => {
    const trackHelpCenterSpy = jest.spyOn(
      analyticsUtils,
      "trackHelpCenterCtaTapped"
    );
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(() => undefined);
    const { getByText } = renderComponent();

    const banner = getByText(I18n.t("login.help_banner_title"));
    fireEvent.press(banner);

    expect(trackHelpCenterSpy).toHaveBeenCalled();
    expect(openWebUrlSpy).toHaveBeenCalledTimes(1);
  });
});

function renderComponent(useUat = false) {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState = merge(undefined, initialState, {
    features: {
      loginFeatures: {
        cieLogin: {
          useUat
        }
      }
    }
  } as GlobalState);
  const store = createStore(appReducer, finalState);

  return renderScreenWithNavigationStoreContext(
    () => <OneIdentityCiePinScreen />,
    AUTHENTICATION_ROUTES.CIE_PIN_SCREEN,
    {},
    store
  );
}
