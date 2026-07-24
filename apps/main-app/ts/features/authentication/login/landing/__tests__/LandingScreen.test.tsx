import { act, fireEvent, waitFor } from "@testing-library/react-native";
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

const navigateToIdpSelection = async () => {
  const { getByTestId } = await renderComponent();

  const loginWithSpid = getByTestId("landing-button-login-spid");
  fireEvent.press(loginWithSpid);

  expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
  expect(mockNavigateToIdpSelection).toHaveBeenCalled();
};
const toBeDefined = async () => {
  const component = await renderComponent();

  expect(component).toBeDefined();
};
const toMatchSnapshot = async () => {
  const component = await renderComponent();

  expect(component).toMatchSnapshot();
};

describe(LandingScreen, () => {
  afterEach(jest.clearAllMocks);

  it("Should be defined", toBeDefined);
  it("Should match the snapshot", toMatchSnapshot);
  it("Should present the modal", async () => {
    const { getByTestId } = await renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
  });
  it("Should call navigateToCiePinInsertion", async () => {
    const { getByTestId } = await renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const loginWithCiePin = getByTestId("bottom-sheet-login-with-cie-pin");
    await act(async () => {
      fireEvent.press(loginWithCiePin);
    });

    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    expect(mockNavigateToCiePinInsertion).toHaveBeenCalled();
  });
  it("Should call navigateToCieIdLoginScreen", async () => {
    const { getByTestId } = await renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const loginWithCieID = getByTestId("bottom-sheet-login-with-cie-id");
    await act(async () => {
      fireEvent.press(loginWithCieID);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).toHaveBeenCalledWith("SpidL2");
  });
  it("Should navigate to the wizards screens", async () => {
    const { getByTestId } = await renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    await act(async () => {
      fireEvent.press(loginWithCie);
    });
    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();

    const wizardsBanner = getByTestId("bottom-sheet-login-wizards");
    await act(async () => {
      fireEvent.press(wizardsBanner);
    });

    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdLoginScreen).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
    });
  });
  it("Should navigate to the idp selection", navigateToIdpSelection);
});

const renderComponent = async () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  const component = renderScreenWithNavigationStoreContext(
    LandingScreen,
    AUTHENTICATION_ROUTES.LANDING,
    {},
    store
  );

  await waitFor(() => {
    expect(component.queryByTestId("landing-button-login-cie")).toBeTruthy();
  });

  return component;
};
