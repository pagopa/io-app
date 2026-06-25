import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";

import mockedProfile from "../../../../__mocks__/initializedProfile";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { setFastLoginOptSessionLogin } from "../../../authentication/activeSessionLogin/store/actions";
import { FCI_ROUTES } from "../../navigation/routes";
import { LoginOptInScreen } from "../loginL3/LoginOptInScreen";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: () => ({
    present: mockPresentBottomSheet,
    bottomSheet: null
  })
}));

// Mock openWebUrl
const mockOpenWebUrl = jest.fn();
jest.mock("../../../../utils/url", () => ({
  openWebUrl: jest.fn((url, onError) => mockOpenWebUrl(url, onError))
}));

const mockToastError = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    IOToast: {
      ...actual.IOToast,
      error: jest.fn(() => mockToastError())
    }
  };
});

describe("LoginOptInScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot", () => {
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render the screen correctly", () => {
    const { component } = renderComponent();

    expect(component).toBeDefined();
    expect(component.getByTestId("FciLoginL3ScreenContent")).toBeDefined();
    expect(component.getByTestId("FciLoginL3SubtitleText")).toBeDefined();
    expect(component.getByTestId("FciLoginL3ContinueButton")).toBeDefined();
    expect(component.getByTestId("FciLoginL3HelpButton")).toBeDefined();
    expect(component.getByTestId("FciLoginL3DescriptionButton")).toBeDefined();
  });

  it("should dispatch setFastLoginOptSessionLogin(true) and navigate when primary button is pressed", () => {
    const { component, store } = renderComponent({ useMockStore: true });

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setFastLoginOptSessionLogin(true));
  });

  it("should dispatch setFastLoginOptSessionLogin(false) and navigate when secondary button is pressed", () => {
    const { component, store } = renderComponent({ useMockStore: true });

    const helpButton = component.getByTestId("FciLoginL3HelpButton");

    act(() => {
      fireEvent.press(helpButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setFastLoginOptSessionLogin(false));
  });

  it("should call present when info link is pressed", () => {
    const { component } = renderComponent();

    const infoButton = component.getByTestId("FciLoginL3DescriptionButton");

    act(() => {
      fireEvent.press(infoButton);
    });

    expect(mockPresentBottomSheet).toHaveBeenCalledTimes(1);
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
        LoginOptInScreen,
        FCI_ROUTES.LOGIN_OPTIN,
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
      LoginOptInScreen,
      FCI_ROUTES.LOGIN_OPTIN,
      {},
      store
    ),
    store: store as any as MockStoreEnhanced<GlobalState>
  };
};
