import { fireEvent, render } from "@testing-library/react-native";
import CieIdWizard, { CIE_ID_LINK } from "../wizards/CieIdWizard";
import CiePinWizard, { CIE_PIN_LINK } from "../wizards/CiePinWizard";
import SpidWizard from "../wizards/SpidWizard";
import IDActivationWizard, {
  ACTIVATE_CIE_URL,
  ACTIVATE_SPID_URL,
  REQUEST_CIE_URL
} from "../wizards/IDActivationWizard";
import * as urlUtils from "../../../../../../utils/url";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";

const anyFunction = expect.any(Function);
const mockNavigateToCieIdLoginScreen = jest.fn();
const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToIdpSelection = jest.fn();
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
  useStore: () => ({
    getState: jest.fn()
  })
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn
}));
jest.mock("../../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));
jest.mock("../../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToIdpSelection: mockNavigateToIdpSelection
  })
}));

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("../../../../../../__mocks__/@gorhom/bottom-sheet.ts")
);
jest.mock("../../analytics");

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
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_WIZARD
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
  it("Should call navigateToCiePinInsertion", () => {
    const { getByTestId } = render(<CiePinWizard />);
    const navigateToCiePin = getByTestId(
      "cie-pin-wizard-navigate-to-cie-pin-screen"
    );

    fireEvent.press(navigateToCiePin);

    expect(mockNavigateToCiePinInsertion).toHaveBeenCalledTimes(1);
  });
  it("Should navigate to the Spid wizard screen", () => {
    const { getByTestId } = render(<CiePinWizard />);
    const navigateToSpidWizard = getByTestId(
      "cie-pin-wizard-navigate-to-spid-wizard"
    );

    fireEvent.press(navigateToSpidWizard);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.SPID_WIZARD
    });
  });
  it("Should open the bottom sheet then open the Cie + Pin link", () => {
    const { getByTestId } = render(<CiePinWizard />);

    const openBottomSheet = getByTestId("cie-pin-wizard-open-bottom-sheet");
    fireEvent.press(openBottomSheet);

    const openCiePinLink = getByTestId("cie-pin-wizard-open-cie-pin-link");
    fireEvent.press(openCiePinLink);

    expect(urlUtils.openWebUrl).toHaveBeenCalledTimes(1);
    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(CIE_PIN_LINK, anyFunction);
  });
});

describe(SpidWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<SpidWizard />);

    expect(component).toMatchSnapshot();
  });
  it("Should call navigateToIdpSelection", () => {
    const { getByTestId } = render(<SpidWizard />);

    const navigateToIdpSelection = getByTestId(
      "spid-wizard-navigate-to-idp-selection"
    );
    fireEvent.press(navigateToIdpSelection);

    expect(mockNavigateToIdpSelection).toHaveBeenCalledTimes(1);
  });
  it("Should navigate to IDActivationWizard screen", () => {
    const { getByTestId } = render(<SpidWizard />);

    const navigateToIdActivationWizard = getByTestId(
      "spid-wizard-navigate-to-id-activation-wizard"
    );
    fireEvent.press(navigateToIdActivationWizard);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.ID_ACTIVATION_WIZARD
    });
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
