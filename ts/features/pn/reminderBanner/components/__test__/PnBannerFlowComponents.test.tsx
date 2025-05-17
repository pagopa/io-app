import { RenderAPI, fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { createStore } from "redux";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { openWebUrl } from "../../../../../utils/url";
import { sendBannerMixpanelEvents } from "../../../analytics/activationReminderBanner";
import PN_ROUTES from "../../../navigation/routes";
import { PnBannerFlowComponents } from "../PnBannerFlowComponents";

const { LoadingScreen, SuccessScreen, ErrorScreen, CtaScreen } =
  PnBannerFlowComponents;

jest.mock("../../../../../utils/hooks/useOnFirstRender", () => ({
  useOnFirstRender: (callback: () => void) => {
    callback();
  }
}));

jest.mock("../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

jest.mock("../../../analytics/activationReminderBanner", () => ({
  sendBannerMixpanelEvents: {
    alreadyActive: jest.fn(),
    activationSuccess: jest.fn(),
    bannerKO: jest.fn()
  }
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn().mockReturnValue({
    navigate: jest.fn()
  })
}));

const mockPrivacyUrl = "https://example.com/privacy";
const mockTosUrl = "https://example.com/tos";

describe("PnBannerFlowComponents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("LoadingScreen", () => {
    it("should display loading component with correct title for LOADING-ACTIVATION state", () => {
      const flowState = "LOADING-ACTIVATION";
      const { toJSON, getByTestId } = renderLoadingScreen(flowState);
      expect(getByTestId(`loading-${flowState}`)).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it("should display loading component with correct title for LOADING-DATA state", () => {
      const flowState = "LOADING-DATA";
      const { toJSON, getByTestId } = renderLoadingScreen(flowState);
      expect(getByTestId(`loading-${flowState}`)).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe("SuccessScreen", () => {
    it("should match snapshot and dispatch the correct analytics for its state on first render", () => {
      const flowState = "SUCCESS_ACTIVATION";
      const { toJSON } = renderSuccessScreen(flowState);

      expect(sendBannerMixpanelEvents.activationSuccess).toHaveBeenCalled();
      expect(sendBannerMixpanelEvents.alreadyActive).not.toHaveBeenCalled();

      expect(toJSON()).toMatchSnapshot();
    });

    it("should trigger alreadyActive analytics event for ALREADY_ACTIVE state", () => {
      const flowState = "ALREADY_ACTIVE";
      renderSuccessScreen(flowState);

      expect(sendBannerMixpanelEvents.alreadyActive).toHaveBeenCalled();
      expect(sendBannerMixpanelEvents.activationSuccess).not.toHaveBeenCalled();
    });
    it("should not trigger any analytics in case of a wrong flowState (the component should always be called with the correct flowState)", () => {
      const flowState = "WRONG_FLOW_STATE" as SuccessProps["flowState"];
      renderSuccessScreen(flowState);
      const { alreadyActive, activationSuccess, bannerKO } =
        sendBannerMixpanelEvents;
      [alreadyActive, activationSuccess, bannerKO].forEach(mockMixpanelCall => {
        expect(mockMixpanelCall).not.toHaveBeenCalled();
      });
    });
    it("should navigate to home when close button is pressed", () => {
      const mockNavigate = jest.fn();

      (useIONavigation as jest.Mock).mockReturnValue({
        navigate: mockNavigate
      });

      const { getByTestId } = renderSuccessScreen();

      fireEvent.press(getByTestId("success-cta"));

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
        screen: "MESSAGES_HOME"
      });
    });
  });

  describe("ErrorScreen", () => {
    it("should render with correct test ID, and also match snapshot", () => {
      const flowState = "FAILURE_DETAILS_FETCH";
      const { toJSON, getByTestId } = renderErrorScreen(flowState);
      expect(getByTestId(`error-${flowState}`)).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });
    it("should trigger bannerKO analytics event with current flow state", () => {
      const flowState = "FAILURE_ACTIVATION";
      renderErrorScreen(flowState);

      expect(sendBannerMixpanelEvents.bannerKO).toHaveBeenCalledWith(flowState);
    });

    it("should navigate to home when close button is pressed", () => {
      const mockNavigate = jest.fn();
      (useIONavigation as jest.Mock).mockReturnValue({
        navigate: mockNavigate
      });

      const { getByTestId } = renderErrorScreen();
      fireEvent.press(getByTestId("error-cta"));

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
        screen: "MESSAGES_HOME"
      });
    });
  });

  describe("CtaScreen", () => {
    beforeEach(() => {
      jest
        .spyOn(REMOTE_CONFIG, "pnPrivacyUrlsSelector")
        .mockImplementation(() => ({
          privacy: mockPrivacyUrl,
          tos: mockTosUrl
        }));
    });

    it("should correctly render and match snapshot", () => {
      const component = renderCtaScreen();
      expect(component.getByTestId("cta-WAITING_USER_INPUT")).toBeTruthy();
      expect(component).toMatchSnapshot();
    });

    it("should open privacy URL when privacy link is pressed", () => {
      const { getByTestId } = renderCtaScreen();

      const privacyLink = getByTestId("privacy-url");
      fireEvent.press(privacyLink);

      expect(openWebUrl).toHaveBeenCalledWith(mockPrivacyUrl);
    });

    it("should open TOS URL when TOS link is pressed", () => {
      const { getByTestId } = renderCtaScreen();

      const tosLink = getByTestId("tos-url");
      fireEvent.press(tosLink);

      expect(openWebUrl).toHaveBeenCalledWith(mockTosUrl);
    });
  });
});

const getMockScrollViewActions = (
  onPress = jest.fn()
): IOScrollViewActions => ({
  primary: {
    label: "A_LABEL",
    onPress,
    testID: "enable-pn-cta"
  },
  type: "SingleButton"
});

type LoadingProps = React.ComponentProps<typeof LoadingScreen>;
const renderLoadingScreen = (
  flowState: LoadingProps["loadingState"] = "LOADING-ACTIVATION"
) => renderComponent(<LoadingScreen loadingState={flowState} />);

type SuccessProps = React.ComponentProps<typeof SuccessScreen>;
const renderSuccessScreen = (
  flowState: SuccessProps["flowState"] = "ALREADY_ACTIVE"
) => renderComponent(<SuccessScreen flowState={flowState} />);

type ErrorProps = React.ComponentProps<typeof ErrorScreen>;
const renderErrorScreen = (
  flowState: ErrorProps["flowState"] = "FAILURE_ACTIVATION"
) => renderComponent(<ErrorScreen flowState={flowState} />);

const renderCtaScreen = () =>
  renderComponent(<CtaScreen scrollViewAction={getMockScrollViewActions()} />);

const renderComponent = (Component = <></>): RenderAPI => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => Component,
    PN_ROUTES.ACTIVATION_BANNER_FLOW,
    {},
    store
  );
};
