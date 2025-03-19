import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { LandingScreen } from "../LandingScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";

const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToIdpSelection = jest.fn();
const mockNavigateToCieIdLoginScreen = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      navigate: mockNavigate
    })
  };
});
jest.mock("../../../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToIdpSelection: mockNavigateToIdpSelection,
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    isCieSupported: true
  })
}));

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("../../../../__mocks__/@gorhom/bottom-sheet.ts")
);
jest.mock("../analytics");

const navigateToIdpSelection = () => {
  const { getByTestId } = renderComponent();

  const loginWithSpid = getByTestId("landing-button-login-spid");
  fireEvent.press(loginWithSpid);

  expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
  expect(mockNavigateToIdpSelection).toHaveBeenCalled();
};
const toBeDefined = () => {
  const component = renderComponent();

  expect(component).toBeDefined();
};
const toMatchSnapshot = () => {
  const component = renderComponent();

  expect(component).toMatchSnapshot();
};

describe(LandingScreen, () => {
  afterEach(jest.clearAllMocks);

  it("Should be defined", toBeDefined);
  it("Should match the snapshot", toMatchSnapshot);
  it("Should present the modal", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
  });
  it("Should call navigateToCiePinInsertion", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const loginWithCiePin = getByTestId("bottom-sheet-login-with-cie-pin");
    fireEvent.press(loginWithCiePin);

    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    expect(mockNavigateToCiePinInsertion).toHaveBeenCalled();
  });
  it("Should call navigateToCieIdLoginScreen", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const loginWithCieID = getByTestId("bottom-sheet-login-with-cie-id");
    fireEvent.press(loginWithCieID);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith("SpidL2");
  });
  it("Should navigate to the wizards screens", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const wizardsBanner = getByTestId("bottom-sheet-login-wizards");
    fireEvent.press(wizardsBanner);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_WIZARD
    });
  });
  it("Should navigate to the idp selection", navigateToIdpSelection);
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    LandingScreen,
    ROUTES.AUTHENTICATION_LANDING,
    {},
    store
  );
};
