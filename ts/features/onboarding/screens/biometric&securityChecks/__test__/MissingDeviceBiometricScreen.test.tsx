import { createStore } from "redux";
import I18n from "i18next";
import MissingDeviceBiometricScreen from "../MissingDeviceBiometricScreen";
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
  trackBiometricConfigurationEducationalScreen: jest.fn()
}));

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({
    showAlert: jest.fn()
  })
}));

describe("MissingDeviceBiometricScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly title and subtitle", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("onboarding.biometric.available.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("onboarding.biometric.available.body.notEnrolled.label"))
    ).toBeTruthy();
  });

  it("renders all list items", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(
        I18n.t("onboarding.biometric.available.body.notEnrolled.step1.label")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("onboarding.biometric.available.body.notEnrolled.step2.label")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("onboarding.biometric.available.body.notEnrolled.step3.label")
      )
    ).toBeTruthy();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    MissingDeviceBiometricScreen,
    ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC,
    {},
    store
  );
};
