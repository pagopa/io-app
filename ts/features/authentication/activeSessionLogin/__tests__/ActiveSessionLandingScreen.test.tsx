import { createStore } from "redux";
import { act, fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { ActiveSessionLandingScreen } from "../screens/ActiveSessionLandingScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";

const mockNavigateToCieIdLoginScreen = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      navigate: mockNavigate,
      goBack: jest.fn()
    })
  };
});

jest.mock("../../login/hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    isCieSupported: true
  })
}));

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("../../../../__mocks__/@gorhom/bottom-sheet")
);
jest.mock("../../common/analytics");

const toBeDefined = () => {
  const component = renderComponent();
  expect(component).toBeDefined();
};

const toMatchSnapshot = () => {
  const component = renderComponent();
  expect(component).toMatchSnapshot();
};

describe("ActiveSessionLandingScreen", () => {
  afterEach(jest.clearAllMocks);

  it("Should be defined", toBeDefined);
  it("Should match the snapshot", toMatchSnapshot);

  it("Should open the bottom sheet on CIE button press", async () => {
    const { getByTestId } = renderComponent();

    await act(async () => {
      const loginWithCie = getByTestId("landing-button-login-cie");
      fireEvent.press(loginWithCie);
    });

    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
  });

  it("Should call navigateToCieIdLoginScreen from bottom sheet", async () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    const loginWithCieID = getByTestId("bottom-sheet-login-with-cie-id");
    await act(async () => {
      fireEvent.press(loginWithCieID);
    });

    expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith("SpidL2");
  });

  it("Should navigate to the wizard screen from banner", async () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    const wizardsBanner = getByTestId("bottom-sheet-login-wizards");
    await act(async () => {
      fireEvent.press(wizardsBanner);
    });

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    ActiveSessionLandingScreen,
    AUTHENTICATION_ROUTES.LANDING,
    {},
    store
  );
};
