import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import { ButtonSolid } from "@pagopa/io-app-design-system";
import * as rnCieId from "@pagopa/io-react-native-cieid";
import useNavigateToLoginMethod from "../useNavigateToLoginMethod";
import ROUTES from "../../navigation/routes";
import * as fastLoginSelector from "../../features/fastLogin/store/selectors";
import { Identifier } from "../../screens/authentication/OptInScreen";
import { withStore } from "../../utils/jest/withStore";

const IS_UAT = false;
const SPID_L2 = "SpidL2";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("../../features/cieLogin/store/selectors", () => ({
  isCieLoginUatEnabledSelector: () => IS_UAT
}));
jest.mock("../../store/reducers/cie", () => ({
  isCieSupportedSelector: () => true
}));

describe(useNavigateToLoginMethod, () => {
  afterEach(jest.clearAllMocks);

  describe("Login flow WITHOUT OptIn", () => {
    it("Should navigate to the Cie + Pin screen", () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToCiePin = getByTestId("navigate-to-cie-pin");
      fireEvent.press(navigateToCiePin);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_PIN_SCREEN
      });
    });
    it("Should navigate to idp selection", () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToIdpSelection = getByTestId("navigate-to-idp-selection");
      fireEvent.press(navigateToIdpSelection);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_SELECTION
      });
    });
    it("Should navigate to the CieID screen", () => {
      jest.spyOn(rnCieId, "isCieIdAvailable").mockImplementation(() => true);
      const { getByTestId } = render(<TestComponent />);

      const navigateToCieIdScreen = getByTestId("navigate-to-cie-id");
      fireEvent.press(navigateToCieIdScreen);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_CIE_ID_LOGIN,
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

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_OPT_IN,
        params: {
          identifier: Identifier.CIE
        }
      });
    });
    it(`Should navigate to the OptIn screen with ${Identifier.SPID} as identifier`, () => {
      const { getByTestId } = render(<TestComponent />);

      const navigateToIdpSelection = getByTestId("navigate-to-idp-selection");
      fireEvent.press(navigateToIdpSelection);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_OPT_IN,
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

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_OPT_IN,
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
      <ButtonSolid
        testID="navigate-to-cie-pin"
        onPress={navigateToCiePinInsertion}
        label=" Navigate to Cie + Pin"
      />
      <ButtonSolid
        testID="navigate-to-cie-id"
        onPress={() => navigateToCieIdLoginScreen(SPID_L2)}
        label=" Navigate to CieID"
      />
      <ButtonSolid
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

  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
    screen: ROUTES.CIE_NOT_INSTALLED,
    params: {
      isUat: IS_UAT
    }
  });
}
