import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CieIdWizard, { CIE_ID_LINK } from "../screens/wizards/CieIdWizard";
import CiePinWizard from "../screens/wizards/CiePinWizard";
import SpidWizard from "../screens/wizards/SpidWizard";
import IDActivationWizard, {
  ACTIVATE_CIE_URL,
  ACTIVATE_SPID_URL,
  REQUEST_CIE_URL
} from "../screens/wizards/IDActivationWizard";
import * as urlUtils from "../../../utils/url";
import ROUTES from "../../../navigation/routes";

const anyFunction = expect.any(Function);
const mockNavigateToCieIdLoginScreen = jest.fn();
const mockNavigate = jest.fn();
const SPID_LEVEL = "SpidL2";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn
  }),
  useRoute: jest.fn,
  useFocusEffect: jest.fn
}));
jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn,
  useSelector: jest.fn,
  useStore: jest.fn
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn
}));
jest.mock("../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));
jest.mock("../../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen
  })
}));

describe(CieIdWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<CieIdWizard />);

    expect(component).toMatchSnapshot();
  });
  it("Should call navigateToCieIdLoginScreen", () => {
    const { getByTestId } = render(<CieIdWizard />);
    const navigateToLoginWithCieId = getByTestId(
      "cie-id-wizard-login-with-cie-id"
    );

    fireEvent.press(navigateToLoginWithCieId);

    expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledTimes(1);
    expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith(SPID_LEVEL);
  });
  it("Should navigate to Cie + Pin wizard screen", () => {
    const { getByTestId } = render(<CieIdWizard />);
    const navigateToCiePinWizard = getByTestId(
      "cie-id-wizard-navigate-to-cie-pin-wizard"
    );

    fireEvent.press(navigateToCiePinWizard);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_PIN_WIZARD
    });
  });
  it("Should open the CieID link", () => {
    const { getByTestId } = render(<CieIdWizard />);
    const openCieIdLink = getByTestId("cie-id-wizard-open-cie-id-link");

    fireEvent.press(openCieIdLink);

    expect(urlUtils.openWebUrl).toHaveBeenCalledTimes(1);
    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(CIE_ID_LINK, anyFunction);
  });
});

describe(CiePinWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<CiePinWizard />);

    expect(component).toMatchSnapshot();
  });
});

describe(SpidWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<SpidWizard />);

    expect(component).toMatchSnapshot();
  });
});

describe(IDActivationWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<IDActivationWizard />);

    expect(component).toMatchSnapshot();
  });
  it("Should open request Cie url", () => {
    const { getByTestId } = render(<IDActivationWizard />);
    const requestCie = getByTestId("id-activation-request-cie");

    fireEvent.press(requestCie);

    expect(urlUtils.openWebUrl).toHaveBeenCalledTimes(1);
    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(
      REQUEST_CIE_URL,
      anyFunction
    );
  });
  it("Should open activate Cie url", () => {
    const { getByTestId } = render(<IDActivationWizard />);
    const activateCie = getByTestId("id-activation-activate-cie");

    fireEvent.press(activateCie);

    expect(urlUtils.openWebUrl).toHaveBeenCalledTimes(1);
    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(
      ACTIVATE_CIE_URL,
      anyFunction
    );
  });
  it("Should open activate Spid url", () => {
    const { getByTestId } = render(<IDActivationWizard />);
    const activateCie = getByTestId("id-activation-activate-spid");

    fireEvent.press(activateCie);

    expect(urlUtils.openWebUrl).toHaveBeenCalledTimes(1);
    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(
      ACTIVATE_SPID_URL,
      anyFunction
    );
  });
});
