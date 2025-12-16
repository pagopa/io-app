import { fireEvent } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import I18n from "i18next";
import OnboardingServicesPreferenceScreen from "../OnboardingServicesPreferenceScreen";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { useIOSelector } from "../../../../store/hooks";
import { profileUpsert } from "../../../settings/common/store/actions";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockToast = {
  hideAll: jest.fn(),
  success: jest.fn(),
  error: jest.fn()
};

jest.mock("../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: jest.fn(),
  useIOStore: () => ({
    getState: jest.fn()
  })
}));

jest.mock("../../../../navigation/params/AppParamsList", () => {
  const actual = jest.requireActual(
    "../../../../navigation/params/AppParamsList"
  );
  return {
    ...actual,
    useIONavigation: () => ({
      navigate: mockNavigate
    })
  };
});

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useIOToast: () => mockToast
  };
});

jest.mock("../../../../utils/analytics", () => ({
  getFlowType: jest.fn(() => "mock-flow"),
  trackServiceConfiguration: jest.fn(),
  trackServiceConfigurationScreen: jest.fn(),
  buildEventProperties: jest.fn(() => ({}))
}));

const mockPresent = jest.fn();

jest.mock(
  "../../../settings/preferences/shared/hooks/useManualConfigBottomSheet",
  () => ({
    useManualConfigBottomSheet: jest.fn(() => ({
      present: mockPresent,
      manualConfigBottomSheet: null
    }))
  })
);

// eslint-disable-next-line functional/no-let
let currentMockedState: {
  profile: pot.Pot<any, Error>;
  profileServicePreferencesMode?: ServicesPreferencesModeEnum;
} = {
  profile: pot.none,
  profileServicePreferencesMode: undefined
};

beforeEach(() => {
  (useIOSelector as jest.Mock).mockImplementation((selector: any) => {
    const name = selector.name;
    if (name === "profileSelector") {
      return currentMockedState.profile;
    }
    if (name === "profileServicePreferencesModeSelector") {
      return currentMockedState.profileServicePreferencesMode;
    }
    return undefined;
  });
  jest.clearAllMocks();
});

describe("OnboardingServicesPreferenceScreen", () => {
  it("renders correctly", () => {
    const { getAllByText } = renderComponent();
    expect(
      getAllByText(I18n.t("services.optIn.preferences.title"))[0]
    ).toBeTruthy();
    expect(
      getAllByText(I18n.t("services.optIn.preferences.body"))[0]
    ).toBeTruthy();
  });

  it("disables the confirm button when no mode is selected", () => {
    const { getByLabelText } = renderComponent();
    const confirmButton = getByLabelText(I18n.t("global.buttons.confirm"));
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("shows the banner with the correct message", () => {
    const { getByText } = renderComponent();
    expect(getByText(I18n.t("services.optIn.preferences.banner"))).toBeTruthy();
  });

  it("calls dispatch when AUTO mode is selected", () => {
    const { getByText } = renderComponent();
    const autoButton = getByText(
      I18n.t("services.optIn.preferences.quickConfig.title")
    );
    fireEvent.press(autoButton);
    expect(mockDispatch).toHaveBeenCalledWith(
      profileUpsert.request({
        service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO }
      })
    );
  });

  it("opens confirmation modal when MANUAL mode is selected", () => {
    const { getByText } = renderComponent();
    const manualButton = getByText(
      I18n.t("services.optIn.preferences.manualConfig.title")
    );
    fireEvent.press(manualButton);
    expect(mockPresent).toHaveBeenCalled();
  });
});

const renderComponent = (
  customState: Partial<typeof currentMockedState> = {},
  isFirstOnboarding = true
) => {
  currentMockedState = {
    ...currentMockedState,
    ...customState
  };

  const initialAppState = appReducer(
    undefined,
    applicationChangeState("active")
  );
  const store = createStore(appReducer, initialAppState as any);

  return renderScreenWithNavigationStoreContext(
    OnboardingServicesPreferenceScreen,
    ROUTES.ONBOARDING_SERVICES_PREFERENCE,
    { isFirstOnboarding },
    store
  );
};
