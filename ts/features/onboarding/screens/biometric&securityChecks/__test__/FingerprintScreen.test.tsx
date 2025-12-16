import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import FingerprintScreen from "../FingerprintScreen";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../../../store/actions/persistedPreferences";
import * as biometrics from "../../../../../utils/biometrics";
import * as analytics from "../../../../settings/security/shared/analytics";
import * as hooks from "../../../../../store/hooks";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

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

jest.mock("../../../../../utils/biometrics", () => ({
  mayUserActivateBiometric: jest.fn()
}));

jest.mock("../../../../settings/security/shared/analytics", () => ({
  trackBiometricActivationAccepted: jest.fn(),
  trackBiometricActivationDeclined: jest.fn(),
  trackBiometricActivationEducationalScreen: jest.fn()
}));

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({
    showAlert: jest.fn()
  })
}));

describe("FingerprintScreen", () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(dispatchMock);
  });

  it("renders correctly with title and body", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("onboarding.biometric.available.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("onboarding.biometric.available.body.text"))
    ).toBeTruthy();
  });

  it("handles successful biometric activation", async () => {
    (biometrics.mayUserActivateBiometric as jest.Mock).mockResolvedValue(true);

    const { getByLabelText } = renderComponent();
    const activateButton = getByLabelText(I18n.t("global.buttons.activate2"));

    fireEvent.press(activateButton);

    await waitFor(() => {
      expect(biometrics.mayUserActivateBiometric).toHaveBeenCalled();
      expect(analytics.trackBiometricActivationAccepted).toHaveBeenCalledWith(
        "test-flow"
      );
      expect(dispatchMock).toHaveBeenCalledWith(
        preferenceFingerprintIsEnabledSaveSuccess({
          isFingerprintEnabled: true
        })
      );
    });
  });

  it("handles biometric activation permission denied", async () => {
    (biometrics.mayUserActivateBiometric as jest.Mock).mockRejectedValue(
      "PERMISSION_DENIED"
    );

    const { getByLabelText } = renderComponent();
    const activateButton = getByLabelText(I18n.t("global.buttons.activate2"));

    fireEvent.press(activateButton);

    await waitFor(() => {
      expect(biometrics.mayUserActivateBiometric).toHaveBeenCalled();
      expect(analytics.trackBiometricActivationDeclined).toHaveBeenCalledWith(
        "test-flow"
      );
      expect(dispatchMock).toHaveBeenCalledWith(
        preferenceFingerprintIsEnabledSaveSuccess({
          isFingerprintEnabled: false
        })
      );
    });
  });

  it("handles secondary button press (Not Now)", () => {
    const { getByLabelText } = renderComponent();
    const notNowButton = getByLabelText(I18n.t("global.buttons.notNow"));

    fireEvent.press(notNowButton);

    expect(analytics.trackBiometricActivationDeclined).toHaveBeenCalledWith(
      "test-flow"
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      preferenceFingerprintIsEnabledSaveSuccess({ isFingerprintEnabled: false })
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    FingerprintScreen,
    ROUTES.ONBOARDING_FINGERPRINT,
    {},
    store
  );
};
