import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { LandingScreen } from "../screens/LandingScreen";

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
jest.mock("../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToIdpSelection: mockNavigateToIdpSelection,
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    isCieSupported: true
  })
}));

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("../../../../../__mocks__/@gorhom/bottom-sheet")
);
jest.mock("../../../common/analytics");

describe(LandingScreen, () => {
  afterEach(jest.clearAllMocks);

  it("Should be defined", () => {
    const component = renderComponent();

    expect(component).toBeDefined();
  });
  it("Should match the snapshot", () => {
    const component = renderComponent();

    expect(component).toMatchSnapshot();
  });
  it("Should not navigate anywhere when the CIE button is pressed and CIE is supported", async () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
  });
  it("Should navigate to the idp selection", () => {
    const { getByTestId } = renderComponent();

    const loginWithSpid = getByTestId("landing-button-login-spid");
    fireEvent.press(loginWithSpid);

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    LandingScreen,
    AUTHENTICATION_ROUTES.LANDING,
    {},
    store
  );
};
