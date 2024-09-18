import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { LandingScreen } from "../LandingScreen";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import * as cieSelectors from "../../../features/cieLogin/store/selectors";

const mockPresent = jest.fn();
const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToIdpSelection = jest.fn();
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
jest.mock("../../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToIdpSelection: mockNavigateToIdpSelection,
    isCieSupported: true
  })
}));
jest.mock("../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal() {
    return {
      present: mockPresent
    };
  }
}));

jest.mock("../../../features/cieLogin/store/selectors", () => ({
  ...jest.requireActual("../../../features/cieLogin/store/selectors"),
  __esModule: true,
  isCieIDFFEnabledSelector: jest.fn()
}));

const navigateToIdpSelection = () => {
  const { getByTestId } = renderComponent();

  const loginWithSpid = getByTestId("landing-button-login-spid");
  fireEvent.press(loginWithSpid);

  expect(mockPresent).not.toHaveBeenCalled();
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

describe("LandingScreen with both local and remote CieID FF disabled", () => {
  afterEach(jest.clearAllMocks);

  it("Should be defined", toBeDefined);
  it("Should match the snapshot", toMatchSnapshot);
  it("Should navigate to login with cie + pin", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockPresent).not.toHaveBeenCalled();
    expect(mockNavigateToCiePinInsertion).toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
  });
  it("Should navigate to idp selection screen", navigateToIdpSelection);
});

describe("LandingScreen with CieID FF enabled", () => {
  beforeAll(() =>
    jest
      .spyOn(cieSelectors, "isCieIDFFEnabledSelector")
      .mockImplementation(() => true)
  );
  afterEach(jest.clearAllMocks);

  it("Should be defined", toBeDefined);
  it("Should match the snapshot", toMatchSnapshot);
  it("Should present the modal", () => {
    const { getByTestId } = renderComponent();

    const loginWithCie = getByTestId("landing-button-login-cie");
    fireEvent.press(loginWithCie);

    expect(mockPresent).toHaveBeenCalled();
    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
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
