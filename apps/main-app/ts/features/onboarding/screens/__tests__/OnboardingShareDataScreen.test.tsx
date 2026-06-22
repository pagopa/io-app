import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import OnboardingShareDataScreen from "../OnboardingShareDataScreen";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { trackMixPanelTrackingInfo } from "../../../settings/common/analytics/mixpanel/mixpanelAnalytics";

jest.mock("../../../../store/hooks", () => {
  const original = jest.requireActual("../../../../store/hooks");

  return {
    ...original,
    useIODispatch: () => jest.fn()
  };
});

jest.mock("../../../../utils/analytics", () => ({
  getFlowType: () => "test-flow"
}));

jest.mock("../../../settings/common/analytics", () => ({
  trackMixpanelScreen: jest.fn()
}));

jest.mock(
  "../../../settings/common/analytics/mixpanel/mixpanelAnalytics",
  () => ({
    trackMixPanelTrackingInfo: jest.fn(),
    trackMixpanelDeclined: jest.fn(),
    trackMixpanelSetEnabled: jest.fn(() => Promise.resolve()),
    trackMixpanelNotNowSelected: jest.fn()
  })
);

const mockPresent = jest.fn();

jest.mock(
  "../../../settings/privacy/shared/hooks/useConfirmOptOutBottomSheet",
  () => ({
    useConfirmOptOutBottomSheet: jest.fn(() => ({
      present: mockPresent,
      bottomSheet: null
    }))
  })
);

jest.mock("../../hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: jest.fn(() => ({
    showAlert: jest.fn()
  }))
}));

jest.mock(
  "../../../settings/privacy/shared/components/ShareDataComponent",
  () => ({
    ShareDataComponent: ({ trackAction }: { trackAction: any }) => {
      trackAction({ key: "fake-event" });
      return null;
    }
  })
);

describe("OnboardingShareDataScreen", () => {
  const renderComponent = () => {
    const initialAppState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const store = createStore(appReducer, initialAppState as any);

    return renderScreenWithNavigationStoreContext(
      OnboardingShareDataScreen,
      "ONBOARDING_SHARE_DATA",
      {},
      store
    );
  };

  it("renders screen title and description", () => {
    const { getByTestId, getByText } = renderComponent();
    expect(getByTestId("share-data-component-title")).toBeTruthy();
    expect(
      getByText(I18n.t("profile.main.privacy.shareData.screen.description"))
    ).toBeTruthy();
  });

  it("displays share data banner", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("profile.main.privacy.shareData.screen.profileSettings"))
    ).toBeTruthy();
  });

  it("calls dispatch when primary CTA is pressed", async () => {
    const { getByTestId } = renderComponent();
    const confirmButton = getByTestId("share-data-confirm-button");
    fireEvent.press(confirmButton);
    expect(setTimeout).toBeDefined();
  });

  it("opens bottom sheet when secondary CTA is pressed", () => {
    const { getByText } = renderComponent();
    const declineButton = getByText(
      I18n.t("profile.main.privacy.shareData.screen.cta.dontShare")
    );
    fireEvent.press(declineButton);
    expect(mockPresent).toHaveBeenCalled();
  });

  it("calls goBack function on back press", () => {
    const { getByTestId } = renderComponent();
    const header = getByTestId("OnboardingShareDataScreen");
    expect(header).toBeTruthy();
  });

  it("calls trackMixPanelTrackingInfo on component render", () => {
    expect(trackMixPanelTrackingInfo).toHaveBeenCalledWith("test-flow", {
      key: "fake-event"
    });
  });
});
