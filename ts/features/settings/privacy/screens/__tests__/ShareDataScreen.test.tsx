/* eslint-disable @typescript-eslint/no-var-requires */
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import ShareDataScreen from "../ShareDataScreen";
import * as hooks from "../../../../../store/hooks";
import { isMixpanelEnabled } from "../../../../../store/reducers/persistedPreferences";
import { tosConfigSelector } from "../../../../tos/store/selectors";

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: () => ({
    getState: jest.fn(() => ({}))
  })
}));

const mockDispatch = jest.fn();
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  hideAll: jest.fn()
};

describe("ShareDataScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    jest.clearAllMocks();

    (hooks.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector === tosConfigSelector) {
        return { tos_url: "https://example.com" };
      }
      if (selector === isMixpanelEnabled) {
        return false;
      }
      return undefined;
    });

    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.mock("@pagopa/io-app-design-system", () => {
      const actual = jest.requireActual("@pagopa/io-app-design-system");
      return {
        ...actual,
        useIOToast: () => mockToast
      };
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render the title and description", () => {
    const { getByTestId, getByText } = renderComponent();

    expect(getByTestId("share-data-component-title")).toBeTruthy();
    expect(
      getByText(I18n.t("profile.main.privacy.shareData.screen.description"))
    ).toBeTruthy();
  });

  it("should open bottom sheet when opting out from data sharing", () => {
    const presentMock = jest.fn();
    const useConfirmOptOutBottomSheet = require("../../shared/hooks/useConfirmOptOutBottomSheet");

    (hooks.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector === tosConfigSelector) {
        return { tos_url: "https://example.com" };
      }
      if (selector === isMixpanelEnabled) {
        return true;
      }
      return undefined;
    });

    jest
      .spyOn(useConfirmOptOutBottomSheet, "useConfirmOptOutBottomSheet")
      .mockReturnValue({
        present: presentMock,
        bottomSheet: null
      });

    const { getByText } = renderComponent();
    const button = getByText(
      I18n.t("profile.main.privacy.shareData.screen.cta.dontShareData")
    );

    fireEvent.press(button);
    expect(presentMock).toHaveBeenCalled();
  });

  it("should clear timeout on unmount", () => {
    const { unmount } = renderComponent();
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("should call trackMixpanelScreen on first render", () => {
    const trackScreenSpy = jest.spyOn(
      require("../../../common/analytics"),
      "trackMixpanelScreen"
    );

    renderComponent();
    expect(trackScreenSpy).toHaveBeenCalled();
  });

  it("should call trackMixPanelTrackingInfo when TOS link is pressed", () => {
    const trackInfoSpy = jest.spyOn(
      require("../../../common/analytics/mixpanel/mixpanelAnalytics"),
      "trackMixPanelTrackingInfo"
    );

    const { getByTestId } = renderComponent();
    const tosLink = getByTestId("additionalInformation");

    fireEvent.press(tosLink);
    expect(trackInfoSpy).toHaveBeenCalled();
  });

  it("should announce accessibility message after enabling sharing", () => {
    const announceSpy = jest.spyOn(
      require("react-native").AccessibilityInfo,
      "announceForAccessibilityWithOptions"
    );

    const { getByTestId } = renderComponent();
    const button = getByTestId("share-data-confirm-button");

    fireEvent.press(button);

    jest.runAllTimers();

    expect(announceSpy).toHaveBeenCalledWith(
      I18n.t("profile.main.privacy.shareData.screen.confirmToast"),
      { queue: true }
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    ShareDataScreen,
    SETTINGS_ROUTES.PROFILE_PRIVACY_SHARE_DATA,
    {},
    store
  );
};
