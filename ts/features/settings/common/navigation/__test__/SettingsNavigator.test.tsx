import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer, InitialState } from "@react-navigation/native";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import SettingsNavigator from "../SettingsNavigator";
import { SETTINGS_ROUTES } from "../routes";

const createMockStore = () => {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  return mockStore(defaultState);
};

const renderComponent = (initialState?: InitialState) => {
  const store = createMockStore();

  return render(
    <Provider store={store}>
      <NavigationContainer {...(initialState ? { initialState } : {})}>
        <SettingsNavigator />
      </NavigationContainer>
    </Provider>
  );
};

describe("SettingsNavigator", () => {
  it("renders all routes (snapshot)", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders the ProfileMainScreen", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("ProfileMainScreen")).toBeTruthy();
  });

  it("renders PROFILE_ABOUT_APP screen with NavigationState", () => {
    const result = renderComponent({
      routes: [
        {
          name: SETTINGS_ROUTES.PROFILE_ABOUT_APP
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });

  it("renders PROFILE_LOGOUT screen without header", () => {
    const result = renderComponent({
      routes: [
        {
          name: SETTINGS_ROUTES.PROFILE_LOGOUT
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });

  it("renders DESIGN_SYSTEM modal screen (headerShown: false)", () => {
    const result = renderComponent({
      routes: [
        {
          name: SETTINGS_ROUTES.DESIGN_SYSTEM
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });
});
