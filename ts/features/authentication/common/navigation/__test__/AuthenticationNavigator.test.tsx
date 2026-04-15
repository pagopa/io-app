import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer, InitialState } from "@react-navigation/native";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import AuthenticationNavigator from "../AuthenticationNavigator";
import { AUTHENTICATION_ROUTES } from "../routes";

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
        <AuthenticationNavigator />
      </NavigationContainer>
    </Provider>
  );
};

describe("AuthenticationNavigator", () => {
  it("renders all routes (snapshot)", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders the LandingScreen", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("LandingScreen")).toBeTruthy();
  });

  it("renders CIE_ACTIVATE_NFC_SCREEN with params and covers modal options", () => {
    const result = renderComponent({
      routes: [
        {
          name: AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN,
          params: {
            ciePin: "12345",
            authorizationUri: "https://auth.io/cie"
          }
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });
});
