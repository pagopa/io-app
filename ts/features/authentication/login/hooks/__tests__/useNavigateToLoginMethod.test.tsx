import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import { IOButton } from "@pagopa/io-app-design-system";
import * as rnCieId from "@pagopa/io-react-native-cieid";
import useNavigateToLoginMethod from "../useNavigateToLoginMethod";
import * as fastLoginSelector from "../../../fastLogin/store/selectors";
import { Identifier } from "../../optIn/screens/OptInScreen";
import { withStore } from "../../../../../utils/jest/withStore";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const IS_UAT = false;
const SPID_L2 = "SpidL2";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("../../cie/store/selectors", () => ({
  isCieSupportedSelector: () => true,
  isCieLoginUatEnabledSelector: () => IS_UAT
}));

describe(useNavigateToLoginMethod, () => {
  afterEach(jest.clearAllMocks);

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
      jest.spyOn(rnCieId, "isCieIdAvailable").mockImplementation(() => true);
      const { getByTestId } = render(<TestComponent />);

      const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
      fireEvent.press(navigateToCieIdScreen);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_LOGIN,
        params: {
          spidLevel: SPID_L2,
          isUat: IS_UAT
        }
      });
    });
    it(
      "Should navigate to the CieID not installed screen",
      navigateToCieIdNotInstalled
    );
  });
  describe("Login flow WITH OptIn", () => {
    beforeAll(() => {
      jest
        .spyOn(fastLoginSelector, "fastLoginOptInFFEnabled")
        .mockImplementation(() => true);
    });
    afterAll(jest.clearAllMocks);

    it(`Should navigate to the OptIn screen with ${Identifier.CIE} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToCiePin = getByTestId("navigate-to-cie-pin");
      fireEvent.press(navigateToCiePin);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: {
          identifier: Identifier.CIE
        }
      });
    });
    it(`Should navigate to the OptIn screen with ${Identifier.SPID} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToIdpSelection = getByTestId("navigate-to-idp-selection");
      fireEvent.press(navigateToIdpSelection);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: {
          identifier: Identifier.SPID
        }
      });
    });
    it(`Should navigate to the OptIn screen with ${Identifier.CIE_ID} as identifier`, () => {
      jest.spyOn(rnCieId, "isCieIdAvailable").mockImplementation(() => true);
      const { getByTestId } = render(<TestComponent />);

      const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
      fireEvent.press(navigateToCieIdScreen);

      expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: {
          identifier: Identifier.CIE_ID,
          params: {
            spidLevel: SPID_L2,
            isUat: IS_UAT
          }
        }
      });
    });
    it(
      "Should navigate to the CieID not installed screen",
      navigateToCieIdNotInstalled
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
        variant="solid"
        testID="navigate-to-cie-pin"
        onPress={navigateToCiePinInsertion}
        label=" Navigate to Cie + Pin"
      />
      <IOButton
        variant="solid"
        testID="navigate-to-cie-id"
        onPress={() => navigateToCieIdLoginScreen(SPID_L2)}
        label=" Navigate to CieID"
      />
      <IOButton
        variant="solid"
        testID="navigate-to-idp-selection"
        onPress={navigateToIdpSelection}
        label=" Navigate to IDP selection"
      />
    </View>
  );
});

function navigateToCieIdNotInstalled() {
  jest.spyOn(rnCieId, "isCieIdAvailable").mockImplementation(() => false);
  const { getByTestId } = render(<TestComponent />);

  const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
  fireEvent.press(navigateToCieIdScreen);

  expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
    screen: AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED,
    params: {
      isUat: IS_UAT
    }
  });
}
