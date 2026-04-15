import { render } from "@testing-library/react-native";
import { NavigationContainer, NavigationState } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import { AppStackNavigator, isMainNavigatorReady } from "../AppStackNavigator";
import { StartupStatusEnum } from "../../store/reducers/startup";
import { ITW_ROUTES } from "../../features/itwallet/navigation/routes";
import ROUTES from "../routes";
import { AUTHENTICATION_ROUTES } from "../../features/authentication/common/navigation/routes";

// Mock Redux Hooks
jest.mock("../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: jest.fn(),
  useIOStore: jest.fn()
}));

jest.mock("../../utils/environment", () => ({
  isTestEnv: jest.fn(() => true) // Inizialmente lo impostiamo su `true`
}));

// Mock Linking
jest.mock("react-native", () => ({
  Linking: {
    getInitialURL: jest.fn(() => Promise.resolve(null))
  }
}));

// Mock useOnFirstRender
jest.mock("../../utils/hooks/useOnFirstRender", () => ({
  useOnFirstRender: jest.fn()
}));

describe("AppStackNavigator Snapshots", () => {
  it("shapshot StartupStatusEnum.AUTHENTICATED", () => {
    const component = renderComponent(StartupStatusEnum.AUTHENTICATED);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("shapshot StartupStatusEnum.INITIAL", () => {
    const component = renderComponent(StartupStatusEnum.INITIAL);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("shapshot StartupStatusEnum.NOT_AUTHENTICATED", () => {
    const component = renderComponent(StartupStatusEnum.NOT_AUTHENTICATED);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("shapshot StartupStatusEnum.OFFLINE", () => {
    const component = renderComponent(StartupStatusEnum.OFFLINE);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("shapshot StartupStatusEnum.ONBOARDING", () => {
    const component = renderComponent(StartupStatusEnum.ONBOARDING);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("isMainNavigatorReady", () => {
  const createNavState = (routeName: string): NavigationState => ({
    key: "root",
    index: 0,
    routeNames: [routeName],
    routes: [{ key: "route-0", name: routeName }],
    type: "stack",
    stale: false
  });

  it("should return true when the route is ROUTES.MAIN", () => {
    const state = createNavState(ROUTES.MAIN);
    expect(isMainNavigatorReady(state)).toBe(true);
  });

  it("should return true when the route is ITW_ROUTES.MAIN", () => {
    const state = createNavState(ITW_ROUTES.MAIN);
    expect(isMainNavigatorReady(state)).toBe(true);
  });

  it("should return false when the route is different", () => {
    const state = createNavState(AUTHENTICATION_ROUTES.MAIN);
    expect(isMainNavigatorReady(state)).toBe(false);
  });

  it("should return false when state is undefined", () => {
    expect(isMainNavigatorReady(undefined)).toBe(false);
  });

  it("should return false when state has no routes", () => {
    const state: NavigationState = {
      key: "root",
      index: 0,
      routeNames: [],
      routes: [],
      type: "stack",
      stale: false
    };
    expect(isMainNavigatorReady(state)).toBe(false);
  });
});

function renderComponent(startupStatus: StartupStatusEnum) {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  const initialState = {
    ...defaultState,
    startup: {
      ...defaultState.startup,
      status: startupStatus
    }
  };
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(initialState);
  return render(
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppStackNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
