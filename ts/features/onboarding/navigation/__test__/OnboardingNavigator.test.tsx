import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer, InitialState } from "@react-navigation/native";
import configureMockStore from "redux-mock-store";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import OnboardingNavigator from "../OnboardingNavigator";
import ROUTES from "../../../../navigation/routes";

jest.mock("react-native-background-timer", () => ({
  runBackgroundTimer: jest.fn(),
  stopBackgroundTimer: jest.fn(),
  setTimeout: jest.fn(),
  clearTimeout: jest.fn(),
  setInterval: jest.fn(),
  clearInterval: jest.fn()
}));

const ROUTES_TO_TEST = [
  { name: ROUTES.ONBOARDING_SHARE_DATA },
  {
    name: ROUTES.ONBOARDING_SERVICES_PREFERENCE,
    params: { isFirstOnboarding: true }
  },
  { name: ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE },
  { name: ROUTES.ONBOARDING_TOS },
  { name: ROUTES.ONBOARDING_PIN },
  { name: ROUTES.ONBOARDING_FINGERPRINT },
  { name: ROUTES.ONBOARDING_MISSING_DEVICE_PIN },
  { name: ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC },
  {
    name: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
    params: {
      isOnboarding: true,
      isFciEditEmailFlow: false,
      isEditingPreviouslyInsertedEmailMode: false
    }
  },
  {
    name: ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN,
    params: {
      isOnboarding: true,
      isFciEditEmailFlow: false,
      sendEmailAtFirstRender: true
    }
  },
  { name: ROUTES.ONBOARDING_COMPLETED },
  {
    name: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
    params: { isFirstOnboarding: true }
  },
  { name: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT }
];

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
});

describe("OnboardingNavigator - all routes", () => {
  ROUTES_TO_TEST.forEach(route => {
    it(`renders ${route.name} correctly`, () => {
      const result = renderComponent({
        routes: [
          {
            name: route.name,
            params: route.params
          }
        ],
        index: 0,
        type: "stack"
      });

      expect(result.toJSON()).toBeTruthy();
    });
  });
});
