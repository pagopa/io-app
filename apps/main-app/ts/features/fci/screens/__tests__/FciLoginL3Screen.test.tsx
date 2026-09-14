import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";

import mockedProfile from "../../../../__mocks__/initializedProfile";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  setActiveSessionLoginFlow,
  setIdpSelectedActiveSessionLogin,
  setStartActiveSessionLogin
} from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import * as fastLoginSelectors from "../../../authentication/fastLogin/store/selectors";
import { IdpCIE } from "../../../authentication/login/hooks/useNavigateToLoginMethod";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import {
  trackFciLoginRequest,
  trackFciLoginRequestContinue
} from "../../analytics";
import { FCI_ROUTES } from "../../navigation/routes";
import { FciLoginL3Screen } from "../loginL3/FciLoginL3Screen";

// Mock the NFC hook
jest.mock("../../../pn/aar/hooks/useIsNfcFeatureAvailable");
jest.mock("../../analytics");

const mockIsNfcAvailable =
  require("../../../pn/aar/hooks/useIsNfcFeatureAvailable").useIsNfcFeatureAvailable;

const mockNavigate = jest.fn();

jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn()
  })
}));

describe("FciLoginL3Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should call trackFciLoginRequest on first render", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    renderComponent();
    expect(trackFciLoginRequest).toHaveBeenCalledTimes(1);
  });

  it("should render the screen correctly", () => {
    mockIsNfcAvailable.mockReturnValue(true);

    const { component } = renderComponent();

    expect(component).toBeDefined();
    expect(component.getByTestId("FciLoginL3ScreenContent")).toBeDefined();
    expect(component.getByTestId("FciLoginL3SubtitleText")).toBeDefined();
  });

  it("should call trackFciLoginRequestContinue when continue button is pressed", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    const { component } = renderComponent();

    act(() => {
      fireEvent.press(component.getByTestId("FciLoginL3ContinueButton"));
    });

    expect(trackFciLoginRequestContinue).toHaveBeenCalledTimes(1);
  });

  it("should dispatch active session login actions when continue button is pressed and NFC is available", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    const mockStore = configureMockStore<GlobalState>();
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = mockStore({
      ...globalState,
      profile: pot.some(mockedProfile)
    });

    const component = renderScreenWithNavigationStoreContext<GlobalState>(
      FciLoginL3Screen,
      FCI_ROUTES.FCI_LOGIN_L3,
      {},
      store
    );

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setStartActiveSessionLogin());
    expect(actions).toContainEqual(setIdpSelectedActiveSessionLogin(IdpCIE));
    expect(actions).toContainEqual(setActiveSessionLoginFlow("FCI"));
  });

  it("should navigate to LOGIN_OPTIN screen when continue button is pressed, NFC is available and fastLoginOptInFF is enabled", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    jest
      .spyOn(fastLoginSelectors, "fastLoginOptInFFEnabled")
      .mockReturnValue(true);

    const { component } = renderComponent();

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.LOGIN_OPTIN
    });
  });

  it("should navigate to CIE_PIN_SCREEN when continue button is pressed, NFC is available and fastLoginOptInFF is disabled", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    jest
      .spyOn(fastLoginSelectors, "fastLoginOptInFFEnabled")
      .mockReturnValue(false);

    const { component } = renderComponent();

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      {
        screen: SETTINGS_ROUTES.AUTHENTICATION,
        params: {
          screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
        }
      }
    );
  });

  it("should navigate to NFC not available screen when continue button is pressed and NFC is not available", () => {
    mockIsNfcAvailable.mockReturnValue(false);

    const { component } = renderComponent();

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.NFC_NOT_AVAILABLE
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, {
    ...globalState,
    profile: pot.some(mockedProfile)
  } as any);

  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    FciLoginL3Screen,
    FCI_ROUTES.FCI_LOGIN_L3,
    {},
    store
  );

  return { component, store };
};
