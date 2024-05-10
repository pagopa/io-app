import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import ROUTES from "../../../navigation/routes";
import { TestInnerNavigationContainer } from "../../../navigation/AppStackNavigator";
import OnboardingPinScreen from "../OnboardingPinScreen";
import OnboardingPinConfirmationScreen from "../OnboardingPinConfirmationScreen";
import I18n from "../../../i18n";

jest.spyOn(Alert, "alert");
const mockedGoBack = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      goBack: mockedGoBack
    })
  };
});

describe("PinCreationScreens", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should navigate to the Profile > PinConfirmation screen", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();
    fireEvent.changeText(codeInput, "162534");

    const title = getByTestId(/pin-confirmation-title/);

    expect(title).toHaveTextContent(I18n.t("onboarding.pinConfirmation.title"));
  });
  it("Should display the native Alert", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();

    fireEvent.changeText(codeInput, "111111");

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("onboarding.pin.errors.invalid.title"),
      I18n.t("onboarding.pin.errors.invalid.description"),
      [
        {
          text: I18n.t("onboarding.pin.errors.invalid.cta")
        }
      ]
    );
  });
  it("Should display the alert on pin mismatch", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();

    fireEvent.changeText(codeInput, "162534");
    const confirmationInput = getByTestId(/pin-confirmation-input/);
    fireEvent.changeText(confirmationInput, "111111");

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("onboarding.pinConfirmation.errors.match.title"),
      undefined,
      [
        {
          text: I18n.t("onboarding.pinConfirmation.errors.match.cta"),
          onPress: mockedGoBack
        }
      ]
    );
  });
});

function renderComponent() {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  const Screens = () => (
    <Stack.Navigator initialRouteName={ROUTES.ONBOARDING_PIN}>
      <Stack.Screen
        name={ROUTES.ONBOARDING_PIN}
        component={OnboardingPinScreen}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING_CONFIRMATION_PIN}
        component={OnboardingPinConfirmationScreen}
      />
    </Stack.Navigator>
  );

  return (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator initialRouteName={ROUTES.ONBOARDING}>
          <Stack.Screen name={ROUTES.ONBOARDING} component={Screens} />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
}
