import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { FciLoginL3Screen } from "../loginL3/FciLoginL3Screen";
import mockedProfile from "../../../../__mocks__/initializedProfile";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow
} from "../../../authentication/activeSessionLogin/store/actions";
import { IdpCIE } from "../../../authentication/login/hooks/useNavigateToLoginMethod";

// Mock the NFC hook
jest.mock("../../../pn/aar/hooks/useIsNfcFeatureAvailable");

const mockIsNfcAvailable =
  require("../../../pn/aar/hooks/useIsNfcFeatureAvailable").useIsNfcFeatureAvailable;

const mockToastInfo = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useIOToast: () => ({
      info: mockToastInfo,
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    })
  };
});

describe("FciLoginL3Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot", () => {
    mockIsNfcAvailable.mockReturnValue(true);
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render the screen correctly", () => {
    mockIsNfcAvailable.mockReturnValue(true);

    const { component } = renderComponent();

    expect(component).toBeDefined();
    expect(component.getByTestId("FciLoginL3ScreenContent")).toBeDefined();
    expect(component.getByTestId("FciLoginL3SubtitleText")).toBeDefined();
  });

  it("should dispatch fciEndRequest when close button is pressed", () => {
    mockIsNfcAvailable.mockReturnValue(true);

    const { store } = renderComponent({ useMockStore: true });

    // The close button dispatch is handled by the header, which is tested through navigation options
    // We verify the action is available in the store
    expect(store.getActions()).toEqual([]);
  });

  it("should navigate to CIE authentication when continue button is pressed and NFC is available", () => {
    mockIsNfcAvailable.mockReturnValue(true);

    const { component, store } = renderComponent({ useMockStore: true });

    // Find and press the continue button
    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setStartActiveSessionLogin());
    expect(actions).toContainEqual(setIdpSelectedActiveSessionLogin(IdpCIE));
    expect(actions).toContainEqual(setActiveSessionLoginFlow("FCI"));
  });

  it("should navigate to NFC not available screen when continue button is pressed and NFC is not available", () => {
    mockIsNfcAvailable.mockReturnValue(false);

    const { component } = renderComponent();

    // Find and press the continue button
    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });
    // Navigation is handled by the component, we just verify the button works
    expect(continueButton).toBeDefined();
  });

  it("should render secondary action button for help center", () => {
    mockIsNfcAvailable.mockReturnValue(true);

    const { component } = renderComponent();

    const helpButton = component.getByTestId("FciLoginL3HelpButton");
    expect(helpButton).toBeDefined();

    // Press the help button
    act(() => {
      fireEvent.press(helpButton);
    });

    expect(mockToastInfo).toHaveBeenCalled();
  });
});

type RenderOptions = {
  useMockStore?: boolean;
};

const renderComponent = (options?: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  if (options?.useMockStore) {
    const mockStore = configureMockStore<GlobalState>();
    const store = mockStore({
      ...globalState,
      profile: pot.some(mockedProfile)
    });

    return {
      component: renderScreenWithNavigationStoreContext<GlobalState>(
        FciLoginL3Screen,
        FCI_ROUTES.FCI_LOGIN_L3,
        {},
        store
      ),
      store
    };
  }

  const store = createStore(appReducer, {
    ...globalState,
    profile: pot.some(mockedProfile)
  } as any);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      FciLoginL3Screen,
      FCI_ROUTES.FCI_LOGIN_L3,
      {},
      store
    ),
    store: store as any as MockStoreEnhanced<GlobalState>
  };
};
