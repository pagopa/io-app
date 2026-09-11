import { fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as analytics from "../../analytics";
import { AUTHENTICATION_ROUTES } from "../../navigation/routes";
import { AUTH_LEVELS } from "../../utils";
import { useCieLoginMethodSelection } from "../useCieLoginMethodSelection";

const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToCieIdLoginScreen = jest.fn();
const mockNavigate = jest.fn();
const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockIsCieSupported = jest.fn();

jest.mock("../../../login/hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    isCieSupported: mockIsCieSupported()
  })
}));

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(options => ({
    present: mockPresent,
    dismiss: mockDismiss,
    bottomSheet: <>{options.component}</>
  }))
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("../../analytics");

describe("useCieLoginMethodSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCieSupported.mockReturnValue(true);
  });

  const renderComponent = (flow: "auth" | "reauth") => {
    // eslint-disable-next-line functional/no-let
    let hookReturnValue: ReturnType<typeof useCieLoginMethodSelection>;
    const WrapperComponent = () => {
      hookReturnValue = useCieLoginMethodSelection({ flow });
      const { bottomSheet, handleCieLoginRequested } = hookReturnValue;
      return (
        <>
          <Text onPress={handleCieLoginRequested} testID="trigger">
            trigger
          </Text>
          {bottomSheet}
        </>
      );
    };
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const store = createStore(appReducer, initialState as any);
    const renderResult = renderScreenWithNavigationStoreContext(
      () => <WrapperComponent />,
      "DUMMY",
      {},
      store
    );
    return {
      ...renderResult,
      getDismiss: () => hookReturnValue.dismiss
    };
  };

  const modeScenarios = [
    { name: "auth", flow: "auth" as const },
    { name: "reauth", flow: "reauth" as const }
  ];

  test.each(modeScenarios)(
    "should navigate to CIE pin insertion and track the selection ($name)",
    ({ flow }) => {
      const { getByTestId } = renderComponent(flow);

      fireEvent.press(getByTestId("bottom-sheet-login-with-cie-pin"));

      expect(mockNavigateToCiePinInsertion).toHaveBeenCalled();
      expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(analytics.trackCiePinLoginSelected).toHaveBeenCalledWith(
        expect.anything(),
        flow
      );
    }
  );

  test.each(modeScenarios)(
    "should navigate to CIE ID login screen and track the selection ($name)",
    ({ flow }) => {
      const { getByTestId } = renderComponent(flow);

      fireEvent.press(getByTestId("bottom-sheet-login-with-cie-id"));

      expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith(
        AUTH_LEVELS.L2
      );
      expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(analytics.trackCieIDLoginSelected).toHaveBeenCalledWith(
        expect.anything(),
        AUTH_LEVELS.L2,
        flow
      );
    }
  );

  test.each(modeScenarios)(
    "should navigate to the wizard and track the selection ($name)",
    ({ flow }) => {
      const { getByTestId } = renderComponent(flow);

      fireEvent.press(getByTestId("bottom-sheet-login-wizards"));

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
      });
      expect(analytics.loginCieWizardSelected).toHaveBeenCalledWith(flow);
      expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
      expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    }
  );

  test.each(modeScenarios)(
    "should present the bottom sheet and track the screen view when CIE is supported ($name)",
    ({ flow }) => {
      mockIsCieSupported.mockReturnValue(true);
      const { getByTestId } = renderComponent(flow);

      fireEvent.press(getByTestId("trigger"));

      expect(mockPresent).toHaveBeenCalled();
      expect(analytics.trackCieBottomSheetScreenView).toHaveBeenCalledWith(
        flow
      );
      expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    }
  );

  test.each(modeScenarios)(
    "should skip the bottom sheet, navigate directly to CIE ID and track the selection when CIE is not supported ($name)",
    ({ flow }) => {
      mockIsCieSupported.mockReturnValue(false);
      const { getByTestId } = renderComponent(flow);

      fireEvent.press(getByTestId("trigger"));

      expect(mockPresent).not.toHaveBeenCalled();
      expect(analytics.trackCieBottomSheetScreenView).not.toHaveBeenCalled();
      expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith(
        AUTH_LEVELS.L2
      );
      expect(analytics.trackCieIDLoginSelected).toHaveBeenCalledWith(
        expect.anything(),
        AUTH_LEVELS.L2,
        flow
      );
    }
  );

  it("should forward the dismiss function returned by the bottom sheet", () => {
    const { getDismiss } = renderComponent("auth");

    getDismiss()();

    expect(mockDismiss).toHaveBeenCalled();
  });
});
