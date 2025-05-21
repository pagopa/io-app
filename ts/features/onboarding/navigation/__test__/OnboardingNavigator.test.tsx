import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer, InitialState } from "@react-navigation/native";
import configureMockStore from "redux-mock-store";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import OnboardingNavigator from "../OnboardingNavigator";
import ROUTES from "../../../../navigation/routes";

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
        <OnboardingNavigator />
      </NavigationContainer>
    </Provider>
  );
};

describe("OnboardingNavigator", () => {
  it("renders all routes (snapshot)", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders ONBOARDING_SHARE_DATA as initial screen", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("OnboardingShareDataScreen")).toBeTruthy();
  });

  it("renders ONBOARDING_TOS with header shown", () => {
    const result = renderComponent({
      routes: [
        {
          name: ROUTES.ONBOARDING_TOS
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });

  it("renders ONBOARDING_COMPLETED with header hidden", () => {
    const result = renderComponent({
      routes: [
        {
          name: ROUTES.ONBOARDING_COMPLETED
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });

  it("renders ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT as modal", () => {
    const result = renderComponent({
      routes: [
        {
          name: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        }
      ],
      index: 0,
      type: "stack"
    });

    expect(result.toJSON()).toBeTruthy();
  });
});
