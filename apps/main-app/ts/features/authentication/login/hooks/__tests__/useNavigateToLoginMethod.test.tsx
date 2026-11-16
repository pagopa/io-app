import { IOButton } from "@io-app/design-system";
import * as rnCieId from "@pagopa/io-react-native-cieid";
import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AUTH_LEVELS, AuthLevel } from "../../../common/utils";
import * as fastLoginSelector from "../../../fastLogin/store/selectors";
import { cieEnvSelector } from "../../cie/store/selectors";
import { Identifier } from "../../optIn/screens/OptInScreen";
import useNavigateToLoginMethod from "../useNavigateToLoginMethod";

const AUTH_LEVEL_L2: AuthLevel = AUTH_LEVELS.L2;

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("../../cie/store/selectors", () => ({
  isCieSupportedSelector: () => true,
  cieEnvSelector: jest.fn()
}));

describe(useNavigateToLoginMethod, () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(cieEnvSelector).mockReturnValue("production");
    jest.spyOn(rnCieId, "isCieIdAvailable").mockReturnValue(true);
  });

  describe("Login flow WITHOUT OptIn", () => {
    it("Should navigate to the Cie + Pin screen", () => {
      const { getByTestId } = render(<TestComponent />);
      const navigateToCiePin = getByTestId("navigate-to-cie-pin");
      fireEvent.press(navigateToCiePin);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
      });
    });

    it("Should navigate to idp selection", () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToIdpSelection = getByTestId("navigate-to-idp-selection");
      fireEvent.press(navigateToIdpSelection);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.IDP_SELECTION
      });
    });

    it("Should navigate to the CieID screen", () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
      fireEvent.press(navigateToCieIdScreen);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_LOGIN
      });
    });

    it.each(["production", "preprod"] as const)(
      "Should navigate to the CieID not installed screen (%s)",
      env => {
        jest.mocked(cieEnvSelector).mockReturnValue(env);
        jest.spyOn(rnCieId, "isCieIdAvailable").mockReturnValue(false);

        const { getByTestId } = render(<TestComponent />);
        fireEvent.press(getByTestId("navigate-to-cie-id"));

        expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED,
          params: { cieEnv: env }
        });
      }
    );
  });

  describe("Login flow WITH OptIn", () => {
    beforeAll(() => {
      jest
        .spyOn(fastLoginSelector, "fastLoginOptInFFEnabled")
        .mockReturnValue(true);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`Should navigate to the OptIn screen with ${Identifier.CIE} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToCiePin = getByTestId("navigate-to-cie-pin");
      fireEvent.press(navigateToCiePin);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: { identifier: Identifier.CIE }
      });
    });

    it(`Should navigate to the OptIn screen with ${Identifier.SPID} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToIdpSelection = getByTestId("navigate-to-idp-selection");
      fireEvent.press(navigateToIdpSelection);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: { identifier: Identifier.SPID }
      });
    });

    it(`Should navigate to the OptIn screen with ${Identifier.CIE_ID} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
      fireEvent.press(navigateToCieIdScreen);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: { identifier: Identifier.CIE_ID }
      });
    });

    it.each(["production", "preprod"] as const)(
      "Should navigate to the CieID not installed screen (%s)",
      env => {
        jest.mocked(cieEnvSelector).mockReturnValue(env);
        jest.spyOn(rnCieId, "isCieIdAvailable").mockReturnValue(false);

        const { getByTestId } = render(<TestComponent />);
        fireEvent.press(getByTestId("navigate-to-cie-id"));

        expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED,
          params: { cieEnv: env }
        });
      }
    );
  });
});

const TestComponent = withStore(() => {
  const {
    navigateToCieIdLoginScreen,
    navigateToIdpSelection,
    navigateToCiePinInsertion
  } = useNavigateToLoginMethod();
  return (
    <View>
      <IOButton
        label=" Navigate to Cie + Pin"
        onPress={navigateToCiePinInsertion}
        testID="navigate-to-cie-pin"
        variant="solid"
      />
      <IOButton
        label=" Navigate to CieID"
        onPress={() => navigateToCieIdLoginScreen(AUTH_LEVEL_L2)}
        testID="navigate-to-cie-id"
        variant="solid"
      />
      <IOButton
        label=" Navigate to IDP selection"
        onPress={navigateToIdpSelection}
        testID="navigate-to-idp-selection"
        variant="solid"
      />
    </View>
  );
});
