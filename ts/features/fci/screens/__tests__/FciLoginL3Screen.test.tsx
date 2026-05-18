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
import {
  trackFciLoginRequest,
  trackFciLoginRequestContinue
} from "../../analytics";

// Mock the NFC hook
jest.mock("../../../pn/aar/hooks/useIsNfcFeatureAvailable");
jest.mock("../../analytics");

const mockIsNfcAvailable =
  require("../../../pn/aar/hooks/useIsNfcFeatureAvailable").useIsNfcFeatureAvailable;

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

    const { component, store } = renderComponent({ useMockStore: true });

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

    const continueButton = component.getByTestId("FciLoginL3ContinueButton");

    act(() => {
      fireEvent.press(continueButton);
    });

    expect(continueButton).toBeDefined();
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
