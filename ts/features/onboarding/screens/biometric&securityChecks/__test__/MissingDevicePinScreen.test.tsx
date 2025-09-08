import { createStore } from "redux";
import I18n from "i18next";
import MissingDevicePinScreen from "../MissingDevicePinScreen";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";

jest.mock("../../../../../store/hooks", () => {
  const original = jest.requireActual("../../../../../store/hooks");

  return {
    ...original,
    useIODispatch: jest.fn()
  };
});

jest.mock("../../../../../utils/analytics", () => ({
  getFlowType: jest.fn(() => "test-flow"),
  buildEventProperties: jest.fn(() => ({}))
}));

jest.mock("../../../../settings/security/shared/analytics", () => ({
  trackPinEducationalScreen: jest.fn()
}));

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({
    showAlert: jest.fn()
  })
}));

describe("MissingDevicePinScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly title and subtitle", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("onboarding.biometric.unavailable.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("onboarding.biometric.unavailable.subtitle"))
    ).toBeTruthy();
  });

  it("renders all list items", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("onboarding.biometric.unavailable.body.step1.label"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("onboarding.biometric.unavailable.body.step2.label"))
    ).toBeTruthy();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    MissingDevicePinScreen,
    ROUTES.ONBOARDING_MISSING_DEVICE_PIN,
    {},
    store
  );
};
